// Enhanced dice rolling system with improved player advantage and comprehensive bonuses

export const rollDice = (sides: number): number => {
  return Math.floor(Math.random() * sides) + 1;
};

export const rollMultipleDice = (count: number, sides: number): number[] => {
  const results = [];
  for (let i = 0; i < count; i++) {
    results.push(rollDice(sides));
  }
  return results;
};

export const calculateModifier = (stat: number): number => {
  return Math.floor((stat - 10) / 2);
};

export const getDiceType = (level: number, hasEnhancedDice: boolean = false): number => {
  if (hasEnhancedDice) {
    if (level >= 10) return 24; // 🎲24 for high level enhanced
    if (level >= 5) return 22; // 🎲22 for mid level enhanced
    return 20; // 🎲20 for low level enhanced
  }
  
  // Standard dice progression based on level
  if (level >= 15) return 24; // 🎲24 for very high levels
  if (level >= 10) return 22; // 🎲22 for high levels
  if (level >= 5) return 20; // 🎲20 for mid levels
  return 18; // 🎲18 for low levels
};

export const getDiceCount = (level: number): number => {
  if (level >= 15) return 3; // 3 dice for very high levels
  if (level >= 10) return 2; // 2 dice for high levels
  if (level >= 5) return 2; // 2 dice for mid levels
  return 1; // 1 die for low levels
};

export interface AttackRollResult {
  roll: number;
  diceType: number;
  diceCount: number;
  modifier: number;
  isCritical: boolean;
  isFumble: boolean;
  breakdown: string;
}

export const attackRoll = (modifier: number, level: number = 1): AttackRollResult => {
  const diceType = getDiceType(level);
  const diceCount = getDiceCount(level);
  const rolls = rollMultipleDice(diceCount, diceType);
  const diceRoll = Math.max(...rolls); // Take the highest roll for attack
  const total = diceRoll + modifier;
  
  return {
    roll: total,
    diceType,
    diceCount,
    modifier,
    isCritical: diceRoll === diceType,
    isFumble: diceRoll === 1,
    breakdown: `🎲${diceType}(${rolls.join(', ')}) + ${modifier} = ${total}`
  };
};

export const enhancedAttackRoll = (
  modifier: number,
  level: number,
  buffs: number = 0,
  debuffs: number = 0,
  equipmentBonus: number = 0,
  hasEnhancedDice: boolean = false,
  isPlayer: boolean = false,
  advantage: boolean = false,
  researchBonus: number = 0,
  spellBonus: number = 0
): AttackRollResult => {
  const diceType = getDiceType(level, hasEnhancedDice);
  const diceCount = getDiceCount(level);
  
  let diceRoll: number;
  let rollBreakdown: string;
  let rolls: number[];
  
  if (advantage || isPlayer) {
    // Roll twice the dice count, take highest (advantage for players)
    const allRolls = rollMultipleDice(diceCount * 2, diceType);
    rolls = allRolls.slice(0, diceCount).concat(allRolls.slice(diceCount));
    diceRoll = Math.max(...rolls);
    rollBreakdown = `🎲${diceType}(${rolls.join(', ')}) [advantage]`;
  } else {
    rolls = rollMultipleDice(diceCount, diceType);
    diceRoll = Math.max(...rolls);
    rollBreakdown = `🎲${diceType}(${rolls.join(', ')})`;
  }
  
  // Calculate total modifier with improved player bonuses
  const buffBonus = buffs * 2; // Increased buff effectiveness
  const debuffPenalty = debuffs * 1; // Reduced debuff penalty
  const playerBonus = isPlayer ? 2 : 0; // Additional player bonus
  const levelBonus = Math.floor(level / 3); // Bonus based on character level
  
  const totalModifier = modifier + buffBonus - debuffPenalty + playerBonus + equipmentBonus + levelBonus + researchBonus + spellBonus;
  const total = diceRoll + totalModifier;
  
  // Enhanced critical and fumble detection
  const criticalThreshold = hasEnhancedDice ? diceType - 1 : diceType; // Natural max or max-1 for enhanced
  const isCritical = diceRoll >= criticalThreshold;
  const isFumble = diceRoll === 1 && !isPlayer; // Players don't fumble as easily
  
  const breakdown = `${rollBreakdown} + ${totalModifier} = ${total}`;
  
  return {
    roll: total,
    diceType,
    diceCount,
    modifier: totalModifier,
    isCritical,
    isFumble,
    breakdown
  };
};

export const enemyAttackRoll = (
  modifier: number,
  level: number,
  behavior: 'normal' | 'aggressive' | 'defensive' | 'desperate' | 'berserker' = 'normal',
  healthPercent: number = 100
): AttackRollResult => {
  const diceType = getDiceType(level);
  const diceCount = getDiceCount(level);
  const rolls = rollMultipleDice(diceCount, diceType);
  const diceRoll = Math.max(...rolls);
  
  // Apply behavior modifiers
  let behaviorModifier = 0;
  let criticalRange = diceType; // Only natural max is critical by default
  
  switch (behavior) {
    case 'aggressive':
      behaviorModifier = 2;
      break;
    case 'defensive':
      behaviorModifier = -1;
      break;
    case 'desperate':
      behaviorModifier = Math.floor((100 - healthPercent) / 20); // More desperate = higher bonus
      break;
    case 'berserker':
      behaviorModifier = 3;
      criticalRange = diceType - 1; // Critical on max-1 to max
      break;
  }
  
  const totalModifier = modifier + behaviorModifier;
  const total = diceRoll + totalModifier;
  
  const isCritical = diceRoll >= criticalRange;
  const isFumble = diceRoll === 1;
  
  return {
    roll: total,
    diceType,
    diceCount,
    modifier: totalModifier,
    isCritical,
    isFumble,
    breakdown: `🎲${diceType}(${rolls.join(', ')}) + ${totalModifier} = ${total} [${behavior}]`
  };
};

