'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEMS } from '@/context/EMSContext';
import { 
  Ambulance, 
  Radio, 
  Activity, 
  ClipboardList, 
  Navigation, 
  ShieldCheck, 
  AlertTriangle,
  FileCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export function EMSHeader() {
  const pathname = usePathname();
  const { activeUnit, activeCaseId } = useEMS();

  const navLinks = [
    { href: '/ems', label: 'Dashboard', icon: Activity },
    { href: '/ems/cases', label: 'Case Queue', icon: ClipboardList },
    { href: '/ems/active', label: 'In-Transit Console', icon: Navigation },
    { href: '/ems/handover', label: 'Bedside Handover', icon: FileCheck },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Responding':
        return 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse';
      case 'On Scene':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Transporting':
        return 'bg-red-50 text-red-700 border-red-200 animate-pulse';
      case 'At Destination':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Handover Complete':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex items-center justify-between gap-4">
          
          {/* Unit ID & Brand Branding */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 border border-blue-200 text-blue-600 group-hover:scale-105 transition-transform">
                <Ambulance className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  LifeSync
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  EMS Field Operations
                </span>
              </div>
            </Link>

            {/* Active Unit Badge */}
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200">
              <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-200 font-mono font-bold text-xs text-slate-800">
                Unit {activeUnit.unitId}
              </span>
              <span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold uppercase tracking-wider ${getStatusBadge(activeUnit.status)}`}>
                {activeUnit.status}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/ems' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">{link.label}</span>
                </Link>
              );
            })}
          </nav>

        </div>
      </div>
    </header>
  );
}
