'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useEMS } from '@/context/EMSContext';
import { HandoverSummary } from '@/components/ems/HandoverSummary';
import { 
  FileCheck, 
  ArrowLeft, 
  Building2, 
  Ambulance, 
  CheckCircle2, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function EMSHandoverPage() {
  const { cases, activeCaseId, setActiveCaseId } = useEMS();
  const [selectedCaseId, setSelectedCaseId] = useState<string>(activeCaseId || Object.keys(cases)[0]);

  const currentCase = cases[selectedCaseId] || Object.values(cases)[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/ems"
              className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileCheck className="h-7 w-7 text-emerald-600" />
            <span>Hospital Bedside Handover</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Structured clinical transfer protocol from EMS field crew to receiving Emergency Department
          </p>
        </div>

        {/* Case selector tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 self-start sm:self-auto">
          {Object.values(cases).map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setSelectedCaseId(c.id);
                setActiveCaseId(c.id);
              }}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
                selectedCaseId === c.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {c.id}
            </button>
          ))}
        </div>
      </div>

      {/* Handover Summary Component */}
      {currentCase && (
        <HandoverSummary currentCase={currentCase} />
      )}

      {/* Post Handover Information Note */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-slate-800 uppercase tracking-wide">
            Clinical Handover Protocol Standard
          </p>
          <p className="leading-relaxed text-slate-600">
            Completing bedside handover certifies that verbal reporting, verified vital records, and physical patient care have been successfully transitioned to the hospital emergency department. This locks the field record and frees Unit ALS-04 for next dispatch.
          </p>
        </div>
      </div>

    </div>
  );
}
