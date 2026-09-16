'use client';

import React from 'react';
import Link from 'next/link';
import { useHospital } from '@/context/HospitalContext';
import { PriorityBadge } from '@/components/hospital/PriorityBadge';
import { StatusBadge } from '@/components/hospital/StatusBadge';
import { formatEta } from '@/lib/demo/utils';
import { 
  Radio, 
  Clock, 
  Navigation, 
  CheckCircle2, 
  ChevronRight, 
  AlertTriangle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function ActiveCasesTrackingPage() {
  const { cases } = useHospital();

  const activeCases = cases.filter(c => c.status !== 'Closed' && c.status !== 'Diverted');

  const stages = [
    { key: 'Alerted', label: '1. Inbound Alert', desc: 'Pre-arrival notification broadcast' },
    { key: 'Acknowledged', label: '2. Hospital Ack', desc: 'Triage coordinator accepted' },
    { key: 'Preparing', label: '3. Bay Staging', desc: 'Resuscitation unit reserved' },
    { key: 'Transporting', label: '4. High-Speed Transit', desc: 'Paramedic en-route monitoring' },
    { key: 'Handover', label: '5. Bedside Handover', desc: 'Stretcher entering ED bay' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Radio className="h-5 w-5 text-blue-400" />
            <span>Active Case Monitoring & Stage Progression</span>
          </h1>
          <p className="text-xs text-slate-400">
            End-to-end synchronized lifecycle from scene intake to physical bedside handover
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <Clock className="h-4 w-4 text-emerald-400" />
          <span>Tracking <strong className="text-white">{activeCases.length}</strong> active units</span>
        </div>
      </div>

      {/* Lifecycle Stage Pipeline Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 sm:p-5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Standard Pre-Hospital Coordination Pipeline
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {stages.map((st, i) => (
            <div
              key={st.key}
              className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 relative overflow-hidden"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-200 mb-1">
                <span>{st.label}</span>
                {i < stages.length - 1 && (
                  <ArrowRight className="h-3 w-3 text-slate-400 hidden sm:block" />
                )}
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                {st.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Active Inbound Journey Cards */}
      <div className="space-y-4">
        {activeCases.map((c) => {
          const isAlerted = c.status === 'Alerted';
          const isAck = c.status === 'Acknowledged' || c.status === 'Preparing';
          const isHandover = c.status === 'Handover';

          return (
            <div
              key={c.id}
              className={`rounded-2xl border p-5 transition-all space-y-4 ${
                isAlerted
                  ? 'border-red-500/40 bg-gradient-to-r from-red-950/20 via-slate-900/60 to-slate-900'
                  : 'border-slate-800 bg-slate-900/40'
              }`}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-sm font-bold text-white">{c.id}</span>
                    <PriorityBadge priority={c.operationalPriority} size="sm" />
                    <StatusBadge status={c.status} size="sm" />
                  </div>
                  <p className="text-xs text-slate-200 font-semibold">
                    {c.patientAge}{c.patientSex === 'Male' ? 'M' : 'F'} — {c.incidentType}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">ETA to Hospital</span>
                    <span className="text-base font-mono font-bold text-red-400 flex items-center justify-end gap-1">
                      <Clock className="h-4 w-4 text-red-400" />
                      {formatEta(c.emsUnit.etaMinutes)}
                    </span>
                  </div>

                  <Link
                    href={`/hospital/cases/${c.id}`}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 transition-all"
                  >
                    <span>Inspect</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Progress Milestones Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                  isAlerted || isAck || isHandover
                    ? 'bg-blue-950/30 border-blue-800/60 text-blue-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}>
                  <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                  <span className="truncate">Alert Ingested ({c.timeAlerted})</span>
                </div>

                <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                  isAck || isHandover
                    ? 'bg-blue-950/30 border-blue-800/60 text-blue-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}>
                  <CheckCircle2 className={`h-4 w-4 ${isAck || isHandover ? 'text-blue-400' : 'text-slate-400'} shrink-0`} />
                  <span className="truncate">
                    {c.timeAcknowledged ? `Ack at ${c.timeAcknowledged}` : 'Pending Hospital Ack'}
                  </span>
                </div>

                <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                  c.assignedBay
                    ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}>
                  <CheckCircle2 className={`h-4 w-4 ${c.assignedBay ? 'text-emerald-400' : 'text-slate-400'} shrink-0`} />
                  <span className="truncate">
                    {c.assignedBay ? c.assignedBay : 'Bay Assignment Pending'}
                  </span>
                </div>

                <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                  isHandover
                    ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}>
                  <CheckCircle2 className={`h-4 w-4 ${isHandover ? 'text-emerald-400' : 'text-slate-400'} shrink-0`} />
                  <span className="truncate">
                    {isHandover ? 'Handover Signed' : 'En Route to Bay'}
                  </span>
                </div>
              </div>

              {/* Live EMS Telemetry Strip */}
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1">
                <div className="flex items-center gap-2">
                  <Navigation className="h-3.5 w-3.5 text-blue-400" />
                  <span>Unit: <strong className="text-slate-200">{c.emsUnit.unitId}</strong> ({c.emsUnit.vehicleType})</span>
                </div>
                <div>
                  <span>Current Vector: <strong className="text-slate-300">{c.emsUnit.currentLocationName}</strong></span>
                </div>
                <div>
                  <span className="font-mono text-slate-300">{c.emsUnit.speedKmH} km/h • {c.emsUnit.distanceRemainingKm} km remaining</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
