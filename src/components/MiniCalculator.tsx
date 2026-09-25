import React, { useState, useEffect, useRef } from 'react';
import { Minus, X, Copy, Check, GripHorizontal, CornerDownRight, Maximize2, Minimize2, RotateCcw } from 'lucide-react';

interface MiniCalculatorProps {
  isOpen: boolean;
  isMinimized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onRestore: () => void;
  isDarkMode: boolean;
}

export const MiniCalculator: React.FC<MiniCalculatorProps> = ({
  isOpen,
  isMinimized,
  onClose,
  onMinimize,
  onRestore,
  isDarkMode,
}) => {
  // Calculator Display & State
  const [expression, setExpression] = useState<string>('');
  const [displayValue, setDisplayValue] = useState<string>('0');
  const [isEvaluated, setIsEvaluated] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Position and Size state
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    const defaultX = typeof window !== 'undefined' ? Math.max(16, window.innerWidth - 320) : 20;
    const defaultY = 120;
    return { x: defaultX, y: defaultY };
  });

  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 280,
    height: 380,
  });

  // Ensure window stays within screen bounds on resize
  useEffect(() => {
    const handleWindowResize = () => {
      setPosition((prev) => ({
        x: Math.min(prev.x, Math.max(10, window.innerWidth - size.width - 10)),
        y: Math.min(prev.y, Math.max(10, window.innerHeight - size.height - 10)),
      }));
    };
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [size]);

  // Safe expression evaluator
  const evaluateMath = (exprStr: string): number | null => {
    if (!exprStr.trim()) return null;
    
    // Replace visual symbols
    let sanitized = exprStr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/–/g, '-');

    // Remove trailing operator if present
    sanitized = sanitized.replace(/[\+\-\*\/]+$/, '');

    // Strictly validate format (numbers, operators, decimals, spaces)
    if (!/^[0-9\.\+\-\*\/\s]+$/.test(sanitized)) {
      return null;
    }

    try {
      // Safe evaluation via Function with restricted characters
      const result = new Function(`return (${sanitized});`)();
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        // Round floating point precision issues (e.g. 0.1 + 0.2)
        return Math.round(result * 1000000) / 1000000;
      }
      return null;
    } catch {
      return null;
    }
  };

  // Button actions
  const handleDigit = (digit: string) => {
    if (isEvaluated) {
      setExpression(digit);
      setDisplayValue(digit);
      setIsEvaluated(false);
      return;
    }

    if (displayValue === '0' && digit !== '.') {
      setDisplayValue(digit);
      setExpression((prev) => (prev === '0' ? digit : prev + digit));
    } else {
      // Avoid duplicate decimals in current token
      if (digit === '.') {
        const lastNumberPart = displayValue.split(/[\+\-×÷]/).pop() || '';
        if (lastNumberPart.includes('.')) return;
      }
      setDisplayValue((prev) => (prev === '0' && digit !== '.' ? digit : prev + digit));
      setExpression((prev) => prev + digit);
    }
  };

  const handleOperator = (op: string) => {
    setIsEvaluated(false);
    if (!expression && displayValue === '0' && op === '-') {
      setExpression('-');
      setDisplayValue('-');
      return;
    }

    if (!expression) {
      setExpression(displayValue + ' ' + op + ' ');
      return;
    }

    // Check if last char is an operator, replace it
    const trimmed = expression.trim();
    const lastChar = trimmed.slice(-1);
    if (['+', '-', '×', '÷'].includes(lastChar)) {
      setExpression(trimmed.slice(0, -1).trim() + ' ' + op + ' ');
    } else {
      // Evaluate running sum preview if desired
      const currentRes = evaluateMath(expression);
      if (currentRes !== null) {
        setDisplayValue(String(currentRes));
      }
      setExpression(expression + ' ' + op + ' ');
    }
  };

  const handleEqual = () => {
    if (!expression) return;
    const res = evaluateMath(expression);
    if (res !== null) {
      setDisplayValue(String(res));
      setExpression(expression + ' =');
      setIsEvaluated(true);
    } else {
      setDisplayValue('Error');
      setIsEvaluated(true);
    }
  };

  const handleClear = () => {
    setExpression('');
    setDisplayValue('0');
    setIsEvaluated(false);
  };

  const handleBackspace = () => {
    if (isEvaluated) {
      handleClear();
      return;
    }
    if (expression.length > 0) {
      const newExpr = expression.slice(0, -1);
      setExpression(newExpr);
      
      // Update display value
      const tokens = newExpr.trim().split(/\s+/);
      const lastToken = tokens[tokens.length - 1] || '0';
      if (!['+', '-', '×', '÷'].includes(lastToken)) {
        setDisplayValue(lastToken || '0');
      }
    } else {
      setDisplayValue('0');
    }
  };

  const handlePercentage = () => {
    const res = evaluateMath(expression);
    const valToPercent = res !== null ? res : parseFloat(displayValue);
    if (!isNaN(valToPercent)) {
      const p = valToPercent / 100;
      setDisplayValue(String(p));
      setExpression(String(p));
      setIsEvaluated(true);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(displayValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Keyboard support when calculator is open
  useEffect(() => {
    if (!isOpen || isMinimized) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if active element is an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((document.activeElement?.tagName || ''))) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === '.') {
        handleDigit('.');
      } else if (e.key === '+') {
        handleOperator('+');
      } else if (e.key === '-') {
        handleOperator('-');
      } else if (e.key === '*') {
        handleOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEqual();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isMinimized, expression, displayValue, isEvaluated]);

  // Pointer drag handler for moving window (Works for Touch & Mouse!)
  const handleDragStart = (e: React.PointerEvent) => {
    // Prevent drag if clicking on controls inside header
    if ((e.target as HTMLElement).closest('button')) return;
    
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = position.x;
    const initialY = position.y;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      const newX = Math.min(Math.max(10, initialX + deltaX), window.innerWidth - size.width - 10);
      const newY = Math.min(Math.max(10, initialY + deltaY), window.innerHeight - size.height - 10);

      setPosition({ x: newX, y: newY });
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Pointer resize handler for resizing window
  const handleResizeStart = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const initialW = size.width;
    const initialH = size.height;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      const newW = Math.min(Math.max(220, initialW + deltaX), Math.min(450, window.innerWidth - position.x - 10));
      const newH = Math.min(Math.max(300, initialH + deltaY), Math.min(580, window.innerHeight - position.y - 10));

      setSize({ width: newW, height: newH });
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  if (!isOpen) return null;

  // Minimized floating pill state
  if (isMinimized) {
    return (
      <div
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        className="fixed z-50 transition-all select-none animate-in fade-in zoom-in-95 duration-150"
      >
        <button
          onClick={onRestore}
          className={`flex items-center gap-2 px-3 py-2 rounded-2xl shadow-xl border backdrop-blur-md active:scale-95 transition-all ${
            isDarkMode
              ? 'bg-slate-900/95 border-slate-700 text-slate-100 hover:bg-slate-800'
              : 'bg-white/95 border-slate-300 text-slate-800 hover:bg-slate-50'
          }`}
          title="Click to expand Mini Calculator"
        >
          <span className="text-base">🧮</span>
          <span className="text-xs font-bold">Calculator</span>
          <span className="text-[11px] font-mono opacity-80 max-w-[80px] truncate ml-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
            {displayValue}
          </span>
          <Maximize2 className="w-3.5 h-3.5 opacity-60 ml-1" />
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
      }}
      className={`fixed z-50 flex flex-col rounded-2xl shadow-2xl border backdrop-blur-xl transition-colors select-none overflow-hidden ${
        isDarkMode
          ? 'bg-slate-900/95 border-slate-700 text-slate-100 shadow-slate-950/80'
          : 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-400/30'
      }`}
    >
      {/* Draggable Header Bar */}
      <div
        onPointerDown={handleDragStart}
        className={`flex items-center justify-between px-3 py-2.5 border-b cursor-grab active:cursor-grabbing touch-none shrink-0 ${
          isDarkMode ? 'bg-slate-800/80 border-slate-700/80' : 'bg-slate-100/90 border-slate-200/80'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <GripHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs font-extrabold flex items-center gap-1 truncate">
            <span>🧮</span> Mini Calculator
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Preset size toggle (Compact / Standard / Large) */}
          <button
            onClick={() => {
              if (size.width > 300) {
                setSize({ width: 250, height: 340 });
              } else {
                setSize({ width: 340, height: 440 });
              }
            }}
            className={`p-1 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-200 text-slate-600'
            }`}
            title={size.width > 300 ? 'Switch to Compact Size' : 'Switch to Large Size'}
          >
            {size.width > 300 ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Minimize button */}
          <button
            onClick={onMinimize}
            className={`p-1 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-200 text-slate-600'
            }`}
            title="Minimize Calculator"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors hover:bg-rose-500/20 text-rose-500`}
            title="Close Calculator"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Screen Display */}
      <div className={`p-3 border-b flex flex-col justify-end shrink-0 ${
        isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-100'
      }`}>
        <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 min-h-[18px] overflow-hidden">
          <span className="truncate pr-1">{expression || ' '}</span>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded transition-colors shrink-0 ${
              copied
                ? 'bg-emerald-500/20 text-emerald-500 font-bold'
                : isDarkMode
                ? 'hover:bg-slate-800 text-slate-400'
                : 'hover:bg-slate-200 text-slate-500'
            }`}
            title="Copy Result"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <div className="text-right font-extrabold tracking-tight font-mono truncate text-2xl xs:text-3xl text-emerald-600 dark:text-emerald-400 mt-1">
          {displayValue}
        </div>
      </div>

      {/* Keypad Grid */}
      <div className="flex-1 p-2 grid grid-cols-4 gap-1.5 overflow-hidden">
        {/* Row 1 */}
        <button
          onClick={handleClear}
          className="rounded-xl font-bold text-xs bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25 active:scale-95 transition-all flex items-center justify-center"
        >
          C
        </button>
        <button
          onClick={handleBackspace}
          className={`rounded-xl font-bold text-xs active:scale-95 transition-all flex items-center justify-center ${
            isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
          title="Backspace"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handlePercentage}
          className={`rounded-xl font-bold text-xs active:scale-95 transition-all flex items-center justify-center ${
            isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          %
        </button>
        <button
          onClick={() => handleOperator('÷')}
          className="rounded-xl font-extrabold text-sm bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30 active:scale-95 transition-all flex items-center justify-center"
        >
          ÷
        </button>

        {/* Row 2 */}
        <button
          onClick={() => handleDigit('7')}
          className={`rounded-xl font-bold text-sm active:scale-95 transition-all flex items-center justify-center ${
            isDarkMode ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-100' : 'bg-slate-100/80 hover:bg-slate-200 text-slate-800'
          }`}
        >
          7
        </button>
        <button
          onClick={() => handleDigit('8')}
          className={`rounded-xl font-bold text-sm active:scale-95 transition-all flex items-center justify-center ${
            isDarkMode ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-100' : 'bg-slate-100/80 hover:bg-slate-200 text-slate-800'
          }`}
        >
          8
        </button>
        <button
          onClick={() => handleDigit('9')}
          className={`rounded-xl font-bold text-sm active:scale-95 transition-all flex items-center justify-center ${
            isDarkMode ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-100' : 'bg-slate-100/80 hover:bg-slate-200 text-slate-800'
          }`}
        >
          9
        </button>
        <button
          onClick={() => handleOperator('×')}
          className="rounded-xl font-extrabold text-sm bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30 active:scale-95 transition-all flex items-center justify-center"
        >
          ×
        </button>

        {/* Row 3 */}
        <button
          onClick={() => handleDigit('4')}
          className={`rounded-xl font-bold text-sm active:scale-95 transition-all flex items-center justify-center ${
            isDarkMode ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-100' : 'bg-slate-100/80 hover:bg-slate-200 text-slate-800'
          }`}
        >
          4
        </button>
        <button
          onClick={() => handleDigit('5')}
          className={`rounded-xl font-bold text-sm active:scale-95 transition-all flex items-center justify-center ${
            isDarkMode ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-100' : 'bg-slate-100/80 hover:bg-slate-200 text-slate-800'
          }`}
        >
          5
        </button>
        <button
          onClick={() => handleDigit('6')}
          className={`rounded-xl font-bold text-sm active:scale-95 transition-all flex items-center justify-center ${
            isDarkMode ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-100' : 'bg-slate-100/80 hover:bg-slate-200 text-slate-800'
          }`}
        >
          6
        </button>
        <button
          onClick={() => handleOperator('-')}
          className="rounded-xl font-extrabold text-sm bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30 active:scale-95 transition-all flex items-center justify-center"
        >
          -
        </button>

        {/* Row 4 */}
        <button
          onClick={() => handleDigit('1')}
          className={`rounded-xl font-bold text-sm active:scale-95 transition-all flex items-center justify-center ${
            isDarkMode ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-100' : 'bg-slate-100/80 hover:bg-slate-200 text-slate-800'
          }`}
        >
          1
        </button>
        <button
          onClick={() => handleDigit('2')}
          className={`rounded-xl font-bold text-sm active:scale-95 transition-all flex items-center justify-center ${
            isDarkMode ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-100' : 'bg-slate-100/80 hover:bg-slate-200 text-slate-800'
          }`}
        >
          2
        </button>
        <button
          onClick={() => handleDigit('3')}
          className={`rounded-xl font-bold text-sm active:scale-95 transition-all flex items-center justify-center ${
            isDarkMode ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-100' : 'bg-slate-100/80 hover:bg-slate-200 text-slate-800'
          }`}
        >
          3
        </button>
        <button
          onClick={() => handleOperator('+')}
          className="rounded-xl font-extrabold text-sm bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30 active:scale-95 transition-all flex items-center justify-center"
        >
          +
        </button>

        {/* Row 5 */}
        <button
          onClick={() => handleDigit('0')}
          className={`col-span-2 rounded-xl font-bold text-sm active:scale-95 transition-all flex items-center justify-center ${
            isDarkMode ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-100' : 'bg-slate-100/80 hover:bg-slate-200 text-slate-800'
          }`}
        >
          0
        </button>
        <button
          onClick={() => handleDigit('.')}
          className={`rounded-xl font-bold text-sm active:scale-95 transition-all flex items-center justify-center ${
            isDarkMode ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-100' : 'bg-slate-100/80 hover:bg-slate-200 text-slate-800'
          }`}
        >
          .
        </button>
        <button
          onClick={handleEqual}
          className="rounded-xl font-extrabold text-base bg-emerald-500 hover:bg-emerald-400 text-white shadow-md active:scale-95 transition-all flex items-center justify-center"
        >
          =
        </button>
      </div>

      {/* Touch & Mouse Drag Corner Handle for Resizing */}
      <div
        onPointerDown={handleResizeStart}
        className="absolute bottom-0 right-0 p-1 cursor-nwse-resize touch-none text-slate-400 hover:text-emerald-500 transition-colors"
        title="Drag to resize window"
      >
        <CornerDownRight className="w-3.5 h-3.5 rotate-90" />
      </div>
    </div>
  );
};