import React, { useState, useEffect } from 'react';
import { X, Printer, Download, Loader2, AlertCircle, FileText } from 'lucide-react';
import { PredictionResponse } from '../../types';
import { api } from '../../services/api';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  prediction: PredictionResponse | null;
  patientFeatures: Record<string, any> | null;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  prediction,
  patientFeatures
}) => {
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !prediction || !patientFeatures) return;

    const fetchReport = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const html = await api.getReportHtml(prediction, patientFeatures);
        setHtmlContent(html);
      } catch (err: any) {
        setError(err.message || 'Failed to render report.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [isOpen, prediction, patientFeatures]);

  if (!isOpen) return null;

  const handlePrint = () => {
    const iframe = document.getElementById('report-iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }
  };

  const handleDownloadHtml = () => {
    if (!htmlContent) return;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CardioVision_Report_${prediction?.prediction_id || 'export'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl h-[88vh] rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Transparent Decision Support Report #{prediction?.prediction_id}
              </h3>
              <p className="text-[11px] text-slate-500">
                Self-contained medical analytics report • Print to PDF enabled
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              disabled={isLoading || !htmlContent}
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print to PDF</span>
            </button>

            <button
              onClick={handleDownloadHtml}
              disabled={isLoading || !htmlContent}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save HTML</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 bg-slate-100 p-2 overflow-hidden relative">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-xs space-y-2">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
              <div className="text-xs font-semibold text-slate-700">Compiling Report Documents...</div>
            </div>
          )}

          {error && (
            <div className="m-6 p-6 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <div className="font-bold">Report Generation Failed:</div>
                <div className="mt-1">{error}</div>
              </div>
            </div>
          )}

          {htmlContent && (
            <iframe
              id="report-iframe"
              srcDoc={htmlContent}
              title="CardioVision AI Medical Report"
              className="w-full h-full bg-white rounded-2xl border border-slate-200"
            />
          )}
        </div>
      </div>
    </div>
  );
};
