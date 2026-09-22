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
          bgColor: 'bg-emerald-50 border-emerald-200 text-emerald-700',
          dotColor: 'bg-emerald-600',
          pulseColor: 'bg-emerald-400',
          label: 'LIVE WS',
          icon: <Wifi className="w-3.5 h-3.5 text-emerald-600" />,
          tooltip: 'Connected to Real-Time Synchronization Layer',
        };
      case 'RECONNECTING':
      case 'CONNECTING':
        return {
          bgColor: 'bg-amber-50 border-amber-200 text-amber-800',
          dotColor: 'bg-amber-600',
          pulseColor: 'bg-amber-400',
          label: status === 'CONNECTING' ? 'CONNECTING...' : 'RECONNECTING...',
          icon: <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" />,
          tooltip: 'Reconnecting WebSocket session...',
        };
      case 'OFFLINE':
      default:
        return {
          bgColor: 'bg-slate-100 border-slate-200 text-slate-600',
          dotColor: 'bg-slate-500',
          pulseColor: 'transparent',
          label: 'OFFLINE',
          icon: <WifiOff className="w-3.5 h-3.5 text-slate-500" />,
          tooltip: 'WebSocket disconnected. Authoritative REST updates active.',
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono border transition-colors ${config.bgColor} ${className}`}
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

      {showText && <span className="font-bold tracking-wider text-[10px]">{config.label}</span>}

      {status === 'OFFLINE' && onReconnect && (
        <button
          onClick={onReconnect}
          className="ml-1 text-[10px] text-blue-600 hover:text-blue-800 font-sans font-semibold underline"
          title="Attempt manual reconnect"
        >
          Retry
        </button>
      )}
    </div>
  );
};
