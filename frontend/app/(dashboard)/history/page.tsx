'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  ExternalLink,
  Eye,
  Calendar,
  Clock,
  History as HistoryIcon,
} from 'lucide-react';
import { getTasks } from '@/lib/api';
import { ScrapingTask } from '@/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';

export default function HistoryPage() {
  const [tasks, setTasks] = useState<ScrapingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    async function load() {
      const data = await getTasks();
      setTasks(data);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = tasks.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.id.toLowerCase().includes(q) ||
      t.location.toLowerCase().includes(q) ||
      t.keyword.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Task History</h1>
        <p className="text-sm text-slate-500 mt-1">View and manage all your previous scraping tasks.</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by task ID, location or keyword..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          {['all', 'COMPLETED', 'RUNNING', 'FAILED', 'PAUSED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                statusFilter === s
                  ? 'bg-teal-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {s === 'all' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title="No tasks yet"
          description="Create your first scraping task to start discovering leads."
          actionLabel="Create Scraping Task"
          actionHref="/tasks/create"
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Task ID</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Keyword</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Results</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Websites</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Created</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Duration</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs font-bold text-slate-700">{task.id}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-700 font-medium">{task.location}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-600">{task.keyword}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-800 font-bold text-right">{task.resultsCount}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-600 text-right">{task.websitesCount}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={task.status} /></td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{task.createdAt}</span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{task.duration || '—'}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {task.status === 'RUNNING' ? (
                          <Link
                            href={`/tasks/${task.id}/progress`}
                            className="text-xs font-semibold text-teal-600 hover:text-teal-800 transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" /> Progress
                          </Link>
                        ) : (
                          <Link
                            href={`/leads?taskId=${task.id}`}
                            className="text-xs font-semibold text-teal-600 hover:text-teal-800 transition-colors flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" /> Leads
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
