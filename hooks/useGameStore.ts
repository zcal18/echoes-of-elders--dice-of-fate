import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState, ChatMessage, ChatLobby, Character, ShopItem, Enemy, FamiliarType, Item, Guild, Party, Friend, CreateCharacterInput, Territory, Mail, Research, PvpPlayer, PvpMatch, OnlineUser, GuildBattle } from '@/types/game';
import { shopItems } from '@/constants/items';
import { getAllEnemies } from '@/constants/enemies';
import { races, classes, spells } from '@/constants/gameData';

const familiarCosts: Record<FamiliarType, number> = {
  sprite: 50,
  raven: 75,
  wolf: 100,
  golem: 150,
  dragon: 300,
  phoenix: 500
};

const familiarLevelRequirements: Record<FamiliarType, number> = {
  sprite: 1,
  raven: 5,
  wolf: 10,
  golem: 15,
  dragon: 25,
  phoenix: 35
};

// Enhanced territory data for 8x8 grid
const initialTerritories: Territory[] = [
  // Row 0
  { id: 'northport', name: 'Northport', type: 'plains', position: { x: 1, y: 0 }, description: 'A bustling trading port at the northern edge of the kingdom.', defenseStrength: 8, strategicValue: 12, resources: ['Trade', 'Fish'], lore: 'Founded by merchant sailors, Northport serves as the gateway to northern lands. Its harbors are always filled with ships from distant realms.', isClaimable: true },
  { id: 'crystal_lake', name: 'Crystal Lake', type: 'water', position: { x: 3, y: 0 }, description: 'A pristine lake with magical properties.', defenseStrength: 0, strategicValue: 8, resources: ['Magic', 'Water'], lore: 'The crystal-clear waters are said to enhance magical abilities and provide visions of the future.', isClaimable: false },
  { id: 'frostpeak', name: 'Frostpeak', type: 'mountain', position: { x: 6, y: 0 }, description: 'The highest mountain in the realm, perpetually snow-capped.', defenseStrength: 15, strategicValue: 10, resources: ['Stone', 'Ice'], lore: 'Ancient dragons once nested in these peaks. The summit is said to touch the realm of the gods.', isClaimable: true },
  
  // Row 1
  { id: 'whispering_woods', name: 'Whispering Woods', type: 'forest', position: { x: 0, y: 1 }, description: 'An ancient forest where the trees seem to whisper secrets.', defenseStrength: 10, strategicValue: 9, resources: ['Wood', 'Herbs'], lore: 'Druids claim the trees here are sentient, sharing wisdom with those who know how to listen.', isClaimable: true },
  { id: 'goldmeadow', name: 'Goldmeadow', type: 'plains', position: { x: 2, y: 1 }, description: 'Fertile farmlands that feed much of the kingdom.', defenseStrength: 5, strategicValue: 11, resources: ['Food', 'Gold'], lore: 'The soil here is blessed by harvest gods, yielding crops that seem to grow overnight.', isClaimable: true },
  { id: 'ironhold', name: 'Ironhold', type: 'mountain', position: { x: 5, y: 1 }, description: 'A fortress built into the mountainside, rich in iron ore.', defenseStrength: 18, strategicValue: 13, resources: ['Iron', 'Stone'], lore: 'Dwarven miners carved this stronghold from living rock. Its forges never cool.', isClaimable: true },
  { id: 'shadowmere', name: 'Shadowmere', type: 'water', position: { x: 7, y: 1 }, description: 'A dark lake shrouded in perpetual mist.', defenseStrength: 0, strategicValue: 6, resources: ['Mystery', 'Shadow'], lore: 'Strange creatures are said to dwell in its depths, and few who enter the mist return unchanged.', isClaimable: false },
  
  // Row 2
  { id: 'wyngarde_manor', name: 'Wyngarde Manor', type: 'castle', position: { x: 0, y: 2 }, description: 'An ancient noble estate with towering spires and fortified walls.', defenseStrength: 20, strategicValue: 14, resources: ['Noble Heritage', 'Ancient Knowledge'], lore: 'Once home to the legendary Wyngarde family, this manor holds secrets of old nobility and forgotten magics. Its libraries contain tomes that predate the kingdom itself.', isClaimable: true },
  { id: 'sunspire', name: 'Sunspire', type: 'plains', position: { x: 1, y: 2 }, description: 'A tower that catches the first light of dawn.', defenseStrength: 12, strategicValue: 10, resources: ['Light', 'Knowledge'], lore: 'Scholars and mages study here, using the pure sunlight to power their research.', isClaimable: true },
  { id: 'emerald_grove', name: 'Emerald Grove', type: 'forest', position: { x: 4, y: 2 }, description: 'A sacred grove where nature magic is strongest.', defenseStrength: 8, strategicValue: 12, resources: ['Magic', 'Gems'], lore: 'The heart of druidic power, where ancient rituals maintain the balance of nature.', isClaimable: true },
  { id: 'stormwatch', name: 'Stormwatch', type: 'mountain', position: { x: 6, y: 2 }, description: 'A watchtower that monitors weather patterns.', defenseStrength: 14, strategicValue: 8, resources: ['Weather', 'Stone'], lore: 'Storm mages built this tower to predict and control the weather across the realm.', isClaimable: true },
  
  // Row 3
  { id: 'silverstream', name: 'Silverstream', type: 'water', position: { x: 0, y: 3 }, description: 'A river that flows with silver-tinted water.', defenseStrength: 0, strategicValue: 9, resources: ['Silver', 'Water'], lore: 'The silver comes from upstream mines, making this river valuable for both trade and magic.', isClaimable: false },
  { id: 'thornwall', name: 'Thornwall', type: 'forest', position: { x: 2, y: 3 }, description: 'A dense forest of thorny trees that forms a natural barrier.', defenseStrength: 16, strategicValue: 7, resources: ['Defense', 'Thorns'], lore: 'These thorns are said to be cursed, growing to protect ancient secrets within.', isClaimable: true },
  { id: 'royal_spire', name: 'Royal Spire', type: 'plains', position: { x: 3, y: 3 }, description: 'The ultimate seat of power in the kingdom.', defenseStrength: 25, strategicValue: 15, resources: ['Power', 'Authority'], lore: 'Only when all territories bow to one guild does this spire emerge from the earth, awaiting its true ruler.', isClaimable: false, isRoyalSpire: true },
  { id: 'moonwell', name: 'Moonwell', type: 'plains', position: { x: 5, y: 3 }, description: 'A mystical well that glows under moonlight.', defenseStrength: 6, strategicValue: 11, resources: ['Moon Magic', 'Water'], lore: 'The well draws power from lunar cycles, strongest during the full moon.', isClaimable: true },
  { id: 'dragonrest', name: 'Dragonrest', type: 'mountain', position: { x: 7, y: 3 }, description: 'Ancient dragon lairs carved into the mountainside.', defenseStrength: 20, strategicValue: 14, resources: ['Dragon Bones', 'Treasure'], lore: 'Though the great dragons are gone, their power still lingers in these caves.', isClaimable: true },
  
  // Row 4
  { id: 'mistwood', name: 'Mistwood', type: 'forest', position: { x: 1, y: 4 }, description: 'A forest perpetually shrouded in magical mist.', defenseStrength: 11, strategicValue: 8, resources: ['Illusion', 'Herbs'], lore: 'The mist here plays tricks on travelers, leading them in circles or to hidden treasures.', isClaimable: true },
  { id: 'goldenpeak', name: 'Goldenpeak', type: 'mountain', position: { x: 4, y: 4 }, description: 'A mountain rich in precious metals and gems.', defenseStrength: 13, strategicValue: 13, resources: ['Gold', 'Gems'], lore: 'Miners work day and night to extract the wealth hidden in these peaks.', isClaimable: true },
  { id: 'starfall_desert', name: 'Starfall Desert', type: 'desert', position: { x: 6, y: 4 }, description: 'A desert where meteors frequently fall from the sky.', defenseStrength: 7, strategicValue: 10, resources: ['Star Metal', 'Sand'], lore: 'The meteors bring rare materials from the heavens, prized by smiths and mages alike.', isClaimable: true },
  
  // Row 5
  { id: 'deepwater', name: 'Deepwater', type: 'water', position: { x: 0, y: 5 }, description: 'The deepest part of the great lake.', defenseStrength: 0, strategicValue: 7, resources: ['Deep Fish', 'Pearls'], lore: 'Ancient creatures dwell in these depths, guardians of underwater treasures.', isClaimable: false },
  { id: 'brightmeadow', name: 'Brightmeadow', type: 'plains', position: { x: 2, y: 5 }, description: 'Sunlit plains where flowers bloom year-round.', defenseStrength: 4, strategicValue: 9, resources: ['Flowers', 'Honey'], lore: 'The eternal spring here is maintained by nature spirits who dance in the meadows.', isClaimable: true },
  { id: 'shadowpine', name: 'Shadowpine', type: 'forest', position: { x: 5, y: 5 }, description: 'Dark pine forest where shadows seem to move on their own.', defenseStrength: 12, strategicValue: 6, resources: ['Dark Wood', 'Shadows'], lore: 'Shadow creatures are said to inhabit these woods, neither good nor evil, but mysterious.', isClaimable: true },
  { id: 'sandstone_cliffs', name: 'Sandstone Cliffs', type: 'desert', position: { x: 7, y: 5 }, description: 'Towering cliffs of red sandstone overlooking the desert.', defenseStrength: 15, strategicValue: 8, resources: ['Stone', 'Vantage'], lore: 'These cliffs provide an excellent view of the entire southern region.', isClaimable: true },
  
  // Row 6
  { id: 'willowbend', name: 'Willowbend', type: 'plains', position: { x: 1, y: 6 }, description: 'Peaceful plains dotted with weeping willows.', defenseStrength: 3, strategicValue: 7, resources: ['Peace', 'Willow'], lore: 'A place of healing and rest, where wounded warriors come to recover.', isClaimable: true },
  { id: 'crystalcave', name: 'Crystalcave', type: 'mountain', position: { x: 3, y: 6 }, description: 'Caves filled with magical crystals that amplify spells.', defenseStrength: 9, strategicValue: 12, resources: ['Crystals', 'Magic'], lore: 'Mages journey here to charge their artifacts and learn new spells.', isClaimable: true },
  { id: 'oasis_springs', name: 'Oasis Springs', type: 'desert', position: { x: 5, y: 6 }, description: 'Life-giving springs in the heart of the desert.', defenseStrength: 6, strategicValue: 11, resources: ['Water', 'Life'], lore: 'These springs never run dry, sustained by deep underground rivers.', isClaimable: true },
  
  // Row 7
  { id: 'southgate', name: 'Southgate', type: 'plains', position: { x: 2, y: 7 }, description: 'The southern entrance to the kingdom.', defenseStrength: 10, strategicValue: 10, resources: ['Trade', 'Defense'], lore: 'All travelers from the south must pass through this fortified gate.', isClaimable: true },
  { id: 'mirage_dunes', name: 'Mirage Dunes', type: 'desert', position: { x: 4, y: 7 }, description: 'Shifting sand dunes where mirages reveal hidden truths.', defenseStrength: 5, strategicValue: 9, resources: ['Illusion', 'Truth'], lore: 'The mirages here sometimes show visions of the past or future.', isClaimable: true },
  { id: 'sunset_ridge', name: 'Sunset Ridge', type: 'mountain', position: { x: 6, y: 7 }, description: 'A ridge that offers spectacular sunset views.', defenseStrength: 11, strategicValue: 8, resources: ['Beauty', 'Stone'], lore: 'Artists and poets gather here to capture the perfect sunset in their work.', isClaimable: true }
];

