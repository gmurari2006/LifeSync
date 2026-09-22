'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { TopBar } from './TopBar';

interface AppShellProps {
  portalName: string;
  portalRole?: string;
  unitOrHospitalName?: string;
  children: ReactNode;
  sidebar?: ReactNode;
  banner?: ReactNode;
}

export function AppShell({
  portalName,
  portalRole,
  unitOrHospitalName,
  children,
  sidebar,
  banner,
}: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
      {/* TopBar */}
      <TopBar
        portalName={portalName}
        portalRole={portalRole}
        unitOrHospitalName={unitOrHospitalName}
      />

      {/* Operational Banner */}
      {banner}

      {/* Layout Area */}
      <div className="flex flex-1 overflow-hidden">
        {sidebar}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Universal LifeSync Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 text-center text-xs text-slate-500 space-y-1">
        <p className="max-w-3xl mx-auto">
          <strong>LifeSync Safety Boundary:</strong> Pre-hospital observations and telemetry are operational readiness records. LifeSync does not generate automated clinical diagnoses or treatment prescriptions.
        </p>
        <div className="flex items-center justify-center gap-3 pt-1 text-[11px] text-slate-400">
          <Link href="/" className="hover:text-slate-600">LifeSync Network</Link>
          <span>&middot;</span>
          <Link href="/citizen" className="hover:text-slate-600">Citizen Intake</Link>
          <span>&middot;</span>
          <Link href="/ems" className="hover:text-slate-600">EMS Console</Link>
          <span>&middot;</span>
          <Link href="/hospital" className="hover:text-slate-600">Hospital Command</Link>
        </div>
      </footer>
    </div>
  );
}
