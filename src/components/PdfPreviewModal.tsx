import logo from "../assets/images/Kripin.png";
import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { Download, X, Eye, FileText, Check, Pencil, Sparkles, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthLabel: string;
  pdfDoc: jsPDF | null;
  totalIncome: number;
  totalExpense: number;
  transactionCount: number;
  userProfile?: UserProfile;
  isDarkMode?: boolean;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  monthLabel,
  pdfDoc,
  totalIncome,
  totalExpense,
  transactionCount,
  userProfile,
  isDarkMode = true,
}) => {
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && pdfDoc) {
      try {
        const blob = pdfDoc.output('blob');
        const url = URL.createObjectURL(blob);
        setPdfBlobUrl(url);

        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (err) {
        console.error('Error generating PDF preview blob:', err);
      }
    } else {
      setPdfBlobUrl(null);
    }
  }, [isOpen, pdfDoc]);

  if (!isOpen || !pdfDoc) return null;

  const fileName = `Expense_Report_${monthLabel.replace(/[\s,]+/g, '_')}.pdf`;

  const handleTriggerDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      pdfDoc.save(fileName);
      setIsDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    }, 200);
  };

  const netBalance = totalIncome - totalExpense;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-3xl max-h-[92vh] sm:max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isDarkMode
            ? 'bg-slate-900 border-slate-700/80 text-slate-100 shadow-slate-950/80'
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-400/50'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`flex items-center justify-between px-4 sm:px-6 py-3.5 border-b shrink-0 ${
            isDarkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-slate-50/80'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Eye className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-extrabold tracking-tight truncate">
                  PDF Statement Preview
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                  {monthLabel}
                </span>
              </div>
              <p className={`text-[11px] font-medium truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Review document details before saving to device
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl border transition-colors ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'
                : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title="Close Preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Statement Stats Bar */}
        <div
          className={`px-4 sm:px-6 py-2.5 border-b grid grid-cols-3 gap-2 text-center text-xs font-bold shrink-0 ${
            isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-100/60 border-slate-200'
          }`}
        >
          <div className="p-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 truncate">
            <span className="text-[10px] uppercase block text-emerald-500">Income</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-xs sm:text-sm">
              +₹{totalIncome.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-1.5 rounded-xl bg-red-500/10 border border-red-500/20 truncate">
            <span className="text-[10px] uppercase block text-red-500">Expense</span>
            <span className="text-red-600 dark:text-red-400 font-extrabold text-xs sm:text-sm">
              -₹{totalExpense.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-1.5 rounded-xl bg-slate-500/10 border border-slate-500/20 truncate">
            <span className="text-[10px] uppercase block text-slate-400">Entries</span>
            <span className={`font-extrabold text-xs sm:text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {transactionCount} Items
            </span>
          </div>
        </div>

        {/* Modal Body - Embedded PDF Preview Container */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 flex flex-col items-center justify-center min-h-[280px] sm:min-h-[420px] bg-slate-950/40">
          {pdfBlobUrl ? (
            <div className="w-full h-full min-h-[300px] sm:min-h-[440px] flex flex-col gap-2">
              <iframe
                src={`${pdfBlobUrl}#toolbar=0&navpanes=0`}
                title="PDF Preview"
                className="w-full h-full min-h-[320px] sm:min-h-[440px] rounded-2xl border border-slate-700/60 bg-white shadow-xl"
              />
              <p className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1 mt-1">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                <span>Exact A4 Page layout statement generated with official JTech Labs seal</span>
              </p>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 flex flex-col items-center gap-2">
              <FileText className="w-10 h-10 animate-bounce text-emerald-500" />
              <p className="text-xs font-semibold">Generating statement preview...</p>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div
          className={`px-4 sm:px-6 py-3.5 border-t flex flex-col-reverse xs:flex-row items-center justify-between gap-2.5 shrink-0 ${
            isDarkMode ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-slate-50'
          }`}
        >
          {/* Close / Edit Button */}
          <button
            onClick={onClose}
            className={`w-full xs:w-auto px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95 ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Close / Edit Data</span>
          </button>

          {/* Download PDF Button */}
          <button
            onClick={handleTriggerDownload}
            disabled={isDownloading}
            className={`w-full xs:w-auto px-5 py-2.5 rounded-xl text-xs font-extrabold text-white transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 cursor-pointer ${
              downloadSuccess
                ? 'bg-teal-600 hover:bg-teal-500 shadow-teal-500/20'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
            }`}
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Downloaded Successfully!</span>
              </>
            ) : isDownloading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download PDF Statement</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
