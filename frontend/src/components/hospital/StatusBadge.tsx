import React from 'react';
import { CaseStatus } from '@/types/hospital';
import { getStatusColor } from '@/lib/demo/utils';

interface StatusBadgeProps {
  status?: CaseStatus | string | null;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const colors = getStatusColor(status as any);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-0.5 text-xs',
  }[size];

  const raw = (status || '').toString().trim().toUpperCase().replace(/\s+/g, '_');
  let label = (status || 'UNKNOWN').toString().replace(/_/g, ' ').toUpperCase();

  if (raw === 'ALERTED' || raw === 'HOSPITAL_ALERTED') {
    label = 'AWAITING ACK';
  } else if (raw === 'ACKNOWLEDGED' || raw === 'HOSPITAL_ACKNOWLEDGED') {
    label = 'ACKNOWLEDGED';
  } else if (raw === 'HANDOVER' || raw === 'HANDOVER_COMPLETE') {
    label = 'HANDOVER COMPLETE';
  }

  return (
    <span
      className={`inline-flex items-center font-bold tracking-wide rounded-full border ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses}`}
    >
      {label}
    </span>
  );
}
