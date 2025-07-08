import { Enemy, Item } from '@/types/game';

// Enhanced function to generate more accurate NPC images using multiple sources
const generateNPCImageUrl = (enemyType: string, enemyName: string): string => {
  // Get current date as seed for daily updates
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const seed = today.replace(/-/g, ''); // Remove dashes for cleaner seed
  
  // Enhanced mapping with more specific and accurate search terms for fantasy creatures
  const imageSearchTerms: { [key: string]: string } = {
    // Small Animals and Creatures
    'cave_rat': 'large rat cave rodent dark fur red eyes',
    'wild_boar': 'wild boar tusks forest brown fur aggressive',
    'giant_spider': 'large black spider web fangs eight legs',
    'dire_bat': 'large bat wings flying mammal dark cave',
    'forest_wolf': 'grey wolf forest pack hunter yellow eyes',
    'dire_wolf': 'large black wolf fierce predator',
    'giant_centipede': 'large centipede many legs arthropod segmented',
    
    // Humanoid Creatures
    'goblin_scout': 'green goblin small humanoid pointed ears fantasy',
    'kobold_warrior': 'kobold reptilian humanoid scales spear warrior',
    'bandit_thug': 'medieval bandit rogue leather armor human',
    'bandit_thief': 'hooded thief dark cloak medieval criminal',
    'orc_grunt': 'green orc warrior tusks muscular fantasy',
    'orc_warrior': 'orc soldier armor axe green skin',
    'hobgoblin_soldier': 'hobgoblin military armor disciplined warrior',
    'bugbear_chief': 'large bugbear fur claws goblinoid leader',
    'drow_assassin': 'dark elf purple skin white hair assassin',
    'gnoll_hunter': 'gnoll hyena humanoid spotted fur hunter',
    'lizardman_warrior': 'lizardfolk reptilian humanoid scales warrior',
    'minotaur_guard': 'minotaur bull head horns muscular guardian',
    
    // Undead
    'skeleton_warrior': 'skeleton bones armor sword undead warrior',
    'skeleton_archer': 'skeleton bones bow arrow undead archer',
    
    // Constructs and Elementals
    'stone_golem_small': 'stone golem rock construct animated guardian',
    'stone_golem': 'large stone golem massive rock construct',
    'earth_elemental_small': 'earth elemental rock dirt nature spirit',
    'fire_elemental': 'fire elemental flames burning spirit energy',
    
    // Magical Creatures
    'slime': 'green slime blob gelatinous ooze monster',
    'mushroom_man': 'mushroom humanoid fungus forest spores',
    'shadow_imp': 'small demon shadow dark wings horns',
    'shadow_assassin': 'shadow figure dark assassin stealth',
    'dark_mage': 'evil wizard dark robes staff magic',
    
    // Larger Creatures
    'owlbear': 'owlbear owl bear hybrid feathers claws',
    'harpy': 'harpy bird woman wings feathers claws',
    'phase_spider': 'ethereal spider magical translucent web',
    'troll_scout': 'troll large green regeneration claws',
    'troll_berserker': 'massive troll rage green skin claws',
    
    // High-Level Creatures
    'wyvern_young': 'young wyvern dragon wings tail stinger',
    'dragon_whelp': 'small dragon scales wings fire breath',
    'ancient_dragon': 'massive ancient dragon scales wings fire',
    'lich_lord': 'lich undead wizard skull crown magic',
    'demon_lord': 'demon lord horns wings fire evil'
  };
  
  // Get search term or fallback to enemy name
  const searchTerm = imageSearchTerms[enemyType] || enemyName.toLowerCase().replace(/\s+/g, ' ');
  
  // Use multiple image sources for better variety and accuracy
  const imageServices = [
    // Unsplash for high-quality photos (works well for animals and some humanoids)
    `https://source.unsplash.com/400x400/?${encodeURIComponent(searchTerm)}&sig=${seed}`,
    // Picsum for variety (fallback)
    `https://picsum.photos/400/400?random=${seed}${enemyType}`,
    // Lorem Picsum with specific seed
    `https://picsum.photos/seed/${seed}${enemyType}/400/400`
  ];
  
  // For fantasy creatures, prioritize more specific terms
  if (enemyType.includes('goblin') || enemyType.includes('orc') || enemyType.includes('dragon') || 
      enemyType.includes('skeleton') || enemyType.includes('troll') || enemyType.includes('demon')) {
    // Use more specific fantasy creature search
    return `https://source.unsplash.com/400x400/?${encodeURIComponent(searchTerm + ' fantasy creature')}&sig=${seed}`;
  }
  
  // For animals, use the standard approach
  return imageServices[0];
};

