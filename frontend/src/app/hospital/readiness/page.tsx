'use client';

import React, { useState } from 'react';
import { useHospital } from '@/context/HospitalContext';
import { ResourceCard } from '@/components/hospital/ResourceCard';
import { ResourceCategory } from '@/types/hospital';
import { 
  BedDouble, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Activity, 
  ShieldCheck,
  Filter
} from 'lucide-react';

export default function ReadinessPage() {
  const { resources, updateResourceStatus, stats, hospitalProfile } = useHospital();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories: { id: string; label: string }[] = [
    { id: 'ALL', label: 'All Resources' },
    { id: 'Emergency Bay', label: 'Emergency Bays' },
    { id: 'Resuscitation Unit', label: 'Resuscitation Suites' },
    { id: 'Specialist Team', label: 'Specialist Teams' },
    { id: 'Diagnostics / Imaging', label: 'Imaging & Scanners' },
    { id: 'Surgical / OR', label: 'Trauma ORs' },
    { id: 'Blood Bank', label: 'Blood Bank' },
  ];

  const filteredResources = selectedCategory === 'ALL'
    ? resources
    : resources.filter(r => r.category === selectedCategory);

  const readyCount = resources.filter(r => r.status === 'Ready').length;
  const occupiedCount = resources.filter(r => r.status === 'Occupied').length;
  const limitedCount = resources.filter(r => r.status === 'Limited').length;
  const offlineCount = resources.filter(r => r.status === 'Unavailable').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <BedDouble className="h-5 w-5 text-emerald-600" />
            <span>Hospital Operational Readiness</span>
          </h1>
          <p className="text-xs text-slate-500">
            Real-time capacity and resource staging at {hospitalProfile.name}
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs shadow-sm">
          <ShieldCheck className="h-4 w-4 text-blue-600" />
          <span className="text-slate-600">Surge Status: <strong className="text-emerald-700">NORMAL</strong></span>
        </div>
      </div>

      {/* Resource KPI Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-xs font-semibold uppercase">Ready / Available</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-emerald-700">
            {readyCount}
          </div>
          <span className="text-[11px] text-emerald-700/80">Immediate intake capable</span>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-blue-800">
            <span className="text-xs font-semibold uppercase">Assigned / Occupied</span>
            <Activity className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-blue-700">
            {occupiedCount}
          </div>
          <span className="text-[11px] text-blue-700/80">Active case staging</span>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-xs font-semibold uppercase">Limited / Standby</span>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-amber-700">
            {limitedCount}
          </div>
          <span className="text-[11px] text-amber-700/80">Transitioning staff</span>
        </div>

        <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-rose-800">
            <span className="text-xs font-semibold uppercase">Offline / Maintenance</span>
            <XCircle className="h-4 w-4 text-rose-600" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-rose-700">
            {offlineCount}
          </div>
          <span className="text-[11px] text-rose-700/80">Zero capacity</span>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <Filter className="h-4 w-4 text-slate-400 ml-2 mr-1 shrink-0" />
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Interactive Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((res) => (
          <ResourceCard
            key={res.id}
            resource={res}
            onStatusChange={(newStatus) => updateResourceStatus(res.id, newStatus)}
          />
        ))}
      </div>
    </div>
  );
}
