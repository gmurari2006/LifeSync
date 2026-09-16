'use client';

import React, { useState, useMemo } from 'react';
import { useHospital } from '@/context/HospitalContext';
import { CaseTable } from '@/components/hospital/CaseTable';
import { CaseCard } from '@/components/hospital/CaseCard';
import { AlertEscalationBanner } from '@/components/hospital/AlertEscalationBanner';
import { OperationalPriority, CaseStatus } from '@/types/hospital';
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  Table as TableIcon, 
  SlidersHorizontal,
  Inbox,
  AlertCircle
} from 'lucide-react';

export default function CasesQueuePage() {
  const { cases, stats, hospitalProfile, refreshHospitalData } = useHospital();

  
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortBy, setSortBy] = useState<'eta' | 'priority' | 'time'>('eta');

  // Filter and sort logic
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      // Search term
      const search = searchTerm.toLowerCase();
      const matchesSearch = 
        c.id.toLowerCase().includes(search) ||
        c.incidentType.toLowerCase().includes(search) ||
        c.clinicalSummary.chiefComplaint.toLowerCase().includes(search) ||
        c.emsUnit.unitId.toLowerCase().includes(search) ||
        c.reportedLocation.toLowerCase().includes(search);

      if (!matchesSearch) return false;

      // Priority filter
      if (priorityFilter !== 'ALL' && c.operationalPriority !== priorityFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === 'ACTIVE') {
        return c.status !== 'Closed' && c.status !== 'Diverted';
      }
      if (statusFilter === 'ALERTED') {
        return c.status === 'Alerted';
      }
      if (statusFilter === 'ACKNOWLEDGED') {
        return c.status === 'Acknowledged' || c.status === 'Preparing';
      }
      if (statusFilter === 'HANDOVER') {
        return c.status === 'Handover';
      }
      if (statusFilter === 'DIVERTED') {
        return c.status === 'Diverted';
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'eta') {
        return a.emsUnit.etaMinutes - b.emsUnit.etaMinutes;
      }
      if (sortBy === 'priority') {
        const pOrder: Record<OperationalPriority, number> = {
          'Critical': 1,
          'High': 2,
          'Moderate': 3,
          'Low': 4,
        };
        return pOrder[a.operationalPriority] - pOrder[b.operationalPriority];
      }
      if (sortBy === 'time') {
        return b.timeAlerted.localeCompare(a.timeAlerted);
      }
      return 0;
    });
  }, [cases, searchTerm, priorityFilter, statusFilter, sortBy]);

  const priorityOptions = [
    { id: 'ALL', label: 'All Priorities' },
    { id: 'Critical', label: `Critical (${stats.criticalCount})`, color: 'text-red-400' },
    { id: 'High', label: 'High Priority', color: 'text-amber-400' },
    { id: 'Moderate', label: 'Moderate', color: 'text-sky-400' },
    { id: 'Low', label: 'Low', color: 'text-emerald-400' },
  ];

  const statusTabs = [
    { id: 'ACTIVE', label: 'Active Inbound' },
    { id: 'ALERTED', label: `Awaiting Ack (${stats.awaitingAck})` },
    { id: 'ACKNOWLEDGED', label: 'Acknowledged' },
    { id: 'HANDOVER', label: 'At Handover' },
    { id: 'ALL', label: 'All Recorded' },
  ];

  return (
    <div className="space-y-6">
      {/* Alert Escalation Banner */}
      <AlertEscalationBanner
        hospitalId={hospitalProfile.id}
        onCaseAcknowledged={() => refreshHospitalData && refreshHospitalData()}
      />


      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Inbox className="h-5 w-5 text-blue-400" />
            <span>Emergency Case Queue</span>
          </h1>
          <p className="text-xs text-slate-400">
            Real-time pre-arrival cases matched to CityCare Emergency Department
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'table'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TableIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Table View</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'grid'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Cards View</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
        {/* Search Input & Sort Dropdown */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Case ID, chief complaint, unit ID, location..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="eta">Sort by: Shortest ETA</option>
              <option value="priority">Sort by: Highest Acuity</option>
              <option value="time">Sort by: Alert Time</option>
            </select>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === tab.id
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Priority Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/50">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-2">
            Acuity:
          </span>
          {priorityOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setPriorityFilter(opt.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
                priorityFilter === opt.id
                  ? 'bg-slate-800 text-white border-slate-600 font-semibold'
                  : 'bg-slate-950/40 text-slate-400 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <span className={opt.color}>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Showing <strong className="text-slate-200">{filteredCases.length}</strong> matching case{filteredCases.length !== 1 ? 's' : ''}</span>
        {searchTerm && (
          <button
            onClick={() => { setSearchTerm(''); setPriorityFilter('ALL'); setStatusFilter('ACTIVE'); }}
            className="text-blue-400 hover:underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Display List */}
      {viewMode === 'table' ? (
        <CaseTable cases={filteredCases} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCases.map((c) => (
            <CaseCard key={c.id} caseData={c} />
          ))}
        </div>
      )}
    </div>
  );
}