// Level 1-5 Enemies (Beginner Range)
const beginnerEnemies: Enemy[] = [
  {
    id: 'plague_rat_swarm',
    name: 'Plague Rat Swarm Leader',
    level: 1,
    health: { current: 15, max: 15 },
    maxHealth: 15,
    currentHealth: 15,
    attack: 3,
    defense: 1,
    experience: 8,
    gold: 2,
    description: 'A diseased rat the size of a small dog, leading a pack of vermin through the sewers.',
    requiredLevel: 1,
    difficulty: 'normal',
    imageUrl: generateNPCImageUrl('cave_rat', 'Plague Rat Swarm Leader'),
    image: generateNPCImageUrl('cave_rat', 'Plague Rat Swarm Leader'),
    armorClass: 11,
    damageDie: 4,
    loot: {
      experience: 8,
      gold: { min: 1, max: 3 },
      items: []
    },
    stats: { strength: 6, dexterity: 14, constitution: 6, intelligence: 4, wisdom: 8, charisma: 4 },
    attacks: [
      { name: 'Diseased Bite', damage: 3, description: 'Fangs dripping with plague and pestilence' },
      { name: 'Swarm Call', damage: 2, description: 'Summons smaller rats to overwhelm the enemy' }
    ]
  },
  {
    id: 'bloodfang_goblin',
    name: 'Bloodfang Goblin Stalker',
    level: 1,
    health: { current: 25, max: 25 },
    maxHealth: 25,
    currentHealth: 25,
    attack: 5,
    defense: 2,
    experience: 10,
    gold: 5,
    description: 'A vicious goblin scout with razor-sharp claws and a thirst for blood.',
    requiredLevel: 1,
    difficulty: 'normal',
    imageUrl: generateNPCImageUrl('goblin_scout', 'Bloodfang Goblin Stalker'),
    image: generateNPCImageUrl('goblin_scout', 'Bloodfang Goblin Stalker'),
    armorClass: 12,
    damageDie: 4,
    loot: {
      experience: 10,
      gold: { min: 3, max: 7 },
      items: [{
        id: 'rusty_dagger',
        name: 'Bloodstained Dagger',
        description: 'A cruel dagger still dripping with the blood of previous victims.',
        type: 'weapon',
        value: 5,
        equipSlot: 'mainHand',
        stats: { strength: 1 },
        rarity: 'common',
        bonus: 1
      }]
    },
    stats: { strength: 8, dexterity: 12, constitution: 8, intelligence: 6, wisdom: 6, charisma: 6 },
    attacks: [
      { name: 'Venomous Slash', damage: 5, description: 'A poisoned blade cuts deep into flesh' },
      { name: 'Shadow Strike', damage: 8, description: 'Emerges from darkness to deliver a devastating blow' }
    ]
  },
  {
    id: 'cursed_bone_guardian',
    name: 'Cursed Bone Guardian',
    level: 2,
    health: { current: 30, max: 30 },
    maxHealth: 30,
    currentHealth: 30,
    attack: 6,
    defense: 3,
    experience: 15,
    gold: 8,
    description: 'An undead sentinel bound by dark magic, wielding a cursed blade.',
    requiredLevel: 1,
    difficulty: 'normal',
    imageUrl: generateNPCImageUrl('skeleton_warrior', 'Cursed Bone Guardian'),
    image: generateNPCImageUrl('skeleton_warrior', 'Cursed Bone Guardian'),
    armorClass: 13,
    damageDie: 6,
    loot: {
      experience: 15,
      gold: { min: 5, max: 10 },
      items: [{
        id: 'bone_sword',
        name: 'Cursed Bone Blade',
        description: 'A sword forged from the bones of the damned, radiating malevolent energy.',
        type: 'weapon',
        value: 12,
        equipSlot: 'mainHand',
        stats: { strength: 2 },
        rarity: 'common',
        bonus: 2
      }]
    },
    stats: { strength: 10, dexterity: 8, constitution: 10, intelligence: 4, wisdom: 6, charisma: 4 },
    attacks: [
      { name: 'Soul Rend', damage: 6, description: 'A strike that tears at both flesh and spirit' },
      { name: 'Undying Wrath', damage: 8, description: 'Channels the fury of the restless dead' }
    ]
  },
  {
    id: 'ironhide_tusker',
    name: 'Ironhide Tusker Beast',
    level: 2,
    health: { current: 40, max: 40 },
    maxHealth: 40,
    currentHealth: 40,
    attack: 8,
    defense: 3,
    experience: 18,
    gold: 10,
    description: 'A massive boar with iron-hard tusks and an unquenchable rage.',
    requiredLevel: 2,
    difficulty: 'normal',
    imageUrl: generateNPCImageUrl('wild_boar', 'Ironhide Tusker Beast'),
    image: generateNPCImageUrl('wild_boar', 'Ironhide Tusker Beast'),
    armorClass: 12,
    damageDie: 6,
    loot: {
      experience: 18,
      gold: { min: 7, max: 13 },
      items: [{
        id: 'boar_hide',
        name: 'Ironhide Pelt',
        description: 'Tough hide from a legendary tusker, harder than leather armor.',
        type: 'material',
        value: 15,
        rarity: 'common'
      }]
    },
    stats: { strength: 12, dexterity: 8, constitution: 12, intelligence: 4, wisdom: 6, charisma: 4 },
    attacks: [
      { name: 'Gore Rush', damage: 8, description: 'Charges with tusks aimed at vital organs' },
      { name: 'Berserker Charge', damage: 12, description: 'Final desperate charge when near death' }
    ]
  },
  {
    id: 'widow_maker_spider',
    name: 'Widow Maker Arachnid',
    level: 3,
    health: { current: 35, max: 35 },
    maxHealth: 35,
    currentHealth: 35,
    attack: 7,
    defense: 2,
    experience: 20,
    gold: 8,
    description: 'A massive spider with venom that can paralyze prey in seconds.',
    requiredLevel: 2,
    difficulty: 'normal',
    imageUrl: generateNPCImageUrl('giant_spider', 'Widow Maker Arachnid'),
    image: generateNPCImageUrl('giant_spider', 'Widow Maker Arachnid'),
    armorClass: 11,
    damageDie: 6,
    loot: {
      experience: 20,
      gold: { min: 5, max: 12 },
      items: [{
        id: 'spider_silk',
        name: 'Death Weaver Silk',
        description: 'Silk stronger than steel, woven by a creature of nightmares.',
        type: 'material',
        value: 10,
        rarity: 'common'
      }]
    },
    stats: { strength: 8, dexterity: 16, constitution: 10, intelligence: 6, wisdom: 12, charisma: 4 },
    attacks: [
      { name: 'Paralyzing Bite', damage: 7, description: 'Fangs inject venom that freezes muscles' },
      { name: 'Death Leap', damage: 10, description: 'Pounces from above with all eight legs' }
    ]
  }
];

