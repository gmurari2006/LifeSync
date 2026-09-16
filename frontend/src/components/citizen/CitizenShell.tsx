'use client';

import React, { ReactNode } from 'react';
import { CitizenHeader } from '@/components/citizen/CitizenHeader';
import { AlertTriangle, PhoneCall } from 'lucide-react';
import Link from 'next/link';

interface CitizenShellProps {
  children: ReactNode;
  showBack?: boolean;
  backHref?: string;
  onBack?: () => void;
}

export function CitizenShell({
  children,
  showBack,
  backHref,
  onBack,
}: CitizenShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 antialiased selection:bg-red-600 selection:text-white">
      {/* Header */}
      <CitizenHeader showBack={showBack} backHref={backHref} onBack={onBack} />

      {/* Safety Notice Banner */}
      <div className="bg-amber-950/40 border-b border-amber-500/20 px-4 py-2 text-center text-xs text-amber-200 flex items-center justify-center gap-2">
        <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
        <span>
          <strong>Real Emergency Notice:</strong> If this is an active life-threatening crisis, call emergency dispatch (<span className="underline font-bold">112 / 911</span>) immediately.
        </span>
      </div>

      {/* Mobile-first centered content container */}
      <main className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-xl space-y-6">
          {children}
        </div>
      </main>

      {/* Footer link to switch portal */}
      <footer className="border-t border-slate-800/80 py-4 px-4 text-center text-xs text-slate-400 space-y-1">
        <p>LifeSync Pre-Hospital Emergency Information Layer</p>
        <div className="flex items-center justify-center gap-4 text-blue-400 font-medium">
          <Link href="/" className="hover:underline">Home</Link>
          <span>•</span>
          <Link href="/hospital" className="hover:underline">Hospital Readiness Portal</Link>
        </div>
      </footer>
    </div>
  );
}
