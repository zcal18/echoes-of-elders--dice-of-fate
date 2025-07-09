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
let connectionListeners: Array<(status: string) => void> = [];

// Connection status management
let currentStatus = 'disconnected';

const updateConnectionStatus = (status: string) => {
  if (currentStatus !== status) {
    currentStatus = status;
    console.log('WebSocket status changed to:', status);
    connectionListeners.forEach(listener => listener(status));
  }
};

export const addConnectionStatusListener = (listener: (status: string) => void) => {
  connectionListeners.push(listener);
  // Immediately call with current status
  listener(currentStatus);
  
  // Return cleanup function
  return () => {
    connectionListeners = connectionListeners.filter(l => l !== listener);
  };
};

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
    
    updateConnectionStatus('connecting');
    wsConnection = new WebSocket(wsUrl);
    
    wsConnection.onopen = (event) => {
      console.log('WebSocket connected successfully');
      reconnectAttempts = 0;
      isManualDisconnect = false;
      updateConnectionStatus('connected');
      
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
      // Improved error logging to extract actual error details
      let errorDetails = 'Unknown WebSocket error';
      
      try {
        if (event instanceof ErrorEvent) {
          errorDetails = `ErrorEvent: ${event.message || 'No message'}`;
          if (event.error) {
            errorDetails += ` | Error: ${String(event.error)}`;
          }
        } else if (event && typeof event === 'object') {
          // Try to extract meaningful error information
          const eventProps = [];
          if ('type' in event) eventProps.push(`type: ${event.type}`);
          if ('target' in event && event.target) {
            const target = event.target as any;
            if (target.readyState !== undefined) eventProps.push(`readyState: ${target.readyState}`);
            if (target.url) eventProps.push(`url: ${target.url}`);
          }
          if ('message' in event) eventProps.push(`message: ${event.message}`);
          if ('error' in event) eventProps.push(`error: ${event.error}`);
          
          errorDetails = eventProps.length > 0 ? eventProps.join(', ') : 'Event object with no extractable details';
        } else {
          errorDetails = `Event type: ${typeof event}, value: ${String(event)}`;
        }
      } catch (extractError) {
        errorDetails = `Error extracting details: ${extractError instanceof Error ? extractError.message : String(extractError)}`;
      }
      
      console.error('WebSocket connection error:', {
        errorDetails,
        readyState: wsConnection?.readyState,
        url: wsConnection?.url,
        timestamp: new Date().toISOString(),
        reconnectAttempts
      });
      
      updateConnectionStatus('error');
      
      // Only attempt to reconnect if not manually disconnected and haven't exceeded max attempts
      if (!isManualDisconnect && reconnectAttempts < maxReconnectAttempts) {
        scheduleReconnect(userId, userName, channelId);
      } else if (reconnectAttempts >= maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        updateConnectionStatus('failed');
      }
    };
    
    wsConnection.onclose = (event) => {
      console.log('WebSocket connection closed:', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean
      });
      
      wsConnection = null;
      
      // Update status based on close reason
      if (event.code === 1000) {
        updateConnectionStatus('disconnected');
      } else {
        updateConnectionStatus('error');
      }
      
      // Only attempt to reconnect if it wasn't a manual close and we haven't exceeded max attempts
      if (!isManualDisconnect && event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
        scheduleReconnect(userId, userName, channelId);
      }
    };
    
    return wsConnection;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('Failed to create WebSocket connection:', {
      errorMessage,
      errorStack,
      timestamp: new Date().toISOString()
    });
    
    updateConnectionStatus('error');
    
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
  
  const delay = reconnectDelay * Math.min(reconnectAttempts + 1, 5); // Exponential backoff with cap
  
  reconnectTimeout = setTimeout(() => {
    reconnectAttempts++;
    console.log(`Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts}) in ${delay}ms`);
    updateConnectionStatus('reconnecting');
    connectWebSocket(userId, userName, channelId);
  }, delay);
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
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error sending leave message:', { errorMessage });
    }
    
    wsConnection.close(1000, 'User disconnecting');
  }
  
  wsConnection = null;
  reconnectAttempts = 0;
  updateConnectionStatus('disconnected');
};

export const sendWebSocketMessage = (message: any) => {
  if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
    try {
      console.log('Sending WebSocket message:', message);
      wsConnection.send(JSON.stringify(message));
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error sending WebSocket message:', { errorMessage, message });
      return false;
    }
  } else {
    console.warn('WebSocket not connected, cannot send message. Status:', getWebSocketStatus());
    return false;
  }
};

export const getWebSocketConnection = () => wsConnection;

export const getWebSocketStatus = () => {
  if (!wsConnection) return currentStatus;
  
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

// Reset connection state (useful for testing or manual resets)
export const resetWebSocketConnection = () => {
  isManualDisconnect = false;
  reconnectAttempts = 0;
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  updateConnectionStatus('disconnected');
};