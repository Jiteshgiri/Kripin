import { CATEGORIES, CategoryBudgets, DEFAULT_CATEGORY_BUDGETS } from '../types';

export interface CategoryBudgetStatus {
  categoryName: string;
  catId: string;
  iconEmoji: string;
  colorHex: string;
  bgColor: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  usagePercent: number;
  status: 'Safe' | 'Warning' | 'Critical' | 'Exceeded';
  statusColorClass: string;
  barColorClass: string;
}

export interface BudgetAlertItem {
  id: string;
  categoryName: string;
  iconEmoji: string;
  type: 'warning' | 'critical' | 'exceeded';
  title: string;
  message: string;
  percent: number;
  exceededAmount?: number;
  remainingAmount?: number;
}

/**
 * Returns effective category budgets without overriding 0 values
 */
export function getEffectiveCategoryBudgets(customBudgets?: CategoryBudgets): CategoryBudgets {
  if (customBudgets !== undefined && customBudgets !== null) {
    return { ...customBudgets };
  }
  return { ...DEFAULT_CATEGORY_BUDGETS };
}

/**
 * Progress Bar Color logic based on usage percentage:
 * 0% - 60%: Safe (Emerald Green)
 * 60% - 90%: Warning (Yellow/Amber)
 * Above 90%: Critical/Exceeded (Red)
 */
export function getBudgetColorClasses(percent: number) {
  if (percent >= 100) {
    return {
      bar: 'bg-red-500',
      text: 'text-red-500 dark:text-red-400',
      bgLight: 'bg-red-500/10',
      border: 'border-red-500/30',
      badge: 'bg-red-500/10 text-red-500 border-red-500/20',
      statusText: 'Exceeded',
    };
  }
  if (percent >= 90) {
    return {
      bar: 'bg-red-500',
      text: 'text-red-500 dark:text-red-400',
      bgLight: 'bg-red-500/10',
      border: 'border-red-500/30',
      badge: 'bg-red-500/10 text-red-500 border-red-500/20',
      statusText: 'Critical',
    };
  }
  if (percent >= 60) {
    return {
      bar: 'bg-amber-500',
      text: 'text-amber-500 dark:text-amber-400',
      bgLight: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      statusText: 'Warning',
    };
  }
  return {
    bar: 'bg-emerald-500',
    text: 'text-emerald-500 dark:text-emerald-400',
    bgLight: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    statusText: 'Safe',
  };
}

/**
 * Calculates category-wise budget progress and status objects
 */
export function calculateCategoryStatuses(
  expenseMap: Record<string, number>,
  categoryBudgets: CategoryBudgets
): CategoryBudgetStatus[] {
  const effectiveBudgets = getEffectiveCategoryBudgets(categoryBudgets);

  // Combine categories defined in effectiveBudgets and non-zero expenses in expenseMap
  const allCategoryNames = Array.from(
    new Set([...Object.keys(effectiveBudgets), ...Object.keys(expenseMap)])
  ).filter((catName) => catName !== 'Salary / Allowance' && catName !== 'Income');

  return allCategoryNames.map((catName) => {
    const builtinCat = CATEGORIES.find((c) => c.displayName === catName || c.id === catName);
    const budgetAmount = typeof effectiveBudgets[catName] === 'number' ? effectiveBudgets[catName] : 0;
    const spentAmount = expenseMap[catName] || 0;
    const remainingAmount = Math.max(0, budgetAmount - spentAmount);

    let usagePercent = 0;
    if (budgetAmount > 0) {
      usagePercent = Math.round((spentAmount / budgetAmount) * 100);
    } else if (spentAmount > 0) {
      usagePercent = 100; // Budget was 0 but spent > 0 => 100% exceeded
    }

    const colors = getBudgetColorClasses(usagePercent);

    return {
      categoryName: catName,
      catId: builtinCat ? builtinCat.id : catName.toLowerCase().replace(/\s+/g, '-'),
      iconEmoji: builtinCat ? builtinCat.iconEmoji : '🎯',
      colorHex: builtinCat ? builtinCat.colorHex : '#10B981',
      bgColor: builtinCat ? builtinCat.bgColor : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      budgetAmount,
      spentAmount,
      remainingAmount,
      usagePercent,
      status: colors.statusText as 'Safe' | 'Warning' | 'Critical' | 'Exceeded',
      statusColorClass: colors.badge,
      barColorClass: colors.bar,
    };
  });
}

/**
 * Generates warning alerts for categories hitting 80%, 90%, and >= 100% threshold
 */
export function generateBudgetAlerts(
  statuses: CategoryBudgetStatus[]
): BudgetAlertItem[] {
  const alerts: BudgetAlertItem[] = [];

  statuses.forEach((st) => {
    if (st.usagePercent >= 100) {
      const exceededAmt = st.spentAmount - st.budgetAmount;
      alerts.push({
        id: `alert-exceeded-${st.catId}`,
        categoryName: st.categoryName,
        iconEmoji: st.iconEmoji,
        type: 'exceeded',
        title: '❌ Budget Exceeded',
        message: `${st.categoryName} budget exceeded by ₹${exceededAmt.toLocaleString('en-IN')}`,
        percent: st.usagePercent,
        exceededAmount: exceededAmt,
      });
    } else if (st.usagePercent >= 90) {
      alerts.push({
        id: `alert-critical-${st.catId}`,
        categoryName: st.categoryName,
        iconEmoji: st.iconEmoji,
        type: 'critical',
        title: '⚠️ Critical Budget Level',
        message: `Only ₹${st.remainingAmount.toLocaleString('en-IN')} remaining in ${st.categoryName} Budget (${st.usagePercent}% used).`,
        percent: st.usagePercent,
        remainingAmount: st.remainingAmount,
      });
    } else if (st.usagePercent >= 80) {
      alerts.push({
        id: `alert-warning-${st.catId}`,
        categoryName: st.categoryName,
        iconEmoji: st.iconEmoji,
        type: 'warning',
        title: '⚠️ Budget Warning',
        message: `You have used ${st.usagePercent}% of your ${st.categoryName} budget.`,
        percent: st.usagePercent,
      });
    }
  });

  return alerts;
}
