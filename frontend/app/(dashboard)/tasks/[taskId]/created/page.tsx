'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useParams } from 'next/navigation';
import { CheckCircle2, ArrowRight, Loader2, Clock, Sparkles } from 'lucide-react';

function TaskCreatedContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const taskId = params.taskId as string;
  const location = searchParams.get('location') || 'Unknown';
  const keyword = searchParams.get('keyword') || 'Unknown';

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card p-8 md:p-12 max-w-lg w-full text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/60 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-emerald-50/60 dark:ring-emerald-950/30">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">Scraping task created</h1>

        {/* Task ID Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4">
          <span className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">{taskId}</span>
        </div>

        {/* Intent */}
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
          <span className="font-bold text-slate-900 dark:text-slate-100">{location}</span>
          {' + '}
          <span className="font-bold text-slate-900 dark:text-slate-100">{keyword}</span>
        </p>

        {/* Status */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 rounded-full mb-6">
          <Loader2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 animate-spin" />
          <span className="text-xs font-bold text-teal-700 dark:text-teal-300">RUNNING</span>
        </div>

        {/* Queue Message */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 mb-6 flex items-start gap-3 text-left">
          <Clock className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Your task has been added to the scraping queue.</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              The crawler is now discovering organizations, identifying official websites, and extracting public contact information.
            </p>
          </div>
        </div>

        {/* Primary CTA */}
        <Link
          href={`/tasks/${taskId}/progress`}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-teal-600/20 transition-all duration-200"
        >
          <Sparkles className="w-4 h-4" />
          View Live Progress
          <ArrowRight className="w-4 h-4" />
        </Link>

        <div className="mt-4">
          <Link href="/dashboard" className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function TaskCreatedPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-teal-200 dark:border-teal-800 border-t-teal-600 dark:border-t-teal-400 rounded-full animate-spin" /></div>}>
      <TaskCreatedContent />
    </Suspense>
  );
}
