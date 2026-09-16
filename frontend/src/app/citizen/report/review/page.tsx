'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCitizen } from '@/context/CitizenContext';
import { ProgressIndicator } from '@/components/citizen/ProgressIndicator';
import { ReportSummaryCard } from '@/components/citizen/ReportSummaryCard';
import { ArrowLeft, AlertCircle, AlertTriangle } from 'lucide-react';

export default function CitizenReviewPage() {
  const router = useRouter();
  const { draftReport, submitReport, error: contextError } = useCitizen();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // If user navigated directly without selecting incident
  if (!draftReport.incidentType) {
    return (
      <div className="space-y-6 py-8 text-center">
        <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-6 space-y-4 max-w-md mx-auto">
          <AlertCircle className="h-10 w-10 text-amber-400 mx-auto" />
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">No Active Emergency Draft</h2>
            <p className="text-xs text-slate-300">
              Please start from step 1 to select the emergency incident type before reviewing.
            </p>
          </div>
          <Link
            href="/citizen/report?step=1"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all"
          >
            <span>Start Emergency Report</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleEditStep = (stepNumber: number) => {
    router.push(`/citizen/report?step=${stepNumber}`);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const newCaseId = await submitReport();
      router.push(`/citizen/emergency/${newCaseId}`);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit report. Backend server may be offline.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 py-2">
      {/* Progress Indicator at Step 5 */}
      <ProgressIndicator currentStep={5} totalSteps={5} />

      <div className="space-y-1 text-center sm:text-left">
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          Review Emergency Summary
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Confirm the information before transmitting to emergency services and hospital readiness teams.
        </p>
      </div>

      {(submitError || contextError) && (
        <div className="rounded-xl border border-red-500/40 bg-red-950/40 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <p className="font-bold text-red-200">Transmission Error</p>
            <p className="text-red-300">{submitError || contextError}</p>
          </div>
        </div>
      )}

      {/* Review Summary Component */}
      <ReportSummaryCard
        report={draftReport}
        onEditStep={handleEditStep}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={() => router.push('/citizen/report?step=4')}
          className="text-xs text-slate-400 hover:text-slate-200 font-medium inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Location Step</span>
        </button>
      </div>
    </div>
  );
}
