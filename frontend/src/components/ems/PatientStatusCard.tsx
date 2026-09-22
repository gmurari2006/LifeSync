'use client';

import React from 'react';
import { PatientOperationalStatus } from '@/types/ems';
import { useEMS } from '@/context/EMSContext';
import { 
  Users, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle,
  Activity
} from 'lucide-react';

interface PatientStatusCardProps {
  caseId: string;
  patientStatus: PatientOperationalStatus;
}

export function PatientStatusCard({ caseId, patientStatus }: PatientStatusCardProps) {
  const { updatePatientStatus } = useEMS();

  const statuses: { id: PatientOperationalStatus; label: string; desc: string; color: string }[] = [
    {
      id: 'Stable',
      label: 'Stable',
      desc: 'Vital parameters within acceptable limits; low acute risk.',
      color: 'border-emerald-300 bg-emerald-50 text-emerald-900 shadow-xs ring-1 ring-emerald-500/30',
    },
    {
      id: 'Requires close monitoring',
      label: 'Requires Close Monitoring',
      desc: 'Potential dynamic decompensation; continuous vital telemetry recommended.',
      color: 'border-amber-300 bg-amber-50 text-amber-900 shadow-xs ring-1 ring-amber-500/30',
    },
    {
      id: 'Deteriorating',
      label: 'Deteriorating',
      desc: 'Critical vital instability or worsening symptoms; urgent resuscitation needed.',
      color: 'border-red-300 bg-red-50 text-red-900 shadow-xs ring-1 ring-red-500/30',
    },
    {
      id: 'Unable to assess',
      label: 'Unable to Assess',
      desc: 'Extrication, scene safety hazard, or pending on-scene arrival.',
      color: 'border-slate-300 bg-slate-100 text-slate-800 shadow-xs ring-1 ring-slate-400/30',
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-600">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
              Field Patient Status
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Paramedic operational acuity indicator &middot; Select current status
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-slate-500">
          Current: <strong className="text-slate-900">{patientStatus}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {statuses.map((st) => {
          const isSelected = patientStatus === st.id;
          return (
            <button
              key={st.id}
              type="button"
              onClick={() => updatePatientStatus(caseId, st.id)}
              className={`p-3.5 rounded-xl border text-left transition-all active:scale-[0.99] flex items-start justify-between gap-3 ${
                isSelected
                  ? st.color
                  : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100/80 text-slate-600'
              }`}
            >
              <div className="space-y-0.5">
                <span className={`text-xs font-bold block ${isSelected ? 'text-slate-900' : 'text-slate-800'}`}>
                  {st.label}
                </span>
                <p className="text-[11px] text-slate-500 leading-snug">
                  {st.desc}
                </p>
              </div>

              {isSelected && (
                <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
