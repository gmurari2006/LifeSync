'use client';

import React from 'react';
import Link from 'next/link';
import { Activity, ShieldAlert, ChevronLeft } from 'lucide-react';

interface CitizenHeaderProps {
  showBack?: boolean;
  backHref?: string;
  onBack?: () => void;
}

export function CitizenHeader({ showBack = false, backHref, onBack }: CitizenHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 shadow-xs">
      <div className="flex items-center gap-3">
        {showBack && (
          backHref ? (
            <Link
              href={backHref}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
          ) : (
            <button
              onClick={onBack}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )
        )}

        <Link href="/citizen" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white shadow-xs">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-slate-900 block leading-none">
              LifeSync
            </span>
            <span className="text-[10px] font-semibold text-red-600">
              Citizen Emergency
            </span>
          </div>
        </Link>
      </div>

      {/* Reassuring Dispatch Notice */}
      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800 text-[10px] font-semibold">
        <ShieldAlert className="w-3 h-3 text-amber-600 shrink-0" />
        <span>DIRECT DISPATCH SYNC</span>
      </div>
    </header>
  );
}
