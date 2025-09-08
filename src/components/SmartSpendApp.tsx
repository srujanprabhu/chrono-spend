import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Plus } from 'lucide-react';
import { Navigation } from '@/components/Layout/Navigation';
import { OverviewCards } from '@/components/Dashboard/OverviewCards';
import { SpendingChart } from '@/components/Dashboard/SpendingChart';
import { ExpenseForm } from '@/components/Expenses/ExpenseForm';
import { ExpenseList } from '@/components/Expenses/ExpenseList';
import { BudgetOverview } from '@/components/Budget/BudgetOverview';
import { ChatInterface } from '@/components/Chat/ChatInterface';
import { ExpenseProvider } from '@/contexts/ExpenseContext';
import { cn } from '@/lib/utils';

const SmartSpendApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showChat, setShowChat] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
                  SmartSpend Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">
                  Track your expenses intelligently with AI assistance
                </p>
              </div>
              <Button
                onClick={() => setShowChat(true)}
                className="fab md:relative md:bottom-0 md:right-0"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Chat Assistant
              </Button>
            </div>
            
            <OverviewCards />
            <SpendingChart />
          </div>
        );
        
      case 'expenses':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Expense History</h1>
              <Button
                onClick={() => setActiveTab('add')}
                className="bg-gradient-to-r from-primary to-primary-hover"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </div>
            <ExpenseList />
          </div>
        );
        
      case 'add':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-center">Add New Expense</h1>
            <ExpenseForm />
          </div>
        );
        
      case 'budget':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Budget Tracking</h1>
            <BudgetOverview />
          </div>
        );
        
      case 'chat':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">AI Assistant</h1>
            <Card className="expense-card h-[600px]">
              <ChatInterface />
            </Card>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <ExpenseProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-hover rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">💰</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">SmartSpend</h1>
                <p className="text-xs text-muted-foreground">AI-Powered Expense Tracking</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Welcome back! 👋
              </span>
            </div>
          </div>
        </header>

        {/* Main Layout */}
        <div className="flex flex-col md:flex-row">
          {/* Sidebar Navigation */}
          <Navigation 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            className="md:sticky md:top-20 md:h-screen"
          />

          {/* Main Content */}
          <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
            {renderContent()}
          </main>
        </div>

        {/* Mobile Chat Overlay */}
        {showChat && (
          <div className="fixed inset-0 bg-black/50 z-50 md:hidden">
            <div className="absolute inset-x-4 top-16 bottom-4 bg-card rounded-lg shadow-xl">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="font-semibold">AI Assistant</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowChat(false)}
                >
                  Close
                </Button>
              </div>
              <div className="h-[calc(100%-4rem)]">
                <ChatInterface />
              </div>
            </div>
          </div>
        )}

        {/* Floating Chat Button - Desktop */}
        {activeTab !== 'chat' && (
          <Button
            onClick={() => setActiveTab('chat')}
            className="fab hidden md:flex"
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
        )}
      </div>
    </ExpenseProvider>
  );
};

export default SmartSpendApp;