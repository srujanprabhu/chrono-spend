import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useExpenses } from '@/contexts/ExpenseContext';
import { EXPENSE_CATEGORIES, ExpenseCategory } from '@/types/expense';
import { cn } from '@/lib/utils';

export const BudgetOverview: React.FC = () => {
  const { budget, getCategorySpent, getTotalSpent } = useExpenses();
  
  const totalSpent = getTotalSpent('month');
  const totalProgress = (totalSpent / budget.totalBudget) * 100;
  const remaining = budget.totalBudget - totalSpent;

  // Category budget data
  const categoryBudgets = Object.entries(budget.categoryBudgets).map(([category, budgetAmount]) => {
    const spent = getCategorySpent(category as ExpenseCategory);
    const progress = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
    const isOverBudget = spent > budgetAmount;
    const categoryInfo = EXPENSE_CATEGORIES[category as ExpenseCategory];

    return {
      category: category as ExpenseCategory,
      name: categoryInfo.name,
      icon: categoryInfo.icon,
      budget: budgetAmount,
      spent,
      remaining: Math.max(0, budgetAmount - spent),
      progress: Math.min(100, progress),
      isOverBudget,
      status: isOverBudget ? 'over' : progress > 80 ? 'warning' : progress > 60 ? 'good' : 'excellent'
    };
  }).filter(item => item.budget > 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'over': return 'text-expense';
      case 'warning': return 'text-warning';
      case 'good': return 'text-primary';
      case 'excellent': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'over': return 'bg-expense';
      case 'warning': return 'bg-warning';
      case 'good': return 'bg-primary';
      case 'excellent': return 'bg-success';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Budget Card */}
      <Card className={cn(
        "p-6 transition-all duration-300",
        totalProgress > 100 ? "expense-amount" : totalProgress > 80 ? "bg-warning/5 border-warning/20" : "income-card"
      )}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold">Monthly Budget</h2>
          </div>
          <div className="flex items-center gap-2">
            {totalProgress > 100 ? (
              <AlertTriangle className="h-5 w-5 text-expense" />
            ) : totalProgress > 80 ? (
              <TrendingUp className="h-5 w-5 text-warning" />
            ) : (
              <CheckCircle className="h-5 w-5 text-success" />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Spent: ${totalSpent.toFixed(2)}</span>
            <span>Budget: ${budget.totalBudget.toFixed(2)}</span>
          </div>
          
          <Progress 
            value={Math.min(100, totalProgress)} 
            className={cn(
              "h-3",
              totalProgress > 100 && "bg-expense/20"
            )}
          />
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">
                ${remaining.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                {remaining > 0 ? 'Remaining' : 'Over Budget'}
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {totalProgress.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">Used</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-success">
                ${(budget.totalBudget / 30).toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">Daily Limit</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Category Budgets */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span>📊</span>
          Category Budgets
        </h3>
        
        <div className="grid gap-4">
          {categoryBudgets.map((item, index) => (
            <Card 
              key={item.category}
              className={cn(
                "p-4 expense-card transition-all duration-300 hover:scale-[1.02]",
                "animate-in fade-in duration-300"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ${item.spent.toFixed(2)} of ${item.budget.toFixed(2)}
                    </p>
                  </div>
                </div>
                
                <div className={cn("text-right", getStatusColor(item.status))}>
                  <p className="font-bold">
                    {item.isOverBudget ? '+' : ''}${item.isOverBudget ? (item.spent - item.budget).toFixed(2) : item.remaining.toFixed(2)}
                  </p>
                  <p className="text-xs">
                    {item.isOverBudget ? 'Over' : 'Left'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{item.progress.toFixed(1)}% used</span>
                  <span>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
                </div>
                
                <div className="relative">
                  <Progress 
                    value={Math.min(100, item.progress)} 
                    className="h-2"
                  />
                  {item.isOverBudget && (
                    <div 
                      className="absolute top-0 left-0 h-2 bg-expense rounded-full"
                      style={{ width: '100%' }}
                    />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Budget Tips */}
      <Card className="p-4 expense-card">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <span>💡</span>
          Budget Tips
        </h4>
        <div className="space-y-2 text-sm text-muted-foreground">
          {totalProgress > 100 && (
            <p className="text-expense">• You're over budget this month. Consider reducing spending in high categories.</p>
          )}
          {totalProgress > 80 && totalProgress <= 100 && (
            <p className="text-warning">• You've used {totalProgress.toFixed(1)}% of your budget. Monitor your spending closely.</p>
          )}
          <p>• Your highest spending category is {categoryBudgets.sort((a, b) => b.spent - a.spent)[0]?.name}</p>
          <p>• Try setting aside ${((budget.totalBudget - totalSpent) / (30 - new Date().getDate())).toFixed(2)} per day for the rest of the month</p>
        </div>
      </Card>
    </div>
  );
};