import React from 'react';
import { BarChart3, MessageCircle, PlusCircle, Wallet, Target, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'expenses', label: 'Expenses', icon: Wallet },
  { id: 'add', label: 'Add', icon: PlusCircle },
  { id: 'budget', label: 'Budget', icon: Target },
  { id: 'chat', label: 'Assistant', icon: MessageCircle },
];

export const Navigation: React.FC<NavigationProps> = ({ 
  activeTab, 
  onTabChange,
  className 
}) => {
  return (
    <nav className={cn(
      "bg-card border-t border-border flex justify-around items-center py-2 px-4",
      "md:border-t-0 md:border-r md:flex-col md:py-8 md:w-20",
      className
    )}>
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200",
              "hover:bg-accent/60 hover:scale-105 active:scale-95",
              isActive && "bg-primary text-primary-foreground shadow-lg",
              !isActive && "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium hidden md:block">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};