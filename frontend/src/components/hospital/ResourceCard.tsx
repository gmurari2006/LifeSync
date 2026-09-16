'use client';

import React from 'react';
import { HospitalResourceItem, ResourceStatus } from '@/types/hospital';
import { getResourceStatusColor } from '@/lib/demo/utils';
import { 
  BedDouble, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Activity
} from 'lucide-react';

interface ResourceCardProps {
  resource: HospitalResourceItem;
  onStatusChange?: (status: ResourceStatus) => void;
}

export function ResourceCard({ resource, onStatusChange }: ResourceCardProps) {
  const colors = getResourceStatusColor(resource.status);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 sm:p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            {resource.category}
          </span>
          <h4 className="text-sm font-bold text-slate-100 leading-snug">
            {resource.name}
          </h4>
        </div>

        {/* Status Badge */}
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}
        >
          <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
          {resource.status.toUpperCase()}
        </span>
      </div>

      {/* Details: Capacity, Location, Notes */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
          <span className="text-slate-400">Capacity Available:</span>
          <span className="font-mono font-bold text-slate-200">
            {resource.availableCapacity} / {resource.totalCapacity} Units
          </span>
        </div>

        {resource.assignedCaseId && (
          <div className="flex items-center justify-between text-xs px-1 text-blue-300">
            <span>Assigned to:</span>
            <span className="font-mono font-bold bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/60">
              {resource.assignedCaseId}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 px-1 truncate">
          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{resource.location}</span>
        </div>

        {resource.notes && (
          <p className="text-[11px] text-slate-400 italic bg-slate-950/30 p-2 rounded border border-slate-800/40">
            &ldquo;{resource.notes}&rdquo;
          </p>
        )}
      </div>

      {/* Interactive Status Controls (Demo Staging) */}
      {onStatusChange && (
        <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Update Readiness State:
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => onStatusChange('Ready')}
              className={`px-2 py-1 rounded-md text-xs font-semibold transition-all ${
                resource.status === 'Ready'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800'
              }`}
            >
              Ready
            </button>
            <button
              onClick={() => onStatusChange('Limited')}
              className={`px-2 py-1 rounded-md text-xs font-semibold transition-all ${
                resource.status === 'Limited'
                  ? 'bg-amber-600 text-white shadow-sm shadow-amber-950'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800'
              }`}
            >
              Limited
            </button>
            <button
              onClick={() => onStatusChange('Unavailable')}
              className={`px-2 py-1 rounded-md text-xs font-semibold transition-all ${
                resource.status === 'Unavailable'
                  ? 'bg-red-600 text-white shadow-sm shadow-red-950'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800'
              }`}
            >
              Offline
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
