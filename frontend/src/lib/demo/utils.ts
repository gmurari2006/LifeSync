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
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        badgeBg: 'bg-red-100',
        dot: 'bg-red-600',
      };
    case 'High':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200',
        badgeBg: 'bg-amber-100',
        dot: 'bg-amber-600',
      };
    case 'Moderate':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        badgeBg: 'bg-blue-100',
        dot: 'bg-blue-600',
      };
    case 'Low':
    default:
      return {
        bg: 'bg-slate-50',
        text: 'text-slate-700',
        border: 'border-slate-200',
        badgeBg: 'bg-slate-100',
        dot: 'bg-slate-500',
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
      return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
    case 'ACKNOWLEDGING':
    case 'ACKNOWLEDGED':
    case 'HOSPITAL_ACKNOWLEDGED':
    case 'PREPARING':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    case 'INFORMATION_STRUCTURED':
      return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
    case 'EMS_ASSIGNED':
    case 'EMS_ACCEPTED':
    case 'ON_SCENE':
    case 'ASSESSMENT_UPDATED':
    case 'PATIENT_LOADED':
    case 'EN_ROUTE':
    case 'TRANSPORTING':
      return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
    case 'ARRIVED':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'HANDOVER':
    case 'HANDOVER_COMPLETE':
      return { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' };
    case 'DIVERTED':
      return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
    case 'CLOSED':
    default:
      return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
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
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-600' };
    case 'OCCUPIED':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-600' };
    case 'LIMITED':
    case 'CLEANING':
      return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', dot: 'bg-amber-600' };
    case 'UNAVAILABLE':
    case 'OFFLINE':
    default:
      return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-600' };
  }
}

export function formatEta(etaMinutes: number | undefined | null): string {
  if (etaMinutes == null || isNaN(etaMinutes)) return '--';
  if (etaMinutes <= 0) return 'Arrived at Bay';
  if (etaMinutes === 1) return '1 min';
  return `${etaMinutes} mins`;
}
