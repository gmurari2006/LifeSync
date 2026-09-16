'use client';

import React from 'react';
import Link from 'next/link';
import { EmergencyCase } from '@/types/hospital';
import { PriorityBadge } from '@/components/hospital/PriorityBadge';
import { StatusBadge } from '@/components/hospital/StatusBadge';
import { formatEta } from '@/lib/demo/utils';
import { Clock, Navigation, User, ChevronRight, AlertCircle } from 'lucide-react';

interface CaseTableProps {
  cases: EmergencyCase[];
  compact?: boolean;
}

export function CaseTable({ cases, compact = false }: CaseTableProps) {
  if (cases.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-8 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-slate-500 mb-2" />
        <p className="text-sm font-medium text-slate-300">No emergency cases match the current filter criteria.</p>
        <p className="text-xs text-slate-500 mt-1">Incoming incidents will appear here in real time.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="border-b border-slate-800/80 bg-slate-950/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <th className="py-3 px-4">Priority</th>
            <th className="py-3 px-4">Case ID</th>
            <th className="py-3 px-4">Patient & Reported Incident</th>
            <th className="py-3 px-4 hidden sm:table-cell">EMS Unit</th>
            <th className="py-3 px-4">ETA</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {cases.map((c) => {
            const isAlerted = c.status === 'Alerted';
            return (
              <tr 
                key={c.id} 
                className={`group transition-colors hover:bg-slate-800/40 ${
                  isAlerted ? 'bg-rose-950/10' : ''
                }`}
              >
                {/* Priority */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <PriorityBadge priority={c.operationalPriority} size="sm" />
                </td>

                {/* Case ID */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="font-mono text-xs font-semibold text-slate-200">
                    {c.id}
                  </span>
                  <div className="text-[10px] text-slate-500">
                    Alerted {c.timeAlerted}
                  </div>
                </td>

                {/* Patient & Reported Incident */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5 font-medium text-slate-200">
                    <span className="font-mono text-xs text-blue-400 font-bold">
                      {c.patientAge}{c.patientSex === 'Male' ? 'M' : c.patientSex === 'Female' ? 'F' : 'U'}
                    </span>
                    <span>—</span>
                    <span className="truncate max-w-[280px] sm:max-w-[340px]" title={c.incidentType}>
                      {c.incidentType}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 truncate max-w-[280px] sm:max-w-[340px]">
                    {c.clinicalSummary.chiefComplaint}
                  </div>
                </td>

                {/* EMS Unit */}
                <td className="py-3.5 px-4 whitespace-nowrap hidden sm:table-cell">
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <Navigation className="h-3.5 w-3.5 text-blue-400" />
                    <span className="font-semibold">{c.emsUnit.unitId}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {c.emsUnit.transportStatus}
                  </div>
                </td>

                {/* ETA */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <Clock className={`h-3.5 w-3.5 ${
                      c.emsUnit.etaMinutes <= 8 ? 'text-red-400 animate-pulse' : 'text-slate-400'
                    }`} />
                    <span className={`font-mono font-bold ${
                      c.emsUnit.etaMinutes <= 8 ? 'text-red-400 text-sm' : 'text-slate-200 text-xs'
                    }`}>
                      {formatEta(c.emsUnit.etaMinutes)}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {c.emsUnit.distanceRemainingKm > 0 ? `${c.emsUnit.distanceRemainingKm} km away` : 'At Emergency Bay'}
                  </div>
                </td>

                {/* Status */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <StatusBadge status={c.status} size="sm" />
                  {c.assignedBay && (
                    <div className="text-[10px] text-blue-300 font-medium mt-0.5">
                      {c.assignedBay}
                    </div>
                  )}
                </td>

                {/* Action Link */}
                <td className="py-3.5 px-4 whitespace-nowrap text-right">
                  <Link
                    href={`/hospital/cases/${c.id}`}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isAlerted
                        ? 'bg-red-600 hover:bg-red-500 text-white shadow-sm shadow-red-900/40'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    <span>{isAlerted ? 'Review & Ack' : 'View Details'}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
