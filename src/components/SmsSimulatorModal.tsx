import React, { useState } from 'react';
import { X, MessageSquare, Check, Sparkles, AlertCircle } from 'lucide-react';
import { parseSmsText } from '../utils/smsParser';
import { SmsAlert } from '../types';

interface SmsSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAlert: (alert: SmsAlert) => void;
  isDarkMode?: boolean;
}

const PRESET_SMS = [
  'Spent Rs 250.00 at Swiggy using HDFC card xx1234 on 28-Jul-2026.',
  'Sent Rs 500.00 to Ramesh via PhonePe UPI Ref 82918.',
  'Credited Rs 35,000.00 to A/c xx7812 towards July Salary.',
  'Your A/c xx9102 is debited by INR 1,200.00 for Uber Rides.',
  'Paid Rs 799.00 to Airtel Broadband via Google Pay.',
];

export const SmsSimulatorModal: React.FC<SmsSimulatorModalProps> = ({
  isOpen,
  onClose,
  onAddAlert,
  isDarkMode = true,
}) => {
  const [customSms, setCustomSms] = useState('');
  const [parsedResult, setParsedResult] = useState<SmsAlert | null>(null);

  if (!isOpen) return null;

  const handleTextChange = (text: string) => {
    setCustomSms(text);
    const parsed = parseSmsText(text);
    setParsedResult(parsed);
  };

  const handleSelectPreset = (text: string) => {
    setCustomSms(text);
    const parsed = parseSmsText(text);
    setParsedResult(parsed);
  };

  const handleConfirmAdd = () => {
    if (parsedResult) {
      onAddAlert(parsedResult);
      setCustomSms('');
      setParsedResult(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`w-full max-w-lg border rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">Automated SMS Parser</h2>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Bank / UPI Notification Receiver
              </p>
            </div>
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

        <div className={`border rounded-xl p-3 mb-4 text-xs flex items-start gap-2 ${
          isDarkMode
            ? 'bg-indigo-950/40 border-indigo-500/20 text-indigo-300'
            : 'bg-indigo-50 border-indigo-200 text-indigo-800'
        }`}>
          <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <span>
            Test instant zero-friction tracking by tapping a sample bank SMS or pasting a transaction notification.
          </span>
        </div>

        {/* Preset Sample SMS buttons */}
        <div className="space-y-2 mb-4">
          <label className={`block text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Tap a Sample Bank Notification:
          </label>
          <div className="space-y-1.5">
            {PRESET_SMS.map((sms, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectPreset(sms)}
                className={`w-full text-left text-xs border rounded-xl p-2.5 transition-colors ${
                  isDarkMode
                    ? 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                💬 "{sms}"
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <div className="mb-4">
          <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Or Paste Bank SMS Message
          </label>
          <textarea
            rows={3}
            value={customSms}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="e.g. Debited Rs 350 at Starbucks using HDFC UPI..."
            className={`w-full border rounded-xl p-3 text-xs outline-none ${
              isDarkMode
                ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-indigo-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
            }`}
          />
        </div>

        {/* Live Parser Result Preview */}
        {parsedResult && (
          <div className={`p-4 rounded-xl border mb-4 ${
            parsedResult.isIncome
              ? isDarkMode
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : isDarkMode
              ? 'bg-red-950/30 border-red-500/30 text-red-300'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                {parsedResult.isIncome ? '💰 Income Detected' : '💸 Expense Detected'}
              </span>
              <span className="text-lg font-extrabold">₹{parsedResult.amount}</span>
            </div>
            <div className="text-xs space-y-1">
              <p><strong>Merchant:</strong> {parsedResult.merchant}</p>
              <p><strong>Auto-Category:</strong> {parsedResult.category}</p>
            </div>

            <button
              onClick={handleConfirmAdd}
              className={`w-full mt-3 py-2.5 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-colors ${
                parsedResult.isIncome ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-red-500 hover:bg-red-400'
              }`}
            >
              <Check className="w-4 h-4" />
              Auto-Confirm & Track Transaction
            </button>
          </div>
        )}

        {!parsedResult && customSms.trim().length > 0 && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs rounded-xl flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Could not extract amount or transaction details. Make sure text contains 'Rs / INR' and 'Debited / Spent / Credited'.</span>
          </div>
        )}
      </div>
    </div>
  );
};
