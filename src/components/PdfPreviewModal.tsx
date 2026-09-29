import React, { useState, useEffect, useRef } from 'react';
import type jsPDF from 'jspdf';
import { Download, X, Eye, FileText, Check, Pencil, Sparkles } from 'lucide-react';
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
const [isRenderingPdf, setIsRenderingPdf] = useState(false);

const pdfPreviewRef = useRef<HTMLDivElement | null>(null);

useEffect(() => {
  if (!isOpen || !pdfDoc) {
    setPdfBlobUrl(null);
    return;
  }

  let cancelled = false;
  let pdfInstance: import('pdfjs-dist').PDFDocumentProxy | null = null;
  let objectUrl: string | null = null;

  const renderPdf = async () => {
    try {
      setIsRenderingPdf(true);

      const blob = pdfDoc.output('blob');
      objectUrl = URL.createObjectURL(blob);

      setPdfBlobUrl(objectUrl);

      const arrayBuffer = await blob.arrayBuffer();

      if (cancelled) return;

     const pdfjsLib = await import('pdfjs-dist');

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const loadingTask = pdfjsLib.getDocument({
  data: new Uint8Array(arrayBuffer),
});

      pdfInstance = await loadingTask.promise;

      if (cancelled || !pdfPreviewRef.current) return;

      const container = pdfPreviewRef.current;
      container.innerHTML = '';

      for (
        let pageNumber = 1;
        pageNumber <= pdfInstance.numPages;
        pageNumber++
      ) {
        if (cancelled) break;

        const page = await pdfInstance.getPage(pageNumber);

        const baseViewport = page.getViewport({ scale: 1 });

        const availableWidth = Math.max(
  container.clientWidth - 16,
  280
);

// Keep the PDF readable instead of shrinking the whole A4 page.
const zoomMultiplier = window.innerWidth < 640 ? 1.45 : 1.25;

const scale =
  (availableWidth / baseViewport.width) * zoomMultiplier;

const viewport = page.getViewport({ scale });

const pageWrapper = document.createElement('div');

pageWrapper.className =
  'w-max min-w-full flex justify-center mb-4 last:mb-0';

const canvas = document.createElement('canvas');

canvas.className =
  'block h-auto bg-white rounded-lg shadow-lg';

        const context = canvas.getContext('2d');

        if (!context) continue;

        const devicePixelRatio = window.devicePixelRatio || 1;

        canvas.width = Math.floor(
          viewport.width * devicePixelRatio
        );

        canvas.height = Math.floor(
          viewport.height * devicePixelRatio
        );

        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        context.setTransform(
          devicePixelRatio,
          0,
          0,
          devicePixelRatio,
          0,
          0
        );

        pageWrapper.appendChild(canvas);
        container.appendChild(pageWrapper);

await page.render({
  canvasContext: context,
  viewport,
  canvas,
}).promise;
      }

      if (!cancelled) {
        setIsRenderingPdf(false);
      }
    } catch (err) {
      console.error('Error rendering PDF preview:', err);

      if (!cancelled) {
        setIsRenderingPdf(false);
      }
    }
  };

  renderPdf();

  return () => {
    cancelled = true;

    if (pdfInstance) {pdfInstance.cleanup();}

    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
  };
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


{/* Modal Body - PDF Preview */}
<div className="flex-1 overflow-y-auto p-3 sm:p-5 min-h-[280px] sm:min-h-[420px] bg-slate-950/40">
  <div className="w-full max-w-[820px] mx-auto rounded-2xl bg-slate-400/60 p-2 sm:p-4 overflow-x-auto">

    {isRenderingPdf && (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <FileText className="w-10 h-10 text-emerald-500 animate-pulse" />
        <p className="text-xs font-semibold text-slate-500">
          Rendering PDF preview...
        </p>
      </div>
    )}

    {/* PDF.js renders canvases here */}
    <div
      ref={pdfPreviewRef}
      className="w-full"
    />
  </div>

  <p
  className={`text-[10px] text-center flex items-center justify-center gap-1 mt-2 ${
    isDarkMode ? 'text-slate-400' : 'text-slate-600'
  }`}
>
  <Sparkles className="w-3 h-3 text-emerald-500" />
  <span>Preview generated inside Kripin</span>
</p>
</div>

        {/* Modal Footer Actions */}
        <div
          className={`px-4 sm:px-6 py-3.5 border-t flex flex-col-reverse xs:flex-row items-center justify-between gap-2.5 shrink-0 ${
            isDarkMode
              ? 'border-slate-800 bg-slate-950/80'
              : 'border-slate-200 bg-slate-50'
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