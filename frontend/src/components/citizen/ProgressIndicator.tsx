import React from 'react';

interface ProgressIndicatorProps {
  currentStep: number; // 1 to 5
  totalSteps?: number;
}

export function ProgressIndicator({ currentStep, totalSteps = 5 }: ProgressIndicatorProps) {
  const steps = [
    { num: 1, label: 'What happened?' },
    { num: 2, label: 'People' },
    { num: 3, label: 'Condition' },
    { num: 4, label: 'Location' },
    { num: 5, label: 'Review' },
  ];

  const progressPercentage = Math.round(((currentStep) / totalSteps) * 100);

  return (
    <div className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="text-blue-600 font-mono font-bold">Step {currentStep} of {totalSteps}</span>
        <span className="text-slate-800 font-bold">{steps[currentStep - 1]?.label}</span>
      </div>

      {/* Progress Track */}
      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        <div 
          className="h-full bg-blue-600 transition-all duration-300 rounded-full"
          style={{ width: `${Math.max(10, progressPercentage)}%` }}
        />
      </div>

      {/* Step Pills */}
      <div className="hidden sm:grid grid-cols-5 gap-1 pt-1 text-[11px] font-medium text-center">
        {steps.map((st) => (
          <span
            key={st.num}
            className={`truncate ${
              st.num === currentStep
                ? 'text-blue-600 font-bold'
                : st.num < currentStep
                ? 'text-emerald-600'
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
