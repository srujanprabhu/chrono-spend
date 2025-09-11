import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageCircle, Trash2, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useExpenses } from '@/contexts/ExpenseContext';
import { ExpenseParser } from '@/utils/expenseParser';
import { useToast } from '@/hooks/use-toast';
import { EXPENSE_CATEGORIES } from '@/types/expense';

export const ChatInterface: React.FC = () => {
  const { chatMessages, addChatMessage, addExpense } = useExpenses();
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const simulateTyping = async (response: string) => {
    setIsTyping(true);
    
    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    setIsTyping(false);
    
    // Add real message
    addChatMessage(response, false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    addChatMessage(userMessage, true);

    // Handle special commands
    if (userMessage.startsWith('/')) {
      handleCommand(userMessage);
      return;
    }

    // Parse the expense
    const parsed = ExpenseParser.parse(userMessage);
    
    if (parsed.confidence >= 0.3 && parsed.amount !== null && parsed.category !== null) {
      // Successfully parsed - add expense
      const expenseData = {
        amount: parsed.amount,
        category: parsed.category,
        description: parsed.description,
        date: parsed.date || new Date(),
        paymentMethod: 'credit' as const,
        addedVia: 'chatbot' as const,
      };

      addExpense(expenseData);
      
      toast({
        title: "Expense Added via Chat!",
        description: `$${parsed.amount.toFixed(2)} for ${EXPENSE_CATEGORIES[parsed.category].name}`,
      });
    }

    // Generate and send bot response
    const response = ExpenseParser.generateBotResponse(parsed, parsed.confidence >= 0.3);
    await simulateTyping(response);
  };

  const handleCommand = async (command: string) => {
    const cmd = command.toLowerCase();
    let response = '';

    switch (cmd) {
      case '/help':
        response = `Available commands:
• Just tell me naturally: "I spent $50 on groceries"
• /help - Show this help
• /today - Show today's expenses
• /budget - Quick budget overview

Try saying things like:
• "lunch cost me $25"
• "I bought gas for $60 yesterday" 
• "$15 for coffee this morning"`;
        break;
      case '/today':
        const { getTotalSpent } = useExpenses();
        const todayTotal = getTotalSpent('today');
        response = `Today you've spent $${todayTotal.toFixed(2)} total.`;
        break;
      case '/budget':
        const { budget, getTotalSpent: getTotal } = useExpenses();
        const monthlySpent = getTotal('month');
        const remaining = budget.totalBudget - monthlySpent;
        response = `Budget Status:
• Monthly Budget: $${budget.totalBudget}
• Spent: $${monthlySpent.toFixed(2)}
• Remaining: $${remaining.toFixed(2)}
• ${remaining > 0 ? '✅ On track!' : '⚠️ Over budget!'}`;
        break;
      default:
        response = "Unknown command. Type /help to see available commands.";
    }

    await simulateTyping(response);
  };

  const quickSuggestions = [
    "I spent $50 on groceries",
    "Lunch cost me $25",
    "Gas for $60 yesterday",
    "$15 for coffee",
  ];

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Expense Assistant</h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCommand('/help')}
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.isUser ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2",
                message.isUser 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
              )}
            >
              <p className="text-sm whitespace-pre-line">{message.message}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl px-4 py-2 bg-muted text-muted-foreground animate-pulse">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      {chatMessages.length <= 2 && (
        <div className="p-4 border-t border-border">
          <p className="text-sm text-muted-foreground mb-2">Try these examples:</p>
          <div className="flex flex-wrap gap-2">
            {quickSuggestions.map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                onClick={() => setInput(suggestion)}
                className="text-xs"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell me about your expense... (e.g., 'I spent $50 on groceries')"
            disabled={isTyping}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={!input.trim() || isTyping}
            className="bg-gradient-to-r from-primary to-primary-hover"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};