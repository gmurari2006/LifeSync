'use client';

import React, { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-8 text-center space-y-3 shadow-sm ${className}`}
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        {icon || <Inbox className="h-6 w-6" />}
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">{description}</p>
      </div>
      {action && (
        <div className="pt-2">
          <button
            onClick={action.onClick}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {action.label}
          </button>
        </div>
      )}
    </div>
  );
}
