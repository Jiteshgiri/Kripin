import React, { useState } from 'react';
import { X, Target, GraduationCap, Briefcase, Check, RotateCcw, Sliders, AlertCircle, Trash2, Plus, Eraser, ChevronDown, ChevronUp } from 'lucide-react';
import { BudgetConfig, CATEGORIES, CategoryBudgets, DEFAULT_CATEGORY_BUDGETS } from '../types';
import { getEffectiveCategoryBudgets } from '../utils/budgetUtils';

interface BudgetSettingsModalProps {
  isOpen: boolean;
  currentConfig: BudgetConfig;
  onClose: () => void;
  onSave: (newConfig: BudgetConfig) => void;
  isDarkMode?: boolean;
  selectedMonthLabel?: string;
}

const EMOJI_OPTIONS = ['🎯', '🍔', '🛍️', '🚗', '💡', '🍿', '🏥', '📱', '🏠', '🎓', '🎮', '🐾', '🏋️', '🎁', '☕', '✈️'];

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
  
  // Category budgets state
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudgets>(() =>
    getEffectiveCategoryBudgets(currentConfig.categoryBudgets)
  );

  const [activeTab, setActiveTab] = useState<'general' | 'categories'>('categories');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Category List Collapsible State
  const [isCategoryListOpen, setIsCategoryListOpen] = useState(false);


  // Custom Category Creation State
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('🎯');
  const [newCatBudget, setNewCatBudget] = useState('');

  if (!isOpen) return null;

  const handleCategoryBudgetChange = (catName: string, valueStr: string) => {
    setValidationError(null);
    const num = parseFloat(valueStr);
    setCategoryBudgets((prev) => ({
      ...prev,
      [catName]: isNaN(num) ? 0 : num,
    }));
  };

  const calculateTotalCategoryBudget = () => {
    return Object.values(categoryBudgets).reduce((sum, val) => sum + (val > 0 ? val : 0), 0);
  };

   const handleDeleteCategory = (catName: string) => {
    setValidationError(null);
    setCategoryBudgets((prev) => {
      const next = { ...prev };
      delete next[catName];
      return next;
    });
  };

  const handleSetAllToZero = () => {
    setValidationError(null);
    setCategoryBudgets((prev) => {
      const reset: CategoryBudgets = {};
      Object.keys(prev).forEach((key) => {
        reset[key] = 0;
      });
      return reset;
    });
  };

  const handleResetDefaults = () => {
    setCategoryBudgets({ ...DEFAULT_CATEGORY_BUDGETS });
    setValidationError(null);
  };

  const handleAddCustomCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      setValidationError('Please enter a category name.');
      return;
    }

    const trimmedName = newCatName.trim();
    if (categoryBudgets[trimmedName] !== undefined) {
      setValidationError('A category with this name already exists.');
      return;
    }

    const initialBudget = parseFloat(newCatBudget) || 0;

    setCategoryBudgets((prev) => ({
      ...prev,
      [trimmedName]: initialBudget,
    }));

    setNewCatName('');
    setNewCatBudget('');
    setIsAddingCategory(false);
    setValidationError(null);
  };

  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const parsedIncome = parseFloat(income) || 0;
    
    // Validate category budgets
    let hasInvalid = false;
    Object.entries(categoryBudgets).forEach(([catName, val]) => {
      if (val < 0) {
        setValidationError(`Budget for ${catName} cannot be negative.`);
        hasInvalid = true;
      } else if (val > 1000000) {
        setValidationError(`Budget for ${catName} cannot exceed ₹10,00,000.`);
        hasInvalid = true;
      }
    });

    if (hasInvalid) return;

    const totalCatBudget = calculateTotalCategoryBudget();

    

    onSave({
      monthlyIncome: parsedIncome,
      monthlyBudget: totalCatBudget,
      userRole: role,
      categoryBudgets: categoryBudgets,
    });
    onClose();
  };

  const totalCatBudget = calculateTotalCategoryBudget();            

  // Active Category List for inputs
  const activeCategoryList = Object.keys(categoryBudgets).map((catName) => {
    const builtin = CATEGORIES.find((c) => c.displayName === catName || c.id === catName);
    return {
      name: catName,
      emoji: builtin ? builtin.iconEmoji : '🎯',
      budget: categoryBudgets[catName] ?? 0,
    };
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className={`w-full max-w-lg max-h-[90vh] flex flex-col border rounded-2xl shadow-2xl animate-in zoom-in-95 duration-150 ${
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
              <h2 className="text-base font-bold">Monthly Budget Settings</h2>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {selectedMonthLabel ? `Configuring limits for ${selectedMonthLabel}` : 'Set category-wise spending limits'}
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

        {/* Tab Switcher */}
        <div className={`flex border-b px-4 pt-2 gap-2 shrink-0 ${isDarkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50/50'}`}>
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'categories'
                ? 'border-emerald-500 text-emerald-500'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Category Budgets (₹{totalCatBudget.toLocaleString('en-IN')})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'general'
                ? 'border-emerald-500 text-emerald-500'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            Income & Profile
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
          {activeTab === 'categories' && (
            <div className="space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                    Category Spending Limits
                  </h3>
                  <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Add, edit, or delete category limits as per your preference.
                  </p>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleSetAllToZero}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                    title="Set all category limits to ₹0"
                  >
                    <Eraser className="w-3 h-3 text-amber-500" />
                    <span>Set All to ₹0</span>
                  </button>
                <button
                    type="button"
                    onClick={handleResetDefaults}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                    title="Restore standard category list"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Total Monthly Allocation Card Header with Dedicated Button */}
              <div className={`p-4 rounded-2xl border space-y-3 transition-colors ${
                isDarkMode ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50/70 border-emerald-200'
              }`}>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                      Total Monthly Allocation
                    </span>
                    <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      ₹{totalCatBudget.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCategoryListOpen((prev) => !prev)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                  >
                    <span>{isCategoryListOpen ? 'Hide Limits Editor' : 'Open Limits Editor'}</span>
                    {isCategoryListOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {!isCategoryListOpen && (
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Click "Open Limits Editor" above to configure, edit, add, or delete individual category limits ({activeCategoryList.length} categories active).
                  </p>
                )}
              </div>

              {/* Collapsible Category Limits Editor Section */}
              {isCategoryListOpen && (
                <div className="space-y-3.5 pt-1 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                        Category Limits Editor
                      </h4>
                      <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Configure individual expense limits or add custom categories.
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleSetAllToZero}
                        className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                          isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                        }`}
                        title="Set all category limits to ₹0"
                      >
                        <Eraser className="w-3 h-3 text-amber-500" />
                        <span>Set All to ₹0</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleResetDefaults}
                        className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                          isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                        }`}
                        title="Restore standard category list"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset</span>
                      </button>
                    </div>
                  </div>

               {/* Add Custom Category Toggle/Form */}
              {!isAddingCategory ? (
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(true)}
                  className="w-full py-2.5 rounded-xl border border-dashed border-emerald-500/40 hover:border-emerald-500 text-emerald-500 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors bg-emerald-500/5 hover:bg-emerald-500/10"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Custom Category</span>
                </button>
              ) : (
                <div className={`p-3.5 rounded-2xl border space-y-3 ${
                  isDarkMode ? 'bg-slate-950 border-emerald-500/40' : 'bg-emerald-50/50 border-emerald-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" />
                      New Custom Category
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingCategory(false)}
                      className="text-slate-400 hover:text-white text-xs font-bold"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Emoji Icon</label>
                      <select
                        value={newCatEmoji}
                        onChange={(e) => setNewCatEmoji(e.target.value)}
                        className={`w-full p-2 text-sm rounded-lg border outline-none font-bold ${
                          isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      >
                        {EMOJI_OPTIONS.map((em) => (
                          <option key={em} value={em}>
                            {em}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Category Name</label>
                      <input
                        type="text"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        placeholder="e.g. Gym, Subscriptions, Pets"
                        className={`w-full p-2 text-xs rounded-lg border outline-none font-semibold ${
                          isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Monthly Budget (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={newCatBudget}
                      onChange={(e) => setNewCatBudget(e.target.value)}
                      placeholder="0"
                      className={`w-full p-2 text-xs rounded-lg border outline-none font-bold ${
                        isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddCustomCategory}
                    className="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition-colors"
                  >
                    Save Category
                  </button>
                </div>
              )}

              {/* Category Budget Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activeCategoryList.map((cat) => {
                  return (
                    <div
                      key={cat.name}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-colors ${
                        isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-base shrink-0">{cat.emoji}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold truncate leading-tight">{cat.name}</p>
                          <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                            Limit: ₹{cat.budget.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="relative w-24">
                          <span className={`absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold ${
                            isDarkMode ? 'text-slate-500' : 'text-slate-400'
                          }`}>
                            ₹
                          </span>
                          <input
                            type="number"
                            min="0"
                            max="1000000"
                            value={cat.budget === 0 ? '' : cat.budget}
                            onChange={(e) => handleCategoryBudgetChange(cat.name, e.target.value)}
                            placeholder="0"
                            className={`w-full pl-5 pr-2 py-1.5 text-xs font-bold rounded-lg border outline-none text-right ${
                              isDarkMode
                                ? 'bg-slate-900 border-slate-700 text-white focus:border-emerald-500'
                                : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500'
                            }`}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          title={`Delete ${cat.name} category from budget`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {activeCategoryList.length === 0 && (
                  <div className="col-span-2 py-8 text-center text-xs text-slate-500 border border-dashed rounded-xl">
                    No categories in your budget. Click "+ Add Custom Category" or "Reset" to add categories!
                  </div>
                )}
              </div>
              </div>
              )}
            </div>
          )}

          {activeTab === 'general' && (
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
                Setting category spending limits automatically updates your total monthly budget cap to ₹{totalCatBudget.toLocaleString('en-IN')}.
              </div>
            </div>
          )}

          {/* Footer Submit Action */}
          <div className="pt-2">

          <button
            type="submit"
            className="w-full py-3 rounded-xl font-bold text-xs text-white bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-emerald-500/20 active:scale-[0.99]"
            >
              <Check className="w-4 h-4" />
              Save Monthly Budget Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
