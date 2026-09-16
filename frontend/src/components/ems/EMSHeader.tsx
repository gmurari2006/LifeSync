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
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'Responding':
        return 'bg-amber-950 text-amber-300 border-amber-800 animate-pulse';
      case 'On Scene':
        return 'bg-purple-950 text-purple-300 border-purple-800';
      case 'Transporting':
        return 'bg-red-950 text-red-300 border-red-800 animate-pulse';
      case 'At Destination':
        return 'bg-blue-950 text-blue-300 border-blue-800';
      case 'Handover Complete':
        return 'bg-slate-900 text-slate-300 border-slate-700';
      default:
        return 'bg-slate-900 text-slate-300 border-slate-700';
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Unit ID & Brand Branding */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600/20 border border-orange-500/40 text-orange-400 group-hover:scale-105 transition-transform">
                <Ambulance className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  LifeSync
                </span>
                <span className="text-base font-extrabold text-white leading-tight">
                  EMS Field Operations
                </span>
              </div>
            </Link>

            {/* Active Unit Badge */}
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-800">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 font-mono font-bold text-xs text-orange-300">
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
                      ? 'bg-orange-600 text-white shadow-lg shadow-orange-950/50'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
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
