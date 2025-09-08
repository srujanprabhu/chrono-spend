import React, { createContext, useContext, useState, useEffect } from 'react';
import { Expense, Budget, ChatMessage, ExpenseCategory } from '@/types/expense';

interface ExpenseContextType {
  expenses: Expense[];
  budget: Budget;
  chatMessages: ChatMessage[];
  addExpense: (expense: Omit<Expense, 'id' | 'timestamp'>) => void;
  deleteExpense: (id: string) => void;
  updateBudget: (budget: Partial<Budget>) => void;
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChat: () => void;
  getTotalSpent: (period?: 'today' | 'week' | 'month') => number;
  getCategorySpent: (category: ExpenseCategory, period?: 'today' | 'week' | 'month') => number;
  getRecentExpenses: (limit?: number) => Expense[];
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within ExpenseProvider');
  }
  return context;
};

// Sample data for demo
const SAMPLE_EXPENSES: Expense[] = [
  {
    id: '1',
    amount: 25.50,
    category: 'food',
    description: 'Lunch at cafe',
    date: new Date(),
    paymentMethod: 'credit',
    addedVia: 'manual',
    timestamp: new Date(),
  },
  {
    id: '2', 
    amount: 60.00,
    category: 'transportation',
    description: 'Gas for car',
    date: new Date(Date.now() - 86400000), // Yesterday
    paymentMethod: 'debit',
    addedVia: 'chatbot',
    timestamp: new Date(Date.now() - 86400000),
  },
  {
    id: '3',
    amount: 15.99,
    category: 'entertainment',
    description: 'Netflix subscription',
    date: new Date(Date.now() - 172800000), // 2 days ago
    paymentMethod: 'credit',
    addedVia: 'manual',
    timestamp: new Date(Date.now() - 172800000),
  },
  {
    id: '4',
    amount: 120.00,
    category: 'shopping',
    description: 'New clothes',
    date: new Date(Date.now() - 259200000), // 3 days ago
    paymentMethod: 'credit',
    addedVia: 'manual',
    timestamp: new Date(Date.now() - 259200000),
  },
  {
    id: '5',
    amount: 45.75,
    category: 'food',
    description: 'Groceries',
    date: new Date(Date.now() - 345600000), // 4 days ago
    paymentMethod: 'debit',
    addedVia: 'chatbot',
    timestamp: new Date(Date.now() - 345600000),
  }
];

const DEFAULT_BUDGET: Budget = {
  totalBudget: 2000,
  categoryBudgets: {
    food: 400,
    transportation: 300,
    entertainment: 200,
    shopping: 300,
    bills: 500,
    healthcare: 150,
    education: 100,
    travel: 200,
    other: 150,
  },
  period: 'monthly'
};

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('smartspend-expenses');
    return saved ? JSON.parse(saved) : SAMPLE_EXPENSES;
  });

  const [budget, setBudget] = useState<Budget>(() => {
    const saved = localStorage.getItem('smartspend-budget');
    return saved ? JSON.parse(saved) : DEFAULT_BUDGET;
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('smartspend-chat');
    if (saved) {
      return JSON.parse(saved);
    }
    return [{
      id: '1',
      content: "Hi! I'm your expense assistant. You can tell me about your expenses naturally, like 'I spent $50 on groceries' and I'll add it automatically!",
      type: 'bot',
      timestamp: new Date(),
    }];
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('smartspend-expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('smartspend-budget', JSON.stringify(budget));
  }, [budget]);

  useEffect(() => {
    localStorage.setItem('smartspend-chat', JSON.stringify(chatMessages));
  }, [chatMessages]);

  const addExpense = (expenseData: Omit<Expense, 'id' | 'timestamp'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setExpenses(prev => [newExpense, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  const updateBudget = (budgetUpdate: Partial<Budget>) => {
    setBudget(prev => ({ ...prev, ...budgetUpdate }));
  };

  const addChatMessage = (messageData: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...messageData,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  const clearChat = () => {
    setChatMessages([{
      id: '1',
      content: "Chat cleared! How can I help you track your expenses?",
      type: 'bot',
      timestamp: new Date(),
    }]);
  };

  const getTotalSpent = (period: 'today' | 'week' | 'month' = 'month') => {
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    return expenses
      .filter(expense => expense.date >= startDate)
      .reduce((total, expense) => total + expense.amount, 0);
  };

  const getCategorySpent = (category: ExpenseCategory, period: 'today' | 'week' | 'month' = 'month') => {
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    return expenses
      .filter(expense => expense.category === category && expense.date >= startDate)
      .reduce((total, expense) => total + expense.amount, 0);
  };

  const getRecentExpenses = (limit = 10) => {
    return expenses
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  };

  return (
    <ExpenseContext.Provider value={{
      expenses,
      budget,
      chatMessages,
      addExpense,
      deleteExpense,
      updateBudget,
      addChatMessage,
      clearChat,
      getTotalSpent,
      getCategorySpent,
      getRecentExpenses,
    }}>
      {children}
    </ExpenseContext.Provider>
  );
};