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
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        
        {/* Unit Identity */}
        <div className="space-y-2">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 border border-blue-200 text-blue-600">
              <Ambulance className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-2xl text-slate-900">
                  Unit {activeUnit.unitId}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {activeUnit.unitType}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Callsign: <strong className="text-slate-800">{activeUnit.callSign}</strong> &middot; Lead: {activeUnit.crew.leadParamedic}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Unit Status Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 block w-full sm:w-auto mr-1 uppercase tracking-wider text-[11px]">
            Unit Status:
          </span>
          {(['Available', 'Responding', 'Transporting'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setUnitStatus(st)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                activeUnit.status === st
                  ? st === 'Available'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : st === 'Responding'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-red-600 text-white border-red-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
            <ClipboardList className="h-4 w-4 text-blue-600" /> Active Dispatches
          </span>
          <p className="font-mono font-bold text-2xl text-slate-900">
            {totalCases}
          </p>
          <p className="text-[11px] text-slate-500">Total assigned to this shift</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
            <Navigation className="h-4 w-4 text-red-600" /> In-Transit Emergency
          </span>
          <p className="font-mono font-bold text-2xl text-red-600">
            {inTransitCount}
          </p>
          <p className="text-[11px] text-slate-500">Active telemetry broadcast</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-purple-600" /> On-Scene Units
          </span>
          <p className="font-mono font-bold text-2xl text-purple-700">
            {onSceneCount}
          </p>
          <p className="text-[11px] text-slate-500">Triage & stabilization stage</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> Receiving Hospital
          </span>
          <p className="font-bold text-sm text-emerald-700 truncate">
            CityCare ED
          </p>
          <p className="text-[11px] text-slate-500">Level-1 Trauma & STEMI Center</p>
        </div>
      </div>

      {/* Available Cases Scenario Switcher */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Switch Focus Case (Simulation Scenarios):
          </span>
          <Link
            href="/ems/cases"
            className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 transition-colors"
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
              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2.5 ${
                c.id === currentCase.id
                  ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-1 ring-blue-500/30'
                  : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-blue-700 text-xs">{c.id}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                    {c.operationalPriority}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                  {c.incidentType}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1.5 border-t border-slate-200">
                <span>ETA: <strong className="text-amber-700 font-mono font-bold">{c.etaMinutes}m</strong></span>
                <span className="text-slate-500 font-mono text-[10px]">{c.transportStatus}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
