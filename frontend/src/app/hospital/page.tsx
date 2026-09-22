'use client';

import React from 'react';
import Link from 'next/link';
import { useHospital } from '@/context/HospitalContext';
import { CaseTable } from '@/components/hospital/CaseTable';
import { ReadinessSummary } from '@/components/hospital/ReadinessSummary';
import { PriorityBadge } from '@/components/hospital/PriorityBadge';
import { AlertEscalationBanner } from '@/components/hospital/AlertEscalationBanner';
import { formatEta } from '@/lib/demo/utils';
import { 
  Inbox, 
  Clock, 
  AlertTriangle, 
  BedDouble, 
  ShieldCheck, 
  Radio, 
  ChevronRight,
  Activity,
  ArrowUpRight
} from 'lucide-react';
export default function HospitalOverviewPage() {
  const { cases, hospitalProfile, stats, refreshHospitalData } = useHospital();
  const safeCases = cases || [];
  const activeCases = safeCases.filter(c => c.status !== 'Closed' && c.status !== 'Diverted');
  const pendingAckCases = activeCases.filter(c => c.status === 'Alerted');

  return (
    <div className="space-y-6">
      {/* Active Pre-Alert Escalation Alerts */}
      <AlertEscalationBanner
        hospitalId={hospitalProfile.id}
        onCaseAcknowledged={() => refreshHospitalData && refreshHospitalData()}
      />


      {/* Top Operations Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Emergency Operations Overview
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Live Queue
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Synchronizing pre-hospital incoming ambulance telemetry and reported clinical findings for <strong className="text-slate-900">{hospitalProfile.name}</strong>.
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-3">
          <Link
            href="/hospital/cases"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Inbox className="h-4 w-4" />
            <span>View All Cases ({stats.totalIncoming})</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Incoming Active */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Total Inbound</span>
            <Inbox className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-slate-900">
            {stats.totalIncoming}
          </div>
          <span className="text-[11px] text-slate-500 block">Active emergency transports</span>
        </div>

        {/* Awaiting Ack */}
        <div className={`rounded-2xl border p-4 space-y-1 shadow-sm ${
          stats.awaitingAck > 0 
            ? 'border-rose-200 bg-rose-50 text-rose-800' 
            : 'border-slate-200 bg-white text-slate-700'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase">Awaiting Ack</span>
            <AlertTriangle className={`h-4 w-4 ${stats.awaitingAck > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-400'}`} />
          </div>
          <div className={`text-2xl font-mono font-extrabold ${stats.awaitingAck > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
            {stats.awaitingAck}
          </div>
          <span className="text-[11px] text-slate-500 block">Immediate response required</span>
        </div>

        {/* Critical Cases */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Critical Priority</span>
            <Activity className="h-4 w-4 text-rose-600" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-rose-700">
            {stats.criticalCount}
          </div>
          <span className="text-[11px] text-slate-500 block">STEMI / Trauma protocols</span>
        </div>

        {/* Average ETA */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Avg Transport ETA</span>
            <Clock className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-emerald-700">
            {stats.averageEta} <span className="text-xs font-normal text-slate-500">min</span>
          </div>
          <span className="text-[11px] text-slate-500 block">Target pre-arrival prep window</span>
        </div>

        {/* Acute Bays Ready */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1 col-span-2 sm:col-span-1 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Available Bays</span>
            <BedDouble className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-purple-700">
            {stats.availableBays} <span className="text-xs font-normal text-slate-500">/ {stats.totalBays}</span>
          </div>
          <span className="text-[11px] text-slate-500 block">Resuscitation &amp; Trauma suites</span>
        </div>
      </div>

      {/* Urgent Action Needed Strip (if any cases awaiting ack) */}
      {pendingAckCases.length > 0 && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
              </span>
              <h3 className="text-sm font-bold text-rose-800 uppercase tracking-wider">
                Action Required: {pendingAckCases.length} Inbound Case{pendingAckCases.length > 1 ? 's' : ''} Awaiting Acknowledgement
              </h3>
            </div>
            <span className="text-xs text-slate-500 hidden sm:inline font-medium">Pre-Arrival Notification</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingAckCases.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3 rounded-xl border border-rose-200 bg-white shadow-sm"
              >
                <div className="space-y-1 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">{c.id}</span>
                    <PriorityBadge priority={c.operationalPriority} size="sm" />
                    <span className="text-xs font-mono font-bold text-rose-700">
                      ETA {formatEta(c.emsUnit.etaMinutes)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 truncate max-w-[260px]">
                    {c.incidentType}
                  </p>
                </div>

                <Link
                  href={`/hospital/cases/${c.id}`}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shrink-0 transition-all shadow-sm"
                >
                  Review &amp; Ack
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Incoming Emergency Queue */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Active Pre-Arrival Emergency Queue
            </h2>
            <p className="text-xs text-slate-500">
              Inbound EMS vehicles and structured clinical handoff packets
            </p>
          </div>

          <Link
            href="/hospital/cases"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>Advanced Filters</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <CaseTable cases={activeCases} />
      </div>

      {/* Resource Readiness Overview Widget */}
      <ReadinessSummary />
    </div>
  );
}
