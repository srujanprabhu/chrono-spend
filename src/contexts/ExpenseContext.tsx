import React, { createContext, useContext } from 'react';
import { Expense, Budget, ChatMessage, ExpenseCategory } from '@/types/expense';
import { useSupabaseExpenses } from '@/hooks/useSupabaseExpenses';
import { useSupabaseBudget } from '@/hooks/useSupabaseBudget';
import { useSupabaseChat, type ChatMessage as SupaChatMessage } from '@/hooks/useSupabaseChat';

interface ExpenseContextType {
  expenses: Expense[];
  budget: Budget;
  chatMessages: SupaChatMessage[];
  loading: boolean;
  addExpense: (expense: Omit<Expense, 'id' | 'timestamp'>) => void;
  deleteExpense: (id: string) => void;
  updateBudget: (budget: Partial<Budget>) => void;
  addChatMessage: (message: string, isUser: boolean) => void;
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
  const { 
    expenses, 
    loading: expensesLoading, 
    addExpense, 
    deleteExpense 
  } = useSupabaseExpenses();
  
  const { 
    budget, 
    loading: budgetLoading, 
    updateBudget 
  } = useSupabaseBudget();
  
  const { 
    chatMessages, 
    loading: chatLoading, 
    addChatMessage 
  } = useSupabaseChat();

  const loading = expensesLoading || budgetLoading || chatLoading;

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
      loading,
      addExpense,
      deleteExpense,
      updateBudget,
      addChatMessage,
      getTotalSpent,
      getCategorySpent,
      getRecentExpenses,
    }}>
      {children}
    </ExpenseContext.Provider>
  );
};