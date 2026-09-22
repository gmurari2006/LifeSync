'use client';

import React from 'react';
import { Shield, Sparkles, UserCheck, Stethoscope, Navigation, Sliders, Server } from 'lucide-react';

export type ProvenanceSource =
  | 'CITIZEN REPORTED'
  | 'AI STRUCTURED'
  | 'EMS VERIFIED'
  | 'HUMAN CONFIRMED'
  | 'HUMAN OVERRIDE'
  | 'SIMULATED TELEMETRY'
  | 'SYSTEM';

interface ProvenanceBadgeProps {
  source: ProvenanceSource | string;
  className?: string;
  size?: 'xs' | 'sm';
}

export function ProvenanceBadge({ source, className = '', size = 'xs' }: ProvenanceBadgeProps) {
  const norm = (source || '').toUpperCase().trim();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let icon = <Server className="h-3 w-3 text-slate-500" />;
  let label = norm || 'SYSTEM';

  if (norm.includes('CITIZEN') || norm === 'CITIZEN REPORTED') {
    styles = 'bg-slate-100 text-slate-700 border-slate-200';
    icon = <Shield className="h-3 w-3 text-slate-500" />;
    label = 'CITIZEN REPORTED';
  } else if (norm.includes('AI') || norm === 'AI STRUCTURED') {
    styles = 'bg-purple-50 text-purple-700 border-purple-200';
    icon = <Sparkles className="h-3 w-3 text-purple-600" />;
    label = 'AI STRUCTURED';
  } else if (norm.includes('EMS') || norm === 'EMS VERIFIED') {
    styles = 'bg-indigo-50 text-indigo-700 border-indigo-200';
    icon = <Stethoscope className="h-3 w-3 text-indigo-600" />;
    label = 'EMS VERIFIED';
  } else if (norm.includes('OVERRIDE')) {
    styles = 'bg-amber-50 text-amber-800 border-amber-200';
    icon = <Sliders className="h-3 w-3 text-amber-600" />;
    label = 'HUMAN OVERRIDE';
  } else if (norm.includes('CONFIRMED')) {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    icon = <UserCheck className="h-3 w-3 text-emerald-600" />;
    label = 'HUMAN CONFIRMED';
  } else if (norm.includes('SIMULAT') || norm.includes('TELEMETRY')) {
    styles = 'bg-sky-50 text-sky-700 border-sky-200';
    icon = <Navigation className="h-3 w-3 text-sky-600" />;
    label = 'SIMULATED TELEMETRY';
  }

  const sizeCls = size === 'xs' ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-0.5 text-[10px]';

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono font-bold tracking-wide rounded border ${styles} ${sizeCls} ${className}`}
      title={`Data Provenance: ${label}`}
    >
      {icon}
      <span>{label}</span>
    </span>
  );
}
