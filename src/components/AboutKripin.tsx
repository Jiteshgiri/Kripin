import React from 'react';

interface AboutKripinProps {
  onBack?: () => void;
}

const AboutKripin: React.FC<AboutKripinProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">

        <div className="flex items-center gap-3 mb-6">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-colors text-sm font-semibold"
            >
              ← Back
            </button>
          )}

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              About Kripin
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Smart Expense Diary
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-7 space-y-7">

          <section>
            <h2 className="text-lg font-bold mb-2">
              What is Kripin?
            </h2>

            <p className="text-sm leading-6 text-slate-600">
              Kripin is a personal expense diary designed to make daily
              expense tracking simple, organized and easy to understand.
              It helps you manage your expenses, income, recurring bills
              and monthly financial activity in one place.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">
              Features
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'Daily Expense Tracking',
                'Income Tracking',
                'Monthly Analytics',
                'Recurring Bills',
                'SMS Expense Parser',
                'PDF Reports',
                'Dark & Light Mode',
                'Built-in Calculator',
                'Offline PWA Support',
                'Local Data Storage',
              ].map((feature) => (
                <div
                  key={feature}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
                >
                  ✓ {feature}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">
              Privacy
            </h2>

            <p className="text-sm leading-6 text-slate-600">
              Kripin follows an offline-first approach. Your expense
              information is stored locally on your device through browser
              storage.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">
              Developer
            </h2>

            <p className="text-sm leading-6 text-slate-600">
              Kripin is developed by <strong>Jitesh</strong> as a personal
              finance management application.
            </p>

            <div className="mt-3 text-sm text-slate-600">
              <p>
                <strong>Technology:</strong> React.js, TypeScript, Vite &
                Tailwind CSS
              </p>
              <p>
                <strong>Platform:</strong> Progressive Web App (PWA)
              </p>
            </div>
          </section>

          <section className="border-t border-slate-200 pt-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">
                Kripin
              </span>

              <span className="text-xs text-slate-400">
                Version 1.0
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-2">
              Smart Expense Diary • Made with care
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default AboutKripin;