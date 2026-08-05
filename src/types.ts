export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  dateTimestamp: number;
  isIncome: boolean;
  merchant: string;
  paymentMode: string;
  isAutoDebited?: boolean;
}

export interface RecurringBill {
  id: string;
  title: string;
  amount: number;
  category: string;
  dueDayOfMonth: number;
  isPaidThisMonth: boolean;
}

export type CategoryBudgets = Record<string, number>;

export const DEFAULT_CATEGORY_BUDGETS: CategoryBudgets = {
  'Food & Dining': 0,
  'Shopping': 0,
  'Travel & Commute': 0,
  'Bills & Utilities': 0,
  'Entertainment': 0,
  'Medical & Health': 0,
  'Recharge & Mobile': 0,
  'Rent & Stay': 0,
  'Other': 0,
};

export interface BudgetConfig {
  monthlyIncome: number;
  monthlyBudget: number;
  userRole: 'Student' | 'Working Professional';

  // Category-wise Monthly Budget
  categoryBudgets: CategoryBudgets;
}

export interface UserProfile {
  name: string;
  mobile: string;
  occupation: string;
  userId: string;
  avatarUrl?: string;
}

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Jitesh',
  mobile: '+91 9876543210',
  occupation: 'Job Person / Working Professional',
  userId: 'JT-2026-8849',
  avatarUrl: '',
};

export interface SmsAlert {
  id: string;
  rawText: string;
  amount: number;
  merchant: string;
  isIncome: boolean;
  category: string;
  timestamp: number;
}

export interface CategoryOption {
  id: string;
  displayName: string;
  iconEmoji: string;
  colorHex: string;
  bgColor: string;
}

export const CATEGORIES: CategoryOption[] = [
  { id: 'food', displayName: 'Food & Dining', iconEmoji: '🍔', colorHex: '#EF4444', bgColor: 'bg-red-500/10 text-red-400 border-red-500/20' },
  { id: 'shopping', displayName: 'Shopping', iconEmoji: '🛍️', colorHex: '#A855F7', bgColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { id: 'travel', displayName: 'Travel & Commute', iconEmoji: '🚗', colorHex: '#F59E0B', bgColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { id: 'bills', displayName: 'Bills & Utilities', iconEmoji: '💡', colorHex: '#10B981', bgColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { id: 'entertainment', displayName: 'Entertainment', iconEmoji: '🍿', colorHex: '#EC4899', bgColor: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
  { id: 'medical', displayName: 'Medical & Health', iconEmoji: '🏥', colorHex: '#06B6D4', bgColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  { id: 'recharge', displayName: 'Recharge & Mobile', iconEmoji: '📱', colorHex: '#8B5CF6', bgColor: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  { id: 'rent', displayName: 'Rent & Stay', iconEmoji: '🏠', colorHex: '#3B82F6', bgColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { id: 'income', displayName: 'Salary / Allowance', iconEmoji: '💰', colorHex: '#22C55E', bgColor: 'bg-green-500/10 text-green-400 border-green-500/20' },
  { id: 'other', displayName: 'Other', iconEmoji: '📦', colorHex: '#64748B', bgColor: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
];
