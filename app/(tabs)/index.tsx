import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useGameStore } from '@/hooks/useGameStore';
import colors from '@/constants/colors';
import { Sword, Shield, Users, MessageSquare, ShoppingCart, User } from 'lucide-react-native';
import NotificationSystem from '@/components/NotificationSystem';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;

export default function HomeScreen() {
  const router = useRouter();
  const { 
    isAuthenticated, 
    activeCharacter, 
    characters,
    diamonds,
    activeParty,
    guilds
  } = useGameStore();
  
  // Fix: Move navigation logic to useEffect to prevent setState during render
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)');
    }
  }, [isAuthenticated, router]);
  
  if (!isAuthenticated) {
    return null;
  }
  
  if (!activeCharacter) {
    return (
      <View style={styles.container}>
        <NotificationSystem />
        <Text style={styles.welcomeText}>Welcome to Echoes of Elders!</Text>
        <Text style={styles.subtitle}>
          {characters.length === 0 
            ? "Create your first character to begin your adventure"
            : "Select a character to continue your adventure"
          }
        </Text>
        
        {characters.length > 0 ? (
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => router.push('/character-management')}
          >
            <Text style={styles.createButtonText}>Manage Characters</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => router.push('/character-creation')}
          >
            <Text style={styles.createButtonText}>Create Character</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
  
  const getGuildInfo = () => {
    if (!activeCharacter.guildId) return null;
    const guild = guilds.find(g => g.id === activeCharacter.guildId);
    if (!guild) return null;
    
    const member = guild.members.find(m => m.id === activeCharacter.id);
    return {
      name: guild.name,
      rank: member?.rank || 'Member',
      clanTag: guild.clanTag
    };
  };
  
  // Get display names for race and class, handling custom cases
  const getRaceDisplayName = (): string => {
    if (activeCharacter.race === 'custom' && activeCharacter.customRace) {
      return activeCharacter.customRace.name || "Custom Race";
    }
    const race = activeCharacter.race || "Unknown Race";
    return race.charAt(0).toUpperCase() + race.slice(1).toLowerCase();
  };
  
  const getClassDisplayName = (): string => {
    if (activeCharacter.class === 'custom' && activeCharacter.customClass) {
      return activeCharacter.customClass.name || "Custom Class";
    }
    const characterClass = activeCharacter.class || "Unknown Class";
    return characterClass.charAt(0).toUpperCase() + characterClass.slice(1).toLowerCase();
  };
  
  const guildInfo = getGuildInfo();
  
  // Check if character is fainted
  const isCharacterFainted = activeCharacter.health.current <= 0;
  
  return (
    <View style={styles.container}>
      <NotificationSystem />
      <Stack.Screen 
        options={{
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => router.push('/(tabs)/chat')}
              >
                <MessageSquare size={isTablet ? 24 : 20} color={colors.text} />
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
        {/* Character Header */}
        <View style={[styles.characterHeader, isCharacterFainted && styles.faintedHeader]}>
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              {activeCharacter.profileImage ? (
                <Image 
                  source={{ uri: activeCharacter.profileImage }} 
                  style={[styles.profileImage, isCharacterFainted && styles.faintedImage]} 
                />
              ) : (
                <View style={[styles.profilePlaceholder, isCharacterFainted && styles.faintedImage]}>
                  <Text style={styles.profileInitial}>
                    {activeCharacter.name ? activeCharacter.name.charAt(0).toUpperCase() : "?"}
                  </Text>
                </View>
              )}
              
              {/* Fainted overlay */}
              {isCharacterFainted && (
                <View style={styles.faintedOverlay}>
                  <Text style={styles.faintedText}>💀 FAINTED</Text>
                </View>
              )}
            </View>
            
            <View style={styles.characterInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.characterName}>{activeCharacter.name || "Unnamed Character"}</Text>
                {guildInfo && (
                  <Text style={styles.clanTag}>[{guildInfo.clanTag}]</Text>
                )}
              </View>
              <Text style={styles.characterDetails}>
                Level {activeCharacter.level} {getRaceDisplayName()} {getClassDisplayName()}
              </Text>
              {guildInfo && (
                <Text style={styles.guildInfo}>
                  {guildInfo.name} ({guildInfo.rank})
                </Text>
              )}
              {activeCharacter.familiar && (
                <Text style={styles.familiarInfo}>
                  🐾 {activeCharacter.familiar.name} (Lv.{activeCharacter.familiar.level})
                </Text>
              )}
              {activeParty && (
                <Text style={styles.partyInfo}>
                  👥 {activeParty.name} ({activeParty.members.length} members)
                </Text>
              )}
              {isCharacterFainted && (
                <Text style={styles.faintedStatus}>
                  ⚠️ Use a revive potion to restore your character
                </Text>
              )}
              
              {/* Health and Mana values only */}
              <View style={styles.healthManaValues}>
                <Text style={styles.healthValue}>
                  ❤️ {activeCharacter.health?.current || 0}/{activeCharacter.health?.max || 0}
                </Text>
                <Text style={styles.manaValue}>
                  🪄 {activeCharacter.mana?.current || 0}/{activeCharacter.mana?.max || 0}
                </Text>
              </View>
            </View>
          </View>
          
          {/* Currency Display */}
          <View style={styles.currencySection}>
            <View style={styles.currencyCard}>
              <Text style={styles.currencyValue}>💰 {activeCharacter.gold}</Text>
              <Text style={styles.currencyLabel}>Gold</Text>
            </View>
            <View style={styles.currencyCard}>
              <Text style={styles.currencyValue}>💎 {diamonds}</Text>
              <Text style={styles.currencyLabel}>Diamonds</Text>
            </View>
          </View>
        </View>
        
        {/* Character Stats Overview */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Character Overview</Text>
          
          <View style={styles.primaryStats}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Health</Text>
              <Text style={[styles.statValue, isCharacterFainted && styles.faintedStatValue]}>
                {activeCharacter.health?.current || 0}/{activeCharacter.health?.max || 0}
              </Text>
              <View style={styles.statBar}>
                <View 
                  style={[
                    styles.statProgress,
                    styles.healthProgress,
                    { 
                      width: `${activeCharacter.health?.max ? 
                        (activeCharacter.health.current / activeCharacter.health.max) * 100 : 0}%` 
                    }
                  ]}
                />
              </View>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Mana</Text>
              <Text style={styles.statValue}>
                {activeCharacter.mana?.current || 0}/{activeCharacter.mana?.max || 0}
              </Text>
              <View style={styles.statBar}>
                <View 
                  style={[
                    styles.statProgress,
                    styles.manaProgress,
                    { 
                      width: `${activeCharacter.mana?.max ? 
                        (activeCharacter.mana.current / activeCharacter.mana.max) * 100 : 0}%` 
                    }
                  ]}
                />
              </View>
            </View>
          </View>
          
          {/* Experience Progress */}
          <View style={styles.experienceCard}>
            <Text style={styles.experienceLabel}>Experience Progress</Text>
            <View style={styles.experienceBar}>
              <View 
                style={[
                  styles.experienceProgress,
                  { 
                    width: `${activeCharacter.experienceToNextLevel ? 
                      (activeCharacter.experience / activeCharacter.experienceToNextLevel) * 100 : 0}%` 
                  }
                ]}
              />
            </View>
            <Text style={styles.experienceText}>
              {activeCharacter.experience} / {activeCharacter.experienceToNextLevel} XP to next level
            </Text>
          </View>
          
          {/* Core Stats */}
          <View style={styles.coreStats}>
            <View style={styles.coreStatRow}>
              <View style={styles.coreStatCard}>
                <Text style={styles.coreStatLabel}>STR</Text>
                <Text style={styles.coreStatValue}>{activeCharacter.stats?.strength || 0}</Text>
              </View>
              <View style={styles.coreStatCard}>
                <Text style={styles.coreStatLabel}>DEX</Text>
                <Text style={styles.coreStatValue}>{activeCharacter.stats?.dexterity || 0}</Text>
              </View>
              <View style={styles.coreStatCard}>
                <Text style={styles.coreStatLabel}>INT</Text>
                <Text style={styles.coreStatValue}>{activeCharacter.stats?.intelligence || 0}</Text>
              </View>
            </View>
            
            <View style={styles.coreStatRow}>
              <View style={styles.coreStatCard}>
                <Text style={styles.coreStatLabel}>CON</Text>
                <Text style={styles.coreStatValue}>{activeCharacter.stats?.constitution || 0}</Text>
              </View>
              <View style={styles.coreStatCard}>
                <Text style={styles.coreStatLabel}>WIS</Text>
                <Text style={styles.coreStatValue}>{activeCharacter.stats?.wisdom || 0}</Text>
              </View>
              <View style={styles.coreStatCard}>
                <Text style={styles.coreStatLabel}>CHA</Text>
                <Text style={styles.coreStatValue}>{activeCharacter.stats?.charisma || 0}</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={[
                styles.actionCard, 
                styles.combatAction,
                isCharacterFainted && styles.disabledActionCard
              ]}
              onPress={() => router.push('/(tabs)/combat')}
              disabled={isCharacterFainted}
            >
              <Sword size={isTablet ? 32 : 24} color={isCharacterFainted ? colors.textMuted : colors.text} />
              <Text style={[styles.actionTitle, isCharacterFainted && styles.disabledActionText]}>Combat</Text>
              <Text style={[styles.actionSubtitle, isCharacterFainted && styles.disabledActionText]}>
                {isCharacterFainted ? 'Character fainted' : 'Fight enemies'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionCard, styles.inventoryAction]}
              onPress={() => router.push('/(tabs)/inventory')}
            >
              <Shield size={isTablet ? 32 : 24} color={colors.text} />
              <Text style={styles.actionTitle}>Inventory</Text>
              <Text style={styles.actionSubtitle}>
                {isCharacterFainted ? 'Use revive potion' : 'Manage items'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionCard, styles.communityAction]}
              onPress={() => router.push('/(tabs)/community')}
            >
              <Users size={isTablet ? 32 : 24} color={colors.text} />
              <Text style={styles.actionTitle}>Community</Text>
              <Text style={styles.actionSubtitle}>Social features</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionCard, styles.shopAction]}
              onPress={() => router.push('/(tabs)/shop')}
            >
              <ShoppingCart size={isTablet ? 32 : 24} color={colors.text} />
              <Text style={styles.actionTitle}>Shop</Text>
              <Text style={styles.actionSubtitle}>Buy & sell</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <Text style={styles.activityText}>
              {isCharacterFainted 
                ? `${activeCharacter.name} has fainted and needs revival!`
                : `Welcome back, ${activeCharacter.name}! Your adventure awaits.`
              }
            </Text>
            <Text style={styles.activitySubtext}>
              {isCharacterFainted 
                ? "Use a revive potion from your inventory to continue your journey."
                : "Continue your journey in the mystical realm of Echoes of Elders."
              }
            </Text>
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
  welcomeText: {
    fontSize: isTablet ? 32 : 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: isTablet ? 18 : 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: isTablet ? 20 : 16,
    alignItems: 'center',
    marginHorizontal: isTablet ? 40 : 20,
  },
  createButtonText: {
    color: colors.text,
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
  },
  characterHeader: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: isTablet ? 24 : 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  faintedHeader: {
    borderColor: colors.error,
    borderWidth: 2,
    backgroundColor: '#ffebee',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: isTablet ? 16 : 12,
  },
  profileImage: {
    width: isTablet ? 80 : 64,
    height: isTablet ? 80 : 64,
    borderRadius: isTablet ? 12 : 8,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  profilePlaceholder: {
    width: isTablet ? 80 : 64,
    height: isTablet ? 80 : 64,
    borderRadius: isTablet ? 12 : 8,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.primaryLight,
  },
  faintedImage: {
    opacity: 0.5,
    borderColor: colors.error,
  },
  profileInitial: {
    fontSize: isTablet ? 32 : 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  faintedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: isTablet ? 12 : 8,
  },
  faintedText: {
    fontSize: isTablet ? 12 : 10,
    fontWeight: 'bold',
    color: colors.error,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  characterInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  characterName: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: 8,
  },
  clanTag: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  characterDetails: {
    fontSize: isTablet ? 16 : 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  guildInfo: {
    fontSize: isTablet ? 14 : 12,
    color: colors.success,
    marginBottom: 2,
  },
  familiarInfo: {
    fontSize: isTablet ? 14 : 12,
    color: colors.primary,
    marginBottom: 2,
  },
  partyInfo: {
    fontSize: isTablet ? 14 : 12,
    color: colors.warning,
    marginBottom: 2,
  },
  faintedStatus: {
    fontSize: isTablet ? 14 : 12,
    color: colors.error,
    fontWeight: 'bold',
    marginTop: 4,
  },
  healthManaValues: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  healthValue: {
    fontSize: isTablet ? 14 : 12,
    color: colors.health,
    fontWeight: 'bold',
  },
  manaValue: {
    fontSize: isTablet ? 14 : 12,
    color: colors.mana,
    fontWeight: 'bold',
  },
  currencySection: {
    flexDirection: 'row',
    gap: 12,
  },
  currencyCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: isTablet ? 16 : 12,
    alignItems: 'center',
  },
  currencyValue: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  currencyLabel: {
    fontSize: isTablet ? 12 : 10,
    color: colors.textSecondary,
  },
  statsSection: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: isTablet ? 24 : 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  primaryStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: isTablet ? 16 : 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: isTablet ? 14 : 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  faintedStatValue: {
    color: colors.error,
  },
  statBar: {
    width: '100%',
    height: isTablet ? 8 : 6,
    backgroundColor: colors.surfaceDark,
    borderRadius: isTablet ? 4 : 3,
    overflow: 'hidden',
  },
  statProgress: {
    height: '100%',
    borderRadius: isTablet ? 4 : 3,
  },
  healthProgress: {
    backgroundColor: colors.health,
  },
  manaProgress: {
    backgroundColor: colors.mana,
  },
  experienceCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: isTablet ? 16 : 12,
    marginBottom: 16,
  },
  experienceLabel: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  experienceBar: {
    height: isTablet ? 12 : 8,
    backgroundColor: colors.surfaceDark,
    borderRadius: isTablet ? 6 : 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  experienceProgress: {
    height: '100%',
    backgroundColor: colors.experience,
    borderRadius: isTablet ? 6 : 4,
  },
  experienceText: {
    fontSize: isTablet ? 14 : 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  coreStats: {
    gap: 8,
  },
  coreStatRow: {
    flexDirection: 'row',
    gap: 8,
  },
  coreStatCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: isTablet ? 12 : 8,
    alignItems: 'center',
  },
  coreStatLabel: {
    fontSize: isTablet ? 12 : 10,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  coreStatValue: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  quickActionsSection: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: isTablet ? 24 : 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: isTablet ? 140 : 120,
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: isTablet ? 20 : 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  disabledActionCard: {
    opacity: 0.5,
    backgroundColor: colors.surfaceDark,
  },
  combatAction: {
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  inventoryAction: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  communityAction: {
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  shopAction: {
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  actionTitle: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: isTablet ? 12 : 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  disabledActionText: {
    color: colors.textMuted,
  },
  activitySection: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: isTablet ? 24 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  activityCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: isTablet ? 16 : 12,
  },
  activityText: {
    fontSize: isTablet ? 16 : 14,
    color: colors.text,
    marginBottom: 8,
    fontWeight: '600',
  },
  activitySubtext: {
    fontSize: isTablet ? 14 : 12,
    color: colors.textSecondary,
    lineHeight: isTablet ? 20 : 16,
  },
});