import React, { useState } from 'react';
import {
  Calendar,
  Download,
  FileText,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
  Check,
  X,
  MessageSquare,
  Pencil,
  Target,
  AlertTriangle,
  SlidersHorizontal,
  PieChart as PieChartIcon,
  ChevronDown,
  ChevronUp,
  Eye,
} from 'lucide-react';
import jsPDF from 'jspdf';
import { Expense, SmsAlert, CATEGORIES, UserProfile, BudgetConfig, DEFAULT_CATEGORY_BUDGETS } from '../types';
import { buildMonthlyPdfDoc, PdfTransactionItem, BudgetSummaryPdfItem } from '../utils/pdfGenerator';
import { calculateCategoryStatuses, generateBudgetAlerts, getBudgetColorClasses } from '../utils/budgetUtils';
import { ColorfulMonthPicker } from './ColorfulMonthPicker';
import { PdfPreviewModal } from './PdfPreviewModal';

interface HomeDashboardProps {
  expenses: Expense[];
  unconfirmedSmsAlerts: SmsAlert[];
  userProfile: UserProfile;
  budgetConfig: BudgetConfig;
  onOpenQuickAdd: () => void;
  onOpenSmsSimulator: () => void;
  onOpenUserProfile: () => void;
  onOpenBudgetSettings: () => void;
  onConfirmSmsAlert: (alert: SmsAlert, category: string) => void;
  onDismissSmsAlert: (alert: SmsAlert) => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  isDarkMode: boolean;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  expenses,
  unconfirmedSmsAlerts,
  userProfile,
  budgetConfig,
  onOpenQuickAdd,
  onOpenSmsSimulator,
  onOpenUserProfile,
  onOpenBudgetSettings,
  onConfirmSmsAlert,
  onDismissSmsAlert,
  onEditExpense,
  onDeleteExpense,
  isDarkMode,
}) => {
  // Currently selected month (YYYY-MM string, default current month)
  const [selectedMonthKey, setSelectedMonthKey] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // Collapsible Total Monthly Allocation state
  const [isAllocationOpen, setIsAllocationOpen] = useState(false);

  // Calculate Running Balance across all transactions in chronological order (oldest to newest)
  const sortedAllTransactions = [...expenses].sort((a, b) => {
    if (a.dateTimestamp !== b.dateTimestamp) {
      return a.dateTimestamp - b.dateTimestamp;
    }
    // On the same timestamp/date, prioritize Income first so balance credits before debiting
    if (a.isIncome !== b.isIncome) {
      return a.isIncome ? -1 : 1;
    }
    return 0;
  });

  let cumulativeBalance = 0;
  const transactionsWithRunningBalance = sortedAllTransactions.map((tx) => {
    if (tx.isIncome) {
      cumulativeBalance += tx.amount;
    } else {
      cumulativeBalance -= tx.amount;
    }
    return {
      ...tx,
      runningBalance: cumulativeBalance,
    };
  });

  // Get list of available unique months for dropdown (current month + past 24 months + any expense months)
  const availableMonthsMap = new Map<string, string>();
  const now = new Date();

  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    availableMonthsMap.set(key, label);
  }

  expenses.forEach((e) => {
    const dateObj = new Date(e.dateTimestamp);
    const key = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
    const label = dateObj.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    availableMonthsMap.set(key, label);
  });

  const monthOptions = Array.from(availableMonthsMap.entries()).sort(
    (a, b) => b[0].localeCompare(a[0]) // newest month first
  );

  // Filter transactions for selected month
  const monthTransactions = transactionsWithRunningBalance.filter((tx) => {
    const d = new Date(tx.dateTimestamp);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return key === selectedMonthKey;
  });

  // Reverse monthTransactions so newest transaction in the month is at top for viewing
  const displayTransactions = [...monthTransactions].reverse();

  // Monthly stats
  const totalMonthlyIncome = monthTransactions
    .filter((t) => t.isIncome)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalMonthlyExpense = monthTransactions
    .filter((t) => !t.isIncome)
    .reduce((sum, t) => sum + t.amount, 0);

    // Category Spending & Budget Calculations for Selected Month
  const monthExpenseMap: Record<string, number> = {};
  monthTransactions
    .filter((t) => !t.isIncome)
    .forEach((t) => {
      monthExpenseMap[t.category] = (monthExpenseMap[t.category] || 0) + t.amount;
    });

  const categoryStatuses = calculateCategoryStatuses(
    monthExpenseMap,
    budgetConfig.categoryBudgets || DEFAULT_CATEGORY_BUDGETS
  );

  const budgetAlerts = generateBudgetAlerts(categoryStatuses);

  // Total Monthly Category Allocation Cap
  const totalCategoryBudget = categoryStatuses.reduce((sum, st) => sum + st.budgetAmount, 0);
  const totalCategorySpent = totalMonthlyExpense;
  const overallRemainingBudget = Math.max(0, totalCategoryBudget - totalCategorySpent);
  const overallUsagePercent = totalCategoryBudget > 0 ? Math.round((totalCategorySpent / totalCategoryBudget) * 100) : 0;
  const overallColors = getBudgetColorClasses(overallUsagePercent);

  // Budget summary list for PDF export
  const budgetPdfItems: BudgetSummaryPdfItem[] = categoryStatuses.map((st) => ({
    category: st.categoryName,
    budget: st.budgetAmount,
    spent: st.spentAmount,
    remaining: st.remainingAmount,
    status: st.status,
  }));

  // Total balance overall across all history
  const overallTotalBalance = cumulativeBalance;

  // Selected Month Display Name
  const selectedMonthLabel =
    availableMonthsMap.get(selectedMonthKey) || 'Selected Month';

  // PDF Preview Modal State
  const [previewPdfState, setPreviewPdfState] = useState<{
    isOpen: boolean;
    pdfDoc: jsPDF | null;
    monthLabel: string;
    totalIncome: number;
    totalExpense: number;
    transactionCount: number;
  }>({
    isOpen: false,
    pdfDoc: null,
    monthLabel: '',
    totalIncome: 0,
    totalExpense: 0,
    transactionCount: 0,
  });

  // PDF Export Handler - Opens Preview Modal First
  const handleExportPdf = () => {
    const pdfItems: PdfTransactionItem[] = monthTransactions.map((t) => ({
      dateStr: new Date(t.dateTimestamp).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      title: t.title,
      type: t.isIncome ? 'Income' : 'Expense',
      amount: t.amount,
      runningBalance: t.runningBalance,
      category: t.category,
    }));

    const doc = buildMonthlyPdfDoc(
      selectedMonthLabel,
      totalMonthlyIncome,
      totalMonthlyExpense,
      totalMonthlyIncome - totalMonthlyExpense,
      pdfItems,
      undefined,
      userProfile,
      budgetPdfItems
    );

    setPreviewPdfState({
      isOpen: true,
      pdfDoc: doc,
      monthLabel: selectedMonthLabel,
      totalIncome: totalMonthlyIncome,
      totalExpense: totalMonthlyExpense,
      transactionCount: monthTransactions.length,
    });
  };

  return (
    <div className="space-y-4">
      {/* 1. Dynamic Top Dashboard with 3 Live Stats */}
      <div
        className={`rounded-2xl p-5 border transition-colors shadow-sm ${
          isDarkMode
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 mb-3">
          <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
            isDarkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>
            <Wallet className="w-4 h-4 text-emerald-500" />
            Current Balance
          </span>

          {/* Colorful Month Picker with Popup Calendar Grid & Arrows */}
          <div className="self-start xs:self-auto">
            <ColorfulMonthPicker
              selectedMonthKey={selectedMonthKey}
              onSelectMonthKey={(key) => setSelectedMonthKey(key)}
              availableMonthsMap={availableMonthsMap}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>

        {/* Large Total Overall Balance Number */}
        <div className="text-2xl xs:text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight flex items-baseline gap-2 flex-wrap">
          <span>₹{Math.round(overallTotalBalance).toLocaleString('en-IN')}</span>
          <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            (Overall)
          </span>
        </div>

        {/* 2 Live Stats: Income (+ Green) & Expense (- Red) */}
        <div className={`grid grid-cols-2 gap-2 sm:gap-3 pt-3.5 border-t ${
          isDarkMode ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div className={`rounded-xl p-2.5 sm:p-3 border ${
            isDarkMode
              ? 'bg-emerald-950/30 border-emerald-500/20'
              : 'bg-emerald-50/70 border-emerald-200'
          }`}>
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[10px] sm:text-[11px] font-bold uppercase mb-0.5 truncate">
              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              <span>Total Income</span>
            </div>
            <span className="text-sm sm:text-lg font-extrabold text-emerald-600 dark:text-emerald-400 block truncate">
              +₹{Math.round(totalMonthlyIncome).toLocaleString('en-IN')}
            </span>
          </div>

          <div className={`rounded-xl p-2.5 sm:p-3 border ${
            isDarkMode
              ? 'bg-red-950/30 border-red-500/20'
              : 'bg-red-50/70 border-red-200'
          }`}>
            <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-[10px] sm:text-[11px] font-bold uppercase mb-0.5 truncate">
              <TrendingDown className="w-3.5 h-3.5 shrink-0" />
              <span>Total Expense</span>
            </div>
            <span className="text-sm sm:text-lg font-extrabold text-red-600 dark:text-red-400 block truncate">
              -₹{Math.round(totalMonthlyExpense).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
        {/* Dedicated Toggle Button under Current Balance for Total Monthly Allocation */}
        <button
          type="button"
          onClick={() => setIsAllocationOpen((prev) => !prev)}
          className={`w-full mt-3.5 py-2.5 px-3.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all active:scale-[0.99] ${
            isAllocationOpen
              ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
              : isDarkMode
              ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 text-emerald-400'
              : 'bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200/80 text-emerald-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 shrink-0" />
            <span>Total Monthly Allocation</span>
          </div>
          <div className="flex items-center gap-1.5 font-extrabold">
            <span>₹{totalCategoryBudget.toLocaleString('en-IN')}</span>
            {isAllocationOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>
      </div>

      {/* 2. 1-Click PDF Report Export & Quick Action Bar */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={handleExportPdf}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95"
          title="Export Clean Statement PDF"
        >
          <Download className="w-4 h-4" />
          <span>Download {selectedMonthLabel.split(' ')[0]} PDF</span>
        </button>

        <button
          onClick={onOpenQuickAdd}
          className={`flex items-center justify-center gap-1.5 py-3 px-4 font-bold text-xs rounded-xl border transition-all active:scale-95 shrink-0 ${
            isDarkMode
              ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
          }`}
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Entry</span>
        </button>
      </div>
      <div className={`rounded-2xl border shadow-sm overflow-hidden ${ isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
        
        {/* 2B. OVERALL MONTHLY BUDGET & ALLOCATION SECTION (VISIBLE ONLY WHEN CLICKED) */}
      {isAllocationOpen && (
        <div
          className={`rounded-2xl border shadow-sm transition-all overflow-hidden p-4 space-y-4 animate-in slide-in-from-top-2 duration-200 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}
        >

      {/* Header Bar */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xs font-bold uppercase tracking-wider">Total Monthly Allocation Details</h3>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    ₹{totalCategoryBudget.toLocaleString('en-IN')}
                  </span>
              </div>
              <p className={`text-[11px] truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Spent ₹{totalCategorySpent.toLocaleString('en-IN')} • {selectedMonthLabel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
            onClick={onOpenBudgetSettings}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition-colors ${
                  isDarkMode
                    ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Edit Settings</span>
              </button>

              <button
                onClick={() => setIsAllocationOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
                title="Close Allocation View"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>
          
         {/* Overall Progress Stats */}
            <div className="grid grid-cols-3 gap-2 py-2 text-center border-y border-slate-200/20 dark:border-slate-800/80">
            <div>
            <span className={`text-[10px] font-bold uppercase block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Budget Limit
            </span>
            <span className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400">
              ₹{totalCategoryBudget.toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className={`text-[10px] font-bold uppercase block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Total Spent
            </span>
            <span className="text-sm sm:text-base font-extrabold text-red-600 dark:text-red-400">
              ₹{totalCategorySpent.toLocaleString('en-IN')}
            </span>
          </div>

          <div>
            <span className={`text-[10px] font-bold uppercase block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Remaining
            </span>
            <span className={`text-sm sm:text-base font-extrabold ${overallColors.text}`}>
              ₹{overallRemainingBudget.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>Overall Spending Progress</span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${overallColors.badge}`}>
              {overallUsagePercent}% • {overallColors.statusText}
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all duration-500 ${overallColors.bar}`}
              style={{ width: `${Math.min(100, overallUsagePercent)}%` }}
            />
          </div>
        </div>

        {/* Category Monthly Budgets Breakdown */}
            <div className="space-y-2.5 pt-2 border-t border-slate-200/20 dark:border-slate-800/80">
              <div className="flex items-center justify-between">
                <h4 className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Category Monthly Breakdown
                </h4>
                <button
                  onClick={onOpenBudgetSettings}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Configure Limits
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {categoryStatuses.map((st) => (
                  <div
                    key={st.catId}
                    className={`p-3 rounded-xl border ${
                      isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base shrink-0">{st.iconEmoji}</span>
                        <span className="text-xs font-bold truncate leading-tight">{st.categoryName}</span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold border ${st.statusColorClass}`}>
                        {st.usagePercent}%
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mb-1.5">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${st.barColorClass}`}
                        style={{ width: `${Math.min(100, st.usagePercent)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-medium">
                      <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
                        Spent: ₹{st.spentAmount.toLocaleString('en-IN')} / ₹{st.budgetAmount.toLocaleString('en-IN')}
                      </span>
                      <span className={st.usagePercent >= 100 ? 'text-red-500 font-bold' : isDarkMode ? 'text-slate-400' : 'text-slate-500'}>
                        {st.usagePercent >= 100 ? 'Exceeded' : `Remaining ₹${st.remainingAmount.toLocaleString('en-IN')}`}
                      </span>
                    </div>
                  </div>
                ))}

                {categoryStatuses.length === 0 && (
                  <div className="col-span-full py-4 text-center text-xs text-slate-500 border border-dashed rounded-xl">
                    No active category limits set.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      {/* 2C. CRITICAL / WARNING BUDGET ALERT BANNERS */}

      {budgetAlerts.length > 0 && (
        <div className="space-y-2">
          {budgetAlerts.map((alt) => (
            <div
              key={alt.id}
              className={`p-3.5 rounded-2xl border flex items-start gap-3 shadow-xs animate-in slide-in-from-top-1 duration-200 ${
                alt.type === 'exceeded'
                  ? 'bg-red-500/10 border-red-500/30 text-red-500'
                  : alt.type === 'critical'
                  ? 'bg-red-500/10 border-red-500/20 text-red-400'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-lg shrink-0">
                {alt.iconEmoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold leading-tight">{alt.title}</h4>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-black/20">
                    {alt.percent}%
                  </span>
                </div>
                <p className="text-xs mt-0.5 opacity-90 leading-snug">{alt.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SMS Bank Alerts Banner if any */}
      {unconfirmedSmsAlerts.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className={`text-xs font-bold flex items-center gap-1.5 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-700'
            }`}>
              <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
              Auto SMS Transaction Detected
            </span>
            <button
              onClick={onOpenSmsSimulator}
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Test SMS Parser
            </button>
          </div>

          {unconfirmedSmsAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-2xl p-3 border shadow-sm flex items-center justify-between gap-3 ${
                isDarkMode
                  ? 'bg-indigo-950/40 border-indigo-500/30'
                  : 'bg-indigo-50/80 border-indigo-200'
              }`}
            >
              <div className="space-y-0.5">
                <p className={`text-xs font-semibold ${isDarkMode ? 'text-indigo-200' : 'text-indigo-900'}`}>
                  Spent <strong>₹{alert.amount}</strong> at{' '}
                  <strong>{alert.merchant || 'Bank Transaction'}</strong>
                </p>
                <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{alert.category}</p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => onConfirmSmsAlert(alert, alert.category)}
                  className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  Confirm
                </button>
                <button
                  onClick={() => onDismissSmsAlert(alert)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Chronological Transactions History */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <h3
            className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-700'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-500" />
            <span>{selectedMonthLabel} History</span>
            <span className={`text-[11px] font-normal ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              ({displayTransactions.length} entries)
            </span>
          </h3>

          <button
            onClick={handleExportPdf}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF Report</span>
          </button>
        </div>

        {displayTransactions.length === 0 ? (
          <div
            className={`text-center py-12 rounded-2xl border p-6 ${
              isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <Calendar className={`w-10 h-10 mx-auto mb-2 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} />
            <p className={`text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              No transactions recorded in {selectedMonthLabel}.
            </p>
            <button
              onClick={onOpenQuickAdd}
              className="mt-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-500/20 transition-colors"
            >
              + Add First Entry for {selectedMonthLabel.split(' ')[0]}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {displayTransactions.map((tx) => {
              const categoryMatch = CATEGORIES.find(
                (c) => c.displayName.toLowerCase() === tx.category.toLowerCase()
              ) || CATEGORIES[7];

              const dateFormatted = new Date(tx.dateTimestamp).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div
                  key={tx.id}
                  className={`rounded-2xl p-3.5 border flex items-center justify-between gap-3 transition-colors shadow-xs group ${
                    isDarkMode
                      ? 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-100'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                  }`}
                >
                  <div
                    onClick={() => onEditExpense(tx)}
                    className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                    title="Click to edit transaction"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border ${categoryMatch.bgColor}`}
                    >
                      {categoryMatch.iconEmoji}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate group-hover:text-emerald-500 transition-colors">{tx.title}</p>
                      <p className={`text-[11px] truncate mt-0.5 ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        {dateFormatted} • {tx.category}
                      </p>
                    </div>
                  </div>

                  {/* Transaction Amount & Running Balance */}
                  <div className="text-right shrink-0 flex items-center gap-2">
                    <div onClick={() => onEditExpense(tx)} className="cursor-pointer text-right">
                      <div
                        className={`text-sm font-extrabold ${
                          tx.isIncome
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {tx.isIncome ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                      </div>
                      <div className={`text-[10px] font-semibold mt-0.5 ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        Bal: ₹{tx.runningBalance.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 pl-1">
                      <button
                        onClick={() => onEditExpense(tx)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isDarkMode
                            ? 'text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10'
                            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title="Edit Entry"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDeleteExpense(tx.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isDarkMode
                            ? 'text-slate-500 hover:text-red-400 hover:bg-red-500/10'
                            : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                        }`}
                        title="Delete Entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      </div>

{/* PDF Statement Preview Modal */}
<PdfPreviewModal
  isOpen={previewPdfState.isOpen}
  onClose={() =>
    setPreviewPdfState((prev) => ({
      ...prev,
      isOpen: false,
    }))
  }
  monthLabel={previewPdfState.monthLabel}
  pdfDoc={previewPdfState.pdfDoc}
  totalIncome={previewPdfState.totalIncome}
  totalExpense={previewPdfState.totalExpense}
  transactionCount={previewPdfState.transactionCount}
  userProfile={userProfile}
  isDarkMode={isDarkMode}
/>

</div>
);
};