// Level 6-15 Enemies (Intermediate Range)
const intermediateEnemies: Enemy[] = [
  {
    id: 'bloodmoon_alpha',
    name: 'Bloodmoon Alpha Wolf',
    level: 6,
    health: { current: 60, max: 60 },
    maxHealth: 60,
    currentHealth: 60,
    attack: 12,
    defense: 5,
    experience: 35,
    gold: 18,
    description: 'A massive wolf with eyes like burning coals and fangs that drip with the blood of countless prey.',
    requiredLevel: 5,
    difficulty: 'normal',
    imageUrl: generateNPCImageUrl('forest_wolf', 'Bloodmoon Alpha Wolf'),
    image: generateNPCImageUrl('forest_wolf', 'Bloodmoon Alpha Wolf'),
    armorClass: 14,
    damageDie: 8,
    loot: {
      experience: 35,
      gold: { min: 12, max: 25 },
      items: [{
        id: 'wolf_pelt',
        name: 'Alpha Bloodmoon Pelt',
        description: 'The legendary pelt of a pack leader, still warm with primal fury.',
        type: 'material',
        value: 25,
        rarity: 'uncommon'
      }]
    },
    stats: { strength: 14, dexterity: 16, constitution: 12, intelligence: 6, wisdom: 10, charisma: 6 },
    attacks: [
      { name: 'Throat Ripper', damage: 12, description: 'Fangs seek the jugular with predatory precision' },
      { name: 'Alpha Dominance', damage: 15, description: 'Overwhelming assault that establishes supremacy' }
    ]
  },
  {
    id: 'skullcrusher_orc',
    name: 'Skullcrusher Berserker',
    level: 8,
    health: { current: 80, max: 80 },
    maxHealth: 80,
    currentHealth: 80,
    attack: 16,
    defense: 6,
    experience: 50,
    gold: 25,
    description: 'A savage orc warrior whose axe has tasted the blood of a hundred enemies.',
    requiredLevel: 6,
    difficulty: 'normal',
    imageUrl: generateNPCImageUrl('orc_grunt', 'Skullcrusher Berserker'),
    image: generateNPCImageUrl('orc_grunt', 'Skullcrusher Berserker'),
    armorClass: 15,
    damageDie: 10,
    loot: {
      experience: 50,
      gold: { min: 18, max: 32 },
      items: [{
        id: 'orc_axe',
        name: 'Skullcrusher Cleaver',
        description: 'A massive axe stained with the blood of countless victims.',
        type: 'weapon',
        value: 35,
        equipSlot: 'mainHand',
        stats: { strength: 3 },
        rarity: 'uncommon',
        bonus: 3
      }]
    },
    stats: { strength: 16, dexterity: 10, constitution: 14, intelligence: 6, wisdom: 8, charisma: 6 },
    attacks: [
      { name: 'Bone Splitter', damage: 16, description: 'Axe blow that shatters bones like kindling' },
      { name: 'Bloodthirsty Rampage', damage: 20, description: 'Enters a killing frenzy when wounded' }
    ]
  },
  {
    id: 'venomspine_crawler',
    name: 'Venomspine Crawler',
    level: 10,
    health: { current: 90, max: 90 },
    maxHealth: 90,
    currentHealth: 90,
    attack: 18,
    defense: 7,
    experience: 65,
    gold: 30,
    description: 'A massive centipede whose venom can kill a horse in minutes.',
    requiredLevel: 8,
    difficulty: 'elite',
    imageUrl: generateNPCImageUrl('giant_centipede', 'Venomspine Crawler'),
    image: generateNPCImageUrl('giant_centipede', 'Venomspine Crawler'),
    armorClass: 16,
    damageDie: 10,
    loot: {
      experience: 65,
      gold: { min: 22, max: 38 },
      items: [{
        id: 'centipede_chitin',
        name: 'Venomspine Carapace',
        description: 'Chitinous armor that still drips with deadly toxins.',
        type: 'armor',
        value: 40,
        equipSlot: 'chest',
        stats: { constitution: 2, defense: 3 },
        rarity: 'uncommon'
      }]
    },
    stats: { strength: 12, dexterity: 16, constitution: 14, intelligence: 6, wisdom: 10, charisma: 4 },
    attacks: [
      { name: 'Lethal Injection', damage: 18, description: 'Mandibles inject venom that burns like fire' },
      { name: 'Venom Geyser', damage: 14, description: 'Sprays toxic fluid when desperate' }
    ]
  },
  {
    id: 'shadow_stalker',
    name: 'Shadow Stalker Assassin',
    level: 12,
    health: { current: 85, max: 85 },
    maxHealth: 85,
    currentHealth: 85,
    attack: 22,
    defense: 4,
    experience: 75,
    gold: 35,
    description: 'A creature of pure darkness that strikes from the shadows with lethal precision.',
    requiredLevel: 10,
    difficulty: 'elite',
    imageUrl: generateNPCImageUrl('shadow_assassin', 'Shadow Stalker Assassin'),
    image: generateNPCImageUrl('shadow_assassin', 'Shadow Stalker Assassin'),
    armorClass: 17,
    damageDie: 8,
    loot: {
      experience: 75,
      gold: { min: 25, max: 45 },
      items: [{
        id: 'shadow_blade',
        name: 'Blade of Shadows',
        description: 'A weapon forged from pure darkness, invisible until it strikes.',
        type: 'weapon',
        value: 50,
        equipSlot: 'mainHand',
        stats: { dexterity: 3, strength: 2 },
        rarity: 'rare',
        bonus: 4
      }]
    },
    stats: { strength: 12, dexterity: 20, constitution: 10, intelligence: 14, wisdom: 16, charisma: 8 },
    attacks: [
      { name: 'Shadow Strike', damage: 22, description: 'Materializes behind target for a critical blow' },
      { name: 'Void Slash', damage: 18, description: 'Cuts through reality itself' }
    ]
  },
  {
    id: 'flame_wraith',
    name: 'Infernal Flame Wraith',
    level: 15,
    health: { current: 120, max: 120 },
    maxHealth: 120,
    currentHealth: 120,
    attack: 25,
    defense: 8,
    experience: 95,
    gold: 45,
    description: 'A spirit of pure fire and hatred, born from the ashes of a burned village.',
    requiredLevel: 12,
    difficulty: 'elite',
    imageUrl: generateNPCImageUrl('fire_elemental', 'Infernal Flame Wraith'),
    image: generateNPCImageUrl('fire_elemental', 'Infernal Flame Wraith'),
    armorClass: 15,
    damageDie: 12,
    loot: {
      experience: 95,
      gold: { min: 35, max: 55 },
      items: [{
        id: 'flame_essence',
        name: 'Essence of Eternal Flame',
        description: 'A crystallized fragment of pure fire magic.',
        type: 'material',
        value: 60,
        rarity: 'rare'
      }]
    },
    stats: { strength: 8, dexterity: 14, constitution: 16, intelligence: 18, wisdom: 12, charisma: 16 },
    attacks: [
      { name: 'Infernal Blast', damage: 25, description: 'Unleashes a torrent of hellfire' },
      { name: 'Soul Burn', damage: 20, description: 'Fire that burns the very essence of life' }
    ]
  }
];

