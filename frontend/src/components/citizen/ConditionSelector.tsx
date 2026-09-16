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
      <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5 flex items-start gap-2.5 text-xs text-amber-200">
        <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <span>
          <strong>Observer Guidance:</strong> Only report what you can visibly see or hear. You do not need medical training or a diagnosis.
        </span>
      </div>

      {/* Question 1: Awake & Responding */}
      <div className="space-y-2.5">
        <label className="text-sm font-bold text-white flex items-center gap-2">
          <Eye className="h-4 w-4 text-blue-400" />
          <span>Is the person awake and responding?</span>
        </label>
        <div className="grid grid-cols-3 gap-2.5">
          {yesNoOptions.map((opt) => {
            const isSelected = isAwake === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onIsAwakeChange(opt)}
                className={`py-3 px-2 rounded-xl border text-xs font-bold transition-all ${
                  isSelected
                    ? opt === 'No'
                      ? 'border-red-500 bg-red-950/60 text-white ring-2 ring-red-500/40'
                      : 'border-blue-500 bg-blue-950/50 text-white ring-2 ring-blue-500/40'
                    : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question 2: Breathing Normally */}
      <div className="space-y-2.5 pt-3 border-t border-slate-800/80">
        <label className="text-sm font-bold text-white flex items-center gap-2">
          <Wind className="h-4 w-4 text-sky-400" />
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
                className={`py-3 px-2 rounded-xl border text-xs font-bold transition-all ${
                  isSelected
                    ? opt === 'No'
                      ? 'border-red-500 bg-red-950/60 text-white ring-2 ring-red-500/40'
                      : 'border-blue-500 bg-blue-950/50 text-white ring-2 ring-blue-500/40'
                    : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question 3: Visible Concerns (Multi-select) */}
      <div className="space-y-3 pt-3 border-t border-slate-800/80">
        <label className="text-sm font-bold text-white flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <span>Major visible concerns (Select all that apply):</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {VISIBLE_CONCERN_OPTIONS.map((concern) => {
            const isChecked = visibleConcerns.includes(concern);
            return (
              <button
                key={concern}
                type="button"
                onClick={() => onToggleConcern(concern)}
                className={`p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between gap-2 active:scale-[0.99] ${
                  isChecked
                    ? 'border-red-500/60 bg-red-950/30 text-white font-semibold'
                    : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span>{concern}</span>
                {isChecked ? (
                  <CheckSquare className="h-4 w-4 text-red-400 shrink-0" />
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