// Initial research data
const initialResearch: Research[] = [
  {
    id: 'basic_combat',
    name: 'Basic Combat Techniques',
    description: 'Learn fundamental combat maneuvers to improve your fighting skills.',
    category: 'combat',
    duration: 5 * 60 * 1000, // 5 minutes in milliseconds
    requirements: { level: 1 },
    rewards: { 
      experience: 50,
      statBoosts: { strength: 1 }
    },
    isCompleted: false
  },
  {
    id: 'advanced_combat',
    name: 'Advanced Combat Strategies',
    description: 'Master complex combat tactics to gain an edge in battle.',
    category: 'combat',
    duration: 15 * 60 * 1000, // 15 minutes
    requirements: { level: 5, prerequisites: ['basic_combat'] },
    rewards: { 
      experience: 150,
      statBoosts: { strength: 2, dexterity: 1 }
    },
    isCompleted: false
  },
  {
    id: 'elemental_magic',
    name: 'Elemental Magic Basics',
    description: 'Study the foundations of elemental magic to cast simple spells.',
    category: 'magic',
    duration: 10 * 60 * 1000, // 10 minutes
    requirements: { level: 3 },
    rewards: { 
      experience: 100, 
      unlocks: ['spell:magic_missile'],
      statBoosts: { intelligence: 1 }
    },
    isCompleted: false
  },
  {
    id: 'arcane_rituals',
    name: 'Arcane Rituals',
    description: 'Delve into ancient rituals to unlock powerful magical abilities.',
    category: 'magic',
    duration: 30 * 60 * 1000, // 30 minutes
    requirements: { level: 10, prerequisites: ['elemental_magic'] },
    rewards: { 
      experience: 300, 
      unlocks: ['spell:fireball'],
      statBoosts: { intelligence: 2, wisdom: 1 }
    },
    isCompleted: false
  },
  {
    id: 'basic_crafting',
    name: 'Basic Crafting Skills',
    description: 'Learn to craft simple items and equipment from raw materials.',
    category: 'crafting',
    duration: 8 * 60 * 1000, // 8 minutes
    requirements: { level: 2 },
    rewards: { 
      experience: 80, 
      unlocks: ['item:crafting_kit'],
      statBoosts: { dexterity: 1 }
    },
    isCompleted: false
  },
  {
    id: 'advanced_crafting',
    name: 'Advanced Crafting Techniques',
    description: 'Master the art of crafting to create superior gear and artifacts.',
    category: 'crafting',
    duration: 20 * 60 * 1000, // 20 minutes
    requirements: { level: 7, prerequisites: ['basic_crafting'] },
    rewards: { 
      experience: 200, 
      unlocks: ['item:artisan_tools'],
      statBoosts: { dexterity: 2, intelligence: 1 }
    },
    isCompleted: false
  },
  {
    id: 'defensive_tactics',
    name: 'Defensive Tactics',
    description: 'Learn techniques to improve your defensive capabilities in combat.',
    category: 'combat',
    duration: 12 * 60 * 1000, // 12 minutes
    requirements: { level: 4, prerequisites: ['basic_combat'] },
    rewards: { 
      experience: 120,
      statBoosts: { constitution: 2 }
    },
    isCompleted: false
  },
  {
    id: 'healing_arts',
    name: 'Healing Arts',
    description: 'Study the fundamentals of magical healing and first aid.',
    category: 'magic',
    duration: 18 * 60 * 1000, // 18 minutes
    requirements: { level: 6, prerequisites: ['elemental_magic'] },
    rewards: { 
      experience: 180, 
      unlocks: ['spell:heal'],
      statBoosts: { wisdom: 2 }
    },
    isCompleted: false
  }
];

// Helper function to calculate base stats
const getBaseStats = (character: Character) => {
  const race = races.find(r => r.id === character.race);
  const characterClass = classes.find(c => c.id === character.class);
  
  const baseStats = {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10
  };
  
  // Apply race bonuses
  if (race?.statBonuses) {
    Object.entries(race.statBonuses).forEach(([stat, bonus]) => {
      if (stat in baseStats && typeof bonus === 'number' && bonus !== null && bonus !== undefined) {
        baseStats[stat as keyof typeof baseStats] += bonus;
      }
    });
  }
  
  // Apply class bonuses if they exist
  if (characterClass?.statBonuses) {
    Object.entries(characterClass.statBonuses).forEach(([stat, bonus]) => {
      if (stat in baseStats && typeof bonus === 'number' && bonus !== null && bonus !== undefined) {
        baseStats[stat as keyof typeof baseStats] += bonus;
      }
    });
  }
  
  // Apply level bonuses (2 points per level)
  const levelBonus = (character.level - 1) * 2;
  baseStats.strength += Math.floor(levelBonus / 6);
  baseStats.dexterity += Math.floor(levelBonus / 6);
  baseStats.constitution += Math.floor(levelBonus / 6);
  baseStats.intelligence += Math.floor(levelBonus / 6);
  baseStats.wisdom += Math.floor(levelBonus / 6);
  baseStats.charisma += Math.floor(levelBonus / 6);
  
  return baseStats;
};

