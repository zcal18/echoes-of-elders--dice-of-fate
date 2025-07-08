import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
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

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      headers: () => ({
        'Content-Type': 'application/json',
      }),
    }),
  ],
});

// WebSocket connection for real-time features
let wsConnection: WebSocket | null = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
const reconnectDelay = 1000;

export const connectWebSocket = (userId: string, userName: string, channelId: string = 'general') => {
  if (Platform.OS !== 'web') {
    console.log('WebSocket only supported on web platform');
    return null;
  }

  try {
    // Close existing connection if any
    if (wsConnection && wsConnection.readyState !== WebSocket.CLOSED) {
      wsConnection.close();
    }

    const baseUrl = getBaseUrl();
    const wsUrl = baseUrl.replace(/^http/, 'ws') + '/api/ws';
    console.log('Attempting to connect to WebSocket:', wsUrl);
    
    wsConnection = new WebSocket(wsUrl);
    
    wsConnection.onopen = () => {
      console.log('WebSocket connected successfully');
      reconnectAttempts = 0;
      
      // Send join message
      if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
        wsConnection.send(JSON.stringify({
          type: 'join',
          userId,
          userName,
          channelId
        }));
      }
    };
    
    wsConnection.onerror = (error) => {
      console.error('WebSocket connection error:', error);
      
      // Attempt to reconnect if we haven't exceeded max attempts
      if (reconnectAttempts < maxReconnectAttempts) {
        setTimeout(() => {
          reconnectAttempts++;
          console.log(`Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})`);
          connectWebSocket(userId, userName, channelId);
        }, reconnectDelay * reconnectAttempts);
      } else {
        console.error('Max reconnection attempts reached');
      }
    };
    
    wsConnection.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
      wsConnection = null;
      
      // Only attempt to reconnect if it wasn't a manual close
      if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
        setTimeout(() => {
          reconnectAttempts++;
          console.log(`Attempting to reconnect after close (${reconnectAttempts}/${maxReconnectAttempts})`);
          connectWebSocket(userId, userName, channelId);
        }, reconnectDelay * reconnectAttempts);
      }
    };
    
    return wsConnection;
  } catch (error) {
    console.error('Failed to create WebSocket connection:', error);
    return null;
  }
};

export const disconnectWebSocket = (userId: string) => {
  if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
    try {
      wsConnection.send(JSON.stringify({
        type: 'leave',
        userId
      }));
    } catch (error) {
      console.error('Error sending leave message:', error);
    }
    
    wsConnection.close(1000, 'User disconnecting');
    wsConnection = null;
  }
  
  // Reset reconnection attempts
  reconnectAttempts = 0;
};

export const sendWebSocketMessage = (message: any) => {
  if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
    try {
      wsConnection.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return false;
    }
  } else {
    console.warn('WebSocket not connected, cannot send message');
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