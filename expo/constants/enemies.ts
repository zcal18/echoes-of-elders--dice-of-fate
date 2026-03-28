import { Enemy } from '@/types/game';

// Helper function to create enemy health object
const createHealth = (max: number) => ({ max });

// Helper function to create enemy stats - convert strings to numbers
const createStats = (str: string, dex: string, con: string, int: string, wis: string, cha: string) => ({
  strength: parseInt(str),
  dexterity: parseInt(dex),
  constitution: parseInt(con),
  intelligence: parseInt(int),
  wisdom: parseInt(wis),
  charisma: parseInt(cha)
});

// Helper function to create loot item
const createLootItem = (id: string, name: string, type: string, rarity: string, value: number, stats?: any) => ({
  id,
  name,
  description: `A ${rarity} ${type} dropped by an enemy.`,
  type,
  rarity,
  value,
  ...(stats && { stats })
});

// Helper function to create loot structure
const createLoot = (experience: number, goldMin: number, goldMax: number, items: any[] = []) => ({
  experience,
  gold: { min: goldMin, max: goldMax },
  items
});

// Forest Enemies
export const forestEnemies: Enemy[] = [
  {
    id: 'forest_goblin',
    name: 'Forest Goblin',
    description: 'A small, mischievous creature that lurks in the shadows of the forest.',
    level: 1,
    requiredLevel: 1,
    health: createHealth(25),
    maxHealth: 25,
    currentHealth: 25,
    attack: 8,
    defense: 3,
    experience: 15,
    gold: 5,
    difficulty: 'normal',
    stats: createStats('6', '12', '8', '6', '8', '4'),
    armorClass: 12,
    damageDie: 4,
    attacks: [
      { name: 'Sneak Attack', damage: '1d4+2', description: 'A quick strike from the shadows' },
      { name: 'Quick Strike', damage: '1d4+1', description: 'A fast melee attack' }
    ],
    abilities: ['Sneak Attack', 'Quick Strike'],
    weaknesses: ['Light Magic', 'Fire'],
    resistances: ['Poison'],
    loot: createLoot(15, 3, 8, [
      createLootItem('goblin_dagger', 'Rusty Dagger', 'weapon', 'common', 15, { attack: 2 })
    ]),
    profileImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=face',
    environment: 'forest'
  },
  {
    id: 'dire_wolf',
    name: 'Dire Wolf',
    description: 'A massive wolf with glowing red eyes and razor-sharp fangs.',
    level: 3,
    requiredLevel: 2,
    health: createHealth(45),
    maxHealth: 45,
    currentHealth: 45,
    attack: 15,
    defense: 8,
    experience: 35,
    gold: 12,
    difficulty: 'normal',
    stats: createStats('14', '16', '12', '4', '12', '6'),
    armorClass: 14,
    damageDie: 6,
    attacks: [
      { name: 'Bite', damage: '1d6+3', description: 'A vicious bite attack' },
      { name: 'Howl', damage: '0', description: 'Intimidates enemies' }
    ],
    abilities: ['Pack Hunter', 'Howl', 'Bite'],
    weaknesses: ['Silver Weapons'],
    resistances: ['Cold'],
    loot: createLoot(35, 8, 16, [
      createLootItem('wolf_pelt', 'Dire Wolf Pelt', 'material', 'uncommon', 25),
      createLootItem('wolf_fang', 'Sharp Fang', 'material', 'common', 8)
    ]),
    profileImage: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=400&h=400&fit=crop&crop=face',
    environment: 'forest'
  },
  {
    id: 'forest_troll',
    name: 'Forest Troll',
    description: 'A hulking beast covered in moss and bark, blending with the forest.',
    level: 5,
    requiredLevel: 4,
    health: createHealth(80),
    maxHealth: 80,
    currentHealth: 80,
    attack: 22,
    defense: 15,
    experience: 65,
    gold: 25,
    difficulty: 'elite',
    stats: createStats('18', '8', '16', '6', '10', '4'),
    armorClass: 16,
    damageDie: 8,
    attacks: [
      { name: 'Tree Slam', damage: '1d8+4', description: 'Slams with a massive tree branch' },
      { name: 'Roar', damage: '0', description: 'Intimidating roar' }
    ],
    abilities: ['Regeneration', 'Tree Slam', 'Roar'],
    weaknesses: ['Fire', 'Acid'],
    resistances: ['Physical', 'Nature'],
    loot: createLoot(65, 20, 30, [
      createLootItem('troll_club', 'Mossy Club', 'weapon', 'uncommon', 45, { attack: 8, strength: 2 }),
      createLootItem('troll_hide', 'Thick Hide', 'armor', 'uncommon', 35, { defense: 4 })
    ]),
    profileImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=face',
    environment: 'forest'
  }
];

