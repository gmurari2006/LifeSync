'use client';

import React from 'react';
import Link from 'next/link';
import { useHospital } from '@/context/HospitalContext';
import { getResourceStatusColor } from '@/lib/demo/utils';
import { BedDouble, ChevronRight, Activity, ShieldCheck } from 'lucide-react';

export function ReadinessSummary() {
  const { resources, stats } = useHospital();

  const previewResources = resources.slice(0, 6);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-400">
            <BedDouble className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Emergency Resource Readiness
            </h3>
            <p className="text-xs text-slate-400">
              {stats.availableBays} of {stats.totalBays} Acute Resuscitation / Trauma Bays Ready
            </p>
          </div>
        </div>

        <Link
          href="/hospital/readiness"
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300"
        >
          <span>Manage Resources</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Grid of Key Resources */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {previewResources.map((res) => {
          const colors = getResourceStatusColor(res.status);
          return (
            <div
              key={res.id}
              className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-3 flex items-center justify-between"
            >
              <div className="space-y-0.5 truncate pr-2">
                <span className="text-xs font-bold text-slate-200 block truncate">
                  {res.name}
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  {res.location}
                </span>
              </div>

              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${colors.bg} ${colors.text} ${colors.border}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                {(res.status || 'UNKNOWN').toUpperCase()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
