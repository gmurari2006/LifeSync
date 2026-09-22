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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs relative overflow-hidden space-y-5">
      {/* Background Accent Pill */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 border border-blue-200 text-blue-600">
            <AlertOctagon className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                Current Priority Assignment
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                {currentCase.operationalPriority}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-mono font-bold text-slate-900">
              {currentCase.id} &middot; <span className="font-sans font-bold">{currentCase.incidentType}</span>
            </h2>
          </div>
        </div>

        {/* Current Transport Status Badge */}
        <div className="px-3.5 py-1.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-800 font-bold text-xs uppercase tracking-wide flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
          <span>Status: {currentCase.transportStatus}</span>
        </div>
      </div>

      {/* Grid of Key Field Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <span className="text-slate-500 flex items-center gap-1.5 font-medium">
            <MapPin className="h-3.5 w-3.5 text-blue-600" /> Incident Scene
          </span>
          <p className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">
            {currentCase.citizenReport.reportedLocation}
          </p>
          {currentCase.citizenReport.landmark && (
            <p className="text-[11px] text-slate-500 truncate">
              {currentCase.citizenReport.landmark}
            </p>
          )}
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <span className="text-slate-500 flex items-center gap-1.5 font-medium">
            <Building2 className="h-3.5 w-3.5 text-blue-600" /> Receiving Hospital
          </span>
          <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">
            {currentCase.destinationHospital.name}
          </p>
          <p className="text-[11px] text-emerald-700 font-semibold">
            {currentCase.destinationHospital.assignedBay || 'Bay Pending'}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <span className="text-slate-500 flex items-center gap-1.5 font-medium">
            <Clock className="h-3.5 w-3.5 text-amber-600" /> Simulated ETA / Distance
          </span>
          <p className="font-mono font-bold text-amber-800 text-base">
            {currentCase.etaMinutes} min <span className="text-xs text-slate-500 font-normal">({currentCase.distanceRemainingKm} km)</span>
          </p>
          <p className="text-[10px] text-slate-500 uppercase font-mono">
            GPS Vector Simulation
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <span className="text-slate-500 flex items-center gap-1.5 font-medium">
            <Users className="h-3.5 w-3.5 text-purple-600" /> Patient Acuity
          </span>
          <p className="font-bold text-slate-900 text-xs sm:text-sm">
            {currentCase.patientAge}y {currentCase.patientSex} &middot; {currentCase.patientStatus}
          </p>
          <p className="text-[11px] text-slate-500">
            {currentCase.patientCount} Patient{currentCase.patientCount > 1 ? 's' : ''} on scene
          </p>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="text-xs text-slate-500 flex items-center gap-2">
          <Radio className="h-4 w-4 text-emerald-600 animate-pulse" />
          <span>Last telemetry update: <strong className="text-slate-700 font-mono">{currentCase.lastUpdated}</strong></span>
        </div>

        <div className="flex items-center gap-3">
          {isAssignedOnly && (
            <button
              type="button"
              onClick={() => acceptAssignment(currentCase.id)}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Accept Dispatch</span>
            </button>
          )}

          <Link
            href={`/ems/cases/${currentCase.id}`}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2"
          >
            <span>Open Case Workspace</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
