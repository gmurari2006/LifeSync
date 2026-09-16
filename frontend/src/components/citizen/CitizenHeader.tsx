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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950/95 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {showBack && (
          backHref ? (
            <Link
              href={backHref}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
          ) : (
            <button
              onClick={onBack}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )
        )}

        <Link href="/citizen" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600/20 border border-red-500/40 text-red-400">
            <Activity className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight text-white block leading-none">
              LifeSync
            </span>
            <span className="text-[11px] font-semibold text-red-400">
              Emergency Intake
            </span>
          </div>
        </Link>
      </div>

      {/* Demo Badge */}
      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
        <ShieldAlert className="w-3 h-3 text-amber-400 shrink-0" />
        <span className="hidden sm:inline">DEMO • SYNTHETIC DATA</span>
        <span className="sm:hidden">DEMO DATA</span>
      </div>
    </header>
  );
}