// Level 16-30 Enemies (Advanced Range)
const advancedEnemies: Enemy[] = [
  {
    id: 'stone_titan',
    name: 'Ancient Stone Titan',
    level: 18,
    health: { current: 200, max: 200 },
    maxHealth: 200,
    currentHealth: 200,
    attack: 30,
    defense: 15,
    experience: 140,
    gold: 70,
    description: 'A colossal guardian made of living stone, awakened after centuries of slumber.',
    requiredLevel: 15,
    difficulty: 'boss',
    imageUrl: generateNPCImageUrl('stone_golem', 'Ancient Stone Titan'),
    image: generateNPCImageUrl('stone_golem', 'Ancient Stone Titan'),
    armorClass: 20,
    damageDie: 12,
    loot: {
      experience: 140,
      gold: { min: 50, max: 90 },
      items: [{
        id: 'titan_core',
        name: 'Titan Core Fragment',
        description: 'The heart of an ancient titan, pulsing with earth magic.',
        type: 'material',
        value: 100,
        rarity: 'rare'
      }]
    },
    stats: { strength: 22, dexterity: 6, constitution: 20, intelligence: 8, wisdom: 12, charisma: 6 },
    attacks: [
      { name: 'Earthquake Slam', damage: 30, description: 'Fists that shake the very foundations of the earth' },
      { name: 'Stone Barrage', damage: 25, description: 'Hurls massive boulders with devastating force' },
      { name: 'Titan Roar', damage: 0, description: 'A bellow that weakens the resolve of enemies' }
    ]
  },
  {
    id: 'void_knight',
    name: 'Void Knight Commander',
    level: 22,
    health: { current: 180, max: 180 },
    maxHealth: 180,
    currentHealth: 180,
    attack: 35,
    defense: 12,
    experience: 170,
    gold: 85,
    description: 'A fallen paladin consumed by darkness, wielding weapons forged in the void.',
    requiredLevel: 18,
    difficulty: 'boss',
    imageUrl: generateNPCImageUrl('dark_mage', 'Void Knight Commander'),
    image: generateNPCImageUrl('dark_mage', 'Void Knight Commander'),
    armorClass: 19,
    damageDie: 10,
    loot: {
      experience: 170,
      gold: { min: 65, max: 105 },
      items: [{
        id: 'void_armor',
        name: 'Armor of the Void',
        description: 'Plate mail that seems to absorb light itself.',
        type: 'armor',
        value: 120,
        equipSlot: 'chest',
        stats: { constitution: 4, defense: 5 },
        rarity: 'rare'
      }]
    },
    stats: { strength: 18, dexterity: 12, constitution: 16, intelligence: 14, wisdom: 10, charisma: 8 },
    attacks: [
      { name: 'Void Blade', damage: 35, description: 'A sword that cuts through dimensions' },
      { name: 'Dark Smite', damage: 28, description: 'Corrupted divine power turned to evil' },
      { name: 'Abyssal Shield', damage: 0, description: 'Summons protective void energy' }
    ]
  },
  {
    id: 'crystal_dragon',
    name: 'Prismatic Crystal Dragon',
    level: 25,
    health: { current: 300, max: 300 },
    maxHealth: 300,
    currentHealth: 300,
    attack: 40,
    defense: 18,
    experience: 220,
    gold: 120,
    description: 'A magnificent dragon whose scales are made of pure crystal, refracting light into deadly beams.',
    requiredLevel: 20,
    difficulty: 'boss',
    imageUrl: generateNPCImageUrl('dragon_whelp', 'Prismatic Crystal Dragon'),
    image: generateNPCImageUrl('dragon_whelp', 'Prismatic Crystal Dragon'),
    armorClass: 21,
    damageDie: 12,
    loot: {
      experience: 220,
      gold: { min: 90, max: 150 },
      items: [{
        id: 'crystal_scale',
        name: 'Prismatic Dragon Scale',
        description: 'A scale that shimmers with all the colors of the rainbow.',
        type: 'material',
        value: 150,
        rarity: 'epic'
      }]
    },
    stats: { strength: 20, dexterity: 16, constitution: 18, intelligence: 20, wisdom: 18, charisma: 22 },
    attacks: [
      { name: 'Prismatic Breath', damage: 40, description: 'Breath weapon that deals multiple damage types' },
      { name: 'Crystal Claw', damage: 35, description: 'Claws that can shatter steel' },
      { name: 'Light Refraction', damage: 30, description: 'Focuses sunlight into a devastating beam' }
    ]
  },
  {
    id: 'nightmare_lord',
    name: 'Lord of Nightmares',
    level: 28,
    health: { current: 250, max: 250 },
    maxHealth: 250,
    currentHealth: 250,
    attack: 45,
    defense: 10,
    experience: 280,
    gold: 140,
    description: 'A demon that feeds on fear and despair, manifesting the darkest nightmares of its victims.',
    requiredLevel: 25,
    difficulty: 'boss',
    imageUrl: generateNPCImageUrl('demon_lord', 'Lord of Nightmares'),
    image: generateNPCImageUrl('demon_lord', 'Lord of Nightmares'),
    armorClass: 18,
    damageDie: 10,
    loot: {
      experience: 280,
      gold: { min: 100, max: 180 },
      items: [{
        id: 'nightmare_essence',
        name: 'Essence of Pure Terror',
        description: 'A dark crystal that whispers of unspeakable horrors.',
        type: 'material',
        value: 180,
        rarity: 'epic'
      }]
    },
    stats: { strength: 16, dexterity: 18, constitution: 14, intelligence: 22, wisdom: 20, charisma: 24 },
    attacks: [
      { name: 'Terror Strike', damage: 45, description: 'An attack that manifests the victim\'s greatest fear' },
      { name: 'Nightmare Realm', damage: 35, description: 'Traps the enemy in a world of horrors' },
      { name: 'Fear Aura', damage: 0, description: 'Radiates an aura of pure terror' }
    ]
  },
  {
    id: 'phoenix_reborn',
    name: 'Phoenix of Eternal Rebirth',
    level: 30,
    health: { current: 350, max: 350 },
    maxHealth: 350,
    currentHealth: 350,
    attack: 50,
    defense: 15,
    experience: 350,
    gold: 200,
    description: 'A legendary phoenix that has died and been reborn countless times, each rebirth making it stronger.',
    requiredLevel: 28,
    difficulty: 'legendary',
    imageUrl: generateNPCImageUrl('fire_elemental', 'Phoenix of Eternal Rebirth'),
    image: generateNPCImageUrl('fire_elemental', 'Phoenix of Eternal Rebirth'),
    armorClass: 22,
    damageDie: 12,
    loot: {
      experience: 350,
      gold: { min: 150, max: 250 },
      items: [{
        id: 'phoenix_feather',
        name: 'Feather of Eternal Flame',
        description: 'A feather that burns with the fire of rebirth itself.',
        type: 'material',
        value: 250,
        rarity: 'legendary'
      }]
    },
    stats: { strength: 18, dexterity: 20, constitution: 16, intelligence: 18, wisdom: 22, charisma: 20 },
    attacks: [
      { name: 'Rebirth Flame', damage: 50, description: 'Fire that burns away weakness and brings renewal' },
      { name: 'Solar Flare', damage: 45, description: 'Unleashes the power of a miniature sun' },
      { name: 'Phoenix Resurrection', damage: 0, description: 'Heals itself through the power of rebirth' }
    ]
  }
];

