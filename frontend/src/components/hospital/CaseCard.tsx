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
      className={`rounded-2xl border p-4 sm:p-5 transition-all flex flex-col justify-between space-y-4 shadow-sm ${
        isAlerted
          ? 'border-rose-200 bg-rose-50/50'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      {/* Card Header: Case ID, Priority, ETA */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-900">
              {c.id}
            </span>
            <PriorityBadge priority={c.operationalPriority} size="sm" />
          </div>
          <p className="text-[11px] text-slate-500">
            Alerted {c.timeAlerted}
          </p>
        </div>

        <div className="text-right space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs font-mono font-bold">
            <Clock className={`h-3 w-3 ${c.emsUnit.etaMinutes <= 8 ? 'text-rose-600' : 'text-slate-400'}`} />
            <span className={c.emsUnit.etaMinutes <= 8 ? 'text-rose-700' : 'text-slate-800'}>
              {formatEta(c.emsUnit.etaMinutes)}
            </span>
          </div>
          <StatusBadge status={c.status} size="sm" />
        </div>
      </div>

      {/* Card Body: Patient, Incident, Symptoms */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-xs border border-blue-200">
            {c.patientAge}{c.patientSex === 'Male' ? 'M' : c.patientSex === 'Female' ? 'F' : 'U'}
          </span>
          <span className="truncate">{c.incidentType}</span>
        </div>

        <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <span className="text-slate-500 font-medium">Chief: </span>
          {c.clinicalSummary.chiefComplaint}
        </p>

        {/* Location & EMS Unit */}
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate" title={c.reportedLocation}>{c.reportedLocation}</span>
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <Navigation className="h-3.5 w-3.5 text-blue-600 shrink-0" />
            <span className="font-semibold text-slate-800">{c.emsUnit.unitId}</span>
            <span className="text-slate-500">({c.emsUnit.distanceRemainingKm}km)</span>
          </div>
        </div>
      </div>

      {/* Card Footer: Action Button */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <div className="text-[11px] text-slate-500 font-medium">
          {c.assignedBay ? (
            <span className="text-emerald-700 font-semibold">{c.assignedBay}</span>
          ) : (
            <span>Bay: Not yet assigned</span>
          )}
        </div>

        <Link
          href={`/hospital/cases/${c.id}`}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            isAlerted
              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
          }`}
        >
          <span>{isAlerted ? 'Acknowledge Case' : 'Pre-Arrival Detail'}</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
