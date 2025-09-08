import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Search, Filter, Calendar } from 'lucide-react';
import { useExpenses } from '@/contexts/ExpenseContext';
import { EXPENSE_CATEGORIES, ExpenseCategory } from '@/types/expense';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export const ExpenseList: React.FC = () => {
  const { expenses, deleteExpense } = useExpenses();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | ExpenseCategory>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date');

  // Filter and sort expenses
  const filteredExpenses = expenses
    .filter(expense => {
      const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           expense.amount.toString().includes(searchTerm);
      const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.amount - a.amount;
        case 'category':
          return a.category.localeCompare(b.category);
        case 'date':
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

  const handleDelete = (id: string) => {
    deleteExpense(id);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4 expense-card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <Select value={filterCategory} onValueChange={(value: 'all' | ExpenseCategory) => setFilterCategory(value)}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(EXPENSE_CATEGORIES).map(([key, info]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <span>{info.icon}</span>
                    <span>{info.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(value: 'date' | 'amount' | 'category') => setSortBy(value)}>
            <SelectTrigger className="w-full md:w-32">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="amount">Amount</SelectItem>
              <SelectItem value="category">Category</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Expense List */}
      <div className="space-y-3">
        {filteredExpenses.length === 0 ? (
          <Card className="p-8 text-center expense-card">
            <p className="text-muted-foreground">No expenses found matching your criteria.</p>
          </Card>
        ) : (
          filteredExpenses.map((expense, index) => {
            const categoryInfo = EXPENSE_CATEGORIES[expense.category];
            
            return (
              <Card 
                key={expense.id} 
                className={cn(
                  "p-4 expense-card hover:shadow-lg transition-all duration-200",
                  "animate-in fade-in duration-300"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Category Icon */}
                    <div className="text-2xl">{categoryInfo.icon}</div>
                    
                    {/* Expense Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-lg">
                          ${expense.amount.toFixed(2)}
                        </p>
                        <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full">
                          {categoryInfo.name}
                        </span>
                        {expense.addedVia === 'chatbot' && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            🤖 AI Added
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-1">
                        {expense.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(expense.date), 'MMM dd, yyyy')}
                        </span>
                        <span>{expense.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(expense.id)}
                    className="text-expense hover:bg-expense/10 hover:text-expense"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Summary */}
      {filteredExpenses.length > 0 && (
        <Card className="p-4 expense-card">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Showing {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''} • 
              Total: <span className="font-semibold text-primary">
                ${filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}
              </span>
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};