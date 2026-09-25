import PinLock from './components/PinLock';
import React, { useState, useEffect } from 'react';
import { LayoutGrid, PieChart, Repeat, Plus } from 'lucide-react';
import { Header } from './components/Header';
import { HomeDashboard } from './components/HomeDashboard';
import { AnalyticsView } from './components/AnalyticsView';
import { RecurringBillsView } from './components/RecurringBillsView';
import { QuickAddModal } from './components/QuickAddModal';
import { MiniCalculator } from './components/MiniCalculator';
import { SmsSimulatorModal } from './components/SmsSimulatorModal';
import { BudgetSettingsModal } from './components/BudgetSettingsModal';
import { UserProfileModal } from './components/UserProfileModal';
import { Expense, RecurringBill, BudgetConfig, SmsAlert, UserProfile, INITIAL_USER_PROFILE, DEFAULT_CATEGORY_BUDGETS } from './types';
import { initTelemetry, trackPageView, trackGAEvent, sendProfileToWebhook } from './utils/telemetry';

// Initial Seed Data (Empty for clean user entry)
const INITIAL_EXPENSES: Expense[] = [];

const INITIAL_RECURRING_BILLS: RecurringBill[] = [];

const INITIAL_BUDGET_CONFIG: BudgetConfig = {
  monthlyIncome: 0,
  monthlyBudget: 0,
  userRole: 'Working Professional',
  categoryBudgets: DEFAULT_CATEGORY_BUDGETS,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'analytics' | 'recurring'>('home');
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Dual Theme State (Light Mode default: false)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('pocketspent_theme');
    return saved ? JSON.parse(saved) : false; // Default Light Mode
  });

  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('pocketspent_user_profile');
    if (!saved) return INITIAL_USER_PROFILE;
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_USER_PROFILE;
    }
  });

  // Persistence in localStorage
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('pocketspent_expenses');
    if (!saved) return INITIAL_EXPENSES;
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Only strip out hardcoded legacy demo IDs from old sessions
        const demoIds = ['exp_1', 'exp_2', 'exp_3', 'exp_4', 'exp_5', 'exp_6'];
        return parsed.filter((e: Expense) => !demoIds.includes(e.id));
      }
      return INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  });

  const [recurringBills, setRecurringBills] = useState<RecurringBill[]>(() => {
    const saved = localStorage.getItem('pocketspent_recurring');
    if (!saved) return INITIAL_RECURRING_BILLS;
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const demoBillIds = ['bill_1', 'bill_2', 'bill_3'];
        return parsed.filter((b: RecurringBill) => !demoBillIds.includes(b.id));
      }
      return INITIAL_RECURRING_BILLS;
    } catch {
      return INITIAL_RECURRING_BILLS;
    }
  });

  const [budgetConfig, setBudgetConfig] = useState<BudgetConfig>(() => {
    const saved = localStorage.getItem('pocketspent_budget');
    if (!saved) return INITIAL_BUDGET_CONFIG;
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_BUDGET_CONFIG;
    }
  });

  const [unconfirmedSmsAlerts, setUnconfirmedSmsAlerts] = useState<SmsAlert[]>([]);

  // Modals state
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isSmsSimulatorOpen, setIsSmsSimulatorOpen] = useState(false);
  const [isBudgetSettingsOpen, setIsBudgetSettingsOpen] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isCalculatorMinimized, setIsCalculatorMinimized] = useState(false);

  useEffect(() => {
    localStorage.setItem('pocketspent_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('pocketspent_theme', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('pocketspent_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('pocketspent_recurring', JSON.stringify(recurringBills));
  }, [recurringBills]);

  useEffect(() => {
    localStorage.setItem('pocketspent_budget', JSON.stringify(budgetConfig));
  }, [budgetConfig]);

  // Expense Handlers
  const handleOpenAddModal = () => {
    setEditingExpense(null);
    setIsQuickAddOpen(true);
  };

  const handleOpenEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    setIsQuickAddOpen(true);
  };

  const handleSaveExpense = (
    amount: number,
    title: string,
    category: string,
    isIncome: boolean,
    dateTimestamp?: number
  ) => {
    if (editingExpense) {
      // Update existing expense
      setExpenses((prev) =>
        prev.map((e) =>
          e.id === editingExpense.id
            ? {
                ...e,
                title,
                amount,
                category,
                isIncome,
                dateTimestamp: dateTimestamp || e.dateTimestamp,
                merchant: title,
              }
            : e
        )
      );
      setEditingExpense(null);
    } else {
      // Add new expense
      const newExpense: Expense = {
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        title,
        amount,
        category,
        dateTimestamp: dateTimestamp || Date.now(),
        isIncome,
        merchant: title,
        paymentMode: 'Manual Entry',
      };
      setExpenses((prev) => [newExpense, ...prev]);
    }
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // SMS Handlers
  const handleConfirmSmsAlert = (alert: SmsAlert, category: string) => {
    handleSaveExpense(alert.amount, alert.merchant || alert.category, category, alert.isIncome, alert.timestamp);
    handleDismissSmsAlert(alert);
  };

  const handleDismissSmsAlert = (alert: SmsAlert) => {
    setUnconfirmedSmsAlerts((prev) => prev.filter((a) => a.id !== alert.id));
  };

  const handleAddSmsAlertFromSimulator = (alert: SmsAlert) => {
    setUnconfirmedSmsAlerts((prev) => [alert, ...prev]);
  };

  // Recurring Bill Handlers
  const handleToggleBillPaid = (bill: RecurringBill) => {
    const nextPaid = !bill.isPaidThisMonth;
    setRecurringBills((prev) =>
      prev.map((b) => (b.id === bill.id ? { ...b, isPaidThisMonth: nextPaid } : b))
    );

    if (nextPaid) {
      handleSaveExpense(bill.amount, `Auto-Debit: ${bill.title}`, bill.category, false);
    }
  };

  const handleAddRecurringBill = (title: string, amount: number, category: string, dueDay: number) => {
    const newBill: RecurringBill = {
      id: `bill_${Date.now()}`,
      title,
      amount,
      category,
      dueDayOfMonth: dueDay,
      isPaidThisMonth: false,
    };
    setRecurringBills((prev) => [...prev, newBill]);
  };

  const handleDeleteRecurringBill = (id: string) => {
  setRecurringBills((prev) => prev.filter((b) => b.id !== id));
};
if (!isUnlocked) {
  return (
  <PinLock onUnlock={() => setIsUnlocked(true)} />
);
}

  return (
    <div
      className={`min-h-screen flex flex-col font-['Plus_Jakarta_Sans',sans-serif] transition-colors ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
      }`}
    >
      {/* Outer wrapper */}
      <div className="flex-1 flex justify-center items-start">
        <div className="w-full max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto">
          {/* Header */}
          <Header
            budgetConfig={budgetConfig}
            userProfile={userProfile}
            onOpenBudgetSettings={() => setIsBudgetSettingsOpen(true)}
            onOpenUserProfile={() => setIsUserProfileOpen(true)}
            onOpenSmsSimulator={() => setIsSmsSimulatorOpen(true)}
            isDarkMode={isDarkMode}
            onToggleTheme={() => setIsDarkMode(!isDarkMode)}
          />

          {/* Tab Views */}
          <main className="p-4 sm:p-6 pb-24">
            {activeTab === 'home' && (
              <HomeDashboard
                expenses={expenses}
                unconfirmedSmsAlerts={unconfirmedSmsAlerts}
                userProfile={userProfile}
                budgetConfig={budgetConfig}
                onOpenQuickAdd={handleOpenAddModal}
                onOpenSmsSimulator={() => setIsSmsSimulatorOpen(true)}
                onOpenUserProfile={() => setIsUserProfileOpen(true)}
                onOpenBudgetSettings={() => setIsBudgetSettingsOpen(true)}
                onOpenCalculator={() => {
                  setIsCalculatorOpen(true);
                  setIsCalculatorMinimized(false);
                }}
                onConfirmSmsAlert={handleConfirmSmsAlert}
                onDismissSmsAlert={handleDismissSmsAlert}
                onEditExpense={handleOpenEditModal}
                onDeleteExpense={handleDeleteExpense}
                isDarkMode={isDarkMode}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView
                expenses={expenses}
                monthlyBudget={budgetConfig.monthlyBudget}
                budgetConfig={budgetConfig}
                userProfile={userProfile}
                isDarkMode={isDarkMode}
              />
            )}

            {activeTab === 'recurring' && (
              <RecurringBillsView
                bills={recurringBills}
                onTogglePaid={handleToggleBillPaid}
                onAddBill={handleAddRecurringBill}
                onDeleteBill={handleDeleteRecurringBill}
                isDarkMode={isDarkMode}
              />
            )}

            {/* In-App Footer */}
            <footer className={`text-center py-4 text-[11px] font-semibold border-t mt-6 transition-colors ${
              isDarkMode ? 'border-slate-800/80 text-slate-500' : 'border-slate-200/80 text-slate-400'
            }`}>
              Created by Jitesh | Powered by JTech Labs
            </footer>
          </main>

          {/* Fixed Floating Calculator Quick Button */}
          {(!isCalculatorOpen || isCalculatorMinimized) && (
            <button
              onClick={() => {
                setIsCalculatorOpen(true);
                setIsCalculatorMinimized(false);
              }}
              className={`fixed bottom-20 z-40 h-14 px-3.5 rounded-2xl shadow-xl flex items-center gap-2 font-bold text-xs transition-all active:scale-95 left-6 sm:left-[calc(50%-270px)] md:left-[calc(50%-320px)] lg:left-[calc(50%-360px)] border ${
                isDarkMode
                  ? 'bg-slate-900/90 text-emerald-400 border-slate-700 hover:bg-slate-800 shadow-slate-950/50'
                  : 'bg-white/95 text-emerald-600 border-slate-200 hover:bg-slate-50 shadow-slate-300/40'
              }`}
              title="Open Mini Floating Calculator 🧮"
            >
              <span className="text-xl">🧮</span>
              <span className="hidden xs:inline">Calc</span>
            </button>
          )}

          {/* Floating '+' Add Entry Button */}
          <button
            onClick={handleOpenAddModal}
            className="fixed bottom-20 z-40 w-14 h-14 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl shadow-xl shadow-emerald-500/25 flex items-center justify-center transition-all active:scale-95 group right-6 sm:right-[calc(50%-270px)] md:right-[calc(50%-320px)] lg:right-[calc(50%-360px)]"
            title="1-Tap Add Transaction"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>

          {/* Bottom Navigation */}
          <nav
            className={`fixed bottom-0 left-0 right-0 z-30 backdrop-blur-md border-t px-6 py-2.5 mx-auto max-w-xl md:max-w-2xl lg:max-w-3xl transition-all ${
              isDarkMode
                ? 'bg-slate-900/95 border-slate-800 text-slate-300'
                : 'bg-white/95 border-slate-200 text-slate-600'
            }`}
          >
            <div className="flex items-center justify-around">
              <button
                onClick={() => setActiveTab('home')}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  activeTab === 'home'
                    ? 'text-emerald-500 font-bold'
                    : isDarkMode
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
                <span className="text-[11px]">Diary</span>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  activeTab === 'analytics'
                    ? 'text-emerald-500 font-bold'
                    : isDarkMode
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <PieChart className="w-5 h-5" />
                <span className="text-[11px]">Analytics</span>
              </button>

              <button
                onClick={() => setActiveTab('recurring')}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  activeTab === 'recurring'
                    ? 'text-emerald-500 font-bold'
                    : isDarkMode
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Repeat className="w-5 h-5" />
                <span className="text-[11px]">Auto-Debits</span>
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Modals */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        editingExpense={editingExpense}
        onClose={() => {
          setIsQuickAddOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        onDelete={handleDeleteExpense}
        isDarkMode={isDarkMode}
      />

      <SmsSimulatorModal
        isOpen={isSmsSimulatorOpen}
        onClose={() => setIsSmsSimulatorOpen(false)}
        onAddAlert={handleAddSmsAlertFromSimulator}
        isDarkMode={isDarkMode}
      />

      <BudgetSettingsModal
        isOpen={isBudgetSettingsOpen}
        currentConfig={budgetConfig}
        onClose={() => setIsBudgetSettingsOpen(false)}
        onSave={(newCfg) => setBudgetConfig(newCfg)}
        isDarkMode={isDarkMode}
      />

      <UserProfileModal
        isOpen={isUserProfileOpen}
        userProfile={userProfile}
        onClose={() => setIsUserProfileOpen(false)}
        onSaveProfile={(newProf) => setUserProfile(newProf)}
        isDarkMode={isDarkMode}
      />

      <MiniCalculator
        isOpen={isCalculatorOpen}
        isMinimized={isCalculatorMinimized}
        onClose={() => setIsCalculatorOpen(false)}
        onMinimize={() => setIsCalculatorMinimized(true)}
        onRestore={() => setIsCalculatorMinimized(false)}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
