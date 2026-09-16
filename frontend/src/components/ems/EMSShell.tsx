'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { EMSHeader } from './EMSHeader';
import { ShieldAlert, Radio, Ambulance, MapPin, Activity } from 'lucide-react';
import { useEMS } from '@/context/EMSContext';

export function EMSShell({ children }: { children: ReactNode }) {
  const { activeUnit } = useEMS();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-orange-500/30 selection:text-orange-200">
      <EMSHeader />

      {/* Field Mode Banner & Simulated Telemetry Bar */}
      <div className="border-b border-orange-500/20 bg-orange-950/20 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-orange-300 font-semibold">
            <span className="flex h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
            <span>FIELD RESPONSE CONSOLE &middot; SIMULATED TELEMETRY</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <Radio className="h-3 w-3 text-emerald-400" /> Radio: Ch-4 Direct
            </span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="hidden sm:flex items-center gap-1">
              <MapPin className="h-3 w-3 text-orange-400" /> Sector 48 Corridor
            </span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:inline text-slate-400">
              Crew: {activeUnit.crew.leadParamedic}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {children}
      </main>

      {/* Safety Notice Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-4 text-center text-xs text-slate-400 space-y-1">
        <p className="max-w-3xl mx-auto">
          <strong>LifeSync Safety Boundary:</strong> EMS-verified observations and vital signs are operational field records transmitted for pre-arrival readiness. LifeSync does not generate automated clinical diagnoses or drug recommendations.
        </p>
        <div className="flex items-center justify-center gap-4 pt-1 text-[11px]">
          <Link href="/" className="text-slate-400 hover:text-slate-300">Home</Link>
          <span>&middot;</span>
          <Link href="/citizen" className="text-slate-400 hover:text-slate-300">Citizen Portal</Link>
          <span>&middot;</span>
          <Link href="/hospital" className="text-slate-400 hover:text-slate-300">Hospital Portal</Link>
        </div>
      </footer>
    </div>
  );
}
