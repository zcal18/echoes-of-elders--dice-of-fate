import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList, ActivityIndicator } from 'react-native';
import { useGameStore } from '@/hooks/useGameStore';
import { Enemy, Character, Item } from '@/types/game';
import { enemies } from '@/constants/enemies';
import { items } from '@/constants/items';
import { rollDice } from '@/utils/diceRolls';
// Toast notifications not available
// import { useToast } from 'react-native-toast-notifications';

const EnhancedCombatSystem = () => {
  const { character, updateCharacter } = useGameStore();
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(false);
  const [isCombatActive, setIsCombatActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [initiativeRolled, setInitiativeRolled] = useState<boolean>(false);
  // const toast = useToast();

  useEffect(() => {
    if (!character) return;
    loadEnemy();
  }, [character]);

  useEffect(() => {
    if (isCombatActive && initiativeRolled && !isPlayerTurn) {
      const timer = setTimeout(() => {
        enemyTurn();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isCombatActive, isPlayerTurn, initiativeRolled]);

  const loadEnemy = () => {
    setIsLoading(true);
    try {
      let newEnemy: Enemy;
      const level = character?.level || 1;
      const filteredEnemies = enemies.filter(e => Number(e.difficulty) >= (level - 2) && Number(e.difficulty) <= (level + 2));
      if (filteredEnemies.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredEnemies.length);
        newEnemy = { ...filteredEnemies[randomIndex] };
      } else {
        newEnemy = { ...enemies[Math.floor(Math.random() * enemies.length)] };
      }
      setCurrentEnemy(newEnemy);
      setCombatLog([`A wild ${newEnemy.name} appears!`]);
      setIsCombatActive(false);
      setInitiativeRolled(false);
      setIsPlayerTurn(false);
    } catch (error) {
      console.error('Error loading enemy:', error);
      // Toast not available
      console.error('Error loading enemy');
    } finally {
      setIsLoading(false);
    }
  };

  const rollInitiative = () => {
    if (!character || !currentEnemy) return;
    const playerRoll = rollDice(20);
    const enemyRoll = rollDice(20);
    const playerInitiative = playerRoll + (character.stats?.dexterity || 0) + 2;
    const enemyInitiative = enemyRoll + (currentEnemy.stats?.dexterity || 0);
    setCombatLog([
      `${character.name} rolls ${playerRoll} + ${(character.stats?.dexterity || 0)} + 2 (bonus) = ${playerInitiative} for initiative.`,
      `${currentEnemy.name} rolls ${enemyRoll} + ${(currentEnemy.stats?.dexterity || 0)} = ${enemyInitiative} for initiative.`,
    ]);
    const playerGoesFirst = playerInitiative > enemyInitiative;
    setIsPlayerTurn(playerGoesFirst);
    setInitiativeRolled(true);
    setIsCombatActive(true);
    if (!playerGoesFirst) {
      // Toast not available
      console.log(`${currentEnemy.name} goes first!`);
    } else {
      // Toast not available
      console.log('You go first!');
    }
  };

  const calculateDamage = (isPlayer: boolean, target: Character | Enemy, isCritical = false, bonusDamage = 0) => {
    let damage = 0;
    const activeCharacter = isPlayer ? character : currentEnemy;
    if (!activeCharacter) return { damage: 0, rolls: 0 };
    const diceCount = isPlayer ? Math.ceil(character.level / 2) : Math.ceil(Number(currentEnemy!.difficulty) / 2);
    const die = isPlayer ? character.damageDie || 6 : currentEnemy!.damageDie || 6;
    const rolls = rollDice(die);
    if (Array.isArray(rolls)) {
      rolls.forEach((roll: number, index: number) => {
        let currentRoll = roll;
        if (isCritical && index === 0) currentRoll *= 2;
        damage += currentRoll;
      });
    } else {
      damage = rolls;
      if (isCritical) damage *= 2;
    }
    damage += bonusDamage;
    if (damage < 0) damage = 0;
    return { damage, rolls };
  };

  const playerTurn = (action: 'attack' | 'defend' | 'skill' | 'item', item?: Item) => {
    if (!character || !currentEnemy) return;
    let logMessage = '';
    let newEnemyHealth = currentEnemy.currentHealth;
    let newPlayerHealth = character.currentHealth;
    let bonusDamage = 0;
    if (item) {
      bonusDamage = item.effectValue || 0;
    }
    if (action === 'attack' || (action === 'item' && item?.type === 'weapon')) {
      const roll = rollDice(20);
      const isCritical = roll === 20;
      const attackRoll = roll + (character.stats?.strength || 0) + bonusDamage;
      logMessage += `${character.name} rolls ${roll} + ${(character.stats?.strength || 0)} (STR)`;
      if (bonusDamage > 0) logMessage += ` + ${bonusDamage} (item bonus)`;
      logMessage += ` = ${attackRoll} to attack.`;
      if (isCritical) logMessage += ' Critical Hit!';
      if (attackRoll >= currentEnemy.armorClass || isCritical) {
        const { damage, rolls } = calculateDamage(true, currentEnemy, isCritical, bonusDamage);
        logMessage += ` Deals ${Array.isArray(rolls) ? rolls.join(' + ') : rolls}`;
        if (bonusDamage > 0) logMessage += ` + ${bonusDamage} (item bonus)`;
        logMessage += ` = ${damage} damage.`;
        newEnemyHealth -= damage;
        if (newEnemyHealth <= 0) {
          logMessage += ` ${currentEnemy.name} is defeated!`;
          victory();
        }
      } else {
        logMessage += ' Miss!';
      }
    } else if (action === 'defend') {
      logMessage = `${character.name} takes a defensive stance.`;
      newPlayerHealth += 5;
      if (newPlayerHealth > character.maxHealth) newPlayerHealth = character.maxHealth;
    } else if (action === 'skill') {
      logMessage = `${character.name} uses a skill.`;
    } else if (action === 'item' && item?.type === 'potion') {
      logMessage = `${character.name} uses ${item.name}.`;
      newPlayerHealth += item.effectValue || 10;
      if (newPlayerHealth > character.maxHealth) newPlayerHealth = character.maxHealth;
    }
    setCombatLog([logMessage, ...combatLog]);
    setCurrentEnemy({ ...currentEnemy, currentHealth: newEnemyHealth });
    updateCharacter({ ...character, currentHealth: newPlayerHealth });
    setIsPlayerTurn(false);
  };

  const enemyTurn = () => {
    if (!character || !currentEnemy) return;
    if (currentEnemy.currentHealth <= 0) {
      victory();
      return;
    }
    let logMessage = '';
    const roll = rollDice(20);
    const isCritical = roll === 20;
    const attackRoll = roll + (currentEnemy.stats?.strength || 0);
    logMessage += `${currentEnemy.name} rolls ${roll} + ${(currentEnemy.stats?.strength || 0)} = ${attackRoll} to attack.`;
    if (isCritical) logMessage += ' Critical Hit!';
    if (attackRoll >= character.armorClass || isCritical) {
      const { damage, rolls } = calculateDamage(false, character, isCritical);
      logMessage += ` Deals ${Array.isArray(rolls) ? rolls.join(' + ') : rolls} = ${damage} damage.`;
      const newHealth = character.currentHealth - damage;
      if (newHealth <= 0) {
        logMessage += ` ${character.name} is defeated!`;
        defeat();
      }
      updateCharacter({ ...character, currentHealth: newHealth });
    } else {
      logMessage += ' Miss!';
    }
    setCombatLog([logMessage, ...combatLog]);
    setIsPlayerTurn(true);
  };

  const victory = () => {
    if (!character || !currentEnemy) return;
    const xpGained = Number(currentEnemy.difficulty) * 100;
    const goldGained = Math.floor(Math.random() * 50) + 10;
    let loot: Item | null = null;
    if (Math.random() < 0.3) {
      const availableLoot = items.filter(item => (item.effectValue || 1) <= Number(currentEnemy.difficulty) + 2);
      if (availableLoot.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableLoot.length);
        loot = { ...availableLoot[randomIndex] };
      }
    }
    const updatedInventory = loot ? [...(character.inventory || []), loot] : (character.inventory || []);
    const updatedCharacter = {
      ...character,
      experience: (character.experience || 0) + xpGained,
      gold: (character.gold || 0) + goldGained,
      inventory: updatedInventory,
    };
    updateCharacter(updatedCharacter);
    setIsCombatActive(false);
    let notificationMessage = `Victory! +${xpGained} XP, +${goldGained} Gold`;
    if (loot) notificationMessage += `, Loot: ${loot.name}`;
    // Toast not available
    console.log(notificationMessage);
  };

  const defeat = () => {
    setIsCombatActive(false);
    // Toast not available
    console.log('Defeat! You have been defeated.');
  };

  const renderEnemyImage = () => {
    if (!currentEnemy) return null;
    return (
      <Image
        source={{ uri: currentEnemy.image || 'https://via.placeholder.com/150' }}
        style={styles.enemyImage}
        resizeMode="contain"
      />
    );
  };

  const renderActionButton = (title: string, onPress: () => void, disabled: boolean = false) => (
    <TouchableOpacity
      style={[styles.actionButton, disabled && styles.disabledButton]}
      onPress={onPress}
      disabled={disabled || isLoading || !isCombatActive}
    >
      <Text style={styles.actionButtonText}>{title}</Text>
    </TouchableOpacity>
  );

  if (!character || !currentEnemy) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No character or enemy data available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <View style={styles.enemyContainer}>
            {renderEnemyImage()}
            <Text style={styles.enemyName}>{currentEnemy.name}</Text>
            <Text style={styles.enemyStats}>Level: {currentEnemy.difficulty}</Text>
            <Text style={styles.enemyStats}>Health: {currentEnemy.currentHealth}/{currentEnemy.maxHealth}</Text>
            <View style={styles.healthBarContainer}>
              <View
                style={[styles.healthBar, { width: `${(currentEnemy.currentHealth / currentEnemy.maxHealth) * 100}%` }]}
              />
            </View>
          </View>

          <View style={styles.combatLogContainer}>
            <Text style={styles.combatLogTitle}>Combat Log</Text>
            <FlatList
              data={combatLog}
              renderItem={({ item }) => <Text style={styles.combatLogText}>{item}</Text>}
              keyExtractor={(item, index) => index.toString()}
              inverted
              style={styles.combatLog}
            />
          </View>

          <View style={styles.actionsContainer}>
            {!initiativeRolled ? (
              <TouchableOpacity
                style={styles.startButton}
                onPress={rollInitiative}
                disabled={isLoading}
              >
                <Text style={styles.startButtonText}>Roll Initiative</Text>
              </TouchableOpacity>
            ) : (
              <>
                {renderActionButton('Attack', () => playerTurn('attack'), !isPlayerTurn)}
                {renderActionButton('Defend', () => playerTurn('defend'), !isPlayerTurn)}
                {renderActionButton('Skill', () => playerTurn('skill'), !isPlayerTurn)}
                {renderActionButton('Item', () => playerTurn('item'), !isPlayerTurn)}
              </>
            )}
          </View>

          <Text style={styles.turnIndicator}>
            {isCombatActive ? (isPlayerTurn ? 'Your Turn' : `${currentEnemy.name}'s Turn`) : 'Combat Not Started'}
          </Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  enemyContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  enemyImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  enemyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  enemyStats: {
    fontSize: 16,
    color: '#555',
  },
  healthBarContainer: {
    width: '80%',
    height: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
    marginTop: 5,
    overflow: 'hidden',
  },
  healthBar: {
    height: '100%',
    backgroundColor: '#ff4d4d',
  },
  combatLogContainer: {
    flex: 1,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  combatLogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  combatLog: {
    flex: 1,
  },
  combatLogText: {
    fontSize: 14,
    color: '#333',
    paddingVertical: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  actionButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    margin: 5,
    minWidth: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  turnIndicator: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 18,
    color: 'red',
    marginTop: 50,
  },
  startButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EnhancedCombatSystem;
