'use client';

import React from 'react';
import { IncidentCategory } from '@/types/citizen';
import { INCIDENT_OPTIONS, IncidentOption } from '@/lib/demo/citizen-data';
import { 
  Car, 
  HeartPulse, 
  Wind, 
  UserX, 
  PersonStanding, 
  Activity, 
  Flame, 
  HelpCircle,
  ChevronRight
} from 'lucide-react';

interface IncidentTypeSelectorProps {
  selected: IncidentCategory | '';
  onSelect: (type: IncidentCategory) => void;
}

export function IncidentTypeSelector({ selected, onSelect }: IncidentTypeSelectorProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Car':
        return <Car className="h-6 w-6 text-red-400" />;
      case 'HeartPulse':
        return <HeartPulse className="h-6 w-6 text-red-400" />;
      case 'Wind':
        return <Wind className="h-6 w-6 text-sky-400" />;
      case 'UserX':
        return <UserX className="h-6 w-6 text-amber-400" />;
      case 'PersonStanding':
        return <PersonStanding className="h-6 w-6 text-emerald-400" />;
      case 'Activity':
        return <Activity className="h-6 w-6 text-purple-400" />;
      case 'Flame':
        return <Flame className="h-6 w-6 text-orange-400" />;
      case 'HelpCircle':
      default:
        return <HelpCircle className="h-6 w-6 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1 text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          What happened?
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Tap the option that best matches the current emergency.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {INCIDENT_OPTIONS.map((opt) => {
          const isSelected = selected === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.id)}
              className={`p-4 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 group active:scale-[0.98] ${
                isSelected
                  ? 'border-red-500 bg-red-950/40 shadow-lg shadow-red-950/40 ring-2 ring-red-500/50'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`p-2.5 rounded-xl border shrink-0 ${
                  isSelected 
                    ? 'bg-red-950/80 border-red-500/40' 
                    : 'bg-slate-950 border-slate-800 group-hover:border-slate-700'
                }`}>
                  {getIcon(opt.iconName)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white leading-snug">
                      {opt.title}
                    </span>
                    {opt.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800/60">
                        {opt.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-snug">
                    {opt.description}
                  </p>
                </div>
              </div>

              <ChevronRight className={`h-5 w-5 shrink-0 transition-transform ${
                isSelected ? 'text-red-400 translate-x-0.5' : 'text-slate-400 group-hover:text-slate-400'
              }`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
