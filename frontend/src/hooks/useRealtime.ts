
import { useEffect, useState, useCallback, useRef } from 'react';

interface RealtimeMessage {
  type: string;
  channel?: string;
  data?: any;
  timestamp: string;
}

interface UseRealtimeOptions {
  autoConnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export const useRealtime = (options: UseRealtimeOptions = {}) => {
  const {
    autoConnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const subscriptionsRef = useRef<Set<string>>(new Set());
  const messageHandlersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());

  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.NODE_ENV === 'production' 
      ? window.location.host 
      : 'localhost:5000';
    const token = localStorage.getItem('authToken');
    return `${protocol}//${host}/realtime${token ? `?token=${token}` : ''}`;
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const ws = new WebSocket(getWebSocketUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        reconnectAttemptsRef.current = 0;

        // Resubscribe to all channels
        subscriptionsRef.current.forEach(channel => {
          ws.send(JSON.stringify({
            type: 'subscribe',
            channel
          }));
        });
      };

      ws.onmessage = (event) => {
        try {
          const message: RealtimeMessage = JSON.parse(event.data);
          
          if (message.type === 'broadcast' && message.channel) {
            const handlers = messageHandlersRef.current.get(message.channel);
            if (handlers) {
              handlers.forEach(handler => handler(message.data));
            }
          }

          // Handle specific message types
          switch (message.type) {
            case 'issue_status_changed':
              // Trigger UI updates for status changes
              window.dispatchEvent(new CustomEvent('issue-status-changed', { 
                detail: message.data 
              }));
              break;
            case 'new_comment':
              // Trigger UI updates for new comments
              window.dispatchEvent(new CustomEvent('new-comment', { 
                detail: message.data 
              }));
              break;
            case 'issue_assigned':
              // Trigger UI updates for assignments
              window.dispatchEvent(new CustomEvent('issue-assigned', { 
                detail: message.data 
              }));
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setIsConnecting(false);
        wsRef.current = null;

        // Auto-reconnect if we haven't exceeded max attempts
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else {
          setError('Failed to connect after maximum attempts');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket connection error');
        setIsConnecting(false);
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setError('Failed to create WebSocket connection');
      setIsConnecting(false);
    }
  }, [getWebSocketUrl, reconnectInterval, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    reconnectAttemptsRef.current = maxReconnectAttempts; // Prevent auto-reconnect
  }, [maxReconnectAttempts]);

  const subscribe = useCallback((channel: string, handler: (data: any) => void) => {
    subscriptionsRef.current.add(channel);
    
    if (!messageHandlersRef.current.has(channel)) {
      messageHandlersRef.current.set(channel, new Set());
    }
    messageHandlersRef.current.get(channel)!.add(handler);

    // Send subscription message if connected
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'subscribe',
        channel
      }));
    }

    // Return unsubscribe function
    return () => {
      const handlers = messageHandlersRef.current.get(channel);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          messageHandlersRef.current.delete(channel);
          subscriptionsRef.current.delete(channel);
          
          // Send unsubscribe message if connected
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              type: 'unsubscribe',
              channel
            }));
          }
        }
      }
    };
  }, []);

  const send = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    subscribe,
    send
  };
};

// Utility hook for specific issue subscriptions
export const useIssueRealtime = (issueId?: string) => {
  const { subscribe, isConnected } = useRealtime();

  useEffect(() => {
    if (!issueId || !isConnected) return;

    const unsubscribeIssue = subscribe(`issue:${issueId}`, (data) => {
      // Handle issue-specific updates
      console.log(`Issue ${issueId} update:`, data);
    });

    const unsubscribeGeneral = subscribe('issues', (data) => {
      // Handle general issue updates
      console.log('General issue update:', data);
    });

    return () => {
      unsubscribeIssue();
      unsubscribeGeneral();
    };
  }, [issueId, isConnected, subscribe]);

  return { isConnected };
};
