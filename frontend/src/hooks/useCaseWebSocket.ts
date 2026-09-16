'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  RealtimeEventEnvelope,
  AmbulanceTelemetryState,
} from '@/types/realtime';

export type WebSocketConnectionStatus =
  | 'CONNECTING'
  | 'CONNECTED'
  | 'RECONNECTING'
  | 'OFFLINE';

interface UseCaseWebSocketOptions {
  caseId: string | null | undefined;
  role?: string;
  enabled?: boolean;
  onEvent?: (event: RealtimeEventEnvelope) => void;
  onReconnect?: () => void;
}

interface UseCaseWebSocketReturn {
  connectionStatus: WebSocketConnectionStatus;
  isConnected: boolean;
  lastEvent: RealtimeEventEnvelope | null;
  lastTelemetry: AmbulanceTelemetryState | null;
  lastVitals: Record<string, unknown> | null;
  sendPing: () => void;
  reconnect: () => void;
}

export function useCaseWebSocket({
  caseId,
  role = 'EMS_PARAMEDIC',
  enabled = true,
  onEvent,
  onReconnect,
}: UseCaseWebSocketOptions): UseCaseWebSocketReturn {
  const [connectionStatus, setConnectionStatus] =
    useState<WebSocketConnectionStatus>('OFFLINE');
  const [lastEvent, setLastEvent] = useState<RealtimeEventEnvelope | null>(null);
  const [lastTelemetry, setLastTelemetry] =
    useState<AmbulanceTelemetryState | null>(null);
  const [lastVitals, setLastVitals] = useState<Record<string, unknown> | null>(
    null
  );

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef<number>(0);
  const hasConnectedBeforeRef = useRef<boolean>(false);
  const isExplicitlyClosedRef = useRef<boolean>(false);

  // Stable callbacks refs
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;
  const onReconnectRef = useRef(onReconnect);
  onReconnectRef.current = onReconnect;

  const getWebSocketUrl = useCallback((cId: string, userRole: string): string => {
    let baseUrl =
      process.env.NEXT_PUBLIC_WS_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:8000';

    baseUrl = baseUrl.replace(/^http:\/\//, 'ws://').replace(/^https:\/\//, 'wss://');
    // Strip trailing slash if present
    baseUrl = baseUrl.replace(/\/$/, '');

    return `${baseUrl}/ws/cases/${encodeURIComponent(cId)}?role=${encodeURIComponent(userRole)}`;
  }, []);

  const clearTimers = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  const sendPing = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'PING' }));
    }
  }, []);

  const connect = useCallback(() => {
    if (!caseId || !enabled) {
      setConnectionStatus('OFFLINE');
      return;
    }

    clearTimers();

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    setConnectionStatus(
      hasConnectedBeforeRef.current ? 'RECONNECTING' : 'CONNECTING'
    );

    const wsUrl = getWebSocketUrl(caseId, role);

    try {
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setConnectionStatus('CONNECTED');
        retryCountRef.current = 0;

        // If this is a reconnect (or initial connect), notify parent to reload authoritative REST state
        if (onReconnectRef.current) {
          onReconnectRef.current();
        }
        hasConnectedBeforeRef.current = true;

        // Start heartbeat ping every 15 seconds
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'PING' }));
          }
        }, 15000);
      };

      ws.onmessage = (messageEvent) => {
        try {
          const rawData = JSON.parse(messageEvent.data);

          // Handle server PONG heartbeat responses
          if (rawData.type === 'PONG') {
            return;
          }

          const envelope = rawData as RealtimeEventEnvelope;
          setLastEvent(envelope);

          // Dispatch event-specific state caching
          if (envelope.event_type === 'TELEMETRY_UPDATED' && envelope.payload) {
            setLastTelemetry(envelope.payload as unknown as AmbulanceTelemetryState);
          } else if (
            envelope.event_type === 'EMS_VITALS_UPDATED' &&
            envelope.payload
          ) {
            const vitalsPayload = envelope.payload as { vitals?: Record<string, unknown> };
            if (vitalsPayload.vitals) {
              setLastVitals(vitalsPayload.vitals);
            }
          }

          if (onEventRef.current) {
            onEventRef.current(envelope);
          }
        } catch {
          // Ignored malformed non-JSON frame
        }
      };

      ws.onerror = () => {
        // Error will trigger onclose where reconnect logic lives
      };

      ws.onclose = (event) => {
        clearTimers();
        if (isExplicitlyClosedRef.current) {
          setConnectionStatus('OFFLINE');
          return;
        }

        // Check if policy violation (e.g. 1008 unauthorized/case not found)
        if (event.code === 1008 || event.code === 4004) {
          setConnectionStatus('OFFLINE');
          return;
        }

        setConnectionStatus('RECONNECTING');

        // Exponential backoff reconnect: 1s, 2s, 4s, 8s, max 10s
        const backoffMs = Math.min(
          1000 * Math.pow(2, retryCountRef.current),
          10000
        );
        retryCountRef.current += 1;

        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, backoffMs);
      };
    } catch {
      setConnectionStatus('OFFLINE');
    }
  }, [caseId, role, enabled, getWebSocketUrl, clearTimers]);

  useEffect(() => {
    isExplicitlyClosedRef.current = false;
    hasConnectedBeforeRef.current = false;
    retryCountRef.current = 0;

    connect();

    return () => {
      isExplicitlyClosedRef.current = true;
      clearTimers();
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      setConnectionStatus('OFFLINE');
    };
  }, [connect, clearTimers]);

  const reconnect = useCallback(() => {
    retryCountRef.current = 0;
    connect();
  }, [connect]);

  return {
    connectionStatus,
    isConnected: connectionStatus === 'CONNECTED',
    lastEvent,
    lastTelemetry,
    lastVitals,
    sendPing,
    reconnect,
  };
}
