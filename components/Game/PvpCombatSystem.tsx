import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import colors from '@/constants/colors';
import { useGameStore } from '@/hooks/useGameStore';
import { PvpPlayer } from '@/types/game';

export const PvpCombatSystem = () => {
  const { 
    activeCharacter, 
    pvpQueue, 
    activePvpMatch, 
    pvpRanking,
    joinPvpQueue, 
    leavePvpQueue, 
    startPvpMatch, 
    endPvpMatch 
  } = useGameStore();
  
  const [isInQueue, setIsInQueue] = useState(false);
  const [queueTime, setQueueTime] = useState(0);
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  
  // WebSocket connection for real-time PVP
  useEffect(() => {
    if (activeCharacter) {
      const ws = new WebSocket('ws://localhost:3000/api/ws');
      
      ws.onopen = () => {
        console.log('PVP WebSocket connected');
        ws.send(JSON.stringify({
          type: 'join',
          userId: activeCharacter.id,
          userName: activeCharacter.name,
          channelId: 'pvp'
        }));
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'pvpMatchFound':
            if (data.match.player1.id === activeCharacter.id || data.match.player2.userId === activeCharacter.id) {
              // Handle match found
              setIsInQueue(false);
              setQueueTime(0);
              Alert.alert('Match Found!', `You are matched against ${data.match.player2.playerName || data.match.player1.name}!`);
            }
            break;
            
          case 'pvpQueueUpdate':
            // Update queue size display
            break;
        }
      };
      
      ws.onclose = () => {
        console.log('PVP WebSocket disconnected');
      };
      
      setWebsocket(ws);
      
      return () => {
        ws.close();
      };
    }
  }, [activeCharacter]);
  
  useEffect(() => {
    if (!activeCharacter) return;
    
    const playerInQueue = pvpQueue.some(p => p.playerId === activeCharacter.id);
    setIsInQueue(playerInQueue);
    
    if (playerInQueue) {
      const playerQueueEntry = pvpQueue.find(p => p.playerId === activeCharacter.id);
      if (playerQueueEntry) {
        const elapsed = Math.floor((Date.now() - playerQueueEntry.queueTime) / 1000);
        setQueueTime(elapsed);
      }
    } else {
      setQueueTime(0);
    }
  }, [pvpQueue, activeCharacter]);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isInQueue) {
      interval = setInterval(() => {
        setQueueTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isInQueue]);
  
  if (!activeCharacter) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No character selected</Text>
      </View>
    );
  }
  
  // Check if character is fainted
  const isCharacterFainted = () => {
    return activeCharacter.health.current <= 0;
  };
  
  const handleJoinQueue = () => {
    // Check if character is fainted
    if (isCharacterFainted()) {
      Alert.alert(
        'Character Fainted',
        'Your character has fainted and cannot battle. Use a revive potion to restore them.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    const success = joinPvpQueue();
    if (success) {
      setIsInQueue(true);
      setQueueTime(0);
      
      // Send WebSocket message to join PVP queue
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify({
          type: 'joinPvpQueue',
          userId: activeCharacter.id,
          userName: activeCharacter.name,
          level: activeCharacter.level,
          ranking: pvpRanking
        }));
      }
    }
  };
  
  const handleLeaveQueue = () => {
    leavePvpQueue();
    setIsInQueue(false);
    setQueueTime(0);
    
    // Send WebSocket message to leave PVP queue
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify({
        type: 'leavePvpQueue',
        userId: activeCharacter.id
      }));
    }
  };
  
  const handleAttack = () => {
    if (!activePvpMatch || activePvpMatch.currentTurn !== activeCharacter.id) return;
    
    // Check if character is fainted
    if (isCharacterFainted()) {
      Alert.alert(
        'Character Fainted',
        'Your character has fainted and cannot perform actions. Use a revive potion to restore them.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Simulate attack damage
    const damage = Math.floor(Math.random() * 20) + 10;
    
    Alert.alert(
      'Attack Result',
      `You deal ${damage} damage to ${activePvpMatch.player2.playerName}!`,
      [
        {
          text: 'Continue',
          onPress: () => {
            // Check if opponent is defeated (simplified)
            if (Math.random() < 0.3) { // 30% chance to win for demo
              endPvpMatch(activeCharacter.id);
            } else {
              // Switch turns (in real implementation, this would be handled by server)
              // For demo, we'll just show opponent's turn
              setTimeout(() => {
                Alert.alert('Opponent Turn', `${activePvpMatch.player2.playerName} attacks you!`);
              }, 1000);
            }
          }
        }
      ]
    );
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getRankingTier = (ranking: number) => {
    if (ranking >= 2000) return { name: 'Grandmaster', color: '#FFD700' };
    if (ranking >= 1500) return { name: 'Master', color: '#C0C0C0' };
    if (ranking >= 1200) return { name: 'Diamond', color: '#B9F2FF' };
    if (ranking >= 1000) return { name: 'Gold', color: '#FFD700' };
    if (ranking >= 800) return { name: 'Silver', color: '#C0C0C0' };
    return { name: 'Bronze', color: '#CD7F32' };
  };
  
  const tier = getRankingTier(pvpRanking);
  
  if (activePvpMatch) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>⚔️ PVP Battle Arena</Text>
        
        <View style={styles.matchContainer}>
          <View style={styles.matchHeader}>
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{activeCharacter.name}</Text>
              <Text style={styles.playerLevel}>Level {activeCharacter.level}</Text>
              <View style={styles.healthBar}>
                <View style={[
                  styles.healthFill, 
                  { 
                    width: `${activeCharacter.health.max ? 
                      (activeCharacter.health.current / activeCharacter.health.max) * 100 : 0}%` 
                  }
                ]} />
              </View>
              {isCharacterFainted() && (
                <Text style={styles.faintedStatus}>💀 FAINTED</Text>
              )}
            </View>
            
            <Text style={styles.vsText}>VS</Text>
            
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{activePvpMatch.player2.playerName}</Text>
              <Text style={styles.playerLevel}>Level {activePvpMatch.player2.level}</Text>
              <View style={styles.healthBar}>
                <View style={[styles.healthFill, { width: '100%' }]} />
              </View>
            </View>
          </View>
          
          <View style={styles.battleActions}>
            <TouchableOpacity 
              style={[
                styles.actionButton,
                (activePvpMatch.currentTurn !== activeCharacter.id || isCharacterFainted()) && styles.disabledButton
              ]}
              onPress={handleAttack}
              disabled={activePvpMatch.currentTurn !== activeCharacter.id || isCharacterFainted()}
            >
              <Text style={styles.actionButtonText}>⚔️ Attack</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.actionButton, 
                styles.defendButton,
                (activePvpMatch.currentTurn !== activeCharacter.id || isCharacterFainted()) && styles.disabledButton
              ]}
              disabled={activePvpMatch.currentTurn !== activeCharacter.id || isCharacterFainted()}
            >
              <Text style={styles.actionButtonText}>🛡️ Defend</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.actionButton, 
                styles.skillButton,
                (activePvpMatch.currentTurn !== activeCharacter.id || isCharacterFainted()) && styles.disabledButton
              ]}
              disabled={activePvpMatch.currentTurn !== activeCharacter.id || isCharacterFainted()}
            >
              <Text style={styles.actionButtonText}>✨ Skill</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.turnIndicator}>
            <Text style={styles.turnText}>
              {isCharacterFainted() 
                ? 'Character Fainted - Use Revive Potion'
                : activePvpMatch.currentTurn === activeCharacter.id 
                  ? 'Your Turn' 
                  : `${activePvpMatch.player2.playerName}'s Turn`
              }
            </Text>
          </View>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚔️ PVP Card Battle Arena</Text>
      
      <View style={styles.rankingContainer}>
        <Text style={styles.rankingTitle}>Your Ranking</Text>
        <View style={styles.rankingInfo}>
          <Text style={[styles.tierName, { color: tier.color }]}>{tier.name}</Text>
          <Text style={styles.rankingPoints}>{pvpRanking} RP</Text>
        </View>
      </View>
      
      {/* Character Status Warning */}
      {isCharacterFainted() && (
        <View style={styles.faintedWarning}>
          <Text style={styles.faintedWarningText}>
            ⚠️ Your character has fainted! Use a revive potion from your inventory to participate in PVP battles.
          </Text>
        </View>
      )}
      
      {isInQueue ? (
        <View style={styles.queueContainer}>
          <Text style={styles.queueTitle}>🔍 Searching for Opponent</Text>
          <Text style={styles.queueTime}>Queue Time: {formatTime(queueTime)}</Text>
          <Text style={styles.queueInfo}>Players in queue: {pvpQueue.length}</Text>
          <Text style={styles.matchmakingInfo}>⚡ Fast matchmaking - battles start quickly!</Text>
          
          <TouchableOpacity style={styles.leaveQueueButton} onPress={handleLeaveQueue}>
            <Text style={styles.leaveQueueText}>Leave Queue</Text>
          </TouchableOpacity>
          
          <View style={styles.queueTips}>
            <Text style={styles.tipsTitle}>💡 Battle Tips:</Text>
            <Text style={styles.tip}>• Use strategy cards to gain advantages</Text>
            <Text style={styles.tip}>• Time your attacks and defenses carefully</Text>
            <Text style={styles.tip}>• All levels can compete - fair matchmaking!</Text>
            <Text style={styles.tip}>• Win matches to increase your ranking</Text>
            <Text style={styles.tip}>• PVP rewards are more generous than NPC battles</Text>
          </View>
        </View>
      ) : (
        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={[
              styles.joinQueueButton,
              isCharacterFainted() && styles.disabledButton
            ]} 
            onPress={handleJoinQueue}
            disabled={isCharacterFainted()}
          >
            <Text style={styles.joinQueueText}>
              {isCharacterFainted() ? '💀 Character Fainted' : '🎯 Join Ranked Queue'}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>🎮 PVP Features:</Text>
            <Text style={styles.feature}>• Real-time strategic card battles</Text>
            <Text style={styles.feature}>• Fair matchmaking for all levels</Text>
            <Text style={styles.feature}>• Fast queue times (5-10 seconds)</Text>
            <Text style={styles.feature}>• Generous rewards for victories</Text>
            <Text style={styles.feature}>• Ranking-based opponent matching</Text>
            <Text style={styles.feature}>• Seasonal rewards and titles</Text>
          </View>
          
          <ScrollView style={styles.leaderboardContainer}>
            <Text style={styles.leaderboardTitle}>🏆 Top Players</Text>
            {[
              { name: 'DragonSlayer', ranking: 2150, tier: 'Grandmaster' },
              { name: 'ShadowMage', ranking: 2089, tier: 'Grandmaster' },
              { name: 'IronWill', ranking: 1987, tier: 'Master' },
              { name: 'StormBringer', ranking: 1876, tier: 'Master' },
              { name: 'CrystalGuard', ranking: 1654, tier: 'Master' },
            ].map((player, index) => (
              <View key={`leaderboard-${index}`} style={styles.leaderboardEntry}>
                <Text style={styles.leaderboardRank}>#{index + 1}</Text>
                <Text style={styles.leaderboardName}>{player.name}</Text>
                <Text style={styles.leaderboardTier}>{player.tier}</Text>
                <Text style={styles.leaderboardPoints}>{player.ranking} RP</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  faintedWarning: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  faintedWarningText: {
    color: '#d32f2f',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  rankingContainer: {
    backgroundColor: colors.surfaceDark,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  rankingTitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  rankingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tierName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  rankingPoints: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '600',
  },
  queueContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  queueTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 16,
  },
  queueTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  queueInfo: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  matchmakingInfo: {
    fontSize: 14,
    color: colors.success,
    marginBottom: 24,
    fontWeight: 'bold',
  },
  leaveQueueButton: {
    backgroundColor: colors.error,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  leaveQueueText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  queueTips: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    padding: 16,
    width: '100%',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  tip: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  menuContainer: {
    flex: 1,
  },
  joinQueueButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  joinQueueText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 18,
  },
  disabledButton: {
    backgroundColor: colors.surfaceDark,
    opacity: 0.6,
  },
  featuresContainer: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  feature: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  leaderboardContainer: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    padding: 12,
  },
  leaderboardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  leaderboardEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceDark,
  },
  leaderboardRank: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    width: 30,
  },
  leaderboardName: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  leaderboardTier: {
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: 8,
  },
  leaderboardPoints: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  matchContainer: {
    flex: 1,
    backgroundColor: colors.surfaceDark,
    borderRadius: 12,
    padding: 16,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  playerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  playerLevel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  healthBar: {
    width: '80%',
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  healthFill: {
    height: '100%',
    backgroundColor: colors.health,
  },
  faintedStatus: {
    fontSize: 12,
    color: colors.error,
    fontWeight: 'bold',
  },
  vsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginHorizontal: 16,
  },
  battleActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  defendButton: {
    backgroundColor: colors.secondary,
  },
  skillButton: {
    backgroundColor: colors.warning,
  },
  actionButtonText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 14,
  },
  turnIndicator: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  turnText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
});