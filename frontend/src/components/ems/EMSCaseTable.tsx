'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { EMSCase, EMSTransportStatus, OperationalPriority } from '@/types/ems';
import { 
  ClipboardList, 
  MapPin, 
  Clock, 
  Building2, 
  ChevronRight, 
  Search, 
  AlertOctagon,
  Users,
  Activity
} from 'lucide-react';

interface EMSCaseTableProps {
  cases: EMSCase[];
}

export function EMSCaseTable({ cases }: EMSCaseTableProps) {
  const [selectedTab, setSelectedTab] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const tabs = [
    { id: 'All', label: 'All Cases' },
    { id: 'New Assignment', label: 'New Assignment' },
    { id: 'Responding', label: 'Responding' },
    { id: 'On Scene', label: 'On Scene' },
    { id: 'Transporting', label: 'Transporting' },
    { id: 'Handover', label: 'Handover' },
  ];

  const filteredCases = cases.filter((c) => {
    // Tab filter
    if (selectedTab === 'New Assignment' && c.transportStatus !== 'Assigned') return false;
    if (selectedTab === 'Responding' && c.transportStatus !== 'Responding to Scene') return false;
    if (selectedTab === 'On Scene' && c.transportStatus !== 'On Scene') return false;
    if (selectedTab === 'Transporting' && c.transportStatus !== 'Transporting') return false;
    if (selectedTab === 'Handover' && c.transportStatus !== 'Arrived at Hospital' && c.transportStatus !== 'Handover Complete') return false;

    // Search query
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchesId = c.id.toLowerCase().includes(q);
      const matchesIncident = c.incidentType.toLowerCase().includes(q);
      const matchesLoc = c.citizenReport.reportedLocation.toLowerCase().includes(q);
      const matchesHosp = c.destinationHospital.name.toLowerCase().includes(q);
      return matchesId || matchesIncident || matchesLoc || matchesHosp;
    }

    return true;
  });

  const getPriorityBadge = (priority: OperationalPriority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-950 text-red-300 border-red-800';
      case 'High':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'Moderate':
        return 'bg-blue-950 text-blue-300 border-blue-800';
      case 'Low':
        return 'bg-slate-900 text-slate-300 border-slate-700';
    }
  };

  const getStatusBadge = (status: EMSTransportStatus) => {
    switch (status) {
      case 'Assigned':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'Responding to Scene':
        return 'bg-orange-950 text-orange-300 border-orange-800';
      case 'On Scene':
        return 'bg-purple-950 text-purple-300 border-purple-800';
      case 'Patient Loaded':
        return 'bg-sky-950 text-sky-300 border-sky-800';
      case 'Transporting':
        return 'bg-red-950 text-red-300 border-red-800 animate-pulse';
      case 'Arrived at Hospital':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'Handover Complete':
        return 'bg-slate-900 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Tabs Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-slate-900/80 border border-slate-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedTab === tab.id
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search cases, location..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Case Count Indicator */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Showing <strong>{filteredCases.length}</strong> emergency cases</span>
        <span className="text-[11px] font-mono text-slate-500">Synthetic Dispatch Registry</span>
      </div>

      {/* Case List Cards */}
      {filteredCases.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/40 text-slate-400 space-y-2">
          <ClipboardList className="h-8 w-8 mx-auto text-slate-600" />
          <p className="text-sm font-semibold">No emergency cases found matching criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredCases.map((c) => (
            <Link
              key={c.id}
              href={`/ems/cases/${c.id}`}
              className="p-4 sm:p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-orange-500/50 hover:bg-slate-900 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group active:scale-[0.99]"
            >
              {/* Left Details */}
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-extrabold text-sm text-white group-hover:text-orange-400 transition-colors">
                    {c.id}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getPriorityBadge(c.operationalPriority)}`}>
                    {c.operationalPriority}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(c.transportStatus)}`}>
                    {c.transportStatus}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-100 group-hover:text-white">
                    {c.incidentType}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-orange-400" />
                      <span className="truncate max-w-[250px]">{c.citizenReport.reportedLocation}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5 text-blue-400" />
                      <span>{c.destinationHospital.name}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-purple-400" />
                      <span>{c.patientAge}y &middot; {c.patientSex}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side Telemetry & Arrow */}
              <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-slate-800/80 pt-2 md:pt-0 shrink-0">
                <div className="text-left md:text-right">
                  <div className="flex items-center md:justify-end gap-1 font-mono font-extrabold text-amber-300 text-sm">
                    <Clock className="h-3.5 w-3.5" />
                    <span>ETA {c.etaMinutes} min</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    {c.distanceRemainingKm} km remaining
                  </span>
                </div>

                <div className="h-8 w-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-orange-400 group-hover:border-orange-500/40 transition-colors">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
