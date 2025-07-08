import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { Mail, ShoppingCart, User, Swords, Shield } from 'lucide-react-native';
import { useGameStore } from '@/hooks/useGameStore';
import colors from '@/constants/colors';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;
const GRID_SIZE = 8; // Reduced from 12 to 8
const CELL_SIZE = (screenWidth - 32) / GRID_SIZE;

export default function KingdomScreen() {
  const router = useRouter();
  const { 
    isAuthenticated, 
    activeCharacter, 
    territories, 
    guilds,
    guildBattles,
    activeGuildBattle,
    claimTerritory,
    unlockRoyalSpire,
    initiateGuildBattle,
    joinGuildBattle,
    startGuildBattle
  } = useGameStore();
  
  const [selectedTerritory, setSelectedTerritory] = useState<string | null>(null);
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  
  // WebSocket connection for real-time guild battles
  useEffect(() => {
    if (activeCharacter) {
      const ws = new WebSocket('ws://localhost:3000/api/ws');
      
      ws.onopen = () => {
        console.log('Kingdom WebSocket connected');
        ws.send(JSON.stringify({
          type: 'join',
          userId: activeCharacter.id,
          userName: activeCharacter.name,
          channelId: 'kingdom'
        }));
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'guildBattleInitiated':
            // Handle guild battle initiation
            break;
            
          case 'guildBattleChallenge':
            // Handle incoming guild battle challenge
            if (activeCharacter.guildId === data.battle.defendingGuild?.id) {
              Alert.alert(
                'Guild Battle Challenge!',
                `${data.battle.attackingGuild.name} is challenging your guild for ${data.battle.territoryId}!`,
                [
                  { text: 'Ignore', style: 'cancel' },
                  { 
                    text: 'Join Defense', 
                    onPress: () => joinGuildBattle(data.battle.id, 'defender')
                  }
                ]
              );
            }
            break;
            
          case 'guildBattleUpdate':
            // Handle battle updates
            break;
            
          case 'guildBattleStarted':
            // Handle battle start
            break;
        }
      };
      
      ws.onclose = () => {
        console.log('Kingdom WebSocket disconnected');
      };
      
      setWebsocket(ws);
      
      return () => {
        ws.close();
      };
    }
  }, [activeCharacter]);
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)');
    } else if (!activeCharacter) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, activeCharacter]);
  
  if (!isAuthenticated || !activeCharacter) {
    return null;
  }
  
  const getKingGuild = () => {
    // Check if any guild controls all claimable territories (excluding water and royal spire)
    const claimableTerritories = territories.filter(t => t.isClaimable !== false && !t.isRoyalSpire);
    const guildTerritoryCount: Record<string, number> = {};
    
    claimableTerritories.forEach(territory => {
      if (territory.controllingGuild) {
        guildTerritoryCount[territory.controllingGuild] = 
          (guildTerritoryCount[territory.controllingGuild] || 0) + 1;
      }
    });
    
    const totalClaimableTerritories = claimableTerritories.length;
    const kingGuildId = Object.keys(guildTerritoryCount).find(
      guildId => guildTerritoryCount[guildId] === totalClaimableTerritories
    );
    
    // If a guild controls all territories, unlock the Royal Spire
    if (kingGuildId) {
      unlockRoyalSpire();
    }
    
    // Check if the Royal Spire is controlled to determine the true king
    const royalSpire = territories.find(t => t.isRoyalSpire);
    if (royalSpire?.controllingGuild) {
      return guilds.find(g => g.id === royalSpire.controllingGuild);
    }
    
    return null;
  };
  
  const kingGuild = getKingGuild();
  const royalSpire = territories.find(t => t.isRoyalSpire);
  const isRoyalSpireUnlocked = royalSpire?.isClaimable !== false;
  
  const renderMapGrid = () => {
    const grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
    
    // Place territories on grid
    territories.forEach(territory => {
      const { x, y } = territory.position;
      if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
        grid[y][x] = territory;
      }
    });
    
    return grid.map((row, rowIndex) => (
      <View key={rowIndex} style={styles.gridRow}>
        {row.map((territory, colIndex) => (
          <TouchableOpacity
            key={`${rowIndex}-${colIndex}`}
            style={[
              styles.gridCell,
              territory && styles.territoryCell,
              territory?.type === 'water' && styles.waterCell,
              territory?.type === 'forest' && styles.forestCell,
              territory?.type === 'mountain' && styles.mountainCell,
              territory?.type === 'desert' && styles.desertCell,
              territory?.type === 'castle' && styles.castleCell,
              territory?.isRoyalSpire && styles.royalSpireCell,
              territory?.isRoyalSpire && !isRoyalSpireUnlocked && styles.lockedRoyalSpire,
              territory?.controllingGuild && styles.controlledCell,
              selectedTerritory === territory?.id && styles.selectedCell
            ]}
            onPress={() => territory && setSelectedTerritory(territory.id)}
          >
            {territory && (
              <View style={styles.territoryContent}>
                <Text style={[
                  styles.territoryName,
                  territory.type === 'water' && styles.waterText,
                  territory.type === 'forest' && styles.forestText,
                  territory.type === 'mountain' && styles.mountainText,
                  territory.type === 'desert' && styles.desertText,
                  territory.type === 'castle' && styles.castleText,
                  territory.isRoyalSpire && styles.royalText
                ]} numberOfLines={2}>
                  {territory.name}
                </Text>
                {territory.controllingGuild && (
                  <View style={[
                    styles.guildIndicator,
                    { backgroundColor: getGuildColor(territory.controllingGuild) }
                  ]} />
                )}
                {territory.isRoyalSpire && !isRoyalSpireUnlocked && (
                  <Text style={styles.territoryIcon}>🔒</Text>
                )}
                {territory.isRoyalSpire && isRoyalSpireUnlocked && (
                  <Text style={styles.territoryIcon}>👑</Text>
                )}
                {territory.type === 'water' && (
                  <Text style={styles.territoryIcon}>🌊</Text>
                )}
                {territory.type === 'forest' && (
                  <Text style={styles.territoryIcon}>🌲</Text>
                )}
                {territory.type === 'mountain' && (
                  <Text style={styles.territoryIcon}>⛰️</Text>
                )}
                {territory.type === 'desert' && (
                  <Text style={styles.territoryIcon}>🏜️</Text>
                )}
                {territory.type === 'castle' && (
                  <Text style={styles.territoryIcon}>🏰</Text>
                )}
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    ));
  };
  
  const getGuildColor = (guildId: string) => {
    // Generate consistent color for guild
    const guild = guilds.find(g => g.id === guildId);
    if (guild) {
      // Use clan tag to generate color
      const hash = guild.clanTag.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      const guildColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
      return guildColors[Math.abs(hash) % guildColors.length];
    }
    return '#FF6B6B';
  };
  
  const selectedTerritoryData = territories.find(t => t.id === selectedTerritory);
  const controllingGuild = selectedTerritoryData?.controllingGuild 
    ? guilds.find(g => g.id === selectedTerritoryData.controllingGuild)
    : null;
  
  const canClaimTerritory = () => {
    if (!selectedTerritoryData || !activeCharacter.guildId) return false;
    if (selectedTerritoryData.isClaimable === false) return false;
    if (selectedTerritoryData.isRoyalSpire && !isRoyalSpireUnlocked) return false;
    if (selectedTerritoryData.controllingGuild === activeCharacter.guildId) return false;
    return true;
  };
  
  const canInitiateGuildBattle = () => {
    if (!selectedTerritoryData || !activeCharacter.guildId) return false;
    if (selectedTerritoryData.isClaimable === false) return false;
    if (selectedTerritoryData.controllingGuild === activeCharacter.guildId) return false;
    // Check if there's already an active battle for this territory
    const existingBattle = guildBattles.find(b => 
      b.territoryId === selectedTerritoryData.id && 
      (b.status === 'recruiting' || b.status === 'active')
    );
    return !existingBattle;
  };
  
  const handleClaimTerritory = () => {
    if (selectedTerritoryData && activeCharacter.guildId && canClaimTerritory()) {
      claimTerritory(selectedTerritoryData.id, activeCharacter.guildId);
      setSelectedTerritory(null);
    }
  };
  
  const handleInitiateGuildBattle = () => {
    if (!selectedTerritoryData || !activeCharacter.guildId) return;
    
    Alert.alert(
      'Initiate Guild Battle',
      `Challenge for control of ${selectedTerritoryData.name}? This will start a 3v3 guild battle.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Challenge',
          onPress: () => {
            initiateGuildBattle(selectedTerritoryData.id, activeCharacter.guildId!);
            
            // Send WebSocket message to initiate guild battle
            if (websocket && websocket.readyState === WebSocket.OPEN) {
              const attackingGuild = guilds.find(g => g.id === activeCharacter.guildId);
              const defendingGuild = controllingGuild;
              
              websocket.send(JSON.stringify({
                type: 'initiateGuildBattle',
                territoryId: selectedTerritoryData.id,
                attackingGuild,
                defendingGuild,
                userId: activeCharacter.id
              }));
            }
            
            setSelectedTerritory(null);
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => router.push('/(tabs)/inbox')}
              >
                <Mail size={isTablet ? 24 : 20} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => router.push('/(tabs)/shop')}
              >
                <ShoppingCart size={isTablet ? 24 : 20} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => router.push('/(tabs)/profile')}
              >
                <User size={isTablet ? 24 : 20} color={colors.text} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        {kingGuild && (
          <View style={styles.kingdomHeader}>
            <Text style={styles.kingdomTitle}>👑 Kingdom of Ryh'Din</Text>
            <Text style={styles.kingGuildName}>
              Ruled by: [{kingGuild.clanTag}] {kingGuild.name}
            </Text>
            <Text style={styles.kingDescription}>
              The guild {kingGuild.name} has claimed the Royal Spire and rules all of Ryh'Din!
            </Text>
          </View>
        )}
        
        {!kingGuild && isRoyalSpireUnlocked && (
          <View style={styles.royalSpireAvailable}>
            <Text style={styles.royalSpireTitle}>🏰 The Royal Spire Awaits!</Text>
            <Text style={styles.royalSpireDescription}>
              A guild has conquered all territories! The Royal Spire has emerged and awaits a true ruler.
            </Text>
          </View>
        )}
        
        {/* Active Guild Battles */}
        {guildBattles.length > 0 && (
          <View style={styles.guildBattlesSection}>
            <Text style={styles.sectionTitle}>⚔️ Active Guild Battles</Text>
            {guildBattles.map(battle => (
              <View key={battle.id} style={styles.battleCard}>
                <Text style={styles.battleTitle}>
                  {battle.attackingGuild.name} vs {battle.defendingGuild?.name || 'Unclaimed'}
                </Text>
                <Text style={styles.battleTerritory}>
                  Territory: {territories.find(t => t.id === battle.territoryId)?.name}
                </Text>
                <Text style={styles.battleStatus}>
                  Status: {battle.status} | Attackers: {battle.attackers.length}/3 | Defenders: {battle.defenders.length}/3
                </Text>
                {battle.status === 'recruiting' && activeCharacter.guildId && (
                  <View style={styles.battleActions}>
                    {battle.attackingGuild.id === activeCharacter.guildId && !battle.attackers.includes(activeCharacter.id) && (
                      <TouchableOpacity 
                        style={styles.joinBattleButton}
                        onPress={() => joinGuildBattle(battle.id, 'attacker')}
                      >
                        <Swords size={16} color={colors.text} />
                        <Text style={styles.joinBattleText}>Join Attack</Text>
                      </TouchableOpacity>
                    )}
                    {battle.defendingGuild?.id === activeCharacter.guildId && !battle.defenders.includes(activeCharacter.id) && (
                      <TouchableOpacity 
                        style={[styles.joinBattleButton, styles.defendButton]}
                        onPress={() => joinGuildBattle(battle.id, 'defender')}
                      >
                        <Shield size={16} color={colors.text} />
                        <Text style={styles.joinBattleText}>Join Defense</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
        
        <Text style={styles.sectionTitle}>Territory Map</Text>
        <Text style={styles.subtitle}>
          Tap territories to view details and initiate guild battles
        </Text>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.mapContainer}
        >
          <View style={styles.mapGrid}>
            {renderMapGrid()}
          </View>
        </ScrollView>
        
        {selectedTerritoryData && (
          <View style={styles.territoryDetails}>
            <Text style={[
              styles.territoryDetailTitle,
              selectedTerritoryData.isRoyalSpire && styles.royalTitle
            ]}>
              {selectedTerritoryData.name}
              {selectedTerritoryData.isRoyalSpire && ' 👑'}
              {selectedTerritoryData.type === 'water' && ' 🌊'}
              {selectedTerritoryData.type === 'forest' && ' 🌲'}
              {selectedTerritoryData.type === 'mountain' && ' ⛰️'}
              {selectedTerritoryData.type === 'desert' && ' 🏜️'}
              {selectedTerritoryData.type === 'castle' && ' 🏰'}
            </Text>
            <Text style={styles.territoryDetailDescription}>
              {selectedTerritoryData.description}
            </Text>
            
            <View style={styles.territoryStats}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Type:</Text>
                <Text style={styles.statValue}>
                  {selectedTerritoryData.type.charAt(0).toUpperCase() + selectedTerritoryData.type.slice(1)}
                </Text>
              </View>
              
              {selectedTerritoryData.type !== 'water' && (
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Defense:</Text>
                  <Text style={styles.statValue}>
                    {selectedTerritoryData.defenseStrength}
                  </Text>
                </View>
              )}
              
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Strategic Value:</Text>
                <Text style={styles.statValue}>
                  {selectedTerritoryData.strategicValue}/15
                </Text>
              </View>
              
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Resources:</Text>
                <Text style={styles.statValue}>
                  {selectedTerritoryData.resources.join(', ')}
                </Text>
              </View>
              
              {selectedTerritoryData.isClaimable === false && (
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Status:</Text>
                  <Text style={[styles.statValue, styles.unclaimableText]}>
                    {selectedTerritoryData.type === 'water' ? 'Strategic Waterway' : 'Unclaimable'}
                  </Text>
                </View>
              )}
              
              {controllingGuild && (
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Controlled by:</Text>
                  <Text style={[styles.statValue, styles.guildName]}>
                    [{controllingGuild.clanTag}] {controllingGuild.name}
                  </Text>
                </View>
              )}
            </View>
            
            <Text style={styles.loreTitle}>Lore</Text>
            <Text style={styles.loreText}>
              {selectedTerritoryData.lore}
            </Text>
            
            {/* Guild Battle Actions */}
            {activeCharacter.guildId && canInitiateGuildBattle() && (
              <TouchableOpacity 
                style={styles.guildBattleButton}
                onPress={handleInitiateGuildBattle}
              >
                <Swords size={20} color={colors.text} />
                <Text style={styles.guildBattleButtonText}>
                  Initiate Guild Battle (3v3)
                </Text>
              </TouchableOpacity>
            )}
            
            {activeCharacter.guildId && canClaimTerritory() && !selectedTerritoryData.controllingGuild && (
              <TouchableOpacity 
                style={[
                  styles.claimButton,
                  selectedTerritoryData.isRoyalSpire && styles.royalClaimButton
                ]}
                onPress={handleClaimTerritory}
              >
                <Text style={styles.claimButtonText}>
                  {selectedTerritoryData.isRoyalSpire ? 'Claim the Crown!' : 'Claim for Guild'}
                </Text>
              </TouchableOpacity>
            )}
            
            {selectedTerritoryData.isRoyalSpire && !isRoyalSpireUnlocked && (
              <View style={styles.lockedWarning}>
                <Text style={styles.lockedText}>
                  🔒 The Royal Spire will only appear when a guild controls all other territories
                </Text>
              </View>
            )}
            
            {selectedTerritoryData.isClaimable === false && selectedTerritoryData.type === 'water' && (
              <View style={styles.waterInfo}>
                <Text style={styles.waterInfoText}>
                  🌊 This waterway cannot be claimed but provides strategic advantages to nearby territories
                </Text>
              </View>
            )}
            
            {!activeCharacter.guildId && selectedTerritoryData.isClaimable !== false && (
              <View style={styles.noGuildWarning}>
                <Text style={styles.noGuildText}>
                  Join a guild to participate in territory control and guild battles
                </Text>
              </View>
            )}
          </View>
        )}
        
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Legend</Text>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.surface }]} />
            <Text style={styles.legendText}>Unclaimed Territory</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FF6B6B' }]} />
            <Text style={styles.legendText}>Guild Controlled</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.water }]} />
            <Text style={styles.legendText}>Strategic Waterway</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.success }]} />
            <Text style={styles.legendText}>Ancient Forest</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.mountain }]} />
            <Text style={styles.legendText}>Mountain Stronghold</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.desert }]} />
            <Text style={styles.legendText}>Desert Territory</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.castle }]} />
            <Text style={styles.legendText}>Noble Castle</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.royal }]} />
            <Text style={styles.legendText}>The Royal Spire</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
            <Text style={styles.legendText}>Selected Territory</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
    marginRight: 8,
  },
  headerButton: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    padding: isTablet ? 24 : 16,
    paddingBottom: 32,
  },
  kingdomHeader: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    padding: isTablet ? 20 : 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  kingdomTitle: {
    fontSize: isTablet ? 28 : 24,
    fontWeight: 'bold',
    color: colors.background,
    marginBottom: 8,
  },
  kingGuildName: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    color: colors.background,
    marginBottom: 4,
  },
  kingDescription: {
    fontSize: isTablet ? 16 : 14,
    color: colors.background,
    textAlign: 'center',
  },
  royalSpireAvailable: {
    backgroundColor: colors.royal,
    borderRadius: 12,
    padding: isTablet ? 20 : 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  royalSpireTitle: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  royalSpireDescription: {
    fontSize: isTablet ? 16 : 14,
    color: colors.text,
    textAlign: 'center',
  },
  guildBattlesSection: {
    marginBottom: 24,
  },
  battleCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  battleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  battleTerritory: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  battleStatus: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  battleActions: {
    flexDirection: 'row',
    gap: 8,
  },
  joinBattleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  defendButton: {
    backgroundColor: colors.primary,
  },
  joinBattleText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: isTablet ? 16 : 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  mapContainer: {
    marginBottom: 24,
  },
  mapGrid: {
    width: GRID_SIZE * CELL_SIZE,
    height: GRID_SIZE * CELL_SIZE,
  },
  gridRow: {
    flexDirection: 'row',
  },
  gridCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
    backgroundColor: colors.surfaceDark,
  },
  territoryCell: {
    backgroundColor: colors.surface,
  },
  waterCell: {
    backgroundColor: colors.water,
    borderColor: colors.waterLight,
  },
  forestCell: {
    backgroundColor: colors.success,
    borderColor: colors.primaryLight,
  },
  mountainCell: {
    backgroundColor: colors.mountain,
    borderColor: colors.mountainLight,
  },
  desertCell: {
    backgroundColor: colors.desert,
    borderColor: colors.desertLight,
  },
  castleCell: {
    backgroundColor: colors.castle,
    borderColor: colors.castleLight,
  },
  royalSpireCell: {
    backgroundColor: colors.royal,
    borderColor: colors.royalLight,
    borderWidth: 2,
  },
  lockedRoyalSpire: {
    backgroundColor: colors.surfaceDark,
    borderColor: colors.textSecondary,
  },
  controlledCell: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  selectedCell: {
    backgroundColor: colors.primary,
  },
  territoryContent: {
    flex: 1,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  territoryName: {
    fontSize: isTablet ? 11 : 9,
    color: colors.text,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  waterText: {
    color: colors.waterLight,
  },
  forestText: {
    color: colors.text,
  },
  mountainText: {
    color: colors.text,
  },
  desertText: {
    color: colors.text,
  },
  castleText: {
    color: colors.text,
  },
  royalText: {
    color: colors.royalLight,
  },
  guildIndicator: {
    width: isTablet ? 10 : 8,
    height: isTablet ? 10 : 8,
    borderRadius: isTablet ? 5 : 4,
    marginTop: 2,
  },
  territoryIcon: {
    fontSize: isTablet ? 14 : 12,
    marginTop: 2,
  },
  territoryDetails: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: isTablet ? 20 : 16,
    marginBottom: 24,
  },
  territoryDetailTitle: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  royalTitle: {
    color: colors.royalLight,
  },
  territoryDetailDescription: {
    fontSize: isTablet ? 16 : 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  territoryStats: {
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: isTablet ? 16 : 14,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  statValue: {
    fontSize: isTablet ? 16 : 14,
    color: colors.text,
  },
  guildName: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  unclaimableText: {
    color: colors.waterLight,
    fontStyle: 'italic',
  },
  loreTitle: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  loreText: {
    fontSize: isTablet ? 16 : 14,
    color: colors.textSecondary,
    lineHeight: isTablet ? 24 : 20,
    marginBottom: 16,
  },
  guildBattleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning,
    borderRadius: 8,
    padding: isTablet ? 16 : 12,
    justifyContent: 'center',
    marginBottom: 8,
    gap: 8,
  },
  guildBattleButtonText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: isTablet ? 18 : 16,
  },
  claimButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: isTablet ? 16 : 12,
    alignItems: 'center',
  },
  royalClaimButton: {
    backgroundColor: colors.royal,
  },
  claimButtonText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: isTablet ? 18 : 16,
  },
  lockedWarning: {
    backgroundColor: colors.textSecondary,
    borderRadius: 8,
    padding: isTablet ? 16 : 12,
    alignItems: 'center',
  },
  lockedText: {
    color: colors.text,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  waterInfo: {
    backgroundColor: colors.water,
    borderRadius: 8,
    padding: isTablet ? 16 : 12,
    alignItems: 'center',
  },
  waterInfoText: {
    color: colors.text,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  noGuildWarning: {
    backgroundColor: colors.warning,
    borderRadius: 8,
    padding: isTablet ? 16 : 12,
    alignItems: 'center',
  },
  noGuildText: {
    color: colors.background,
    fontWeight: 'bold',
  },
  legend: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: isTablet ? 20 : 16,
  },
  legendTitle: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: isTablet ? 20 : 16,
    height: isTablet ? 20 : 16,
    borderRadius: isTablet ? 10 : 8,
    marginRight: 12,
  },
  legendText: {
    fontSize: isTablet ? 16 : 14,
    color: colors.textSecondary,
  },
});