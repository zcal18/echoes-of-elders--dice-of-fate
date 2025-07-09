import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, Modal } from 'react-native';
import { Enemy } from '@/types/game';
import colors from '@/constants/colors';
import { useGameStore } from '@/hooks/useGameStore';
import { enhancedAttackRoll, enemyAttackRoll, damageRoll, calculateModifier, rollDice } from '@/utils/diceRolls';
import { getAllEnemies } from '@/constants/enemies';
import { Sword, Shield, Zap, Heart, Package, X, FastForward } from 'lucide-react-native';

type AttackType = 'melee' | 'magic' | 'special';
type SpecialMove = 'charge' | 'heal' | 'defend' | 'poison' | 'confuse';

export default function CombatSystem() {
  const [selectedEnemy, setSelectedEnemy] = useState<Enemy | null>(null);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [inCombat, setInCombat] = useState(false);
  const [enemyHealth, setEnemyHealth] = useState(0);
  const [playerTurn, setPlayerTurn] = useState(true);
  const [waitingForEnemyTurn, setWaitingForEnemyTurn] = useState(false);
  const [showAttackModal, setShowAttackModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [playerCharge, setPlayerCharge] = useState(0);
  const [enemyStatusEffects, setEnemyStatusEffects] = useState<string[]>([]);
  
  const { 
    activeCharacter, 
    gainExperience,
    gainGold,
    updateCharacterHealth,
    addNotification,
    useItem
  } = useGameStore();
  
  if (!activeCharacter) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No character selected</Text>
      </View>
    );
  }
  
  const isCharacterFainted = () => {
    return activeCharacter.health.current <= 0;
  };
  
  const getUsableItems = () => {
    return activeCharacter.inventory?.filter(item => 
      item.type === 'potion' && item.effects?.some(effect => 
        effect.type === 'heal' || effect.type === 'revive'
      )
    ) || [];
  };
  
  const startCombat = (enemy: Enemy) => {
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
    setPlayerCharge(0);
    setEnemyStatusEffects([]);
    setCombatLog([`⚔️ You encounter a ${enemy.name}!`]);
    
    const playerInitiative = rollDice(20) + calculateModifier(activeCharacter.stats.dexterity) + 3;
    const enemyInitiative = rollDice(20) + calculateModifier(enemy.stats.dexterity);
    
    const playerGoesFirst = playerInitiative >= enemyInitiative;
    setPlayerTurn(playerGoesFirst);
    
    setCombatLog(prev => [
      `🎲 Initiative: You (${playerInitiative}) vs ${enemy.name} (${enemyInitiative})`,
      playerGoesFirst ? '⚡ You go first!' : `⚡ ${enemy.name} goes first!`,
      ...prev
    ]);
    
    if (!playerGoesFirst) {
      setWaitingForEnemyTurn(true);
      setTimeout(() => {
        if (inCombat && selectedEnemy) {
          performEnemyAttack(enemy);
        }
      }, 2000);
    }
  };

  const performAttack = (attackType: AttackType, specialMove?: SpecialMove) => {
    if (!selectedEnemy || !inCombat || !playerTurn) return;
    
    if (isCharacterFainted()) {
      Alert.alert('Character Fainted', 'Your character has fainted and cannot perform actions.');
      return;
    }
    
    setShowAttackModal(false);
    
    if (attackType === 'special' && specialMove) {
      performSpecialMove(specialMove);
      return;
    }
    
    const mainHandWeapon = activeCharacter.equipment?.mainHand;
    const attackStat = attackType === 'magic' ? 'intelligence' : 
                     mainHandWeapon?.stats?.dexterity ? 'dexterity' : 'strength';
    
    const attackModifier = calculateModifier(activeCharacter.stats[attackStat]);
    const equipmentBonus = mainHandWeapon?.stats?.attack || 0;
    const chargeBonus = playerCharge;
    
    const attackResult = enhancedAttackRoll(
      attackModifier,
      activeCharacter.level,
      chargeBonus,
      0,
      equipmentBonus,
      false,
      true,
      false,
      0,
      attackType === 'magic' ? 5 : 0
    );
    
    if (attackResult.isFumble) {
      const fumbleMessage = `💥 CRITICAL MISS! ${attackResult.breakdown}`;
      setCombatLog(prev => [fumbleMessage, ...prev]);
      setPlayerCharge(0);
      endPlayerTurn();
      return;
    }
    
    const enemyAC = selectedEnemy.armorClass || (10 + calculateModifier(selectedEnemy.stats.dexterity));
    
    if (attackResult.roll >= enemyAC || attackResult.isCritical) {
      const weaponDice = mainHandWeapon ? 1 : 1;
      const weaponDie = attackType === 'magic' ? 8 : (mainHandWeapon ? 6 : 4);
      const damageModifier = calculateModifier(activeCharacter.stats[attackStat]);
      
      const damageResult = damageRoll(
        weaponDice,
        weaponDie,
        damageModifier,
        attackResult.isCritical,
        Math.floor(activeCharacter.level / 2),
        equipmentBonus + chargeBonus,
        attackType === 'magic' ? 3 : 0,
        0,
        1
      );
      
      const attackTypeText = attackType === 'magic' ? '🔮 Magic Attack!' : 
                           attackType === 'melee' ? '⚔️ Melee Attack!' : '💥 Attack!';
      
      if (attackResult.isCritical) {
        setCombatLog(prev => [
          `🔥 CRITICAL HIT! ${attackTypeText} ${attackResult.breakdown}`,
          `💀 Damage: ${damageResult.breakdown}`,
          ...prev
        ]);
      } else {
        setCombatLog(prev => [
          `${attackTypeText} ${attackResult.breakdown} vs AC ${enemyAC}`,
          `💀 Damage: ${damageResult.breakdown}`,
          ...prev
        ]);
      }
      
      const newEnemyHealth = Math.max(0, enemyHealth - damageResult.damage);
      setEnemyHealth(newEnemyHealth);
      
      if (newEnemyHealth <= 0) {
        handleVictory();
        return;
      }
    } else {
      const attackTypeText = attackType === 'magic' ? 'Magic Attack' : 'Melee Attack';
      const missMessage = `❌ ${attackTypeText} missed! ${attackResult.breakdown} vs AC ${enemyAC}`;
      setCombatLog(prev => [missMessage, ...prev]);
    }
    
    setPlayerCharge(0);
    endPlayerTurn();
  };
  
  const performSpecialMove = (specialMove: SpecialMove) => {
    switch (specialMove) {
      case 'charge':
        setPlayerCharge(prev => prev + 3);
        setCombatLog(prev => [`⚡ You charge up for your next attack! (+3 damage)`, ...prev]);
        break;
        
      case 'heal':
        const healAmount = 15 + calculateModifier(activeCharacter.stats.wisdom);
        const newHealth = Math.min(
          activeCharacter.health.max,
          activeCharacter.health.current + healAmount
        );
        updateCharacterHealth(activeCharacter.id, newHealth);
        setCombatLog(prev => [`💚 You heal yourself for ${healAmount} HP!`, ...prev]);
        break;
        
      case 'defend':
        setCombatLog(prev => [`🛡️ You take a defensive stance! (Reduced damage next turn)`, ...prev]);
        break;
        
      case 'poison':
        if (rollDice(20) + calculateModifier(activeCharacter.stats.intelligence) >= 12) {
          setEnemyStatusEffects(prev => [...prev, 'poisoned']);
          setCombatLog(prev => [`☠️ ${selectedEnemy?.name} is poisoned!`, ...prev]);
        } else {
          setCombatLog(prev => [`❌ Poison attempt failed!`, ...prev]);
        }
        break;
        
      case 'confuse':
        if (rollDice(20) + calculateModifier(activeCharacter.stats.charisma) >= 14) {
          setEnemyStatusEffects(prev => [...prev, 'confused']);
          setCombatLog(prev => [`😵 ${selectedEnemy?.name} is confused!`, ...prev]);
        } else {
          setCombatLog(prev => [`❌ Confusion attempt failed!`, ...prev]);
        }
        break;
    }
    
    endPlayerTurn();
  };
  
  const handleItemUse = (itemId: string) => {
    const success = useItem(itemId);
    if (success) {
      const item = activeCharacter.inventory?.find(i => i.id === itemId);
      setCombatLog(prev => [`🧪 Used ${item?.name}!`, ...prev]);
      setShowItemModal(false);
      endPlayerTurn();
    }
  };
  
  const endPlayerTurn = () => {
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
    
    // Apply status effects
    if (enemyStatusEffects.includes('poisoned')) {
      const poisonDamage = 5;
      const newHealth = Math.max(0, enemyHealth - poisonDamage);
      setEnemyHealth(newHealth);
      setCombatLog(prev => [`☠️ ${enemy.name} takes ${poisonDamage} poison damage!`, ...prev]);
      
      if (newHealth <= 0) {
        handleVictory();
        return;
      }
    }
    
    if (enemyStatusEffects.includes('confused') && rollDice(20) <= 10) {
      setCombatLog(prev => [`😵 ${enemy.name} is too confused to attack!`, ...prev]);
      setPlayerTurn(true);
      return;
    }
    
    const attack = enemy.attacks[Math.floor(Math.random() * enemy.attacks.length)];
    const enemyHealthPercent = (enemyHealth / enemy.health.max) * 100;
    
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
      const damageResult = damageRoll(
        1,
        enemy.damageDie || 6,
        calculateModifier(enemy.stats.strength),
        attackResult.isCritical,
        Math.floor(enemy.level / 2),
        0,
        0,
        0,
        enemyHealthPercent < 25 ? 1.5 : 1
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
        handleDefeat();
        return;
      }
    } else {
      const missMessage = `❌ ${enemy.name} misses! ${attackResult.breakdown} vs AC ${playerAC}`;
      setCombatLog(prev => [missMessage, ...prev]);
    }
    
    setPlayerTurn(true);
  };
  
  const forceAdvanceEnemyTurn = () => {
    if (!selectedEnemy || !inCombat) return;
    
    Alert.alert(
      'Force Advance Turn',
      'This will force the enemy to take their turn immediately. Use this if the game seems stuck.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Advance', 
          style: 'destructive',
          onPress: () => {
            setCombatLog(prev => [`⚡ Turn advanced manually!`, ...prev]);
            setWaitingForEnemyTurn(false);
            
            if (!playerTurn) {
              // If it's enemy turn, force them to attack
              performEnemyAttack(selectedEnemy);
            } else {
              // If it's player turn but something is stuck, just ensure it's player turn
              setPlayerTurn(true);
              setWaitingForEnemyTurn(false);
            }
          }
        }
      ]
    );
  };
  
  const handleVictory = () => {
    if (!selectedEnemy) return;
    
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
    
    addNotification(`🎉 Victory! Defeated ${selectedEnemy.name} and gained ${xpReward} XP and ${goldReward} gold!`, 'success');
    
    setInCombat(false);
    setWaitingForEnemyTurn(false);
  };
  
  const handleDefeat = () => {
    if (!selectedEnemy) return;
    
    const defeatMessage = `💀 Defeat! You have been defeated by the ${selectedEnemy.name}! Your character has fainted.`;
    setCombatLog(prev => [defeatMessage, ...prev]);
    
    addNotification(`💀 Defeat! You were defeated by ${selectedEnemy.name} and have fainted. Use a revive potion to continue.`, 'error');
    
    setInCombat(false);
    setWaitingForEnemyTurn(false);
  };
  
  const fleeCombat = () => {
    if (!selectedEnemy || !inCombat || !playerTurn) return;
    
    if (isCharacterFainted()) {
      Alert.alert('Character Fainted', 'Your character has fainted and cannot perform actions.');
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
      
      endPlayerTurn();
    }
  };
  
  const renderEnemyList = () => {
    const allEnemies = getAllEnemies();
    const availableEnemies = allEnemies.filter(enemy => 
      enemy.requiredLevel <= activeCharacter.level + 5
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
    const usableItems = getUsableItems();
    
    return (
      <View style={styles.combatInterface}>
        <View style={styles.combatHeader}>
          <View style={styles.combatParticipant}>
            {/* Player Profile Picture Thumbnail */}
            <View style={styles.profileThumbnailContainer}>
              {activeCharacter.profileImage ? (
                <Image 
                  source={{ uri: activeCharacter.profileImage }} 
                  style={styles.profileThumbnail}
                  defaultSource={require('@/assets/images/icon.png')}
                />
              ) : (
                <View style={styles.profileThumbnailPlaceholder}>
                  <Text style={styles.profileThumbnailText}>
                    {activeCharacter.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
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
            {playerCharge > 0 && (
              <Text style={styles.chargeStatus}>⚡ Charged (+{playerCharge})</Text>
            )}
          </View>
          
          <Text style={styles.vsText}>VS</Text>
          
          <View style={styles.combatParticipant}>
            {/* Enemy Profile Picture Thumbnail */}
            <View style={styles.profileThumbnailContainer}>
              {selectedEnemy.imageUrl || selectedEnemy.profileImage ? (
                <Image 
                  source={{ uri: selectedEnemy.imageUrl || selectedEnemy.profileImage }} 
                  style={styles.profileThumbnail}
                  defaultSource={require('@/assets/images/icon.png')}
                />
              ) : (
                <View style={styles.profileThumbnailPlaceholder}>
                  <Text style={styles.profileThumbnailText}>
                    {selectedEnemy.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
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
            {enemyStatusEffects.length > 0 && (
              <Text style={styles.statusEffects}>
                {enemyStatusEffects.includes('poisoned') && '☠️ '}
                {enemyStatusEffects.includes('confused') && '😵 '}
              </Text>
            )}
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
            onPress={() => setShowAttackModal(true)}
            disabled={!playerTurn || !inCombat || isCharacterFainted()}
          >
            <Sword size={16} color={colors.text} />
            <Text style={styles.actionButtonText}>Attack</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.actionButton,
              (!playerTurn || isCharacterFainted() || usableItems.length === 0) && styles.disabledButton
            ]}
            onPress={() => setShowItemModal(true)}
            disabled={!playerTurn || !inCombat || isCharacterFainted() || usableItems.length === 0}
          >
            <Package size={16} color={colors.text} />
            <Text style={styles.actionButtonText}>Use Item</Text>
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
        </View>
        
        {/* Gold Advance Button - Only show when not player turn or when waiting */}
        {(!playerTurn || waitingForEnemyTurn) && (
          <View style={styles.advanceButtonContainer}>
            <TouchableOpacity 
              style={styles.goldAdvanceButton}
              onPress={forceAdvanceEnemyTurn}
            >
              <FastForward size={16} color="#000" />
              <Text style={styles.goldAdvanceButtonText}>Force Advance Turn</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {!playerTurn && !waitingForEnemyTurn && (
          <Text style={styles.turnIndicator}>Enemy's Turn...</Text>
        )}
        {waitingForEnemyTurn && (
          <Text style={styles.turnIndicator}>Enemy preparing to attack...</Text>
        )}
        
        {/* Attack Selection Modal */}
        <Modal
          visible={showAttackModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowAttackModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Choose Your Attack</Text>
                <TouchableOpacity onPress={() => setShowAttackModal(false)}>
                  <X size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.attackOptions}>
                <TouchableOpacity 
                  style={styles.attackOption}
                  onPress={() => performAttack('melee')}
                >
                  <Sword size={24} color={colors.text} />
                  <Text style={styles.attackOptionTitle}>Melee Attack</Text>
                  <Text style={styles.attackOptionDesc}>Physical weapon attack</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.attackOption}
                  onPress={() => performAttack('magic')}
                >
                  <Zap size={24} color={colors.text} />
                  <Text style={styles.attackOptionTitle}>Magic Attack</Text>
                  <Text style={styles.attackOptionDesc}>Spell-based attack</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.attackOption}
                  onPress={() => performAttack('special', 'charge')}
                >
                  <Text style={styles.attackOptionIcon}>⚡</Text>
                  <Text style={styles.attackOptionTitle}>Charge</Text>
                  <Text style={styles.attackOptionDesc}>Build power for next attack</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.attackOption}
                  onPress={() => performAttack('special', 'heal')}
                >
                  <Heart size={24} color={colors.text} />
                  <Text style={styles.attackOptionTitle}>Heal</Text>
                  <Text style={styles.attackOptionDesc}>Restore your health</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.attackOption}
                  onPress={() => performAttack('special', 'defend')}
                >
                  <Shield size={24} color={colors.text} />
                  <Text style={styles.attackOptionTitle}>Defend</Text>
                  <Text style={styles.attackOptionDesc}>Reduce incoming damage</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.attackOption}
                  onPress={() => performAttack('special', 'poison')}
                >
                  <Text style={styles.attackOptionIcon}>☠️</Text>
                  <Text style={styles.attackOptionTitle}>Poison</Text>
                  <Text style={styles.attackOptionDesc}>Inflict poison damage</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.attackOption}
                  onPress={() => performAttack('special', 'confuse')}
                >
                  <Text style={styles.attackOptionIcon}>😵</Text>
                  <Text style={styles.attackOptionTitle}>Confuse</Text>
                  <Text style={styles.attackOptionDesc}>Make enemy miss turns</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        
        {/* Item Usage Modal */}
        <Modal
          visible={showItemModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowItemModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Use Item</Text>
                <TouchableOpacity onPress={() => setShowItemModal(false)}>
                  <X size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.itemList}>
                {usableItems.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.itemOption}
                    onPress={() => handleItemUse(item.id)}
                  >
                    <Text style={styles.itemIcon}>🧪</Text>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemDescription}>{item.description}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
                
                {usableItems.length === 0 && (
                  <Text style={styles.noItemsText}>No usable items available</Text>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
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
    alignItems: 'center',
  },
  profileThumbnailContainer: {
    marginBottom: 8,
  },
  profileThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceDark,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  profileThumbnailPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primaryDark,
  },
  profileThumbnailText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  participantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  healthBarContainer: {
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
    width: '90%',
  },
  healthBar: {
    height: '100%',
  },
  healthText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  faintedStatus: {
    fontSize: 12,
    color: colors.error,
    fontWeight: 'bold',
    marginTop: 2,
    textAlign: 'center',
  },
  chargeStatus: {
    fontSize: 12,
    color: colors.warning,
    fontWeight: 'bold',
    marginTop: 2,
    textAlign: 'center',
  },
  statusEffects: {
    fontSize: 14,
    marginTop: 2,
    textAlign: 'center',
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
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  fleeButton: {
    backgroundColor: colors.error,
  },
  disabledButton: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  advanceButtonContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  goldAdvanceButton: {
    backgroundColor: '#FFD700',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  goldAdvanceButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  turnIndicator: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  attackOptions: {
    gap: 12,
  },
  attackOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  attackOptionIcon: {
    fontSize: 24,
    width: 24,
    textAlign: 'center',
  },
  attackOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  attackOptionDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 2,
  },
  itemList: {
    maxHeight: 300,
  },
  itemOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    gap: 12,
  },
  itemIcon: {
    fontSize: 24,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  noItemsText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
});