// Mountain Enemies
export const mountainEnemies: Enemy[] = [
  {
    id: 'stone_golem',
    name: 'Stone Golem',
    description: 'An animated construct of rock and stone, slow but incredibly durable.',
    level: 4,
    requiredLevel: 3,
    health: createHealth(70),
    maxHealth: 70,
    currentHealth: 70,
    attack: 18,
    defense: 20,
    experience: 50,
    gold: 20,
    difficulty: 'normal',
    stats: createStats('16', '6', '18', '3', '8', '1'),
    armorClass: 18,
    damageDie: 6,
    attacks: [
      { name: 'Boulder Throw', damage: '1d6+3', description: 'Hurls a large stone' },
      { name: 'Earthquake', damage: '1d8+2', description: 'Causes ground to shake' }
    ],
    abilities: ['Stone Skin', 'Boulder Throw', 'Earthquake'],
    weaknesses: ['Lightning', 'Sonic'],
    resistances: ['Physical', 'Fire', 'Cold'],
    loot: createLoot(50, 15, 25, [
      createLootItem('stone_core', 'Golem Core', 'material', 'rare', 50),
      createLootItem('stone_fragment', 'Stone Fragment', 'material', 'common', 5)
    ]),
    profileImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop&crop=face',
    environment: 'mountain'
  },
  {
    id: 'mountain_orc',
    name: 'Mountain Orc',
    description: 'A fierce warrior from the mountain clans, wielding crude but effective weapons.',
    level: 6,
    requiredLevel: 5,
    health: createHealth(90),
    maxHealth: 90,
    currentHealth: 90,
    attack: 25,
    defense: 12,
    experience: 75,
    gold: 30,
    difficulty: 'normal',
    stats: createStats('18', '10', '14', '8', '6', '8'),
    armorClass: 14,
    damageDie: 8,
    attacks: [
      { name: 'Cleave', damage: '1d8+4', description: 'A sweeping axe attack' },
      { name: 'War Cry', damage: '0', description: 'Boosts attack power' }
    ],
    abilities: ['Berserker Rage', 'War Cry', 'Cleave'],
    weaknesses: ['Magic'],
    resistances: ['Fear'],
    loot: createLoot(75, 25, 35, [
      createLootItem('orc_axe', 'Crude Battle Axe', 'weapon', 'uncommon', 40, { attack: 6, strength: 1 }),
      createLootItem('orc_armor', 'Studded Leather', 'armor', 'common', 25, { defense: 3 })
    ]),
    profileImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=face',
    environment: 'mountain'
  },
  {
    id: 'frost_giant',
    name: 'Frost Giant',
    description: 'A colossal being of ice and snow, wielding the power of winter itself.',
    level: 10,
    requiredLevel: 8,
    health: createHealth(150),
    maxHealth: 150,
    currentHealth: 150,
    attack: 35,
    defense: 18,
    experience: 120,
    gold: 60,
    difficulty: 'elite',
    stats: createStats('22', '8', '20', '10', '12', '14'),
    armorClass: 16,
    damageDie: 10,
    attacks: [
      { name: 'Frost Breath', damage: '2d6+5', description: 'Breathes freezing cold' },
      { name: 'Avalanche', damage: '1d10+6', description: 'Causes an avalanche' }
    ],
    abilities: ['Frost Breath', 'Ice Armor', 'Avalanche'],
    weaknesses: ['Fire'],
    resistances: ['Cold', 'Ice'],
    loot: createLoot(120, 50, 70, [
      createLootItem('frost_hammer', 'Glacial Warhammer', 'weapon', 'rare', 80, { attack: 12, constitution: 2 }),
      createLootItem('ice_crystal', 'Eternal Ice Crystal', 'material', 'rare', 45)
    ]),
    profileImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop&crop=face',
    environment: 'mountain'
  }
];

