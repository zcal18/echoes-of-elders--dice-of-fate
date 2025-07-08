import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Character } from '@/types/game';
import colors from '@/constants/colors';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;

interface CharacterStatsProps {
  character: Character;
}

export default function CharacterStats({ character }: CharacterStatsProps) {
  // Ensure stats object exists
  const stats = character.stats || {
    strength: 0,
    dexterity: 0,
    constitution: 0,
    intelligence: 0,
    wisdom: 0,
    charisma: 0
  };
  
  // Calculate stat modifiers
  const calculateModifier = (stat: number) => {
    return Math.floor((stat - 10) / 2);
  };
  
  // Format modifier for display
  const formatModifier = (modifier: number) => {
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };
  
  // Calculate total stats from equipment
  const calculateEquipmentStats = () => {
    const equipmentStats = {
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0,
      attack: 0,
      defense: 0,
      health: 0,
      mana: 0
    };
    
    const equipment = character.equipment || {};
    Object.values(equipment).forEach(item => {
      if (item && item.stats) {
        equipmentStats.strength += item.stats.strength || 0;
        equipmentStats.dexterity += item.stats.dexterity || 0;
        equipmentStats.constitution += item.stats.constitution || 0;
        equipmentStats.intelligence += item.stats.intelligence || 0;
        equipmentStats.wisdom += item.stats.wisdom || 0;
        equipmentStats.charisma += item.stats.charisma || 0;
        equipmentStats.attack += item.stats.attack || 0;
        equipmentStats.defense += item.stats.defense || 0;
        equipmentStats.health += item.stats.health || 0;
        equipmentStats.mana += item.stats.mana || 0;
      }
    });
    
    return equipmentStats;
  };
  
  const equipmentStats = calculateEquipmentStats();
  const totalStats = {
    strength: stats.strength + equipmentStats.strength,
    dexterity: stats.dexterity + equipmentStats.dexterity,
    constitution: stats.constitution + equipmentStats.constitution,
    intelligence: stats.intelligence + equipmentStats.intelligence,
    wisdom: stats.wisdom + equipmentStats.wisdom,
    charisma: stats.charisma + equipmentStats.charisma
  };
  
  // Transform buffs/debuffs to the expected format for ReactivePlayerCard
  const transformBuffs = (buffs: any[] = []) => {
    if (!buffs || !Array.isArray(buffs)) return [];
    
    // If buffs are already in the correct format, return them
    if (buffs.length > 0 && typeof buffs[0] === 'object' && buffs[0].name) {
      return buffs;
    }
    
    // Otherwise, transform string buffs to objects
    return buffs.map(buff => ({
      name: typeof buff === 'string' ? buff : 'Buff',
      effect: typeof buff === 'string' ? buff : 'Effect',
      duration: 3,
      type: "attack" as const
    }));
  };
  
  const transformDebuffs = (debuffs: any[] = []) => {
    if (!debuffs || !Array.isArray(debuffs)) return [];
    
    // If debuffs are already in the correct format, return them
    if (debuffs.length > 0 && typeof debuffs[0] === 'object' && debuffs[0].name) {
      return debuffs;
    }
    
    // Otherwise, transform string debuffs to objects
    return debuffs.map(debuff => ({
      name: typeof debuff === 'string' ? debuff : 'Debuff',
      effect: typeof debuff === 'string' ? debuff : 'Effect',
      duration: 3,
      type: "defense" as const
    }));
  };
  
  // Calculate experience percentage
  const experiencePercentage = character.experienceToNextLevel 
    ? (character.experience / character.experienceToNextLevel) * 100 
    : 0;
  
  // Ensure buffs and debuffs are arrays and exist
  const buffs = character.buffs || [];
  const debuffs = character.debuffs || [];
  
  // Check if buffs and debuffs exist and have length before rendering status section
  const hasStatusEffects = (buffs && buffs.length > 0) || (debuffs && debuffs.length > 0);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Character Stats</Text>
      
      {/* Primary Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statName}>Strength</Text>
          <Text style={styles.statValue}>{totalStats.strength}</Text>
          <Text style={styles.statModifier}>
            {formatModifier(calculateModifier(totalStats.strength))}
          </Text>
          {equipmentStats.strength !== 0 && (
            <Text style={styles.equipmentBonus}>
              ({stats.strength} + {equipmentStats.strength})
            </Text>
          )}
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statName}>Dexterity</Text>
          <Text style={styles.statValue}>{totalStats.dexterity}</Text>
          <Text style={styles.statModifier}>
            {formatModifier(calculateModifier(totalStats.dexterity))}
          </Text>
          {equipmentStats.dexterity !== 0 && (
            <Text style={styles.equipmentBonus}>
              ({stats.dexterity} + {equipmentStats.dexterity})
            </Text>
          )}
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statName}>Constitution</Text>
          <Text style={styles.statValue}>{totalStats.constitution}</Text>
          <Text style={styles.statModifier}>
            {formatModifier(calculateModifier(totalStats.constitution))}
          </Text>
          {equipmentStats.constitution !== 0 && (
            <Text style={styles.equipmentBonus}>
              ({stats.constitution} + {equipmentStats.constitution})
            </Text>
          )}
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statName}>Intelligence</Text>
          <Text style={styles.statValue}>{totalStats.intelligence}</Text>
          <Text style={styles.statModifier}>
            {formatModifier(calculateModifier(totalStats.intelligence))}
          </Text>
          {equipmentStats.intelligence !== 0 && (
            <Text style={styles.equipmentBonus}>
              ({stats.intelligence} + {equipmentStats.intelligence})
            </Text>
          )}
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statName}>Wisdom</Text>
          <Text style={styles.statValue}>{totalStats.wisdom}</Text>
          <Text style={styles.statModifier}>
            {formatModifier(calculateModifier(totalStats.wisdom))}
          </Text>
          {equipmentStats.wisdom !== 0 && (
            <Text style={styles.equipmentBonus}>
              ({stats.wisdom} + {equipmentStats.wisdom})
            </Text>
          )}
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statName}>Charisma</Text>
          <Text style={styles.statValue}>{totalStats.charisma}</Text>
          <Text style={styles.statModifier}>
            {formatModifier(calculateModifier(totalStats.charisma))}
          </Text>
          {equipmentStats.charisma !== 0 && (
            <Text style={styles.equipmentBonus}>
              ({stats.charisma} + {equipmentStats.charisma})
            </Text>
          )}
        </View>
      </View>
      
      {/* Experience Bar */}
      <View style={styles.experienceSection}>
        <View style={styles.experienceHeader}>
          <Text style={styles.experienceLabel}>Experience</Text>
          <Text style={styles.experienceText}>
            {character.experience} / {character.experienceToNextLevel}
          </Text>
        </View>
        <View style={styles.experienceBar}>
          <View 
            style={[
              styles.experienceProgress,
              { width: `${experiencePercentage}%` }
            ]}
          />
        </View>
      </View>
      
      {/* Status Effects - Only render if there are status effects */}
      {hasStatusEffects && (
        <View style={styles.statusSection}>
          <Text style={styles.statusTitle}>Status Effects</Text>
          
          <View style={styles.statusContainer}>
            {buffs && buffs.length > 0 && (
              <View style={styles.statusGroup}>
                <Text style={styles.statusGroupTitle}>Buffs</Text>
                {transformBuffs(buffs).map((buff, index) => (
                  <View key={`buff-${index}`} style={styles.statusItem}>
                    <View style={[styles.statusDot, styles.buffDot]} />
                    <Text style={styles.statusName}>{buff.name}</Text>
                    <Text style={styles.statusDuration}>({buff.duration})</Text>
                  </View>
                ))}
              </View>
            )}
            
            {debuffs && debuffs.length > 0 && (
              <View style={styles.statusGroup}>
                <Text style={styles.statusGroupTitle}>Debuffs</Text>
                {transformDebuffs(debuffs).map((debuff, index) => (
                  <View key={`debuff-${index}`} style={styles.statusItem}>
                    <View style={[styles.statusDot, styles.debuffDot]} />
                    <Text style={styles.statusName}>{debuff.name}</Text>
                    <Text style={styles.statusDuration}>({debuff.duration})</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: isTablet ? 20 : 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: isTablet ? 16 : 12,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: colors.primaryDark,
    borderRadius: 12,
    padding: isTablet ? 16 : 12,
    alignItems: 'center',
    width: isTablet ? '30%' : '30%',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  statName: {
    fontSize: isTablet ? 14 : 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  statModifier: {
    fontSize: isTablet ? 16 : 14,
    color: colors.primaryLight,
    fontWeight: 'bold',
  },
  equipmentBonus: {
    fontSize: isTablet ? 12 : 10,
    color: colors.primary,
    fontWeight: '500',
    marginTop: 2,
  },
  experienceSection: {
    marginBottom: 16,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  experienceLabel: {
    fontSize: isTablet ? 16 : 14,
    color: colors.textSecondary,
  },
  experienceText: {
    fontSize: isTablet ? 14 : 12,
    color: colors.textSecondary,
  },
  experienceBar: {
    height: isTablet ? 12 : 8,
    backgroundColor: colors.surfaceDark,
    borderRadius: isTablet ? 6 : 4,
    overflow: 'hidden',
  },
  experienceProgress: {
    height: '100%',
    backgroundColor: colors.experience,
    borderRadius: isTablet ? 6 : 4,
  },
  statusSection: {
    marginTop: 8,
  },
  statusTitle: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusGroup: {
    flex: 1,
  },
  statusGroupTitle: {
    fontSize: isTablet ? 14 : 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusDot: {
    width: isTablet ? 10 : 8,
    height: isTablet ? 10 : 8,
    borderRadius: isTablet ? 5 : 4,
    marginRight: 8,
  },
  buffDot: {
    backgroundColor: colors.success,
  },
  debuffDot: {
    backgroundColor: colors.error,
  },
  statusName: {
    fontSize: isTablet ? 14 : 12,
    color: colors.text,
    flex: 1,
  },
  statusDuration: {
    fontSize: isTablet ? 12 : 10,
    color: colors.textSecondary,
  },
});