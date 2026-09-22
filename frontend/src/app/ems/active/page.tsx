'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEMS } from '@/context/EMSContext';
import { 
  Navigation, 
  Clock, 
  MapPin, 
  Building2, 
  Heart, 
  Activity, 
  Wind, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  Ambulance,
  Radio,
  FileCheck
} from 'lucide-react';

export default function EMSActiveInTransitPage() {
  const router = useRouter();
  const { cases, activeCaseId, activeUnit, updateTransportStatus } = useEMS();
  const currentCase = cases[activeCaseId] || Object.values(cases)[0];

  if (!currentCase) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
        No active in-transit case.
      </div>
    );
  }

  const handleMarkArrived = () => {
    updateTransportStatus(currentCase.id, 'Arrived at Hospital');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href={`/ems/cases/${currentCase.id}`}
          className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5 font-bold transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-slate-400" />
          <span>Exit Tactical View</span>
        </Link>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-700">
          <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="font-bold text-rose-700 uppercase">Live In-Transit Telemetry</span>
        </div>
      </div>

      {/* Hero Tactical Routing Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm text-center space-y-6">
        
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-mono text-xs font-bold uppercase">
            <span>Unit {activeUnit.unitId}</span> &middot; <span>{currentCase.id}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-mono font-black tracking-tight text-slate-900">
            ETA {currentCase.etaMinutes} MIN
          </h1>

          <p className="text-base sm:text-lg font-bold text-amber-700">
            {currentCase.distanceRemainingKm} km remaining &middot; Speed {activeUnit.currentSpeedKmH} km/h
          </p>
        </div>

        {/* Destination Hospital Callout */}
        <div className="p-4 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-blue-600" /> Receiving Hospital Destination
            </span>
            <p className="text-lg font-extrabold text-slate-900">
              {currentCase.destinationHospital.name}
            </p>
            <p className="text-xs text-emerald-700 font-bold">
              {currentCase.destinationHospital.assignedBay || 'Bay Pending Allocation'}
            </p>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-center shrink-0">
            <span className="text-[10px] font-mono text-blue-700 uppercase block">Hospital Status</span>
            <span className="text-xs font-bold text-slate-900">{currentCase.destinationHospital.acknowledgementState}</span>
          </div>
        </div>

        {/* Tactical Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto pt-2">
          <button
            type="button"
            onClick={handleMarkArrived}
            className="py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Building2 className="h-4 w-4" />
            <span>Mark Arrived at Bay</span>
          </button>

          <Link
            href="/ems/handover"
            className="py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <FileCheck className="h-4 w-4" />
            <span>Bedside Handover</span>
          </Link>
        </div>
      </div>

      {/* Large Tactical Vitals Readout */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-rose-600" /> Patient Vitals Stream (Large Format)
          </h3>
          <span className="text-xs font-mono text-slate-500 font-medium">
            Synchronized at {currentCase.vitals.recordedAt}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-rose-700 block">HEART RATE</span>
            <span className="font-mono font-black text-3xl sm:text-4xl text-slate-900">
              {currentCase.vitals.heartRate}
            </span>
            <span className="text-[11px] text-slate-500 block">bpm</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-amber-700 block">BLOOD PRESS.</span>
            <span className="font-mono font-black text-2xl sm:text-3xl text-slate-900">
              {currentCase.vitals.systolicBp}/{currentCase.vitals.diastolicBp}
            </span>
            <span className="text-[11px] text-slate-500 block">mmHg</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-blue-700 block">SpO2 SAT</span>
            <span className="font-mono font-black text-3xl sm:text-4xl text-slate-900">
              {currentCase.vitals.oxygenSaturation}%
            </span>
            <span className="text-[11px] text-slate-500 block">Pulse Oximetry</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-purple-700 block">GCS TOTAL</span>
            <span className="font-mono font-black text-3xl sm:text-4xl text-slate-900">
              {currentCase.vitals.gcs}
            </span>
            <span className="text-[11px] text-slate-500 block">Coma Scale</span>
          </div>
        </div>
      </div>

    </div>
  );
}
