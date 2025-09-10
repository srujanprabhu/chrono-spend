import React, { useState } from 'react';
import { useExpenses } from '@/contexts/ExpenseContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { EXPENSE_CATEGORIES } from '@/types/expense';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export const BudgetSettings: React.FC = () => {
  const { budget, updateBudget } = useExpenses();
  const { toast } = useToast();
  
  const [totalBudget, setTotalBudget] = useState(budget.totalBudget.toString());
  const [categoryBudgets, setCategoryBudgets] = useState(
    Object.fromEntries(
      Object.entries(budget.categoryBudgets).map(([key, value]) => [key, value.toString()])
    )
  );

  const handleSave = () => {
    const newTotalBudget = parseFloat(totalBudget) || 0;
    const newCategoryBudgets = Object.fromEntries(
      Object.entries(categoryBudgets).map(([key, value]) => [key, parseFloat(value) || 0])
    ) as Record<string, number>;

    updateBudget({
      totalBudget: newTotalBudget,
      categoryBudgets: newCategoryBudgets as any
    });

    toast({
      title: "Budget updated",
      description: "Your budget settings have been saved successfully.",
    });
  };

  const handleReset = () => {
    const defaultBudget = {
      totalBudget: 2000,
      categoryBudgets: {
        food: 500,
        transportation: 200,
        entertainment: 150,
        shopping: 300,
        bills: 400,
        healthcare: 200,
        education: 100,
        travel: 100,
        other: 50
      }
    };

    setTotalBudget(defaultBudget.totalBudget.toString());
    setCategoryBudgets(
      Object.fromEntries(
        Object.entries(defaultBudget.categoryBudgets).map(([key, value]) => [key, value.toString()])
      )
    );

    updateBudget(defaultBudget as any);
    
    toast({
      title: "Budget reset",
      description: "Your budget has been reset to default values.",
    });
  };

  const totalCategoryBudgets = Object.values(categoryBudgets).reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
  const budgetMismatch = Math.abs(totalCategoryBudgets - parseFloat(totalBudget)) > 0.01;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Budget Settings</CardTitle>
          <CardDescription>
            Set your monthly budget limits for better expense tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Total Budget */}
          <div className="space-y-2">
            <Label htmlFor="total-budget">Monthly Budget</Label>
            <Input
              id="total-budget"
              type="number"
              step="0.01"
              min="0"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              placeholder="Enter total monthly budget"
            />
          </div>

          <Separator />

          {/* Category Budgets */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Category Budgets</Label>
              {budgetMismatch && (
                <span className="text-sm text-warning">
                  Total: ${totalCategoryBudgets.toFixed(2)} (doesn't match monthly budget)
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(EXPENSE_CATEGORIES).map(([key, category]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={`budget-${key}`} className="flex items-center gap-2">
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </Label>
                  <Input
                    id={`budget-${key}`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={categoryBudgets[key] || '0'}
                    onChange={(e) => setCategoryBudgets(prev => ({
                      ...prev,
                      [key]: e.target.value
                    }))}
                    placeholder="0.00"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button onClick={handleSave} className="flex-1">
              Save Budget
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="flex-1">
                  Reset to Default
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset Budget</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will reset your budget to default values. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset}>
                    Reset Budget
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};