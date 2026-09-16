import React from 'react';
import { CaseStatus } from '@/types/hospital';
import { getStatusColor } from '@/lib/demo/utils';

interface StatusBadgeProps {
  status: CaseStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const colors = getStatusColor(status);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-0.5 text-xs',
  }[size];

  const label = status === 'Alerted' 
    ? 'Awaiting Ack' 
    : status.toUpperCase();

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses}`}
    >
      {label}
    </span>
  );
}
