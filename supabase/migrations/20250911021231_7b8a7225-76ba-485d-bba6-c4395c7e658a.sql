-- Fix database schema issues
-- Drop and recreate expenses table with correct column types
DROP TABLE IF EXISTS public.expenses CASCADE;

CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL CHECK (category IN ('food', 'transportation', 'entertainment', 'shopping', 'bills', 'healthcare', 'education', 'travel', 'other')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on expenses
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- RLS policies for expenses
CREATE POLICY "Users can view their own expenses" 
ON public.expenses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own expenses" 
ON public.expenses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses" 
ON public.expenses 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses" 
ON public.expenses 
FOR DELETE 
USING (auth.uid() = user_id);

-- Drop and recreate budgets table with correct column types
DROP TABLE IF EXISTS public.budgets CASCADE;

CREATE TABLE public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_budget NUMERIC NOT NULL DEFAULT 0 CHECK (total_budget >= 0),
  food_budget NUMERIC NOT NULL DEFAULT 0 CHECK (food_budget >= 0),
  transportation_budget NUMERIC NOT NULL DEFAULT 0 CHECK (transportation_budget >= 0),
  entertainment_budget NUMERIC NOT NULL DEFAULT 0 CHECK (entertainment_budget >= 0),
  shopping_budget NUMERIC NOT NULL DEFAULT 0 CHECK (shopping_budget >= 0),
  bills_budget NUMERIC NOT NULL DEFAULT 0 CHECK (bills_budget >= 0),
  healthcare_budget NUMERIC NOT NULL DEFAULT 0 CHECK (healthcare_budget >= 0),
  education_budget NUMERIC NOT NULL DEFAULT 0 CHECK (education_budget >= 0),
  travel_budget NUMERIC NOT NULL DEFAULT 0 CHECK (travel_budget >= 0),
  other_budget NUMERIC NOT NULL DEFAULT 0 CHECK (other_budget >= 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on budgets
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- RLS policies for budgets
CREATE POLICY "Users can view their own budget" 
ON public.budgets 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budget" 
ON public.budgets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget" 
ON public.budgets 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX idx_expenses_category ON public.expenses(category);
CREATE INDEX idx_expenses_timestamp ON public.expenses(timestamp);
CREATE INDEX idx_budgets_user_id ON public.budgets(user_id);