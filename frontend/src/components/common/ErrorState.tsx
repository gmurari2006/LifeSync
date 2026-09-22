'use client';

import React from 'react';
import { AlertOctagon, RotateCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Service Unavailable',
  message,
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <div
      className={`rounded-xl border border-red-200 bg-red-50/50 p-6 text-center space-y-3 shadow-sm ${className}`}
    >
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
        <AlertOctagon className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-red-900">{title}</h4>
        <p className="text-xs text-red-700 max-w-md mx-auto leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <div className="pt-2">
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}
    </div>
  );
}
