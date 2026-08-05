import React, { useState } from 'react';
import { X, Target, GraduationCap, Briefcase, Check, AlertCircle } from 'lucide-react';
import { BudgetConfig } from '../types';

interface BudgetSettingsModalProps {
  isOpen: boolean;
  currentConfig: BudgetConfig;
  onClose: () => void;
  onSave: (newConfig: BudgetConfig) => void;
  isDarkMode?: boolean;
  selectedMonthLabel?: string;
}

export const BudgetSettingsModal: React.FC<BudgetSettingsModalProps> = ({
  isOpen,
  currentConfig,
  onClose,
  onSave,
  isDarkMode = true,
  selectedMonthLabel,
}) => {
  const [income, setIncome] = useState(currentConfig.monthlyIncome ? currentConfig.monthlyIncome.toString() : '');
  const [role, setRole] = useState<'Student' | 'Working Professional'>(currentConfig.userRole);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const parsedIncome = parseFloat(income) || 0;
    if (parsedIncome < 0) {
      setValidationError('Monthly income cannot be negative.');
      return;
    }

    onSave({
      monthlyIncome: parsedIncome,
      monthlyBudget: 0,
      userRole: role,
      categoryBudgets: currentConfig.categoryBudgets || {},
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className={`w-full max-w-md max-h-[90vh] flex flex-col border rounded-2xl shadow-2xl animate-in zoom-in-95 duration-150 ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Modal Header */}
        <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
          isDarkMode ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Income & Profile Settings</h2>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {selectedMonthLabel ? `Configuring settings for ${selectedMonthLabel}` : 'Configure monthly income and profile'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors ${
              isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-4">
            {/* Persona selector */}
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Target Profile
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('Student')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    role === 'Student'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : isDarkMode
                      ? 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  Student
                </button>

                <button
                  type="button"
                  onClick={() => setRole('Working Professional')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    role === 'Working Professional'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : isDarkMode
                      ? 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  Working Pro
                </button>
              </div>
            </div>

            {/* Income input */}
            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {role === 'Student' ? 'Monthly Pocket Money / Allowance (₹)' : 'Monthly Net Salary / Income (₹)'}
              </label>
              <div className="relative">
                <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold ${
                  isDarkMode ? 'text-slate-500' : 'text-slate-400'
                }`}>₹</span>
                <input
                  type="number"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  placeholder="0"
                  className={`w-full border rounded-xl pl-8 pr-3.5 py-2.5 text-sm outline-none font-bold ${
                    isDarkMode
                      ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                  }`}
                />
              </div>
            </div>

            <div className={`p-3 rounded-xl border text-xs ${
              isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <p className="font-semibold text-emerald-500 mb-1">💡 Tip</p>
              Setting your monthly income helps track total savings and calculate monthly budget metrics accurately.
            </div>
          </div>

          {/* Footer Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-xs text-white bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-emerald-500/20 active:scale-[0.99]"
            >
              <Check className="w-4 h-4" />
              Save Profile & Income Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


