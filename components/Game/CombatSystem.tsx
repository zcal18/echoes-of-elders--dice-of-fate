import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { Enemy } from '@/types/game';
import colors from '@/constants/colors';
import { useGameStore } from '@/hooks/useGameStore';
import { enhancedAttackRoll, enemyAttackRoll, damageRoll, calculateModifier, rollDice } from '@/utils/diceRolls';
import { getAllEnemies } from '@/constants/enemies';

export default function CombatSystem() {
  const [selectedEnemy, setSelectedEnemy] = useState<Enemy | null>(null);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [inCombat, setInCombat] = useState(false);
  const [enemyHealth, setEnemyHealth] = useState(0);
  const [playerTurn, setPlayerTurn] = useState(true);
  const [waitingForEnemyTurn, setWaitingForEnemyTurn] = useState(false);
  
  const { 
    activeCharacter, 
    gainExperience,
    gainGold,
    updateCharacterHealth,
    addNotification
  } = useGameStore();
  
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
  
  const startCombat = (enemy: Enemy) => {
    // Check if character is fainted
    if (isCharacterFainted()) {
      Alert.alert(
        'Character Fainted',
        'Your character has fainted and cannot battle. Use a revive potion to restore them.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setSelectedEnemy(enemy);
    setEnemyHealth(enemy.health.max);
    setInCombat(true);
    setWaitingForEnemyTurn(false);
    setCombatLog([`⚔️ You encounter a ${enemy.name}!`]);
    
    // Enhanced initiative with player advantage
    const playerInitiative = rollDice(20) + calculateModifier(activeCharacter.stats.dexterity) + 3; // +3 player advantage
    const enemyInitiative = rollDice(20) + calculateModifier(enemy.stats.dexterity);
    
    const playerGoesFirst = playerInitiative >= enemyInitiative;
    setPlayerTurn(playerGoesFirst);
    
    setCombatLog(prev => [
      `🎲 Initiative: You (${playerInitiative}) vs ${enemy.name} (${enemyInitiative})`,
      playerGoesFirst ? '⚡ You go first!' : `⚡ ${enemy.name} goes first!`,
      ...prev
    ]);
    
    // If enemy goes first, set up for their turn
    if (!playerGoesFirst) {
      setWaitingForEnemyTurn(true);
      setCombatLog(prev => [
        `${enemy.name} prepares to attack...`,
        ...prev
      ]);
      
      // Auto-trigger enemy attack
      setTimeout(() => {
        if (inCombat && selectedEnemy) {
          performEnemyAttack(enemy);
        }
      }, 2000);
    }
  };

  // Manual trigger for enemy turn (backup)
  const triggerEnemyTurn = () => {
    if (selectedEnemy && !playerTurn && waitingForEnemyTurn) {
      setWaitingForEnemyTurn(false);
      performEnemyAttack(selectedEnemy);
    }
  };
  
  const performPlayerAttack = () => {
    if (!selectedEnemy || !inCombat || !playerTurn) return;
    
    // Check if character is fainted
    if (isCharacterFainted()) {
      Alert.alert(
        'Character Fainted',
        'Your character has fainted and cannot perform actions. Use a revive potion to restore them.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    const mainHandWeapon = activeCharacter.equipment?.mainHand;
    const attackStat = mainHandWeapon?.stats?.dexterity 
      ? 'dexterity'
      : 'strength';
    
    const attackModifier = calculateModifier(activeCharacter.stats[attackStat]);
    const equipmentBonus = mainHandWeapon?.stats?.attack || 0;
    
    // Use enhanced attack roll with player advantages
    const attackResult = enhancedAttackRoll(
      attackModifier,
      activeCharacter.level,
      0, // buffs
      0, // debuffs
      equipmentBonus,
      false, // hasEnhancedDice
      true, // isPlayer
      false, // advantage
      0, // researchBonus
      0  // spellBonus
    );
    
    if (attackResult.isFumble) {
      const fumbleMessage = `💥 CRITICAL MISS! ${attackResult.breakdown}`;
      setCombatLog(prev => [fumbleMessage, ...prev]);
      
      setPlayerTurn(false);
      setWaitingForEnemyTurn(true);
      
      setTimeout(() => {
        if (selectedEnemy && inCombat) {
          setWaitingForEnemyTurn(false);
          performEnemyAttack(selectedEnemy);
        }
      }, 1000);
      
      return;
    }
    
    const enemyAC = selectedEnemy.armorClass || (10 + calculateModifier(selectedEnemy.stats.dexterity));
    
    if (attackResult.roll >= enemyAC || attackResult.isCritical) {
      // Calculate damage using enhanced damage roll
      const weaponDice = mainHandWeapon ? 1 : 1;
      const weaponDie = mainHandWeapon ? 6 : 4;
      const damageModifier = calculateModifier(activeCharacter.stats[attackStat]);
      
      const damageResult = damageRoll(
        weaponDice,
        weaponDie,
        damageModifier,
        attackResult.isCritical,
        Math.floor(activeCharacter.level / 2), // levelBonus
        equipmentBonus,
        0, // spellBonus
        0, // researchBonus
        1  // behaviorMultiplier
      );
      
      if (attackResult.isCritical) {
        setCombatLog(prev => [
          `🔥 CRITICAL HIT! ${attackResult.breakdown}`,
          `💀 Damage: ${damageResult.breakdown}`,
          ...prev
        ]);
      } else {
        setCombatLog(prev => [
          `⚔️ Hit! ${attackResult.breakdown} vs AC ${enemyAC}`,
          `💀 Damage: ${damageResult.breakdown}`,
          ...prev
        ]);
      }
      
      const newEnemyHealth = Math.max(0, enemyHealth - damageResult.damage);
      setEnemyHealth(newEnemyHealth);
      
      if (newEnemyHealth <= 0) {
        const victoryMessage = `🏆 Victory! You defeated the ${selectedEnemy.name}!`;
        setCombatLog(prev => [victoryMessage, ...prev]);
        
        const levelBonus = Math.max(1, selectedEnemy.level - activeCharacter.level + 1);
        const xpReward = Math.floor(selectedEnemy.loot.experience * levelBonus);
        const goldReward = Math.floor((Math.random() * 
          (selectedEnemy.loot.gold.max - selectedEnemy.loot.gold.min + 1)) + 
          selectedEnemy.loot.gold.min) * levelBonus;
        
        gainExperience(xpReward);
        gainGold(goldReward);
        
        const rewardMessage = `💰 Rewards: +${xpReward} XP, +${goldReward} gold!`;
        setCombatLog(prev => [rewardMessage, ...prev]);
        
        // Detailed victory notification
        addNotification(`🎉 Victory! Defeated ${selectedEnemy.name} and gained ${xpReward} XP and ${goldReward} gold!`, 'success');
        
        setInCombat(false);
        setWaitingForEnemyTurn(false);
        return;
      }
    } else {
      const missMessage = `❌ Miss! ${attackResult.breakdown} vs AC ${enemyAC}`;
      setCombatLog(prev => [missMessage, ...prev]);
    }
    
    setPlayerTurn(false);
    setWaitingForEnemyTurn(true);
    
    setTimeout(() => {
      if (selectedEnemy && inCombat) {
        setWaitingForEnemyTurn(false);
        performEnemyAttack(selectedEnemy);
      }
    }, 1000);
  };
  
  const performEnemyAttack = (enemy: Enemy) => {
    if (!inCombat) return;
    
    setWaitingForEnemyTurn(false);
    
    const attack = enemy.attacks[Math.floor(Math.random() * enemy.attacks.length)];
    const enemyHealthPercent = (enemyHealth / enemy.health.max) * 100;
    
    // Use enhanced enemy attack roll with AI behavior
    const attackResult = enemyAttackRoll(
      calculateModifier(enemy.stats.strength),
      enemy.level,
      enemyHealthPercent < 25 ? 'desperate' : 'normal',
      enemyHealthPercent
    );
    
    if (attackResult.isFumble) {
      const fumbleMessage = `💥 ${enemy.name} CRITICAL MISS! ${attackResult.breakdown}`;
      setCombatLog(prev => [fumbleMessage, ...prev]);
      
      setPlayerTurn(true);
      return;
    }
    
    let playerAC = 10 + calculateModifier(activeCharacter.stats.dexterity);
    
    if (activeCharacter.equipment?.chest) {
      playerAC += 2;
    }
    if (activeCharacter.equipment?.offHand && activeCharacter.equipment.offHand.name.includes('Shield')) {
      playerAC += 2;
    }
    
    if (attackResult.roll >= playerAC || attackResult.isCritical) {
      // Calculate enemy damage using enhanced damage roll
      const damageResult = damageRoll(
        1, // diceCount
        enemy.damageDie || 6,
        calculateModifier(enemy.stats.strength),
        attackResult.isCritical,
        Math.floor(enemy.level / 2), // levelBonus
        0, // equipmentBonus
        0, // spellBonus
        0, // researchBonus
        enemyHealthPercent < 25 ? 1.5 : 1 // desperate behavior multiplier
      );
      
      if (attackResult.isCritical) {
        setCombatLog(prev => [
          `🔥 ${enemy.name} CRITICAL HIT! ${attackResult.breakdown}`,
          `💀 ${attack.name}: ${damageResult.breakdown}`,
          ...prev
        ]);
      } else {
        setCombatLog(prev => [
          `⚔️ ${enemy.name} hits! ${attackResult.breakdown} vs AC ${playerAC}`,
          `💀 ${attack.name}: ${damageResult.breakdown}`,
          ...prev
        ]);
      }
      
      const newHealth = activeCharacter.health.current - damageResult.damage;
      updateCharacterHealth(activeCharacter.id, newHealth);
      
      if (newHealth <= 0) {
        const defeatMessage = `💀 Defeat! You have been defeated by the ${enemy.name}! Your character has fainted.`;
        setCombatLog(prev => [defeatMessage, ...prev]);
        
        // Detailed defeat notification
        addNotification(`💀 Defeat! You were defeated by ${enemy.name} and have fainted. Use a revive potion to continue.`, 'error');
        
        setInCombat(false);
        setWaitingForEnemyTurn(false);
        return;
      }
    } else {
      const missMessage = `❌ ${enemy.name} misses! ${attackResult.breakdown} vs AC ${playerAC}`;
      setCombatLog(prev => [missMessage, ...prev]);
    }
    
    setPlayerTurn(true);
  };
  
  const fleeCombat = () => {
    if (!selectedEnemy || !inCombat || !playerTurn) return;
    
    // Check if character is fainted
    if (isCharacterFainted()) {
      Alert.alert(
        'Character Fainted',
        'Your character has fainted and cannot perform actions. Use a revive potion to restore them.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    const escapeRoll = rollDice(20) + calculateModifier(activeCharacter.stats.dexterity);
    const difficultyDC = 8 + Math.floor(selectedEnemy.level / 3);
    
    if (escapeRoll >= difficultyDC) {
      const fleeMessage = `🏃 You successfully flee from the ${selectedEnemy.name}! (${escapeRoll} vs DC ${difficultyDC})`;
      setCombatLog(prev => [fleeMessage, ...prev]);
      
      addNotification(`🏃 Successfully fled from ${selectedEnemy.name}!`, 'info');
      
      setInCombat(false);
      setWaitingForEnemyTurn(false);
    } else {
      const failFleeMessage = `❌ You fail to escape! (${escapeRoll} vs DC ${difficultyDC})`;
      setCombatLog(prev => [failFleeMessage, ...prev]);
      
      setPlayerTurn(false);
      setWaitingForEnemyTurn(true);
      
      setTimeout(() => {
        if (selectedEnemy && inCombat) {
          setWaitingForEnemyTurn(false);
          performEnemyAttack(selectedEnemy);
        }
      }, 1000);
    }
  };
  
  const renderEnemyList = () => {
    const allEnemies = getAllEnemies();
    const availableEnemies = allEnemies.filter(enemy => 
      enemy.requiredLevel <= activeCharacter.level + 5 // Allow challenging enemies
    );
    
    return (
      <ScrollView style={styles.scrollView}>
        <Text style={styles.sectionTitle}>⚔️ Available Enemies</Text>
        <Text style={styles.subtitle}>Face legendary foes from the realm of shadows</Text>
        
        {isCharacterFainted() && (
          <View style={styles.faintedWarning}>
            <Text style={styles.faintedWarningText}>
              ⚠️ Your character has fainted! Use a revive potion from your inventory to continue battling.
            </Text>
          </View>
        )}
        
        {availableEnemies.map(enemy => {
          const difficultyColor = enemy.level > activeCharacter.level + 2 ? colors.error :
                                 enemy.level < activeCharacter.level - 2 ? colors.success :
                                 colors.warning;
          
          return (
            <TouchableOpacity
              key={enemy.id}
              style={[
                styles.enemyCard, 
                { borderLeftColor: difficultyColor },
                isCharacterFainted() && styles.disabledEnemyCard
              ]}
              onPress={() => startCombat(enemy)}
              disabled={isCharacterFainted()}
            >
              <View style={styles.enemyCardContent}>
                <View style={styles.enemyImageContainer}>
                  {enemy.imageUrl ? (
                    <Image 
                      source={{ uri: enemy.imageUrl }} 
                      style={styles.enemyImage}
                      onError={() => {
                        console.log('Failed to load enemy image:', enemy.imageUrl);
                      }}
                    />
                  ) : (
                    <View style={styles.enemyImagePlaceholder}>
                      <Text style={styles.enemyImageInitial}>
                        {enemy.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.enemyInfo}>
                  <View style={styles.enemyHeader}>
                    <Text style={styles.enemyName}>{enemy.name}</Text>
                    <View style={styles.enemyLevelContainer}>
                      <Text style={[styles.enemyLevel, { color: difficultyColor }]}>
                        Level {enemy.level}
                      </Text>
                      {enemy.level > activeCharacter.level + 2 && (
                        <Text style={styles.difficultyWarning}>⚠️ Dangerous</Text>
                      )}
                    </View>
                  </View>
                  <Text style={styles.enemyDescription}>{enemy.description}</Text>
                  <View style={styles.enemyStats}>
                    <Text style={styles.enemyHealth}>❤️ {enemy.health.max} HP</Text>
                    <Text style={styles.enemyXp}>⭐ {enemy.loot.experience} XP</Text>
                    <Text style={styles.enemyGold}>💰 {enemy.loot.gold.min}-{enemy.loot.gold.max} Gold</Text>
                  </View>
                  {enemy.lore && (
                    <Text style={styles.enemyLore}>{enemy.lore}</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };
  
  const renderCombatInterface = () => {
    if (!selectedEnemy) return null;
    
    const healthPercentage = (enemyHealth / selectedEnemy.health.max) * 100;
    const playerHealthPercentage = (activeCharacter.health.current / activeCharacter.health.max) * 100;
    
    return (
      <View style={styles.combatInterface}>
        <View style={styles.combatHeader}>
          <View style={styles.combatParticipant}>
            <Text style={styles.participantName}>{activeCharacter.name}</Text>
            <View style={styles.healthBarContainer}>
              <View 
                style={[
                  styles.healthBar,
                  { width: `${playerHealthPercentage}%`, backgroundColor: colors.health }
                ]} 
              />
            </View>
            <Text style={styles.healthText}>
              {activeCharacter.health.current}/{activeCharacter.health.max} HP
            </Text>
            {isCharacterFainted() && (
              <Text style={styles.faintedStatus}>💀 FAINTED</Text>
            )}
          </View>
          
          <Text style={styles.vsText}>VS</Text>
          
          <View style={styles.combatParticipant}>
            <Text style={styles.participantName}>{selectedEnemy.name}</Text>
            <View style={styles.healthBarContainer}>
              <View 
                style={[
                  styles.healthBar,
                  { width: `${healthPercentage}%`, backgroundColor: colors.error }
                ]} 
              />
            </View>
            <Text style={styles.healthText}>
              {enemyHealth}/{selectedEnemy.health.max} HP
            </Text>
          </View>
        </View>
        
        <View style={styles.combatLogContainer}>
          <Text style={styles.combatLogTitle}>⚔️ Combat Log</Text>
          <ScrollView 
            style={styles.combatLogScroll}
            ref={(ref) => {
              if (ref && combatLog.length > 0) {
                ref.scrollToEnd({ animated: true });
              }
            }}
          >
            {combatLog.map((log, index) => (
              <Text key={`log-${index}-${Date.now()}`} style={styles.combatLogEntry}>
                {log}
              </Text>
            ))}
          </ScrollView>
        </View>
        
        <View style={styles.combatActions}>
          <TouchableOpacity 
            style={[
              styles.actionButton,
              (!playerTurn || isCharacterFainted()) && styles.disabledButton
            ]}
            onPress={performPlayerAttack}
            disabled={!playerTurn || !inCombat || isCharacterFainted()}
          >
            <Text style={styles.actionButtonText}>⚔️ Attack</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.actionButton,
              styles.fleeButton,
              (!playerTurn || isCharacterFainted()) && styles.disabledButton
            ]}
            onPress={fleeCombat}
            disabled={!playerTurn || !inCombat || isCharacterFainted()}
          >
            <Text style={styles.actionButtonText}>🏃 Flee</Text>
          </TouchableOpacity>

          {waitingForEnemyTurn && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.triggerButton]}
              onPress={triggerEnemyTurn}
            >
              <Text style={styles.actionButtonText}>⏩ Enemy Turn</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {!playerTurn && !waitingForEnemyTurn && (
          <Text style={styles.turnIndicator}>Enemy's Turn...</Text>
        )}
        {waitingForEnemyTurn && (
          <Text style={styles.turnIndicator}>Waiting for enemy to act... (tap Enemy Turn if stuck)</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {inCombat ? (
        renderCombatInterface()
      ) : (
        renderEnemyList()
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  faintedWarning: {
    backgroundColor: colors.errorLight + '20',
    borderColor: colors.error,
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  faintedWarningText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  enemyCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledEnemyCard: {
    opacity: 0.5,
  },
  enemyCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  enemyImageContainer: {
    marginRight: 16,
  },
  enemyImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: colors.surfaceDark,
  },
  enemyImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  enemyImageInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  enemyInfo: {
    flex: 1,
  },
  enemyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  enemyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  enemyLevelContainer: {
    alignItems: 'flex-end',
  },
  enemyLevel: {
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyWarning: {
    fontSize: 10,
    color: colors.error,
    marginTop: 2,
  },
  enemyDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  enemyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  enemyHealth: {
    fontSize: 14,
    color: colors.health,
    fontWeight: '600',
  },
  enemyXp: {
    fontSize: 14,
    color: colors.experience,
    fontWeight: '600',
  },
  enemyGold: {
    fontSize: 14,
    color: colors.gold,
    fontWeight: '600',
  },
  enemyLore: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
  },
  combatInterface: {
    flex: 1,
  },
  combatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  combatParticipant: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  healthBarContainer: {
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  healthBar: {
    height: '100%',
  },
  healthText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  faintedStatus: {
    fontSize: 12,
    color: colors.error,
    fontWeight: 'bold',
    marginTop: 2,
  },
  vsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginHorizontal: 16,
  },
  combatLogContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  combatLogTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  combatLogScroll: {
    flex: 1,
  },
  combatLogEntry: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    lineHeight: 20,
  },
  combatActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  fleeButton: {
    backgroundColor: colors.error,
  },
  triggerButton: {
    backgroundColor: colors.warning,
  },
  disabledButton: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  turnIndicator: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
});