'use client';

import React, { useState, useEffect } from 'react';
import { useHospital } from '@/context/HospitalContext';
import { Activity, Bell, ShieldAlert, Clock, UserCheck, Building2, Sparkles, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { DEMO_HOSPITALS_LIST } from '@/lib/demo/hospital-data';
import { ScenarioSwitchboardModal } from '@/components/simulation/ScenarioSwitchboardModal';

export function Header() {
  const { hospitalProfile, stats, selectedHospitalId, switchHospital, canSwitchFacility, userRole } = useHospital();
  const [timeString, setTimeString] = useState('14:08:32 UTC');
  const [isSwitchboardOpen, setIsSwitchboardOpen] = useState(false);
  const [isFacilityDropdownOpen, setIsFacilityDropdownOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toTimeString().split(' ')[0] + ' UTC'
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800/80 bg-slate-950/90 px-4 md:px-6 backdrop-blur-md">
        {/* Left branding & hospital identification */}
        <div className="flex items-center gap-3">
          <Link href="/hospital" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400 group-hover:bg-blue-600/30 transition-colors">
              <Activity className="h-5 w-5 animate-pulse text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-white">LifeSync</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-900/50 text-blue-300 border border-blue-700/50">
                  ED Portal
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400 hidden sm:block">
                Hospital Emergency Readiness
              </p>
            </div>
          </Link>

          {/* Vertical divider */}
          <div className="h-6 w-[1px] bg-slate-800 hidden md:block" />

          {/* 5-Facility Context Selector (Authorized for Demo/Admin) */}
          <div className="relative">
            <button
              onClick={() => setIsFacilityDropdownOpen(!isFacilityDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700/80 bg-slate-900/90 hover:bg-slate-800 text-left transition"
              title={canSwitchFacility ? "Switch facility context (Authorized Demo Admin)" : "Assigned facility context"}
            >
              <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white truncate max-w-[160px] sm:max-w-[200px]">
                  {hospitalProfile.name}
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  {hospitalProfile.traumaLevel.split('&')[0]}
                </span>
              </div>
              {canSwitchFacility && <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0" />}
            </button>

            {isFacilityDropdownOpen && canSwitchFacility && (
              <div className="absolute left-0 mt-1 w-72 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-50 py-1.5 overflow-hidden animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Switch Facility ({DEMO_HOSPITALS_LIST.length} Regional Hospitals)</span>
                  <span className="text-emerald-400">RBAC Demo Admin</span>
                </div>
                {DEMO_HOSPITALS_LIST.map((hosp) => (
                  <button
                    key={hosp.id}
                    onClick={() => {
                      switchHospital(hosp.id);
                      setIsFacilityDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex flex-col hover:bg-slate-800 transition ${
                      selectedHospitalId === hosp.id ? 'bg-blue-950/50 border-l-2 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">{hosp.shortName}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                        {hosp.badge}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 truncate">{hosp.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center Demo Synthetic Banner */}
        <div className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-[11px] font-semibold tracking-wider uppercase">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          DEMO • SYNTHETIC DATA
        </div>

        {/* Right control widgets */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Scenario Switchboard Button */}
          <button
            onClick={() => setIsSwitchboardOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-900/30 transition transform active:scale-95"
            title="Launch Canonical Scenarios (STEMI, Trauma, Stroke, Pediatrics, Diversion)"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Scenario Runner</span>
          </button>

          {/* Live Operational Status */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md border border-slate-800 bg-slate-900/80">
            <span
              className={`w-2 h-2 rounded-full ${
                hospitalProfile.operationalStatus === 'Operational'
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-amber-400'
              }`}
            />
            <span className="text-xs font-medium text-slate-300">
              {hospitalProfile.operationalStatus.toUpperCase()}
            </span>
          </div>

          {/* Live UTC Clock */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-800 bg-slate-900/60 text-slate-300 font-mono text-xs">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>{timeString}</span>
          </div>

          {/* Pending Alerts Bell */}
          <Link
            href="/hospital/cases"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
            title={`${stats.awaitingAck} cases awaiting acknowledgement`}
          >
            <Bell className="h-4 w-4" />
            {stats.awaitingAck > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg animate-bounce">
                {stats.awaitingAck}
              </span>
            )}
          </Link>

          {/* User Identity Chip */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-slate-300">
              <UserCheck className="h-4 w-4 text-blue-400" />
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-200">
                {hospitalProfile.onDutyCoordinator}
              </span>
              <span className="text-[10px] text-slate-400">
                {hospitalProfile.coordinatorRole.split('/')[0]}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Interactive Scenario Switchboard Modal */}
      <ScenarioSwitchboardModal
        isOpen={isSwitchboardOpen}
        onClose={() => setIsSwitchboardOpen(false)}
      />
    </>
  );
}

