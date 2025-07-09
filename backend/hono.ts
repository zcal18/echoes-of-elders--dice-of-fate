import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { upgradeWebSocket } from "hono/cloudflare-workers";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

// app will be mounted at /api
const app = new Hono();

// Enable CORS for all routes
app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "x-user-id", "x-user-name"],
}));

// WebSocket for real-time features
const connectedClients = new Map<string, any>();
const userChannels = new Map<string, string>();
const pvpQueue = new Map<string, any>();
const guildBattles = new Map<string, any>();

// Connection health monitoring
const connectionHealth = new Map<string, { lastPing: number; isHealthy: boolean }>();
const PING_INTERVAL = 30000; // 30 seconds
const HEALTH_CHECK_INTERVAL = 60000; // 1 minute

// Periodic health check
setInterval(() => {
  const now = Date.now();
  for (const [userId, health] of connectionHealth.entries()) {
    if (now - health.lastPing > PING_INTERVAL * 2) {
      health.isHealthy = false;
      console.log(`User ${userId} connection marked as unhealthy`);
      
      // Clean up unhealthy connections
      const client = connectedClients.get(userId);
      if (client && client.readyState !== WebSocket.OPEN) {
        console.log(`Cleaning up dead connection for user ${userId}`);
        connectedClients.delete(userId);
        userChannels.delete(userId);
        connectionHealth.delete(userId);
        pvpQueue.delete(userId);
      }
    }
  }
}, HEALTH_CHECK_INTERVAL);

