'use client';

import React from 'react';
import Link from 'next/link';
import { CitizenCase } from '@/types/citizen';
import { 
  CheckCircle2, 
  Building2, 
  AlertTriangle,
  ArrowRight,
  Radio
} from 'lucide-react';

interface EmergencyTrackerProps {
  citizenCase: CitizenCase;
}

export function EmergencyTracker({ citizenCase }: EmergencyTrackerProps) {
  const stages = [
    { num: 1, title: 'Report Received', desc: 'Pre-hospital observations captured' },
    { num: 2, title: 'Information Structured', desc: 'Assistive clinical parameters extracted' },
    { num: 3, title: 'EMS Assignment', desc: 'Matching nearest emergency response unit' },
    { num: 4, title: 'Hospital Staging', desc: 'Pre-arrival alert queued to receiving ED' },
  ];

  return (
    <div className="space-y-6">
      {/* Confirmation Success Header */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 text-center space-y-3 shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-7 w-7" />
        </div>

        <div>
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
            Emergency Report Synchronized
          </span>
          <h1 className="text-2xl sm:text-3xl font-mono font-extrabold text-slate-900 mt-0.5">
            {citizenCase.caseId}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Submitted {citizenCase.submittedAt}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-emerald-200 text-xs text-emerald-800 shadow-2xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span>Status: <strong>{citizenCase.status}</strong></span>
        </div>
      </div>

      {/* 4-Stage Coordination Lifecycle Tracker */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Pre-Hospital Coordination Pipeline
          </h3>
          <span className="text-[10px] font-mono text-blue-600 font-bold">
            Live Synchronization
          </span>
        </div>

        <div className="space-y-2.5">
          {stages.map((st) => {
            const isCompleted = st.num < citizenCase.currentStage;
            const isCurrent = st.num === citizenCase.currentStage;

            return (
              <div
                key={st.num}
                className={`p-3 rounded-lg border flex items-start gap-3 transition-all ${
                  isCurrent
                    ? 'border-blue-300 bg-blue-50/50 shadow-xs'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/30'
                    : 'border-slate-100 bg-slate-50 opacity-60'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : isCurrent ? (
                    <div className="h-5 w-5 rounded-full border-2 border-blue-600 flex items-center justify-center">
                      <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
                    </div>
                  ) : (
                    <div className="h-5 w-5 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-slate-400">
                      {st.num}
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${
                      isCurrent ? 'text-blue-900' : isCompleted ? 'text-emerald-900' : 'text-slate-500'
                    }`}>
                      {st.title}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                        In Progress
                      </span>
                    )}
                    {isCompleted && (
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        Completed
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {st.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Target Hospital & Responders Information Preview */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Coordinated Destination & Unit
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Building2 className="h-3.5 w-3.5 text-blue-600" /> Destination Hospital
            </span>
            <p className="text-slate-900 font-bold">
              {citizenCase.destinationHospitalName || 'CityCare Emergency Hospital'}
            </p>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Radio className="h-3.5 w-3.5 text-emerald-600" /> Responding Unit
            </span>
            <p className="text-slate-900 font-bold">
              {citizenCase.assignedEmsUnit || 'ALS Unit 04'}
            </p>
          </div>
        </div>
      </div>

      {/* Report Summary Recap */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 text-xs shadow-xs">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-2 border-b border-slate-100">
          Submitted Case Summary
        </h3>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Incident Type:</span>
            <span className="font-bold text-slate-900">{citizenCase.report.incidentType}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">People Needing Help:</span>
            <span className="font-bold text-slate-900">{citizenCase.report.peopleCount}</span>
          </div>

          <div className="flex items-start justify-between gap-2">
            <span className="text-slate-500 shrink-0">Location:</span>
            <span className="text-right font-medium text-slate-700 truncate max-w-[260px]">
              {citizenCase.report.location.address}
            </span>
          </div>
        </div>
      </div>

      {/* Safety Instructions while waiting */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2 text-xs text-amber-900 shadow-xs">
        <div className="flex items-center gap-2 font-bold uppercase tracking-wide">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <span>Important Instructions While Responders En Route:</span>
        </div>
        <ul className="space-y-1 text-slate-600 list-disc list-inside">
          <li>Stay in a safe location away from road traffic or ongoing hazards.</li>
          <li>Keep your phone line open in case responders call for landmark verification.</li>
          <li>Do not move seriously injured persons unless there is an immediate fire or traffic danger.</li>
        </ul>
      </div>

      {/* Return Action */}
      <div className="pt-2 text-center">
        <Link
          href="/citizen"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
        >
          <span>Return to Citizen Portal</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
