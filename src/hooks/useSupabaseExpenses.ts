import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Expense, ExpenseCategory } from '@/types/expense';

export const useSupabaseExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch expenses from Supabase
  const fetchExpenses = async () => {
    if (!user) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      const formattedExpenses: Expense[] = (data || []).map(expense => ({
        id: expense.id,
        description: expense.title,
        amount: parseFloat(expense.amount.toString()),
        category: expense.category as ExpenseCategory,
        date: new Date(expense.timestamp),
        paymentMethod: 'credit' as const,
        addedVia: 'manual' as const,
        timestamp: new Date(expense.timestamp)
      }));

      setExpenses(formattedExpenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({
        title: "Error",
        description: "Failed to load expenses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add expense to Supabase
  const addExpense = async (expense: Omit<Expense, 'id' | 'timestamp'>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add expenses",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          user_id: user.id,
          title: expense.description,
          amount: expense.amount.toString(),
          category: expense.category,
          timestamp: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      const newExpense: Expense = {
        id: data.id,
        description: data.title,
        amount: parseFloat(data.amount.toString()),
        category: data.category as ExpenseCategory,
        date: new Date(data.timestamp),
        paymentMethod: 'credit' as const,
        addedVia: 'manual' as const,
        timestamp: new Date(data.timestamp)
      };

      setExpenses(prev => [newExpense, ...prev]);
      
      toast({
        title: "Success",
        description: "Expense added successfully",
      });
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      });
    }
  };

  // Delete expense from Supabase
  const deleteExpense = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setExpenses(prev => prev.filter(expense => expense.id !== id));
      
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [user]);

  return {
    expenses,
    loading,
    addExpense,
    deleteExpense,
    refetch: fetchExpenses
  };
};