app.get("/ws", upgradeWebSocket((c) => {
  return {
    onMessage: (event, ws) => {
      try {
        const data = JSON.parse(event.data.toString());
        console.log('WebSocket message received:', data);
        
        // Update connection health
        if (data.userId) {
          connectionHealth.set(data.userId, {
            lastPing: Date.now(),
            isHealthy: true
          });
        }
        
        switch (data.type) {
          case 'ping':
            // Respond to ping with pong
            try {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                  type: 'pong',
                  timestamp: Date.now()
                }));
              }
            } catch (error) {
              console.error('Error sending pong:', error instanceof Error ? error.message : String(error));
            }
            break;
            
          case 'join':
            console.log(`User ${data.userName} (${data.userId}) joining channel ${data.channelId}`);
            
            // Clean up any existing connection for this user
            const existingClient = connectedClients.get(data.userId);
            if (existingClient && existingClient !== ws) {
              try {
                if (existingClient.readyState === WebSocket.OPEN) {
                  existingClient.close(1000, 'New connection established');
                }
              } catch (error) {
                console.error('Error closing existing connection:', error instanceof Error ? error.message : String(error));
              }
            }
            
            connectedClients.set(data.userId, ws);
            userChannels.set(data.userId, data.channelId);
            connectionHealth.set(data.userId, {
              lastPing: Date.now(),
              isHealthy: true
            });
            
            // Broadcast user joined to channel
            broadcastToChannel(data.channelId, {
              type: 'userJoined',
              userId: data.userId,
              userName: data.userName
            }, data.userId);
            
            // Send confirmation to user
            try {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                  type: 'joinConfirmed',
                  channelId: data.channelId,
                  message: `Successfully joined ${data.channelId}`,
                  connectedUsers: connectedClients.size
                }));
              }
            } catch (sendError) {
              console.error('Error sending join confirmation:', sendError instanceof Error ? sendError.message : String(sendError));
            }
            break;
            
          case 'leave':
            console.log(`User ${data.userId} leaving`);
            const userChannel = userChannels.get(data.userId);
            connectedClients.delete(data.userId);
            userChannels.delete(data.userId);
            connectionHealth.delete(data.userId);
            
            // Broadcast user left to their channel
            if (userChannel) {
              broadcastToChannel(userChannel, {
                type: 'userLeft',
                userId: data.userId
              }, data.userId);
            }
            break;
            
          case 'message':
            console.log(`Broadcasting message from ${data.message.sender} to channel ${data.channelId}`);
            
            // Validate message data
            if (!data.message || !data.message.sender || !data.channelId) {
              console.error('Invalid message data:', data);
              sendErrorToClient(ws, 'Invalid message format');
              break;
            }
            
            // Broadcast message to all users in the channel except sender
            broadcastToChannel(data.channelId, {
              type: 'message',
              message: data.message
            }, data.message.senderId || data.message.sender);
            break;
            
          case 'switchChannel':
            console.log(`User ${data.userId} switching to channel ${data.channelId}`);
            const oldChannel = userChannels.get(data.userId);
            userChannels.set(data.userId, data.channelId);
            
            // Notify old channel that user left
            if (oldChannel && oldChannel !== data.channelId) {
              broadcastToChannel(oldChannel, {
                type: 'userLeft',
                userId: data.userId
              }, data.userId);
            }
            
            // Notify new channel that user joined
            broadcastToChannel(data.channelId, {
              type: 'userJoined',
              userId: data.userId
            }, data.userId);
            break;

          // PVP Queue Management
          case 'joinPvpQueue':
            if (!data.userId || !data.userName) {
              sendErrorToClient(ws, 'Missing user information for PVP queue');
              break;
            }
            
            pvpQueue.set(data.userId, {
              userId: data.userId,
              userName: data.userName,
              level: data.level || 1,
              ranking: data.ranking || 1000,
              queueTime: Date.now()
            });
            
            // Broadcast queue update
            broadcastToAll({
              type: 'pvpQueueUpdate',
              queueSize: pvpQueue.size
            });
            
            // Try to find a match
            findPvpMatch(data.userId);
            break;
            
          case 'leavePvpQueue':
            pvpQueue.delete(data.userId);
            broadcastToAll({
              type: 'pvpQueueUpdate',
              queueSize: pvpQueue.size
            });
            break;

          // Guild Battle Management
          case 'initiateGuildBattle':
            if (!data.territoryId || !data.attackingGuild || !data.userId) {
              sendErrorToClient(ws, 'Missing required data for guild battle');
              break;
            }
            
            const battleId = `battle_${Date.now()}`;
            guildBattles.set(battleId, {
              id: battleId,
              territoryId: data.territoryId,
              attackingGuild: data.attackingGuild,
              defendingGuild: data.defendingGuild,
              attackers: [data.userId],
              defenders: [],
              status: 'recruiting',
              startTime: Date.now() + 300000, // 5 minutes to recruit
              maxParticipants: 3
            });
            
            // Notify guild members
            broadcastToGuild(data.attackingGuild.id, {
              type: 'guildBattleInitiated',
              battle: guildBattles.get(battleId)
            });
            
            if (data.defendingGuild) {
              broadcastToGuild(data.defendingGuild.id, {
                type: 'guildBattleChallenge',
                battle: guildBattles.get(battleId)
              });
            }
            break;
            
          case 'joinGuildBattle':
            const battle = guildBattles.get(data.battleId);
            if (battle && battle.status === 'recruiting') {
              if (data.side === 'attacker' && battle.attackers.length < 3) {
                battle.attackers.push(data.userId);
              } else if (data.side === 'defender' && battle.defenders.length < 3) {
                battle.defenders.push(data.userId);
              }
              
              // Broadcast battle update
              broadcastToGuildBattle(data.battleId, {
                type: 'guildBattleUpdate',
                battle
              });
              
              // Start battle if both sides have participants
              if (battle.attackers.length > 0 && battle.defenders.length > 0) {
                startGuildBattle(data.battleId);
              }
            }
            break;
            
          case 'guildBattleAction':
            handleGuildBattleAction(data);
            break;
            
          default:
            console.log('Unknown WebSocket message type:', data.type);
            sendErrorToClient(ws, `Unknown message type: ${data.type}`);
        }
      } catch (error) {
        console.error('WebSocket message processing error:', {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          data: event.data
        });
        
        sendErrorToClient(ws, 'Failed to process message');
      }
    },
    onClose: (event, ws) => {
      console.log('WebSocket connection closed:', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean
      });
      
      // Find and remove disconnected user
      for (const [userId, client] of connectedClients.entries()) {
        if (client === ws) {
          const channelId = userChannels.get(userId);
          console.log(`Cleaning up disconnected user ${userId} from channel ${channelId}`);
          
          connectedClients.delete(userId);
          userChannels.delete(userId);
          connectionHealth.delete(userId);
          pvpQueue.delete(userId);
          
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
      console.error('WebSocket error occurred:', {
        type: event.type,
        target: event.target?.constructor?.name || 'Unknown',
        timestamp: new Date().toISOString()
      });
      
      sendErrorToClient(ws, 'WebSocket connection error occurred');
    }
  };
}));

