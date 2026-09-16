'use client';

import React from 'react';
import Link from 'next/link';
import { useEMS } from '@/context/EMSContext';
import { EMSCaseTable } from '@/components/ems/EMSCaseTable';
import { ClipboardList, ArrowLeft, Ambulance, ShieldAlert } from 'lucide-react';

export default function EMSCaseQueuePage() {
  const { cases, activeUnit } = useEMS();
  const caseList = Object.values(cases);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/ems"
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <ClipboardList className="h-7 w-7 text-orange-400" />
            <span>EMS Incident & Case Queue</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Assigned emergency dispatches for Unit {activeUnit.unitId} ({activeUnit.crew.leadParamedic})
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60 text-xs font-mono text-slate-300 self-start sm:self-auto">
          Unit: <span className="text-orange-400 font-bold">{activeUnit.unitId}</span> &middot; Status: <span className="text-emerald-400 font-bold">{activeUnit.status}</span>
        </div>
      </div>

      {/* Case Table / List Component */}
      <EMSCaseTable cases={caseList} />

    </div>
  );
}