// Desert Enemies
export const desertEnemies: Enemy[] = [
  {
    id: 'sand_scorpion',
    name: 'Giant Sand Scorpion',
    description: 'A massive arachnid with a venomous stinger and armored carapace.',
    level: 3,
    requiredLevel: 2,
    health: createHealth(40),
    maxHealth: 40,
    currentHealth: 40,
    attack: 12,
    defense: 10,
    experience: 30,
    gold: 15,
    difficulty: 'normal',
    stats: createStats('10', '14', '12', '2', '10', '2'),
    armorClass: 13,
    damageDie: 6,
    attacks: [
      { name: 'Poison Sting', damage: '1d6+2', description: 'Venomous stinger attack' },
      { name: 'Pincer Grab', damage: '1d4+1', description: 'Grabs with pincers' }
    ],
    abilities: ['Poison Sting', 'Burrow', 'Pincer Grab'],
    weaknesses: ['Cold'],
    resistances: ['Poison', 'Heat'],
    loot: createLoot(30, 10, 20, [
      createLootItem('scorpion_venom', 'Potent Venom', 'material', 'uncommon', 30),
      createLootItem('chitin_armor', 'Scorpion Chitin', 'armor', 'common', 20, { defense: 2 })
    ]),
    profileImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=face',
    environment: 'desert'
  },
  {
    id: 'desert_bandit',
    name: 'Desert Bandit',
    description: 'A sun-weathered outlaw who preys on desert travelers.',
    level: 4,
    requiredLevel: 3,
    health: createHealth(55),
    maxHealth: 55,
    currentHealth: 55,
    attack: 16,
    defense: 8,
    experience: 40,
    gold: 25,
    difficulty: 'normal',
    stats: createStats('12', '16', '10', '12', '8', '10'),
    armorClass: 12,
    damageDie: 6,
    attacks: [
      { name: 'Quick Draw', damage: '1d6+3', description: 'Fast sword strike' },
      { name: 'Sand Throw', damage: '1d4', description: 'Blinds with sand' }
    ],
    abilities: ['Sneak Attack', 'Sand Throw', 'Quick Draw'],
    weaknesses: ['Surprise'],
    resistances: ['Heat'],
    loot: createLoot(40, 20, 30, [
      createLootItem('curved_sword', 'Scimitar', 'weapon', 'uncommon', 35, { attack: 5, dexterity: 1 }),
      createLootItem('desert_robes', 'Sand-Worn Robes', 'armor', 'common', 15, { defense: 1 })
    ]),
    profileImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=face',
    environment: 'desert'
  },
  {
    id: 'sand_elemental',
    name: 'Sand Elemental',
    description: 'A swirling vortex of sand and wind given form and malevolent purpose.',
    level: 7,
    requiredLevel: 6,
    health: createHealth(85),
    maxHealth: 85,
    currentHealth: 85,
    attack: 20,
    defense: 5,
    experience: 85,
    gold: 35,
    difficulty: 'elite',
    stats: createStats('8', '18', '14', '6', '12', '4'),
    armorClass: 15,
    damageDie: 8,
    attacks: [
      { name: 'Sandstorm', damage: '1d8+3', description: 'Whirling sand attack' },
      { name: 'Whirlwind', damage: '2d6+2', description: 'Spinning wind attack' }
    ],
    abilities: ['Sandstorm', 'Sand Blast', 'Whirlwind'],
    weaknesses: ['Water', 'Ice'],
    resistances: ['Physical', 'Wind'],
    loot: createLoot(85, 30, 40, [
      createLootItem('sand_essence', 'Essence of Sand', 'material', 'rare', 40),
      createLootItem('wind_crystal', 'Wind Crystal', 'material', 'uncommon', 25)
    ]),
    profileImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop&crop=face',
    environment: 'desert'
  }
];

