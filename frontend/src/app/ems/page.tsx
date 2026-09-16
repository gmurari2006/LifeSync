'use client';

import React from 'react';
import Link from 'next/link';
import { useEMS } from '@/context/EMSContext';
import { AssignmentCard } from '@/components/ems/AssignmentCard';
import { 
  Ambulance, 
  Activity, 
  ClipboardList, 
  Radio, 
  Users, 
  MapPin, 
  Navigation, 
  ShieldCheck, 
  Clock, 
  ArrowRight,
  Gauge,
  Battery
} from 'lucide-react';

export default function EMSDashboardPage() {
  const { activeUnit, cases, activeCaseId, setUnitStatus } = useEMS();
  const currentCase = cases[activeCaseId] || Object.values(cases)[0];

  const totalCases = Object.keys(cases).length;
  const inTransitCount = Object.values(cases).filter(c => c.transportStatus === 'Transporting').length;
  const onSceneCount = Object.values(cases).filter(c => c.transportStatus === 'On Scene').length;

  return (
    <div className="space-y-6">
      
      {/* Top Unit Field Status Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-[#0f172a] to-slate-900 p-5 sm:p-7 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        
        {/* Unit Identity */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-600/20 border border-orange-500/40 text-orange-400">
              <Ambulance className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-extrabold text-2xl text-white">
                  Unit {activeUnit.unitId}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-orange-300 border border-slate-700">
                  {activeUnit.unitType}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Callsign: <strong className="text-white">{activeUnit.callSign}</strong> &middot; {activeUnit.crew.leadParamedic}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Unit Status Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 block w-full sm:w-auto mr-1">
            Unit Status:
          </span>
          {(['Available', 'Responding', 'Transporting'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setUnitStatus(st)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all border ${
                activeUnit.status === st
                  ? st === 'Available'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-950/60 ring-2 ring-emerald-500/40'
                    : st === 'Responding'
                    ? 'bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-950/60 ring-2 ring-amber-500/40'
                    : 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-950/60 ring-2 ring-red-500/40'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Assignment Card */}
      {currentCase && (
        <AssignmentCard currentCase={currentCase} />
      )}

      {/* Field Operations Operational Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-1">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
            <ClipboardList className="h-4 w-4 text-orange-400" /> Active Dispatches
          </span>
          <p className="font-mono font-black text-2xl text-white">
            {totalCases}
          </p>
          <p className="text-[11px] text-slate-400">Total assigned to this shift</p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-1">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
            <Navigation className="h-4 w-4 text-red-400" /> In-Transit Emergency
          </span>
          <p className="font-mono font-black text-2xl text-red-300">
            {inTransitCount}
          </p>
          <p className="text-[11px] text-slate-400">Active telemetry broadcast</p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-1">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-purple-400" /> On-Scene Units
          </span>
          <p className="font-mono font-black text-2xl text-purple-300">
            {onSceneCount}
          </p>
          <p className="text-[11px] text-slate-400">Triage & stabilization stage</p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-1">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> Receiving Hospital
          </span>
          <p className="font-bold text-sm text-emerald-300 truncate">
            CityCare ED
          </p>
          <p className="text-[11px] text-slate-400">Level-1 Trauma & STEMI Center</p>
        </div>
      </div>

      {/* Available Cases Scenario Switcher */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Switch Focus Case (Simulation Scenarios):
          </span>
          <Link
            href="/ems/cases"
            className="text-xs text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1"
          >
            <span>View All in Case Queue</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {Object.values(cases).map((c) => (
            <Link
              key={c.id}
              href={`/ems/cases/${c.id}`}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                c.id === currentCase.id
                  ? 'border-orange-500 bg-orange-950/40 shadow-md ring-1 ring-orange-500/50'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-orange-400 text-xs">{c.id}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-900 text-slate-300 border border-slate-800">
                    {c.operationalPriority}
                  </span>
                </div>
                <p className="text-xs font-bold text-white mt-1 line-clamp-1">
                  {c.incidentType}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                <span>ETA: <strong className="text-amber-300 font-mono">{c.etaMinutes}m</strong></span>
                <span className="text-slate-500 font-mono text-[10px]">{c.transportStatus}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
