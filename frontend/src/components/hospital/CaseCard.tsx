'use client';

import React from 'react';
import Link from 'next/link';
import { EmergencyCase } from '@/types/hospital';
import { PriorityBadge } from '@/components/hospital/PriorityBadge';
import { StatusBadge } from '@/components/hospital/StatusBadge';
import { formatEta } from '@/lib/demo/utils';
import { Clock, Navigation, MapPin, ChevronRight, Activity, ShieldCheck } from 'lucide-react';

interface CaseCardProps {
  caseData: EmergencyCase;
}

export function CaseCard({ caseData: c }: CaseCardProps) {
  const isAlerted = c.status === 'Alerted';

  return (
    <div
      className={`rounded-xl border p-4 sm:p-5 transition-all flex flex-col justify-between space-y-4 ${
        isAlerted
          ? 'border-red-500/40 bg-gradient-to-br from-red-950/20 via-slate-900/60 to-slate-900/80 shadow-md shadow-red-950/20'
          : 'border-slate-800/80 bg-slate-900/50 hover:border-slate-700'
      }`}
    >
      {/* Card Header: Case ID, Priority, ETA */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-200">
              {c.id}
            </span>
            <PriorityBadge priority={c.operationalPriority} size="sm" />
          </div>
          <p className="text-[11px] text-slate-400">
            Alerted {c.timeAlerted}
          </p>
        </div>

        <div className="text-right space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/80 border border-slate-800 text-xs font-mono font-bold">
            <Clock className={`h-3 w-3 ${c.emsUnit.etaMinutes <= 8 ? 'text-red-400' : 'text-slate-400'}`} />
            <span className={c.emsUnit.etaMinutes <= 8 ? 'text-red-400' : 'text-slate-200'}>
              {formatEta(c.emsUnit.etaMinutes)}
            </span>
          </div>
          <StatusBadge status={c.status} size="sm" />
        </div>
      </div>

      {/* Card Body: Patient, Incident, Symptoms */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
          <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 font-mono text-xs border border-blue-800/60">
            {c.patientAge}{c.patientSex === 'Male' ? 'M' : c.patientSex === 'Female' ? 'F' : 'U'}
          </span>
          <span className="truncate">{c.incidentType}</span>
        </div>

        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
          <span className="text-slate-400 font-medium">Chief: </span>
          {c.clinicalSummary.chiefComplaint}
        </p>

        {/* Location & EMS Unit */}
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate" title={c.reportedLocation}>{c.reportedLocation}</span>
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <Navigation className="h-3.5 w-3.5 text-blue-400 shrink-0" />
            <span className="font-semibold text-slate-300">{c.emsUnit.unitId}</span>
            <span className="text-slate-400">({c.emsUnit.distanceRemainingKm}km)</span>
          </div>
        </div>
      </div>

      {/* Card Footer: Action Button */}
      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
        <div className="text-[11px] text-slate-400 font-medium">
          {c.assignedBay ? (
            <span className="text-emerald-400 font-semibold">{c.assignedBay}</span>
          ) : (
            <span>Bay: Not yet assigned</span>
          )}
        </div>

        <Link
          href={`/hospital/cases/${c.id}`}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            isAlerted
              ? 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-950/50'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
          }`}
        >
          <span>{isAlerted ? 'Acknowledge Case' : 'Pre-Arrival Detail'}</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
