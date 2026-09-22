'use client';

import React from 'react';
import { IncidentCategory } from '@/types/citizen';
import { INCIDENT_OPTIONS } from '@/lib/demo/citizen-data';
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
        return <Car className="h-5 w-5 text-red-600" />;
      case 'HeartPulse':
        return <HeartPulse className="h-5 w-5 text-red-600" />;
      case 'Wind':
        return <Wind className="h-5 w-5 text-sky-600" />;
      case 'UserX':
        return <UserX className="h-5 w-5 text-amber-600" />;
      case 'PersonStanding':
        return <PersonStanding className="h-5 w-5 text-emerald-600" />;
      case 'Activity':
        return <Activity className="h-5 w-5 text-purple-600" />;
      case 'Flame':
        return <Flame className="h-5 w-5 text-orange-600" />;
      case 'HelpCircle':
      default:
        return <HelpCircle className="h-5 w-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1 text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          What happened?
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Select the emergency type that best describes the situation.
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
              className={`p-4 rounded-xl border text-left transition-all flex items-start justify-between gap-3 group active:scale-[0.99] ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-2 ring-blue-500/30'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg border shrink-0 ${
                  isSelected 
                    ? 'bg-white border-blue-200' 
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  {getIcon(opt.iconName)}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 leading-snug">
                      {opt.title}
                    </span>
                    {opt.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-50 text-red-700 border border-red-200">
                        {opt.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-snug">
                    {opt.description}
                  </p>
                </div>
              </div>

              <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${
                isSelected ? 'text-blue-600 translate-x-0.5' : 'text-slate-400 group-hover:text-slate-600'
              }`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
