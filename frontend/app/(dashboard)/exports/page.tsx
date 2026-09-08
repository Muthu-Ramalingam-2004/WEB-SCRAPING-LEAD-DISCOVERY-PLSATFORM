'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Download,
  ArrowRight,
  Calendar,
  Table2,
  FileDown,
} from 'lucide-react';
import { getExportHistory, exportLeadsToCsv, exportLeadsToExcel } from '@/lib/api';
import { ExportHistoryItem } from '@/types';
import { useToast } from '@/components/shared/ToastContext';
import { EmptyState } from '@/components/shared/EmptyState';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';

export default function ExportsPage() {
  const { showToast } = useToast();
  const [history, setHistory] = useState<ExportHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<'csv' | 'excel' | null>(null);

  useEffect(() => {
    async function load() {
      const data = await getExportHistory();
      setHistory(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleExportCsv = async () => {
    setExporting('csv');
    try {
      const result = await exportLeadsToCsv();
      showToast('CSV Export Ready', `File: ${result.fileName}`, 'success');
    } catch {
      showToast('Export failed', 'Please try again.', 'error');
    }
    setExporting(null);
  };

  const handleExportExcel = async () => {
    setExporting('excel');
    try {
      const result = await exportLeadsToExcel();
      showToast('Excel Export Ready', `File: ${result.fileName}`, 'success');
    } catch {
      showToast('Export failed', 'Please try again.', 'error');
    }
    setExporting(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Exports</h1>
        <p className="text-sm text-slate-500 mt-1">Download your lead data in your preferred format.</p>
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* CSV */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 hover:shadow-card-hover transition-shadow duration-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-extrabold text-slate-900">CSV Export</h3>
              <p className="text-sm text-slate-500 mt-1 mb-4">
                Download your lead data as a CSV file. Compatible with Google Sheets, Excel, and most data tools.
              </p>
              <button
                onClick={handleExportCsv}
                disabled={exporting === 'csv'}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl shadow-sm transition-all duration-200"
              >
                {exporting === 'csv' ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Excel */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 hover:shadow-card-hover transition-shadow duration-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-extrabold text-slate-900">Excel Export</h3>
              <p className="text-sm text-slate-500 mt-1 mb-4">
                Download your lead data as an Excel workbook. Formatted columns for immediate use.
              </p>
              <button
                onClick={handleExportExcel}
                disabled={exporting === 'excel'}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl shadow-sm transition-all duration-200"
              >
                {exporting === 'excel' ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Export Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Export History */}
      <div>
        <h2 className="text-lg font-extrabold text-slate-900 mb-4">Export History</h2>

        {loading ? (
          <TableSkeleton rows={3} />
        ) : history.length === 0 ? (
          <EmptyState
            icon={FileDown}
            title="No exports yet"
            description="Exported files will appear here after you download your leads."
          />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">File Name</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Task</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Format</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Rows</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Created</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          {item.format === 'CSV' ? (
                            <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <FileSpreadsheet className="w-4 h-4 text-blue-600 shrink-0" />
                          )}
                          <span className="text-sm font-medium text-slate-800 truncate">{item.fileName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-600">{item.taskTitle}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.format === 'CSV'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {item.format}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-700 font-bold text-right">{item.rows}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{item.createdAt}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 hover:text-teal-800 transition-colors">
                          <Download className="w-3.5 h-3.5" /> Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
