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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4 shadow-xs">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
              Citizen-Reported Information
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Scene observations from bystander &middot; Reported {citizenReport.reportedAt}
            </p>
          </div>
        </div>

        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold uppercase tracking-wider">
          CITIZEN REPORTED &middot; NOT VERIFIED
        </span>
      </div>

      {/* Safety Notice Callout */}
      <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-slate-700 flex items-start gap-2.5">
        <ShieldAlert className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          <strong className="text-slate-900">Baseline Context:</strong> The entries below reflect bystander observations captured during emergency intake. Do not treat as confirmed medical diagnoses.
        </span>
      </div>

      {/* Structured Observational Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Incident Observations */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 sm:col-span-2">
          <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-blue-600" /> Reported Incident & Scene Narrative
          </span>
          <p className="text-slate-900 font-semibold leading-relaxed">
            {citizenReport.reportedObservations || citizenReport.incidentType}
          </p>
        </div>

        {/* Consciousness */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-amber-600" /> Reported Responsiveness
          </span>
          <p className="text-slate-900 font-bold">
            {citizenReport.reportedConsciousness}
          </p>
        </div>

        {/* Breathing */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Wind className="h-3.5 w-3.5 text-blue-600" /> Reported Breathing
          </span>
          <p className="text-slate-900 font-bold">
            {citizenReport.reportedBreathing}
          </p>
        </div>

        {/* Location & Landmark */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 sm:col-span-2">
          <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-blue-600" /> Reported Location & Landmark
          </span>
          <p className="text-slate-900 font-bold">
            {citizenReport.reportedLocation}
          </p>
          {citizenReport.landmark && (
            <p className="text-slate-500 text-[11px]">
              Landmark: <span className="text-slate-700 font-medium">{citizenReport.landmark}</span>
            </p>
          )}
        </div>

        {/* Reported Visible Concerns Tags */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 sm:col-span-2">
          <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> Reported Scene Concerns
          </span>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {citizenReport.reportedConcerns.map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Additional Bystander Notes */}
        {citizenReport.additionalNotes && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 sm:col-span-2">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-purple-600" /> Bystander Additional Notes
            </span>
            <p className="text-slate-700 italic">
              &ldquo;{citizenReport.additionalNotes}&rdquo;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
