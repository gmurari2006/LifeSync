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
      color: 'border-emerald-500 bg-emerald-950/40 text-emerald-200',
    },
    {
      id: 'Requires close monitoring',
      label: 'Requires Close Monitoring',
      desc: 'Potential dynamic decompensation; continuous vital telemetry recommended.',
      color: 'border-amber-500 bg-amber-950/40 text-amber-200',
    },
    {
      id: 'Deteriorating',
      label: 'Deteriorating',
      desc: 'Critical vital instability or worsening symptoms; urgent resuscitation needed.',
      color: 'border-red-500 bg-red-950/60 text-red-200',
    },
    {
      id: 'Unable to assess',
      label: 'Unable to Assess',
      desc: 'Extrication, scene safety hazard, or pending on-scene arrival.',
      color: 'border-slate-700 bg-slate-900/60 text-slate-300',
    },
  ];

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6 space-y-4 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-wide uppercase">
              Field Patient Status
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Paramedic operational acuity indicator &middot; Select current status
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-slate-400">
          Current: <strong className="text-white">{patientStatus}</strong>
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
              className={`p-3.5 rounded-2xl border text-left transition-all active:scale-[0.99] flex items-start justify-between gap-3 ${
                isSelected
                  ? `${st.color} ring-2 ring-purple-500/50 shadow-lg`
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900 text-slate-400'
              }`}
            >
              <div className="space-y-0.5">
                <span className={`text-xs font-bold block ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {st.label}
                </span>
                <p className="text-[11px] text-slate-400 leading-snug">
                  {st.desc}
                </p>
              </div>

              {isSelected && (
                <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
