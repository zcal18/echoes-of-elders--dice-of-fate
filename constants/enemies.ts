import { Enemy } from '@/types/game';

// Helper function to create enemy health object
const createHealth = (max: number) => ({ max });

// Helper function to create enemy stats
const createStats = (str: string, dex: string, con: string, int: string, wis: string, cha: string) => ({
  strength: str,
  dexterity: dex,
  constitution: con,
  intelligence: int,
  wisdom: wis,
  charisma: cha
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

// Forest Enemies
export const forestEnemies: Enemy[] = [
  {
    id: 'forest_goblin',
    name: 'Forest Goblin',
    description: 'A small, mischievous creature that lurks in the shadows of the forest.',
    level: 1,
    requiredLevel: 1,
    health: createHealth(25),
    attack: 8,
    defense: 3,
    experience: 15,
    gold: 5,
    stats: createStats('6', '12', '8', '6', '8', '4'),
    abilities: ['Sneak Attack', 'Quick Strike'],
    weaknesses: ['Light Magic', 'Fire'],
    resistances: ['Poison'],
    loot: [
      createLootItem('goblin_dagger', 'Rusty Dagger', 'weapon', 'common', 15, { attack: 2 })
    ],
    profileImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=face',
    environment: 'forest',
    rarity: 'common'
  },
  {
    id: 'dire_wolf',
    name: 'Dire Wolf',
    description: 'A massive wolf with glowing red eyes and razor-sharp fangs.',
    level: 3,
    requiredLevel: 2,
    health: createHealth(45),
    attack: 15,
    defense: 8,
    experience: 35,
    gold: 12,
    stats: createStats('14', '16', '12', '4', '12', '6'),
    abilities: ['Pack Hunter', 'Howl', 'Bite'],
    weaknesses: ['Silver Weapons'],
    resistances: ['Cold'],
    loot: [
      createLootItem('wolf_pelt', 'Dire Wolf Pelt', 'material', 'uncommon', 25),
      createLootItem('wolf_fang', 'Sharp Fang', 'material', 'common', 8)
    ],
    profileImage: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=400&h=400&fit=crop&crop=face',
    environment: 'forest',
    rarity: 'uncommon'
  },
  {
    id: 'forest_troll',
    name: 'Forest Troll',
    description: 'A hulking beast covered in moss and bark, blending with the forest.',
    level: 5,
    requiredLevel: 4,
    health: createHealth(80),
    attack: 22,
    defense: 15,
    experience: 65,
    gold: 25,
    stats: createStats('18', '8', '16', '6', '10', '4'),
    abilities: ['Regeneration', 'Tree Slam', 'Roar'],
    weaknesses: ['Fire', 'Acid'],
    resistances: ['Physical', 'Nature'],
    loot: [
      createLootItem('troll_club', 'Mossy Club', 'weapon', 'uncommon', 45, { attack: 8, strength: '2' }),
      createLootItem('troll_hide', 'Thick Hide', 'armor', 'uncommon', 35, { defense: 4 })
    ],
    profileImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=face',
    environment: 'forest',
    rarity: 'rare'
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
    attack: 18,
    defense: 20,
    experience: 50,
    gold: 20,
    stats: createStats('16', '6', '18', '3', '8', '1'),
    abilities: ['Stone Skin', 'Boulder Throw', 'Earthquake'],
    weaknesses: ['Lightning', 'Sonic'],
    resistances: ['Physical', 'Fire', 'Cold'],
    loot: [
      createLootItem('stone_core', 'Golem Core', 'material', 'rare', 50),
      createLootItem('stone_fragment', 'Stone Fragment', 'material', 'common', 5)
    ],
    profileImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop&crop=face',
    environment: 'mountain',
    rarity: 'uncommon'
  },
  {
    id: 'mountain_orc',
    name: 'Mountain Orc',
    description: 'A fierce warrior from the mountain clans, wielding crude but effective weapons.',
    level: 6,
    requiredLevel: 5,
    health: createHealth(90),
    attack: 25,
    defense: 12,
    experience: 75,
    gold: 30,
    stats: createStats('18', '10', '14', '8', '6', '8'),
    abilities: ['Berserker Rage', 'War Cry', 'Cleave'],
    weaknesses: ['Magic'],
    resistances: ['Fear'],
    loot: [
      createLootItem('orc_axe', 'Crude Battle Axe', 'weapon', 'uncommon', 40, { attack: 6, strength: '1' }),
      createLootItem('orc_armor', 'Studded Leather', 'armor', 'common', 25, { defense: 3 })
    ],
    profileImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=face',
    environment: 'mountain',
    rarity: 'common'
  },
  {
    id: 'frost_giant',
    name: 'Frost Giant',
    description: 'A colossal being of ice and snow, wielding the power of winter itself.',
    level: 10,
    requiredLevel: 8,
    health: createHealth(150),
    attack: 35,
    defense: 18,
    experience: 120,
    gold: 60,
    stats: createStats('22', '8', '20', '10', '12', '14'),
    abilities: ['Frost Breath', 'Ice Armor', 'Avalanche'],
    weaknesses: ['Fire'],
    resistances: ['Cold', 'Ice'],
    loot: [
      createLootItem('frost_hammer', 'Glacial Warhammer', 'weapon', 'rare', 80, { attack: 12, constitution: '2' }),
      createLootItem('ice_crystal', 'Eternal Ice Crystal', 'material', 'rare', 45)
    ],
    profileImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop&crop=face',
    environment: 'mountain',
    rarity: 'rare'
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
    attack: 12,
    defense: 10,
    experience: 30,
    gold: 15,
    stats: createStats('10', '14', '12', '2', '10', '2'),
    abilities: ['Poison Sting', 'Burrow', 'Pincer Grab'],
    weaknesses: ['Cold'],
    resistances: ['Poison', 'Heat'],
    loot: [
      createLootItem('scorpion_venom', 'Potent Venom', 'material', 'uncommon', 30),
      createLootItem('chitin_armor', 'Scorpion Chitin', 'armor', 'common', 20, { defense: 2 })
    ],
    profileImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=face',
    environment: 'desert',
    rarity: 'common'
  },
  {
    id: 'desert_bandit',
    name: 'Desert Bandit',
    description: 'A sun-weathered outlaw who preys on desert travelers.',
    level: 4,
    requiredLevel: 3,
    health: createHealth(55),
    attack: 16,
    defense: 8,
    experience: 40,
    gold: 25,
    stats: createStats('12', '16', '10', '12', '8', '10'),
    abilities: ['Sneak Attack', 'Sand Throw', 'Quick Draw'],
    weaknesses: ['Surprise'],
    resistances: ['Heat'],
    loot: [
      createLootItem('curved_sword', 'Scimitar', 'weapon', 'uncommon', 35, { attack: 5, dexterity: '1' }),
      createLootItem('desert_robes', 'Sand-Worn Robes', 'armor', 'common', 15, { defense: 1 })
    ],
    profileImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=face',
    environment: 'desert',
    rarity: 'common'
  },
  {
    id: 'sand_elemental',
    name: 'Sand Elemental',
    description: 'A swirling vortex of sand and wind given form and malevolent purpose.',
    level: 7,
    requiredLevel: 6,
    health: createHealth(85),
    attack: 20,
    defense: 5,
    experience: 85,
    gold: 35,
    stats: createStats('8', '18', '14', '6', '12', '4'),
    abilities: ['Sandstorm', 'Sand Blast', 'Whirlwind'],
    weaknesses: ['Water', 'Ice'],
    resistances: ['Physical', 'Wind'],
    loot: [
      createLootItem('sand_essence', 'Essence of Sand', 'material', 'rare', 40),
      createLootItem('wind_crystal', 'Wind Crystal', 'material', 'uncommon', 25)
    ],
    profileImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop&crop=face',
    environment: 'desert',
    rarity: 'uncommon'
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
    attack: 28,
    defense: 10,
    experience: 95,
    gold: 45,
    stats: createStats('8', '12', '10', '18', '16', '14'),
    abilities: ['Curse', 'Poison Cloud', 'Swamp Fire'],
    weaknesses: ['Holy Magic', 'Silver'],
    resistances: ['Poison', 'Disease', 'Dark Magic'],
    loot: [
      createLootItem('witch_staff', 'Gnarled Staff', 'weapon', 'rare', 60, { attack: 8, intelligence: '3' }),
      createLootItem('bog_herbs', 'Rare Swamp Herbs', 'material', 'uncommon', 20)
    ],
    profileImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=face',
    environment: 'swamp',
    rarity: 'rare'
  },
  {
    id: 'swamp_troll',
    name: 'Swamp Troll',
    description: 'A massive, moss-covered troll that regenerates in the murky waters.',
    level: 9,
    requiredLevel: 8,
    health: createHealth(120),
    attack: 30,
    defense: 16,
    experience: 110,
    gold: 50,
    stats: createStats('20', '6', '18', '4', '8', '2'),
    abilities: ['Regeneration', 'Mud Throw', 'Swamp Stomp'],
    weaknesses: ['Fire', 'Acid'],
    resistances: ['Poison', 'Disease', 'Water'],
    loot: [
      createLootItem('troll_moss', 'Regenerating Moss', 'material', 'rare', 35),
      createLootItem('swamp_club', 'Waterlogged Club', 'weapon', 'uncommon', 30, { attack: 6 })
    ],
    profileImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=face',
    environment: 'swamp',
    rarity: 'uncommon'
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
    attack: 18,
    defense: 12,
    experience: 55,
    gold: 20,
    stats: createStats('14', '10', '8', '6', '8', '4'),
    abilities: ['Bone Armor', 'Ancient Strike', 'Undead Resilience'],
    weaknesses: ['Holy Magic', 'Bludgeoning'],
    resistances: ['Poison', 'Disease', 'Cold'],
    loot: [
      createLootItem('bone_sword', 'Ancient Bone Sword', 'weapon', 'uncommon', 40, { attack: 7 }),
      createLootItem('bone_fragments', 'Bone Fragments', 'material', 'common', 5)
    ],
    profileImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=face',
    environment: 'dungeon',
    rarity: 'common'
  },
  {
    id: 'shadow_assassin',
    name: 'Shadow Assassin',
    description: 'A deadly killer that strikes from the darkness with poisoned blades.',
    level: 12,
    requiredLevel: 10,
    health: createHealth(95),
    attack: 40,
    defense: 8,
    experience: 140,
    gold: 70,
    stats: createStats('12', '20', '10', '14', '12', '8'),
    abilities: ['Shadow Step', 'Poison Strike', 'Invisibility'],
    weaknesses: ['Light Magic', 'Area Attacks'],
    resistances: ['Dark Magic', 'Poison'],
    loot: [
      createLootItem('shadow_blade', 'Shadowsteel Dagger', 'weapon', 'rare', 85, { attack: 10, dexterity: '2' }),
      createLootItem('shadow_essence', 'Essence of Shadow', 'material', 'rare', 50)
    ],
    profileImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=face',
    environment: 'dungeon',
    rarity: 'rare'
  },
  {
    id: 'lich_lord',
    name: 'Lich Lord',
    description: 'An ancient undead sorcerer of immense power, master of death magic.',
    level: 15,
    requiredLevel: 13,
    health: createHealth(200),
    attack: 45,
    defense: 20,
    experience: 200,
    gold: 100,
    stats: createStats('10', '8', '12', '22', '18', '16'),
    abilities: ['Death Ray', 'Summon Undead', 'Life Drain', 'Teleport'],
    weaknesses: ['Holy Magic', 'Sunlight'],
    resistances: ['Dark Magic', 'Cold', 'Poison', 'Disease'],
    loot: [
      createLootItem('lich_staff', 'Staff of Eternal Night', 'weapon', 'legendary', 150, { attack: 15, intelligence: '4', wisdom: '2' }),
      createLootItem('soul_gem', 'Soul Gem', 'material', 'legendary', 100)
    ],
    profileImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=face',
    environment: 'dungeon',
    rarity: 'legendary'
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
    attack: 60,
    defense: 30,
    experience: 500,
    gold: 300,
    stats: createStats('25', '12', '24', '18', '20', '22'),
    abilities: ['Fire Breath', 'Wing Buffet', 'Tail Sweep', 'Dragon Fear', 'Ancient Magic'],
    weaknesses: ['Ice Magic', 'Dragon Slayer Weapons'],
    resistances: ['Fire', 'Physical', 'Most Magic'],
    loot: [
      createLootItem('dragon_scale', 'Ancient Dragon Scale', 'material', 'legendary', 200),
      createLootItem('dragon_heart', 'Dragon Heart', 'material', 'legendary', 500),
      createLootItem('dragonbane_sword', 'Dragonbane Greatsword', 'weapon', 'legendary', 300, { attack: 20, strength: '3', constitution: '2' })
    ],
    profileImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=face',
    environment: 'mountain',
    rarity: 'legendary'
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

// Function to get enemies by rarity
export const getEnemiesByRarity = (rarity: string): Enemy[] => {
  return getAllEnemies().filter(enemy => enemy.rarity === rarity);
};