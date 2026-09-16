'use client';

import React from 'react';
import { useHospital } from '@/context/HospitalContext';
import { 
  Building2, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  AlertOctagon, 
  UserCheck, 
  CheckCircle2, 
  Settings,
  Bell
} from 'lucide-react';

export default function HospitalSettingsPage() {
  const { hospitalProfile, toggleDiversion, stats } = useHospital();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-400" />
          <span>Hospital Operational Configuration & Capabilities</span>
        </h1>
        <p className="text-xs text-slate-400">
          Facility parameters, trauma designations, and pre-arrival coordination preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Facility Profile (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Facility Identity Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">{hospitalProfile.name}</h2>
                  <p className="text-xs text-blue-300 font-medium">{hospitalProfile.traumaLevel}</p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                {hospitalProfile.operationalStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1">
                <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" /> Facility Location
                </span>
                <p className="text-slate-200 font-semibold">{hospitalProfile.address}</p>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1">
                <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                  <Phone className="h-3.5 w-3.5 text-slate-400" /> Triage Hotline
                </span>
                <p className="text-slate-200 font-mono font-semibold">{hospitalProfile.phone}</p>
              </div>
            </div>

            {/* On-Duty Staff Info */}
            <div className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <UserCheck className="h-4 w-4 text-blue-400" />
                <div>
                  <span className="text-slate-400 block">On-Duty Triage Coordinator:</span>
                  <strong className="text-slate-200">{hospitalProfile.onDutyCoordinator}</strong>
                </div>
              </div>
              <span className="text-[11px] text-slate-400">{hospitalProfile.coordinatorRole}</span>
            </div>
          </div>

          {/* Clinical Capabilities List */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Registered Emergency Clinical Capabilities
            </h3>
            <div className="space-y-2.5">
              {hospitalProfile.capabilities.map((cap, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl border border-slate-800/80 bg-slate-950/60 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span className="font-bold text-slate-200">{cap.name}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] pl-6">{cap.description}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/60 shrink-0">
                    ACTIVE
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Operational Controls & Governance (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Emergency Diversion Control */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
              <AlertOctagon className="h-4 w-4 text-amber-400" />
              <span>Facility Diversion Control</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Toggle operational diversion state. When enabled, LifeSync routing will flag this facility as saturated and prioritize secondary regional hospitals.
            </p>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">
                    Hospital Diversion Status
                  </span>
                  <span className={`text-xs font-semibold ${
                    hospitalProfile.diversionActive ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {hospitalProfile.diversionActive ? 'DIVERTING INCOMING AMBULANCES' : 'ACCEPTING ALL CASES (NORMAL)'}
                  </span>
                </div>

                <button
                  onClick={toggleDiversion}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    hospitalProfile.diversionActive
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-red-600 hover:bg-red-500 text-white'
                  }`}
                >
                  {hospitalProfile.diversionActive ? 'Resume Normal Intake' : 'Enable Diversion'}
                </button>
              </div>
            </div>
          </div>

          {/* Pre-Arrival Alert Thresholds */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800">
              <Bell className="h-4 w-4 text-blue-400" />
              <span>Pre-Arrival Alert Rules</span>
            </div>

            <div className="space-y-2 text-slate-300">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span>Critical (Red Rule) Pre-Alert:</span>
                <span className="font-mono font-semibold text-red-400">Immediate (&lt; 1 sec)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span>Acknowledgement Timeout:</span>
                <span className="font-mono font-semibold text-amber-400">60 Seconds</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span>Secondary Escalation Trigger:</span>
                <span className="font-mono font-semibold text-blue-400">180 Seconds</span>
              </div>
            </div>
          </div>

          {/* Safety & Protocol Notice */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4 text-[11px] text-slate-400 space-y-1.5">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-blue-400" />
              LifeSync Safety Governance
            </span>
            <p className="leading-relaxed">
              LifeSync operates as an operational pre-arrival readiness and data structuring tool. It does not provide autonomous clinical diagnoses or medical treatment instructions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
