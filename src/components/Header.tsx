import logo from "../assets/images/Kripin.png";
import React from 'react';
import { Wallet, Settings, MessageSquareCode, User, Sun, Moon } from 'lucide-react';
import { BudgetConfig, UserProfile } from '../types';

interface HeaderProps {
  budgetConfig: BudgetConfig;
  userProfile: UserProfile;
  onOpenBudgetSettings: () => void;
  onOpenUserProfile: () => void;
  onOpenSmsSimulator: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenAbout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  budgetConfig,
  userProfile,
  onOpenBudgetSettings,
  onOpenUserProfile,
  onOpenSmsSimulator,
  isDarkMode,
  onToggleTheme,
  onOpenAbout,
}) => {
  return (
    <header
      className={`sticky top-0 z-30 backdrop-blur-md border-b px-2.5 sm:px-4 py-2.5 sm:py-3 transition-colors ${
        isDarkMode
          ? 'bg-slate-900/90 border-slate-800 text-slate-100'
          : 'bg-white/90 border-slate-200 text-slate-800'
      }`}
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 overflow-hidden">
        <div className="flex items-center gap-2 min-w-0 shrink-1">
  <button
    type="button"
    onClick={onOpenAbout}
    className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden border border-emerald-500/20 shrink-0 cursor-pointer"
  >
    <img
      src={logo}
      alt="Kripin Logo"
      className="w-full h-full object-cover"
    />
  </button>

  <div className="min-w-0">
    <div className="flex items-center gap-1.5 flex-wrap">
      <h1 className="text-xl font-bold">
        <span className="text-green-600">Kri</span>
        <span className="text-red-600">pin</span>
      </h1>

      <span className="hidden xs:inline-block px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md shrink-0">
        100% Offline
      </span>
    </div>

    <p
      className={`hidden xs:block text-[10px] sm:text-[11px] font-medium truncate ${
        isDarkMode ? 'text-slate-400' : 'text-slate-500'
      }`}
    >
      Date-wise Monthly Tracker
    </p>
  </div>
</div>
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Theme Toggle Button (Sun / Moon) */}
          <button
            onClick={onToggleTheme}
            className={`p-1.5 sm:p-2 rounded-xl border transition-colors ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>

          <button
            onClick={onOpenSmsSimulator}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold rounded-xl border transition-colors ${
              isDarkMode
                ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/20'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
            }`}
            title="Simulate SMS Bank Notification"
          >
            <MessageSquareCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SMS Parser</span>
            <span className="sm:hidden">SMS</span>
          </button>

          {/* Budget Settings Button */}
          <button
            onClick={onOpenBudgetSettings}
            className={`p-1.5 sm:p-2 rounded-xl border transition-colors ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
            }`}
            title="Budget Settings"
          >
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* User Profile Button with Photo */}
          <button
            onClick={onOpenUserProfile}
            className={`p-1 sm:p-1.5 pl-1.5 sm:pl-2 pr-1.5 sm:pr-2.5 rounded-xl border transition-all flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold active:scale-95 ${
              isDarkMode
                ? 'bg-slate-800/90 border-slate-700 text-slate-200 hover:text-white hover:bg-slate-700'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title="User Profile & Photo Settings"
          >
            {userProfile.avatarUrl ? (
              <img
                src={userProfile.avatarUrl}
                alt={userProfile.name}
                className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover ring-1 ring-emerald-500 shrink-0"
              />
            ) : (
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-[9px] sm:text-[10px] shrink-0">
                {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'J'}
              </div>
            )}
            <span className="hidden sm:inline max-w-[80px] truncate">{userProfile.name}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
