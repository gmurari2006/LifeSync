import { OperationalPriority, CaseStatus, ResourceStatus } from '@/types/hospital';

export function getPriorityColor(priority: OperationalPriority): {
  bg: string;
  text: string;
  border: string;
  badgeBg: string;
  dot: string;
} {
  switch (priority) {
    case 'Critical':
      return {
        bg: 'bg-red-950/40',
        text: 'text-red-400',
        border: 'border-red-500/30',
        badgeBg: 'bg-red-500/10',
        dot: 'bg-red-500',
      };
    case 'High':
      return {
        bg: 'bg-amber-950/40',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        badgeBg: 'bg-amber-500/10',
        dot: 'bg-amber-400',
      };
    case 'Moderate':
      return {
        bg: 'bg-sky-950/40',
        text: 'text-sky-400',
        border: 'border-sky-500/30',
        badgeBg: 'bg-sky-500/10',
        dot: 'bg-sky-400',
      };
    case 'Low':
    default:
      return {
        bg: 'bg-emerald-950/40',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        badgeBg: 'bg-emerald-500/10',
        dot: 'bg-emerald-400',
      };
  }
}

export function getStatusColor(status: CaseStatus): {
  bg: string;
  text: string;
  border: string;
} {
  switch (status) {
    case 'Alerted':
      return { bg: 'bg-rose-500/15', text: 'text-rose-300', border: 'border-rose-500/40' };
    case 'Acknowledged':
      return { bg: 'bg-blue-500/15', text: 'text-blue-300', border: 'border-blue-500/40' };
    case 'Preparing':
      return { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/40' };
    case 'En Route':
      return { bg: 'bg-indigo-500/15', text: 'text-indigo-300', border: 'border-indigo-500/40' };
    case 'Arrived':
      return { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/40' };
    case 'Handover':
      return { bg: 'bg-emerald-500/20', text: 'text-emerald-200', border: 'border-emerald-400/50' };
    case 'Diverted':
      return { bg: 'bg-slate-700/30', text: 'text-slate-400', border: 'border-slate-600/40' };
    case 'Closed':
    default:
      return { bg: 'bg-slate-800/40', text: 'text-slate-400', border: 'border-slate-700/50' };
  }
}

export function getResourceStatusColor(status: ResourceStatus): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (status) {
    case 'Ready':
      return { bg: 'bg-emerald-950/40', text: 'text-emerald-400', border: 'border-emerald-500/40', dot: 'bg-emerald-400' };
    case 'Occupied':
      return { bg: 'bg-blue-950/40', text: 'text-blue-400', border: 'border-blue-500/40', dot: 'bg-blue-400' };
    case 'Limited':
      return { bg: 'bg-amber-950/40', text: 'text-amber-400', border: 'border-amber-500/40', dot: 'bg-amber-400' };
    case 'Unavailable':
    default:
      return { bg: 'bg-rose-950/40', text: 'text-rose-400', border: 'border-rose-500/40', dot: 'bg-rose-500' };
  }
}

export function formatEta(etaMinutes: number): string {
  if (etaMinutes <= 0) return 'Arrived at Bay';
  if (etaMinutes === 1) return '1 min';
  return `${etaMinutes} mins`;
}
