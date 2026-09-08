import React from 'react';

export const CardSkeleton = () => (
  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="h-4 bg-slate-200 rounded w-1/3"></div>
      <div className="w-10 h-10 bg-slate-100 rounded-xl"></div>
    </div>
    <div className="h-8 bg-slate-200 rounded w-1/2 mb-2"></div>
    <div className="h-3 bg-slate-100 rounded w-2/3"></div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden animate-pulse">
    <div className="p-4 bg-slate-50 border-b border-slate-200 flex gap-4">
      <div className="h-4 bg-slate-200 rounded w-1/6"></div>
      <div className="h-4 bg-slate-200 rounded w-1/4"></div>
      <div className="h-4 bg-slate-200 rounded w-1/4"></div>
      <div className="h-4 bg-slate-200 rounded w-1/6"></div>
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="p-4 border-b border-slate-100 flex gap-4 items-center">
        <div className="h-4 bg-slate-100 rounded w-1/6"></div>
        <div className="h-4 bg-slate-100 rounded w-1/4"></div>
        <div className="h-4 bg-slate-100 rounded w-1/4"></div>
        <div className="h-4 bg-slate-100 rounded w-1/6"></div>
      </div>
    ))}
  </div>
);

export const LeadDetailSkeleton = () => (
  <div className="p-6 space-y-6 animate-pulse">
    <div className="flex items-center justify-between border-b pb-4">
      <div className="space-y-2">
        <div className="h-6 bg-slate-200 rounded w-48"></div>
        <div className="h-4 bg-slate-100 rounded w-24"></div>
      </div>
      <div className="h-6 bg-slate-200 rounded w-28"></div>
    </div>
    <div className="space-y-4">
      <div className="h-4 bg-slate-200 rounded w-32"></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-12 bg-slate-100 rounded-xl"></div>
        <div className="h-12 bg-slate-100 rounded-xl"></div>
      </div>
    </div>
  </div>
);
