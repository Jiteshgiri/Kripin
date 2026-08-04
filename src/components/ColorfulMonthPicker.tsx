import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Sparkles, Check, Clock, X } from 'lucide-react';

interface ColorfulMonthPickerProps {
  selectedMonthKey: string; // YYYY-MM
  onSelectMonthKey: (key: string) => void;
  availableMonthsMap?: Map<string, string>;
  isDarkMode?: boolean;
}

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const MONTH_NAMES_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const ColorfulMonthPicker: React.FC<ColorfulMonthPickerProps> = ({
  selectedMonthKey,
  onSelectMonthKey,
  availableMonthsMap,
  isDarkMode = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse YYYY-MM
  const [yearStr, monthStr] = selectedMonthKey.split('-');
  const selectedYear = parseInt(yearStr, 10) || new Date().getFullYear();
  const selectedMonthNum = parseInt(monthStr, 10) || (new Date().getMonth() + 1); // 1-indexed

  // Internal year state for the picker grid
  const [pickerYear, setPickerYear] = useState(selectedYear);

  // Synchronize pickerYear when selectedMonthKey changes
  useEffect(() => {
    setPickerYear(selectedYear);
  }, [selectedYear]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const now = new Date();
  const currentActualYear = now.getFullYear();
  const currentActualMonthNum = now.getMonth() + 1; // 1-indexed
  const currentActualKey = `${currentActualYear}-${String(currentActualMonthNum).padStart(2, '0')}`;

  // Helper to step month by offset (+1 or -1)
  const handleStepMonth = (delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    let y = selectedYear;
    let m = selectedMonthNum + delta;
    if (m > 12) {
      m = 1;
      y += 1;
    } else if (m < 1) {
      m = 12;
      y -= 1;
    }
    const newKey = `${y}-${String(m).padStart(2, '0')}`;
    onSelectMonthKey(newKey);
  };

  const handleSelectMonth = (mIndex1Based: number) => {
    const newKey = `${pickerYear}-${String(mIndex1Based).padStart(2, '0')}`;
    onSelectMonthKey(newKey);
    setIsOpen(false);
  };

  const selectedMonthFull = MONTH_NAMES_FULL[selectedMonthNum - 1] || 'Select Month';

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Sleek Month Control Bar with Arrows */}
      <div
        className={`flex items-center gap-1 p-1 rounded-2xl border transition-all shadow-xs ${
          isDarkMode
            ? 'bg-slate-900/90 border-slate-700/80 text-white hover:border-emerald-500/50'
            : 'bg-white border-slate-200 text-slate-800 hover:border-emerald-500/50 shadow-xs'
        }`}
      >
        {/* Previous Month Arrow */}
        <button
          onClick={(e) => handleStepMonth(-1, e)}
          className={`p-1.5 rounded-xl transition-transform active:scale-90 ${
            isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
          }`}
          title="Previous Month"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Main Month Button that opens Modal/Grid */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 rounded-xl text-xs font-bold transition-all hover:opacity-95 active:scale-98 min-w-0"
        >
          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shrink-0 shadow-xs">
            <CalendarIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </div>
          <span className="tracking-tight text-[11px] sm:text-xs font-black truncate">
            <span className="inline sm:hidden">{MONTH_NAMES_SHORT[selectedMonthNum - 1]} {selectedYear}</span>
            <span className="hidden sm:inline">{selectedMonthFull} {selectedYear}</span>
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        </button>

        {/* Next Month Arrow */}
        <button
          onClick={(e) => handleStepMonth(1, e)}
          className={`p-1.5 rounded-xl transition-transform active:scale-90 ${
            isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
          }`}
          title="Next Month"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Colorful Popover Month Calendar Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs sm:bg-transparent sm:p-0 sm:block sm:absolute sm:right-0 sm:top-full sm:mt-2 sm:z-50 sm:w-80">
          {/* Backdrop click to close on mobile */}
          <div
            className="fixed inset-0 sm:hidden -z-10"
            onClick={() => setIsOpen(false)}
          />

          <div
            className={`w-[275px] xs:w-[295px] sm:w-full rounded-3xl border p-3.5 sm:p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 ${
              isDarkMode
                ? 'bg-slate-900 border-slate-700/80 text-white backdrop-blur-xl shadow-slate-950/80'
                : 'bg-white border-slate-200 text-slate-900 backdrop-blur-xl shadow-slate-300/80'
            }`}
          >
            {/* Calendar Header with Year Controls */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-700/30 mb-2.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-emerald-500">
                  Select Month
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Year Navigator */}
                <div className="flex items-center gap-0.5 bg-emerald-500/10 p-0.5 sm:p-1 rounded-xl border border-emerald-500/20">
                  <button
                    onClick={() => setPickerYear((y) => y - 1)}
                    className={`p-1 rounded-lg transition-colors ${
                      isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-200 text-slate-700'
                    }`}
                    title="Previous Year"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-black px-1 text-emerald-600 dark:text-emerald-400">
                    {pickerYear}
                  </span>
                  <button
                    onClick={() => setPickerYear((y) => y + 1)}
                    className={`p-1 rounded-lg transition-colors ${
                      isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-200 text-slate-700'
                    }`}
                    title="Next Year"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className={`p-1 rounded-lg transition-colors sm:hidden ${
                    isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 12 Month Vibrant Grid */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {MONTH_NAMES_SHORT.map((mShort, idx) => {
                const mNum = idx + 1;
                const key = `${pickerYear}-${String(mNum).padStart(2, '0')}`;
                const isSelected = key === selectedMonthKey;
                const isCurrentActual = key === currentActualKey;
                const hasData = availableMonthsMap ? availableMonthsMap.has(key) : true;

                return (
                  <button
                    key={mShort}
                    onClick={() => handleSelectMonth(mNum)}
                    className={`relative p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-0.5 group active:scale-95 ${
                      isSelected
                        ? 'bg-gradient-to-tr from-emerald-500 to-teal-500 border-emerald-400 text-white shadow-md shadow-emerald-500/30 font-black'
                        : isCurrentActual
                        ? 'border-emerald-500/70 bg-emerald-500/10 text-emerald-500 font-extrabold'
                        : isDarkMode
                        ? 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-emerald-500/40 hover:bg-slate-800/80 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-emerald-500/40 hover:bg-slate-100 font-bold'
                    }`}
                  >
                    <span className="text-[11px] sm:text-xs">{mShort}</span>

                    {/* Indicator Pills */}
                    {isSelected ? (
                      <Check className="w-3 h-3 text-white" />
                    ) : isCurrentActual ? (
                      <span className="px-1.2 py-0.1 text-[7px] sm:text-[8px] font-black rounded-full bg-emerald-500 text-white uppercase">
                        Now
                      </span>
                    ) : hasData ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 group-hover:scale-125 transition-transform" />
                    ) : null}
                  </button>
                );
              })}
            </div>

            {/* Bottom Quick Reset to Current Month */}
            <div className="mt-2.5 pt-2 border-t border-slate-700/30 flex items-center justify-between">
              <button
                onClick={() => {
                  onSelectMonthKey(currentActualKey);
                  setIsOpen(false);
                }}
                className={`w-full py-1.5 sm:py-2 px-2.5 rounded-xl border text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  isDarkMode
                    ? 'bg-slate-800/80 border-slate-700 text-emerald-400 hover:bg-slate-700 hover:text-emerald-300'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Switch to Current ({MONTH_NAMES_SHORT[currentActualMonthNum - 1]} {currentActualYear})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
