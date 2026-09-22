'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { HospitalAlertEscalationsResponse, AlertEscalationStatus } from '@/types/escalation';
import { getHospitalAlertEscalations } from '@/lib/api/escalation';
import { acknowledgeHospitalCase } from '@/lib/api/hospitals';

interface AlertEscalationBannerProps {
  hospitalId: string;
  onCaseAcknowledged?: (caseId: string) => void;
}

export const AlertEscalationBanner: React.FC<AlertEscalationBannerProps> = ({
  hospitalId,
  onCaseAcknowledged,
}) => {
  const [escalationData, setEscalationData] = useState<HospitalAlertEscalationsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [acknowledgingCaseId, setAcknowledgingCaseId] = useState<string | null>(null);

  const fetchEscalations = async () => {
    try {
      const data = await getHospitalAlertEscalations(hospitalId);
      setEscalationData(data);
    } catch {
      // Gracefully ignore polling errors
    }
  };

  useEffect(() => {
    fetchEscalations();
    const timer = setInterval(fetchEscalations, 5000);
    return () => clearInterval(timer);
  }, [hospitalId]);

  if (
    !escalationData || 
    !Array.isArray(escalationData.escalations) || 
    escalationData.total_unacknowledged_alerts === 0
  ) {
    return null;
  }

  // Filter only escalated cases (tier 1, 2, or 3)
  const activeEscalations = escalationData.escalations.filter(
    (e) => e.is_escalated && !e.acknowledged
  );

  if (activeEscalations.length === 0) {
    return null;
  }

  const handleQuickAcknowledge = async (caseCode: string, caseId: string) => {
    setAcknowledgingCaseId(caseId);
    try {
      await acknowledgeHospitalCase(hospitalId, caseCode, {
        acknowledged_by: 'ED Charge Nurse',
        notes: 'Pre-alert acknowledged from Escalation Banner.',
      });
      await fetchEscalations();
      if (onCaseAcknowledged) {
        onCaseAcknowledged(caseId);
      }
    } catch (err) {
      console.error('Failed to acknowledge case:', err);
    } finally {
      setAcknowledgingCaseId(null);
    }
  };

  return (
    <div className="space-y-2 mb-6">
      {activeEscalations.map((esc) => {
        const isTier3 = esc.escalation_tier === 'TIER_3_DISPATCH';
        const isTier2 = esc.escalation_tier === 'TIER_2_PUSH';

        const bannerClasses = isTier3
          ? 'bg-rose-50 border-rose-300 text-rose-950 shadow-sm'
          : isTier2
          ? 'bg-amber-50 border-amber-300 text-amber-950 shadow-sm'
          : 'bg-blue-50 border-blue-200 text-blue-950 shadow-sm';

        const badgeClasses = isTier3
          ? 'bg-rose-600 text-white'
          : isTier2
          ? 'bg-amber-600 text-white'
          : 'bg-blue-600 text-white';

        return (
          <div
            key={esc.case_id}
            className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border shadow-sm transition duration-300 ${bannerClasses}`}
          >
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-lg shrink-0 ${badgeClasses}`}>
                {isTier3 ? '🚨 TIER 3: DISPATCH ESCALATION' : isTier2 ? '⚠️ TIER 2: PUSH ESCALATION' : '⚡ TIER 1: UNACKNOWLEDGED ALERT'}
              </span>
              <div>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                  <span>Pre-alert unacknowledged for</span>
                  <span className="font-mono underline decoration-2">{esc.seconds_elapsed}s</span>
                  <span>— Case</span>
                  <Link
                    href={`/hospital/cases/${esc.case_code}`}
                    className="font-mono font-black text-blue-700 underline hover:text-blue-800"
                  >
                    {esc.case_code}
                  </Link>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  {isTier3
                    ? '180s SLA breached. Regional Dispatch & Emergency Directors have been alerted.'
                    : isTier2
                    ? '120s SLA breached. Secondary high-urgency notifications dispatched.'
                    : '60s SLA breached. Please acknowledge immediately to prepare resuscitation team.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
              <Link
                href={`/hospital/cases/${esc.case_code}`}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm transition"
              >
                View Case
              </Link>
              <button
                onClick={() => handleQuickAcknowledge(esc.case_code, esc.case_id)}
                disabled={acknowledgingCaseId === esc.case_id}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition disabled:opacity-50"
              >
                {acknowledgingCaseId === esc.case_id ? 'Acknowledging...' : 'Acknowledge Now'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
