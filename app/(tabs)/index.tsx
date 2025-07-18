import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Modal } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useGameStore } from '@/hooks/useGameStore';
import colors from '@/constants/colors';
import { Sword, Shield, Users, MessageSquare, User, Heart, LogOut } from 'lucide-react-native';
import NotificationSystem from '@/components/NotificationSystem';
import ReactivePlayerCard from '@/components/Game/ReactivePlayerCard';
import { familiarTypes } from '@/constants/gameData';

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
    guilds,
    canSummonFamiliar,
    summonFamiliar,
    dismissFamiliar,
    getGuildRoleInfo,
    logout
  } = useGameStore();
  
  const [showCharacterCard, setShowCharacterCard] = useState(false);
  const [showFamiliarModal, setShowFamiliarModal] = useState(false);
  
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
      clanTag: guild.clanTag,
      isRoyal: guild.isRoyal || false
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
  
  // Get guild role display with emoji
  const getGuildRoleDisplay = (): string => {
    if (!activeCharacter.guildRole || activeCharacter.guildRole === 'Member') {
      return '';
    }
    
    const roleInfo = getGuildRoleInfo(activeCharacter.guildRole);
    return `${roleInfo.emoji} ${activeCharacter.guildRole}`;
  };
  
  // Convert Character to CombatParticipant format for ReactivePlayerCard
  const convertToCombatParticipant = () => {
    return {
      id: activeCharacter.id,
      name: activeCharacter.name,
      level: activeCharacter.level,
      race: activeCharacter.race,
      class: activeCharacter.class,
      health: activeCharacter.health,
      mana: activeCharacter.mana,
      stats: activeCharacter.stats,
      isPlayer: true,
      // Convert Buff objects to expected format
      buffs: (activeCharacter.buffs || []).map(buff => ({
        name: buff.name,
        effect: buff.description || 'Buff effect',
        duration: buff.duration,
        type: 'magic' as const
      })),
      // Convert Debuff objects to expected format
      debuffs: (activeCharacter.debuffs || []).map(debuff => ({
        name: debuff.name,
        effect: debuff.description || 'Debuff effect',
        duration: debuff.duration,
        type: 'curse' as const
      })),
      profileImage: activeCharacter.profileImage,
      customRace: activeCharacter.customRace,
      customClass: activeCharacter.customClass,
      guildRole: activeCharacter.guildRole,
      lastDiceRoll: activeCharacter.lastDiceRoll
    };
  };
  
  const handleSummonFamiliar = (type: string, name: string) => {
    const success = summonFamiliar(type as any, name);
    if (success) {
      setShowFamiliarModal(false);
    }
  };
  
  const handleLogout = () => {
    logout();
    router.replace('/(auth)');
  };
  
  const guildInfo = getGuildInfo();
  const guildRoleDisplay = getGuildRoleDisplay();
  
  // Check if character is fainted
  const isCharacterFainted = activeCharacter.health.current <= 0;
  
  return (
    <View style={styles.container}>
      <NotificationSystem />
      
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
                {guildRoleDisplay && (
                  <Text style={styles.royalRole}>{guildRoleDisplay}</Text>
                )}
              </View>
              <Text style={styles.characterDetails}>
                Level {activeCharacter.level} {getRaceDisplayName()} {getClassDisplayName()}
              </Text>
              {guildInfo && (
                <View style={styles.guildInfoContainer}>
                  <Text style={[styles.guildInfo, guildInfo.isRoyal && styles.royalGuildInfo]}>
                    {guildInfo.isRoyal ? '👑 ' : ''}{guildInfo.name} ({guildInfo.rank})
                  </Text>
                  {guildInfo.isRoyal && (
                    <Text style={styles.royalGuildSubtext}>Royal Guild</Text>
                  )}
                </View>
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
        
        {/* Royal Buffs Display */}
        {activeCharacter.guildRole && activeCharacter.guildRole !== 'Member' && (
          <View style={styles.royalBuffsSection}>
            <Text style={styles.royalBuffsTitle}>
              {getGuildRoleInfo(activeCharacter.guildRole).emoji} Royal Buffs Active
            </Text>
            <Text style={styles.royalBuffsDescription}>
              {getGuildRoleInfo(activeCharacter.guildRole).description}
            </Text>
            <View style={styles.royalBuffsList}>
              {Object.entries(getGuildRoleInfo(activeCharacter.guildRole).buffs).map(([stat, value]) => (
                <Text key={stat} style={styles.royalBuff}>
                  +{value} {stat.charAt(0).toUpperCase() + stat.slice(1)}
                </Text>
              ))}
            </View>
          </View>
        )}
        
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
              <Text style={styles.actionTitle}>Guild</Text>
              <Text style={styles.actionSubtitle}>Guild features</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionCard, styles.chatAction]}
              onPress={() => router.push('/(tabs)/chat')}
            >
              <MessageSquare size={isTablet ? 32 : 24} color={colors.text} />
              <Text style={styles.actionTitle}>Chat</Text>
              <Text style={styles.actionSubtitle}>Talk to players</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionCard, styles.characterCardAction]}
              onPress={() => setShowCharacterCard(true)}
            >
              <User size={isTablet ? 32 : 24} color={colors.text} />
              <Text style={styles.actionTitle}>Character Card</Text>
              <Text style={styles.actionSubtitle}>View detailed card</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionCard, styles.familiarAction]}
              onPress={() => setShowFamiliarModal(true)}
            >
              <Heart size={isTablet ? 32 : 24} color={colors.text} />
              <Text style={styles.actionTitle}>
                {activeCharacter.familiar ? 'Manage Familiar' : 'Summon Familiar'}
              </Text>
              <Text style={styles.actionSubtitle}>
                {activeCharacter.familiar ? `${activeCharacter.familiar.name} (Lv.${activeCharacter.familiar.level})` : 'Get a companion'}
              </Text>
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
                : guildRoleDisplay
                ? `Welcome back, ${guildRoleDisplay} ${activeCharacter.name}! Your royal duties await.`
                : `Welcome back, ${activeCharacter.name}! Your adventure awaits.`
              }
            </Text>
            <Text style={styles.activitySubtext}>
              {isCharacterFainted 
                ? "Use a revive potion from your inventory to continue your journey."
                : guildInfo?.isRoyal
                ? "As a member of the royal guild, you have access to special kingdom privileges."
                : "Continue your journey in the mystical realm of Echoes of Elders."
              }
            </Text>
          </View>
        </View>
        
        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <LogOut size={isTablet ? 24 : 20} color={colors.text} />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Character Card Modal */}
      <Modal
        visible={showCharacterCard}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCharacterCard(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Character Card</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowCharacterCard(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.cardContainer}>
              <ReactivePlayerCard
                participant={convertToCombatParticipant()}
                isActive={true}
                isAnimating={false}
              />
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Familiar Modal */}
      <Modal
        visible={showFamiliarModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFamiliarModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activeCharacter.familiar ? 'Manage Familiar' : 'Summon Familiar'}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowFamiliarModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.familiarContent}>
              {activeCharacter.familiar ? (
                <View style={styles.familiarInfo}>
                  <Text style={styles.familiarName}>{activeCharacter.familiar.name}</Text>
                  <Text style={styles.familiarType}>Type: {activeCharacter.familiar.type}</Text>
                  <Text style={styles.familiarLevel}>Level: {activeCharacter.familiar.level}</Text>
                  <Text style={styles.familiarLoyalty}>Loyalty: {activeCharacter.familiar.loyalty}%</Text>
                  
                  <TouchableOpacity 
                    style={styles.dismissButton}
                    onPress={() => {
                      dismissFamiliar();
                      setShowFamiliarModal(false);
                    }}
                  >
                    <Text style={styles.dismissButtonText}>Dismiss Familiar</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.summonInfo}>
                  <Text style={styles.summonText}>
                    Choose a familiar to summon. Each familiar has unique abilities and requires diamonds to unlock.
                  </Text>
                  
                  {familiarTypes.map(familiar => {
                    const { canSummon, reason, cost } = canSummonFamiliar(familiar.type as any);
                    
                    return (
                      <TouchableOpacity
                        key={familiar.type}
                        style={[
                          styles.familiarOption,
                          !canSummon && styles.disabledFamiliarOption
                        ]}
                        onPress={() => {
                          if (canSummon) {
                            handleSummonFamiliar(familiar.type, familiar.name);
                          }
                        }}
                        disabled={!canSummon}
                      >
                        <Text style={styles.familiarIcon}>{familiar.icon}</Text>
                        <View style={styles.familiarDetails}>
                          <Text style={styles.familiarOptionName}>{familiar.name}</Text>
                          <Text style={styles.familiarDescription}>{familiar.description}</Text>
                          <Text style={styles.familiarCost}>Cost: {cost} diamonds</Text>
                          <Text style={styles.familiarRequirement}>
                            Requires Level {familiar.levelRequirement}
                          </Text>
                          {!canSummon && (
                            <Text style={styles.familiarReason}>{reason}</Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    flexWrap: 'wrap',
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
    marginRight: 8,
  },
  royalRole: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: 'bold',
    color: colors.royal,
    backgroundColor: colors.royal + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  characterDetails: {
    fontSize: isTablet ? 16 : 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  guildInfoContainer: {
    marginBottom: 2,
  },
  guildInfo: {
    fontSize: isTablet ? 14 : 12,
    color: colors.success,
  },
  royalGuildInfo: {
    color: colors.royal,
    fontWeight: 'bold',
  },
  royalGuildSubtext: {
    fontSize: isTablet ? 12 : 10,
    color: colors.royal,
    fontStyle: 'italic',
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
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  manaValue: {
    fontSize: isTablet ? 14 : 12,
    color: '#3498db',
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
  royalBuffsSection: {
    backgroundColor: colors.royal,
    borderRadius: 20,
    padding: isTablet ? 20 : 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  royalBuffsTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  royalBuffsDescription: {
    fontSize: isTablet ? 14 : 12,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  royalBuffsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  royalBuff: {
    fontSize: isTablet ? 14 : 12,
    color: colors.text,
    backgroundColor: colors.background + '40',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontWeight: 'bold',
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
    backgroundColor: '#e74c3c',
  },
  manaProgress: {
    backgroundColor: '#3498db',
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
    backgroundColor: '#f39c12',
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
  chatAction: {
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  characterCardAction: {
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  familiarAction: {
    borderLeftWidth: 4,
    borderLeftColor: '#e91e63',
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
    marginBottom: 24,
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
  logoutSection: {
    alignItems: 'center',
    marginTop: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error,
    borderRadius: 12,
    paddingHorizontal: isTablet ? 24 : 20,
    paddingVertical: isTablet ? 16 : 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButtonText: {
    color: colors.text,
    fontSize: isTablet ? 16 : 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    maxWidth: isTablet ? 500 : 320,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.text,
    fontWeight: 'bold',
  },
  cardContainer: {
    alignItems: 'center',
  },
  familiarContent: {
    maxHeight: 400,
  },
  familiarName: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  familiarType: {
    fontSize: isTablet ? 16 : 14,
    color: colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  familiarLevel: {
    fontSize: isTablet ? 16 : 14,
    color: colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  familiarLoyalty: {
    fontSize: isTablet ? 16 : 14,
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  dismissButton: {
    backgroundColor: colors.error,
    borderRadius: 12,
    padding: isTablet ? 16 : 12,
    alignItems: 'center',
  },
  dismissButtonText: {
    color: colors.text,
    fontSize: isTablet ? 16 : 14,
    fontWeight: 'bold',
  },
  summonInfo: {
    alignItems: 'stretch',
  },
  summonText: {
    fontSize: isTablet ? 16 : 14,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: isTablet ? 24 : 20,
  },
  familiarOption: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  disabledFamiliarOption: {
    opacity: 0.5,
  },
  familiarIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  familiarDetails: {
    flex: 1,
  },
  familiarOptionName: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  familiarDescription: {
    fontSize: isTablet ? 14 : 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  familiarCost: {
    fontSize: isTablet ? 14 : 12,
    color: colors.warning,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  familiarRequirement: {
    fontSize: isTablet ? 12 : 10,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  familiarReason: {
    fontSize: isTablet ? 12 : 10,
    color: colors.error,
    fontStyle: 'italic',
  },
});