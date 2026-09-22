'use client';

import React from 'react';
import { YesNoNotSure } from '@/types/citizen';
import { Users, AlertCircle, UserX } from 'lucide-react';

interface PeopleCounterProps {
  peopleCount: number | '4+';
  hasUnconscious: YesNoNotSure;
  onPeopleCountChange: (count: number | '4+') => void;
  onHasUnconsciousChange: (val: YesNoNotSure) => void;
}

export function PeopleCounter({
  peopleCount,
  hasUnconscious,
  onPeopleCountChange,
  onHasUnconsciousChange,
}: PeopleCounterProps) {
  const countOptions: (number | '4+')[] = [1, 2, 3, '4+'];
  const yesNoOptions: YesNoNotSure[] = ['Yes', 'No', 'Not Sure'];

  return (
    <div className="space-y-6">
      {/* Question 1: Number of people */}
      <div className="space-y-3 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center justify-center sm:justify-start gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            <span>How many people need help?</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Estimate the number of individuals requiring emergency assistance.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-3 pt-2">
          {countOptions.map((opt) => {
            const isSelected = peopleCount === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onPeopleCountChange(opt)}
                className={`py-3.5 px-2 rounded-xl border text-center transition-all active:scale-95 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-extrabold text-xl ring-2 ring-blue-200 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 font-bold text-lg hover:bg-slate-50'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question 2: Unconscious or not responding */}
      <div className="space-y-3 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center justify-center sm:justify-start gap-2">
            <UserX className="h-5 w-5 text-red-600" />
            <span>Is anyone unconscious or unresponsive?</span>
          </h3>
          <p className="text-xs text-slate-500">
            Critical indicator for immediate high-priority dispatch.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-1">
          {yesNoOptions.map((opt) => {
            const isSelected = hasUnconscious === opt;
            const isYes = opt === 'Yes';
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onHasUnconsciousChange(opt)}
                className={`py-3 px-3 rounded-xl border text-center text-sm font-bold transition-all active:scale-95 ${
                  isSelected
                    ? isYes
                      ? 'border-red-600 bg-red-50 text-red-700 ring-2 ring-red-200 shadow-xs'
                      : 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-200 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Observational Notice */}
      <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200 flex items-start gap-2.5 text-xs text-slate-600 shadow-xs">
        <AlertCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <span>
          Report what you can observe from a safe vantage point. Do not endanger yourself or move injured persons unless immediate hazard exists.
        </span>
      </div>
    </div>
  );
}
