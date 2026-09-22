'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCitizen } from '@/context/CitizenContext';
import { EmergencyTracker } from '@/components/citizen/EmergencyTracker';
import { AlertCircle, Search, ArrowRight } from 'lucide-react';

export default function CitizenEmergencyTrackingPage({
  params,
}: {
  params: { caseId: string };
}) {
  const router = useRouter();
  const { getCaseById } = useCitizen();
  const caseId = params.caseId;
  const citizenCase = getCaseById(caseId);

  const [searchId, setSearchId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = searchId.trim().toUpperCase();
    if (!cleanId) {
      setErrorMsg('Please enter a valid Case ID.');
      return;
    }
    router.push(`/citizen/emergency/${cleanId}`);
  };

  if (!citizenCase) {
    return (
      <div className="space-y-6 py-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 text-center space-y-6 max-w-lg mx-auto shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-600">
            <AlertCircle className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Case Not Found
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              No emergency report found matching Case ID <span className="font-mono font-bold text-amber-700">&ldquo;{caseId}&rdquo;</span>.
            </p>
          </div>

          {/* Search other case ID */}
          <form onSubmit={handleSearchSubmit} className="space-y-3 pt-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchId}
                onChange={(e) => { setSearchId(e.target.value); setErrorMsg(''); }}
                placeholder="Enter Case ID (e.g. LS-2026-101)"
                className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs font-mono text-slate-900 placeholder-slate-400 uppercase focus:border-blue-600 focus:bg-white focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm"
              >
                Track
              </button>
            </div>
            {errorMsg && (
              <p className="text-xs text-red-600 font-medium">{errorMsg}</p>
            )}
          </form>

          {/* Demo shortcuts */}
          <div className="pt-4 border-t border-slate-200 space-y-2 text-left text-xs">
            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px]">Synthetic demo cases:</span>
            <div className="flex flex-col gap-2">
              <Link
                href="/citizen/emergency/LS-2026-101"
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-200 flex items-center justify-between transition-colors"
              >
                <span className="font-mono text-blue-700 font-bold">LS-2026-101 (Road Accident)</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>
              <Link
                href="/citizen/emergency/LS-2026-102"
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-200 flex items-center justify-between transition-colors"
              >
                <span className="font-mono text-blue-700 font-bold">LS-2026-102 (Chest Pain)</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/citizen"
              className="text-xs text-slate-500 hover:text-blue-700 font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              <span>&larr; Return to Citizen Portal Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2">
      <EmergencyTracker citizenCase={citizenCase} />
    </div>
  );
}
