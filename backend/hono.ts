import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { upgradeWebSocket } from "hono/cloudflare-workers";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

const app = new Hono();

app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "x-user-id", "x-user-name"],
}));

// Simplified WebSocket management
const connectedClients = new Map<string, any>();
const userChannels = new Map<string, string>();

// Cleanup dead connections periodically
setInterval(() => {
  for (const [userId, ws] of connectedClients.entries()) {
    if (ws.readyState !== WebSocket.OPEN) {
      console.log(`Cleaning up dead connection: ${userId}`);
      connectedClients.delete(userId);
      userChannels.delete(userId);
    }
  }
}, 30000); // Every 30 seconds

app.get("/ws", upgradeWebSocket((c) => {
  return {
    onMessage: (event, ws) => {
      try {
        const data = JSON.parse(event.data.toString());
        console.log('WebSocket message:', data.type, data.userId);
        
        switch (data.type) {
          case 'join':
            handleUserJoin(data, ws);
            break;
            
          case 'leave':
            handleUserLeave(data.userId);
            break;
            
          case 'message':
            handleMessage(data);
            break;
            
          case 'switchChannel':
            handleChannelSwitch(data);
            break;
            
          case 'ping':
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
            }
            break;
            
          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        sendError(ws, 'Failed to process message');
      }
    },
    
    onClose: (event, ws) => {
      console.log('WebSocket closed:', event.code);
      
      // Find and remove disconnected user
      for (const [userId, client] of connectedClients.entries()) {
        if (client === ws) {
          const channelId = userChannels.get(userId);
          connectedClients.delete(userId);
          userChannels.delete(userId);
          
          if (channelId) {
            broadcastToChannel(channelId, {
              type: 'userLeft',
              userId
            }, userId);
          }
          break;
        }
      }
    },
    
    onError: (event, ws) => {
      console.error('WebSocket error:', event);
    }
  };
}));

function handleUserJoin(data: any, ws: any) {
  const { userId, userName, channelId } = data;
  
  // Clean up existing connection
  const existingClient = connectedClients.get(userId);
  if (existingClient && existingClient !== ws) {
    try {
      if (existingClient.readyState === WebSocket.OPEN) {
        existingClient.close(1000, 'New connection');
      }
    } catch (error) {
      console.error('Error closing existing connection:', error);
    }
  }
  
  connectedClients.set(userId, ws);
  userChannels.set(userId, channelId);
  
  // Notify channel
  broadcastToChannel(channelId, {
    type: 'userJoined',
    userId,
    userName
  }, userId);
  
  // Confirm join
  if (ws.readyState === WebSocket.OPEN) {
    try {
      ws.send(JSON.stringify({
        type: 'joinConfirmed',
        channelId,
        connectedUsers: connectedClients.size
      }));
    } catch (error) {
      console.error('Error sending join confirmation:', error);
    }
  }
}

function handleUserLeave(userId: string) {
  const channelId = userChannels.get(userId);
  connectedClients.delete(userId);
  userChannels.delete(userId);
  
  if (channelId) {
    broadcastToChannel(channelId, {
      type: 'userLeft',
      userId
    }, userId);
  }
}

function handleMessage(data: any) {
  const { channelId, message } = data;
  
  if (!message || !channelId) {
    console.error('Invalid message data');
    return;
  }
  
  broadcastToChannel(channelId, {
    type: 'message',
    message
  }, message.senderId);
}

function handleChannelSwitch(data: any) {
  const { userId, channelId } = data;
  const oldChannel = userChannels.get(userId);
  
  userChannels.set(userId, channelId);
  
  if (oldChannel && oldChannel !== channelId) {
    broadcastToChannel(oldChannel, {
      type: 'userLeft',
      userId
    }, userId);
  }
  
  broadcastToChannel(channelId, {
    type: 'userJoined',
    userId
  }, userId);
}

function broadcastToChannel(channelId: string, message: any, excludeUserId?: string) {
  let sent = 0;
  let failed = 0;
  
  for (const [userId, ws] of connectedClients.entries()) {
    if (userChannels.get(userId) === channelId && userId !== excludeUserId) {
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(message));
          sent++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`Broadcast error to ${userId}:`, error);
        failed++;
      }
    }
  }
  
  console.log(`Broadcast to ${channelId}: ${sent} sent, ${failed} failed`);
}

function sendError(ws: any, message: string) {
  try {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'error',
        message,
        timestamp: Date.now()
      }));
    }
  } catch (error) {
    console.error('Failed to send error:', error);
  }
}

app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  })
);

app.get("/", (c) => {
  return c.json({ 
    status: "ok", 
    connectedUsers: connectedClients.size,
    timestamp: new Date().toISOString()
  });
});

app.get("/ws-status", (c) => {
  return c.json({
    totalConnections: connectedClients.size,
    activeChannels: Array.from(new Set(userChannels.values())),
    connectionDetails: Object.fromEntries(
      Array.from(userChannels.entries()).map(([userId, channelId]) => [
        userId,
        { channel: channelId, connected: connectedClients.has(userId) }
      ])
    )
  });
});

export default app;