function sendErrorToClient(ws: any, message: string) {
  try {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'error',
        message,
        timestamp: Date.now()
      }));
    }
  } catch (sendError) {
    console.error('Failed to send error message:', sendError instanceof Error ? sendError.message : String(sendError));
  }
}

function broadcastToChannel(channelId: string, message: any, excludeUserId?: string) {
  console.log(`Broadcasting to channel ${channelId}:`, message, `(excluding ${excludeUserId})`);
  let broadcastCount = 0;
  let failedConnections: string[] = [];
  
  for (const [userId, ws] of connectedClients.entries()) {
    const userChannelId = userChannels.get(userId);
    if (userChannelId === channelId && userId !== excludeUserId) {
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(message));
          broadcastCount++;
        } else {
          failedConnections.push(userId);
        }
      } catch (error) {
        console.error(`Error broadcasting to user ${userId}:`, error instanceof Error ? error.message : String(error));
        failedConnections.push(userId);
      }
    }
  }
  
  // Clean up failed connections
  failedConnections.forEach(userId => {
    console.log(`Removing dead connection for user ${userId}`);
    connectedClients.delete(userId);
    userChannels.delete(userId);
    connectionHealth.delete(userId);
  });
  
  console.log(`Broadcast sent to ${broadcastCount} users in channel ${channelId}, cleaned up ${failedConnections.length} dead connections`);
}

function broadcastToAll(message: any) {
  console.log('Broadcasting to all users:', message);
  let broadcastCount = 0;
  let failedConnections: string[] = [];
  
  for (const [userId, ws] of connectedClients.entries()) {
    try {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
        broadcastCount++;
      } else {
        failedConnections.push(userId);
      }
    } catch (error) {
      console.error(`Error broadcasting to user ${userId}:`, error instanceof Error ? error.message : String(error));
      failedConnections.push(userId);
    }
  }
  
  // Clean up failed connections
  failedConnections.forEach(userId => {
    console.log(`Removing dead connection for user ${userId}`);
    connectedClients.delete(userId);
    userChannels.delete(userId);
    connectionHealth.delete(userId);
  });
  
  console.log(`Broadcast sent to ${broadcastCount} users, cleaned up ${failedConnections.length} dead connections`);
}

function broadcastToGuild(guildId: string, message: any) {
  // This would need guild member lookup in a real implementation
  // For now, broadcast to all connected users with guild context
  broadcastToAll({
    ...message,
    guildId
  });
}

function broadcastToGuildBattle(battleId: string, message: any) {
  const battle = guildBattles.get(battleId);
  if (battle) {
    const participants = [...battle.attackers, ...battle.defenders];
    let broadcastCount = 0;
    let failedConnections: string[] = [];
    
    participants.forEach(userId => {
      const ws = connectedClients.get(userId);
      if (ws) {
        try {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
            broadcastCount++;
          } else {
            failedConnections.push(userId);
          }
        } catch (error) {
          console.error('Error broadcasting to guild battle:', error instanceof Error ? error.message : String(error));
          failedConnections.push(userId);
        }
      }
    });
    
    // Clean up failed connections
    failedConnections.forEach(userId => {
      connectedClients.delete(userId);
      userChannels.delete(userId);
      connectionHealth.delete(userId);
    });
    
    console.log(`Guild battle broadcast sent to ${broadcastCount} participants, cleaned up ${failedConnections.length} dead connections`);
  }
}

