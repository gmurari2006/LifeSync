'use client';

import React, { ReactNode } from 'react';
import { CitizenHeader } from '@/components/citizen/CitizenHeader';
import { AlertTriangle } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-red-600 selection:text-white">
      {/* Header */}
      <CitizenHeader showBack={showBack} backHref={backHref} onBack={onBack} />

      {/* Safety Notice Banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-xs text-amber-800 flex items-center justify-center gap-2">
        <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
        <span>
          <strong>Active Emergency Notice:</strong> If this is an immediate life-threatening crisis, dial dispatch (<strong className="underline">112 / 911</strong>) directly.
        </span>
      </div>

      {/* Mobile-first centered content container */}
      <main className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-xl space-y-6">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 text-center text-xs text-slate-500 space-y-1">
        <p>LifeSync Pre-Hospital Emergency Information Layer</p>
        <div className="flex items-center justify-center gap-3 text-blue-600 font-medium">
          <Link href="/" className="hover:underline">Home</Link>
          <span>&middot;</span>
          <Link href="/ems" className="hover:underline">EMS Operations</Link>
          <span>&middot;</span>
          <Link href="/hospital" className="hover:underline">Hospital Readiness Portal</Link>
        </div>
      </footer>
    </div>
  );
}
