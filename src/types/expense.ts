export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: Date;
  paymentMethod: PaymentMethod;
  addedVia: 'manual' | 'chatbot';
  timestamp: Date;
}

export type ExpenseCategory = 
  | 'food'
  | 'transportation'
  | 'entertainment'
  | 'shopping'
  | 'bills'
  | 'healthcare'
  | 'education'
  | 'travel'
  | 'other';

export type PaymentMethod = 
  | 'cash'
  | 'credit'
  | 'debit' 
  | 'digital';

export interface Budget {
  totalBudget: number;
  categoryBudgets: Record<ExpenseCategory, number>;
  period: 'monthly' | 'weekly';
}

export interface CategoryInfo {
  name: string;
  icon: string;
  color: string;
  keywords: string[];
}

export const EXPENSE_CATEGORIES: Record<ExpenseCategory, CategoryInfo> = {
  food: {
    name: 'Food & Dining',
    icon: '🍔',
    color: 'hsl(var(--warning))',
    keywords: ['lunch', 'dinner', 'breakfast', 'restaurant', 'groceries', 'coffee', 'pizza', 'food', 'meal', 'eat', 'drink']
  },
  transportation: {
    name: 'Transportation',
    icon: '🚗',
    color: 'hsl(var(--primary))',
    keywords: ['gas', 'fuel', 'uber', 'taxi', 'bus', 'train', 'parking', 'metro', 'transport', 'car', 'bike']
  },
  entertainment: {
    name: 'Entertainment',
    icon: '🎬',
    color: 'hsl(var(--success))',
    keywords: ['movie', 'cinema', 'game', 'concert', 'show', 'streaming', 'netflix', 'entertainment', 'fun', 'music']
  },
  shopping: {
    name: 'Shopping',
    icon: '🛍️',
    color: 'hsl(var(--expense))',
    keywords: ['clothes', 'amazon', 'store', 'shopping', 'buy', 'purchase', 'mall', 'online', 'shop']
  },
  bills: {
    name: 'Bills & Utilities',
    icon: '💡',
    color: 'hsl(217 91% 45%)',
    keywords: ['electricity', 'water', 'rent', 'phone', 'internet', 'cable', 'bill', 'utility', 'subscription']
  },
  healthcare: {
    name: 'Healthcare',
    icon: '🏥',
    color: 'hsl(0 84% 45%)',
    keywords: ['doctor', 'medicine', 'pharmacy', 'hospital', 'dentist', 'health', 'medical', 'prescription']
  },
  education: {
    name: 'Education',
    icon: '📚',
    color: 'hsl(142 76% 45%)',
    keywords: ['books', 'course', 'tuition', 'school', 'education', 'learning', 'class', 'study']
  },
  travel: {
    name: 'Travel',
    icon: '✈️',
    color: 'hsl(38 92% 45%)',
    keywords: ['hotel', 'flight', 'vacation', 'trip', 'travel', 'booking', 'holiday', 'airbnb']
  },
  other: {
    name: 'Other',
    icon: '📦',
    color: 'hsl(var(--muted-foreground))',
    keywords: ['other', 'miscellaneous', 'random', 'misc']
  }
};

export const PAYMENT_METHODS = {
  cash: 'Cash',
  credit: 'Credit Card',
  debit: 'Debit Card',
  digital: 'Digital Wallet'
};

export interface ChatMessage {
  id: string;
  content: string;
  type: 'user' | 'bot';
  timestamp: Date;
  expense?: Expense;
  isTyping?: boolean;
}