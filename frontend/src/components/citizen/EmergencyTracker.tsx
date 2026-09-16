'use client';

import React from 'react';
import Link from 'next/link';
import { CitizenCase } from '@/types/citizen';
import { 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  MapPin, 
  Users, 
  Radio, 
  Building2, 
  AlertTriangle,
  ArrowRight,
  Phone
} from 'lucide-react';

interface EmergencyTrackerProps {
  citizenCase: CitizenCase;
}

export function EmergencyTracker({ citizenCase }: EmergencyTrackerProps) {
  const stages = [
    { num: 1, title: 'Report Received', desc: 'Pre-hospital intake captured' },
    { num: 2, title: 'Information Structured', desc: 'NLP clinical parameters parsed' },
    { num: 3, title: 'EMS Assignment', desc: 'Matching nearest emergency unit' },
    { num: 4, title: 'Hospital Preparation', desc: 'Pre-arrival alert queued to ED' },
  ];

  return (
    <div className="space-y-6">
      {/* Confirmation Success Header */}
      <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-emerald-950/40 to-slate-900/80 p-6 text-center space-y-3 shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600/20 border border-emerald-500/50 text-emerald-400">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <div>
          <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
            Emergency Report Synchronized
          </span>
          <h1 className="text-2xl sm:text-3xl font-mono font-extrabold text-white mt-1">
            {citizenCase.caseId}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Submitted {citizenCase.submittedAt}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Status: <strong>{citizenCase.status}</strong></span>
        </div>
      </div>

      {/* 4-Stage Coordination Lifecycle Tracker */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Pre-Hospital Coordination Status
          </h3>
          <span className="text-[10px] font-mono text-slate-400">
            Automated Pipeline
          </span>
        </div>

        <div className="space-y-3">
          {stages.map((st) => {
            const isCompleted = st.num < citizenCase.currentStage;
            const isCurrent = st.num === citizenCase.currentStage;

            return (
              <div
                key={st.num}
                className={`p-3 rounded-xl border flex items-start gap-3 transition-all ${
                  isCurrent
                    ? 'border-blue-500/50 bg-blue-950/30 shadow-md'
                    : isCompleted
                    ? 'border-emerald-500/30 bg-emerald-950/20 opacity-90'
                    : 'border-slate-800 bg-slate-950/40 opacity-50'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : isCurrent ? (
                    <div className="h-5 w-5 rounded-full border-2 border-blue-400 flex items-center justify-center">
                      <span className="h-2 w-2 rounded-full bg-blue-400 animate-ping" />
                    </div>
                  ) : (
                    <div className="h-5 w-5 rounded-full border border-slate-700 flex items-center justify-center text-[10px] text-slate-500">
                      {st.num}
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${
                      isCurrent ? 'text-white' : isCompleted ? 'text-emerald-200' : 'text-slate-400'
                    }`}>
                      {st.title}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-900/50 text-blue-300 font-semibold">
                        In Progress
                      </span>
                    )}
                    {isCompleted && (
                      <span className="text-[10px] text-emerald-400 font-semibold">
                        Completed
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {st.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Target Hospital & Responders Information Preview */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Coordinated Destination & Unit
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Building2 className="h-3.5 w-3.5 text-blue-400" /> Destination Hospital
            </span>
            <p className="text-slate-200 font-bold">
              {citizenCase.destinationHospitalName || 'CityCare Emergency Hospital'}
            </p>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Radio className="h-3.5 w-3.5 text-emerald-400" /> Responding Unit
            </span>
            <p className="text-slate-200 font-bold">
              {citizenCase.assignedEmsUnit || 'ALS Unit 04'}
            </p>
          </div>
        </div>
      </div>

      {/* Report Summary Recap */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3 text-xs text-slate-300">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800">
          Submitted Case Summary
        </h3>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Incident Type:</span>
            <span className="font-bold text-white">{citizenCase.report.incidentType}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">People Needing Help:</span>
            <span className="font-bold text-white">{citizenCase.report.peopleCount}</span>
          </div>

          <div className="flex items-start justify-between gap-2">
            <span className="text-slate-400 shrink-0">Location:</span>
            <span className="text-right font-medium text-slate-200 truncate max-w-[260px]">
              {citizenCase.report.location.address}
            </span>
          </div>
        </div>
      </div>

      {/* Safety Instructions while waiting */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-2 text-xs text-amber-200">
        <div className="flex items-center gap-2 font-bold uppercase tracking-wide">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <span>What to do next:</span>
        </div>
        <ul className="space-y-1 text-slate-300 list-disc list-inside">
          <li>Stay in a safe location away from road traffic or hazards.</li>
          <li>Keep your phone line open in case responders call for landmark clarification.</li>
          <li>Do not move seriously injured persons unless there is an immediate fire/traffic danger.</li>
        </ul>
      </div>

      {/* Return Action */}
      <div className="pt-2 text-center">
        <Link
          href="/citizen"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
        >
          <span>Return to Emergency Portal</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
