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
      <div className="space-y-3">
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center justify-center sm:justify-start gap-2">
            <Users className="h-6 w-6 text-blue-400" />
            <span>How many people need help?</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Estimate the number of individuals requiring emergency assistance.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {countOptions.map((opt) => {
            const isSelected = peopleCount === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onPeopleCountChange(opt)}
                className={`py-4 px-2 rounded-2xl border text-center transition-all active:scale-95 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-950/50 text-white font-extrabold text-xl shadow-lg shadow-blue-950/50 ring-2 ring-blue-500/40'
                    : 'border-slate-800 bg-slate-900/60 text-slate-300 font-bold text-lg hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question 2: Unconscious or not responding */}
      <div className="space-y-3 pt-4 border-t border-slate-800/80">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center justify-center sm:justify-start gap-2">
            <UserX className="h-5 w-5 text-red-400" />
            <span>Is anyone unconscious or not responding?</span>
          </h3>
          <p className="text-xs text-slate-400">
            A critical indicator for immediate priority dispatch.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {yesNoOptions.map((opt) => {
            const isSelected = hasUnconscious === opt;
            const isYes = opt === 'Yes';
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onHasUnconsciousChange(opt)}
                className={`py-3.5 px-3 rounded-2xl border text-center text-sm font-bold transition-all active:scale-95 ${
                  isSelected
                    ? isYes
                      ? 'border-red-500 bg-red-950/60 text-white shadow-lg shadow-red-950/50 ring-2 ring-red-500/50'
                      : 'border-blue-500 bg-blue-950/50 text-white shadow-lg ring-2 ring-blue-500/40'
                    : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Observational Notice */}
      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-400">
        <AlertCircle className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
        <span>
          Report what you can observe from a safe distance. Do not endanger yourself or move injured persons unless immediate hazard exists.
        </span>
      </div>
    </div>
  );
}
