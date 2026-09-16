import React from 'react';
import { EmergencyCase } from '@/types/hospital';
import { 
  FileText, 
  AlertTriangle, 
  Heart, 
  Pill, 
  History, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle,
  Activity
} from 'lucide-react';

interface CaseSummaryCardProps {
  caseData: EmergencyCase;
}

export function CaseSummaryCard({ caseData: c }: CaseSummaryCardProps) {
  const summary = c.clinicalSummary;

  return (
    <div className="space-y-6">
      {/* Pre-Arrival Banner Notice */}
      <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-3.5 flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-0.5">
          <p className="font-semibold text-blue-200 uppercase tracking-wide">
            Pre-Arrival Reported Clinical Summary
          </p>
          <p className="text-slate-400 leading-relaxed">
            Data captured at scene intake and synchronized before arrival. All values represent reported/pre-hospital observations for resource readiness. Final clinical evaluation performed on patient arrival.
          </p>
        </div>
      </div>

      {/* Main Clinical Findings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Chief Complaint & Mechanism */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <FileText className="h-4 w-4 text-blue-400" />
            <span>Chief Complaint & Mechanism</span>
          </div>

          <div className="space-y-2">
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">Reported Issue:</span>
              <p className="text-sm font-medium text-slate-100 leading-snug">
                {summary.chiefComplaint}
              </p>
            </div>

            {summary.mechanismOfInjury && (
              <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/60 text-xs text-slate-300">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">Mechanism / Context:</span>
                <p>{summary.mechanismOfInjury}</p>
              </div>
            )}

            <div className="flex items-center justify-between text-xs pt-1 px-1 text-slate-400">
              <span>Consciousness (AVPU):</span>
              <span className="font-semibold text-slate-200 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                {summary.consciousness}
              </span>
            </div>

            {summary.symptomOnsetMinutes && (
              <div className="flex items-center justify-between text-xs px-1 text-slate-400">
                <span>Estimated Symptom Onset:</span>
                <span className="font-semibold text-slate-200">
                  Approx. {summary.symptomOnsetMinutes} mins ago
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Reported Symptoms & Pertinent Negatives */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <Activity className="h-4 w-4 text-emerald-400" />
            <span>Symptoms & Observations</span>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">Detected Symptoms:</span>
              <div className="flex flex-wrap gap-1.5">
                {summary.reportedSymptoms.map((symp, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-red-950/30 text-red-300 border border-red-500/20"
                  >
                    <AlertTriangle className="h-3 w-3 text-red-400 shrink-0" />
                    {symp}
                  </span>
                ))}
              </div>
            </div>

            {summary.pertinentNegatives.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">Pertinent Negatives (Reported Absent):</span>
                <div className="flex flex-wrap gap-1.5">
                  {summary.pertinentNegatives.map((neg, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800/60 text-slate-300 border border-slate-700/50"
                    >
                      <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                      {neg}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Medical Background: Allergies, Meds, History */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Allergies */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 uppercase tracking-wider">
            <XCircle className="h-4 w-4 text-amber-400" />
            <span>Known Allergies</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-1">
            {summary.knownAllergies.map((item, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Current Medications */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-300 uppercase tracking-wider">
            <Pill className="h-4 w-4 text-blue-400" />
            <span>Known Medications</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-1">
            {summary.knownMedications.map((item, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Medical History */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-300 uppercase tracking-wider">
            <History className="h-4 w-4 text-purple-400" />
            <span>Relevant History</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-1">
            {summary.relevantHistory.map((item, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* AI Structuring Note & Required Hospital Specialties */}
      {summary.aiStructuringNotes && (
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Coordination & Staging Recommendation
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              LifeSync Safety Engine v1.2
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
            {summary.aiStructuringNotes}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-400 font-medium">Recommended Specialties:</span>
            {summary.specialtyRequirements.map((spec, i) => (
              <span
                key={i}
                className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-900/40 text-blue-200 border border-blue-700/50"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
