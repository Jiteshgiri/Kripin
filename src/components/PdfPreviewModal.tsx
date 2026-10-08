import { Capacitor } from '@capacitor/core';
import { PdfSaver } from '../utils/pdfSaver';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type jsPDF from 'jspdf';
import { Download, X, Eye, Check, Pencil, ZoomIn, ZoomOut, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';
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

  const [pdfInstance, setPdfInstance] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isRendering, setIsRendering] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen || !pdfDoc) {
      setPdfBlobUrl(null);
      setPdfInstance(null);
      setCurrentPage(1);
      setPageCount(0);
      setZoom(1);
      setPdfError(null);
      return;
    }

    if (!Capacitor.isNativePlatform()) {
      const blob = pdfDoc.output('blob');
      const objectUrl = URL.createObjectURL(blob);

      setPdfBlobUrl(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }
  }, [isOpen, pdfDoc]);

  useEffect(() => {
    if (!isOpen || !pdfDoc || !Capacitor.isNativePlatform()) {
      return;
    }

    let cancelled = false;

    const loadPdf = async () => {
      try {
        setPdfError(null);

        const pdfjsLib = await import('pdfjs-dist');

        const workerUrl = (
          await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
        ).default;

        pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

        const pdfBytes = pdfDoc.output('arraybuffer');

        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(pdfBytes),
        });

        const loadedPdf = await loadingTask.promise;

        if (cancelled) return;

        setPdfInstance(loadedPdf);
        setPageCount(loadedPdf.numPages);
        setCurrentPage(1);
        setZoom(1);
      } catch (error) {
        console.error('[Kripin PDF] PDF load failed:', error);

        if (!cancelled) {
          setPdfError(
            error instanceof Error
              ? error.message
              : 'Unable to load PDF.'
          );
        }
      }
    };

    void loadPdf();

    return () => {
      cancelled = true;
    };
  }, [isOpen, pdfDoc]);

  const renderCurrentPage = useCallback(async () => {
    if (!pdfInstance || !canvasRef.current || !previewRef.current) {
      return;
    }

    setIsRendering(true);

    try {
      const page = await pdfInstance.getPage(currentPage);

      if (!canvasRef.current || !previewRef.current) {
        return;
      }

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Unable to create PDF canvas.');
      }

      const baseViewport = page.getViewport({ scale: 1 });

      const availableWidth = Math.max(
        previewRef.current.clientWidth - 24,
        280
      );

      const fitScale = availableWidth / baseViewport.width;

      const finalScale = Math.min(
        Math.max(fitScale * zoom, 0.45),
        2.8
      );

      const viewport = page.getViewport({
        scale: finalScale,
      });

      // Render PDF at the phone's real pixel density so text stays sharp.
      const devicePixelRatio = Math.min(
        window.devicePixelRatio || 1,
        3
      );

      canvas.width = Math.ceil(
        viewport.width * devicePixelRatio
      );

      canvas.height = Math.ceil(
        viewport.height * devicePixelRatio
      );

      // Keep the displayed CSS size independent from the
      // high-resolution canvas backing size.
      canvas.style.width = `${Math.ceil(viewport.width)}px`;
      canvas.style.height = `${Math.ceil(viewport.height)}px`;

      context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      await page.render({
        canvas,
        canvasContext: context,
        viewport,
        transform: [
          devicePixelRatio,
          0,
          0,
          devicePixelRatio,
          0,
          0,
        ],
      }).promise;
    } catch (error) {
      console.error('[Kripin PDF] Page render failed:', error);

      setPdfError(
        error instanceof Error
          ? error.message
          : 'Unable to render PDF page.'
      );
    } finally {
      setIsRendering(false);
    }
  }, [pdfInstance, currentPage, zoom]);

  useEffect(() => {
    if (!pdfInstance) return;

    const timer = window.setTimeout(() => {
      void renderCurrentPage();
    }, 50);

    return () => {
      window.clearTimeout(timer);
    };
  }, [pdfInstance, currentPage, zoom, renderCurrentPage]);

  useEffect(() => {
    if (!pdfInstance || !previewRef.current) return;

    const handleResize = () => {
      void renderCurrentPage();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [pdfInstance, renderCurrentPage]);

  const handleZoomIn = () => {
    setZoom((value) => Math.min(value + 0.2, 2.8));
  };

  const handleZoomOut = () => {
    setZoom((value) => Math.max(value - 0.2, 0.6));
  };

  const handleFit = () => {
    setZoom(1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((page) =>
      Math.min(page + 1, pageCount)
    );
  };

  const handleTriggerDownload = async () => {
    if (!pdfDoc) return;

    setIsDownloading(true);

    const fileName = `Expense_Report_${monthLabel.replace(
      /[\s,]+/g,
      '_'
    )}.pdf`;

    try {
      if (Capacitor.isNativePlatform()) {
        const dataUri = pdfDoc.output('datauristring');
        const base64 = dataUri.split(',')[1];

        if (!base64) {
          throw new Error('PDF base64 data is empty.');
        }

        const result = await PdfSaver.savePdf({
          fileName,
          base64,
        });

        console.log('[Kripin PDF] Native save success:', result);

        setDownloadSuccess(true);

        setTimeout(() => {
          setDownloadSuccess(false);
        }, 2500);
      } else {
        pdfDoc.save(fileName);

        setDownloadSuccess(true);

        setTimeout(() => {
          setDownloadSuccess(false);
        }, 2500);
      }
    } catch (error) {
      console.error('[Kripin PDF] Save failed:', error);

      const err = error as { message?: string };

      alert(
        `PDF save failed.\n\n${err.message ?? String(error)}`
      );
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen || !pdfDoc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md">
      <div
        className={`w-full max-w-5xl h-[94vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
          isDarkMode
            ? 'bg-slate-900 border-slate-700 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div
          className={`flex items-center justify-between px-4 sm:px-6 py-3 border-b shrink-0 ${
            isDarkMode
              ? 'border-slate-800 bg-slate-950/80'
              : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Eye className="w-4 h-4 text-emerald-500" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold truncate">
                  PDF Statement Preview
                </h3>

                <span className="px-2 py-0.5 text-[10px] font-bold whitespace-nowrap rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  {monthLabel}
                </span>
              </div>

              <p className="text-[11px] opacity-60">
                Actual PDF preview
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-500/10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {Capacitor.isNativePlatform() && pdfInstance && (
          <div
            className={`flex items-center justify-center gap-2 px-3 py-2 border-b shrink-0 ${
              isDarkMode
                ? 'border-slate-800 bg-slate-900'
                : 'border-slate-200 bg-white'
            }`}
          >
            <button
              onClick={handlePreviousPage}
              disabled={currentPage <= 1}
              className="w-10 h-10 rounded-xl border flex items-center justify-center disabled:opacity-30"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="min-w-[70px] text-center text-xs font-bold">
              {currentPage} / {pageCount}
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage >= pageCount}
              className="w-10 h-10 rounded-xl border flex items-center justify-center disabled:opacity-30"
              aria-label="Next page"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="w-px h-7 bg-slate-500/20 mx-1" />

            <button
              onClick={handleZoomOut}
              disabled={zoom <= 0.6}
              className="w-10 h-10 rounded-xl border flex items-center justify-center disabled:opacity-30"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <span className="text-[11px] font-bold min-w-[42px] text-center">
              {Math.round(zoom * 100)}%
            </span>

            <button
              onClick={handleZoomIn}
              disabled={zoom >= 2.8}
              className="w-10 h-10 rounded-xl border flex items-center justify-center disabled:opacity-30"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              onClick={handleFit}
              className="w-10 h-10 rounded-xl border flex items-center justify-center"
              aria-label="Fit PDF"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        )}

        <div
          ref={previewRef}
          className="flex-1 overflow-auto p-3 sm:p-5 bg-slate-950/70"
        >
          {Capacitor.isNativePlatform() ? (
            <div className="min-w-0 min-h-full w-full overflow-auto">
              <div className="min-w-max min-h-full flex justify-start items-start p-3 sm:p-5">
                {pdfError ? (
                <div className="w-full max-w-md mt-10 p-6 rounded-2xl border bg-slate-900 text-center">
                  <p className="font-bold text-red-400">
                    PDF preview unavailable
                  </p>

                  <p className="text-xs opacity-60 mt-2">
                    {pdfError}
                  </p>
                </div>
              ) : !pdfInstance ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />

                  <p className="mt-4 text-sm font-bold">
                    Loading PDF...
                  </p>
                </div>
              ) : (
                <div className="relative inline-block">
                  <canvas
                    ref={canvasRef}
                    className="block bg-white shadow-2xl"
                  />

                  {isRendering && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/30">
                      <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                )}
              </div>
            </div>
          ) : (
            <iframe
              title="PDF Statement Preview"
              src={pdfBlobUrl ?? undefined}
              className="w-full h-full min-h-[70vh] rounded-2xl bg-white"
            />
          )}
        </div>

        <div
          className={`px-4 sm:px-6 py-3 border-t flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 shrink-0 ${
            isDarkMode
              ? 'border-slate-800 bg-slate-950/90'
              : 'border-slate-200 bg-slate-50'
          }`}
        >
          <button
            onClick={onClose}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700 text-slate-300'
                : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Close / Edit Data</span>
          </button>

          <button
            onClick={handleTriggerDownload}
            disabled={isDownloading}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-extrabold text-white flex items-center justify-center gap-2 ${
              downloadSuccess
                ? 'bg-teal-600'
                : 'bg-emerald-600'
            }`}
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4" />
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



