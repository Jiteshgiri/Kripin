import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Delete,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import logo from '../assets/images/Kripin.png';

interface PinLockProps {
  onUnlock: () => void;
  isDarkMode: boolean;
}

const STORAGE_PIN = 'kripin_app_pin';

const PinLock: React.FC<PinLockProps> = ({
  onUnlock,
  isDarkMode,
}) => {
  const [pin, setPin] = useState('');
  const [savedPin, setSavedPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_PIN);

    if (stored) {
      setSavedPin(stored);
    }
  }, []);

  const verifyPin = (value: string) => {
    if (value === savedPin) {
      onUnlock();
      return;
    }

    setError('Incorrect PIN');

    setTimeout(() => {
      setPin('');
      setError('');
    }, 900);
  };

  const pressNumber = (number: string) => {
    if (pin.length >= 4) return;

    const newPin = pin + number;

    setPin(newPin);
    setError('');

    if (newPin.length === 4) {
      setTimeout(() => {
        verifyPin(newPin);
      }, 180);
    }
  };

  const removeDigit = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleBack = () => {
    setPin('');
    setError('');
  };

  const keypad = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
<div
  className={`h-dvh relative overflow-hidden flex items-center justify-center px-3 py-3 sm:min-h-screen sm:px-6 sm:py-8 ${
        isDarkMode
          ? 'bg-slate-950 text-white'
          : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={`absolute -top-32 -left-32 w-80 h-80 rounded-full blur-3xl ${
            isDarkMode
              ? 'bg-emerald-500/10'
              : 'bg-emerald-400/20'
          }`}
        />

        <div
  className={`absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl ${
    isDarkMode
      ? 'bg-red-500/10'
      : 'bg-red-400/20'
  }`}
/>
      </div>

      <div className="relative z-10 w-full max-w-lg h-full sm:h-auto flex flex-col justify-center">
        {/* Brand */}
        <div className="text-center mb-2 sm:mb-6">
          <div
            className={`inline-flex items-center gap-3 px-4 py-2 rounded-2xl border backdrop-blur-md ${
              isDarkMode
                ? 'bg-slate-900/70 border-slate-800'
                : 'bg-white/80 border-slate-200'
            }`}
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden">
              <img
                src={logo}
                alt="Kripin"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center">
  <p className="text-lg sm:text-xl font-extrabold tracking-tight">
    <span className="text-emerald-500">Kri</span>
    <span className="text-red-500">pin</span>
  </p>
</div>
            </div>
          </div>

        {/* Main Card */}
        <div
          className={`rounded-[28px] border shadow-2xl overflow-hidden backdrop-blur-xl ${
            isDarkMode
              ? 'bg-slate-900/95 border-slate-800'
              : 'bg-white/95 border-white shadow-slate-300/40'
          } ${error ? 'animate-[shake_.3s_ease-in-out]' : ''}`}
        >
          {/* Top accent */}
          <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400" />

          <div className="p-3.5 sm:p-9">
{/* Security label */}
<div className="flex justify-end mb-7">
  <div className="text-right">
    <p
      className={`text-[10px] font-bold uppercase tracking-[0.18em] ${
        isDarkMode
          ? 'text-emerald-400'
          : 'text-emerald-600'
      }`}
    >
      Security
    </p>

    <p
      className={`text-xs mt-1 ${
        isDarkMode
          ? 'text-slate-500'
          : 'text-slate-400'
      }`}
    >
      Secure access
    </p>
  </div>
</div>

            {/* PIN heading */}
            <div className="text-center mb-3 sm:mb-7">
              <div className="relative inline-flex mb-2 sm:mb-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  {error ? (
                    <LockKeyhole className="w-8 h-8 text-red-500" />
                  ) : pin.length === 4 ? (
                    <Check className="w-8 h-8 text-emerald-500" />
                  ) : (
                    <LockKeyhole className="w-8 h-8 text-emerald-500" />
                  )}
                </div>

                <div className="absolute -right-2 -top-2 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Secure Access
              </h1>

              <p
                className={`text-sm mt-2 ${
                  isDarkMode
                    ? 'text-slate-400'
                    : 'text-slate-500'
                }`}
              >
                Enter your 4-digit PIN
              </p>
            </div>

            {/* PIN dots */}
            <div className="flex justify-center gap-3 mb-3 sm:gap-4 sm:mb-7">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    index < pin.length
                      ? 'bg-emerald-500 scale-110 shadow-lg shadow-emerald-500/40'
                      : isDarkMode
                        ? 'bg-slate-700'
                        : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>

            {/* Error */}
            <div className="h-6 flex items-center justify-center mb-2">
              {error && (
                <p className="text-xs font-bold text-red-500">
                  {error}
                </p>
              )}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-xs mx-auto">
              {keypad.map((number) => (
                <button
                  key={number}
                  type="button"
                  onClick={() => pressNumber(number)}
                  className={`h-14 sm:h-[68px] rounded-2xl border text-xl font-extrabold transition-all active:scale-90 ${
                    isDarkMode
                      ? 'bg-slate-800 border-slate-700 text-white hover:bg-emerald-500 hover:border-emerald-400'
                      : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-emerald-500 hover:border-emerald-400 hover:text-white'
                  }`}
                >
                  {number}
                </button>
              ))}

              <div />

              {/* Zero */}
              <button
                type="button"
                onClick={() => pressNumber('0')}
                className={`h-14 sm:h-[68px] rounded-2xl border text-xl font-extrabold transition-all active:scale-90 ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-white hover:bg-emerald-500 hover:border-emerald-400'
                    : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-emerald-500 hover:border-emerald-400 hover:text-white'
                }`}
              >
                0
              </button>

              {/* Delete */}
              <button
                type="button"
                onClick={removeDigit}
                className={`h-14 sm:h-[68px] rounded-2xl border flex items-center justify-center transition-all active:scale-90 ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-red-500 hover:border-red-400 hover:text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-red-500 hover:border-red-400 hover:text-white'
                }`}
              >
                <Delete className="w-6 h-6" />
              </button>
            </div>

            {/* Security message */}
            <div
              className={`mt-3 pt-3 sm:mt-7 sm:pt-5 border-t flex items-center justify-center gap-2 text-[10px] font-medium ${
                isDarkMode
                  ? 'border-slate-800 text-slate-500'
                  : 'border-slate-100 text-slate-400'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />

              <span>
                Your PIN is stored securely on this device
              </span>
            </div>

            {/* Status */}
            <div className="flex justify-center mt-2 sm:mt-4">
              <div
                className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full ${
                  isDarkMode
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Enter your PIN to continue
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const changePin = (
  oldPin: string,
  newPin: string
): { success: boolean; message: string } => {
  const savedPin = localStorage.getItem(STORAGE_PIN);

  if (savedPin !== oldPin) {
    return {
      success: false,
      message: 'Current PIN is incorrect',
    };
  }

  if (newPin.length !== 4) {
    return {
      success: false,
      message: 'New PIN must be 4 digits',
    };
  }

  localStorage.setItem(STORAGE_PIN, newPin);

  return {
    success: true,
    message: 'PIN changed successfully',
  };
};

export default PinLock;