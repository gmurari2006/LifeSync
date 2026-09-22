'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, ShieldAlert, Ambulance, Building2, ExternalLink } from 'lucide-react';
import { ConnectionStatusBadge } from './ConnectionStatusBadge';

interface TopBarProps {
  portalName: string;
  portalRole?: string;
  unitOrHospitalName?: string;
}

export function TopBar({
  portalName,
  portalRole,
  unitOrHospitalName,
}: TopBarProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-xs">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand & Portal Identity */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-slate-900 font-bold group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs group-hover:bg-blue-700 transition-colors">
              <Activity className="h-4 w-4" />
            </div>
            <span className="text-base font-extrabold tracking-tight">LifeSync</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {portalName}
          </span>
          {unitOrHospitalName && (
            <span className="hidden md:inline-block text-xs font-medium text-slate-500">
              &middot; {unitOrHospitalName}
            </span>
          )}
        </div>

        {/* Global Navigation Links & Status */}
        <div className="flex items-center gap-2 sm:gap-4">
          <nav className="hidden lg:flex items-center gap-1 text-xs font-medium text-slate-600">
            <Link
              href="/citizen"
              className={`px-2.5 py-1 rounded-md transition-colors ${
                pathname.startsWith('/citizen')
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Citizen
            </Link>
            <Link
              href="/ems"
              className={`px-2.5 py-1 rounded-md transition-colors ${
                pathname.startsWith('/ems')
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              EMS
            </Link>
            <Link
              href="/hospital"
              className={`px-2.5 py-1 rounded-md transition-colors ${
                pathname.startsWith('/hospital')
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Hospital
            </Link>
          </nav>

          <ConnectionStatusBadge status="CONNECTED" />

          {portalRole && (
            <span className="hidden sm:inline-block text-[11px] font-mono text-slate-500 px-2 py-0.5 rounded bg-slate-50 border border-slate-200">
              {portalRole}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
