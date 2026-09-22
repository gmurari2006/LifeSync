'use client';

import React from 'react';
import { EMSTimelineEvent } from '@/types/ems';
import { 
  Clock, 
  User, 
  Ambulance, 
  Building2, 
  Cpu, 
  CheckCircle2 
} from 'lucide-react';

import { getCaseAuditTimeline } from '@/lib/api/audit';
import { CaseAuditEventItem } from '@/types/audit';

interface EMSTimelineProps {
  events?: EMSTimelineEvent[];
  caseId?: string;
}


export function EMSTimeline({ events: initialEvents, caseId }: EMSTimelineProps) {
  const [liveEvents, setLiveEvents] = React.useState<EMSTimelineEvent[]>(initialEvents || []);

  React.useEffect(() => {
    if (initialEvents && initialEvents.length > 0) {
      setLiveEvents(initialEvents);
    }
  }, [initialEvents]);

  React.useEffect(() => {
    if (caseId) {
      getCaseAuditTimeline(caseId)
        .then((res) => {
          if (res.events && res.events.length > 0) {
            const mapped: EMSTimelineEvent[] = res.events.map((e) => {
              const dt = new Date(e.timestamp);
              const formattedTime = dt.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
              });
              let actorRole: 'Citizen' | 'EMS' | 'Hospital' | 'System' = 'System';
              if (e.actor_type === 'CITIZEN') actorRole = 'Citizen';
              else if (e.actor_type === 'EMS') actorRole = 'EMS';
              else if (e.actor_type === 'HOSPITAL') actorRole = 'Hospital';

              return {
                id: e.id,
                timestamp: formattedTime,
                relativeTime: `${Math.max(0, Math.round((Date.now() - dt.getTime()) / 60000))}m ago`,
                actor: actorRole,
                title: e.title,
                description: e.description,
              };
            });
            setLiveEvents(mapped);
          }
        })
        .catch(() => {});
    }
  }, [caseId]);

  const displayEvents = liveEvents.length > 0 ? liveEvents : initialEvents || [];

  const getActorBadge = (actor: string) => {
    switch (actor) {
      case 'Citizen':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          icon: <User className="h-3 w-3 text-blue-600" />,
        };
      case 'EMS':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: <Ambulance className="h-3 w-3 text-amber-600" />,
        };
      case 'Hospital':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: <Building2 className="h-3 w-3 text-emerald-600" />,
        };
      case 'System':
      default:
        return {
          bg: 'bg-purple-50 text-purple-800 border-purple-200',
          icon: <Cpu className="h-3 w-3 text-purple-600" />,
        };
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
              Emergency Coordination Timeline
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Multi-actor pre-hospital audit log & synchronization stream
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-slate-500">
          {displayEvents.length} Events Logged
        </span>
      </div>

      {/* Timeline items */}
      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {displayEvents.map((ev, index) => {

          const actorBadge = getActorBadge(ev.actor);
          return (
            <div key={ev.id || index} className="relative space-y-1">
              {/* Dot indicator */}
              <div className="absolute -left-6 top-1 h-3 w-3 rounded-full border-2 border-white bg-blue-600 ring-2 ring-blue-100" />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${actorBadge.bg}`}>
                    {actorBadge.icon}
                    <span>{ev.actor}</span>
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {ev.title}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-slate-500">
                  {ev.timestamp} <span className="text-slate-400">({ev.relativeTime})</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed pl-1">
                {ev.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
