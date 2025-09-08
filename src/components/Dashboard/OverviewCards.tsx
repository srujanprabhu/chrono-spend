import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Target } from 'lucide-react';
import { useExpenses } from '@/contexts/ExpenseContext';
import { cn } from '@/lib/utils';

export const OverviewCards: React.FC = () => {
  const { getTotalSpent, budget, expenses } = useExpenses();

  const totalThisMonth = getTotalSpent('month');
  const totalToday = getTotalSpent('today');
  const dailyAverage = totalThisMonth / new Date().getDate();
  const budgetRemaining = budget.totalBudget - totalThisMonth;
  const transactionCount = expenses.length;

  const cards = [
    {
      title: 'Total Spent',
      value: `$${totalThisMonth.toFixed(2)}`,
      subtitle: 'This month',
      icon: DollarSign,
      trend: totalThisMonth > budget.totalBudget ? 'negative' : 'neutral',
      className: 'expense-card'
    },
    {
      title: 'Daily Average',
      value: `$${dailyAverage.toFixed(2)}`,
      subtitle: 'Based on this month',
      icon: TrendingUp,
      trend: 'neutral',
      className: 'expense-card'
    },
    {
      title: "Today's Spending",
      value: `$${totalToday.toFixed(2)}`,
      subtitle: 'Current day',
      icon: Calendar,
      trend: totalToday > dailyAverage ? 'negative' : 'positive',
      className: 'expense-card'
    },
    {
      title: 'Budget Remaining',
      value: `$${budgetRemaining.toFixed(2)}`,
      subtitle: `${((budgetRemaining / budget.totalBudget) * 100).toFixed(1)}% left`,
      icon: Target,
      trend: budgetRemaining > 0 ? 'positive' : 'negative',
      className: budgetRemaining > 0 ? 'income-card' : 'expense-amount'
    },
    {
      title: 'Transactions',
      value: transactionCount.toString(),
      subtitle: 'Total recorded',
      icon: TrendingUp,
      trend: 'neutral',
      className: 'expense-card'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <Card 
            key={card.title}
            className={cn(
              "p-6 transition-all duration-300 hover:scale-105 cursor-pointer",
              card.className,
              "animate-in fade-in duration-500",
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <Icon className={cn(
                "h-8 w-8",
                card.trend === 'positive' && "text-success",
                card.trend === 'negative' && "text-expense",
                card.trend === 'neutral' && "text-primary"
              )} />
              
              {card.trend === 'positive' && <TrendingUp className="h-4 w-4 text-success" />}
              {card.trend === 'negative' && <TrendingDown className="h-4 w-4 text-expense" />}
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {card.title}
              </p>
              <p className="text-2xl font-bold mb-1">
                {card.value}
              </p>
              <p className="text-xs text-muted-foreground">
                {card.subtitle}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
};