import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import colors from '@/constants/colors';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;
const cardWidth = isTablet ? 200 : Math.min(160, screenWidth * 0.38);

interface CombatParticipant {
  id: string;
  name: string;
  level?: number;
  race?: string;
  class?: string;
  health: { current: number; max: number };
  mana: { current: number; max: number };
  stats: {
    [key: string]: number;
  };
  isPlayer: boolean;
  isFamiliar?: boolean;
  ownerId?: string;
  buffs: Array<{
    name: string;
    effect: string;
    duration: number;
    type: "attack" | "defense" | "magic" | "speed";
  }>;
  debuffs: Array<{
    name: string;
    effect: string;
    duration: number;
    type: "attack" | "defense" | "speed" | "magic" | "poison" | "curse";
  }>;
  lastAction?: string;
  lastDiceRoll?: {
    type?: string;
    result?: number;
    timestamp?: number;
    diceType?: number;
    modifier?: number;
    value?: number;
  };
  profileImage?: string;
  imageUrl?: string; // For NPCs
  customRace?: { name: string };
  customClass?: { name: string };
}

interface ReactivePlayerCardProps {
  participant: CombatParticipant;
  isActive: boolean;
  isAnimating: boolean;
}

export default function ReactivePlayerCard({ participant, isActive, isAnimating }: ReactivePlayerCardProps) {
  // Safely calculate percentages with fallbacks
  const healthPercentage = participant.health ? 
    (participant.health.current / participant.health.max) * 100 : 0;
  
  const manaPercentage = participant.mana ? 
    (participant.mana.current / participant.mana.max) * 100 : 0;
  
  // Check if character is fainted
  const isFainted = participant.health.current <= 0;
  
  const getStatAbbreviation = (statName: string): string => {
    const abbreviations: { [key: string]: string } = {
      strength: 'STR',
      dexterity: 'DEX',
      intelligence: 'INT',
      constitution: 'CON',
      wisdom: 'WIS',
      charisma: 'CHA'
    };
    return abbreviations[statName] || statName.toUpperCase().slice(0, 3);
  };
  
  const getStatValue = (statName: string): number => {
    return participant.stats?.[statName] || 0;
  };
  
  // Get first letter of name safely
  const getNameInitial = (): string => {
    if (!participant.name) return "?";
    return participant.name.charAt(0).toUpperCase();
  };

  // Capitalize race and class
  const capitalizeFirstLetter = (string?: string): string => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };
  
  // Get display names for race and class, handling custom cases
  const getRaceDisplayName = (): string => {
    if (participant.race === 'custom' && participant.customRace) {
      return capitalizeFirstLetter(participant.customRace.name) || "Custom Race";
    }
    return capitalizeFirstLetter(participant.race) || "";
  };
  
  const getClassDisplayName = (): string => {
    if (participant.class === 'custom' && participant.customClass) {
      return capitalizeFirstLetter(participant.customClass.name) || "Custom Class";
    }
    return capitalizeFirstLetter(participant.class) || "";
  };
  
  // Format dice roll for display
  const formatDiceRoll = (): string => {
    if (!participant.lastDiceRoll) return "";
    
    const { diceType = 20, result, modifier = 0, value } = participant.lastDiceRoll;
    const displayValue = result || value || 0;
    
    let modifierText = "";
    if (modifier !== 0) {
      modifierText = modifier > 0 ? `+${modifier}` : `${modifier}`;
    }
    
    return `🎲${diceType}${modifierText} = ${displayValue}`;
  };

  // Get the appropriate image URL
  const getImageUrl = (): string | undefined => {
    if (participant.isPlayer) {
      return participant.profileImage;
    } else {
      // For NPCs, use imageUrl if available
      return participant.imageUrl || participant.profileImage;
    }
  };

  // Generate dice string based on character stats
  const generateDiceString = (): string => {
    if (!participant.stats) return "";
    
    // Calculate modifier based on primary stats
    const str = participant.stats.strength || 10;
    const dex = participant.stats.dexterity || 10;
    const int = participant.stats.intelligence || 10;
    
    // Find the highest stat to determine primary dice
    const maxStat = Math.max(str, dex, int);
    const modifier = Math.floor((maxStat - 10) / 2);
    
    // Determine dice type based on level or stats
    const level = participant.level || 1;
    let diceType = 20; // Default d20
    
    if (level >= 10) diceType = 20;
    else if (level >= 5) diceType = 12;
    else diceType = 10;
    
    const modifierText = modifier >= 0 ? `+${modifier}` : `${modifier}`;
    return `🎲${diceType}${modifierText}`;
  };
  
  return (
    <View style={[
      styles.card,
      isActive && styles.activeCard,
      isAnimating && styles.animatingCard,
      participant.isPlayer ? styles.playerCard : styles.enemyCard,
      isFainted && styles.faintedCard
    ]}>
      <View style={styles.imageSection}>
        {getImageUrl() ? (
          <Image 
            source={{ uri: getImageUrl() }} 
            style={[styles.characterImage, isFainted && styles.faintedImage]}
            defaultSource={require('@/assets/images/icon.png')}
            onError={() => {
              console.log('Failed to load image for:', participant.name);
            }}
          />
        ) : (
          <View style={[styles.placeholderImage, isFainted && styles.faintedImage]}>
            <Text style={styles.placeholderText}>
              {getNameInitial()}
            </Text>
          </View>
        )}
        
        {/* Fainted overlay */}
        {isFainted && (
          <View style={styles.faintedOverlay}>
            <Text style={styles.faintedText}>💀 FAINTED</Text>
          </View>
        )}
        
        <View style={styles.nameOverlay}>
          <Text style={styles.characterName} numberOfLines={1}>
            {participant.name || "Unknown"}
          </Text>
          {participant.level && (
            <Text style={styles.characterLevel}>
              Lv.{participant.level}
            </Text>
          )}
        </View>
        
        {participant.lastDiceRoll && (
          <View style={styles.diceRollOverlay}>
            <Text style={styles.diceRollText}>
              {formatDiceRoll()}
            </Text>
          </View>
        )}
        
        {/* Compact health and mana bars overlaid at bottom */}
        <View style={styles.bottomBarsOverlay}>
          <View style={styles.resourceBar}>
            <Text style={styles.resourceIcon}>❤️</Text>
            <View style={styles.barContainer}>
              <View 
                style={[
                  styles.barFill,
                  styles.healthBar,
                  { width: `${healthPercentage}%` }
                ]} 
              />
            </View>
            <Text style={styles.resourceValue}>
              {participant.health?.current || 0}
            </Text>
          </View>
          
          <View style={styles.resourceBar}>
            <Text style={styles.resourceIcon}>🪄</Text>
            <View style={styles.barContainer}>
              <View 
                style={[
                  styles.barFill,
                  styles.manaBar,
                  { width: `${manaPercentage}%` }
                ]} 
              />
            </View>
            <Text style={styles.resourceValue}>
              {participant.mana?.current || 0}
            </Text>
          </View>
        </View>
        
        {participant.isFamiliar && (
          <View style={styles.familiarBadge}>
            <Text style={styles.familiarText}>🐾</Text>
          </View>
        )}
        
        {isActive && !isFainted && (
          <View style={styles.activeBadge}>
            <Text style={styles.activeText}>⚡</Text>
          </View>
        )}
      </View>
      
      <View style={styles.infoSection}>
        <View style={styles.characterDetails}>
          <Text style={styles.raceClassText} numberOfLines={1}>
            {getRaceDisplayName()}
            {getRaceDisplayName() && getClassDisplayName() ? " " : ""}
            {getClassDisplayName()}
          </Text>
          
          {/* Dice String Display */}
          <Text style={styles.diceString}>
            {generateDiceString()}
          </Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            {participant.stats && Object.keys(participant.stats).slice(0, 6).map((statName) => (
              <View key={statName} style={styles.statItem}>
                <Text style={styles.statLabel}>
                  {getStatAbbreviation(statName)}
                </Text>
                <Text style={styles.statValue}>
                  {getStatValue(statName)}
                </Text>
              </View>
            ))}
          </View>
        </View>
        
        {(participant.buffs?.length > 0 || participant.debuffs?.length > 0) && (
          <View style={styles.effectsContainer}>
            {participant.buffs?.map((buff, index) => (
              <View key={`buff-${index}`} style={[styles.effectBadge, styles.buffBadge]}>
                <Text style={styles.effectText}>+</Text>
              </View>
            ))}
            {participant.debuffs?.map((debuff, index) => (
              <View key={`debuff-${index}`} style={[styles.effectBadge, styles.debuffBadge]}>
                <Text style={styles.effectText}>-</Text>
              </View>
            ))}
          </View>
        )}
        
        {participant.lastAction && (
          <Text style={styles.lastAction} numberOfLines={2}>
            {participant.lastAction}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginHorizontal: 4,
    width: cardWidth,
    minHeight: isTablet ? 280 : 220, // Reduced height for better mobile scaling
    borderWidth: 2,
    borderColor: colors.surfaceLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  activeCard: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
    transform: [{ scale: 1.02 }],
  },
  animatingCard: {
    transform: [{ scale: 1.04 }],
  },
  playerCard: {
    backgroundColor: colors.surface,
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
  },
  enemyCard: {
    backgroundColor: colors.surfaceDark,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  faintedCard: {
    borderColor: colors.error,
    borderWidth: 2,
    opacity: 0.8,
  },
  imageSection: {
    height: isTablet ? '60%' : '55%', // Better proportions for mobile
    position: 'relative',
    backgroundColor: colors.surfaceDark,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  characterImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  faintedImage: {
    opacity: 0.5,
    filter: 'grayscale(100%)',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  placeholderText: {
    fontSize: isTablet ? 36 : 24, // Reduced for better mobile fit
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
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  faintedText: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: 'bold',
    color: colors.error,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  nameOverlay: {
    position: 'absolute',
    top: 6,
    left: 6,
    maxWidth: '65%',
  },
  characterName: {
    fontSize: isTablet ? 13 : 11, // Slightly smaller for better fit
    fontWeight: 'bold',
    color: colors.text,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  characterLevel: {
    fontSize: isTablet ? 11 : 9, // Slightly smaller for better fit
    color: colors.text,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  diceRollOverlay: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 4,
    alignItems: 'center',
    transform: [{ translateY: -10 }],
  },
  diceRollText: {
    fontSize: isTablet ? 12 : 10, // Smaller for better mobile fit
    fontWeight: 'bold',
    color: colors.text,
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  bottomBarsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 4,
    paddingVertical: 3,
    gap: 1,
  },
  resourceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  resourceIcon: {
    fontSize: isTablet ? 8 : 6, // Smaller icons for mobile
    width: isTablet ? 9 : 7,
  },
  barContainer: {
    flex: 1,
    height: isTablet ? 4 : 3, // Thinner bars for mobile
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: isTablet ? 2 : 1.5,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  barFill: {
    height: '100%',
    borderRadius: isTablet ? 2 : 1.5,
  },
  healthBar: {
    backgroundColor: colors.health,
  },
  manaBar: {
    backgroundColor: colors.mana,
  },
  resourceValue: {
    fontSize: isTablet ? 6 : 5, // Smaller text for mobile
    color: colors.text,
    fontWeight: 'bold',
    minWidth: isTablet ? 14 : 12,
    textAlign: 'right',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  familiarBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: colors.success,
    borderRadius: 12,
    width: isTablet ? 22 : 18, // Smaller for mobile
    height: isTablet ? 22 : 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  familiarText: {
    fontSize: isTablet ? 10 : 8,
  },
  activeBadge: {
    position: 'absolute',
    top: isTablet ? 30 : 26, // Adjusted for smaller familiar badge
    right: 6,
    backgroundColor: colors.primary,
    borderRadius: 12,
    width: isTablet ? 22 : 18, // Smaller for mobile
    height: isTablet ? 22 : 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.surface,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  activeText: {
    fontSize: isTablet ? 10 : 8,
  },
  infoSection: {
    height: isTablet ? '40%' : '45%', // Better proportions for mobile
    padding: isTablet ? 8 : 6, // Reduced padding for mobile
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  characterDetails: {
    alignItems: 'center',
    marginBottom: 4, // Reduced margin
  },
  raceClassText: {
    fontSize: isTablet ? 10 : 8, // Smaller text for mobile
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  diceString: {
    fontSize: isTablet ? 12 : 10, // Smaller for mobile
    color: colors.gold,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  statsContainer: {
    marginBottom: 3, // Reduced margin
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 1, // Reduced gap
  },
  statItem: {
    alignItems: 'center',
    width: '30%',
    backgroundColor: colors.primaryDark,
    borderRadius: 4, // Smaller radius
    paddingVertical: isTablet ? 3 : 2, // Reduced padding
    paddingHorizontal: 1,
    marginBottom: 1, // Reduced margin
    borderWidth: 1,
    borderColor: colors.primary,
  },
  statLabel: {
    fontSize: isTablet ? 7 : 6, // Smaller text
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  statValue: {
    fontSize: isTablet ? 10 : 8, // Smaller text
    color: colors.text,
    fontWeight: 'bold',
  },
  effectsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 1, // Reduced gap
    marginBottom: 3,
  },
  effectBadge: {
    width: isTablet ? 14 : 12, // Smaller badges
    height: isTablet ? 14 : 12,
    borderRadius: isTablet ? 7 : 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surface,
  },
  buffBadge: {
    backgroundColor: colors.success,
  },
  debuffBadge: {
    backgroundColor: colors.error,
  },
  effectText: {
    fontSize: isTablet ? 7 : 6, // Smaller text
    fontWeight: 'bold',
    color: colors.text,
  },
  lastAction: {
    fontSize: isTablet ? 7 : 6, // Smaller text
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: isTablet ? 9 : 8, // Reduced line height
    marginBottom: 2,
  },
});