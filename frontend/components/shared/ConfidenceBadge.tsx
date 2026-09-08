import React from 'react';
import { ConfidenceLevel } from '@/types';
import { getConfidenceBadgeStyle } from '@/lib/utils';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

interface ConfidenceBadgeProps {
  confidence: ConfidenceLevel;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ confidence }) => {
  const { className, label } = getConfidenceBadgeStyle(confidence);

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] uppercase tracking-wide border ${className}`}
    >
      {confidence === 'HIGH' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
      {confidence === 'MEDIUM' && <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />}
      {confidence === 'LOW' && <Shield className="w-3.5 h-3.5 text-slate-500" />}
      {label}
    </span>
  );
};
