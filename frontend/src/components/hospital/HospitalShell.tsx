'use client';

import React, { ReactNode } from 'react';
import { Header } from '@/components/hospital/Header';
import { Sidebar } from '@/components/hospital/Sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Inbox, Radio, BedDouble, Settings } from 'lucide-react';

export function HospitalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const mobileNav = [
    { label: 'Overview', href: '/hospital', icon: LayoutDashboard },
    { label: 'Cases', href: '/hospital/cases', icon: Inbox },
    { label: 'Tracking', href: '/hospital/active', icon: Radio },
    { label: 'Readiness', href: '/hospital/readiness', icon: BedDouble },
    { label: 'Settings', href: '/hospital/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Header />

      {/* Body Area: Sidebar + Scrollable Content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          <div className="mx-auto max-w-7xl space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-md flex items-center justify-around py-2 px-1">
        {mobileNav.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === '/hospital' 
            ? pathname === item.href 
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-2 py-1 text-[11px] font-medium transition-colors ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
