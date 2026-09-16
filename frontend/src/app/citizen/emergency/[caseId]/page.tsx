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
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-10 text-center space-y-6 max-w-lg mx-auto shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <AlertCircle className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              Case Not Found
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              No emergency report found matching Case ID <span className="font-mono font-bold text-amber-300">&ldquo;{caseId}&rdquo;</span>.
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
                className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-500 uppercase focus:border-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all"
              >
                Track
              </button>
            </div>
            {errorMsg && (
              <p className="text-xs text-red-400">{errorMsg}</p>
            )}
          </form>

          {/* Demo shortcuts */}
          <div className="pt-4 border-t border-slate-800 space-y-2 text-left text-xs">
            <span className="font-semibold text-slate-400">Try these synthetic demo cases:</span>
            <div className="flex flex-col gap-2">
              <Link
                href="/citizen/emergency/LS-2026-101"
                className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 hover:border-slate-700 flex items-center justify-between"
              >
                <span className="font-mono text-blue-400 font-bold">LS-2026-101 (Road Accident)</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
              </Link>
              <Link
                href="/citizen/emergency/LS-2026-102"
                className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 hover:border-slate-700 flex items-center justify-between"
              >
                <span className="font-mono text-blue-400 font-bold">LS-2026-102 (Chest Pain)</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
              </Link>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/citizen"
              className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1.5"
            >
              <span>Return to Citizen Portal Home</span>
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
