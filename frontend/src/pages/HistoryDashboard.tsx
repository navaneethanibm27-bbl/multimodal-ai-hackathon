import React, { useState, useEffect } from 'react';
import {
  History,
  Trash2,
  RefreshCw,
  Loader2,
  AlertCircle,
  Database
} from 'lucide-react';
import { HistoryRecord } from '../types';
import { api } from '../services/api';

interface HistoryDashboardProps {
  onOpenReportModal?: () => void;
}

export const HistoryDashboard: React.FC<HistoryDashboardProps> = () => {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getHistory();
      setRecords(res.records);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch prediction history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await api.deleteHistoryRecord(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 py-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-teal-700 uppercase tracking-wider">
            <History className="w-4 h-4" />
            <span>Audit Trail & Persistence</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Prediction History & Saved Records
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Privacy-preserving audit log. Stores zero patient identifying names or demographic IDs.
            Backed by local SQLite persistence.
          </p>
        </div>

        <button
          onClick={fetchHistory}
          disabled={isLoading}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors flex items-center space-x-1.5 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh History</span>
        </button>
      </div>

      {isLoading && (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-xs text-center space-y-3">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
          <div className="text-sm font-semibold text-slate-800">Loading Analysis History...</div>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 p-6 rounded-3xl border border-rose-200 text-xs text-rose-900 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">History Service Error:</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {!isLoading && !error && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          {records.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Database className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-sm font-semibold text-slate-700">No Analysis Records Stored</div>
              <div className="text-xs text-slate-400">
                Run an analysis and select "Save Record" to log decision-support outputs locally.
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                    <th className="pb-3 font-semibold">Record ID</th>
                    <th className="pb-3 font-semibold">Timestamp</th>
                    <th className="pb-3 font-semibold">CAD Risk</th>
                    <th className="pb-3 font-semibold">LAD Stenosis</th>
                    <th className="pb-3 font-semibold">LCX Stenosis</th>
                    <th className="pb-3 font-semibold">RCA Stenosis</th>
                    <th className="pb-3 font-semibold">Data Quality</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-mono font-bold text-slate-800">#{r.id}</td>
                      <td className="py-3 text-slate-600 font-medium">
                        {r.created_at ? new Date(r.created_at).toLocaleString() : 'Recent'}
                      </td>
                      <td className="py-3 font-black text-slate-900">
                        <span className={r.cad_probability >= 65 ? 'text-rose-600' : (r.cad_probability >= 35 ? 'text-amber-700' : 'text-emerald-600')}>
                          {r.cad_probability}%
                        </span>
                      </td>
                      <td className="py-3 font-bold text-slate-700">{r.lad_probability}%</td>
                      <td className="py-3 font-bold text-slate-700">{r.lcx_probability}%</td>
                      <td className="py-3 font-bold text-slate-700">{r.rca_probability}%</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                          {r.data_quality_score}/100
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleDelete(r.id)}
                          disabled={deletingId === r.id}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          title="Delete Record"
                        >
                          {deletingId === r.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
