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
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex items-start gap-3 text-xs text-blue-900 shadow-xs">
        <ShieldAlert className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold uppercase tracking-wider text-[11px] text-blue-800">
            Citizen-Reported Pre-Arrival Data
          </p>
          <p className="text-slate-600 leading-relaxed text-xs">
            This observational information is immediately synchronized with responding paramedics and receiving hospital emergency departments. <strong>This is not a clinical diagnosis.</strong>
          </p>
        </div>
      </div>

      {/* Assistive Missing Information Micro-Prompts */}
      {(report.isAwake === 'Not Sure' || report.isBreathingNormally === 'Not Sure' || !report.location.landmark) && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
            <AlertOctagon className="h-4 w-4 text-amber-600" />
            <span>Missing Information Check</span>
          </div>
          <p className="text-xs text-slate-600">
            Clarifying any unverified details below helps responders prepare equipment before reaching the scene:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {report.isAwake === 'Not Sure' && (
              <button
                type="button"
                onClick={() => onEditStep(3)}
                className="px-3 py-1 rounded-lg border border-amber-300 bg-white hover:bg-amber-100/50 text-amber-800 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <span>+ Clarify Consciousness</span>
                <Edit3 className="h-3 w-3" />
              </button>
            )}
            {report.isBreathingNormally === 'Not Sure' && (
              <button
                type="button"
                onClick={() => onEditStep(3)}
                className="px-3 py-1 rounded-lg border border-amber-300 bg-white hover:bg-amber-100/50 text-amber-800 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <span>+ Clarify Breathing</span>
                <Edit3 className="h-3 w-3" />
              </button>
            )}
            {!report.location.landmark && (
              <button
                type="button"
                onClick={() => onEditStep(4)}
                className="px-3 py-1 rounded-lg border border-blue-300 bg-white hover:bg-blue-50 text-blue-800 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <span>+ Add Landmark / Floor</span>
                <Edit3 className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="space-y-3">
        {/* Section 1: Incident */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-red-600" /> 1. Incident Type
            </span>
            <button
              type="button"
              onClick={() => onEditStep(1)}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              <Edit3 className="h-3.5 w-3.5" /> Edit
            </button>
          </div>
          <p className="text-base font-bold text-slate-900">
            {report.incidentType || 'Not specified'}
          </p>
        </div>

        {/* Section 2: People */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="h-4 w-4 text-blue-600" /> 2. People & Responsiveness
            </span>
            <button
              type="button"
              onClick={() => onEditStep(2)}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              <Edit3 className="h-3.5 w-3.5" /> Edit
            </button>
          </div>
          <div className="text-xs space-y-1 text-slate-700">
            <p>People requiring help: <strong className="text-slate-900 font-mono text-sm">{report.peopleCount}</strong></p>
            <p>Unconscious / unresponsive reported: <strong className={`font-semibold ${report.hasUnconscious === 'Yes' ? 'text-red-600' : 'text-slate-800'}`}>{report.hasUnconscious}</strong></p>
          </div>
        </div>

        {/* Section 3: Condition */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-emerald-600" /> 3. Observed Condition
            </span>
            <button
              type="button"
              onClick={() => onEditStep(3)}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              <Edit3 className="h-3.5 w-3.5" /> Edit
            </button>
          </div>
          <div className="text-xs space-y-1 text-slate-700">
            <p>Person awake & responding: <strong>{report.isAwake}</strong></p>
            <p>Breathing normally: <strong>{report.isBreathingNormally}</strong></p>
            <div className="pt-1">
              <span className="text-[11px] text-slate-500 block mb-1">Reported observations:</span>
              {report.visibleConcerns.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {report.visibleConcerns.map((c, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200"
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
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-purple-600" /> 4. Emergency Location
            </span>
            <button
              type="button"
              onClick={() => onEditStep(4)}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              <Edit3 className="h-3.5 w-3.5" /> Edit
            </button>
          </div>
          <div className="text-xs text-slate-700">
            <p className="font-bold text-slate-900">{report.location.address}</p>
            {report.location.landmark && (
              <p className="text-slate-500 mt-0.5">Landmark: {report.location.landmark}</p>
            )}
            <span className="text-[10px] text-emerald-600 font-mono font-bold block mt-1">
              {report.location.accuracyText}
            </span>
          </div>
        </div>

        {/* Optional Notes */}
        {report.additionalNotes && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1 text-xs shadow-xs">
            <span className="font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-amber-600" /> Additional Notes
            </span>
            <p className="text-slate-700 italic">&ldquo;{report.additionalNotes}&rdquo;</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full py-3.5 px-6 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-bold text-base shadow-sm transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <AlertOctagon className="h-5 w-5" />
          <span>{isSubmitting ? 'Submitting Report...' : 'SUBMIT EMERGENCY REPORT'}</span>
        </button>

        <p className="text-[11px] text-center text-slate-400">
          By submitting, your observations are transmitted directly to dispatch and regional hospital networks.
        </p>
      </div>
    </div>
  );
}
