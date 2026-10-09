import React, { useState } from 'react';
import logo from '../assets/images/Kripin.png';
import {
  ArrowLeft, Wallet, BarChart3, Repeat, FileText,
  Calculator, ShieldCheck, Code2, Sparkles, ChevronDown, BookOpen, Info,
} from 'lucide-react';
import packageJson from '../../package.json';

const APP_VERSION = packageJson.version;

interface AboutKripinProps {
  onBack?: () => void;
  isDarkMode: boolean;
}

type SectionKey = 'about' | 'story' | 'features' | 'privacy' | 'developer';

const AboutKripin: React.FC<AboutKripinProps> = ({ onBack, isDarkMode }) => {
  const [openSections, setOpenSections] = useState<Set<SectionKey>>(() => new Set());
  const [openFeatures, setOpenFeatures] = useState<Set<string>>(() => new Set());

  const toggleFeature = (title: string) => {
    setOpenFeatures((current) => {
      const next = new Set(current);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  const toggleSection = (key: SectionKey) => {
    setOpenSections((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const features = [
    {
      icon: Wallet,
      title: 'Expense Tracking',
      purpose: 'Record your day-to-day spending and income in one organized place, so you can understand where your money goes.',
      howItWorks: 'Add a transaction with its amount, date, category and any other details the entry screen supports. Your saved entries become part of your expense history, which you can revisit when you need to check a purchase or review your records.',
      whyUse: 'Instead of trying to remember purchases or searching through scattered notes, you can keep a consistent record of daily spending and make more informed money decisions.',
    },
    {
      icon: BarChart3,
      title: 'Smart Analytics',
      purpose: 'Turn the transactions you record into a clearer picture of your spending habits.',
      howItWorks: 'Kripin uses the available transaction records to summarize spending and show category-wise patterns or totals supported by the app. The insights depend on the accuracy and completeness of the entries you have saved.',
      whyUse: 'Reviewing your spending patterns can help you notice where most of your money goes, identify areas you may want to reduce and plan future spending more thoughtfully.',
    },
    {
      icon: Repeat,
      title: 'Recurring Bills',
      purpose: 'Keep regular financial commitments—such as rent, subscriptions or EMIs—visible and easier to manage.',
      howItWorks: 'Add the bill details and its repeat schedule using the recurring-bill options available in Kripin. Refer back to the saved schedule to keep track of payments that come around regularly.',
      whyUse: 'Having regular bills collected in one place makes them easier to remember and include when reviewing your monthly expenses. Always check the saved details and schedule for accuracy.',
    },
    {
      icon: FileText,
      title: 'PDF Reports',
      purpose: 'Create a readable PDF copy of your financial records so you can review the report before saving it and keep a copy for later reference.',
      howItWorks: 'Generate the report using the report options available in Kripin. Open the PDF preview to inspect its pages before saving. In the preview, use the viewer controls available on your device to read the pages and zoom in or out when those controls are supported. When you are ready, choose the save/download option to open the Android file-save dialog, select a folder and filename, and save the PDF. The file is saved to the location you choose in that dialog—not necessarily to Downloads.',
      whyUse: 'Previewing helps you check the report before keeping or sharing it. Saving a PDF gives you a separate copy you can open later from the folder you selected, use for personal record-keeping, or share with compatible apps. The report may contain sensitive financial information, so review it before sharing.',
    },
    {
      icon: Calculator,
      title: 'Mini Calculator',
      purpose: 'Work out amounts quickly without leaving your expense diary.',
      howItWorks: 'Open the built-in calculator and use it for everyday arithmetic, such as adding several purchases or checking a total. Enter the final amount into a transaction after confirming your calculation.',
      whyUse: 'It is handy while recording expenses, splitting costs or checking totals, and helps you avoid switching between Kripin and a separate calculator app.',
    },
  ];

  const muted = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const card = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const innerCard = isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200';
  const bodyText = isDarkMode ? 'text-slate-300' : 'text-slate-600';

  const sections: {
    key: SectionKey;
    title: string;
    subtitle: string;
    icon: typeof Wallet;
    iconClass: string;
  }[] = [
    { key: 'about', title: 'About Kripin', subtitle: 'A simple diary for everyday finances', icon: Info, iconClass: 'bg-emerald-500/10 text-emerald-500' },
    { key: 'story', title: 'Our Story', subtitle: 'The personal meaning behind the name Kripin', icon: BookOpen, iconClass: 'bg-rose-500/10 text-rose-500' },
    { key: 'features', title: 'Features & Benefits', subtitle: 'What each tool does and why it helps', icon: Wallet, iconClass: 'bg-emerald-500/10 text-emerald-500' },
    { key: 'privacy', title: 'Privacy & Offline First', subtitle: 'Designed for convenient expense management', icon: ShieldCheck, iconClass: 'bg-teal-500/10 text-teal-500' },
    { key: 'developer', title: 'Developer', subtitle: 'Built with modern web technologies', icon: Code2, iconClass: 'bg-red-500/10 text-red-500' },
  ];

  return (
    <div className={`relative min-h-screen overflow-hidden transition-colors ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      <img
        src={logo}
        alt=""
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 h-full w-full object-contain select-none ${isDarkMode ? 'opacity-[0.10]' : 'opacity-[0.12]'}`}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-6 sm:py-8">
        <div className="mb-6 flex items-center justify-between">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold shadow-sm transition-all active:scale-95 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'}`}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          ) : <div />}

          <span className={`rounded-full border px-3 py-1.5 text-xs font-bold ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
            Version {APP_VERSION}
          </span>
        </div>

        <div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-green-900 to-teal-950 p-6 text-white shadow-xl shadow-emerald-500/20 sm:p-9">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-white/10" />
          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" /> Smart Expense Diary
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              <span className="text-emerald-400">Kri</span><span className="text-red-500">pin</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-emerald-50 sm:text-base">
              A simple and modern personal expense diary built to help you track, understand and manage your everyday financial activity.
            </p>
          </div>
        </div>

        <div className="mb-4 px-1">
          <h2 className="text-xl font-bold">Get to Know Kripin</h2>
          <p className={`mt-1 text-sm ${muted}`}>Tap any section to view more details.</p>
        </div>

        <div className="space-y-3">
          {sections.map((section) => {
            const Icon = section.icon;
            const open = openSections.has(section.key);
            return (
              <section key={section.key} className={`overflow-hidden rounded-2xl border shadow-sm transition-colors ${card}`}>
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={`about-section-${section.key}`}
                  onClick={() => toggleSection(section.key)}
                  className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-slate-500/5 active:bg-slate-500/10 sm:p-5"
                >
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl ${section.iconClass}`}>
                    {section.key === 'story' ? (
                      <img src={logo} alt="Kripin logo" className="h-full w-full object-contain p-1.5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-bold sm:text-lg">{section.title}</span>
                    <span className={`mt-1 block text-xs sm:text-sm ${muted}`}>{section.subtitle}</span>
                  </span>
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'}`}>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                  </span>
                </button>

                {open && (
                  <div id={`about-section-${section.key}`} className={`border-t px-4 pb-5 pt-4 sm:px-5 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                    {section.key === 'about' && (
                      <p className={`text-sm leading-7 ${bodyText}`}>
                        Kripin is a personal expense diary created to make everyday expense tracking simple, organized and easy to understand. It helps users keep their expenses, income, recurring bills and financial activity in one place.
                      </p>
                    )}

                    {section.key === 'story' && (
                      <div className={`rounded-xl border p-4 ${innerCard}`}>
                        <h3 className="text-base font-bold">
                          A Name With a Story <span className="text-emerald-500">Kri</span><span className="text-red-500">pin</span>
                        </h3>
                        <p className={`mt-3 text-sm leading-7 ${bodyText}`}>
                          The name Kripin has a special personal meaning. It is created from the names of Jitesh&apos;s parents.
                        </p>
                        <p className={`mt-3 text-sm leading-7 ${bodyText}`}>
                          <span className="font-bold text-emerald-500">Kri</span> comes from <span className="font-bold">Krishna</span>.<br />
                          <span className="font-bold text-red-500">pin</span> comes from <span className="font-bold">Pinky</span>.
                        </p>
                        <div className="mt-4 text-center">
                          <p className="text-2xl font-extrabold tracking-wide"><span className="text-emerald-500">Kri</span><span className="text-red-500">pin</span></p>
                          <p className={`mt-1 text-xs ${muted}`}>Krishna + Pinky</p>
                        </div>
                        <p className={`mt-4 text-sm leading-7 ${bodyText}`}>
                          Kripin is more than an application name. It represents a personal connection with Jitesh&apos;s parents and gives the app a meaningful identity.
                        </p>
                      </div>
                    )}

                    {section.key === 'features' && (
                      <div className="space-y-3">
                        {features.map((feature) => {
                          const FeatureIcon = feature.icon;
                          const featureOpen = openFeatures.has(feature.title);
                          const featureId = `about-feature-${feature.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
                          return (
                            <article key={feature.title} className={`overflow-hidden rounded-xl border ${innerCard}`}>
                              <button
                                type="button"
                                aria-expanded={featureOpen}
                                aria-controls={featureId}
                                onClick={() => toggleFeature(feature.title)}
                                className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-slate-500/5 active:bg-slate-500/10"
                              >
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                                  <FeatureIcon className="h-5 w-5" />
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block text-sm font-bold sm:text-base">{feature.title}</span>
                                  <span className={`mt-1 block text-xs ${muted}`}>View details</span>
                                </span>
                                <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 ${featureOpen ? 'rotate-180' : ''}`} />
                              </button>
                              {featureOpen && (
                                <div id={featureId} className={`space-y-4 border-t p-4 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                                  <div>
                                    <h4 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">What it does</h4>
                                    <p className={`mt-1 text-sm leading-6 ${bodyText}`}>{feature.purpose}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">How it works</h4>
                                    {feature.title === 'PDF Reports' ? (
                                      <div className="mt-2 space-y-3">
                                        <div className={`rounded-lg border p-3 ${card}`}>
                                          <h5 className="text-sm font-bold">1. PDF Preview & Viewer</h5>
                                          <p className={`mt-1 text-sm leading-6 ${bodyText}`}>
                                            Open the generated report in the PDF preview before saving it. Review the pages and use the viewer’s available controls to read the content. Zoom in to inspect small text and zoom out to see more of a page when the viewer supports those controls. Check the report before downloading or sharing it.
                                          </p>
                                        </div>
                                        <div className={`rounded-lg border p-3 ${card}`}>
                                          <h5 className="text-sm font-bold">2. Download & Save PDF</h5>
                                          <p className={`mt-1 text-sm leading-6 ${bodyText}`}>
                                            Choose the save/download option to open Android’s file-save dialog. Select a filename and an available folder, such as Downloads or Documents, then confirm saving. The PDF is saved to the location you selected. Later, open that folder in your device’s Files app to find it. It will only be in Downloads if you selected Downloads as the destination.
                                          </p>
                                        </div>
                                      </div>
                                    ) : (
                                      <p className={`mt-1 text-sm leading-6 ${bodyText}`}>{feature.howItWorks}</p>
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Why use it</h4>
                                    <p className={`mt-1 text-sm leading-6 ${bodyText}`}>{feature.whyUse}</p>
                                  </div>
                                </div>
                              )}
                            </article>
                          );
                        })}
                      </div>
                    )}

                    {section.key === 'privacy' && (
                      <div className="space-y-3">
                        <div className={`rounded-xl border p-4 ${innerCard}`}>
                          <div className="flex items-start gap-3">
                            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                            <div>
                              <h3 className="text-sm font-bold">Offline use</h3>
                              <p className={`mt-1 text-sm leading-7 ${bodyText}`}>
                                Kripin is designed to support offline use for features that do not require a network connection. Which features remain available offline depends on the app’s implementation and the data already available on your device.
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className={`rounded-xl border p-4 ${innerCard}`}>
                          <h3 className="text-sm font-bold">Your data and privacy</h3>
                          <p className={`mt-1 text-sm leading-7 ${bodyText}`}>
                            The exact storage location and protection of your records depend on the app’s storage implementation. Exporting or sharing a PDF can create a separate copy outside Kripin, depending on the location or app you choose. Review the destination before saving and share financial reports only with people you trust.
                          </p>
                        </div>
                      </div>
                    )}

                    {section.key === 'developer' && (
                      <div className={`rounded-xl border p-4 ${innerCard}`}>
                        <p className={`text-sm ${muted}`}>Developed by</p>
                        <p className="mt-1 text-lg font-extrabold">
                          Jitesh |<span className="ml-2"><span className="text-red-500">J</span><span className={isDarkMode ? 'text-white' : 'text-slate-800'}>Tech Labs</span></span>
                        </p>
                        <p className={`mt-3 text-sm leading-6 ${muted}`}>
                          Built using React.js, TypeScript, Vite and Tailwind CSS with Progressive Web App support.
                        </p>
                        <p className={`mt-3 text-xs font-semibold ${muted}`}>Kripin · Smart Expense Diary · Version {APP_VERSION}</p>
                      </div>
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        <footer className="py-6 text-center">
          <p className={`text-xs font-semibold ${muted}`}>Kripin · Smart Expense Diary</p>
          <p className={`mt-1 text-[11px] ${muted}`}>
            Developed by Jitesh · <span className="text-red-500">J</span>
            <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>Tech Labs</span>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AboutKripin;
