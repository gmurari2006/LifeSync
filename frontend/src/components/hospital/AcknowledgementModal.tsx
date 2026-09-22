'use client';

import React, { useState } from 'react';
import { PriorityBadge } from '@/components/hospital/PriorityBadge';
import { OperationalPriority } from '@/types/hospital';
import { CheckCircle2, X, ShieldCheck, AlertCircle } from 'lucide-react';

interface AcknowledgementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes: string) => void;
  caseId: string;
  incidentType: string;
  priority: OperationalPriority;
  onDutyUser: string;
}

export function AcknowledgementModal({
  isOpen,
  onClose,
  onConfirm,
  caseId,
  incidentType,
  priority,
  onDutyUser,
}: AcknowledgementModalProps) {
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(notes);
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Acknowledge Inbound Case</h3>
              <p className="text-xs text-slate-500">Confirm emergency department pre-arrival preparation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Case Info Preview Box */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-blue-700">{caseId}</span>
            <PriorityBadge priority={priority} size="sm" />
          </div>
          <p className="text-sm font-semibold text-slate-900">{incidentType}</p>
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Acknowledging Coordinator: <strong className="text-slate-800">{onDutyUser}</strong></span>
          </div>
        </div>

        {/* Confirmation Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Operational Readiness Notes (Optional):
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Resuscitation Bay 1 prepared. Cath lab team notified and on standby."
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 min-h-[80px]"
            />
          </div>

          <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-[11px] text-blue-800 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              Acknowledging alerts the EMS unit that the hospital is actively staging bays and awaiting inbound stretcher handover.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
            >
              Confirm Acknowledgement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
