import React from 'react';
import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useExpenses } from '@/contexts/ExpenseContext';
import { EXPENSE_CATEGORIES } from '@/types/expense';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--success))', 
  'hsl(var(--warning))',
  'hsl(var(--expense))',
  'hsl(217 91% 45%)',
  'hsl(142 76% 45%)',
  'hsl(38 92% 45%)',
  'hsl(0 84% 45%)',
  'hsl(var(--muted-foreground))'
];

export const SpendingChart: React.FC = () => {
  const { expenses, getCategorySpent } = useExpenses();

  // Category spending data
  const categoryData = Object.entries(EXPENSE_CATEGORIES).map(([category, info], index) => {
    const spent = getCategorySpent(category as any);
    return {
      name: info.name,
      value: spent,
      color: COLORS[index % COLORS.length],
      icon: info.icon
    };
  }).filter(item => item.value > 0);

  // Daily spending for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    
    const daySpending = expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.toDateString() === date.toDateString();
      })
      .reduce((total, expense) => total + expense.amount, 0);

    return {
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      amount: daySpending,
      date: date.toISOString().split('T')[0]
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-primary">
            Amount: <span className="font-semibold">${payload[0].value.toFixed(2)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CategoryTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{data.icon}</span>
            <p className="font-medium">{data.name}</p>
          </div>
          <p className="text-sm text-primary">
            <span className="font-semibold">${data.value.toFixed(2)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Category Pie Chart */}
      <Card className="p-6 expense-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>📊</span>
          Spending by Category
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CategoryTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* Daily Spending Line Chart */}
      <Card className="p-6 expense-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>📈</span>
          Daily Spending Trend
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={last7Days}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke="hsl(var(--success))" 
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--success))', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, stroke: 'hsl(var(--success))', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};