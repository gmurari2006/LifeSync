import React from 'react';
import { TimelineEvent } from '@/types/hospital';
import { StatusBadge } from '@/components/hospital/StatusBadge';
import { 
  CheckCircle2, 
  Clock, 
  Radio, 
  Building2, 
  User, 
  Cpu, 
  ShieldAlert 
} from 'lucide-react';

import { getCaseAuditTimeline } from '@/lib/api/audit';
import { CaseAuditEventItem } from '@/types/audit';

interface CaseTimelineProps {
  events?: TimelineEvent[];
  caseId?: string;
}

export function CaseTimeline({ events: initialEvents, caseId }: CaseTimelineProps) {
  const [liveEvents, setLiveEvents] = React.useState<TimelineEvent[]>(initialEvents || []);

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
            const mapped: TimelineEvent[] = res.events.map((e) => {
              const dt = new Date(e.timestamp);
              const formattedTime = dt.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
              });
              let eventType: TimelineEvent['type'] = 'system';
              if (e.actor_type === 'CITIZEN') eventType = 'bystander';
              else if (e.actor_type === 'EMS') eventType = 'ems';
              else if (e.actor_type === 'HOSPITAL') eventType = 'hospital';

              return {
                id: e.id,
                timestamp: formattedTime,
                relativeTime: `${Math.max(0, Math.round((Date.now() - dt.getTime()) / 60000))}m ago`,
                type: eventType,
                title: e.title,
                description: e.description,
                actor: e.actor_name,
                actorRole: e.actor_type,
                stage: (e.new_state as any) || 'HOSPITAL_ALERTED',
              };
            });
            setLiveEvents(mapped);
          }
        })
        .catch(() => {});
    }
  }, [caseId]);

  const displayEvents = liveEvents.length > 0 ? liveEvents : initialEvents || [];

  const getActorIcon = (type: TimelineEvent['type']) => {

    switch (type) {
      case 'hospital':
        return <Building2 className="h-3.5 w-3.5 text-blue-400" />;
      case 'ems':
        return <Radio className="h-3.5 w-3.5 text-emerald-400" />;
      case 'system':
        return <Cpu className="h-3.5 w-3.5 text-purple-400" />;
      case 'bystander':
      default:
        return <User className="h-3.5 w-3.5 text-amber-400" />;
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Chronological Decision Audit Log
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          {displayEvents.length} Recorded Events
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
        {displayEvents.map((evt, idx) => (
          <div key={evt.id || idx} className="relative group">
            {/* Timeline node icon */}
            <div className="absolute -left-6 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 border border-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 group-hover:scale-125 transition-transform" />
            </div>

            {/* Event Content Box */}
            <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-3 space-y-1.5 hover:border-slate-700 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200">
                    {evt.title}
                  </span>
                  <StatusBadge status={evt.stage} size="sm" />
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {evt.timestamp} ({evt.relativeTime})
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {evt.description}
              </p>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                {getActorIcon(evt.type)}
                <span>Actor: <strong className="text-slate-300">{evt.actor}</strong> ({evt.actorRole})</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
