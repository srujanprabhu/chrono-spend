import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Budget } from '@/types/expense';

export const useSupabaseBudget = () => {
  const [budget, setBudget] = useState<Budget>({
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
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch budget from Supabase
  const fetchBudget = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setBudget({
          totalBudget: parseFloat(data.total_budget.toString()),
          categoryBudgets: {
            food: parseFloat(data.food_budget.toString()),
            transportation: parseFloat(data.transport_budget.toString()),
            entertainment: parseFloat(data.entertainment_budget.toString()),
            shopping: parseFloat(data.shopping_budget.toString()),
            bills: parseFloat(data.bills_budget.toString()),
            healthcare: parseFloat(data.health_budget.toString()),
            education: 100, // Default value for missing field
            travel: 200, // Default value for missing field  
            other: parseFloat(data.other_budget.toString()),
          },
          period: 'monthly'
        });
      }
    } catch (error) {
      console.error('Error fetching budget:', error);
      toast({
        title: "Error",
        description: "Failed to load budget",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update budget in Supabase
  const updateBudget = async (newBudget: Partial<Budget>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update budget",
        variant: "destructive",
      });
      return;
    }

    const updatedBudget = { ...budget, ...newBudget };

    try {
      const { error } = await supabase
        .from('budgets')
        .upsert({
          user_id: user.id,
          total_budget: updatedBudget.totalBudget.toString(),
          food_budget: updatedBudget.categoryBudgets.food.toString(),
          transport_budget: updatedBudget.categoryBudgets.transportation.toString(),
          entertainment_budget: updatedBudget.categoryBudgets.entertainment.toString(),
          shopping_budget: updatedBudget.categoryBudgets.shopping.toString(),
          bills_budget: updatedBudget.categoryBudgets.bills.toString(),
          health_budget: updatedBudget.categoryBudgets.healthcare.toString(),
          other_budget: updatedBudget.categoryBudgets.other.toString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setBudget(updatedBudget);
      
      toast({
        title: "Success",
        description: "Budget updated successfully",
      });
    } catch (error) {
      console.error('Error updating budget:', error);
      toast({
        title: "Error",
        description: "Failed to update budget",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchBudget();
  }, [user]);

  return {
    budget,
    loading,
    updateBudget,
    refetch: fetchBudget
  };
};