'use client';

import React from 'react';
import { CitizenEmergencyReport } from '@/types/citizen';
import { 
  FileText, 
  Users, 
  Activity, 
  MapPin, 
  MessageSquare, 
  Edit3, 
  ShieldAlert, 
  CheckCircle2, 
  AlertOctagon 
} from 'lucide-react';

interface ReportSummaryCardProps {
  report: CitizenEmergencyReport;
  onEditStep: (stepNumber: number) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export function ReportSummaryCard({
  report,
  onEditStep,
  onSubmit,
  isSubmitting = false,
}: ReportSummaryCardProps) {
  return (
    <div className="space-y-6">
      {/* Non-Diagnostic Disclaimer Banner */}
      <div className="rounded-2xl border border-blue-500/30 bg-blue-950/20 p-4 flex items-start gap-3 text-xs text-blue-200">
        <ShieldAlert className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold uppercase tracking-wider">Citizen-Reported Pre-Arrival Data</p>
          <p className="text-slate-300 leading-relaxed">
            This information will be structured and transmitted to responding EMS units and the receiving hospital emergency department to accelerate pre-arrival readiness. <strong>This is not a medical diagnosis.</strong>
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="space-y-3">
        {/* Section 1: Incident */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-red-400" /> 1. Incident Type
            </span>
            <button
              type="button"
              onClick={() => onEditStep(1)}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              <Edit3 className="h-3.5 w-3.5" /> Edit
            </button>
          </div>
          <p className="text-base font-extrabold text-white">
            {report.incidentType || 'Not specified'}
          </p>
        </div>

        {/* Section 2: People */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="h-4 w-4 text-blue-400" /> 2. People & Responsiveness
            </span>
            <button
              type="button"
              onClick={() => onEditStep(2)}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              <Edit3 className="h-3.5 w-3.5" /> Edit
            </button>
          </div>
          <div className="text-xs space-y-1 text-slate-200">
            <p>People requiring help: <strong className="text-white font-mono text-sm">{report.peopleCount}</strong></p>
            <p>Unconscious / unresponsive reported: <strong className={`font-semibold ${report.hasUnconscious === 'Yes' ? 'text-red-400' : 'text-slate-200'}`}>{report.hasUnconscious}</strong></p>
          </div>
        </div>

        {/* Section 3: Condition */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-emerald-400" /> 3. Observed Condition
            </span>
            <button
              type="button"
              onClick={() => onEditStep(3)}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              <Edit3 className="h-3.5 w-3.5" /> Edit
            </button>
          </div>
          <div className="text-xs space-y-1 text-slate-200">
            <p>Person awake & responding: <strong>{report.isAwake}</strong></p>
            <p>Breathing normally: <strong>{report.isBreathingNormally}</strong></p>
            <div className="pt-1">
              <span className="text-[11px] text-slate-400 block mb-1">Reported concerns:</span>
              {report.visibleConcerns.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {report.visibleConcerns.map((c, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md text-xs font-medium bg-red-950/40 text-red-300 border border-red-800/40"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-slate-400 italic">None reported</span>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Location */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-purple-400" /> 4. Emergency Location
            </span>
            <button
              type="button"
              onClick={() => onEditStep(4)}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              <Edit3 className="h-3.5 w-3.5" /> Edit
            </button>
          </div>
          <div className="text-xs text-slate-200">
            <p className="font-semibold text-white">{report.location.address}</p>
            {report.location.landmark && (
              <p className="text-slate-400 mt-0.5">Landmark: {report.location.landmark}</p>
            )}
            <span className="text-[10px] text-emerald-400 font-mono block mt-1">
              {report.location.accuracyText}
            </span>
          </div>
        </div>

        {/* Optional Notes */}
        {report.additionalNotes && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-1 text-xs">
            <span className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-amber-400" /> Additional Notes
            </span>
            <p className="text-slate-200 italic">&ldquo;{report.additionalNotes}&rdquo;</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full py-4 px-6 rounded-2xl bg-red-600 hover:bg-red-500 active:scale-[0.99] text-white font-extrabold text-base shadow-xl shadow-red-950/60 transition-all flex items-center justify-center gap-2"
        >
          <AlertOctagon className="h-5 w-5" />
          <span>{isSubmitting ? 'Submitting Report...' : 'Submit Emergency Report'}</span>
        </button>

        <p className="text-[11px] text-center text-slate-400">
          By submitting, you authorize transmission of this observational report to emergency dispatch and receiving hospitals.
        </p>
      </div>
    </div>
  );
}
