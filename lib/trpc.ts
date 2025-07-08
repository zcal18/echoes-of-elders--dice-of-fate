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
        
        // Add authentication headers if available
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

// WebSocket connection for real-time features
let wsConnection: WebSocket | null = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
const reconnectDelay = 2000;
let isManualDisconnect = false;
let reconnectTimeout: NodeJS.Timeout | null = null;

export const connectWebSocket = (userId: string, userName: string, channelId: string = 'general') => {
  if (Platform.OS !== 'web') {
    console.log('WebSocket only supported on web platform');
    return null;
  }

  // Don't reconnect if manually disconnected
  if (isManualDisconnect) {
    console.log('Manual disconnect active, not connecting');
    return null;
  }

  try {
    // Close existing connection if any
    if (wsConnection && wsConnection.readyState !== WebSocket.CLOSED) {
      console.log('Closing existing WebSocket connection');
      wsConnection.close(1000, 'Reconnecting');
    }

    const baseUrl = getBaseUrl();
    const wsUrl = baseUrl.replace(/^http/, 'ws') + '/api/ws';
    console.log('Attempting to connect to WebSocket:', wsUrl);
    
    wsConnection = new WebSocket(wsUrl);
    
    wsConnection.onopen = (event) => {
      console.log('WebSocket connected successfully');
      reconnectAttempts = 0;
      isManualDisconnect = false;
      
      // Clear any pending reconnect timeout
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
      
      // Send join message
      if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
        const joinMessage = {
          type: 'join',
          userId,
          userName,
          channelId
        };
        console.log('Sending join message:', joinMessage);
        wsConnection.send(JSON.stringify(joinMessage));
      }
    };
    
    wsConnection.onerror = (event) => {
      console.error('WebSocket connection error:', event);
      
      // Only attempt to reconnect if not manually disconnected and haven't exceeded max attempts
      if (!isManualDisconnect && reconnectAttempts < maxReconnectAttempts) {
        scheduleReconnect(userId, userName, channelId);
      } else if (reconnectAttempts >= maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    };
    
    wsConnection.onclose = (event) => {
      console.log('WebSocket connection closed:', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean
      });
      
      wsConnection = null;
      
      // Only attempt to reconnect if it wasn't a manual close and we haven't exceeded max attempts
      if (!isManualDisconnect && event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
        scheduleReconnect(userId, userName, channelId);
      }
    };
    
    return wsConnection;
  } catch (error) {
    console.error('Failed to create WebSocket connection:', error);
    
    // Schedule reconnect on connection creation failure
    if (!isManualDisconnect && reconnectAttempts < maxReconnectAttempts) {
      scheduleReconnect(userId, userName, channelId);
    }
    
    return null;
  }
};

const scheduleReconnect = (userId: string, userName: string, channelId: string) => {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }
  
  reconnectTimeout = setTimeout(() => {
    reconnectAttempts++;
    console.log(`Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})`);
    connectWebSocket(userId, userName, channelId);
  }, reconnectDelay * Math.min(reconnectAttempts + 1, 5)); // Exponential backoff with cap
};

export const disconnectWebSocket = (userId: string) => {
  isManualDisconnect = true;
  
  // Clear any pending reconnect
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  
  if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
    try {
      const leaveMessage = {
        type: 'leave',
        userId
      };
      console.log('Sending leave message:', leaveMessage);
      wsConnection.send(JSON.stringify(leaveMessage));
    } catch (error) {
      console.error('Error sending leave message:', error);
    }
    
    wsConnection.close(1000, 'User disconnecting');
  }
  
  wsConnection = null;
  reconnectAttempts = 0;
};

export const sendWebSocketMessage = (message: any) => {
  if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
    try {
      console.log('Sending WebSocket message:', message);
      wsConnection.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return false;
    }
  } else {
    console.warn('WebSocket not connected, cannot send message. Status:', getWebSocketStatus());
    return false;
  }
};

export const getWebSocketConnection = () => wsConnection;

export const getWebSocketStatus = () => {
  if (!wsConnection) return 'disconnected';
  
  switch (wsConnection.readyState) {
    case WebSocket.CONNECTING:
      return 'connecting';
    case WebSocket.OPEN:
      return 'connected';
    case WebSocket.CLOSING:
      return 'closing';
    case WebSocket.CLOSED:
      return 'disconnected';
    default:
      return 'unknown';
  }
};