export const savingThrow = (
  stat: number,
  difficulty: number,
  level: number = 1,
  advantage: boolean = false,
  researchBonus: number = 0,
  buffBonus: number = 0
): { success: boolean; roll: number; breakdown: string } => {
  const modifier = calculateModifier(stat) + Math.floor(level / 4) + researchBonus + buffBonus; // Level bonus + research + buffs
  
  let diceRoll: number;
  let rollBreakdown: string;
  
  if (advantage) {
    const roll1 = rollDice(20);
    const roll2 = rollDice(20);
    diceRoll = Math.max(roll1, roll2);
    rollBreakdown = `🎲20(${roll1}, ${roll2}) [advantage]`;
  } else {
    diceRoll = rollDice(20);
    rollBreakdown = `🎲20(${diceRoll})`;
  }
  
  const total = diceRoll + modifier;
  const success = total >= difficulty;
  
  return {
    success,
    roll: total,
    breakdown: `${rollBreakdown} + ${modifier} = ${total} vs DC ${difficulty}`
  };
};

export const skillCheck = (
  stat: number,
  difficulty: number,
  proficiency: boolean = false,
  level: number = 1,
  researchBonus: number = 0
): { success: boolean; roll: number; breakdown: string } => {
  const modifier = calculateModifier(stat);
  const proficiencyBonus = proficiency ? Math.ceil(level / 4) + 1 : 0; // Improved proficiency scaling
  const totalBonus = modifier + proficiencyBonus + researchBonus;
  
  const diceRoll = rollDice(20);
  const total = diceRoll + totalBonus;
  const success = total >= difficulty;
  
  return {
    success,
    roll: total,
    breakdown: `🎲20(${diceRoll}) + ${totalBonus} = ${total} vs DC ${difficulty}`
  };
};

export const damageRoll = (
  diceCount: number,
  diceSize: number,
  modifier: number = 0,
  isCritical: boolean = false,
  levelBonus: number = 0,
  equipmentBonus: number = 0,
  spellBonus: number = 0,
  researchBonus: number = 0,
  behaviorMultiplier: number = 1
): { damage: number; breakdown: string } => {
  const rolls = rollMultipleDice(diceCount, diceSize);
  let baseDamage = rolls.reduce((sum, roll) => sum + roll, 0);
  
  if (isCritical) {
    // Critical hits: roll damage dice twice
    const critRolls = rollMultipleDice(diceCount, diceSize);
    baseDamage += critRolls.reduce((sum, roll) => sum + roll, 0);
  }
  
  const totalBonus = modifier + levelBonus + equipmentBonus + spellBonus + researchBonus;
  const totalDamage = Math.max(1, Math.floor((baseDamage + totalBonus) * behaviorMultiplier)); // Minimum 1 damage
  
  const breakdown = isCritical 
    ? `${diceCount}🎲${diceSize} x2 + ${totalBonus} x${behaviorMultiplier} = ${totalDamage} [CRITICAL]`
    : `${diceCount}🎲${diceSize} + ${totalBonus} x${behaviorMultiplier} = ${totalDamage}`;
  
  return {
    damage: totalDamage,
    breakdown
  };
};

export const initiativeRoll = (dexterity: number, level: number = 1, researchBonus: number = 0): number => {
  const modifier = calculateModifier(dexterity) + Math.floor(level / 5) + researchBonus; // Small level bonus + research
  return rollDice(20) + modifier;
};

export const percentileRoll = (): number => {
  return rollDice(100);
};

export const luckRoll = (threshold: number = 50, luckBonus: number = 0): boolean => {
  return percentileRoll() <= (threshold + luckBonus);
};

// Enemy AI decision making utilities
export const calculateThreatLevel = (
  playerLevel: number,
  playerHealth: number,
  playerMaxHealth: number,
  playerAC: number
): 'low' | 'medium' | 'high' | 'critical' => {
  const healthPercent = (playerHealth / playerMaxHealth) * 100;
  
  if (healthPercent < 25) return 'critical';
  if (healthPercent < 50) return 'high';
  if (healthPercent < 75) return 'medium';
  return 'low';
};

export const selectOptimalEnemyAction = (
  availableActions: string[],
  enemyHealth: number,
  enemyMaxHealth: number,
  playerThreatLevel: 'low' | 'medium' | 'high' | 'critical',
  combatRound: number
): string => {
  const healthPercent = (enemyHealth / enemyMaxHealth) * 100;
  
  // Desperate situations - use strongest attacks
  if (healthPercent < 25) {
    return availableActions.find(action => action.includes('ultimate') || action.includes('desperate')) || availableActions[0];
  }
  
  // High threat from player - be aggressive
  if (playerThreatLevel === 'critical' || playerThreatLevel === 'high') {
    return availableActions.find(action => action.includes('aggressive') || action.includes('attack')) || availableActions[0];
  }
  
  // Long combat - mix up strategies
  if (combatRound > 5) {
    return availableActions[combatRound % availableActions.length];
  }
  
  // Default behavior
  return availableActions[Math.floor(Math.random() * availableActions.length)];
};