function findPvpMatch(userId: string) {
  const player = pvpQueue.get(userId);
  if (!player) return;
  
  // Find best match based on ranking
  let bestMatch = null;
  let bestRankingDiff = Infinity;
  
  for (const [otherUserId, otherPlayer] of pvpQueue.entries()) {
    if (otherUserId !== userId) {
      const rankingDiff = Math.abs(player.ranking - otherPlayer.ranking);
      if (rankingDiff < bestRankingDiff) {
        bestRankingDiff = rankingDiff;
        bestMatch = otherPlayer;
      }
    }
  }
  
  if (bestMatch) {
    // Create match
    const matchId = `match_${Date.now()}`;
    const match = {
      id: matchId,
      player1: player,
      player2: bestMatch,
      startTime: Date.now(),
      status: 'active'
    };
    
    // Remove players from queue
    pvpQueue.delete(userId);
    pvpQueue.delete(bestMatch.userId);
    
    // Notify players
    const player1Ws = connectedClients.get(userId);
    const player2Ws = connectedClients.get(bestMatch.userId);
    
    if (player1Ws && player1Ws.readyState === WebSocket.OPEN) {
      try {
        player1Ws.send(JSON.stringify({
          type: 'pvpMatchFound',
          match,
          yourSide: 'player1'
        }));
      } catch (error) {
        console.error('Error notifying player 1:', error instanceof Error ? error.message : String(error));
      }
    }
    
    if (player2Ws && player2Ws.readyState === WebSocket.OPEN) {
      try {
        player2Ws.send(JSON.stringify({
          type: 'pvpMatchFound',
          match,
          yourSide: 'player2'
        }));
      } catch (error) {
        console.error('Error notifying player 2:', error instanceof Error ? error.message : String(error));
      }
    }
    
    // Broadcast queue update
    broadcastToAll({
      type: 'pvpQueueUpdate',
      queueSize: pvpQueue.size
    });
  }
}

function startGuildBattle(battleId: string) {
  const battle = guildBattles.get(battleId);
  if (battle) {
    battle.status = 'active';
    battle.currentTurn = battle.attackers[0];
    
    broadcastToGuildBattle(battleId, {
      type: 'guildBattleStarted',
      battle
    });
  }
}

function handleGuildBattleAction(data: any) {
  const battle = guildBattles.get(data.battleId);
  if (battle && battle.status === 'active') {
    // Process battle action (attack, defend, etc.)
    // This would contain the actual battle logic
    
    broadcastToGuildBattle(data.battleId, {
      type: 'guildBattleAction',
      action: data.action,
      battle
    });
  }
}

// Mount tRPC router at /trpc
app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  })
);

// Simple health check endpoint
app.get("/", (c) => {
  return c.json({ 
    status: "ok", 
    message: "API is running",
    connectedUsers: connectedClients.size,
    activeChannels: new Set(userChannels.values()).size,
    healthyConnections: Array.from(connectionHealth.values()).filter(h => h.isHealthy).length,
    pvpQueueSize: pvpQueue.size,
    activeBattles: guildBattles.size,
    timestamp: new Date().toISOString()
  });
});

// WebSocket status endpoint
app.get("/ws-status", (c) => {
  const healthyConnections = Array.from(connectionHealth.entries()).filter(([_, health]) => health.isHealthy);
  const unhealthyConnections = Array.from(connectionHealth.entries()).filter(([_, health]) => !health.isHealthy);
  
  return c.json({
    totalConnections: connectedClients.size,
    healthyConnections: healthyConnections.length,
    unhealthyConnections: unhealthyConnections.length,
    activeChannels: Array.from(new Set(userChannels.values())),
    pvpQueue: pvpQueue.size,
    guildBattles: guildBattles.size,
    connectionDetails: Object.fromEntries(
      Array.from(connectionHealth.entries()).map(([userId, health]) => [
        userId,
        {
          isHealthy: health.isHealthy,
          lastPing: new Date(health.lastPing).toISOString(),
          channel: userChannels.get(userId)
        }
      ])
    )
  });
});

export default app;