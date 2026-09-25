import React from 'react';
import logo from '../assets/images/Kripin.png';
import {
  ArrowLeft,
  Wallet,
  BarChart3,
  Repeat,
  MessageSquareCode,
  FileText,
  Calculator,
  ShieldCheck,
  Code2,
  Sparkles,
} from 'lucide-react';

interface AboutKripinProps {
  onBack?: () => void;
  isDarkMode: boolean;
}

const AboutKripin: React.FC<AboutKripinProps> = ({
  onBack,
  isDarkMode,
}) => {
  const features = [
    {
      icon: Wallet,
      title: 'Expense Tracking',
      description: 'Record your daily expenses quickly and easily.',
    },
    {
      icon: BarChart3,
      title: 'Smart Analytics',
      description: 'Understand your monthly spending with clear insights.',
    },
    {
      icon: Repeat,
      title: 'Recurring Bills',
      description: 'Keep track of regular payments and auto-debits.',
    },
    {
      icon: MessageSquareCode,
      title: 'SMS Parser',
      description: 'Convert supported bank SMS notifications into entries.',
    },
    {
      icon: FileText,
      title: 'PDF Reports',
      description: 'Generate useful reports of your expense activity.',
    },
    {
      icon: Calculator,
      title: 'Mini Calculator',
      description: 'Calculate quickly without leaving your diary.',
    },
  ];

  return (
    <div
      className={`relative min-h-screen overflow-hidden transition-colors ${
        isDarkMode
          ? 'bg-slate-950 text-slate-100'
          : 'bg-slate-50 text-slate-800'
      }`}
    >
      {/* Kripin Logo Watermark */}
      <img
  src={logo}
  alt=""
  aria-hidden="true"
  className={`pointer-events-none fixed inset-0 w-full h-full object-contain select-none ${
    isDarkMode ? 'opacity-[0.16]' : 'opacity-[0.18]'
  }`}
/>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-6 sm:py-8">

        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-semibold shadow-sm transition-all active:scale-95 ${
                isDarkMode
                  ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          <span
            className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
              isDarkMode
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-emerald-50 text-emerald-600 border-emerald-100'
            }`}
          >
            Version 1.0
          </span>
        </div>

        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-green-900 to-teal-950 text-white shadow-xl shadow-emerald-500/20 p-6 sm:p-9 mb-6">

          <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute -left-16 -bottom-20 w-48 h-48 rounded-full bg-white/10" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Smart Expense Diary
            </div>

            {/* Kripin Logo Text */}
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              <span className="text-emerald-400">Kri</span>
              <span className="text-red-500">pin</span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm sm:text-base leading-7 text-emerald-50">
              A simple and modern personal expense diary built to help you
              track, understand and manage your everyday financial activity.
            </p>
          </div>
        </div>

        {/* About */}
        <div
          className={`rounded-2xl border shadow-sm p-5 sm:p-7 mb-6 ${
            isDarkMode
              ? 'bg-slate-900 border-slate-800'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold">
                About Kripin
              </h2>

              <p
                className={`text-xs ${
                  isDarkMode ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Your personal finance companion
              </p>
            </div>
          </div>

          <p
            className={`text-sm leading-7 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            Kripin is designed to make personal expense tracking simple,
            organized and accessible. From recording everyday expenses to
            reviewing monthly activity, Kripin brings useful financial tools
            together in one place.
          </p>
        </div>

        {/* Features */}
        <div className="mb-6">
          <div className="mb-4 px-1">
            <h2 className="text-xl font-bold">
              What Kripin Offers
            </h2>

            <p
              className={`text-xs mt-1 ${
                isDarkMode ? 'text-slate-500' : 'text-slate-500'
              }`}
            >
              Useful tools for everyday expense management
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className={`group rounded-2xl border p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all ${
                    isDarkMode
                      ? 'bg-slate-900 border-slate-800'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>

                    <div>
                      <h3 className="font-bold text-sm">
                        {feature.title}
                      </h3>

                      <p
                        className={`text-xs leading-5 mt-1 ${
                          isDarkMode
                            ? 'text-slate-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Privacy */}
        <div
          className={`rounded-2xl p-5 sm:p-6 mb-6 shadow-lg ${
            isDarkMode
              ? 'bg-slate-900 border border-slate-800'
              : 'bg-slate-900'
          } text-white`}
        >
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>

            <div>
              <h2 className="font-bold text-base">
                Privacy & Offline First
              </h2>

              <p className="text-xs sm:text-sm text-slate-400 leading-6 mt-2">
                Kripin follows an offline-first approach. Your expense
                information is stored locally on your device through browser
                storage, allowing the application to remain useful even
                without an internet connection.
              </p>
            </div>
          </div>
        </div>

        {/* Developer */}
        <div
          className={`rounded-2xl border shadow-sm p-5 sm:p-7 mb-6 ${
            isDarkMode
              ? 'bg-slate-900 border-slate-800'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold">
                Developer
              </h2>

              <p
                className={`text-xs ${
                  isDarkMode ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Built with modern web technologies
              </p>
            </div>
          </div>

          <div
            className={`rounded-xl border p-4 ${
              isDarkMode
                ? 'bg-slate-950 border-slate-800'
                : 'bg-slate-50 border-slate-100'
            }`}
          >
            <p
              className={`text-sm ${
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              Developed by
            </p>

            {/* JTech Labs Branding */}
            <p className="text-lg font-extrabold mt-0.5">
              <span>Jitesh</span>
              <span className="ml-2">
                <span className="text-red-500">J</span>
                <span className="text-white">Tech Labs</span>
              </span>
            </p>

            <p
              className={`text-xs mt-3 leading-5 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Built using React.js, TypeScript, Vite and Tailwind CSS with
              Progressive Web App support.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <p
            className={`text-xs font-semibold ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Kripin · Smart Expense Diary
          </p>

          <p
            className={`text-[11px] mt-1 ${
              isDarkMode ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
            Developed by Jitesh · JTech Labs
          </p>
        </div>

      </div>
    </div>
  );
};

export default AboutKripin;