// Swamp Enemies
export const swampEnemies: Enemy[] = [
  {
    id: 'bog_witch',
    name: 'Bog Witch',
    description: 'A twisted crone who commands the dark magic of the swamp.',
    level: 8,
    requiredLevel: 7,
    health: createHealth(75),
    maxHealth: 75,
    currentHealth: 75,
    attack: 28,
    defense: 10,
    experience: 95,
    gold: 45,
    difficulty: 'elite',
    stats: createStats('8', '12', '10', '18', '16', '14'),
    armorClass: 13,
    damageDie: 8,
    attacks: [
      { name: 'Curse', damage: '1d8+4', description: 'Dark magic curse' },
      { name: 'Swamp Fire', damage: '2d6+3', description: 'Mystical green flames' }
    ],
    abilities: ['Curse', 'Poison Cloud', 'Swamp Fire'],
    weaknesses: ['Holy Magic', 'Silver'],
    resistances: ['Poison', 'Disease', 'Dark Magic'],
    loot: createLoot(95, 40, 50, [
      createLootItem('witch_staff', 'Gnarled Staff', 'weapon', 'rare', 60, { attack: 8, intelligence: 3 }),
      createLootItem('bog_herbs', 'Rare Swamp Herbs', 'material', 'uncommon', 20)
    ]),
    profileImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=face',
    environment: 'swamp'
  },
  {
    id: 'swamp_troll',
    name: 'Swamp Troll',
    description: 'A massive, moss-covered troll that regenerates in the murky waters.',
    level: 9,
    requiredLevel: 8,
    health: createHealth(120),
    maxHealth: 120,
    currentHealth: 120,
    attack: 30,
    defense: 16,
    experience: 110,
    gold: 50,
    difficulty: 'elite',
    stats: createStats('20', '6', '18', '4', '8', '2'),
    armorClass: 15,
    damageDie: 10,
    attacks: [
      { name: 'Swamp Stomp', damage: '1d10+5', description: 'Massive stomp attack' },
      { name: 'Mud Throw', damage: '1d6+3', description: 'Hurls swamp mud' }
    ],
    abilities: ['Regeneration', 'Mud Throw', 'Swamp Stomp'],
    weaknesses: ['Fire', 'Acid'],
    resistances: ['Poison', 'Disease', 'Water'],
    loot: createLoot(110, 45, 55, [
      createLootItem('troll_moss', 'Regenerating Moss', 'material', 'rare', 35),
      createLootItem('swamp_club', 'Waterlogged Club', 'weapon', 'uncommon', 30, { attack: 6 })
    ]),
    profileImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=face',
    environment: 'swamp'
  }
];

// Dungeon Enemies
export const dungeonEnemies: Enemy[] = [
  {
    id: 'skeleton_warrior',
    name: 'Skeleton Warrior',
    description: 'The animated remains of a fallen warrior, still clutching its ancient weapons.',
    level: 5,
    requiredLevel: 4,
    health: createHealth(60),
    maxHealth: 60,
    currentHealth: 60,
    attack: 18,
    defense: 12,
    experience: 55,
    gold: 20,
    difficulty: 'normal',
    stats: createStats('14', '10', '8', '6', '8', '4'),
    armorClass: 14,
    damageDie: 6,
    attacks: [
      { name: 'Ancient Strike', damage: '1d6+3', description: 'Strike with ancient weapon' },
      { name: 'Bone Armor', damage: '0', description: 'Defensive stance' }
    ],
    abilities: ['Bone Armor', 'Ancient Strike', 'Undead Resilience'],
    weaknesses: ['Holy Magic', 'Bludgeoning'],
    resistances: ['Poison', 'Disease', 'Cold'],
    loot: createLoot(55, 15, 25, [
      createLootItem('bone_sword', 'Ancient Bone Sword', 'weapon', 'uncommon', 40, { attack: 7 }),
      createLootItem('bone_fragments', 'Bone Fragments', 'material', 'common', 5)
    ]),
    profileImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=face',
    environment: 'dungeon'
  },
  {
    id: 'shadow_assassin',
    name: 'Shadow Assassin',
    description: 'A deadly killer that strikes from the darkness with poisoned blades.',
    level: 12,
    requiredLevel: 10,
    health: createHealth(95),
    maxHealth: 95,
    currentHealth: 95,
    attack: 40,
    defense: 8,
    experience: 140,
    gold: 70,
    difficulty: 'elite',
    stats: createStats('12', '20', '10', '14', '12', '8'),
    armorClass: 16,
    damageDie: 8,
    attacks: [
      { name: 'Poison Strike', damage: '1d8+5', description: 'Poisoned blade attack' },
      { name: 'Shadow Step', damage: '1d6+4', description: 'Teleport strike' }
    ],
    abilities: ['Shadow Step', 'Poison Strike', 'Invisibility'],
    weaknesses: ['Light Magic', 'Area Attacks'],
    resistances: ['Dark Magic', 'Poison'],
    loot: createLoot(140, 60, 80, [
      createLootItem('shadow_blade', 'Shadowsteel Dagger', 'weapon', 'rare', 85, { attack: 10, dexterity: 2 }),
      createLootItem('shadow_essence', 'Essence of Shadow', 'material', 'rare', 50)
    ]),
    profileImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=face',
    environment: 'dungeon'
  },
  {
    id: 'lich_lord',
    name: 'Lich Lord',
    description: 'An ancient undead sorcerer of immense power, master of death magic.',
    level: 15,
    requiredLevel: 13,
    health: createHealth(200),
    maxHealth: 200,
    currentHealth: 200,
    attack: 45,
    defense: 20,
    experience: 200,
    gold: 100,
    difficulty: 'boss',
    stats: createStats('10', '8', '12', '22', '18', '16'),
    armorClass: 18,
    damageDie: 12,
    attacks: [
      { name: 'Death Ray', damage: '2d8+6', description: 'Beam of death magic' },
      { name: 'Life Drain', damage: '1d10+5', description: 'Drains life force' },
      { name: 'Summon Undead', damage: '0', description: 'Summons skeleton minions' }
    ],
    abilities: ['Death Ray', 'Summon Undead', 'Life Drain', 'Teleport'],
    weaknesses: ['Holy Magic', 'Sunlight'],
    resistances: ['Dark Magic', 'Cold', 'Poison', 'Disease'],
    loot: createLoot(200, 80, 120, [
      createLootItem('lich_staff', 'Staff of Eternal Night', 'weapon', 'legendary', 150, { attack: 15, intelligence: 4, wisdom: 2 }),
      createLootItem('soul_gem', 'Soul Gem', 'material', 'legendary', 100)
    ]),
    profileImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=face',
    environment: 'dungeon'
  }
];

