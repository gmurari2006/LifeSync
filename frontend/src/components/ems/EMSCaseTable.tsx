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
        return 'bg-red-50 text-red-700 border-red-200';
      case 'High':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Moderate':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Low':
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (status: EMSTransportStatus) => {
    switch (status) {
      case 'Assigned':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Responding to Scene':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'On Scene':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Patient Loaded':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Transporting':
        return 'bg-red-50 text-red-700 border-red-200 animate-pulse';
      case 'Arrived at Hospital':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Handover Complete':
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Tabs Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedTab === tab.id
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search cases, location..."
            className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none shadow-xs"
          />
        </div>
      </div>

      {/* Case Count Indicator */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Showing <strong className="text-slate-800">{filteredCases.length}</strong> emergency cases</span>
        <span className="text-[11px] font-mono text-slate-400">Synthetic Dispatch Registry</span>
      </div>

      {/* Case List Cards */}
      {filteredCases.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-slate-200 bg-white text-slate-500 space-y-2 shadow-xs">
          <ClipboardList className="h-8 w-8 mx-auto text-slate-400" />
          <p className="text-sm font-semibold text-slate-700">No emergency cases found matching criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredCases.map((c) => (
            <Link
              key={c.id}
              href={`/ems/cases/${c.id}`}
              className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-500 hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group active:scale-[0.99]"
            >
              {/* Left Details */}
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-sm text-blue-700 group-hover:text-blue-800 transition-colors">
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
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {c.incidentType}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-blue-600" />
                      <span className="truncate max-w-[250px] text-slate-700 font-medium">{c.citizenReport.reportedLocation}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-slate-700">{c.destinationHospital.name}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      <span>{c.patientAge}y &middot; {c.patientSex}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side Telemetry & Arrow */}
              <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-slate-100 pt-2 md:pt-0 shrink-0">
                <div className="text-left md:text-right">
                  <div className="flex items-center md:justify-end gap-1 font-mono font-bold text-amber-800 text-sm">
                    <Clock className="h-3.5 w-3.5 text-amber-600" />
                    <span>ETA {c.etaMinutes} min</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    {c.distanceRemainingKm} km remaining
                  </span>
                </div>

                <div className="h-8 w-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-700 group-hover:border-blue-300 transition-colors">
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
