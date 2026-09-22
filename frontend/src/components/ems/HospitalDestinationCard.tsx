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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4 shadow-xs">
      {/* Header with Destination Hospital Name */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {destination.name}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {destination.traumaLevel}
            </p>
          </div>
        </div>

        {/* Hospital Pre-Arrival Acknowledgement Badge */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Hospital: {destination.acknowledgementState}</span>
          </span>
        </div>
      </div>

      {/* Grid of Hospital Staging Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
        
        {/* Allocated Emergency Bay */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <span className="text-slate-500 flex items-center gap-1.5 font-medium">
            <BedDouble className="h-3.5 w-3.5 text-blue-600" /> Allocated Emergency Bay
          </span>
          <p className="font-bold text-slate-900 text-xs sm:text-sm">
            {destination.assignedBay || 'Bay Allocation in Progress'}
          </p>
          <span className="text-[10px] text-emerald-700 font-semibold block">
            Staging Protocol Verified
          </span>
        </div>

        {/* Trauma / Specialist Team Staging */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <span className="text-slate-500 flex items-center gap-1.5 font-medium">
            <HeartPulse className="h-3.5 w-3.5 text-rose-600" /> Specialist Team Status
          </span>
          <p className="font-bold text-slate-900 text-xs sm:text-sm">
            Trauma Team: <span className="text-emerald-700">{destination.traumaTeamStatus}</span>
          </p>
          {destination.cathLabStatus && (
            <p className="text-[11px] text-amber-700">
              Cath Lab Interventionalist: {destination.cathLabStatus}
            </p>
          )}
        </div>

        {/* Hospital ED Coordinator Contact */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <span className="text-slate-500 flex items-center gap-1.5 font-medium">
            <PhoneCall className="h-3.5 w-3.5 text-purple-600" /> Triage / ED Lead
          </span>
          <p className="font-bold text-slate-900">
            {destination.coordinatorName}
          </p>
          <p className="text-[11px] font-mono text-slate-500">
            {destination.coordinatorContact}
          </p>
        </div>

      </div>

      {/* Simulated Notice */}
      <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span>Simulated GPS Routing &middot; Zero Real Vehicle Hardware</span>
        <span className="text-blue-700 font-medium">LifeSync Pre-Hospital Bridge Active</span>
      </div>
    </div>
  );
}
