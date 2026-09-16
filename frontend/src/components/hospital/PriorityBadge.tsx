import React from 'react';
import { OperationalPriority } from '@/types/hospital';
import { getPriorityColor } from '@/lib/demo/utils';

interface PriorityBadgeProps {
  priority: OperationalPriority;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function PriorityBadge({ priority, size = 'md', showLabel = true }: PriorityBadgeProps) {
  const colors = getPriorityColor(priority);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-medium tracking-wide ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses}`}
      title={`Operational Priority: ${priority}`}
    >
      <span className={`w-2 h-2 rounded-full ${colors.dot} ${priority === 'Critical' ? 'animate-pulse' : ''}`} />
      {showLabel ? priority.toUpperCase() : null}
    </span>
  );
}
