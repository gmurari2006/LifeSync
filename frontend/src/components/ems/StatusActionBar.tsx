'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EMSCase, EMSTransportStatus } from '@/types/ems';
import { useEMS } from '@/context/EMSContext';
import { 
  CheckCircle2, 
  ArrowRight, 
  MapPin, 
  Ambulance, 
  Building2, 
  Navigation,
  FileCheck,
  RotateCcw
} from 'lucide-react';

interface StatusActionBarProps {
  currentCase: EMSCase;
}

export function StatusActionBar({ currentCase }: StatusActionBarProps) {
  const router = useRouter();
  const { updateTransportStatus, acceptAssignment } = useEMS();

  const getNextAction = () => {
    switch (currentCase.transportStatus) {
      case 'Assigned':
        return {
          label: 'Accept Dispatch Assignment',
          action: () => acceptAssignment(currentCase.id),
          icon: CheckCircle2,
          color: 'bg-emerald-600 hover:bg-emerald-500',
        };
      case 'Responding to Scene':
        return {
          label: 'Mark "Arrived on Scene"',
          action: () => updateTransportStatus(currentCase.id, 'On Scene'),
          icon: MapPin,
          color: 'bg-purple-600 hover:bg-purple-500',
        };
      case 'On Scene':
        return {
          label: 'Mark "Patient Loaded in Ambulance"',
          action: () => updateTransportStatus(currentCase.id, 'Patient Loaded'),
          icon: Ambulance,
          color: 'bg-blue-600 hover:bg-blue-500',
        };
      case 'Patient Loaded':
        return {
          label: 'Begin Transit to Receiving Hospital',
          action: () => updateTransportStatus(currentCase.id, 'Transporting'),
          icon: Navigation,
          color: 'bg-orange-600 hover:bg-orange-500',
        };
      case 'Transporting':
        return {
          label: 'Mark "Arrived at Emergency Bay"',
          action: () => updateTransportStatus(currentCase.id, 'Arrived at Hospital'),
          icon: Building2,
          color: 'bg-emerald-600 hover:bg-emerald-500',
        };
      case 'Arrived at Hospital':
        return {
          label: 'Proceed to Bedside Handover',
          action: () => router.push('/ems/handover'),
          icon: FileCheck,
          color: 'bg-emerald-600 hover:bg-emerald-500',
        };
      case 'Handover Complete':
      default:
        return {
          label: 'Return to Case Queue',
          action: () => router.push('/ems/cases'),
          icon: RotateCcw,
          color: 'bg-slate-800 hover:bg-slate-700',
        };
    }
  };

  const next = getNextAction();
  const Icon = next.icon;

  return (
    <div className="rounded-2xl border border-orange-500/30 bg-slate-950/95 p-4 sm:p-5 shadow-2xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Current Workflow Stage */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="h-3 w-3 rounded-full bg-orange-400 animate-ping shrink-0" />
        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Current Stage
          </span>
          <span className="text-sm font-extrabold text-white">
            {currentCase.transportStatus}
          </span>
        </div>
      </div>

      {/* Secondary Fast Action Links */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <Link
          href="/ems/active"
          className="px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all"
        >
          <Navigation className="h-3.5 w-3.5 text-orange-400" />
          <span className="hidden sm:inline">In-Transit</span> Console
        </Link>

        {/* Primary Next Action Button */}
        <button
          type="button"
          onClick={next.action}
          className={`flex-1 sm:flex-initial px-6 py-3.5 rounded-2xl font-extrabold text-xs sm:text-sm text-white shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 ${next.color}`}
        >
          <Icon className="h-4 w-4" />
          <span>{next.label}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
