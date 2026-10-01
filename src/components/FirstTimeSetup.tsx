import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Delete,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  UserRound,
  Phone,
  BriefcaseBusiness,
} from 'lucide-react';
import logo from '../assets/images/Kripin.png';
import { UserProfile } from '../types';

interface FirstTimeSetupProps {
  onComplete: () => void;
  onBack: () => void;
  isDarkMode: boolean;
}

const STORAGE_PIN = 'kripin_app_pin';
const STORAGE_PROFILE = 'pocketspent_user_profile';

const FirstTimeSetup: React.FC<FirstTimeSetupProps> = ({
  onComplete,
  onBack,
  isDarkMode,
}) => {
  const [step, setStep] = useState<1 | 2>(1);

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [occupation, setOccupation] = useState('');
  const [profileError, setProfileError] = useState('');

  const [pin, setPin] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [confirmMode, setConfirmMode] = useState(false);
  const [error, setError] = useState('');

const getPermanentUserId = () => {
  const savedProfile = localStorage.getItem(STORAGE_PROFILE);

  if (savedProfile) {
    try {
      const parsedProfile = JSON.parse(savedProfile);

      if (parsedProfile?.userId?.trim()) {
        return parsedProfile.userId;
      }
    } catch {
      // Ignore invalid saved profile
    }
  }

  return `KR-${Math.floor(100000 + Math.random() * 900000)}`;
};
  const handleContinueToPin = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setProfileError('Please enter your name');
      return;
    }

    setProfileError('');
    setStep(2);
  };

  const handleNumber = (number: string) => {
    if (pin.length >= 4) return;

    const newPin = pin + number;

    setPin(newPin);
    setError('');

    if (newPin.length === 4) {
      setTimeout(() => {
        if (!confirmMode) {
          setFirstPin(newPin);
          setPin('');
          setConfirmMode(true);
        } else {
          if (newPin !== firstPin) {
            setError('PIN does not match');

            setTimeout(() => {
              setPin('');
              setFirstPin('');
              setConfirmMode(false);
              setError('');
            }, 1000);

            return;
          }

          const profile: UserProfile = {
            name: name.trim(),
            mobile: mobile.trim(),
            occupation: occupation.trim(),
            userId: getPermanentUserId(),
            avatarUrl: '',
          };

          localStorage.setItem(STORAGE_PROFILE, JSON.stringify(profile));
          localStorage.setItem(STORAGE_PIN, newPin);

          onComplete();
        }
      }, 180);
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleBack = () => {
    if (step === 2) {
      if (confirmMode) {
        setPin('');
        setFirstPin('');
        setConfirmMode(false);
        setError('');
      } else {
        setStep(1);
        setPin('');
        setError('');
      }

      return;
    }

    onBack();
  };

  const keypad = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div
      className={`min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-8 sm:px-6 ${
        isDarkMode
          ? 'bg-slate-950 text-white'
          : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={`absolute -top-32 -left-32 w-80 h-80 rounded-full blur-3xl ${
            isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-400/20'
          }`}
        />

        <div
  className={`absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl ${
    isDarkMode ? 'bg-red-500/10' : 'bg-red-400/20'
  }`}
/>
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Brand */}
        <div className="text-center mb-6">
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

            <div className="text-left">
<div className="flex items-center">
  <p className="text-lg sm:text-xl font-extrabold tracking-tight">
    <span className="text-emerald-500">Kri</span>
    <span className="text-red-500">pin</span>
  </p>
</div>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div
          className={`rounded-[28px] border shadow-2xl overflow-hidden backdrop-blur-xl ${
            isDarkMode
              ? 'bg-slate-900/95 border-slate-800'
              : 'bg-white/95 border-white shadow-slate-300/40'
          }`}
        >
          {/* Top accent */}
          <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400" />

          <div className="p-6 sm:p-9">
            {/* Top navigation / progress */}
            <div className="flex items-center justify-between mb-7">
              <button
                type="button"
                onClick={handleBack}
                className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                  isDarkMode
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>

              <div className="text-right">
                <p
                  className={`text-[10px] font-bold uppercase tracking-[0.18em] ${
                    isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                  }`}
                >
                  Step {step} of 2
                </p>

                <p
                  className={`text-xs mt-1 ${
                    isDarkMode ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  {step === 1 ? 'Basic profile' : 'Security setup'}
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-2 mb-8">
              <span
                className={`h-1.5 flex-1 rounded-full ${
                  step >= 1 ? 'bg-emerald-500' : 'bg-slate-200'
                }`}
              />

              <span
                className={`h-1.5 flex-1 rounded-full ${
                  step >= 2
                    ? 'bg-emerald-500'
                    : isDarkMode
                      ? 'bg-slate-700'
                      : 'bg-slate-200'
                }`}
              />
            </div>

            {step === 1 ? (
              <>
                {/* Profile heading */}
                <div className="text-center mb-7">
                  <div className="relative inline-flex mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                      <UserRound className="w-8 h-8 text-emerald-500" />
                    </div>

                    <div className="absolute -right-2 -top-2 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
  Welcome to{' '}
  <span className="text-emerald-500">Kri</span>
  <span className="text-red-500">pin</span>
</h1>

                  <p
                    className={`text-sm mt-2 ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    Let&apos;s set up your personal profile
                  </p>
                </div>

                {/* Profile fields */}
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label
                      className={`block text-xs font-bold mb-2 ${
                        isDarkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      Name <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <UserRound
                        className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
                          isDarkMode ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      />

                      <input
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setProfileError('');
                        }}
                        placeholder="Enter your name"
                        className={`w-full h-12 rounded-xl border pl-10 pr-4 text-sm outline-none transition-all ${
                          isDarkMode
                            ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500'
                            : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Mobile */}
                  <div>
                    <label
                      className={`block text-xs font-bold mb-2 ${
                        isDarkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      Mobile{' '}
                      <span
                        className={`font-normal ${
                          isDarkMode ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      >
                        (optional)
                      </span>
                    </label>

                    <div className="relative">
                      <Phone
                        className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
                          isDarkMode ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      />

                      <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="Enter mobile number"
                        className={`w-full h-12 rounded-xl border pl-10 pr-4 text-sm outline-none transition-all ${
                          isDarkMode
                            ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500'
                            : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Occupation */}
                  <div>
                    <label
                      className={`block text-xs font-bold mb-2 ${
                        isDarkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      Occupation{' '}
                      <span
                        className={`font-normal ${
                          isDarkMode ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      >
                        (optional)
                      </span>
                    </label>

                    <div className="relative">
                      <BriefcaseBusiness
                        className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
                          isDarkMode ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      />

                      <input
                        type="text"
                        value={occupation}
                        onChange={(e) => setOccupation(e.target.value)}
                        placeholder="e.g. Student, Developer, Business"
                        className={`w-full h-12 rounded-xl border pl-10 pr-4 text-sm outline-none transition-all ${
                          isDarkMode
                            ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500'
                            : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Error */}
                  <div className="min-h-5 flex items-center justify-center">
                    {profileError && (
                      <p className="text-xs font-bold text-red-500">
                        {profileError}
                      </p>
                    )}
                  </div>

                  {/* Continue */}
                  <button
                    type="button"
                    onClick={handleContinueToPin}
                    className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Info */}
                <div
                  className={`mt-7 pt-5 border-t flex items-center justify-center gap-2 text-[10px] font-medium ${
                    isDarkMode
                      ? 'border-slate-800 text-slate-500'
                      : 'border-slate-100 text-slate-400'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Your User ID will be generated automatically</span>
                </div>
              </>
            ) : (
              <>
                {/* PIN heading */}
                <div className="text-center mb-7">
                  <div className="relative inline-flex mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                      {confirmMode ? (
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
  {confirmMode ? (
    'Confirm Your PIN'
  ) : (
    <>
      Secure Your{' '}
      <span className="text-emerald-500">Kri</span>
      <span className="text-red-500">pin</span>
    </>
  )}
</h1>

                  <p
                    className={`text-sm mt-2 ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {confirmMode
                      ? 'Enter the same 4-digit PIN again'
                      : 'Create a 4-digit PIN to protect your diary'}
                  </p>
                </div>

                {/* PIN dots */}
                <div className="flex justify-center gap-4 mb-7">
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
                <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-xs mx-auto">
                  {keypad.map((number) => (
                    <button
                      key={number}
                      type="button"
                      onClick={() => handleNumber(number)}
                      className={`h-16 sm:h-[68px] rounded-2xl border text-xl font-extrabold transition-all active:scale-90 ${
                        isDarkMode
                          ? 'bg-slate-800 border-slate-700 text-white hover:bg-emerald-500 hover:border-emerald-400'
                          : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-emerald-500 hover:border-emerald-400 hover:text-white'
                      }`}
                    >
                      {number}
                    </button>
                  ))}

                  <div />

                  <button
                    type="button"
                    onClick={() => handleNumber('0')}
                    className={`h-16 sm:h-[68px] rounded-2xl border text-xl font-extrabold transition-all active:scale-90 ${
                      isDarkMode
                        ? 'bg-slate-800 border-slate-700 text-white hover:bg-emerald-500 hover:border-emerald-400'
                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-emerald-500 hover:border-emerald-400 hover:text-white'
                    }`}
                  >
                    0
                  </button>

                  <button
                    type="button"
                    onClick={handleDelete}
                    className={`h-16 sm:h-[68px] rounded-2xl border flex items-center justify-center transition-all active:scale-90 ${
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
                  className={`mt-7 pt-5 border-t flex items-center justify-center gap-2 text-[10px] font-medium ${
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
                <div className="flex justify-center mt-4">
                  <div
                    className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full ${
                      isDarkMode
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-emerald-50 text-emerald-600'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {confirmMode
                      ? 'Almost there'
                      : 'One more step to get started'}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstTimeSetup;