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
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 space-y-4 max-w-md mx-auto shadow-xs">
          <AlertCircle className="h-10 w-10 text-amber-600 mx-auto" />
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">No Active Emergency Draft</h2>
            <p className="text-xs text-slate-600">
              Please start from step 1 to select the emergency incident type before reviewing.
            </p>
          </div>
          <Link
            href="/citizen/report?step=1"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs"
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
      setSubmitError(err.message || 'Failed to submit report. Please check network connection.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 py-2">
      {/* Progress Indicator at Step 5 */}
      <ProgressIndicator currentStep={5} totalSteps={5} />

      <div className="space-y-1 text-center sm:text-left">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Review Emergency Observations
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Verify your reported details before transmitting to emergency services and receiving hospital teams.
        </p>
      </div>

      {(submitError || contextError) && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <p className="font-bold text-red-800">Transmission Error</p>
            <p className="text-red-700">{submitError || contextError}</p>
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
          className="text-xs text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Location Step</span>
        </button>
      </div>
    </div>
  );
}
