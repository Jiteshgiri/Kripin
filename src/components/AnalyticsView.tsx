import React, { useState } from 'react';
import { PieChart, Download, Lightbulb, Sparkles } from 'lucide-react';
import jsPDF from 'jspdf';
import { Expense, CATEGORIES, UserProfile, BudgetConfig } from '../types';
import { buildMonthlyPdfDoc, PdfTransactionItem } from '../utils/pdfGenerator';
import { ColorfulMonthPicker } from './ColorfulMonthPicker';
import { PdfPreviewModal } from './PdfPreviewModal';

interface AnalyticsViewProps {
  expenses: Expense[];
  monthlyBudget?: number;
  budgetConfig?: BudgetConfig;
  userProfile?: UserProfile;
  isDarkMode?: boolean;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  expenses,
  budgetConfig,
  userProfile,
  isDarkMode = true,
}) => {
  // Selected Month State (Default to current month YYYY-MM)
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonthKey, setSelectedMonthKey] = useState(currentMonthKey);

  // Generate available months map
  const availableMonthsMap = new Map<string, string>();
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
  const monthOptions = Array.from(availableMonthsMap.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  const selectedMonthLabel = availableMonthsMap.get(selectedMonthKey) || 'Selected Month';

  // Filter expenses for selected month
  const monthExpenses = expenses.filter((e) => {
    const d = new Date(e.dateTimestamp);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === selectedMonthKey;
  });

  const expenseList = monthExpenses.filter((e) => !e.isIncome);
  const totalSpent = expenseList.reduce((sum, e) => sum + e.amount, 0);

  // Group by category
  const categoryMap: { [cat: string]: number } = {};
  expenseList.forEach((e) => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  });

  const sortedCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCategories[0];

  // Calculation for SVG Donut (Ring) Chart
  const radius = 40;
  const circumference = 2 * Math.PI * radius; // ~251.327

  let accumulatedPercent = 0;
  const ringSegments = sortedCategories.map(([catName, amount]) => {
    const catMatch = CATEGORIES.find((c) => c.displayName === catName) || CATEGORIES[7];
    const pct = totalSpent > 0 ? amount / totalSpent : 0;
    const strokeDasharray = `${pct * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += pct;

    return {
      catName,
      amount,
      pct: Math.round(pct * 100),
      color: catMatch.colorHex,
      icon: catMatch.iconEmoji,
      strokeDasharray,
      strokeDashoffset,
    };
  });

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

  const handleDownloadPdf = () => {
    // Sort selected month expenses chronologically
    const sortedAll = [...monthExpenses].sort((a, b) => {
      if (a.dateTimestamp !== b.dateTimestamp) {
        return a.dateTimestamp - b.dateTimestamp;
      }
      if (a.isIncome !== b.isIncome) {
        return a.isIncome ? -1 : 1;
      }
      return 0;
    });

    let running = 0;
    const totalInc = monthExpenses.filter((e) => e.isIncome).reduce((sum, e) => sum + e.amount, 0);
    const totalExp = monthExpenses.filter((e) => !e.isIncome).reduce((sum, e) => sum + e.amount, 0);

    const pdfTxs: PdfTransactionItem[] = sortedAll.map((tx) => {
      if (tx.isIncome) {
        running += tx.amount;
      } else {
        running -= tx.amount;
      }
      return {
        dateStr: new Date(tx.dateTimestamp).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        title: tx.title,
        type: tx.isIncome ? 'Income' : 'Expense',
        amount: tx.amount,
        runningBalance: running,
        category: tx.category,
      };
    });

    const categorySummary = ringSegments.map((seg) => ({
      category: seg.catName,
      amount: seg.amount,
      percentage: seg.pct,
    }));

    const doc = buildMonthlyPdfDoc(
  selectedMonthLabel,
  totalInc,
  totalExp,
  totalInc - totalExp,
  pdfTxs,
  categorySummary,
  userProfile
);

    setPreviewPdfState({
      isOpen: true,
      pdfDoc: doc,
      monthLabel: selectedMonthLabel,
      totalIncome: totalInc,
      totalExpense: totalExp,
      transactionCount: monthExpenses.length,
    });
  };

  return (
    <div className="space-y-4">
      {/* Header, Month Selector & 1-Click PDF Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-emerald-500" />
          <h2 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Category Analytics
          </h2>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          {/* Colorful Month Picker */}
          <ColorfulMonthPicker
            selectedMonthKey={selectedMonthKey}
            onSelectMonthKey={(key) => setSelectedMonthKey(key)}
            availableMonthsMap={availableMonthsMap}
            isDarkMode={isDarkMode}
          />

          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 shrink-0"
            title="Download Historical PDF Transaction Report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download {selectedMonthLabel.split(' ')[0]} PDF</span>
          </button>
        </div>
      </div>

      {/* 1-Line Smart Insight Badge */}
      {topCategory && totalSpent > 0 ? (
        <div className={`rounded-xl p-3 border flex items-center gap-2.5 text-xs font-semibold ${
          isDarkMode
            ? 'bg-slate-900 border-emerald-500/30 text-emerald-300'
            : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
        }`}>
          <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-500 shrink-0">
            <Lightbulb className="w-4 h-4" />
          </div>
          <span className="truncate">
            <strong>Top Expense:</strong> {topCategory[0]} (₹{Math.round(topCategory[1]).toLocaleString()} • {Math.round((topCategory[1] / totalSpent) * 100)}% of total)
          </span>
        </div>
      ) : (
        <div className={`rounded-xl p-3 border text-xs text-center ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
        }`}>
          <span>💡 Add expenses to view instant category insights.</span>
        </div>
      )}

      {/* Modern Donut (Ring) Chart Section */}
      <div className={`rounded-2xl p-5 border shadow-xs flex flex-col items-center justify-center ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${
          isDarkMode ? 'text-slate-400' : 'text-slate-500'
        }`}>
          Spending Breakdown Ring
        </h3>

        {totalSpent === 0 ? (
          <div className="text-center py-8">
            <div className="w-24 h-24 rounded-full border-4 border-dashed border-slate-300 dark:border-slate-800 flex items-center justify-center mx-auto mb-2 text-slate-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-400">No expense transactions recorded yet.</p>
          </div>
        ) : (
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 transform">
              {/* Background ring */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className={isDarkMode ? 'stroke-slate-800' : 'stroke-slate-100'}
                strokeWidth="12"
                fill="none"
              />

              {/* Category Ring Segments */}
              {ringSegments.map((seg, idx) => (
                <circle
                  key={idx}
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke={seg.color}
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              ))}
            </svg>

            {/* Donut Center Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Total Spent
              </span>
              <span className={`text-base font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                ₹{Math.round(totalSpent).toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Category Progress Bars List */}
      <div className={`rounded-2xl p-4 border shadow-xs space-y-3 ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <h3 className={`text-xs font-bold uppercase tracking-wider ${
          isDarkMode ? 'text-slate-300' : 'text-slate-700'
        }`}>
          Category Progress
        </h3>

        {sortedCategories.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No categories recorded.</p>
        ) : (
          <div className="space-y-3">
            {ringSegments.map((seg) => (
              <div key={seg.catName} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{seg.icon}</span>
                    <span className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                      {seg.catName}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      ₹{Math.round(seg.amount).toLocaleString()}
                    </span>
                    <span className={`text-[11px] ml-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      ({seg.pct}%)
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className={`w-full rounded-full h-2 overflow-hidden border p-0.5 ${
                  isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${seg.pct}%`,
                      backgroundColor: seg.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PDF Statement Preview Modal */}
      <PdfPreviewModal
        isOpen={previewPdfState.isOpen}
        onClose={() => setPreviewPdfState((prev) => ({ ...prev, isOpen: false }))}
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
