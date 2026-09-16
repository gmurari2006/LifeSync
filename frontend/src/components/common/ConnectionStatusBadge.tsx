'use client';

import React from 'react';
import { WebSocketConnectionStatus } from '@/hooks/useCaseWebSocket';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface ConnectionStatusBadgeProps {
  status: WebSocketConnectionStatus;
  onReconnect?: () => void;
  showText?: boolean;
  className?: string;
}

export const ConnectionStatusBadge: React.FC<ConnectionStatusBadgeProps> = ({
  status,
  onReconnect,
  showText = true,
  className = '',
}) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'CONNECTED':
        return {
          bgColor: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          dotColor: 'bg-emerald-400',
          pulseColor: 'bg-emerald-400/50',
          label: 'LIVE WS',
          icon: <Wifi className="w-3.5 h-3.5 text-emerald-400" />,
          tooltip: 'Connected to Real-Time Synchronization Layer',
        };
      case 'RECONNECTING':
      case 'CONNECTING':
        return {
          bgColor: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          dotColor: 'bg-amber-400',
          pulseColor: 'bg-amber-400/50',
          label: status === 'CONNECTING' ? 'CONNECTING...' : 'RECONNECTING...',
          icon: <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />,
          tooltip: 'Reconnecting WebSocket session...',
        };
      case 'OFFLINE':
      default:
        return {
          bgColor: 'bg-slate-800/60 border-slate-700/50 text-slate-400',
          dotColor: 'bg-slate-400',
          pulseColor: 'transparent',
          label: 'OFFLINE',
          icon: <WifiOff className="w-3.5 h-3.5 text-slate-400" />,
          tooltip: 'WebSocket disconnected. Authoritative REST updates active.',
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border backdrop-blur-sm transition-all duration-300 ${config.bgColor} ${className}`}
      title={config.tooltip}
    >
      <div className="relative flex items-center justify-center w-2 h-2">
        {status === 'CONNECTED' && (
          <span
            className={`absolute inline-flex h-full w-full rounded-full animate-ping opacity-75 ${config.pulseColor}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${config.dotColor}`} />
      </div>

      {showText && <span className="font-semibold tracking-wider text-[11px]">{config.label}</span>}

      {status === 'OFFLINE' && onReconnect && (
        <button
          onClick={onReconnect}
          type="button"
          className="ml-1 text-[10px] text-primary hover:text-primary-foreground hover:underline focus:outline-none"
          title="Attempt reconnection"
        >
          Retry
        </button>
      )}
    </div>
  );
};
