'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { EMSHeader } from './EMSHeader';
import { ShieldAlert, Radio, Ambulance, MapPin, Activity } from 'lucide-react';
import { useEMS } from '@/context/EMSContext';

export function EMSShell({ children }: { children: ReactNode }) {
  const { activeUnit } = useEMS();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <EMSHeader />

      {/* Field Mode Banner & Simulated Telemetry Bar */}
      <div className="border-b border-amber-200 bg-amber-50/80 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-amber-900 font-semibold">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="tracking-wide">FIELD RESPONSE CONSOLE &middot; SIMULATED TELEMETRY</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-600 font-mono">
            <span className="flex items-center gap-1 font-medium">
              <Radio className="h-3 w-3 text-emerald-600" /> Radio: Ch-4 Direct
            </span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="hidden sm:flex items-center gap-1 font-medium">
              <MapPin className="h-3 w-3 text-amber-700" /> Sector 48 Corridor
            </span>
            <span className="hidden md:inline text-slate-300">|</span>
            <span className="hidden md:inline text-slate-600 font-medium">
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
      <footer className="border-t border-slate-200 bg-white py-5 px-4 text-center text-xs text-slate-500 space-y-1.5">
        <p className="max-w-3xl mx-auto leading-relaxed">
          <strong className="text-slate-700">LifeSync Safety Boundary:</strong> EMS-verified observations and vital signs are operational field records transmitted for pre-arrival readiness. LifeSync does not generate automated clinical diagnoses or drug recommendations.
        </p>
        <div className="flex items-center justify-center gap-4 pt-1 text-[11px] text-slate-400">
          <Link href="/" className="hover:text-blue-700 transition-colors">Home</Link>
          <span>&middot;</span>
          <Link href="/citizen" className="hover:text-blue-700 transition-colors">Citizen Portal</Link>
          <span>&middot;</span>
          <Link href="/hospital" className="hover:text-blue-700 transition-colors">Hospital Portal</Link>
        </div>
      </footer>
    </div>
  );
}
