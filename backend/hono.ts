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

app.get("/ws", upgradeWebSocket((c) => {
  return {
    onMessage: (event, ws) => {
      try {
        const data = JSON.parse(event.data.toString());
        console.log('WebSocket message received:', data);
        
        switch (data.type) {
          case 'join':
            console.log(`User ${data.userName} (${data.userId}) joining channel ${data.channelId}`);
            connectedClients.set(data.userId, ws);
            userChannels.set(data.userId, data.channelId);
            
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
                  message: `Successfully joined ${data.channelId}`
                }));
              }
            } catch (error) {
              console.error('Error sending join confirmation:', error);
            }
            break;
            
          case 'leave':
            console.log(`User ${data.userId} leaving`);
            const userChannel = userChannels.get(data.userId);
            connectedClients.delete(data.userId);
            userChannels.delete(data.userId);
            
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
            pvpQueue.set(data.userId, {
              userId: data.userId,
              userName: data.userName,
              level: data.level,
              ranking: data.ranking,
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
            // Send error back to client
            try {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                  type: 'error',
                  message: `Unknown message type: ${data.type}`
                }));
              }
            } catch (error) {
              console.error('Error sending unknown type error:', error);
            }
        }
      } catch (error) {
        console.error('WebSocket message processing error:', {
          error: error.message,
          stack: error.stack,
          data: event.data
        });
        
        // Send error back to client
        try {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Failed to process message'
            }));
          }
        } catch (sendError) {
          console.error('Failed to send error message:', sendError);
        }
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
      console.error('WebSocket error occurred:', event);
      
      // Send error notification to client if connection is still open
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'WebSocket connection error occurred'
          }));
        }
      } catch (sendError) {
        console.error('Failed to send error notification:', sendError);
      }
    }
  };
}));

function broadcastToChannel(channelId: string, message: any, excludeUserId?: string) {
  console.log(`Broadcasting to channel ${channelId}:`, message, `(excluding ${excludeUserId})`);
  let broadcastCount = 0;
  
  for (const [userId, ws] of connectedClients.entries()) {
    const userChannelId = userChannels.get(userId);
    if (userChannelId === channelId && userId !== excludeUserId) {
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(message));
          broadcastCount++;
        } else {
          // Remove dead connection
          console.log(`Removing dead connection for user ${userId}`);
          connectedClients.delete(userId);
          userChannels.delete(userId);
        }
      } catch (error) {
        console.error(`Error broadcasting to user ${userId}:`, error);
        // Remove dead connection
        connectedClients.delete(userId);
        userChannels.delete(userId);
      }
    }
  }
  
  console.log(`Broadcast sent to ${broadcastCount} users in channel ${channelId}`);
}

function broadcastToAll(message: any) {
  console.log('Broadcasting to all users:', message);
  let broadcastCount = 0;
  
  for (const [userId, ws] of connectedClients.entries()) {
    try {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
        broadcastCount++;
      } else {
        // Remove dead connection
        console.log(`Removing dead connection for user ${userId}`);
        connectedClients.delete(userId);
        userChannels.delete(userId);
      }
    } catch (error) {
      console.error(`Error broadcasting to user ${userId}:`, error);
      // Remove dead connection
      connectedClients.delete(userId);
      userChannels.delete(userId);
    }
  }
  
  console.log(`Broadcast sent to ${broadcastCount} users`);
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
    participants.forEach(userId => {
      const ws = connectedClients.get(userId);
      if (ws) {
        try {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
          } else {
            // Remove dead connection
            connectedClients.delete(userId);
            userChannels.delete(userId);
          }
        } catch (error) {
          console.error('Error broadcasting to guild battle:', error);
          // Remove dead connection
          connectedClients.delete(userId);
          userChannels.delete(userId);
        }
      }
    });
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
        console.error('Error notifying player 1:', error);
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
        console.error('Error notifying player 2:', error);
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
    timestamp: new Date().toISOString()
  });
});

export default app;