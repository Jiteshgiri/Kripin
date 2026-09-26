import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Zap,
  Calendar,
  Trash2,
  AlertTriangle,
  Utensils,
  ShoppingBag,
  Car,
  Lightbulb,
  Clapperboard,
  Hospital,
  Smartphone,
  House,
  Package,
} from 'lucide-react';
import { CATEGORIES, CategoryOption, Expense } from '../types';

interface QuickAddModalProps {
  isOpen: boolean;
  editingExpense?: Expense | null;
  onClose: () => void;
  onSave: (amount: number, title: string, category: string, isIncome: boolean, dateTimestamp: number) => void;
  onDelete?: (id: string) => void;
  isDarkMode?: boolean;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  editingExpense,
  onClose,
  onSave,
  onDelete,
  isDarkMode = true,
}) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isIncome, setIsIncome] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption>(CATEGORIES[0]);
  const [dateStr, setDateStr] = useState(() => new Date().toISOString().slice(0, 10));
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setShowDeleteConfirm(false);
    if (editingExpense) {
      setAmount(editingExpense.amount.toString());
      setNote(editingExpense.title);
      setIsIncome(editingExpense.isIncome);

      const categoryMatch = CATEGORIES.find(
        (c) => c.displayName.toLowerCase() === editingExpense.category.toLowerCase()
      ) || CATEGORIES[0];
      setSelectedCategory(categoryMatch);

      const d = new Date(editingExpense.dateTimestamp);
      setDateStr(d.toISOString().slice(0, 10));
    } else {
      setAmount('');
      setNote('');
      setIsIncome(false);
      setSelectedCategory(CATEGORIES[0]);
      setDateStr(new Date().toISOString().slice(0, 10));
    }
  }, [editingExpense, isOpen]);

  if (!isOpen) return null;
  const categoryIcons = {
  food: Utensils,
  shopping: ShoppingBag,
  travel: Car,
  bills: Lightbulb,
  entertainment: Clapperboard,
  medical: Hospital,
  recharge: Smartphone,
  rent: House,
  other: Package,
};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!isNaN(parsedAmount) && parsedAmount > 0) {
      const [year, month, day] = dateStr.split('-').map(Number);
      const selectedDate = new Date(year, month - 1, day, 12, 0, 0);

      onSave(
        parsedAmount,
        note.trim() || (isIncome ? 'Income' : selectedCategory.displayName),
        isIncome ? 'Salary / Allowance' : selectedCategory.displayName,
        isIncome,
        selectedDate.getTime()
      );
      onClose();
    }
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      if (editingExpense && onDelete) {
        onDelete(editingExpense.id);
        setShowDeleteConfirm(false);
        onClose();
      }
    } else {
      setShowDeleteConfirm(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className={`w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-4 sm:p-5 border shadow-2xl animate-in slide-in-from-bottom duration-200 ${
          isDarkMode
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Zap className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold">{editingExpense ? 'Edit Transaction' : 'Add Transaction'}</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors ${
              isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Income / Expense Type Toggle */}
          <div className={`grid grid-cols-2 gap-2 p-1 rounded-xl border ${
            isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => {
                setIsIncome(false);
                if (selectedCategory.id === 'income') {
                  setSelectedCategory(CATEGORIES[0]);
                }
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-bold text-xs transition-all ${
                !isIncome
                  ? 'bg-red-500 text-white shadow-md'
                  : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              Expense (-)
            </button>
            <button
              type="button"
              onClick={() => {
                setIsIncome(true);
                setSelectedCategory(CATEGORIES.find((c) => c.id === 'income') || CATEGORIES[5]);
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-bold text-xs transition-all ${
                isIncome
                  ? 'bg-emerald-500 text-white shadow-md'
                  : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Income (+)
            </button>
          </div>

          {/* Amount Input */}
          <div className="relative">
            <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-extrabold ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              ₹
            </span>
            <input
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              autoFocus
              className={`w-full border-2 rounded-xl pl-10 pr-4 py-3 text-3xl font-extrabold outline-none transition-colors ${
                isDarkMode ? 'bg-slate-950' : 'bg-slate-50'
              } ${
                isIncome
                  ? 'border-emerald-500/40 text-emerald-500 focus:border-emerald-500'
                  : 'border-red-500/40 text-red-500 focus:border-red-500'
              }`}
            />
          </div>

          {/* Date Selector Field with Colorful Shortcuts */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={`text-xs font-bold flex items-center gap-1.5 ${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                <span>Transaction Date</span>
              </label>

              {/* Quick Date Pills */}
              <div className="flex items-center gap-1">
                {(() => {
                  const now = new Date();
                  const format = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                  
                  const todayStr = format(now);
                  
                  const yest = new Date(now);
                  yest.setDate(yest.getDate() - 1);
                  const yestStr = format(yest);

                  const isToday = dateStr === todayStr;
                  const isYest = dateStr === yestStr;

                  return (
                    <>
                      <button
                        type="button"
                        onClick={() => setDateStr(todayStr)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold transition-all ${
                          isToday
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : isDarkMode
                            ? 'bg-slate-800 text-slate-400 hover:text-white'
                            : 'bg-slate-200 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={() => setDateStr(yestStr)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold transition-all ${
                          isYest
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : isDarkMode
                            ? 'bg-slate-800 text-slate-400 hover:text-white'
                            : 'bg-slate-200 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Yesterday
                      </button>
                    </>
                  );
                })()}
              </div>
            </div>

            <input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className={`w-full border rounded-xl px-3.5 py-2 text-xs font-bold outline-none transition-colors ${
                isDarkMode
                  ? 'bg-slate-950 border-slate-700 text-white focus:border-emerald-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
              }`}
            />
          </div>

          {/* Title / Description */}
          <div>
            <label className={`block text-xs font-semibold mb-1 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Detail / Title (e.g. Tea, Salary, Rent, Swiggy)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={isIncome ? 'e.g. Salary / Freelance / Gift' : 'e.g. Tea / Dinner / Fuel'}
              className={`w-full border rounded-xl px-3.5 py-2.5 text-xs outline-none ${
                isDarkMode
                  ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-slate-600'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-400'
              }`}
            />
          </div>

          {/* Category Selector Grid */}
          {!isIncome && (
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Category
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {CATEGORIES.filter((c) => c.id !== 'income').map((cat) => {
                  const isSelected = selectedCategory.id === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                        isSelected
                          ? isDarkMode
                            ? 'bg-slate-800 border-slate-500 text-white ring-2 ring-emerald-500/50 scale-105'
                            : 'bg-slate-100 border-slate-400 text-slate-900 ring-2 ring-emerald-500/50 scale-105'
                          : isDarkMode
                          ? 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {(() => {
                        const Icon = categoryIcons[cat.id as keyof typeof categoryIcons];
                        return Icon ? (
                        <Icon className="w-6 h-6 mb-0.5" />
                      ) : null;
                      })()}
                      <span className="text-[10px] font-semibold truncate w-full text-center">
                        {cat.displayName.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons: Save & Delete with Safety Confirmation */}
          {showDeleteConfirm ? (
            <div className={`p-3.5 rounded-xl border space-y-2.5 ${
              isDarkMode ? 'bg-red-950/40 border-red-500/30 text-red-200' : 'bg-red-50 border-red-200 text-red-900'
            }`}>
              <div className="flex items-center gap-2 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <span>Delete this transaction?</span>
              </div>
              <p className={`text-[11px] ${isDarkMode ? 'text-red-300/80' : 'text-red-700'}`}>
                This action cannot be undone and will recalculate your running balance.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className={`flex-1 py-2 rounded-lg font-bold text-xs ${
                    isDarkMode
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 py-2 rounded-lg font-bold text-xs bg-red-600 hover:bg-red-500 text-white shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Confirm Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 pt-1">
              {editingExpense && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-3.5 rounded-xl font-bold text-xs bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 flex items-center justify-center gap-1.5 transition-colors"
                  title="Delete this entry"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}

              <button
                type="submit"
                disabled={!amount || parseFloat(amount) <= 0}
                className={`flex-1 py-3.5 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 transition-all ${
                  !amount || parseFloat(amount) <= 0
                    ? isDarkMode
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : isIncome
                    ? 'bg-emerald-500 hover:bg-emerald-400 shadow-md'
                    : 'bg-red-500 hover:bg-red-400 shadow-md'
                }`}
              >
                <Check className="w-4 h-4" />
                {editingExpense ? 'Update Entry' : 'Save Entry'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
