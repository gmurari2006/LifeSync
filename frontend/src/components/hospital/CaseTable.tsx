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
  if (!cases || cases.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <AlertCircle className="mx-auto h-8 w-8 text-slate-400 mb-2" />
        <p className="text-sm font-medium text-slate-700">No emergency cases match the current filter criteria.</p>
        <p className="text-xs text-slate-500 mt-1">Incoming incidents will appear here in real time.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <th className="py-3 px-4">Priority</th>
            <th className="py-3 px-4">Case ID</th>
            <th className="py-3 px-4">Patient &amp; Reported Incident</th>
            <th className="py-3 px-4 hidden sm:table-cell">EMS Unit</th>
            <th className="py-3 px-4">ETA</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {cases.map((c) => {
            const isAlerted = c.status === 'Alerted';
            return (
              <tr 
                key={c.id} 
                className={`group transition-colors hover:bg-slate-50/80 ${
                  isAlerted ? 'bg-rose-50/30' : ''
                }`}
              >
                {/* Priority */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <PriorityBadge priority={c.operationalPriority} size="sm" />
                </td>

                {/* Case ID */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {c.id}
                  </span>
                  <div className="text-[10px] text-slate-500">
                    Alerted {c.timeAlerted}
                  </div>
                </td>

                {/* Patient & Reported Incident */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                    <span className="font-mono text-xs text-blue-700 font-bold">
                      {c.patientAge}{c.patientSex === 'Male' ? 'M' : c.patientSex === 'Female' ? 'F' : 'U'}
                    </span>
                    <span className="text-slate-400">—</span>
                    <span className="truncate max-w-[280px] sm:max-w-[340px]" title={c.incidentType}>
                      {c.incidentType}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 truncate max-w-[280px] sm:max-w-[340px]">
                    {c.clinicalSummary.chiefComplaint}
                  </div>
                </td>

                {/* EMS Unit */}
                <td className="py-3.5 px-4 whitespace-nowrap hidden sm:table-cell">
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
                    <Navigation className="h-3.5 w-3.5 text-blue-600" />
                    <span>{c.emsUnit.unitId}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {c.emsUnit.transportStatus}
                  </div>
                </td>

                {/* ETA */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <Clock className={`h-3.5 w-3.5 ${
                      c.emsUnit.etaMinutes <= 8 ? 'text-rose-600 animate-pulse' : 'text-slate-400'
                    }`} />
                    <span className={`font-mono font-bold ${
                      c.emsUnit.etaMinutes <= 8 ? 'text-rose-700 text-sm' : 'text-slate-900 text-xs'
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
                    <div className="text-[10px] text-blue-700 font-medium mt-0.5">
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
                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
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