// Boss Enemies
export const bossEnemies: Enemy[] = [
  {
    id: 'ancient_dragon',
    name: 'Ancient Red Dragon',
    description: 'A colossal wyrm of legend, its breath can melt stone and its scales deflect the mightiest weapons.',
    level: 20,
    requiredLevel: 18,
    health: createHealth(500),
    maxHealth: 500,
    currentHealth: 500,
    attack: 60,
    defense: 30,
    experience: 500,
    gold: 300,
    difficulty: 'legendary',
    stats: createStats('25', '12', '24', '18', '20', '22'),
    armorClass: 22,
    damageDie: 20,
    attacks: [
      { name: 'Fire Breath', damage: '3d10+8', description: 'Devastating fire breath' },
      { name: 'Wing Buffet', damage: '2d8+6', description: 'Powerful wing attack' },
      { name: 'Tail Sweep', damage: '2d10+7', description: 'Sweeping tail attack' },
      { name: 'Dragon Fear', damage: '0', description: 'Terrifying roar' }
    ],
    abilities: ['Fire Breath', 'Wing Buffet', 'Tail Sweep', 'Dragon Fear', 'Ancient Magic'],
    weaknesses: ['Ice Magic', 'Dragon Slayer Weapons'],
    resistances: ['Fire', 'Physical', 'Most Magic'],
    loot: createLoot(500, 250, 350, [
      createLootItem('dragon_scale', 'Ancient Dragon Scale', 'material', 'legendary', 200),
      createLootItem('dragon_heart', 'Dragon Heart', 'material', 'legendary', 500),
      createLootItem('dragonbane_sword', 'Dragonbane Greatsword', 'weapon', 'legendary', 300, { attack: 20, strength: 3, constitution: 2 })
    ]),
    profileImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=face',
    environment: 'mountain'
  }
];

// Function to get all enemies
export const getAllEnemies = (): Enemy[] => {
  return [
    ...forestEnemies,
    ...mountainEnemies,
    ...desertEnemies,
    ...swampEnemies,
    ...dungeonEnemies,
    ...bossEnemies
  ];
};

// Function to get enemies by environment
export const getEnemiesByEnvironment = (environment: string): Enemy[] => {
  switch (environment.toLowerCase()) {
    case 'forest':
      return forestEnemies;
    case 'mountain':
      return mountainEnemies;
    case 'desert':
      return desertEnemies;
    case 'swamp':
      return swampEnemies;
    case 'dungeon':
      return dungeonEnemies;
    case 'boss':
      return bossEnemies;
    default:
      return getAllEnemies();
  }
};

// Function to get enemies by level range
export const getEnemiesByLevel = (minLevel: number, maxLevel: number): Enemy[] => {
  return getAllEnemies().filter(enemy => 
    enemy.level >= minLevel && enemy.level <= maxLevel
  );
};

// Function to get enemies by difficulty
export const getEnemiesByDifficulty = (difficulty: string): Enemy[] => {
  return getAllEnemies().filter(enemy => enemy.difficulty === difficulty);
};