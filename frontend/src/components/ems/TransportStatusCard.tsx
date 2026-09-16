'use client';

import React from 'react';
import { EMSTransportStatus, EMSUnit } from '@/types/ems';
import { useEMS } from '@/context/EMSContext';
import { 
  Ambulance, 
  Navigation, 
  MapPin, 
  Users, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Gauge,
  Battery
} from 'lucide-react';

interface TransportStatusCardProps {
  caseId: string;
  transportStatus: EMSTransportStatus;
}

export function TransportStatusCard({ caseId, transportStatus }: TransportStatusCardProps) {
  const { activeUnit, updateTransportStatus } = useEMS();

  const stages: { id: EMSTransportStatus; num: number; label: string; desc: string }[] = [
    { id: 'Responding to Scene', num: 1, label: 'Responding to Scene', desc: 'En-route to incident coordinates' },
    { id: 'On Scene', num: 2, label: 'On Scene', desc: 'Contact made with patient' },
    { id: 'Patient Loaded', num: 3, label: 'Patient Loaded', desc: 'Patient secured in ambulance' },
    { id: 'Transporting', num: 4, label: 'Transporting', desc: 'In transit to receiving hospital' },
    { id: 'Arrived at Hospital', num: 5, label: 'Arrived at Hospital', desc: 'Docked at emergency bay' },
    { id: 'Handover Complete', num: 6, label: 'Handover Complete', desc: 'Bedside transfer verified' },
  ];

  const currentStageIndex = stages.findIndex(s => s.id === transportStatus);

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6 space-y-5 shadow-lg">
      {/* Header with Unit Telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
            <Ambulance className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-wide uppercase">
              Ambulance & Transport Status
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Unit {activeUnit.unitId} &middot; {activeUnit.crew.leadParamedic}
            </p>
          </div>
        </div>

        {/* Speed & Battery Telemetry */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1 text-slate-300">
            <Gauge className="h-3.5 w-3.5 text-blue-400" />
            <span>{activeUnit.currentSpeedKmH} km/h</span>
          </span>
          <span className="flex items-center gap-1 text-emerald-400">
            <Battery className="h-3.5 w-3.5" />
            <span>{activeUnit.fuelOrBatteryPercent}%</span>
          </span>
        </div>
      </div>

      {/* 6-Stage Progression Flow Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {stages.map((st, idx) => {
          const isCurrent = st.id === transportStatus;
          const isPassed = currentStageIndex > idx;

          return (
            <button
              key={st.id}
              type="button"
              onClick={() => updateTransportStatus(caseId, st.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all active:scale-[0.98] flex items-start gap-3 ${
                isCurrent
                  ? 'border-orange-500 bg-orange-950/60 shadow-lg ring-2 ring-orange-500/50'
                  : isPassed
                  ? 'border-emerald-500/40 bg-emerald-950/20 opacity-90'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900 opacity-60'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isPassed ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : isCurrent ? (
                  <div className="h-4 w-4 rounded-full border-2 border-orange-400 flex items-center justify-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-ping" />
                  </div>
                ) : (
                  <div className="h-4 w-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px] text-slate-500">
                    {st.num}
                  </div>
                )}
              </div>

              <div className="space-y-0.5">
                <span className={`text-xs font-bold block ${
                  isCurrent ? 'text-white' : isPassed ? 'text-emerald-200' : 'text-slate-400'
                }`}>
                  {st.label}
                </span>
                <p className="text-[10px] text-slate-400 leading-snug">
                  {st.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
