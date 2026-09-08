import React from 'react';
import { TaskStatus } from '@/types';
import { getStatusBadgeStyle } from '@/lib/utils';
import { CheckCircle2, Loader2, PauseCircle, AlertTriangle, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: TaskStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { className, label } = getStatusBadgeStyle(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${className}`}
    >
      {status === 'COMPLETED' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
      {status === 'RUNNING' && <Loader2 className="w-3.5 h-3.5 text-teal-600 animate-spin" />}
      {status === 'PAUSED' && <PauseCircle className="w-3.5 h-3.5 text-amber-600" />}
      {status === 'FAILED' && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
      {status === 'PENDING' && <Clock className="w-3.5 h-3.5 text-slate-500" />}
      {label}
    </span>
  );
};
