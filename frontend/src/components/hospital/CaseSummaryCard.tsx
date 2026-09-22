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
  const summary = c?.clinicalSummary || ({} as any);
  const reportedSymptoms = summary?.reportedSymptoms || [];
  const pertinentNegatives = summary?.pertinentNegatives || [];
  const knownAllergies = summary?.knownAllergies || [];
  const knownMedications = summary?.knownMedications || [];
  const relevantHistory = summary?.relevantHistory || [];
  const specialtyRequirements = summary?.specialtyRequirements || [];

  return (
    <div className="space-y-5">
      {/* Pre-Arrival Banner Notice */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-3.5 flex items-start gap-2.5">
        <ShieldAlert className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-0.5">
          <p className="font-bold text-blue-900 uppercase tracking-wider text-[11px]">
            PRE-ARRIVAL REPORTED CLINICAL SUMMARY
          </p>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            Data originates from citizen reports and verified pre-hospital observations. Final clinical evaluation occurs on patient arrival.
          </p>
        </div>
      </div>

      {/* Main Clinical Findings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Chief Complaint & Mechanism */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <FileText className="h-4 w-4 text-blue-600" />
            <span>Chief Complaint &amp; Mechanism</span>
          </div>

          <div className="space-y-2">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Reported Issue:</span>
              <p className="text-sm font-semibold text-slate-900 leading-snug">
                {summary.chiefComplaint}
              </p>
            </div>

            {summary.mechanismOfInjury && (
              <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-200 text-xs text-slate-700">
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">Mechanism / Context:</span>
                <p>{summary.mechanismOfInjury}</p>
              </div>
            )}

            <div className="flex items-center justify-between text-xs pt-1 px-1 text-slate-600">
              <span>Consciousness (AVPU):</span>
              <span className="font-bold text-slate-800 px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200">
                {summary.consciousness}
              </span>
            </div>

            {summary.symptomOnsetMinutes && (
              <div className="flex items-center justify-between text-xs px-1 text-slate-600">
                <span>Estimated Symptom Onset:</span>
                <span className="font-semibold text-slate-800">
                  Approx. {summary.symptomOnsetMinutes} mins ago
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Reported Symptoms & Pertinent Negatives */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Activity className="h-4 w-4 text-emerald-600" />
            <span>Symptoms &amp; Observations</span>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">Detected Symptoms:</span>
              <div className="flex flex-wrap gap-1.5">
                {reportedSymptoms.map((symp: string, i: number) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200"
                  >
                    <AlertTriangle className="h-3 w-3 text-rose-600 shrink-0" />
                    {symp}
                  </span>
                ))}
              </div>
            </div>

            {pertinentNegatives.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">Pertinent Negatives (Reported Absent):</span>
                <div className="flex flex-wrap gap-1.5">
                  {pertinentNegatives.map((neg: string, i: number) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
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
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
            <XCircle className="h-4 w-4 text-amber-600" />
            <span>Known Allergies</span>
          </div>
          <ul className="text-xs text-slate-700 space-y-1">
            {knownAllergies.length === 0 ? (
              <li className="text-slate-400 italic">None reported</li>
            ) : (
              knownAllergies.map((item: string, i: number) => (
                <li key={i} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span>{item}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Current Medications */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-800 uppercase tracking-wider">
            <Pill className="h-4 w-4 text-blue-600" />
            <span>Known Medications</span>
          </div>
          <ul className="text-xs text-slate-700 space-y-1">
            {knownMedications.length === 0 ? (
              <li className="text-slate-400 italic">None reported</li>
            ) : (
              knownMedications.map((item: string, i: number) => (
                <li key={i} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  <span>{item}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Medical History */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-800 uppercase tracking-wider">
            <History className="h-4 w-4 text-purple-600" />
            <span>Relevant History</span>
          </div>
          <ul className="text-xs text-slate-700 space-y-1">
            {relevantHistory.length === 0 ? (
              <li className="text-slate-400 italic">None reported</li>
            ) : (
              relevantHistory.map((item: string, i: number) => (
                <li key={i} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                  <span>{item}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* AI Structuring Note & Required Hospital Specialties */}
      {summary?.aiStructuringNotes && (
        <div className="rounded-2xl border border-purple-200 bg-purple-50/40 p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">
              Coordination &amp; Staging Recommendation
            </span>
            <span className="text-[10px] text-purple-700 font-mono">
              LifeSync Safety Engine v1.2
            </span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-purple-100 shadow-sm">
            {summary.aiStructuringNotes}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-600 font-medium">Recommended Specialties:</span>
            {specialtyRequirements.map((spec: string, i: number) => (
              <span
                key={i}
                className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"
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
