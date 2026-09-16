import React from 'react';

interface ProgressIndicatorProps {
  currentStep: number; // 1 to 5
  totalSteps?: number;
}

export function ProgressIndicator({ currentStep, totalSteps = 5 }: ProgressIndicatorProps) {
  const steps = [
    { num: 1, label: 'Incident' },
    { num: 2, label: 'People' },
    { num: 3, label: 'Condition' },
    { num: 4, label: 'Location' },
    { num: 5, label: 'Review' },
  ];

  const progressPercentage = Math.round(((currentStep - 1) / (totalSteps - 1)) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
        <span className="text-red-400">Step {currentStep} of {totalSteps}</span>
        <span className="text-slate-200">{steps[currentStep - 1]?.label}</span>
      </div>

      {/* Progress Track */}
      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 transition-all duration-300 rounded-full"
          style={{ width: `${Math.max(10, progressPercentage)}%` }}
        />
      </div>

      {/* Step Pills for larger screens */}
      <div className="hidden sm:grid grid-cols-5 gap-1 pt-1 text-[11px] font-medium text-center text-slate-400">
        {steps.map((st) => (
          <span
            key={st.num}
            className={`truncate ${
              st.num === currentStep
                ? 'text-red-400 font-bold'
                : st.num < currentStep
                ? 'text-emerald-400'
                : 'text-slate-400'
            }`}
          >
            {st.num}. {st.label}
          </span>
        ))}
      </div>
    </div>
  );
}
