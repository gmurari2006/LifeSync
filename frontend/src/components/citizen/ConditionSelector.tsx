'use client';

import React from 'react';
import { YesNoNotSure, VisibleConcern } from '@/types/citizen';
import { VISIBLE_CONCERN_OPTIONS } from '@/lib/demo/citizen-data';
import { 
  Eye, 
  Wind, 
  AlertTriangle, 
  CheckSquare, 
  Square, 
  ShieldAlert 
} from 'lucide-react';

interface ConditionSelectorProps {
  isAwake: YesNoNotSure;
  isBreathingNormally: YesNoNotSure;
  visibleConcerns: VisibleConcern[];
  onIsAwakeChange: (val: YesNoNotSure) => void;
  onIsBreathingChange: (val: YesNoNotSure) => void;
  onToggleConcern: (concern: VisibleConcern) => void;
}

export function ConditionSelector({
  isAwake,
  isBreathingNormally,
  visibleConcerns,
  onIsAwakeChange,
  onIsBreathingChange,
  onToggleConcern,
}: ConditionSelectorProps) {
  const yesNoOptions: YesNoNotSure[] = ['Yes', 'No', 'Not Sure'];

  return (
    <div className="space-y-6">
      {/* Safety Notice Card */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 flex items-start gap-2.5 text-xs text-amber-800 shadow-xs">
        <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <span>
          <strong>Observer Guidance:</strong> Only report what you can visibly see or hear right now. You do not need medical expertise.
        </span>
      </div>

      {/* Question 1: Awake & Responding */}
      <div className="space-y-2.5 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Eye className="h-4 w-4 text-blue-600" />
          <span>Is the person awake and responding to you?</span>
        </label>
        <div className="grid grid-cols-3 gap-2.5">
          {yesNoOptions.map((opt) => {
            const isSelected = isAwake === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onIsAwakeChange(opt)}
                className={`py-2.5 px-2 rounded-lg border text-xs font-bold transition-all ${
                  isSelected
                    ? opt === 'No'
                      ? 'border-red-600 bg-red-50 text-red-700 ring-2 ring-red-200'
                      : 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-200'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question 2: Breathing Normally */}
      <div className="space-y-2.5 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Wind className="h-4 w-4 text-sky-600" />
          <span>Are they breathing normally?</span>
        </label>
        <div className="grid grid-cols-3 gap-2.5">
          {yesNoOptions.map((opt) => {
            const isSelected = isBreathingNormally === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onIsBreathingChange(opt)}
                className={`py-2.5 px-2 rounded-lg border text-xs font-bold transition-all ${
                  isSelected
                    ? opt === 'No'
                      ? 'border-red-600 bg-red-50 text-red-700 ring-2 ring-red-200'
                      : 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-200'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question 3: Visible Concerns (Multi-select) */}
      <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <span>Major visible observations (Select all that apply):</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {VISIBLE_CONCERN_OPTIONS.map((concern) => {
            const isChecked = visibleConcerns.includes(concern);
            return (
              <button
                key={concern}
                type="button"
                onClick={() => onToggleConcern(concern)}
                className={`p-3 rounded-lg border text-left text-xs font-medium transition-all flex items-center justify-between gap-2 active:scale-[0.99] ${
                  isChecked
                    ? 'border-red-500 bg-red-50 text-red-800 font-semibold'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{concern}</span>
                {isChecked ? (
                  <CheckSquare className="h-4 w-4 text-red-600 shrink-0" />
                ) : (
                  <Square className="h-4 w-4 text-slate-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