// Helper function to calculate total stats
const calculateTotalStats = (baseStats: any, equipment: any) => {
  const totalStats = { ...baseStats };
  
  // Add equipment bonuses
  Object.values(equipment).forEach((item: any) => {
    if (item?.stats) {
      Object.entries(item.stats).forEach(([stat, value]) => {
        if (value && stat in totalStats) {
          totalStats[stat as keyof typeof totalStats] += value;
        }
      });
    }
    if (item?.boost) {
      Object.entries(item.boost).forEach(([stat, value]) => {
        if (value && stat in totalStats) {
          totalStats[stat as keyof typeof totalStats] += value;
        }
      });
    }
  });
  
  return totalStats;
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Authentication
      isAuthenticated: false,
      username: '',
      
      // Character Management
      characters: [],
      activeCharacter: null,
      userRole: 'player',
      
      // Currency
      diamonds: 100, // Starting diamonds
      
      // Social
      guilds: [],
      activeParty: null,
      friendsList: [],
      onlineFriends: [],
      
      // Territory System (not persisted)
      territories: initialTerritories,
      
      // Guild Battles
      guildBattles: [],
      activeGuildBattle: null,
      
      // Mail System
      mailbox: [],
      
      // Research System
      researchItems: initialResearch,
      activeResearch: [],
      completedResearch: [],
      
      // Chat State (not persisted)
      activeChannel: 'general',
      chatLobbies: [
        {
          id: 'general',
          name: 'General',
          description: 'Main chat room for all players',
          type: 'default',
          createdAt: Date.now(),
          members: [],
          messages: [],
          isPrivate: false
        },
        {
          id: 'help',
          name: 'Help',
          description: 'Get help from other players',
          type: 'default',
          createdAt: Date.now(),
          members: [],
          messages: [],
          isPrivate: false
        },
        {
          id: 'trading',
          name: 'Trading',
          description: 'Buy and sell items with other players',
          type: 'default',
          createdAt: Date.now(),
          members: [],
          messages: [],
          isPrivate: false
        },
        {
          id: 'guild-recruitment',
          name: 'Guild Recruitment',
          description: 'Find or advertise guilds',
          type: 'default',
          createdAt: Date.now(),
          members: [],
          messages: [],
          isPrivate: false
        }
      ],
      chatPopout: false,
      
      // Online Users (not persisted)
      onlineUsers: [],
      
      // Shop State (not persisted)
      shopItems: shopItems.map((item: ShopItem) => ({ ...item, stock: item.stock || 10 })),
      availableEnemies: [],
      
      // Combat State (not persisted)
      selectedOpponent: null,
      
      // PVP State
      pvpQueue: [],
      activePvpMatch: null,
      pvpRanking: 1000,
      
      // Notification system (not persisted)
      notifications: [],
      
      // Authentication Functions
      login: (username: string) => {
        set({
          isAuthenticated: true,
          username
        });
      },
      
      // Character Functions
      createCharacter: (characterInput: CreateCharacterInput) => {
        const { characters, isAuthenticated } = get();
        
        // Check authentication first
        if (!isAuthenticated) {
          get().addNotification('Please log in to create a character', 'error');
          return;
        }
        
        // Check if user already has 3 characters
        if (characters.length >= 3) {
          get().addNotification('Maximum of 3 characters allowed. Delete a character first.', 'error');
          return;
        }
        
        const race = races.find(r => r.id === characterInput.race);
        let characterClass = classes.find(c => c.id === characterInput.class);
        
        if (!race) {
          console.error("Invalid race selected");
          return;
        }
        
        // Handle custom class
        if (characterInput.class === 'custom' && characterInput.customClass) {
          characterClass = {
            id: 'custom',
            name: characterInput.customClass.name,
            description: characterInput.customClass.description,
            primaryStat: characterInput.customClass.primaryStat,
            abilities: characterInput.customClass.abilities,
            startingEquipment: characterInput.customClass.startingEquipment,
            lore: characterInput.customClass.lore,
            isCustom: true
          };
        }
        
        if (!characterClass) {
          console.error("Invalid class selected");
          return;
        }
        
        // Calculate base stats from race bonuses
        const raceStatBonuses = characterInput.race === 'custom' && characterInput.customRace 
          ? characterInput.customRace.statBonuses 
          : race.statBonuses;
        
        const baseStats = {
          strength: 10 + (raceStatBonuses.strength || 0),
          dexterity: 10 + (raceStatBonuses.dexterity || 0),
          constitution: 10 + (raceStatBonuses.constitution || 0),
          intelligence: 10 + (raceStatBonuses.intelligence || 0),
          wisdom: 10 + (raceStatBonuses.wisdom || 0),
          charisma: 10 + (raceStatBonuses.charisma || 0)
        };
        
        // Calculate health and mana based on constitution and intelligence
        const healthMax = 50 + (baseStats.constitution * 5);
        const manaMax = 30 + (baseStats.intelligence * 3);
        
        // Calculate combat properties
        const armorClass = 10 + Math.floor((baseStats.dexterity - 10) / 2); // Base AC + DEX modifier
        const damageDie = 4; // Starting with d4 for new characters
        
        // Create starting inventory with basic items
        const startingInventory: Item[] = [
          {
            id: `starter_sword_${Date.now()}`,
            name: 'Rusty Sword',
            description: 'A worn but functional blade for beginners.',
            type: 'weapon',
            rarity: 'common',
            value: 25,
            equipSlot: 'mainHand',
            stats: {
              attack: 3,
              strength: 1
            }
          },
          {
            id: `starter_armor_${Date.now()}`,
            name: 'Cloth Tunic',
            description: 'Simple cloth protection for new adventurers.',
            type: 'armor',
            rarity: 'common',
            value: 15,
            equipSlot: 'chest',
            stats: {
              defense: 1
            }
          },
          {
            id: `health_potion_${Date.now()}_1`,
            name: 'Health Potion',
            description: 'A red liquid that restores health when consumed.',
            type: 'potion',
            rarity: 'common',
            value: 25,
            effects: [
              { type: 'heal', value: 25 }
            ],
            stackable: true,
            quantity: 1
          },
          {
            id: `health_potion_${Date.now()}_2`,
            name: 'Health Potion',
            description: 'A red liquid that restores health when consumed.',
            type: 'potion',
            rarity: 'common',
            value: 25,
            effects: [
              { type: 'heal', value: 25 }
            ],
            stackable: true,
            quantity: 1
          },
          {
            id: `revive_potion_${Date.now()}`,
            name: 'Phoenix Feather Potion',
            description: 'A mystical potion that can revive a fainted character.',
            type: 'potion',
            rarity: 'rare',
            value: 100,
            effects: [
              { type: 'revive', value: Math.floor(healthMax * 0.25) }
            ],
            stackable: true,
            quantity: 1
          }
        ];

        const newCharacter: Character = {
          id: Date.now().toString(),
          name: characterInput.name,
          race: characterInput.race,
          class: characterInput.class,
          profileImage: characterInput.profileImage,
          level: 1,
          experience: 0,
          experienceToNextLevel: 100,
          health: {
            current: healthMax,
            max: healthMax
          },
          mana: {
            current: manaMax,
            max: manaMax
          },
          stats: baseStats,
          inventory: startingInventory,
          equipment: {},
          gold: 50, // Starting gold
          buffs: [],
          debuffs: [],
          customClass: characterInput.customClass,
          customRace: characterInput.customRace,
          unlockedSpells: [],
          unlockedItems: [],
          // Combat properties
          currentHealth: healthMax,
          maxHealth: healthMax,
          armorClass: armorClass,
          damageDie: damageDie
        };
        
        set((state: GameState) => {
          const updatedCharacters = [...state.characters, newCharacter];
          // Check if this is the first character to send welcome letter and gold
          if (state.characters.length === 0) {
            const welcomeMail: Mail = {
              id: Date.now().toString(),
              sender: "Generous Lord",
              recipient: newCharacter.name,
              subject: "Welcome to the Realm",
              message: "Greetings, brave soul. Welcome to this realm of adventure and danger. As a token of my generosity, I bestow upon you 500 gold to aid in your journey. But beware, not everything comes without cost. A time may come when a debt is owed. Tread carefully.\n\n- A Generous Lord",
              timestamp: Date.now(),
              isRead: false,
              isStarred: false
            };
            return {
              characters: updatedCharacters,
              activeCharacter: newCharacter,
              isAuthenticated: true,
              mailbox: [...state.mailbox, welcomeMail],
              diamonds: state.diamonds // unchanged
            };
          }
          return {
            characters: updatedCharacters,
            activeCharacter: newCharacter,
            isAuthenticated: true
          };
        });
        
        // Add 500 gold if first character
        const currentState = get();
        if (currentState.characters.filter(c => c.id !== newCharacter.id).length === 0) {
          set((state: GameState) => ({
            characters: state.characters.map((c: Character) =>
              c.id === newCharacter.id ? { ...c, gold: c.gold + 500 } : c
            ),
            activeCharacter: state.activeCharacter?.id === newCharacter.id 
              ? { ...state.activeCharacter, gold: state.activeCharacter.gold + 500 }
              : state.activeCharacter
          }));
        }
        
        // Only show notification once
        get().addNotification(`Character ${newCharacter.name} created successfully!`, 'success');
      },
      
      deleteCharacter: (characterId: string) => {
        const { characters, activeCharacter, isAuthenticated } = get();
        
        if (!isAuthenticated) {
          get().addNotification('Please log in to delete characters', 'error');
          return;
        }
        
        const characterToDelete = characters.find(c => c.id === characterId);
        
        if (!characterToDelete) {
          get().addNotification('Character not found!', 'error');
          return;
        }
        
        // Remove character from the list
        const updatedCharacters = characters.filter(c => c.id !== characterId);
        
        // If the deleted character was active, set a new active character or null
        let newActiveCharacter = activeCharacter;
        if (activeCharacter?.id === characterId) {
          newActiveCharacter = updatedCharacters.length > 0 ? updatedCharacters[0] : null;
        }
        
        set((state: GameState) => ({
          characters: updatedCharacters,
          activeCharacter: newActiveCharacter
        }));
        
        get().addNotification(`Character ${characterToDelete.name} deleted successfully!`, 'success');
      },
      
      selectCharacter: (characterId: string) => {
        const { isAuthenticated } = get();
        
        if (!isAuthenticated) {
          get().addNotification('Please log in to select a character', 'error');
          return;
        }
        
        const character = get().characters.find((c: Character) => c.id === characterId);
        if (character) {
          // Ensure all character properties exist when selecting
          const updatedCharacter = {
            ...character,
            inventory: character.inventory || [],
            equipment: character.equipment || {},
            buffs: character.buffs || [],
            debuffs: character.debuffs || [],
            unlockedSpells: character.unlockedSpells || [],
            unlockedItems: character.unlockedItems || [],
            // Ensure combat properties exist
            currentHealth: character.currentHealth || character.health?.current || character.maxHealth || 50,
            maxHealth: character.maxHealth || character.health?.max || 50,
            armorClass: character.armorClass || 10,
            damageDie: character.damageDie || 4
          };
          set({ activeCharacter: updatedCharacter });
          
          // Auto-join guild chat if character is in a guild
          if (character.guildId) {
            get().autoJoinGuildChat(character.guildId);
          }
        }
      },
      
      updateCharacterProfileImage: (characterId: string, imageUrl: string) => {
        const { isAuthenticated } = get();
        
        if (!isAuthenticated) {
          get().addNotification('Please log in to update character profile', 'error');
          return;
        }
        
        set((state: GameState) => ({
          characters: state.characters.map((c: Character) =>
            c.id === characterId ? { ...c, profileImage: imageUrl } : c
          ),
          activeCharacter: state.activeCharacter?.id === characterId 
            ? { ...state.activeCharacter, profileImage: imageUrl }
            : state.activeCharacter
        }));
      },
      
      addExperience: (amount: number) => {
        const { activeCharacter, isAuthenticated } = get();
        if (!activeCharacter || !isAuthenticated) return;
        
        set((state: GameState) => ({
          characters: state.characters.map((c: Character) =>
            c.id === activeCharacter.id ? { ...c, experience: c.experience + amount } : c
          ),
          activeCharacter: { ...activeCharacter, experience: activeCharacter.experience + amount }
        }));
      },
      
      gainExperience: (amount: number) => {
        const { activeCharacter, isAuthenticated } = get();
        if (!activeCharacter || !isAuthenticated) return;
        
        const newExperience = activeCharacter.experience + amount;
        let newLevel = activeCharacter.level;
        let experienceToNextLevel = activeCharacter.experienceToNextLevel;
        let statIncrease = 0;
        
        // Check for level up
        if (newExperience >= experienceToNextLevel) {
          newLevel++;
          statIncrease = 2; // Increase stats by 2 per level
          experienceToNextLevel = Math.floor(experienceToNextLevel * 1.5); // Increase required XP by 50%
        }
        
        // Update stats on level up
        const updatedStats = statIncrease > 0 ? {
          ...activeCharacter.stats,
          strength: activeCharacter.stats.strength + statIncrease,
          dexterity: activeCharacter.stats.dexterity + statIncrease,
          constitution: activeCharacter.stats.constitution + statIncrease,
          intelligence: activeCharacter.stats.intelligence + statIncrease,
          wisdom: activeCharacter.stats.wisdom + statIncrease,
          charisma: activeCharacter.stats.charisma + statIncrease
        } : activeCharacter.stats;
        
        // Recalculate health and mana based on new stats
        const healthMax = statIncrease > 0 ? 50 + (updatedStats.constitution * 5) : activeCharacter.health.max;
        const manaMax = statIncrease > 0 ? 30 + (updatedStats.intelligence * 3) : activeCharacter.mana.max;
        
        set((state: GameState) => ({
          characters: state.characters.map((c: Character) =>
            c.id === activeCharacter.id ? { 
              ...c, 
              experience: newExperience,
              level: newLevel,
              experienceToNextLevel,
              stats: updatedStats,
              health: { current: healthMax, max: healthMax },
              mana: { current: manaMax, max: manaMax },
              currentHealth: healthMax,
              maxHealth: healthMax
            } : c
          ),
          activeCharacter: { 
            ...activeCharacter, 
            experience: newExperience,
            level: newLevel,
            experienceToNextLevel,
            stats: updatedStats,
            health: { current: healthMax, max: healthMax },
            mana: { current: manaMax, max: manaMax },
            currentHealth: healthMax,
            maxHealth: healthMax
          }
        }));
      },
      
      addGold: (amount: number) => {
        const { activeCharacter, isAuthenticated } = get();
        if (!activeCharacter || !isAuthenticated) return;
        
        set((state: GameState) => ({
          characters: state.characters.map((c: Character) =>
            c.id === activeCharacter.id ? { ...c, gold: c.gold + amount } : c
          ),
          activeCharacter: { ...activeCharacter, gold: activeCharacter.gold + amount }
        }));
      },
      
      gainGold: (amount: number) => {
        const { activeCharacter, isAuthenticated } = get();
        if (!activeCharacter || !isAuthenticated) return;
        
        set((state: GameState) => ({
          characters: state.characters.map((c: Character) =>
            c.id === activeCharacter.id ? { ...c, gold: c.gold + amount } : c
          ),
          activeCharacter: { ...activeCharacter, gold: activeCharacter.gold + amount }
        }));
      },
      
      gainDiamonds: (amount: number) => {
        const { isAuthenticated } = get();
        if (!isAuthenticated) return;
        
        set((state: GameState) => ({
          diamonds: state.diamonds + amount
        }));
      },
      
      spendGold: (amount: number) => {
        const { activeCharacter, isAuthenticated } = get();
        if (!activeCharacter || !isAuthenticated || activeCharacter.gold < amount) return false;
        
        set((state: GameState) => ({
          characters: state.characters.map((c: Character) =>
            c.id === activeCharacter.id ? { ...c, gold: c.gold - amount } : c
          ),
          activeCharacter: { ...activeCharacter, gold: activeCharacter.gold - amount }
        }));
        
        return true;
      },
      
      updateCharacterHealth: (characterId: string, newHealth: number) => {
        const { activeCharacter, isAuthenticated } = get();
        if (!activeCharacter || activeCharacter.id !== characterId || !isAuthenticated) return;
        
        // Ensure health doesn't exceed max
        const clampedHealth = Math.min(newHealth, activeCharacter.health.max);
        
        set((state: GameState) => ({
          characters: state.characters.map((c: Character) =>
            c.id === characterId ? { 
              ...c, 
              health: { ...c.health, current: clampedHealth },
              currentHealth: clampedHealth
            } : c
          ),
          activeCharacter: { 
            ...activeCharacter, 
            health: { ...activeCharacter.health, current: clampedHealth },
            currentHealth: clampedHealth
          }
        }));
      },
      
      // Territory Functions
      claimTerritory: (territoryId: string, guildId: string) => {
        const { isAuthenticated } = get();
        if (!isAuthenticated) return;
        
        set((state: GameState) => ({
          territories: state.territories.map(territory =>
            territory.id === territoryId
              ? { ...territory, controllingGuild: guildId }
              : territory
          )
        }));
      },
      
      unlockRoyalSpire: () => {
        const { isAuthenticated } = get();
        if (!isAuthenticated) return;
        
        set((state: GameState) => ({
          territories: state.territories.map(territory =>
            territory.isRoyalSpire
              ? { ...territory, isClaimable: true }
              : territory
          )
        }));
      },
      
      // Guild Battle Functions
      initiateGuildBattle: (territoryId: string, attackingGuildId: string) => {
        const { territories, guilds, activeCharacter, isAuthenticated } = get();
        if (!activeCharacter || !isAuthenticated) return;
        
        const territory = territories.find(t => t.id === territoryId);
        const attackingGuild = guilds.find(g => g.id === attackingGuildId);
        const defendingGuild = territory?.controllingGuild 
          ? guilds.find(g => g.id === territory.controllingGuild)
          : undefined;
        
        if (!territory || !attackingGuild) return;
        
        const newBattle: GuildBattle = {
          id: `battle_${Date.now()}`,
          territoryId,
          attackingGuild,
          defendingGuild,
          attackers: [activeCharacter.id],
          defenders: [],
          status: 'recruiting',
          startTime: Date.now() + 300000, // 5 minutes to recruit
          maxParticipants: 3,
          currentTurn: null
        };
        
        set((state: GameState) => ({
          guildBattles: [...state.guildBattles, newBattle]
        }));
        
        get().addNotification('Guild battle initiated! Recruiting participants...', 'info');
      },
      
      joinGuildBattle: (battleId: string, side: 'attacker' | 'defender') => {
        const { activeCharacter, guildBattles, isAuthenticated } = get();
        if (!activeCharacter || !isAuthenticated) return;
        
        set((state: GameState) => ({
          guildBattles: state.guildBattles.map(battle => {
            if (battle.id === battleId && battle.status === 'recruiting') {
              if (side === 'attacker' && battle.attackers.length < 3) {
                return { ...battle, attackers: [...battle.attackers, activeCharacter.id] };
              } else if (side === 'defender' && battle.defenders.length < 3) {
                return { ...battle, defenders: [...battle.defenders, activeCharacter.id] };
              }
            }
            return battle;
          })
        }));
      },
      
      startGuildBattle: (battleId: string) => {
        const { isAuthenticated } = get();
        if (!isAuthenticated) return;
        
        set((state: GameState) => ({
          guildBattles: state.guildBattles.map(battle =>
            battle.id === battleId
              ? { ...battle, status: 'active', currentTurn: battle.attackers[0] }
              : battle
          ),
          activeGuildBattle: state.guildBattles.find(b => b.id === battleId) || null
        }));
      },
      
      // Inventory Functions
      addItem: (item: Item) => {
        const { activeCharacter, isAuthenticated } = get();
        if (!activeCharacter || !isAuthenticated) return;
        
        // Ensure inventory exists
        const inventory = activeCharacter.inventory || [];
        
        set((state: GameState) => ({
          characters: state.characters.map((c: Character) =>
            c.id === activeCharacter.id ? { ...c, inventory: [...inventory, item] } : c
          ),
          activeCharacter: { ...activeCharacter, inventory: [...inventory, item] }
        }));
      },
      
      removeItem: (itemId: string) => {
        const { activeCharacter, isAuthenticated } = get();
        if (!activeCharacter || !isAuthenticated) return;
        
        // Ensure inventory exists
        const inventory = activeCharacter.inventory || [];
        
        set((state: GameState) => ({
          characters: state.characters.map((c: Character) =>
            c.id === activeCharacter.id 
              ? { ...c, inventory: inventory.filter((i: Item) => i.id !== itemId) }
              : c
          ),
          activeCharacter: { 
            ...activeCharacter, 
            inventory: inventory.filter((i: Item) => i.id !== itemId) 
          }
        }));
      },
      
      equipItem: (itemId: string, slot?: string) => {
        const { activeCharacter, isAuthenticated } = get();
        if (!activeCharacter || !isAuthenticated) return;
        
        // Ensure inventory exists
        const inventory = activeCharacter.inventory || [];
        const item = inventory.find(i => i.id === itemId);
        
        if (!item || !item.equipSlot) return;
        
        // Use provided slot or item's default slot
        let targetSlot = slot || item.equipSlot;
        
        // Handle slot mapping for different item types
        if (item.equipSlot === 'weapon' && !slot) {
          targetSlot = 'mainHand';
        } else if (item.equipSlot === 'armor' && !slot) {
          targetSlot = 'chest';
        } else if (item.equipSlot === 'accessory' && !slot) {
          targetSlot = 'ring1';
        }
        
        // Validate that the item can be equipped in the target slot
        const isValidSlot = (
          (item.equipSlot === 'weapon' && (targetSlot === 'mainHand' || targetSlot === 'offHand')) ||
          (item.equipSlot === 'armor' && (targetSlot === 'chest' || targetSlot === 'head' || targetSlot === 'hands' || targetSlot === 'legs' || targetSlot === 'feet')) ||
          (item.equipSlot === 'accessory' && (targetSlot === 'ring1' || targetSlot === 'ring2' || targetSlot === 'neck')) ||
          item.equipSlot === targetSlot
        );
        
        if (!isValidSlot) return;
        
        // If there's already an item in the slot, unequip it first
        const equipment = activeCharacter.equipment || {};
        if (equipment[targetSlot]) {
          get().unequipItem(targetSlot);
        }
        
        // Update equipment
        const updatedEquipment = { 
          ...equipment,
          [targetSlot]: item 
        };
        
        // Recalculate all stats from base + all equipment
        const baseStats = getBaseStats(activeCharacter);
        const updatedStats = calculateTotalStats(baseStats, updatedEquipment);
        
        set((state: GameState) => ({
          characters: state.characters.map((c: Character) =>
            c.id === activeCharacter.id ? { 
              ...c, 
              equipment: updatedEquipment,
              stats: updatedStats
            } : c
          ),
          activeCharacter: { 
            ...activeCharacter, 
            equipment: updatedEquipment,
            stats: updatedStats
          }
        }));
        
        // Remove item from inventory
        get().removeItem(itemId);
        
        // Calculate stat boosts for notification
        const statBoosts: string[] = [];
        if (item.stats) {
          Object.entries(item.stats).forEach(([stat, value]) => {
            if (value && value > 0) {
              const statName = stat.charAt(0).toUpperCase() + stat.slice(1);
              statBoosts.push(`+${value} ${statName}`);
            }
          });
        }
        if (item.boost) {
          Object.entries(item.boost).forEach(([stat, value]) => {
            if (value && value > 0) {
              const statName = stat.charAt(0).toUpperCase() + stat.slice(1);
              statBoosts.push(`+${value} ${statName}`);
            }
          });
        }
        
        // Add notification with stat boosts
        const boostText = statBoosts.length > 0 ? ` (${statBoosts.join(', ')})` : '';
        get().addNotification(`${item.name} equipped successfully!${boostText}`, 'success');
      },
      
      unequipItem: (slot: string) => {
        const { activeCharacter, isAuthenticated } = get();
        if (!activeCharacter || !isAuthenticated) return;
        
        const equipment = activeCharacter.equipment || {};
        const item = equipment[slot];
        const updatedEquipment = { ...equipment };
        delete updatedEquipment[slot];
        
        // Recalculate all stats from base + remaining equipment
        const baseStats = getBaseStats(activeCharacter);
        const updatedStats = calculateTotalStats(baseStats, updatedEquipment);
        
        set((state: GameState) => ({
          characters: state.characters.map((c: Character) =>
            c.id === activeCharacter.id ? { 
              ...c, 
              equipment: updatedEquipment,
              stats: updatedStats
            } : c
          ),
          activeCharacter: { 
            ...activeCharacter, 
            equipment: updatedEquipment,
            stats: updatedStats
          }
        }));
        
        // Add item back to inventory if it exists
        if (item) {
          get().addItem(item);
        }
      },
      
      useItem: (itemId: string) => {
        const { activeCharacter, isAuthenticated } = get();
        if (!activeCharacter || !isAuthenticated) return false;
        
        // Ensure inventory exists
        const inventory = activeCharacter.inventory || [];
        const item = inventory.find(i => i.id === itemId);
        
        if (!item || item.type !== 'potion') return false;
        
        // Apply potion effects
        if (item.effects) {
          item.effects.forEach(effect => {
            if (effect.type === 'heal') {
              const newHealth = Math.min(
                activeCharacter.health.max,
                activeCharacter.health.current + effect.value
              );
              get().updateCharacterHealth(activeCharacter.id, newHealth);
            } else if (effect.type === 'revive') {
              // Revive potions can only be used when character is fainted
              if (activeCharacter.health.current <= 0) {
                get().updateCharacterHealth(activeCharacter.id, effect.value);
              }
            }
            // Handle other effect types as needed
          });
        }
        
        // Remove the item
        get().removeItem(itemId);
        return true;
      },
      
      // Shop Functions
      buyItem: (itemId: string) => {
        const { isAuthenticated } = get();
        if (!isAuthenticated) {
          get().addNotification('Please log in to purchase items', 'error');
          return false;
        }
        
        const shopItem = get().shopItems.find((item: ShopItem) => item.id === itemId);
        if (!shopItem || shopItem.stock <= 0) {
          get().addNotification('Item out of stock!', 'error');
          return false;
        }
        
        if (get().spendGold(shopItem.price)) {
          get().addItem(shopItem.item);
          get().addNotification(`Purchased ${shopItem.item.name} for ${shopItem.price} gold!`, 'success');
          
          // Decrease stock
          set((state: GameState) => ({
            shopItems: state.shopItems.map((item: ShopItem) =>
              item.id === itemId ? { ...item, stock: item.stock - 1 } : item
            )
          }));
          
          return true;
        }
        get().addNotification('Not enough gold!', 'error');
        return false;
      },
      
      purchaseItem: (itemId: string, quantity: number = 1) => {
        const { isAuthenticated } = get();
        if (!isAuthenticated) {
          get().addNotification('Please log in to purchase items', 'error');
          return false;
        }
        
        const shopItem = get().shopItems.find((item: ShopItem) => item.id === itemId);
        if (!shopItem || shopItem.stock < quantity) {
          get().addNotification('Not enough stock available!', 'error');
          return false;
        }
        
        const totalCost = shopItem.price * quantity;
        if (get().spendGold(totalCost)) {
          // Add items to inventory
          for (let i = 0; i < quantity; i++) {
            get().addItem({ ...shopItem.item, id: `${shopItem.item.id}_${Date.now()}_${i}` });
          }
          
          get().addNotification(`Purchased ${quantity}x ${shopItem.item.name} for ${totalCost} gold!`, 'success');
          
          // Decrease stock
          set((state: GameState) => ({
            shopItems: state.shopItems.map((item: ShopItem) =>
              item.id === itemId ? { ...item, stock: item.stock - quantity } : item
            )
          }));
          
          return true;
        }
        get().addNotification('Not enough gold!', 'error');
        return false;
      },
      
      sellItem: (itemId: string) => {
        const { activeCharacter, isAuthenticated } = get();
        if (!activeCharacter || !isAuthenticated) return false;
        
        // Ensure inventory exists
        const inventory = activeCharacter.inventory || [];
        const item = inventory.find((i: Item) => i.id === itemId);
        
        if (!item) return false;
        
        const sellPrice = Math.floor(item.value * 0.5); // Sell for 50% of value
        get().addGold(sellPrice);
        get().removeItem(itemId);
        get().addNotification(`Sold ${item.name} for ${sellPrice} gold!`, 'success');
        
        return true;
      },
      
      // Combat Functions
      getAvailableEnemies: () => {
        const character = get().activeCharacter;
        if (!character) return [];
        
        // Get all enemies from the fragmented system
        const allEnemies = getAllEnemies();
        
        // Filter enemies based on character level (show enemies within reasonable range)
        const availableEnemies = allEnemies.filter((enemy: Enemy) => 
          enemy.requiredLevel <= character.level + 5 // Allow challenging enemies
        );
        
        return availableEnemies.sort((a: Enemy, b: Enemy) => a.requiredLevel - b.requiredLevel);
      },
      
      // Helper functions for stat calculation
      getBaseStats: getBaseStats,
      calculateTotalStats: calculateTotalStats,
      
      startEnemyAttack: () => {
        const { activeCharacter, selectedOpponent, updateCharacterHealth, isAuthenticated } = get();
        if (!activeCharacter || !selectedOpponent || !isAuthenticated) return;
        
        // Enhanced AI: Calculate damage based on enemy stats with strategic variation
        const baseDamage = Math.floor(selectedOpponent.attack * 0.8 + Math.random() * selectedOpponent.attack * 0.4);
        // Consider player defense for more dynamic combat
        const defenseFactor = activeCharacter.equipment && activeCharacter.equipment.armor 
          ? (activeCharacter.equipment.armor.stats?.defense || 0) / 100 
          : 0;
        const finalDamage = Math.max(1, Math.floor(baseDamage * (1 - defenseFactor)));
        const newHealth = Math.max(0, activeCharacter.health.current - finalDamage);
        
        updateCharacterHealth(activeCharacter.id, newHealth);
        
        // Log the attack for combat feedback
        set((state: GameState) => ({
          chatLobbies: state.chatLobbies.map((lobby: ChatLobby) => 
            lobby.id === 'combat-log'
              ? { 
                  ...lobby, 
                  messages: [
                    ...(lobby.messages || []),
                    {
                      id: Date.now().toString(),
                      sender: 'System',
                      content: `Enemy ${selectedOpponent.name} attacks you for ${finalDamage} damage!`,
                      timestamp: Date.now(),
                      reactions: []
                    }
                  ]
                }
              : lobby
          )
        }));
      },
      
      handleDefeat: () => {
        const { activeCharacter, isAuthenticated } = get();
        if (!activeCharacter || !isAuthenticated) return;
        
        // Set health to 0 (fainted state)
        get().updateCharacterHealth(activeCharacter.id, 0);
        
        // Apply defeat penalties if needed
        // For example, lose some gold
        const goldLoss = Math.floor(activeCharacter.gold * 0.1); // Lose 10% of gold
        if (goldLoss > 0) {
          set((state: GameState) => ({
            characters: state.characters.map((c: Character) =>
              c.id === activeCharacter.id ? { ...c, gold: c.gold - goldLoss } : c
            ),
            activeCharacter: { ...activeCharacter, gold: activeCharacter.gold - goldLoss }
          }));
        }
      },
      
      // Familiar Functions
      canSummonFamiliar: (type: FamiliarType) => {
        const { activeCharacter, diamonds, isAuthenticated } = get();
        
        if (!isAuthenticated) {
          return { canSummon: false, reason: 'Please log in', cost: familiarCosts[type] };
        }
        
        if (!activeCharacter) {
          return { canSummon: false, reason: 'No active character', cost: familiarCosts[type] };
        }
        
        if (activeCharacter.familiar) {
          return { canSummon: false, reason: 'Already have a familiar', cost: familiarCosts[type] };
        }
        
        const requiredLevel = familiarLevelRequirements[type];
        if (activeCharacter.level < requiredLevel) {
          return { 
            canSummon: false, 
            reason: `Requires level ${requiredLevel}`, 
            cost: familiarCosts[type] 
          };
        }
        
        const cost = familiarCosts[type];
        if (diamonds < cost) {
          return { 
            canSummon: false, 
            reason: `Need ${cost} diamonds (have ${diamonds})`, 
            cost 
          };
        }
        
        return { canSummon: true, reason: '', cost };
      },
      
      summonFamiliar: (type: FamiliarType, name: string) => {
        const { canSummon, cost } = get().canSummonFamiliar(type);
        if (!canSummon) return false;
        
        const { activeCharacter, isAuthenticated } = get();
        if (!activeCharacter || !isAuthenticated) return false;
        
        // Spend diamonds
        set((state: GameState) => ({
          diamonds: state.diamonds - cost
        }));
        
        // Add familiar to character
        const familiar = {
          type,
          name,
          level: 1,
          loyalty: 50,
          health: {
            current: 30,
            max: 30
          },
          mana: {
            current: 20,
            max: 20
          },
          stats: {
            strength: 8,
            dexterity: 10,
            constitution: 8,
            intelligence: 10,
            wisdom: 8,
            charisma: 6
          }
        };
        
        set((state: GameState) => ({
          characters: state.characters.map((c: Character) =>
            c.id === activeCharacter.id ? { ...c, familiar } : c
          ),
          activeCharacter: { ...activeCharacter, familiar }
        }));
        
        return true;
      },
      
      dismissFamiliar: () => {
        const { activeCharacter, isAuthenticated } = get();
        if (!activeCharacter || !activeCharacter.familiar || !isAuthenticated) return;
        
        set((state: GameState) => ({
          characters: state.characters.map((c: Character) =>
            c.id === activeCharacter.id ? { ...c, familiar: undefined } : c
          ),
          activeCharacter: { ...activeCharacter, familiar: undefined }
        }));
      },
      
      // Party Functions
      createParty: (name: string) => {
        const { activeCharacter, isAuthenticated } = get();
        if (!activeCharacter || !isAuthenticated) return;
        
        const newParty: Party = {
          id: Date.now().toString(),
          name,
          leaderId: activeCharacter.id,
          members: [{
            id: activeCharacter.id,
            name: activeCharacter.name,
            level: activeCharacter.level,
            class: activeCharacter.class,
            isOnline: true
          }],
          maxMembers: 4,
          createdAt: Date.now()
        };
        
        set({ activeParty: newParty });
      },
      
      leaveParty: () => {
        set({ activeParty: null });
      },
      
      inviteToParty: (playerName: string) => {
        // Mock implementation - in a real app, this would send an invitation
        return true;
      },
      
      kickFromParty: (playerId: string) => {
        const { activeParty, activeCharacter, isAuthenticated } = get();
        if (!activeParty || !activeCharacter || activeParty.leaderId !== activeCharacter.id || !isAuthenticated) return;
        
        set((state: GameState) => ({
          activeParty: {
            ...activeParty,
            members: activeParty.members.filter(member => member.id !== playerId)
          }
        }));
      },
      
      // Friend Functions
      addFriend: (playerName: string) => {
        const { isAuthenticated } = get();
        if (!isAuthenticated) {
          get().addNotification('Please log in to add friends', 'error');
          return false;
        }
        
        // Mock implementation - in a real app, this would send a friend request
        const newFriend: Friend = {
          id: Date.now().toString(),
          name: playerName,
          level: Math.floor(Math.random() * 20) + 1,
          race: 'Human',
          class: 'Warrior',
          lastSeen: Date.now()
        };
        
        set((state: GameState) => ({
          friendsList: [...state.friendsList, newFriend],
          onlineFriends: [...state.onlineFriends, newFriend.id]
        }));
        
        return true;
      },
      
      removeFriend: (friendId: string) => {
        const { isAuthenticated } = get();
        if (!isAuthenticated) return;
        
        set((state: GameState) => ({
          friendsList: state.friendsList.filter(friend => friend.id !== friendId),
          onlineFriends: state.onlineFriends.filter(id => id !== friendId)
        }));
      },
      
      sendQuickMessage: (friendId: string, message: string) => {
        // Mock implementation - in a real app, this would send a message to the friend
      },
      
      // Guild Functions
      createGuild: (name: string, description: string, tag: string) => {
        const { activeCharacter, isAuthenticated } = get();
        if (!activeCharacter || !isAuthenticated) return;
        
        const newGuild: Guild = {
          id: Date.now().toString(),
          name,
          clanTag: tag,
          description,
          members: [{
            id: activeCharacter.id,
            rank: 'Leader',
            joinedAt: Date.now()
          }],
          createdAt: Date.now(),
          level: 1
        };
        
        set((state: GameState) => ({
          guilds: [...state.guilds, newGuild],
          characters: state.characters.map((c: Character) =>
            c.id === activeCharacter.id ? { ...c, guildId: newGuild.id } : c
          ),
          activeCharacter: { ...activeCharacter, guildId: newGuild.id }
        }));
        
        // Auto-create and join guild chat
        get().createGuildChat(newGuild);
      },
      
      joinGuild: (guildId: string) => {
        const { activeCharacter, guilds, isAuthenticated } = get();
        if (!activeCharacter || !isAuthenticated) return;
        
        const guild = guilds.find(g => g.id === guildId);
        if (!guild) return;
        
        set((state: GameState) => ({
          guilds: state.guilds.map(g => 
            g.id === guildId 
              ? { 
                  ...g, 
                  members: [...g.members, {
                    id: activeCharacter.id,
                    rank: 'Member',
                    joinedAt: Date.now()
                  }]
                }
              : g
          ),
          characters: state.characters.map((c: Character) =>
            c.id === activeCharacter.id ? { ...c, guildId } : c
          ),
          activeCharacter: { ...activeCharacter, guildId }
        }));
        
        // Auto-join guild chat
        get().autoJoinGuildChat(guildId);
      },
      
      leaveGuild: () => {
        const { activeCharacter, guilds, isAuthenticated } = get();
        if (!activeCharacter || !activeCharacter.guildId || !isAuthenticated) return;
        
        const guild = guilds.find(g => g.id === activeCharacter.guildId);
        if (!guild) return;
        
        // Leave guild chat
        get().leaveGuildChat(activeCharacter.guildId);
        
        set((state: GameState) => ({
          guilds: state.guilds.map(g => 
            g.id === activeCharacter.guildId 
              ? { 
                  ...g, 
                  members: g.members.filter(m => m.id !== activeCharacter.id)
                }
              : g
          ),
          characters: state.characters.map((c: Character) =>
            c.id === activeCharacter.id ? { ...c, guildId: undefined } : c
          ),
          activeCharacter: { ...activeCharacter, guildId: undefined }
        }));
      },
      
      // Guild Chat Functions
      createGuildChat: (guild: Guild) => {
        const guildChatLobby: ChatLobby = {
          id: `guild_${guild.id}`,
          name: `[${guild.clanTag}] ${guild.name}`,
          description: `Private chat for ${guild.name} guild members`,
          type: 'guild',
          createdAt: Date.now(),
          members: guild.members.map(m => m.id),
          messages: [],
          isPrivate: true
        };
        
        set((state: GameState) => ({
          chatLobbies: [...state.chatLobbies, guildChatLobby]
        }));
      },
      
      autoJoinGuildChat: (guildId: string) => {
        const { guilds, activeCharacter, chatLobbies, isAuthenticated } = get();
        if (!activeCharacter || !isAuthenticated) return;
        
        const guild = guilds.find(g => g.id === guildId);
        if (!guild) return;
        
        const guildChatId = `guild_${guildId}`;
        const existingGuildChat = chatLobbies.find(lobby => lobby.id === guildChatId);
        
        if (!existingGuildChat) {
          // Create guild chat if it doesn't exist
          get().createGuildChat(guild);
        } else {
          // Add user to existing guild chat if not already a member
          if (!existingGuildChat.members.includes(activeCharacter.id)) {
            set((state: GameState) => ({
              chatLobbies: state.chatLobbies.map(lobby =>
                lobby.id === guildChatId
                  ? { ...lobby, members: [...lobby.members, activeCharacter.id] }
                  : lobby
              )
            }));
          }
        }
      },
      
      leaveGuildChat: (guildId: string) => {
        const { activeCharacter, isAuthenticated } = get();
        if (!activeCharacter || !isAuthenticated) return;
        
        const guildChatId = `guild_${guildId}`;
        
        set((state: GameState) => ({
          chatLobbies: state.chatLobbies.map(lobby =>
            lobby.id === guildChatId
              ? { ...lobby, members: lobby.members.filter(id => id !== activeCharacter.id) }
              : lobby
          )
        }));
      },
      
      // Mail Functions
      sendMail: (recipient: string, subject: string, message: string) => {
        const { activeCharacter, isAuthenticated } = get();
        if (!activeCharacter || !isAuthenticated) return;
        
        const newMail: Mail = {
          id: Date.now().toString(),
          sender: activeCharacter.name,
          recipient,
          subject,
          message,
          timestamp: Date.now(),
          isRead: false,
          isStarred: false
        };
        
        set((state: GameState) => ({
          mailbox: [...state.mailbox, newMail]
        }));
      },
      
      markMailAsRead: (mailId: string) => {
        const { isAuthenticated } = get();
        if (!isAuthenticated) return;
        
        set((state: GameState) => ({
          mailbox: state.mailbox.map(mail =>
            mail.id === mailId ? { ...mail, isRead: true } : mail
          )
        }));
      },
      
      deleteMail: (mailId: string) => {
        const { isAuthenticated } = get();
        if (!isAuthenticated) return;
        
        set((state: GameState) => ({
          mailbox: state.mailbox.filter(mail => mail.id !== mailId)
        }));
      },
      
      toggleMailStar: (mailId: string) => {
        const { isAuthenticated } = get();
        if (!isAuthenticated) return;
        
        set((state: GameState) => ({
          mailbox: state.mailbox.map(mail =>
            mail.id === mailId ? { ...mail, isStarred: !mail.isStarred } : mail
          )
        }));
      },
      
      // Research Functions
      getAvailableResearch: () => {
        const { activeCharacter, completedResearch, researchItems, isAuthenticated } = get();
        if (!activeCharacter || !isAuthenticated) return [];
        
        return researchItems.filter(research => {
          // Check if research is not completed and not active
          if (completedResearch.some(cr => cr.id === research.id) || 
              get().activeResearch.some(ar => ar.id === research.id)) {
            return false;
          }
          // Check level requirement
          if (research.requirements.level > activeCharacter.level) {
            return false;
          }
          // Check prerequisites
          if (research.requirements.prerequisites) {
            return research.requirements.prerequisites.every(prereq => 
              completedResearch.some(cr => cr.id === prereq)
            );
          }
          return true;
        });
      },
      
      startResearch: (researchId: string) => {
        const { researchItems, activeCharacter, activeResearch, isAuthenticated } = get();
        
        if (!isAuthenticated) {
          get().addNotification('Please log in to start research', 'error');
          return false;
        }
        
        const research = researchItems.find(r => r.id === researchId);
        
        if (!research || !activeCharacter) {
          console.error("Invalid research ID or no active character");
          return false;
        }
        
        // Check if already researching this
        if (activeResearch.some(r => r.id === researchId)) {
          console.error("Already researching this topic");
          return false;
        }
        
        // Check if already completed
        if (get().completedResearch.some(r => r.id === researchId)) {
          console.error("Research already completed");
          return false;
        }
        
        // Check if requirements are met
        if (research.requirements.level > activeCharacter.level) {
          console.error(`Character level too low. Need level ${research.requirements.level}`);
          return false;
        }
        
        if (research.requirements.prerequisites && 
            !research.requirements.prerequisites.every(prereq => 
              get().completedResearch.some(cr => cr.id === prereq)
            )) {
          console.error("Prerequisites not met");
          return false;
        }
        
        const now = Date.now();
        const activeResearchItem = {
          ...research,
          startedAt: now,
          completedAt: now + research.duration
        };
        
        set((state: GameState) => ({
          activeResearch: [...state.activeResearch, activeResearchItem]
        }));
        
        return true;
      },
      
      completeResearch: (researchId: string) => {
        const { activeResearch, activeCharacter, isAuthenticated } = get();
        
        if (!isAuthenticated) {
          console.error("Not authenticated");
          return false;
        }
        
        const research = activeResearch.find(r => r.id === researchId);
        
        if (!research || !activeCharacter) {
          console.error("Invalid research ID or no active character");
          return false;
        }
        
        // Process rewards
        const rewards = research.rewards || {};
        
        // 1. Add experience
        if (rewards.experience) {
          get().gainExperience(rewards.experience);
        }
        
        // 2. Apply stat boosts
        if (rewards.statBoosts) {
          const updatedStats = { ...activeCharacter.stats };
          let statsChanged = false;
          
          Object.entries(rewards.statBoosts).forEach(([stat, boost]) => {
            if (stat in updatedStats && boost !== undefined) {
              updatedStats[stat as keyof typeof updatedStats] += boost;
              statsChanged = true;
            }
          });
          
          if (statsChanged) {
            set((state: GameState) => ({
              characters: state.characters.map((c: Character) =>
                c.id === activeCharacter.id ? { ...c, stats: updatedStats } : c
              ),
              activeCharacter: { ...activeCharacter, stats: updatedStats }
            }));
          }
        }
        
        // 3. Unlock items and spells
        if (rewards.unlocks && rewards.unlocks.length > 0) {
          const unlockedSpells = [...(activeCharacter.unlockedSpells || [])];
          const unlockedItems = [...(activeCharacter.unlockedItems || [])];
          
          rewards.unlocks.forEach(unlock => {
            if (unlock.startsWith('spell:')) {
              const spellId = unlock.split(':')[1];
              if (!unlockedSpells.includes(spellId)) {
                unlockedSpells.push(spellId);
              }
            } else if (unlock.startsWith('item:')) {
              const itemId = unlock.split(':')[1];
              if (!unlockedItems.includes(itemId)) {
                unlockedItems.push(itemId);
              }
              
              // Add the unlocked item to inventory if it's a crafting item
              const craftingItems = ['crafting_kit', 'artisan_tools'];
              if (craftingItems.includes(itemId)) {
                const newItem: Item = {
                  id: `${itemId}_${Date.now()}`,
                  name: itemId === 'crafting_kit' ? 'Basic Crafting Kit' : 'Artisan Tools',
                  description: itemId === 'crafting_kit' 
                    ? 'A basic set of tools for crafting simple items.' 
                    : 'Advanced tools for crafting high-quality items.',
                  type: 'tool',
                  value: itemId === 'crafting_kit' ? 50 : 200,
                  icon: itemId === 'crafting_kit' ? '🔨' : '⚒️'
                };
                get().addItem(newItem);
              }
            }
          });
          
          set((state: GameState) => ({
            characters: state.characters.map((c: Character) =>
              c.id === activeCharacter.id ? { 
                ...c, 
                unlockedSpells, 
                unlockedItems 
              } : c
            ),
            activeCharacter: { 
              ...activeCharacter, 
              unlockedSpells, 
              unlockedItems 
            }
          }));
          
          // Send a mail notification about unlocked items/spells
          if (rewards.unlocks.length > 0) {
            const spellUnlocks = rewards.unlocks.filter(u => u.startsWith('spell:')).map(u => u.split(':')[1]);
            const itemUnlocks = rewards.unlocks.filter(u => u.startsWith('item:')).map(u => u.split(':')[1]);
            
            let mailContent = `Your research on ${research.name} has yielded valuable results!\n\n`;
            
            if (spellUnlocks.length > 0) {
              mailContent += "Spells Unlocked:\n";
              spellUnlocks.forEach(spellId => {
                const spell = spells.find(s => s.id === spellId);
                mailContent += `- ${spell ? spell.name : spellId}\n`;
              });
              mailContent += "\n";
            }
            
            if (itemUnlocks.length > 0) {
              mailContent += "Items Unlocked:\n";
              itemUnlocks.forEach(itemId => {
                mailContent += `- ${itemId === 'crafting_kit' ? 'Basic Crafting Kit' : 'Artisan Tools'}\n`;
              });
            }
            
            const researchMail: Mail = {
              id: Date.now().toString(),
              sender: "Research Assistant",
              recipient: activeCharacter.name,
              subject: `Research Complete: ${research.name}`,
              message: mailContent,
              timestamp: Date.now(),
              isRead: false,
              isStarred: false
            };
            
            set((state: GameState) => ({
              mailbox: [...state.mailbox, researchMail]
            }));
          }
        }
        
        // 4. Move research from active to completed
        set((state: GameState) => ({
          activeResearch: state.activeResearch.filter(r => r.id !== researchId),
          completedResearch: [...state.completedResearch, research]
        }));
        
        return true;
      },
      
      skipResearchWithDiamonds: (researchId: string) => {
        const { isAuthenticated } = get();
        if (!isAuthenticated) return false;
        
        const research = get().activeResearch.find(r => r.id === researchId);
        if (!research) return false;
        
        const timeRemaining = research.completedAt! - Date.now();
        const minutesRemaining = Math.ceil(timeRemaining / (1000 * 60));
       const diamondCost = Math.max(1, Math.floor(minutesRemaining / 5));
        
        if (get().diamonds < diamondCost) {
          return false;
        }
        
        set((state: GameState) => ({
          diamonds: state.diamonds - diamondCost
        }));
        
        get().completeResearch(researchId);
        return true;
      },
      
      // PVP Functions
      joinPvpQueue: () => {
        const { activeCharacter, isAuthenticated } = get();
        if (!activeCharacter || !isAuthenticated) {
          get().addNotification('Please log in and select a character to join PVP', 'error');
          return false;
        }
        
        set((state: GameState) => ({
          pvpQueue: [...state.pvpQueue, {
            playerId: activeCharacter.id,
            playerName: activeCharacter.name,
            level: activeCharacter.level,
            ranking: state.pvpRanking,
            queueTime: Date.now()
          }]
        }));
        
        get().addNotification('Joined PVP queue! Searching for opponent...', 'info');
        
        // Auto-match with best available opponent after a short delay
        setTimeout(() => {
          const currentState = get();
          const playerInQueue = currentState.pvpQueue.find(p => p.playerId === activeCharacter.id);
          
          if (playerInQueue && currentState.pvpQueue.length > 1) {
            // Find best match based on ranking and level (no level restrictions)
            const otherPlayers = currentState.pvpQueue.filter(p => p.playerId !== activeCharacter.id);
            
            if (otherPlayers.length > 0) {
              // Sort by ranking difference (closest ranking first)
              const bestMatch = otherPlayers.sort((a, b) => {
                const rankDiffA = Math.abs(a.ranking - currentState.pvpRanking);
                const rankDiffB = Math.abs(b.ranking - currentState.pvpRanking);
                return rankDiffA - rankDiffB;
              })[0];
              
              get().startPvpMatch(bestMatch.playerId);
            }
          }
        }, 2000); // 2 second delay for matchmaking
        
        return true;
      },
      
      leavePvpQueue: () => {
        const { activeCharacter, isAuthenticated } = get();
        if (!activeCharacter || !isAuthenticated) return;
        
        set((state: GameState) => ({
          pvpQueue: state.pvpQueue.filter(p => p.playerId !== activeCharacter.id)
        }));
        
        get().addNotification('Left PVP queue', 'info');
      },
      
      startPvpMatch: (opponentId: string) => {
        const { activeCharacter, pvpQueue, isAuthenticated } = get();
        if (!activeCharacter || !isAuthenticated) return false;
        
        const opponent = pvpQueue.find(p => p.playerId === opponentId);
        if (!opponent) return false;
        
        const match = {
          id: Date.now().toString(),
          player1: {
            id: activeCharacter.id,
            name: activeCharacter.name,
            level: activeCharacter.level,
            health: activeCharacter.health.current,
            maxHealth: activeCharacter.health.max
          },
          player2: opponent,
          startTime: Date.now(),
          currentTurn: activeCharacter.id,
          status: 'active' as const
        };
        
        set((state: GameState) => ({
          activePvpMatch: match,
          pvpQueue: state.pvpQueue.filter(p => p.playerId !== activeCharacter.id && p.playerId !== opponentId)
        }));
        
        get().addNotification(`PVP match started against ${opponent.playerName}!`, 'success');
        return true;
      },
      
      endPvpMatch: (winnerId: string) => {
        const { activePvpMatch, activeCharacter, isAuthenticated } = get();
        if (!activePvpMatch || !activeCharacter || !isAuthenticated) return;
        
        const isWinner = winnerId === activeCharacter.id;
        const rankingChange = isWinner ? 25 : -15;
        
        // PVP rewards are significantly more generous than NPC battles
        if (isWinner) {
          const pvpXpReward = 300 + (activeCharacter.level * 15); // Very generous XP (3x NPC base)
          const pvpGoldReward = 200 + (activeCharacter.level * 20); // Very generous gold (4x NPC base)
          const pvpDiamondReward = 8 + Math.floor(activeCharacter.level / 5); // Scaling diamond rewards
          
          get().gainExperience(pvpXpReward);
          get().gainGold(pvpGoldReward);
          get().gainDiamonds(pvpDiamondReward);
          
          get().addNotification(`PVP Victory! +${pvpXpReward} XP, +${pvpGoldReward} gold, +${pvpDiamondReward} diamonds, +25 ranking`, 'success');
        } else {
          // Small consolation prize for losing
          const consolationXp = 50 + (activeCharacter.level * 2);
          const consolationGold = 25 + (activeCharacter.level * 3);
          
          get().gainExperience(consolationXp);
          get().gainGold(consolationGold);
          
          get().addNotification(`PVP Defeat! +${consolationXp} XP, +${consolationGold} gold, -15 ranking`, 'error');
        }
        
        set((state: GameState) => ({
          activePvpMatch: null,
          pvpRanking: Math.max(0, state.pvpRanking + rankingChange)
        }));
      },
      
      // Chat Functions
      setActiveChannel: (channelId: string) => {
        const { isAuthenticated } = get();
        if (!isAuthenticated) return;
        
        set({ activeChannel: channelId });
      },
      
      addChatMessage: (message: ChatMessage) => {
        const { activeChannel, isAuthenticated } = get();
        if (!isAuthenticated) return;
        
        set((state: GameState) => ({
          chatLobbies: state.chatLobbies.map((lobby: ChatLobby) => 
            lobby.id === activeChannel
              ? { ...lobby, messages: [...lobby.messages, message] }
              : lobby
          )
        }));
      },
      
      createChatLobby: (name: string, description: string, isPrivate: boolean) => {
        const character = get().activeCharacter;
        const { isAuthenticated } = get();
        
        if (!character || !isAuthenticated) return;
        
        const newLobby: ChatLobby = {
          id: Date.now().toString(),
          name,
          description,
          type: 'user',
          createdBy: character.id,
          createdAt: Date.now(),
          members: [character.id],
          messages: [],
          isPrivate
        };
        
        set((state: GameState) => ({
          chatLobbies: [...state.chatLobbies, newLobby],
          activeChannel: newLobby.id
        }));
      },
      
      joinChatLobby: (lobbyId: string) => {
        const character = get().activeCharacter;
        const { isAuthenticated } = get();
        
        if (!character || !isAuthenticated) return;
        
        set((state: GameState) => ({
          chatLobbies: state.chatLobbies.map((lobby: ChatLobby) =>
            lobby.id === lobbyId
              ? { ...lobby, members: [...lobby.members, character.id] }
              : lobby
          ),
          activeChannel: lobbyId
        }));
      },
      
      leaveChatLobby: (lobbyId: string) => {
        const character = get().activeCharacter;
        const { isAuthenticated } = get();
        
        if (!character || !isAuthenticated) return;
        
        set((state: GameState) => ({
          chatLobbies: state.chatLobbies.map((lobby: ChatLobby) =>
            lobby.id === lobbyId
              ? { ...lobby, members: lobby.members.filter((id: string) => id !== character.id) }
              : lobby
          ),
          activeChannel: 'general'
        }));
      },
      
      cleanupEmptyLobbies: () => {
        set((state: GameState) => ({
          chatLobbies: state.chatLobbies.filter((lobby: ChatLobby) => 
            lobby.type === 'default' || lobby.members.length > 0
          )
        }));
      },
      
      addReactionToMessage: (messageId: string, emoji: string) => {
        const character = get().activeCharacter;
        const { isAuthenticated } = get();
        
        if (!character || !isAuthenticated) return;
        
        set((state: GameState) => ({
          chatLobbies: state.chatLobbies.map((lobby: ChatLobby) => ({
            ...lobby,
            messages: lobby.messages.map((msg: ChatMessage) => {
              if (msg.id === messageId) {
                const reactions = msg.reactions || [];
                const reaction = reactions.find((r) => r.emoji === emoji);
                if (reaction) {
                  if (reaction.users.includes(character.id)) {
                    return {
                      ...msg,
                      reactions: reactions.map((r) =>
                        r.emoji === emoji
                          ? {
                              ...r,
                              count: r.count - 1,
                              users: r.users.filter((id: string) => id !== character.id)
                            }
                          : r
                      ).filter((r) => r.count > 0)
                    };
                  }
                  return {
                    ...msg,
                    reactions: reactions.map((r) =>
                      r.emoji === emoji
                        ? {
                            ...r,
                            count: r.count + 1,
                            users: [...r.users, character.id]
                          }
                        : r
                    )
                  };
                }
                return {
                  ...msg,
                  reactions: [
                    ...reactions,
                    { emoji, count: 1, users: [character.id] }
                  ]
                };
              }
              return msg;
            })
          }))
        }));
      },
      
      kickFromChat: (userId: string, lobbyId: string) => {
        // Implementation for kicking a user from a chat lobby
      },
      
      banUser: (userId: string, reason: string) => {
        // Implementation for banning a user
      },
      
      // Chat Pop-out Functions
      setChatPopout: (isPopout: boolean) => {
        set({ chatPopout: isPopout });
      },

      // Real-time Chat Functions
      connectToChat: (userId: string, userName: string) => {
        const { isAuthenticated } = get();
        if (!isAuthenticated) return;
        
        // Add user to online users list
        set((state: GameState) => ({
          onlineUsers: [
            ...state.onlineUsers.filter(user => user.id !== userId),
            {
              id: userId,
              name: userName,
              isOnline: true,
              channelId: state.activeChannel,
              lastSeen: Date.now()
            }
          ]
        }));
      },

      disconnectFromChat: (userId: string) => {
        // Remove user from online users list
        set((state: GameState) => ({
          onlineUsers: state.onlineUsers.filter(user => user.id !== userId)
        }));
      },

      updateUserPresence: (userId: string, isOnline: boolean, channelId?: string) => {
        set((state: GameState) => ({
          onlineUsers: state.onlineUsers.map(user =>
            user.id === userId
              ? {
                  ...user,
                  isOnline,
                  channelId: channelId || user.channelId,
                  lastSeen: Date.now()
                }
              : user
          )
        }));
      },
      
      addNotification: (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const notification = {
          id: Date.now().toString(),
          message,
          type,
          timestamp: Date.now()
        };
        set((state: GameState) => ({
          notifications: [...state.notifications, notification]
        }));
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
          set((state: GameState) => ({
            notifications: state.notifications.filter(n => n.id !== notification.id)
          }));
        }, 3000);
      },
      
      removeNotification: (id: string) => {
        set((state: GameState) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }));
      },
      
      // Admin Functions
      logout: () => {
        set({
          isAuthenticated: false,
          username: '',
          characters: [],
          activeCharacter: null,
          userRole: 'player',
          activeChannel: 'general',
          activeParty: null,
          diamonds: 100,
          mailbox: [],
          chatPopout: false,
          selectedOpponent: null,
          pvpQueue: [],
          activePvpMatch: null,
          pvpRanking: 1000,
          onlineUsers: [],
          guildBattles: [],
          activeGuildBattle: null
        });
      }
    }),
    {
      name: 'echoes-of-elders-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Authentication
        isAuthenticated: state.isAuthenticated,
        username: state.username,
        
        // Complete Character Management
        characters: state.characters,
        
        // Currency
        diamonds: state.diamonds,
        
        // Guild Data
        guilds: state.guilds,
        
        // Research progress
        completedResearch: state.completedResearch,
        activeResearch: state.activeResearch,
        
        // PVP State
        pvpRanking: state.pvpRanking,
        
        // Mail System
        mailbox: state.mailbox
      }),
      
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Failed to rehydrate storage:', error);
        } else if (state) {
          console.log('Storage rehydrated successfully');
          
          // Initialize non-persisted state
          state.territories = initialTerritories;
          state.researchItems = initialResearch;
          state.shopItems = shopItems.map((item: ShopItem) => ({ ...item, stock: item.stock || 10 }));
          state.chatLobbies = [
            {
              id: 'general',
              name: 'General',
              description: 'Main chat room for all players',
              type: 'default',
              createdAt: Date.now(),
              members: [],
              messages: [],
              isPrivate: false
            },
            {
              id: 'help',
              name: 'Help',
              description: 'Get help from other players',
              type: 'default',
              createdAt: Date.now(),
              members: [],
              messages: [],
              isPrivate: false
            },
            {
              id: 'trading',
              name: 'Trading',
              description: 'Buy and sell items with other players',
              type: 'default',
              createdAt: Date.now(),
              members: [],
              messages: [],
              isPrivate: false
            },
            {
              id: 'guild-recruitment',
              name: 'Guild Recruitment',
              description: 'Find or advertise guilds',
              type: 'default',
              createdAt: Date.now(),
              members: [],
              messages: [],
              isPrivate: false
            }
          ];
          state.activeChannel = 'general';
          state.chatPopout = false;
          state.onlineUsers = [];
          state.availableEnemies = [];
          state.selectedOpponent = null;
          state.pvpQueue = [];
          state.activePvpMatch = null;
          state.guildBattles = [];
          state.activeGuildBattle = null;
          state.notifications = [];
          state.activeParty = null;
          state.friendsList = [];
          state.onlineFriends = [];
          state.userRole = 'player';
          
          // Set active character to first character if available
          if (state.characters && state.characters.length > 0) {
            const firstCharacter = state.characters[0];
            state.activeCharacter = {
              ...firstCharacter,
              inventory: firstCharacter.inventory || [],
              equipment: firstCharacter.equipment || {},
              buffs: firstCharacter.buffs || [],
              debuffs: firstCharacter.debuffs || [],
              unlockedSpells: firstCharacter.unlockedSpells || [],
              unlockedItems: firstCharacter.unlockedItems || [],
              currentHealth: firstCharacter.currentHealth || firstCharacter.health?.current || firstCharacter.maxHealth || 50,
              maxHealth: firstCharacter.maxHealth || firstCharacter.health?.max || 50,
              armorClass: firstCharacter.armorClass || 10,
              damageDie: firstCharacter.damageDie || 4
            };
          } else {
            state.activeCharacter = null;
          }
        }
      }
    }
  )
);