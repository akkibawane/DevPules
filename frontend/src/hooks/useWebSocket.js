import { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export function useWebSocket(onEventReceived) {
  const [connectionStatus, setConnectionStatus] = useState('CONNECTING'); // 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED'
  const [redisStatus, setRedisStatus] = useState('ONLINE'); // 'ONLINE' | 'EMBEDDED' | 'DISCONNECTED'
  const clientRef = useRef(null);

  const connect = useCallback(() => {
    try {
      const socketUrl = window.location.port === '5173' 
        ? 'http://localhost:8080/ws-devpulse' 
        : `${window.location.origin}/ws-devpulse`;

      const client = new Client({
        webSocketFactory: () => new SockJS(socketUrl),
        reconnectDelay: 3000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        debug: (str) => {
          // Suppress verbose debug logs in production
        },
        onConnect: () => {
          setConnectionStatus('CONNECTED');

          // 1. Live Metrics Summary (Success Rate, Deploys, MTTR)
          client.subscribe('/topic/metrics', (message) => {
            try {
              const data = JSON.parse(message.body);
              if (data.redisMode) setRedisStatus(data.redisMode);
              onEventReceived('metrics', data);
            } catch (e) {
              console.error('Error parsing metrics:', e);
            }
          });

          // 2. CI/CD Build pipeline updates
          client.subscribe('/topic/builds', (message) => {
            try {
              const data = JSON.parse(message.body);
              onEventReceived('build', data);
            } catch (e) {
              console.error('Error parsing build event:', e);
            }
          });

          // 3. Deployment status updates
          client.subscribe('/topic/deployments', (message) => {
            try {
              const data = JSON.parse(message.body);
              onEventReceived('deployment', data);
            } catch (e) {
              console.error('Error parsing deployment event:', e);
            }
          });

          // 4. API Health & Latency matrix
          client.subscribe('/topic/health', (message) => {
            try {
              const data = JSON.parse(message.body);
              onEventReceived('health', data);
            } catch (e) {
              console.error('Error parsing health event:', e);
            }
          });

          // 5. Production incidents
          client.subscribe('/topic/incidents', (message) => {
            try {
              const data = JSON.parse(message.body);
              onEventReceived('incident', data);
            } catch (e) {
              console.error('Error parsing incident event:', e);
            }
          });

          // 6. Live Developer Activity stream
          client.subscribe('/topic/activity', (message) => {
            try {
              const data = JSON.parse(message.body);
              onEventReceived('activity', data);
            } catch (e) {
              console.error('Error parsing activity event:', e);
            }
          });
        },
        onDisconnect: () => {
          setConnectionStatus('DISCONNECTED');
        },
        onStompError: (frame) => {
          console.warn('Broker reported error: ' + frame.headers['message']);
          setConnectionStatus('DISCONNECTED');
        },
        onWebSocketClose: () => {
          setConnectionStatus('DISCONNECTED');
        }
      });

      client.activate();
      clientRef.current = client;
    } catch (err) {
      console.warn('WebSocket connection error:', err);
      setConnectionStatus('DISCONNECTED');
    }
  }, [onEventReceived]);

  useEffect(() => {
    connect();
    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [connect]);

  return { connectionStatus, redisStatus };
}
