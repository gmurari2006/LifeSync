'use client';

import React from 'react';
import { CitizenReportSummary } from '@/types/ems';
import { 
  FileText, 
  Users, 
  MapPin, 
  Activity, 
  Eye, 
  Wind, 
  ShieldAlert, 
  AlertTriangle,
  MessageSquare,
  Clock
} from 'lucide-react';

interface CitizenReportCardProps {
  citizenReport: CitizenReportSummary;
}

export function CitizenReportCard({ citizenReport }: CitizenReportCardProps) {
  return (
    <div className="rounded-3xl border border-blue-500/30 bg-slate-900/70 p-5 sm:p-6 space-y-4 shadow-lg">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-blue-500/20">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-wide uppercase">
              Citizen-Reported Information
            </h3>
            <p className="text-[11px] text-blue-300 font-medium">
              Scene observations from bystander &middot; Reported {citizenReport.reportedAt}
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full bg-blue-950/80 text-blue-300 border border-blue-800 text-[10px] font-bold uppercase tracking-wider">
          Not Verified by EMS
        </span>
      </div>

      {/* Safety Notice Callout */}
      <div className="p-3 rounded-2xl bg-blue-950/20 border border-blue-500/20 text-xs text-blue-200 flex items-start gap-2.5">
        <ShieldAlert className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          <strong>Baseline Context:</strong> The entries below reflect bystander observations captured during emergency intake. Do not treat as confirmed medical diagnoses.
        </span>
      </div>

      {/* Structured Observational Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Incident Observations */}
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5 sm:col-span-2">
          <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-red-400" /> Reported Incident & Scene Narrative
          </span>
          <p className="text-white font-semibold leading-relaxed">
            {citizenReport.reportedObservations || citizenReport.incidentType}
          </p>
        </div>

        {/* Consciousness */}
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
          <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-amber-400" /> Reported Responsiveness
          </span>
          <p className="text-slate-200 font-bold">
            {citizenReport.reportedConsciousness}
          </p>
        </div>

        {/* Breathing */}
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
          <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Wind className="h-3.5 w-3.5 text-sky-400" /> Reported Breathing
          </span>
          <p className="text-slate-200 font-bold">
            {citizenReport.reportedBreathing}
          </p>
        </div>

        {/* Location & Landmark */}
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1 sm:col-span-2">
          <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-orange-400" /> Reported Location & Landmark
          </span>
          <p className="text-slate-200 font-bold">
            {citizenReport.reportedLocation}
          </p>
          {citizenReport.landmark && (
            <p className="text-slate-400 text-[11px]">
              Landmark: <span className="text-slate-300">{citizenReport.landmark}</span>
            </p>
          )}
        </div>

        {/* Reported Visible Concerns Tags */}
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5 sm:col-span-2">
          <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-yellow-400" /> Reported Scene Concerns
          </span>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {citizenReport.reportedConcerns.map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-950/40 text-red-300 border border-red-800/40"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Additional Bystander Notes */}
        {citizenReport.additionalNotes && (
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1 sm:col-span-2">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-purple-400" /> Bystander Additional Notes
            </span>
            <p className="text-slate-300 italic">
              &ldquo;{citizenReport.additionalNotes}&rdquo;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
