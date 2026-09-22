'use client';

import React from 'react';

interface LoadingStateProps {
  type?: 'card' | 'table' | 'detail';
  rows?: number;
  className?: string;
}

export function LoadingState({ type = 'card', rows = 3, className = '' }: LoadingStateProps) {
  if (type === 'table') {
    return (
      <div className={`rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-sm ${className}`}>
        <div className="h-5 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="space-y-2 pt-2">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-2 border-b border-slate-100 last:border-0">
              <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 flex-1 bg-slate-100 rounded animate-pulse" />
              <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'detail') {
    return (
      <div className={`rounded-xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm animate-pulse ${className}`}>
        <div className="flex items-center justify-between">
          <div className="h-6 w-48 bg-slate-200 rounded" />
          <div className="h-6 w-24 bg-slate-200 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="h-20 bg-slate-100 rounded-lg" />
          <div className="h-20 bg-slate-100 rounded-lg" />
          <div className="h-20 bg-slate-100 rounded-lg" />
        </div>
        <div className="h-32 bg-slate-50 rounded-lg" />
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-5 space-y-3 shadow-sm animate-pulse ${className}`}>
      <div className="h-5 w-1/3 bg-slate-200 rounded" />
      <div className="h-4 w-2/3 bg-slate-100 rounded" />
      <div className="h-16 bg-slate-50 rounded-lg" />
    </div>
  );
}
