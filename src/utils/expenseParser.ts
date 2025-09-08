import { ExpenseCategory, EXPENSE_CATEGORIES } from '@/types/expense';

export interface ParsedExpense {
  amount: number | null;
  category: ExpenseCategory | null;
  description: string;
  date: Date | null;
  confidence: number;
}

export class ExpenseParser {
  // Amount patterns
  private static AMOUNT_PATTERNS = [
    /\$(\d+(?:\.\d{2})?)/g,                    // $50, $50.25
    /(\d+(?:\.\d{2})?)\s*dollars?/gi,          // 50 dollars, 50.25 dollar
    /(\d+(?:\.\d{2})?)\s*bucks?/gi,            // 50 bucks
    /(\d+(?:\.\d{2})?)\s*\$/g,                 // 50$
  ];

  // Date patterns
  private static DATE_PATTERNS = [
    { pattern: /today/gi, days: 0 },
    { pattern: /yesterday/gi, days: -1 },
    { pattern: /(\d+)\s*days?\s*ago/gi, days: -1 },
    { pattern: /last\s*week/gi, days: -7 },
    { pattern: /monday/gi, days: this.getDaysToLastWeekday(1) },
    { pattern: /tuesday/gi, days: this.getDaysToLastWeekday(2) },
    { pattern: /wednesday/gi, days: this.getDaysToLastWeekday(3) },
    { pattern: /thursday/gi, days: this.getDaysToLastWeekday(4) },
    { pattern: /friday/gi, days: this.getDaysToLastWeekday(5) },
    { pattern: /saturday/gi, days: this.getDaysToLastWeekday(6) },
    { pattern: /sunday/gi, days: this.getDaysToLastWeekday(0) },
  ];

  static parse(input: string): ParsedExpense {
    const amount = this.extractAmount(input);
    const category = this.extractCategory(input);
    const date = this.extractDate(input);
    const description = this.generateDescription(input, category);
    
    // Calculate confidence based on what we found
    let confidence = 0;
    if (amount !== null) confidence += 0.4;
    if (category !== null) confidence += 0.3;
    if (date !== null) confidence += 0.2;
    if (description.length > 0) confidence += 0.1;

    return {
      amount,
      category,
      description,
      date,
      confidence
    };
  }

  private static extractAmount(input: string): number | null {
    for (const pattern of this.AMOUNT_PATTERNS) {
      const matches = Array.from(input.matchAll(pattern));
      if (matches.length > 0) {
        const match = matches[0];
        const amountStr = match[1] || match[0].replace(/\$/g, '');
        const amount = parseFloat(amountStr);
        if (!isNaN(amount) && amount > 0) {
          return amount;
        }
      }
    }
    return null;
  }

  private static extractCategory(input: string): ExpenseCategory | null {
    const lowerInput = input.toLowerCase();
    
    // Score each category based on keyword matches
    const categoryScores: Record<ExpenseCategory, number> = {
      food: 0,
      transportation: 0,
      entertainment: 0,
      shopping: 0,
      bills: 0,
      healthcare: 0,
      education: 0,
      travel: 0,
      other: 0
    };

    for (const [category, info] of Object.entries(EXPENSE_CATEGORIES)) {
      for (const keyword of info.keywords) {
        if (lowerInput.includes(keyword)) {
          categoryScores[category as ExpenseCategory] += 1;
        }
      }
    }

    // Find the category with the highest score
    const bestCategory = Object.entries(categoryScores)
      .filter(([_, score]) => score > 0)
      .sort(([_, a], [__, b]) => b - a)[0];

    return bestCategory ? (bestCategory[0] as ExpenseCategory) : null;
  }

  private static extractDate(input: string): Date | null {
    const now = new Date();
    
    for (const { pattern, days } of this.DATE_PATTERNS) {
      if (pattern.test(input)) {
        const date = new Date(now);
        
        // Handle "X days ago" pattern
        const match = input.match(/(\d+)\s*days?\s*ago/gi);
        if (match) {
          const daysAgo = parseInt(match[0].match(/\d+/)?.[0] || '0');
          date.setDate(date.getDate() - daysAgo);
        } else {
          date.setDate(date.getDate() + days);
        }
        
        return date;
      }
    }
    
    return null; // Default to today
  }

  private static generateDescription(input: string, category: ExpenseCategory | null): string {
    // Remove amount and common words to create a description
    let description = input
      .replace(/\$?\d+(?:\.\d{2})?(?:\s*dollars?|\s*bucks?|\$)?/gi, '')
      .replace(/\b(spent|paid|cost|for|on|bought|purchase|today|yesterday)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    // If description is too short or generic, use category info
    if (description.length < 3 || !description) {
      const categoryInfo = category ? EXPENSE_CATEGORIES[category] : null;
      description = categoryInfo ? categoryInfo.name : 'Expense';
    }

    return description;
  }

  private static getDaysToLastWeekday(targetDay: number): number {
    const today = new Date();
    const currentDay = today.getDay();
    let diff = currentDay - targetDay;
    if (diff <= 0) diff += 7;
    return -diff;
  }

  // Generate helpful bot responses
  static generateBotResponse(parsed: ParsedExpense, success: boolean): string {
    if (!success || parsed.confidence < 0.3) {
      return "I couldn't understand that expense. Could you try again? For example: 'I spent $50 on groceries' or 'lunch cost me $25'.";
    }

    if (parsed.amount === null) {
      return "I see you mentioned an expense, but I couldn't find the amount. How much did you spend?";
    }

    if (parsed.category === null) {
      return `I found an expense of $${parsed.amount}, but what category was this for? (Food, Transportation, Entertainment, etc.)`;
    }

    const categoryInfo = EXPENSE_CATEGORIES[parsed.category];
    const dateStr = parsed.date ? parsed.date.toDateString() : 'today';
    
    return `Perfect! I've added $${parsed.amount} for ${categoryInfo.name} on ${dateStr}. ${parsed.description ? `(${parsed.description})` : ''} Anything else you'd like to track?`;
  }
}