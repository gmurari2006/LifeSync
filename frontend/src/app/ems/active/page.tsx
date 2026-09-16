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
      <div className="p-12 text-center text-slate-400">
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
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 font-bold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Exit Tactical View</span>
        </Link>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
          <span className="font-bold text-red-400 uppercase">Live In-Transit Broadcast</span>
        </div>
      </div>

      {/* Hero Tactical Routing Card */}
      <div className="rounded-3xl border-2 border-orange-500/60 bg-gradient-to-b from-orange-950/40 via-slate-900 to-slate-950 p-6 sm:p-10 shadow-2xl text-center space-y-6">
        
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-950 border border-orange-700 text-orange-300 font-mono text-xs font-bold uppercase">
            <span>Unit {activeUnit.unitId}</span> &middot; <span>{currentCase.id}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-mono font-black tracking-tight text-white">
            ETA {currentCase.etaMinutes} MIN
          </h1>

          <p className="text-base sm:text-lg font-bold text-amber-300">
            {currentCase.distanceRemainingKm} km remaining &middot; Speed {activeUnit.currentSpeedKmH} km/h
          </p>
        </div>

        {/* Destination Hospital Callout */}
        <div className="p-4 sm:p-6 rounded-2xl bg-slate-950/90 border border-slate-800 max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-blue-400" /> Receiving Hospital Destination
            </span>
            <p className="text-lg font-extrabold text-white">
              {currentCase.destinationHospital.name}
            </p>
            <p className="text-xs text-emerald-400 font-bold">
              {currentCase.destinationHospital.assignedBay || 'Bay Pending Allocation'}
            </p>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-blue-950/60 border border-blue-800 text-center shrink-0">
            <span className="text-[10px] font-mono text-blue-400 uppercase block">Hospital Status</span>
            <span className="text-xs font-bold text-white">{currentCase.destinationHospital.acknowledgementState}</span>
          </div>
        </div>

        {/* Tactical Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto pt-2">
          <button
            type="button"
            onClick={handleMarkArrived}
            className="py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-base shadow-xl shadow-emerald-950/60 transition-all flex items-center justify-center gap-2"
          >
            <Building2 className="h-5 w-5" />
            <span>Mark Arrived at Bay</span>
          </button>

          <Link
            href="/ems/handover"
            className="py-4 px-6 rounded-2xl bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-extrabold text-base shadow-xl shadow-orange-950/60 transition-all flex items-center justify-center gap-2"
          >
            <FileCheck className="h-5 w-5" />
            <span>Bedside Handover</span>
          </Link>
        </div>
      </div>

      {/* Large Tactical Vitals Readout */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-rose-400" /> Patient Vitals Stream (Large Format)
          </h3>
          <span className="text-xs font-mono text-emerald-400 font-bold">
            Synchronized at {currentCase.vitals.recordedAt}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-xs font-bold text-rose-400 block">HEART RATE</span>
            <span className="font-mono font-black text-3xl sm:text-4xl text-white">
              {currentCase.vitals.heartRate}
            </span>
            <span className="text-[11px] text-slate-500 block">bpm</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-xs font-bold text-amber-400 block">BLOOD PRESS.</span>
            <span className="font-mono font-black text-2xl sm:text-3xl text-white">
              {currentCase.vitals.systolicBp}/{currentCase.vitals.diastolicBp}
            </span>
            <span className="text-[11px] text-slate-500 block">mmHg</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-xs font-bold text-sky-400 block">SpO2 SAT</span>
            <span className="font-mono font-black text-3xl sm:text-4xl text-white">
              {currentCase.vitals.oxygenSaturation}%
            </span>
            <span className="text-[11px] text-slate-500 block">Pulse Oximetry</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-xs font-bold text-purple-400 block">GCS TOTAL</span>
            <span className="font-mono font-black text-3xl sm:text-4xl text-white">
              {currentCase.vitals.gcs}
            </span>
            <span className="text-[11px] text-slate-500 block">Coma Scale</span>
          </div>
        </div>
      </div>

    </div>
  );
}
