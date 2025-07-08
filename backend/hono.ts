import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { upgradeWebSocket } from "hono/cloudflare-workers";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

// app will be mounted at /api
const app = new Hono();

// Enable CORS for all routes
app.use("*", cors());

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
        
        switch (data.type) {
          case 'join':
            connectedClients.set(data.userId, ws);
            userChannels.set(data.userId, data.channelId);
            
            // Broadcast user joined
            broadcastToChannel(data.channelId, {
              type: 'userJoined',
              userId: data.userId,
              userName: data.userName
            });
            break;
            
          case 'leave':
            connectedClients.delete(data.userId);
            userChannels.delete(data.userId);
            
            // Broadcast user left
            broadcastToChannel(data.channelId, {
              type: 'userLeft',
              userId: data.userId
            });
            break;
            
          case 'message':
            // Broadcast message to all users in the channel
            broadcastToChannel(data.channelId, {
              type: 'message',
              message: data.message
            });
            break;
            
          case 'switchChannel':
            userChannels.set(data.userId, data.channelId);
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
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        // Send error back to client
        try {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Failed to process message'
          }));
        } catch (sendError) {
          console.error('Failed to send error message:', sendError);
        }
      }
    },
    onClose: (event, ws) => {
      console.log('WebSocket connection closed');
      // Find and remove disconnected user
      for (const [userId, client] of connectedClients.entries()) {
        if (client === ws) {
          const channelId = userChannels.get(userId);
          connectedClients.delete(userId);
          userChannels.delete(userId);
          pvpQueue.delete(userId);
          
          if (channelId) {
            broadcastToChannel(channelId, {
              type: 'userLeft',
              userId
            });
          }
          break;
        }
      }
    },
    onError: (event, ws) => {
      console.error('WebSocket error:', event);
      // Send error notification to client if connection is still open
      try {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'WebSocket connection error occurred'
        }));
      } catch (sendError) {
        console.error('Failed to send error notification:', sendError);
      }
    }
  };
}));

function broadcastToChannel(channelId: string, message: any) {
  for (const [userId, ws] of connectedClients.entries()) {
    const userChannelId = userChannels.get(userId);
    if (userChannelId === channelId) {
      try {
        ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error broadcasting to channel:', error);
        // Remove dead connection
        connectedClients.delete(userId);
        userChannels.delete(userId);
      }
    }
  }
}

function broadcastToAll(message: any) {
  for (const [userId, ws] of connectedClients.entries()) {
    try {
      ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error broadcasting to all:', error);
      // Remove dead connection
      connectedClients.delete(userId);
      userChannels.delete(userId);
    }
  }
}

function broadcastToGuild(guildId: string, message: any) {
  // This would need guild member lookup in a real implementation
  // For now, broadcast to all connected users
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
          ws.send(JSON.stringify(message));
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
    
    if (player1Ws) {
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
    
    if (player2Ws) {
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
  return c.json({ status: "ok", message: "API is running" });
});

export default app;