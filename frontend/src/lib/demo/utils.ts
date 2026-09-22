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

export function getStatusColor(status: CaseStatus | string | null | undefined): {
  bg: string;
  text: string;
  border: string;
} {
  const normalized = (status || '').toString().trim().toUpperCase().replace(/\s+/g, '_');
  switch (normalized) {
    case 'ALERTED':
    case 'HOSPITAL_ALERTED':
    case 'REPORTED':
      return { bg: 'bg-rose-500/15', text: 'text-rose-300', border: 'border-rose-500/40' };
    case 'ACKNOWLEDGING':
    case 'ACKNOWLEDGED':
    case 'HOSPITAL_ACKNOWLEDGED':
    case 'PREPARING':
      return { bg: 'bg-blue-500/15', text: 'text-blue-300', border: 'border-blue-500/40' };
    case 'INFORMATION_STRUCTURED':
      return { bg: 'bg-purple-500/15', text: 'text-purple-300', border: 'border-purple-500/40' };
    case 'EMS_ASSIGNED':
    case 'EMS_ACCEPTED':
    case 'ON_SCENE':
    case 'ASSESSMENT_UPDATED':
    case 'PATIENT_LOADED':
    case 'EN_ROUTE':
    case 'TRANSPORTING':
      return { bg: 'bg-indigo-500/15', text: 'text-indigo-300', border: 'border-indigo-500/40' };
    case 'ARRIVED':
      return { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/40' };
    case 'HANDOVER':
    case 'HANDOVER_COMPLETE':
      return { bg: 'bg-emerald-500/20', text: 'text-emerald-200', border: 'border-emerald-400/50' };
    case 'DIVERTED':
      return { bg: 'bg-red-500/15', text: 'text-red-300', border: 'border-red-500/40' };
    case 'CLOSED':
    default:
      return { bg: 'bg-slate-800/40', text: 'text-slate-400', border: 'border-slate-700/50' };
  }
}

export function getResourceStatusColor(status: ResourceStatus | string | null | undefined): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  const normalized = (status || '').toString().trim().toUpperCase();
  switch (normalized) {
    case 'READY':
      return { bg: 'bg-emerald-950/40', text: 'text-emerald-400', border: 'border-emerald-500/40', dot: 'bg-emerald-400' };
    case 'OCCUPIED':
      return { bg: 'bg-blue-950/40', text: 'text-blue-400', border: 'border-blue-500/40', dot: 'bg-blue-400' };
    case 'LIMITED':
    case 'CLEANING':
      return { bg: 'bg-amber-950/40', text: 'text-amber-400', border: 'border-amber-500/40', dot: 'bg-amber-400' };
    case 'UNAVAILABLE':
    case 'OFFLINE':
    default:
      return { bg: 'bg-rose-950/40', text: 'text-rose-400', border: 'border-rose-500/40', dot: 'bg-rose-500' };
  }
}

export function formatEta(etaMinutes: number | undefined | null): string {
  if (etaMinutes == null || isNaN(etaMinutes)) return '--';
  if (etaMinutes <= 0) return 'Arrived at Bay';
  if (etaMinutes === 1) return '1 min';
  return `${etaMinutes} mins`;
}
