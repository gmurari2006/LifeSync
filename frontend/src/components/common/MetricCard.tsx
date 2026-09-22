'use client';

import React, { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: ReactNode;
  variant?: 'default' | 'critical' | 'warning' | 'success' | 'info';
  className?: string;
}

export function MetricCard({
  label,
  value,
  sublabel,
  icon,
  variant = 'default',
  className = '',
}: MetricCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'critical':
        return {
          border: 'border-red-200',
          valueColor: 'text-red-700',
          iconBg: 'bg-red-50 text-red-600',
        };
      case 'warning':
        return {
          border: 'border-amber-200',
          valueColor: 'text-amber-800',
          iconBg: 'bg-amber-50 text-amber-600',
        };
      case 'success':
        return {
          border: 'border-emerald-200',
          valueColor: 'text-emerald-700',
          iconBg: 'bg-emerald-50 text-emerald-600',
        };
      case 'info':
        return {
          border: 'border-blue-200',
          valueColor: 'text-blue-700',
          iconBg: 'bg-blue-50 text-blue-600',
        };
      case 'default':
      default:
        return {
          border: 'border-slate-200',
          valueColor: 'text-slate-900',
          iconBg: 'bg-slate-100 text-slate-600',
        };
    }
  };

  const v = getVariantStyles();

  return (
    <div
      className={`rounded-xl border bg-white p-4 shadow-sm space-y-1 transition-shadow hover:shadow ${v.border} ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <div className={`p-1.5 rounded-lg text-xs ${v.iconBg}`}>
            {icon}
          </div>
        )}
      </div>
      <div className={`text-2xl font-bold font-mono tracking-tight ${v.valueColor}`}>
        {value}
      </div>
      {sublabel && (
        <p className="text-[11px] text-slate-500 truncate">
          {sublabel}
        </p>
      )}
    </div>
  );
}