// Level 31+ Enemies (Legendary Range)
const legendaryEnemies: Enemy[] = [
  {
    id: 'world_serpent',
    name: 'Jormungandr the World Serpent',
    level: 35,
    health: { current: 500, max: 500 },
    maxHealth: 500,
    currentHealth: 500,
    attack: 60,
    defense: 25,
    experience: 500,
    gold: 300,
    description: 'The legendary serpent that encircles the world, whose movement causes earthquakes and tidal waves.',
    requiredLevel: 32,
    difficulty: 'legendary',
    imageUrl: generateNPCImageUrl('giant_centipede', 'Jormungandr the World Serpent'),
    image: generateNPCImageUrl('giant_centipede', 'Jormungandr the World Serpent'),
    armorClass: 24,
    damageDie: 20,
    loot: {
      experience: 500,
      gold: { min: 200, max: 400 },
      items: [{
        id: 'world_scale',
        name: 'Scale of the World Serpent',
        description: 'A scale larger than a shield, imbued with the power of the earth itself.',
        type: 'material',
        value: 400,
        rarity: 'legendary'
      }]
    },
    stats: { strength: 26, dexterity: 14, constitution: 24, intelligence: 16, wisdom: 18, charisma: 12 },
    attacks: [
      { name: 'World Shaking Coil', damage: 60, description: 'Constricts with the force of tectonic plates' },
      { name: 'Poison Tsunami', damage: 50, description: 'Spits venom that could poison an ocean' },
      { name: 'Earthquake Thrash', damage: 55, description: 'Movement that splits the very ground' }
    ]
  },
  {
    id: 'time_lich',
    name: 'Chronarch the Time Lich',
    level: 40,
    health: { current: 400, max: 400 },
    maxHealth: 400,
    currentHealth: 400,
    attack: 70,
    defense: 20,
    experience: 600,
    gold: 350,
    description: 'An ancient lich who has mastered time itself, able to see all possible futures and pasts.',
    requiredLevel: 35,
    difficulty: 'legendary',
    imageUrl: generateNPCImageUrl('lich_lord', 'Chronarch the Time Lich'),
    image: generateNPCImageUrl('lich_lord', 'Chronarch the Time Lich'),
    armorClass: 23,
    damageDie: 12,
    loot: {
      experience: 600,
      gold: { min: 250, max: 450 },
      items: [{
        id: 'time_crystal',
        name: 'Crystal of Temporal Mastery',
        description: 'A crystal that contains fragments of time itself.',
        type: 'material',
        value: 500,
        rarity: 'legendary'
      }]
    },
    stats: { strength: 12, dexterity: 16, constitution: 18, intelligence: 26, wisdom: 24, charisma: 20 },
    attacks: [
      { name: 'Temporal Rift', damage: 70, description: 'Tears through time to strike from multiple moments' },
      { name: 'Age Decay', damage: 55, description: 'Ages the target rapidly, weakening them' },
      { name: 'Time Stop', damage: 0, description: 'Freezes time to gain multiple actions' }
    ]
  },
  {
    id: 'void_emperor',
    name: 'Emperor of the Endless Void',
    level: 45,
    health: { current: 600, max: 600 },
    maxHealth: 600,
    currentHealth: 600,
    attack: 80,
    defense: 30,
    experience: 750,
    gold: 500,
    description: 'The ruler of the space between worlds, a being of pure nothingness that seeks to unmake reality.',
    requiredLevel: 40,
    difficulty: 'mythic',
    imageUrl: generateNPCImageUrl('demon_lord', 'Emperor of the Endless Void'),
    image: generateNPCImageUrl('demon_lord', 'Emperor of the Endless Void'),
    armorClass: 25,
    damageDie: 20,
    loot: {
      experience: 750,
      gold: { min: 400, max: 600 },
      items: [{
        id: 'void_crown',
        name: 'Crown of Absolute Nothingness',
        description: 'A crown that exists and doesn\'t exist simultaneously.',
        type: 'accessory',
        value: 750,
        equipSlot: 'head',
        stats: { intelligence: 8, wisdom: 6, charisma: 10 },
        rarity: 'mythic'
      }]
    },
    stats: { strength: 20, dexterity: 18, constitution: 22, intelligence: 28, wisdom: 26, charisma: 30 },
    attacks: [
      { name: 'Reality Erasure', damage: 80, description: 'Attempts to erase the target from existence' },
      { name: 'Void Implosion', damage: 70, description: 'Creates a miniature black hole' },
      { name: 'Nihility Wave', damage: 60, description: 'A wave of pure nothingness' }
    ]
  },
  {
    id: 'creation_dragon',
    name: 'Bahamut the Creation Dragon',
    level: 50,
    health: { current: 1000, max: 1000 },
    maxHealth: 1000,
    currentHealth: 1000,
    attack: 100,
    defense: 40,
    experience: 1000,
    gold: 1000,
    description: 'The first dragon, present at the creation of the world. Its breath can create new realities or destroy existing ones.',
    requiredLevel: 45,
    difficulty: 'mythic',
    imageUrl: generateNPCImageUrl('ancient_dragon', 'Bahamut the Creation Dragon'),
    image: generateNPCImageUrl('ancient_dragon', 'Bahamut the Creation Dragon'),
    armorClass: 28,
    damageDie: 20,
    loot: {
      experience: 1000,
      gold: { min: 750, max: 1250 },
      items: [{
        id: 'creation_essence',
        name: 'Essence of Pure Creation',
        description: 'The fundamental force that shapes reality itself.',
        type: 'material',
        value: 1000,
        rarity: 'mythic'
      }]
    },
    stats: { strength: 30, dexterity: 24, constitution: 28, intelligence: 30, wisdom: 30, charisma: 32 },
    attacks: [
      { name: 'Genesis Breath', damage: 100, description: 'Breath that can create or destroy worlds' },
      { name: 'Divine Claw', damage: 85, description: 'Claws blessed with the power of creation' },
      { name: 'Reality Shaper', damage: 90, description: 'Reshapes the battlefield itself' },
      { name: 'Cosmic Roar', damage: 0, description: 'A roar that echoes across dimensions' }
    ]
  }
];

// Combine all enemy arrays and export functions
const allEnemies = [
  ...beginnerEnemies,
  ...intermediateEnemies,
  ...advancedEnemies,
  ...legendaryEnemies
];

export const getAllEnemies = (): Enemy[] => allEnemies;

export const getEnemiesByLevel = (minLevel: number, maxLevel: number): Enemy[] => {
  return allEnemies.filter(enemy => 
    enemy.level >= minLevel && enemy.level <= maxLevel
  );
};

export const getEnemiesByDifficulty = (difficulty: string): Enemy[] => {
  return allEnemies.filter(enemy => enemy.difficulty === difficulty);
};

// Export individual arrays for specific use cases
export { beginnerEnemies, intermediateEnemies, advancedEnemies, legendaryEnemies };

// Default export for backward compatibility
export const enemies = allEnemies;