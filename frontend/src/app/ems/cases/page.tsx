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
              className="text-xs text-slate-500 hover:text-blue-700 flex items-center gap-1 font-medium transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ClipboardList className="h-7 w-7 text-blue-600" />
            <span>EMS Incident & Case Queue</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Assigned emergency dispatches for Unit {activeUnit.unitId} ({activeUnit.crew.leadParamedic})
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white shadow-xs text-xs font-mono text-slate-700 self-start sm:self-auto">
          Unit: <span className="text-blue-700 font-bold">{activeUnit.unitId}</span> &middot; Status: <span className="text-emerald-700 font-bold">{activeUnit.status}</span>
        </div>
      </div>

      {/* Case Table / List Component */}
      <EMSCaseTable cases={caseList} />

    </div>
  );
}
