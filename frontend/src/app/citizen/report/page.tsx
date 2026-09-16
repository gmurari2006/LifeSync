'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCitizen } from '@/context/CitizenContext';
import { ProgressIndicator } from '@/components/citizen/ProgressIndicator';
import { IncidentTypeSelector } from '@/components/citizen/IncidentTypeSelector';
import { PeopleCounter } from '@/components/citizen/PeopleCounter';
import { ConditionSelector } from '@/components/citizen/ConditionSelector';
import { LocationSelector } from '@/components/citizen/LocationSelector';
import { IncidentCategory, VisibleConcern, YesNoNotSure } from '@/types/citizen';
import { ArrowLeft, ArrowRight, CheckCircle, ShieldAlert } from 'lucide-react';

function CitizenReportWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { draftReport, updateDraftReport } = useCitizen();

  const initialStepParam = searchParams.get('step');
  const parsedStep = initialStepParam ? parseInt(initialStepParam, 10) : 1;
  const validStep = parsedStep >= 1 && parsedStep <= 4 ? parsedStep : 1;

  const [currentStep, setCurrentStep] = useState<number>(validStep);

  useEffect(() => {
    if (initialStepParam) {
      const step = parseInt(initialStepParam, 10);
      if (step >= 1 && step <= 4) {
        setCurrentStep(step);
      }
    }
  }, [initialStepParam]);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push('/citizen/report/review');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push('/citizen');
    }
  };

  const handleIncidentSelect = (type: IncidentCategory) => {
    updateDraftReport({ incidentType: type });
  };

  const handlePeopleCountChange = (count: number | '4+') => {
    updateDraftReport({ peopleCount: count });
  };

  const handleHasUnconsciousChange = (val: YesNoNotSure) => {
    updateDraftReport({ hasUnconscious: val });
  };

  const handleIsAwakeChange = (val: YesNoNotSure) => {
    updateDraftReport({ isAwake: val });
  };

  const handleIsBreathingChange = (val: YesNoNotSure) => {
    updateDraftReport({ isBreathingNormally: val });
  };

  const handleToggleConcern = (concern: VisibleConcern) => {
    const exists = draftReport.visibleConcerns.includes(concern);
    const updated = exists
      ? draftReport.visibleConcerns.filter(c => c !== concern)
      : [...draftReport.visibleConcerns, concern];
    updateDraftReport({ visibleConcerns: updated });
  };

  const isStep1Valid = Boolean(draftReport.incidentType);

  return (
    <div className="space-y-6 py-2">
      {/* Step Progress Bar */}
      <ProgressIndicator currentStep={currentStep} totalSteps={5} />

      {/* Dynamic Step Component */}
      <div className="min-h-[360px]">
        {currentStep === 1 && (
          <IncidentTypeSelector
            selected={draftReport.incidentType}
            onSelect={handleIncidentSelect}
          />
        )}

        {currentStep === 2 && (
          <PeopleCounter
            peopleCount={draftReport.peopleCount}
            hasUnconscious={draftReport.hasUnconscious}
            onPeopleCountChange={handlePeopleCountChange}
            onHasUnconsciousChange={handleHasUnconsciousChange}
          />
        )}

        {currentStep === 3 && (
          <ConditionSelector
            isAwake={draftReport.isAwake}
            isBreathingNormally={draftReport.isBreathingNormally}
            visibleConcerns={draftReport.visibleConcerns}
            onIsAwakeChange={handleIsAwakeChange}
            onIsBreathingChange={handleIsBreathingChange}
            onToggleConcern={handleToggleConcern}
          />
        )}

        {currentStep === 4 && (
          <LocationSelector
            location={draftReport.location}
            additionalNotes={draftReport.additionalNotes}
            onLocationChange={(loc) => updateDraftReport({ location: loc })}
            onNotesChange={(notes) => updateDraftReport({ additionalNotes: notes })}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={handleBack}
          className="px-5 py-3.5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 font-bold text-xs sm:text-sm transition-all flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{currentStep === 1 ? 'Cancel' : 'Back'}</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={currentStep === 1 && !isStep1Valid}
          className={`px-6 py-3.5 rounded-2xl font-extrabold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-lg ${
            currentStep === 1 && !isStep1Valid
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/40'
              : currentStep === 4
              ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/60'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-950/60'
          }`}
        >
          <span>
            {currentStep === 1 && 'Next: People'}
            {currentStep === 2 && 'Next: Condition'}
            {currentStep === 3 && 'Next: Location'}
            {currentStep === 4 && 'Review Report'}
          </span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function CitizenReportPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-slate-400 text-sm">
        Loading emergency intake wizard...
      </div>
    }>
      <CitizenReportWizard />
    </Suspense>
  );
}
