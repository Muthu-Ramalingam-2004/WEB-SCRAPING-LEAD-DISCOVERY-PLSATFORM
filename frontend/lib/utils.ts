import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TaskStatus, ConfidenceLevel } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStatusBadgeStyle(status: TaskStatus): {
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  className: string;
  label: string;
} {
  switch (status) {
    case 'COMPLETED':
      return {
        variant: 'default',
        className:
          'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/80',
        label: 'Completed',
      };
    case 'RUNNING':
      return {
        variant: 'secondary',
        className:
          'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-950/80 animate-pulse',
        label: 'Running',
      };
    case 'PAUSED':
      return {
        variant: 'outline',
        className:
          'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-950/80',
        label: 'Paused',
      };
    case 'FAILED':
      return {
        variant: 'destructive',
        className:
          'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-950/80',
        label: 'Failed',
      };
    case 'PENDING':
    default:
      return {
        variant: 'outline',
        className:
          'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800',
        label: 'Pending',
      };
  }
}

export function getConfidenceBadgeStyle(confidence: ConfidenceLevel): {
  className: string;
  label: string;
} {
  switch (confidence) {
    case 'HIGH':
      return {
        className:
          'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 font-semibold',
        label: 'HIGH CONFIDENCE',
      };
    case 'MEDIUM':
      return {
        className:
          'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800 font-semibold',
        label: 'MEDIUM CONFIDENCE',
      };
    case 'LOW':
      return {
        className:
          'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 font-semibold',
        label: 'LOW CONFIDENCE',
      };
  }
}
