'use client';

import React from 'react';
import { HospitalDestinationInfo } from '@/types/ems';
import { 
  Building2, 
  BedDouble, 
  Clock, 
  MapPin, 
  PhoneCall, 
  ShieldCheck, 
  CheckCircle2, 
  Radio,
  HeartPulse
} from 'lucide-react';

interface HospitalDestinationCardProps {
  destination: HospitalDestinationInfo;
}

export function HospitalDestinationCard({ destination }: HospitalDestinationCardProps) {
  return (
    <div className="rounded-3xl border border-blue-500/30 bg-slate-900/70 p-5 sm:p-6 space-y-4 shadow-lg">
      {/* Header with Destination Hospital Name */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">
              {destination.name}
            </h3>
            <p className="text-xs text-blue-300 font-medium">
              {destination.traumaLevel}
            </p>
          </div>
        </div>

        {/* Hospital Pre-Arrival Acknowledgement Badge */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Hospital: {destination.acknowledgementState}</span>
          </span>
        </div>
      </div>

      {/* Grid of Hospital Staging Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
        
        {/* Allocated Emergency Bay */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
          <span className="text-slate-400 flex items-center gap-1.5 font-medium">
            <BedDouble className="h-3.5 w-3.5 text-blue-400" /> Allocated Emergency Bay
          </span>
          <p className="font-bold text-white text-xs sm:text-sm">
            {destination.assignedBay || 'Bay Allocation in Progress'}
          </p>
          <span className="text-[10px] text-emerald-400 font-semibold block">
            Staging Protocol Verified
          </span>
        </div>

        {/* Trauma / Specialist Team Staging */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
          <span className="text-slate-400 flex items-center gap-1.5 font-medium">
            <HeartPulse className="h-3.5 w-3.5 text-rose-400" /> Specialist Team Status
          </span>
          <p className="font-bold text-white text-xs sm:text-sm">
            Trauma Team: <span className="text-emerald-400">{destination.traumaTeamStatus}</span>
          </p>
          {destination.cathLabStatus && (
            <p className="text-[11px] text-amber-300">
              Cath Lab Interventionalist: {destination.cathLabStatus}
            </p>
          )}
        </div>

        {/* Hospital ED Coordinator Contact */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
          <span className="text-slate-400 flex items-center gap-1.5 font-medium">
            <PhoneCall className="h-3.5 w-3.5 text-purple-400" /> Triage / ED Lead
          </span>
          <p className="font-bold text-slate-200">
            {destination.coordinatorName}
          </p>
          <p className="text-[11px] font-mono text-slate-400">
            {destination.coordinatorContact}
          </p>
        </div>

      </div>

      {/* Simulated Notice */}
      <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span>Simulated GPS Routing &middot; Zero Real Vehicle Hardware</span>
        <span className="text-blue-400">LifeSync Pre-Hospital Bridge Active</span>
      </div>
    </div>
  );
}
