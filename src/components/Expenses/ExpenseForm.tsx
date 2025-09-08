import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useExpenses } from '@/contexts/ExpenseContext';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS, ExpenseCategory, PaymentMethod } from '@/types/expense';
import { useToast } from '@/hooks/use-toast';

const QUICK_AMOUNTS = [5, 10, 25, 50, 100];

export const ExpenseForm: React.FC = () => {
  const { addExpense } = useExpenses();
  const { toast } = useToast();
  
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    addExpense({
      amount: amountNum,
      category,
      description: description || EXPENSE_CATEGORIES[category].name,
      date,
      paymentMethod,
      addedVia: 'manual',
    });

    toast({
      title: "Expense Added!",
      description: `$${amountNum.toFixed(2)} for ${EXPENSE_CATEGORIES[category].name}`,
    });

    // Reset form
    setAmount('');
    setDescription('');
    setDate(new Date());
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  return (
    <Card className="p-6 expense-card max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <DollarSign className="h-6 w-6 text-primary" />
        Add New Expense
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-10 text-lg"
              required
            />
          </div>
          
          {/* Quick Amount Buttons */}
          <div className="flex gap-2 flex-wrap mt-3">
            <span className="text-sm text-muted-foreground self-center">Quick:</span>
            {QUICK_AMOUNTS.map((quickAmount) => (
              <Button
                key={quickAmount}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickAmount(quickAmount)}
                className="amount-button"
              >
                ${quickAmount}
              </Button>
            ))}
          </div>
        </div>

        {/* Category Selection */}
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={(value: ExpenseCategory) => setCategory(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
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
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Input
            id="description"
            placeholder={`e.g., ${EXPENSE_CATEGORIES[category].name.toLowerCase()}`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Date Picker */}
        <div className="space-y-2">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(selectedDate) => selectedDate && setDate(selectedDate)}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Payment Method */}
        <div className="space-y-2">
          <Label htmlFor="payment">Payment Method</Label>
          <Select value={paymentMethod} onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PAYMENT_METHODS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-primary to-primary-hover hover:shadow-lg transition-all duration-200"
          size="lg"
        >
          Add Expense
        </Button>
      </form>
    </Card>
  );
};