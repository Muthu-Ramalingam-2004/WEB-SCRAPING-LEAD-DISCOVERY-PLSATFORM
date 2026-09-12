'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2,
  CheckCircle2,
  Circle,
  MapPin,
  Search,
  Users,
  Globe,
  Phone,
  Mail,
  MapPinned,
  Copy,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from 'lucide-react';
import { getTaskProgress } from '@/lib/api';
import { ScrapingProgress } from '@/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton';

export default function ProgressPage() {
  const params = useParams();
  const taskId = params.taskId as string;
  const [progress, setProgress] = useState<ScrapingProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFailed, setShowFailed] = useState(false);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  useEffect(() => {
    let isMounted = true;
    let timerId: NodeJS.Timeout | null = null;

    async function fetchProgress() {
      try {
        const data = await getTaskProgress(taskId);
        if (isMounted && data) {
          setProgress(data);
          setAnimatedPercentage(data.percentage);
          setLoading(false);

          // Continue polling if task is running and not completed
          const isTerminal = ["COMPLETED", "COMPLETED_WITH_ERRORS", "FAILED", "CANCELLED"].includes(data.status) || data.percentage >= 100;
          if (!isTerminal) {
            timerId = setTimeout(fetchProgress, 2000);
          }
        }
      } catch {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProgress();

    return () => {
      isMounted = false;
      if (timerId) clearTimeout(timerId);
    };
  }, [taskId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (!progress) return null;

  const metrics = [
    { label: 'Results Discovered', value: progress.resultsDiscovered, icon: Users, color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60' },
    { label: 'Websites Found', value: progress.websitesFound, icon: Globe, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60' },
    { label: 'Websites Crawled', value: progress.websitesCrawled, icon: Globe, color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60' },
    { label: 'Phones Found', value: progress.phonesFound, icon: Phone, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60' },
    { label: 'Emails Found', value: progress.emailsFound, icon: Mail, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60' },
    { label: 'Addresses Found', value: progress.addressesFound, icon: MapPinned, color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60' },
    { label: 'Duplicates Removed', value: progress.duplicatesRemoved, icon: Copy, color: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Scraping in progress</h1>
            <StatusBadge status={progress.status} />
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300">{taskId}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{progress.location}</span>
            <span className="flex items-center gap-1"><Search className="w-3.5 h-3.5" />{progress.keyword}</span>
          </div>
        </div>
        <Link
          href={`/leads?taskId=${taskId}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-sm transition-all shrink-0"
        >
          View Leads <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Large Progress Indicator */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card p-6 md:p-8">
        <div className="flex items-center justify-center mb-6">
          <div className="relative w-36 h-36">
            {/* Background circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" stroke="currentColor" strokeWidth="10" fill="none" className="text-slate-100 dark:text-slate-800" />
              <circle
                cx="60" cy="60" r="52" stroke="currentColor" strokeWidth="10" fill="none"
                className="text-teal-500 transition-all duration-1000 ease-out"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 52}`}
                strokeDashoffset={`${2 * Math.PI * 52 * (1 - animatedPercentage / 100)}`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-slate-100">{animatedPercentage}%</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 mb-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full transition-all duration-1000 ease-out animate-progress-pulse"
            style={{ width: `${animatedPercentage}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          Crawling {progress.websitesCrawled} of {progress.websitesFound} websites
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{m.value}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">{m.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Timeline */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card p-6">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mb-5">Activity Timeline</h3>
          <div className="space-y-0">
            {progress.timeline.map((item, i) => (
              <div key={item.id} className="flex gap-3">
                {/* Timeline Line */}
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    item.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-950/60' :
                    item.status === 'in_progress' ? 'bg-teal-100 dark:bg-teal-950/60 animate-pulse' :
                    'bg-slate-100 dark:bg-slate-800'
                  }`}>
                    {item.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                    {item.status === 'in_progress' && <Loader2 className="w-4 h-4 text-teal-600 dark:text-teal-400 animate-spin" />}
                    {item.status === 'pending' && <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600" />}
                  </div>
                  {i < progress.timeline.length - 1 && (
                    <div className={`w-0.5 h-8 ${
                      item.status === 'completed' ? 'bg-emerald-200 dark:bg-emerald-900' : 'bg-slate-200 dark:bg-slate-800'
                    }`} />
                  )}
                </div>
                {/* Content */}
                <div className="pb-6">
                  <p className={`text-sm font-bold ${
                    item.status === 'pending' ? 'text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'
                  }`}>
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.description}</p>
                  )}
                  {item.timestamp && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{item.timestamp}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Crawl + Failed Websites */}
        <div className="space-y-4">
          {/* Current Crawl */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card p-6">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mb-4">Current Crawl</h3>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Website</p>
                <p className="text-sm font-bold text-teal-700 dark:text-teal-400 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  {progress.currentWebsite}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Current Page</p>
                <p className="text-sm font-mono text-slate-600 dark:text-slate-300">{progress.currentPage}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Pages Crawled</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full"
                      style={{ width: `${(progress.pagesCrawledForCurrentSite / progress.maxPagesForCurrentSite) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    {progress.pagesCrawledForCurrentSite} / {progress.maxPagesForCurrentSite}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Failed Websites */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
            <button
              onClick={() => setShowFailed(!showFailed)}
              className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  Failed Websites
                  <span className="ml-2 text-xs font-bold text-slate-400 dark:text-slate-500">
                    ({progress.failedWebsites.length})
                  </span>
                </h3>
              </div>
              {showFailed ? <ChevronUp className="w-4 h-4 text-slate-400 dark:text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500" />}
            </button>

            {showFailed && (
              <div className="px-6 pb-4">
                <div className="bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 rounded-xl p-3 mb-3">
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    Some websites could not be accessed, but the task is continuing. Other websites are still being crawled.
                  </p>
                </div>
                <div className="space-y-2">
                  {progress.failedWebsites.map((fw) => (
                    <div key={fw.url} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 rounded-lg px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{fw.domain}</span>
                      </div>
                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900">
                        {fw.reason}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
