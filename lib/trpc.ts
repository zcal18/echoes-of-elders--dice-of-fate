import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { Platform } from "react-native";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  throw new Error(
    "No base url found, please set EXPO_PUBLIC_RORK_API_BASE_URL"
  );
};

// Store authentication info globally
let currentUserId: string | null = null;
let currentUserName: string | null = null;

export const setAuthInfo = (userId: string | null, userName: string | null) => {
  currentUserId = userId;
  currentUserName = userName;
  console.log('Auth info updated:', { userId, userName });
};

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      headers: () => {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        if (currentUserId) {
          headers['x-user-id'] = currentUserId;
        }
        if (currentUserName) {
          headers['x-user-name'] = currentUserName;
        }
        
        return headers;
      },
    }),
  ],
});

// Simplified WebSocket connection management
let wsConnection: WebSocket | null = null;
let reconnectAttempts = 0;
let reconnectTimeout: NodeJS.Timeout | null = null;
let connectionListeners: Array<(status: string) => void> = [];
let currentStatus = 'disconnected';
let isManualDisconnect = false;

const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_DELAY = 3000;

const updateConnectionStatus = (status: string) => {
  if (currentStatus !== status) {
    currentStatus = status;
    console.log('WebSocket status:', status);
    connectionListeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('Error in connection listener:', error);
      }
    });
  }
};

export const addConnectionStatusListener = (listener: (status: string) => void) => {
  connectionListeners.push(listener);
  listener(currentStatus);
  
  return () => {
    connectionListeners = connectionListeners.filter(l => l !== listener);
  };
};

export const connectWebSocket = (userId: string, userName: string, channelId: string = 'general') => {
  if (Platform.OS !== 'web') {
    console.log('WebSocket only supported on web');
    return null;
  }

  if (isManualDisconnect) {
    console.log('Manual disconnect active');
    return null;
  }

  try {
    // Close existing connection
    if (wsConnection) {
      wsConnection.close(1000, 'Reconnecting');
      wsConnection = null;
    }

    const baseUrl = getBaseUrl();
    const wsUrl = baseUrl.replace(/^http/, 'ws') + '/api/ws';
    
    updateConnectionStatus('connecting');
    wsConnection = new WebSocket(wsUrl);
    
    wsConnection.onopen = () => {
      console.log('WebSocket connected');
      reconnectAttempts = 0;
      isManualDisconnect = false;
      updateConnectionStatus('connected');
      
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
      
      // Send join message
      if (wsConnection?.readyState === WebSocket.OPEN) {
        wsConnection.send(JSON.stringify({
          type: 'join',
          userId,
          userName,
          channelId
        }));
      }
    };
    
    wsConnection.onerror = (event) => {
      console.error('WebSocket error:', event);
      updateConnectionStatus('error');
      
      if (!isManualDisconnect && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        scheduleReconnect(userId, userName, channelId);
      }
    };
    
    wsConnection.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      wsConnection = null;
      
      if (event.code === 1000) {
        updateConnectionStatus('disconnected');
      } else {
        updateConnectionStatus('error');
        if (!isManualDisconnect && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          scheduleReconnect(userId, userName, channelId);
        }
      }
    };
    
    return wsConnection;
  } catch (error) {
    console.error('Failed to create WebSocket:', error);
    updateConnectionStatus('error');
    
    if (!isManualDisconnect && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      scheduleReconnect(userId, userName, channelId);
    }
    
    return null;
  }
};

const scheduleReconnect = (userId: string, userName: string, channelId: string) => {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }
  
  reconnectAttempts++;
  const delay = RECONNECT_DELAY * reconnectAttempts;
  
  updateConnectionStatus('reconnecting');
  
  reconnectTimeout = setTimeout(() => {
    console.log(`Reconnecting attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`);
    connectWebSocket(userId, userName, channelId);
  }, delay);
};

export const disconnectWebSocket = (userId: string) => {
  isManualDisconnect = true;
  
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  
  if (wsConnection?.readyState === WebSocket.OPEN) {
    try {
      wsConnection.send(JSON.stringify({
        type: 'leave',
        userId
      }));
    } catch (error) {
      console.error('Error sending leave message:', error);
    }
    
    wsConnection.close(1000, 'User disconnecting');
  }
  
  wsConnection = null;
  reconnectAttempts = 0;
  updateConnectionStatus('disconnected');
};

export const sendWebSocketMessage = (message: any) => {
  if (wsConnection?.readyState === WebSocket.OPEN) {
    try {
      wsConnection.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }
  
  console.warn('WebSocket not connected');
  return false;
};

export const getWebSocketConnection = () => wsConnection;

export const getWebSocketStatus = () => currentStatus;

export const resetWebSocketConnection = () => {
  isManualDisconnect = false;
  reconnectAttempts = 0;
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  updateConnectionStatus('disconnected');
};