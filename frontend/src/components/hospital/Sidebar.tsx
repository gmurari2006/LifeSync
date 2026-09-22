'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useHospital } from '@/context/HospitalContext';
import { 
  LayoutDashboard, 
  Inbox, 
  Radio, 
  BedDouble, 
  Settings, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { stats } = useHospital();

  const navItems = [
    {
      label: 'Overview',
      href: '/hospital',
      icon: LayoutDashboard,
      badge: null,
      exact: true,
    },
    {
      label: 'Incoming Cases',
      href: '/hospital/cases',
      icon: Inbox,
      badge: stats.awaitingAck > 0 ? `${stats.awaitingAck} Pending` : `${stats.totalIncoming}`,
      badgeColor: stats.awaitingAck > 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-600 border-slate-200',
      exact: false,
    },
    {
      label: 'Active Tracking',
      href: '/hospital/active',
      icon: Radio,
      badge: `${stats.acknowledged} Active`,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      exact: true,
    },
    {
      label: 'Readiness & Bays',
      href: '/hospital/readiness',
      icon: BedDouble,
      badge: `${stats.availableBays}/${stats.totalBays} Bays`,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      exact: true,
    },
    {
      label: 'Hospital Settings',
      href: '/hospital/settings',
      icon: Settings,
      badge: null,
      exact: true,
    },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-white hidden md:flex flex-col justify-between p-4">
      {/* Navigation Group */}
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Emergency Operations
          </p>
          <nav className="mt-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact 
                ? pathname === item.href 
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-100 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Quick Triage Acuity Guide Box */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Operational Priority</span>
            <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <div className="text-[11px] space-y-1.5 text-slate-600">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> Critical</span>
              <span className="font-mono font-bold text-rose-700">{String(stats.criticalCount ?? 0).padStart(2, '0')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> High</span>
              <span className="font-mono font-bold text-amber-700">{String(stats.highCount ?? 0).padStart(2, '0')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> Moderate</span>
              <span className="font-mono font-bold text-blue-700">{String(stats.moderateCount ?? 0).padStart(2, '0')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Safety & Protocol Footer Note */}
      <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
        <p className="font-semibold text-slate-700">Pre-Hospital Readiness</p>
        <p className="leading-tight text-slate-500">All reported data is pre-arrival. Human clinical team validates on patient handover.</p>
        <Link 
          href="/" 
          className="mt-2 inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-semibold pt-1"
        >
          <span>LifeSync Home</span>
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </aside>
  );
}
