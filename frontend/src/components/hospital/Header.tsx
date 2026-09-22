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
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 md:px-6 backdrop-blur-md">
        {/* Left branding & hospital identification */}
        <div className="flex items-center gap-3">
          <Link href="/hospital" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 border border-blue-200 text-blue-600 group-hover:bg-blue-100 transition-colors">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-slate-900">LifeSync</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  ED Portal
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
                Hospital Emergency Readiness
              </p>
            </div>
          </Link>

          {/* Vertical divider */}
          <div className="h-6 w-[1px] bg-slate-200 hidden md:block" />

          {/* 5-Facility Context Selector (Authorized for Demo/Admin) */}
          <div className="relative">
            <button
              onClick={() => setIsFacilityDropdownOpen(!isFacilityDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition"
              title={canSwitchFacility ? "Switch facility context (Authorized Demo Admin)" : "Assigned facility context"}
            >
              <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900 truncate max-w-[160px] sm:max-w-[200px]">
                  {hospitalProfile.name}
                </span>
                <span className="text-[10px] text-slate-500 truncate">
                  {hospitalProfile.traumaLevel.split('&')[0]}
                </span>
              </div>
              {canSwitchFacility && <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0" />}
            </button>

            {isFacilityDropdownOpen && canSwitchFacility && (
              <div className="absolute left-0 mt-1 w-72 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 py-1.5 overflow-hidden animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                  <span>Switch Facility ({DEMO_HOSPITALS_LIST.length} Regional Hospitals)</span>
                  <span className="text-emerald-700 font-bold">RBAC Demo Admin</span>
                </div>
                {DEMO_HOSPITALS_LIST.map((hosp) => (
                  <button
                    key={hosp.id}
                    onClick={() => {
                      switchHospital(hosp.id);
                      setIsFacilityDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex flex-col hover:bg-slate-50 transition ${
                      selectedHospitalId === hosp.id ? 'bg-blue-50/70 border-l-2 border-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{hosp.shortName}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                        {hosp.badge}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 truncate">{hosp.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center Demo Synthetic Banner */}
        <div className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-200 bg-amber-50 text-amber-800 text-[11px] font-semibold tracking-wider uppercase">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
          DEMO • SYNTHETIC DATA
        </div>

        {/* Right control widgets */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Scenario Switchboard Button */}
          <button
            onClick={() => setIsSwitchboardOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-xl text-xs font-bold transition transform active:scale-95 shadow-sm"
            title="Launch Canonical Scenarios (STEMI, Trauma, Stroke, Pediatrics, Diversion)"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden sm:inline">Scenario Runner</span>
          </button>

          {/* Live Operational Status */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl border border-slate-200 bg-slate-50">
            <span
              className={`w-2 h-2 rounded-full ${
                hospitalProfile?.operationalStatus === 'Operational'
                  ? 'bg-emerald-500 animate-pulse'
                  : 'bg-amber-500'
              }`}
            />
            <span className="text-xs font-medium text-slate-700">
              {(hospitalProfile?.operationalStatus || 'OPERATIONAL').toUpperCase()}
            </span>
          </div>

          {/* Live UTC Clock */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-mono text-xs">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>{timeString}</span>
          </div>

          {/* Pending Alerts Bell */}
          <Link
            href="/hospital/cases"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
            title={`${stats.awaitingAck} cases awaiting acknowledgement`}
          >
            <Bell className="h-4 w-4" />
            {stats.awaitingAck > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-sm animate-bounce">
                {stats.awaitingAck}
              </span>
            )}
          </Link>

          {/* User Identity Chip */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-slate-600">
              <UserCheck className="h-4 w-4 text-blue-600" />
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900">
                {hospitalProfile?.onDutyCoordinator || 'ED Coordinator'}
              </span>
              <span className="text-[10px] text-slate-500">
                {(hospitalProfile?.coordinatorRole || 'Lead Triage').split('/')[0]}
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

