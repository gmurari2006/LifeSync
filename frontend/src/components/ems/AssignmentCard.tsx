'use client';

import React from 'react';
import Link from 'next/link';
import { EMSCase } from '@/types/ems';
import { useEMS } from '@/context/EMSContext';
import { 
  AlertOctagon, 
  MapPin, 
  Clock, 
  Building2, 
  Users, 
  ArrowRight, 
  Radio,
  CheckCircle2
} from 'lucide-react';

interface AssignmentCardProps {
  currentCase: EMSCase;
}

export function AssignmentCard({ currentCase }: AssignmentCardProps) {
  const { acceptAssignment } = useEMS();

  const isAssignedOnly = currentCase.transportStatus === 'Assigned';

  return (
    <div className="rounded-3xl border border-orange-500/40 bg-gradient-to-b from-orange-950/40 via-slate-900/80 to-slate-950 p-5 sm:p-7 shadow-2xl relative overflow-hidden space-y-5">
      {/* Background Accent Pill */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-orange-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-600/20 border border-orange-500/40 text-orange-400">
            <AlertOctagon className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                Current Priority Assignment
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-950 text-red-300 border border-red-800">
                {currentCase.operationalPriority}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-mono font-extrabold text-white">
              {currentCase.id} &middot; {currentCase.incidentType}
            </h2>
          </div>
        </div>

        {/* Current Transport Status Badge */}
        <div className="px-3.5 py-1.5 rounded-xl border border-orange-500/40 bg-orange-950/60 text-orange-200 font-bold text-xs uppercase tracking-wide flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-orange-400 animate-ping" />
          <span>Status: {currentCase.transportStatus}</span>
        </div>
      </div>

      {/* Grid of Key Field Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
          <span className="text-slate-400 flex items-center gap-1.5 font-medium">
            <MapPin className="h-3.5 w-3.5 text-orange-400" /> Incident Scene
          </span>
          <p className="font-bold text-slate-200 text-xs sm:text-sm line-clamp-1">
            {currentCase.citizenReport.reportedLocation}
          </p>
          {currentCase.citizenReport.landmark && (
            <p className="text-[11px] text-slate-400 truncate">
              {currentCase.citizenReport.landmark}
            </p>
          )}
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
          <span className="text-slate-400 flex items-center gap-1.5 font-medium">
            <Building2 className="h-3.5 w-3.5 text-blue-400" /> Receiving Hospital
          </span>
          <p className="font-bold text-slate-200 text-xs sm:text-sm truncate">
            {currentCase.destinationHospital.name}
          </p>
          <p className="text-[11px] text-emerald-400 font-semibold">
            {currentCase.destinationHospital.assignedBay || 'Bay Pending'}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
          <span className="text-slate-400 flex items-center gap-1.5 font-medium">
            <Clock className="h-3.5 w-3.5 text-amber-400" /> Simulated ETA / Distance
          </span>
          <p className="font-mono font-extrabold text-amber-300 text-base">
            {currentCase.etaMinutes} min <span className="text-xs text-slate-400 font-normal">({currentCase.distanceRemainingKm} km)</span>
          </p>
          <p className="text-[10px] text-slate-400 uppercase font-mono">
            GPS Vector Simulation
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
          <span className="text-slate-400 flex items-center gap-1.5 font-medium">
            <Users className="h-3.5 w-3.5 text-purple-400" /> Patient Acuity
          </span>
          <p className="font-bold text-slate-200 text-xs sm:text-sm">
            {currentCase.patientAge}y {currentCase.patientSex} &middot; {currentCase.patientStatus}
          </p>
          <p className="text-[11px] text-slate-400">
            {currentCase.patientCount} Patient{currentCase.patientCount > 1 ? 's' : ''} on scene
          </p>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
          <span>Last telemetry update: {currentCase.lastUpdated}</span>
        </div>

        <div className="flex items-center gap-3">
          {isAssignedOnly && (
            <button
              type="button"
              onClick={() => acceptAssignment(currentCase.id)}
              className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-950/60 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Accept Dispatch</span>
            </button>
          )}

          <Link
            href={`/ems/cases/${currentCase.id}`}
            className="px-6 py-3 rounded-2xl bg-orange-600 hover:bg-orange-500 active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-orange-950/60 transition-all flex items-center gap-2"
          >
            <span>Open Case Workspace</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
