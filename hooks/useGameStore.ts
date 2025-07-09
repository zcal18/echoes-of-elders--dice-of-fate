import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Character, 
  Item, 
  Enemy, 
  ChatMessage, 
  ChatLobby, 
  OnlineUser, 
  Guild, 
  Party, 
  Friend, 
  Territory,
  GuildBattle,
  Research,
  GuildRole,
  Familiar
} from '@/types/game';
import { startingItems } from '@/constants/items';
import { familiarTypes } from '@/constants/gameData';

interface GameState {
  // Authentication
  isAuthenticated: boolean;
  username: string;
  userRole: 'player' | 'admin';
  
  // Characters
  characters: Character[];
  activeCharacter: Character | null;
  
  // Game resources
  diamonds: number;
  
  // Chat system
  activeChannel: string;
  chatLobbies: ChatLobby[];
  chatPopout: boolean;
  onlineUsers: OnlineUser[];
  
  // Social features
  guilds: Guild[];
  activeParty: Party | null;
  friendsList: Friend[];
  onlineFriends: string[];
  
  // Kingdom system
  territories: Territory[];
  guildBattles: GuildBattle[];
  activeGuildBattle: GuildBattle | null;
  royalSpireUnlocked: boolean;
  
  // Research system
  activeResearch: Research[];
  completedResearch: Research[];
  
  // Notifications
  notifications: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    timestamp: number;
  }>;
  
  // Actions
  login: (username: string, password: string) => boolean;
  logout: () => void;
  register: (username: string, email: string, password: string) => boolean;
  
  // Character management
  createCharacter: (character: Omit<Character, 'id'>) => void;
  setActiveCharacter: (characterId: string) => void;
  updateCharacter: (characterId: string, updates: Partial<Character>) => void;
  deleteCharacter: (characterId: string) => void;
  gainExperience: (amount: number) => void;
  gainGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  updateCharacterHealth: (characterId: string, newHealth: number) => void;
  
  // Inventory management
  addItemToInventory: (item: Item) => void;
  removeItemFromInventory: (itemId: string) => void;
  equipItem: (itemId: string, slot: string) => void;
  unequipItem: (slot: string) => void;
  useItem: (itemId: string) => boolean;
  
  // Chat actions
  setActiveChannel: (channelId: string) => void;
  addChatMessage: (message: ChatMessage) => void;
  createChatLobby: (name: string, description: string, isPrivate: boolean) => void;
  joinChatLobby: (lobbyId: string) => void;
  leaveChatLobby: (lobbyId: string) => void;
  cleanupEmptyLobbies: () => void;
  addReactionToMessage: (messageId: string, emoji: string) => void;
  kickFromChat: (userId: string, channelId: string) => void;
  banUser: (userId: string, channelId: string) => void;
  setChatPopout: (popout: boolean) => void;
  connectToChat: (userId: string, userName: string) => void;
  disconnectFromChat: (userId: string) => void;
  updateUserPresence: (userId: string, isOnline: boolean, channelId?: string) => void;
  
  // Guild management
  createGuild: (name: string, description: string, clanTag: string) => void;
  joinGuild: (guildId: string) => void;
  leaveGuild: () => void;
  assignGuildRole: (guildId: string, characterId: string, role: GuildRole) => void;
  removeGuildRole: (guildId: string, characterId: string) => void;
  getGuildRoleInfo: (role: GuildRole) => { emoji: string; buffs: { [key: string]: number }; description: string };
  
  // Party management
  createParty: (name: string) => void;
  leaveParty: () => void;
  
  // Friend management
  addFriend: (playerName: string) => boolean;
  removeFriend: (friendId: string) => void;
  
  // Kingdom management
  claimTerritory: (territoryId: string, guildId: string) => void;
  checkRoyalSpireUnlock: () => void;
  initiateGuildBattle: (territoryId: string, attackingGuildId: string) => void;
  joinGuildBattle: (battleId: string, side: 'attacker' | 'defender') => void;
  startGuildBattle: (battleId: string) => void;
  
  // Research system
  getAvailableResearch: () => Research[];
  startResearch: (researchId: string) => boolean;
  completeResearch: (researchId: string) => boolean;
  skipResearchWithDiamonds: (researchId: string) => boolean;
  
  // Familiar system
  canSummonFamiliar: (type: string) => { canSummon: boolean; reason: string; cost: number };
  summonFamiliar: (type: string, name: string) => boolean;
  dismissFamiliar: () => void;
  
  // Notifications
  addNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

// Initial territories for the kingdom map
const initialTerritories: Territory[] = [
  // Row 1
  { id: 'water_1', name: 'Northern Seas', type: 'water', position: { x: 0, y: 0 }, isClaimable: false, description: 'Vast northern waters', lore: 'Ancient waters that have witnessed countless naval battles', strategicValue: 5, defenseStrength: 0, resources: ['Fish', 'Pearls'] },
  { id: 'forest_1', name: 'Whispering Woods', type: 'forest', position: { x: 1, y: 0 }, isClaimable: true, description: 'Dense mystical forest', lore: 'Trees that whisper secrets of old magic', strategicValue: 8, defenseStrength: 12, resources: ['Timber', 'Herbs'] },
  { id: 'mountain_1', name: 'Ironpeak', type: 'mountain', position: { x: 2, y: 0 }, isClaimable: true, description: 'Towering mountain fortress', lore: 'Ancient dwarven stronghold carved into living rock', strategicValue: 12, defenseStrength: 18, resources: ['Iron', 'Gems'] },
  { id: 'forest_2', name: 'Silverleaf Grove', type: 'forest', position: { x: 3, y: 0 }, isClaimable: true, description: 'Sacred elven grove', lore: 'Where the first elves learned the songs of nature', strategicValue: 9, defenseStrength: 10, resources: ['Silverleaf', 'Moonstone'] },
  { id: 'water_2', name: 'Eastern Bay', type: 'water', position: { x: 4, y: 0 }, isClaimable: false, description: 'Strategic eastern waters', lore: 'Gateway to distant lands across the sea', strategicValue: 6, defenseStrength: 0, resources: ['Fish', 'Salt'] },
  { id: 'desert_1', name: 'Sunscorch Dunes', type: 'desert', position: { x: 5, y: 0 }, isClaimable: true, description: 'Burning desert sands', lore: 'Where the sun god first touched the earth', strategicValue: 7, defenseStrength: 8, resources: ['Sand Glass', 'Spices'] },
  { id: 'castle_1', name: 'Stormwatch Keep', type: 'castle', position: { x: 6, y: 0 }, isClaimable: true, description: 'Ancient border fortress', lore: 'Built to watch for storms both natural and magical', strategicValue: 15, defenseStrength: 25, resources: ['Stone', 'Steel'] },
  { id: 'water_3', name: 'Stormbreak Strait', type: 'water', position: { x: 7, y: 0 }, isClaimable: false, description: 'Treacherous strait', lore: 'Where many ships have met their doom', strategicValue: 4, defenseStrength: 0, resources: ['Salvage', 'Coral'] },

  // Row 2
  { id: 'forest_3', name: 'Thornwall Thicket', type: 'forest', position: { x: 0, y: 1 }, isClaimable: true, description: 'Defensive forest barrier', lore: 'Thorns that grow to protect the realm', strategicValue: 10, defenseStrength: 15, resources: ['Thornwood', 'Berries'] },
  { id: 'castle_2', name: 'Goldenhall', type: 'castle', position: { x: 1, y: 1 }, isClaimable: true, description: 'Wealthy trading post', lore: 'Where merchants from all lands gather', strategicValue: 13, defenseStrength: 20, resources: ['Gold', 'Silk'] },
  { id: 'water_4', name: 'Crystal Lake', type: 'water', position: { x: 2, y: 1 }, isClaimable: false, description: 'Pure mountain lake', lore: 'Waters so clear they reflect the soul', strategicValue: 8, defenseStrength: 0, resources: ['Crystal', 'Pure Water'] },
  { id: 'mountain_2', name: 'Dragonspine Ridge', type: 'mountain', position: { x: 3, y: 1 }, isClaimable: true, description: 'Dragon-haunted peaks', lore: 'Where the last dragon made its lair', strategicValue: 14, defenseStrength: 22, resources: ['Dragon Scales', 'Mithril'] },
  { id: 'forest_4', name: 'Shadowmere', type: 'forest', position: { x: 4, y: 1 }, isClaimable: true, description: 'Dark mysterious woods', lore: 'Forest where shadows have their own will', strategicValue: 11, defenseStrength: 16, resources: ['Shadow Moss', 'Dark Berries'] },
  { id: 'castle_3', name: 'Brightspear Citadel', type: 'castle', position: { x: 5, y: 1 }, isClaimable: true, description: 'Shining fortress of light', lore: 'Blessed by the gods of light and justice', strategicValue: 16, defenseStrength: 28, resources: ['Blessed Steel', 'Holy Water'] },
  { id: 'desert_2', name: 'Mirage Valley', type: 'desert', position: { x: 6, y: 1 }, isClaimable: true, description: 'Valley of illusions', lore: 'Where reality bends and mirages come alive', strategicValue: 9, defenseStrength: 12, resources: ['Mirage Crystals', 'Desert Flowers'] },
  { id: 'mountain_3', name: 'Skyreach Peak', type: 'mountain', position: { x: 7, y: 1 }, isClaimable: true, description: 'Highest mountain peak', lore: 'So tall it touches the realm of the gods', strategicValue: 13, defenseStrength: 20, resources: ['Sky Metal', 'Wind Crystals'] },

  // Row 3
  { id: 'desert_3', name: 'Oasis of Whispers', type: 'desert', position: { x: 0, y: 2 }, isClaimable: true, description: 'Life-giving oasis', lore: 'Where desert spirits share ancient secrets', strategicValue: 12, defenseStrength: 10, resources: ['Life Water', 'Date Palms'] },
  { id: 'water_5', name: 'Serpent River', type: 'water', position: { x: 1, y: 2 }, isClaimable: false, description: 'Winding river passage', lore: 'Named for its serpentine path through the land', strategicValue: 7, defenseStrength: 0, resources: ['River Fish', 'Reed'] },
  { id: 'forest_5', name: 'Eldergrove', type: 'forest', position: { x: 2, y: 2 }, isClaimable: true, description: 'Ancient tree sanctuary', lore: 'Home to the oldest trees in the realm', strategicValue: 15, defenseStrength: 18, resources: ['Elder Wood', 'Ancient Sap'] },
  { id: 'royal_spire', name: 'The Royal Spire', type: 'castle', position: { x: 3, y: 2 }, isClaimable: false, isRoyalSpire: true, description: 'The ultimate seat of power', lore: 'A mystical spire that appears only when one guild controls all territories. From here, the true rulers of the realm can grant royal titles and command the kingdom.', strategicValue: 25, defenseStrength: 50, resources: ['Royal Essence', 'Crown Jewels'] },
  { id: 'castle_4', name: 'Moonrise Tower', type: 'castle', position: { x: 4, y: 2 }, isClaimable: true, description: 'Lunar observatory fortress', lore: 'Where mages study the movements of the moons', strategicValue: 14, defenseStrength: 24, resources: ['Moonstone', 'Star Charts'] },
  { id: 'water_6', name: 'Twilight Marsh', type: 'water', position: { x: 5, y: 2 }, isClaimable: false, description: 'Mystical wetlands', lore: 'Where day and night meet in eternal twilight', strategicValue: 9, defenseStrength: 0, resources: ['Marsh Gas', 'Twilight Flowers'] },
  { id: 'forest_6', name: 'Ironbark Forest', type: 'forest', position: { x: 6, y: 2 }, isClaimable: true, description: 'Forest of metal trees', lore: 'Trees with bark as hard as iron', strategicValue: 11, defenseStrength: 19, resources: ['Iron Bark', 'Metal Sap'] },
  { id: 'mountain_4', name: 'Frostcrown', type: 'mountain', position: { x: 7, y: 2 }, isClaimable: true, description: 'Eternal winter peak', lore: 'Mountain crowned with eternal ice and snow', strategicValue: 12, defenseStrength: 21, resources: ['Eternal Ice', 'Frost Gems'] },

  // Row 4
  { id: 'castle_5', name: 'Shadowgate Keep', type: 'castle', position: { x: 0, y: 3 }, isClaimable: true, description: 'Fortress of shadows', lore: 'Gateway between the realm of light and shadow', strategicValue: 17, defenseStrength: 26, resources: ['Shadow Steel', 'Void Crystals'] },
  { id: 'mountain_5', name: 'Thunderpeak', type: 'mountain', position: { x: 1, y: 3 }, isClaimable: true, description: 'Storm-wreathed mountain', lore: 'Where lightning never ceases to strike', strategicValue: 13, defenseStrength: 17, resources: ['Thunder Stone', 'Lightning Crystals'] },
  { id: 'desert_4', name: 'Bone Desert', type: 'desert', position: { x: 2, y: 3 }, isClaimable: true, description: 'Desert of ancient battles', lore: 'Where the bones of ancient warriors rest', strategicValue: 8, defenseStrength: 9, resources: ['Ancient Bones', 'Battle Relics'] },
  { id: 'water_7', name: 'Bloodmere', type: 'water', position: { x: 3, y: 3 }, isClaimable: false, description: 'Crimson-tinted lake', lore: 'Lake that runs red from iron deposits', strategicValue: 6, defenseStrength: 0, resources: ['Iron Ore', 'Red Algae'] },
  { id: 'forest_7', name: 'Singing Pines', type: 'forest', position: { x: 4, y: 3 }, isClaimable: true, description: 'Musical forest', lore: 'Pine trees that sing in the wind', strategicValue: 10, defenseStrength: 13, resources: ['Singing Wood', 'Pine Resin'] },
  { id: 'castle_6', name: 'Starfall Bastion', type: 'castle', position: { x: 5, y: 3 }, isClaimable: true, description: 'Celestial fortress', lore: 'Built where a star fell from the heavens', strategicValue: 18, defenseStrength: 30, resources: ['Star Metal', 'Celestial Gems'] },
  { id: 'mountain_6', name: 'Grimhold', type: 'mountain', position: { x: 6, y: 3 }, isClaimable: true, description: 'Forbidding mountain fortress', lore: 'Dark mountain that few dare to climb', strategicValue: 11, defenseStrength: 19, resources: ['Dark Stone', 'Shadow Crystals'] },
  { id: 'water_8', name: 'Mistral Bay', type: 'water', position: { x: 7, y: 3 }, isClaimable: false, description: 'Wind-swept bay', lore: 'Where the winds of the world converge', strategicValue: 7, defenseStrength: 0, resources: ['Wind Pearls', 'Storm Glass'] },

  // Row 5
  { id: 'forest_8', name: 'Goldleaf Glade', type: 'forest', position: { x: 0, y: 4 }, isClaimable: true, description: 'Golden autumn forest', lore: 'Forest locked in eternal autumn', strategicValue: 9, defenseStrength: 11, resources: ['Golden Leaves', 'Amber'] },
  { id: 'water_9', name: 'Moonwell', type: 'water', position: { x: 1, y: 4 }, isClaimable: false, description: 'Sacred moonlit pool', lore: 'Pool that reflects only moonlight', strategicValue: 10, defenseStrength: 0, resources: ['Moon Water', 'Silver Fish'] },
  { id: 'castle_7', name: 'Dawnbreak Fortress', type: 'castle', position: { x: 2, y: 4 }, isClaimable: true, description: 'Fortress of the rising sun', lore: 'Where the first light of dawn always shines', strategicValue: 15, defenseStrength: 23, resources: ['Dawn Crystal', 'Solar Steel'] },
  { id: 'mountain_7', name: 'Voidpeak', type: 'mountain', position: { x: 3, y: 4 }, isClaimable: true, description: 'Mountain touching the void', lore: 'Peak that reaches into the space between worlds', strategicValue: 16, defenseStrength: 25, resources: ['Void Stone', 'Null Crystals'] },
  { id: 'desert_5', name: 'Crystal Sands', type: 'desert', position: { x: 4, y: 4 }, isClaimable: true, description: 'Desert of crystal formations', lore: 'Where sand has turned to living crystal', strategicValue: 13, defenseStrength: 14, resources: ['Living Crystal', 'Prism Shards'] },
  { id: 'forest_9', name: 'Wraithwood', type: 'forest', position: { x: 5, y: 4 }, isClaimable: true, description: 'Haunted forest', lore: 'Forest where spirits of the past linger', strategicValue: 8, defenseStrength: 12, resources: ['Spirit Wood', 'Ectoplasm'] },
  { id: 'water_10', name: 'Siren Cove', type: 'water', position: { x: 6, y: 4 }, isClaimable: false, description: 'Enchanted coastal waters', lore: 'Where sirens once sang to sailors', strategicValue: 8, defenseStrength: 0, resources: ['Siren Scales', 'Echo Shells'] },
  { id: 'castle_8', name: 'Nightfall Citadel', type: 'castle', position: { x: 7, y: 4 }, isClaimable: true, description: 'Fortress of eternal night', lore: 'Castle where night never ends', strategicValue: 14, defenseStrength: 22, resources: ['Night Steel', 'Dark Crystals'] },

  // Row 6
  { id: 'mountain_8', name: 'Flameheart', type: 'mountain', position: { x: 0, y: 5 }, isClaimable: true, description: 'Volcanic mountain', lore: 'Mountain with a heart of living flame', strategicValue: 14, defenseStrength: 20, resources: ['Flame Crystals', 'Volcanic Glass'] },
  { id: 'desert_6', name: 'Shifting Sands', type: 'desert', position: { x: 1, y: 5 }, isClaimable: true, description: 'Ever-changing desert', lore: 'Desert that reshapes itself with the wind', strategicValue: 7, defenseStrength: 8, resources: ['Shifting Sand', 'Wind Stones'] },
  { id: 'water_11', name: 'Deepcurrent', type: 'water', position: { x: 2, y: 5 }, isClaimable: false, description: 'Deep underground river', lore: 'River that flows through the depths of the earth', strategicValue: 9, defenseStrength: 0, resources: ['Deep Pearls', 'Cave Fish'] },
  { id: 'forest_10', name: 'Dreamwood', type: 'forest', position: { x: 3, y: 5 }, isClaimable: true, description: 'Forest of sleeping trees', lore: 'Where trees dream and dreams become real', strategicValue: 12, defenseStrength: 15, resources: ['Dream Essence', 'Sleep Moss'] },
  { id: 'castle_9', name: 'Skybridge Keep', type: 'castle', position: { x: 4, y: 5 }, isClaimable: true, description: 'Fortress in the clouds', lore: 'Castle connected to the sky by bridges of light', strategicValue: 19, defenseStrength: 32, resources: ['Cloud Steel', 'Sky Crystals'] },
  { id: 'mountain_9', name: 'Earthshaker', type: 'mountain', position: { x: 5, y: 5 }, isClaimable: true, description: 'Trembling mountain', lore: 'Mountain that shakes the very foundations of the world', strategicValue: 15, defenseStrength: 24, resources: ['Earthquake Stone', 'Tremor Gems'] },
  { id: 'forest_11', name: 'Spiritgrove', type: 'forest', position: { x: 6, y: 5 }, isClaimable: true, description: 'Sacred spirit forest', lore: 'Where the spirits of nature gather', strategicValue: 13, defenseStrength: 17, resources: ['Spirit Bark', 'Nature Essence'] },
  { id: 'water_12', name: 'Tidecaller Bay', type: 'water', position: { x: 7, y: 5 }, isClaimable: false, description: 'Magically controlled tides', lore: 'Bay where mages control the very tides', strategicValue: 11, defenseStrength: 0, resources: ['Tide Crystals', 'Mage Pearls'] },

  // Row 7
  { id: 'water_13', name: 'Southern Depths', type: 'water', position: { x: 0, y: 6 }, isClaimable: false, description: 'Deep southern waters', lore: 'Mysterious depths that few have explored', strategicValue: 6, defenseStrength: 0, resources: ['Deep Treasures', 'Abyssal Pearls'] },
  { id: 'castle_10', name: 'Sunspear Tower', type: 'castle', position: { x: 1, y: 6 }, isClaimable: true, description: 'Solar-powered fortress', lore: 'Tower that harnesses the power of the sun', strategicValue: 16, defenseStrength: 27, resources: ['Solar Crystals', 'Sun Steel'] },
  { id: 'mountain_10', name: 'Stormbreak', type: 'mountain', position: { x: 2, y: 6 }, isClaimable: true, description: 'Storm-splitting peak', lore: 'Mountain so tall it splits storms in two', strategicValue: 12, defenseStrength: 18, resources: ['Storm Crystals', 'Lightning Stone'] },
  { id: 'desert_7', name: 'Glasslands', type: 'desert', position: { x: 3, y: 6 }, isClaimable: true, description: 'Desert of glass', lore: 'Where ancient magic turned sand to glass', strategicValue: 10, defenseStrength: 11, resources: ['Magic Glass', 'Sand Crystals'] },
  { id: 'water_14', name: 'Whirlpool Strait', type: 'water', position: { x: 4, y: 6 }, isClaimable: false, description: 'Dangerous whirlpool', lore: 'Where the sea swallows ships whole', strategicValue: 5, defenseStrength: 0, resources: ['Whirlpool Gems', 'Sunken Treasures'] },
  { id: 'forest_12', name: 'Thornheart', type: 'forest', position: { x: 5, y: 6 }, isClaimable: true, description: 'Forest of thorned trees', lore: 'Where every tree has a heart of thorns', strategicValue: 9, defenseStrength: 14, resources: ['Thorn Hearts', 'Barbed Wood'] },
  { id: 'castle_11', name: 'Voidgate Fortress', type: 'castle', position: { x: 6, y: 6 }, isClaimable: true, description: 'Gateway to the void', lore: 'Fortress that guards the entrance to nothingness', strategicValue: 20, defenseStrength: 35, resources: ['Void Steel', 'Null Essence'] },
  { id: 'mountain_11', name: 'Worldsend', type: 'mountain', position: { x: 7, y: 6 }, isClaimable: true, description: 'The final mountain', lore: 'Mountain at the very edge of the known world', strategicValue: 17, defenseStrength: 28, resources: ['Edge Stone', 'Boundary Crystals'] },

  // Row 8
  { id: 'forest_13', name: 'Mistwood', type: 'forest', position: { x: 0, y: 7 }, isClaimable: true, description: 'Perpetually misty forest', lore: 'Forest shrouded in eternal mist', strategicValue: 8, defenseStrength: 10, resources: ['Mist Essence', 'Fog Berries'] },
  { id: 'water_15', name: 'Forgotten Lake', type: 'water', position: { x: 1, y: 7 }, isClaimable: false, description: 'Lake lost to memory', lore: 'Lake that erases itself from memory', strategicValue: 7, defenseStrength: 0, resources: ['Memory Pearls', 'Forgotten Fish'] },
  { id: 'desert_8', name: 'Starfall Desert', type: 'desert', position: { x: 2, y: 7 }, isClaimable: true, description: 'Desert of fallen stars', lore: 'Where stars come to die', strategicValue: 11, defenseStrength: 13, resources: ['Star Dust', 'Fallen Meteors'] },
  { id: 'castle_12', name: 'Doomspire', type: 'castle', position: { x: 3, y: 7 }, isClaimable: true, description: 'Fortress of final judgment', lore: 'Tower where fate itself is decided', strategicValue: 18, defenseStrength: 31, resources: ['Fate Steel', 'Doom Crystals'] },
  { id: 'mountain_12', name: 'Soulforge', type: 'mountain', position: { x: 4, y: 7 }, isClaimable: true, description: 'Mountain that forges souls', lore: 'Where souls are tempered like steel', strategicValue: 16, defenseStrength: 26, resources: ['Soul Steel', 'Spirit Gems'] },
  { id: 'water_16', name: 'Endless Ocean', type: 'water', position: { x: 5, y: 7 }, isClaimable: false, description: 'Ocean without end', lore: 'Waters that stretch beyond the horizon', strategicValue: 8, defenseStrength: 0, resources: ['Infinite Pearls', 'Horizon Fish'] },
  { id: 'forest_14', name: 'Timeless Grove', type: 'forest', position: { x: 6, y: 7 }, isClaimable: true, description: 'Forest outside of time', lore: 'Where time has no meaning', strategicValue: 14, defenseStrength: 16, resources: ['Timeless Wood', 'Eternal Sap'] },
  { id: 'water_17', name: 'Voidwater', type: 'water', position: { x: 7, y: 7 }, isClaimable: false, description: 'Water from the void', lore: 'Water that exists between existence', strategicValue: 9, defenseStrength: 0, resources: ['Void Water', 'Nothing Pearls'] },
];

// Initial research data
const initialResearch: Research[] = [
  {
    id: 'basic_combat',
    name: 'Basic Combat Techniques',
    description: 'Learn fundamental combat skills and weapon handling',
    category: 'combat',
    duration: 5 * 60 * 1000, // 5 minutes
    requirements: {
      level: 1,
      prerequisites: []
    },
    rewards: {
      experience: 100,
      statBoosts: {
        strength: 2,
        dexterity: 1
      }
    },
    isCompleted: false
  },
  {
    id: 'elemental_magic',
    name: 'Elemental Magic Basics',
    description: 'Study the fundamental principles of elemental magic',
    category: 'magic',
    duration: 7 * 60 * 1000, // 7 minutes
    requirements: {
      level: 2,
      prerequisites: []
    },
    rewards: {
      experience: 150,
      statBoosts: {
        intelligence: 2,
        wisdom: 1
      },
      unlocks: ['spell:fireball', 'spell:ice_shard']
    },
    isCompleted: false
  },
  {
    id: 'basic_crafting',
    name: 'Basic Crafting Skills',
    description: 'Learn essential crafting techniques and tool usage',
    category: 'crafting',
    duration: 6 * 60 * 1000, // 6 minutes
    requirements: {
      level: 1,
      prerequisites: []
    },
    rewards: {
      experience: 120,
      statBoosts: {
        dexterity: 1,
        intelligence: 1
      },
      unlocks: ['item:basic_sword', 'item:leather_armor']
    },
    isCompleted: false
  },
  {
    id: 'advanced_combat',
    name: 'Advanced Combat Strategies',
    description: 'Master complex combat maneuvers and tactical thinking',
    category: 'combat',
    duration: 10 * 60 * 1000, // 10 minutes
    requirements: {
      level: 5,
      prerequisites: ['basic_combat']
    },
    rewards: {
      experience: 250,
      statBoosts: {
        strength: 3,
        dexterity: 2,
        constitution: 1
      }
    },
    isCompleted: false
  },
  {
    id: 'arcane_rituals',
    name: 'Arcane Rituals',
    description: 'Delve into the mysteries of complex magical rituals',
    category: 'magic',
    duration: 12 * 60 * 1000, // 12 minutes
    requirements: {
      level: 6,
      prerequisites: ['elemental_magic']
    },
    rewards: {
      experience: 300,
      statBoosts: {
        intelligence: 3,
        wisdom: 2,
        charisma: 1
      },
      unlocks: ['spell:teleport', 'spell:summon_familiar']
    },
    isCompleted: false
  },
  {
    id: 'advanced_crafting',
    name: 'Advanced Crafting Techniques',
    description: 'Master the art of creating legendary items',
    category: 'crafting',
    duration: 15 * 60 * 1000, // 15 minutes
    requirements: {
      level: 8,
      prerequisites: ['basic_crafting']
    },
    rewards: {
      experience: 400,
      statBoosts: {
        dexterity: 3,
        intelligence: 2,
        wisdom: 1
      },
      unlocks: ['item:enchanted_blade', 'item:mage_robes']
    },
    isCompleted: false
  },
  {
    id: 'defensive_tactics',
    name: 'Defensive Tactics',
    description: 'Learn advanced defensive strategies and shield techniques',
    category: 'combat',
    duration: 8 * 60 * 1000, // 8 minutes
    requirements: {
      level: 4,
      prerequisites: ['basic_combat']
    },
    rewards: {
      experience: 200,
      statBoosts: {
        constitution: 3,
        wisdom: 1
      }
    },
    isCompleted: false
  },
  {
    id: 'healing_arts',
    name: 'Healing Arts',
    description: 'Study the sacred arts of healing and restoration',
    category: 'magic',
    duration: 9 * 60 * 1000, // 9 minutes
    requirements: {
      level: 3,
      prerequisites: []
    },
    rewards: {
      experience: 180,
      statBoosts: {
        wisdom: 2,
        charisma: 1
      },
      unlocks: ['spell:heal', 'spell:cure_poison']
    },
    isCompleted: false
  }
];

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      username: '',
      userRole: 'player',
      characters: [],
      activeCharacter: null,
      diamonds: 50,
      
      // Chat system
      activeChannel: 'kingdom_chat',
      chatLobbies: [
        {
          id: 'kingdom_chat',
          name: 'Kingdom Chat',
          description: 'Kingdom Chat',
          type: 'default',
          isPrivate: false,
          members: [],
          messages: [],
          createdAt: Date.now()
        }
      ],
      chatPopout: false,
      onlineUsers: [],
      
      // Social features
      guilds: [],
      activeParty: null,
      friendsList: [],
      onlineFriends: [],
      
      // Kingdom system
      territories: initialTerritories,
      guildBattles: [],
      activeGuildBattle: null,
      royalSpireUnlocked: false,
      
      // Research system
      activeResearch: [],
      completedResearch: [],
      
      // Notifications
      notifications: [],
      
      // Authentication actions
      login: (username: string, password: string) => {
        // Simple mock authentication
        if (username && password) {
          set({ 
            isAuthenticated: true,
            username: username,
            userRole: username === 'admin' ? 'admin' : 'player'
          });
          
          // Add welcome notification only once
          const state = get();
          const hasWelcomeNotification = state.notifications.some(n => 
            n.message.includes('Welcome back') && 
            Date.now() - n.timestamp < 5000 // Within last 5 seconds
          );
          
          if (!hasWelcomeNotification) {
            get().addNotification(`Welcome back, ${username}!`, 'success');
          }
          
          return true;
        }
        return false;
      },
      
      logout: () => {
        set({ 
          isAuthenticated: false,
          username: '',
          activeCharacter: null,
          userRole: 'player'
        });
      },
      
      register: (username: string, email: string, password: string) => {
        // Simple mock registration
        if (username && email && password) {
          set({ 
            isAuthenticated: true,
            username: username,
            userRole: 'player'
          });
          get().addNotification(`Welcome to Echoes of Elders, ${username}!`, 'success');
          return true;
        }
        return false;
      },
      
      // Character management
      createCharacter: (character) => {
        const newCharacter: Character = {
          ...character,
          id: Date.now().toString(),
          level: 1,
          experience: 0,
          experienceToNextLevel: 100,
          gold: 100,
          health: { current: 100, max: 100 },
          mana: { current: 50, max: 50 },
          stats: {
            strength: 10,
            dexterity: 10,
            constitution: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 10
          },
          inventory: [...startingItems],
          equipment: {},
          buffs: [],
          debuffs: [],
          currentHealth: 100,
          maxHealth: 100,
          armorClass: 10,
          damageDie: 6
        };
        
        set(state => ({
          characters: [...state.characters, newCharacter],
          activeCharacter: newCharacter
        }));
      },
      
      setActiveCharacter: (characterId: string) => {
        const character = get().characters.find(c => c.id === characterId);
        if (character) {
          set({ activeCharacter: character });
        }
      },
      
      updateCharacter: (characterId: string, updates: Partial<Character>) => {
        set(state => ({
          characters: state.characters.map(c => 
            c.id === characterId ? { ...c, ...updates } : c
          ),
          activeCharacter: state.activeCharacter?.id === characterId 
            ? { ...state.activeCharacter, ...updates }
            : state.activeCharacter
        }));
      },
      
      deleteCharacter: (characterId: string) => {
        set(state => ({
          characters: state.characters.filter(c => c.id !== characterId),
          activeCharacter: state.activeCharacter?.id === characterId ? null : state.activeCharacter
        }));
      },
      
      gainExperience: (amount: number) => {
        const state = get();
        if (!state.activeCharacter) return;
        
        let newExp = state.activeCharacter.experience + amount;
        let newLevel = state.activeCharacter.level;
        let expToNext = state.activeCharacter.experienceToNextLevel;
        
        // Level up logic
        while (newExp >= expToNext) {
          newExp -= expToNext;
          newLevel++;
          expToNext = newLevel * 100; // Simple level scaling
          
          // Level up notification
          get().addNotification(`Level up! You are now level ${newLevel}!`, 'success');
          
          // Increase health and mana on level up
          const healthIncrease = 20;
          const manaIncrease = 10;
          
          get().updateCharacter(state.activeCharacter.id, {
            level: newLevel,
            experience: newExp,
            experienceToNextLevel: expToNext,
            health: {
              current: state.activeCharacter.health.current + healthIncrease,
              max: state.activeCharacter.health.max + healthIncrease
            },
            mana: {
              current: state.activeCharacter.mana.current + manaIncrease,
              max: state.activeCharacter.mana.max + manaIncrease
            }
          });
          return;
        }
        
        get().updateCharacter(state.activeCharacter.id, {
          experience: newExp,
          experienceToNextLevel: expToNext
        });
      },
      
      gainGold: (amount: number) => {
        const state = get();
        if (!state.activeCharacter) return;
        
        get().updateCharacter(state.activeCharacter.id, {
          gold: state.activeCharacter.gold + amount
        });
      },
      
      spendGold: (amount: number) => {
        const state = get();
        if (!state.activeCharacter || state.activeCharacter.gold < amount) {
          return false;
        }
        
        get().updateCharacter(state.activeCharacter.id, {
          gold: state.activeCharacter.gold - amount
        });
        return true;
      },
      
      updateCharacterHealth: (characterId: string, newHealth: number) => {
        const state = get();
        const character = state.characters.find(c => c.id === characterId);
        if (!character) return;
        
        const clampedHealth = Math.max(0, Math.min(newHealth, character.health.max));
        
        get().updateCharacter(characterId, {
          health: {
            ...character.health,
            current: clampedHealth
          }
        });
      },
      
      // Inventory management
      addItemToInventory: (item: Item) => {
        const state = get();
        if (!state.activeCharacter) return;
        
        get().updateCharacter(state.activeCharacter.id, {
          inventory: [...(state.activeCharacter.inventory || []), item]
        });
      },
      
      removeItemFromInventory: (itemId: string) => {
        const state = get();
        if (!state.activeCharacter) return;
        
        get().updateCharacter(state.activeCharacter.id, {
          inventory: (state.activeCharacter.inventory || []).filter(item => item.id !== itemId)
        });
      },
      
      equipItem: (itemId: string, slot: string) => {
        const state = get();
        if (!state.activeCharacter) return;
        
        const item = state.activeCharacter.inventory?.find(i => i.id === itemId);
        if (!item) return;
        
        // Remove item from inventory and add to equipment
        const newInventory = (state.activeCharacter.inventory || []).filter(i => i.id !== itemId);
        const newEquipment = { ...state.activeCharacter.equipment, [slot]: item };
        
        get().updateCharacter(state.activeCharacter.id, {
          inventory: newInventory,
          equipment: newEquipment
        });
      },
      
      unequipItem: (slot: string) => {
        const state = get();
        if (!state.activeCharacter) return;
        
        const item = state.activeCharacter.equipment?.[slot];
        if (!item) return;
        
        // Remove item from equipment and add to inventory
        const newEquipment = { ...state.activeCharacter.equipment };
        delete newEquipment[slot];
        const newInventory = [...(state.activeCharacter.inventory || []), item];
        
        get().updateCharacter(state.activeCharacter.id, {
          inventory: newInventory,
          equipment: newEquipment
        });
      },
      
      useItem: (itemId: string) => {
        const state = get();
        if (!state.activeCharacter) return false;
        
        const item = state.activeCharacter.inventory?.find(i => i.id === itemId);
        if (!item || item.type !== 'potion') return false;
        
        // Apply item effects
        let healthChange = 0;
        let manaChange = 0;
        let wasRevived = false;
        
        item.effects?.forEach(effect => {
          if (effect.type === 'heal') {
            healthChange += effect.value;
          } else if (effect.type === 'mana') {
            manaChange += effect.value;
          } else if (effect.type === 'revive') {
            if (state.activeCharacter!.health.current <= 0) {
              healthChange = Math.floor(state.activeCharacter!.health.max * (effect.value / 100));
              wasRevived = true;
            }
          }
        });
        
        // Apply changes
        const newHealth = Math.min(
          state.activeCharacter.health.max,
          Math.max(0, state.activeCharacter.health.current + healthChange)
        );
        const newMana = Math.min(
          state.activeCharacter.mana.max,
          Math.max(0, state.activeCharacter.mana.current + manaChange)
        );
        
        get().updateCharacter(state.activeCharacter.id, {
          health: { ...state.activeCharacter.health, current: newHealth },
          mana: { ...state.activeCharacter.mana, current: newMana }
        });
        
        // Remove item from inventory
        get().removeItemFromInventory(itemId);
        
        // Show notification
        if (wasRevived) {
          get().addNotification('Your character has been revived!', 'success');
        } else if (healthChange > 0) {
          get().addNotification(`Restored ${healthChange} health!`, 'success');
        }
        if (manaChange > 0) {
          get().addNotification(`Restored ${manaChange} mana!`, 'info');
        }
        
        return true;
      },
      
      // Chat actions
      setActiveChannel: (channelId: string) => {
        set({ activeChannel: channelId });
      },
      
      addChatMessage: (message: ChatMessage) => {
        set(state => ({
          chatLobbies: state.chatLobbies.map(lobby =>
            lobby.id === state.activeChannel
              ? { ...lobby, messages: [...lobby.messages, message] }
              : lobby
          )
        }));
      },
      
      createChatLobby: (name: string, description: string, isPrivate: boolean) => {
        const newLobby: ChatLobby = {
          id: Date.now().toString(),
          name,
          description,
          type: 'user',
          isPrivate,
          members: [],
          messages: [],
          createdAt: Date.now()
        };
        
        set(state => ({
          chatLobbies: [...state.chatLobbies, newLobby]
        }));
      },
      
      joinChatLobby: (lobbyId: string) => {
        const state = get();
        if (!state.activeCharacter) return;
        
        set(state => ({
          chatLobbies: state.chatLobbies.map(lobby =>
            lobby.id === lobbyId
              ? { ...lobby, members: [...lobby.members, state.activeCharacter!.id] }
              : lobby
          )
        }));
      },
      
      leaveChatLobby: (lobbyId: string) => {
        const state = get();
        if (!state.activeCharacter) return;
        
        set(state => ({
          chatLobbies: state.chatLobbies.map(lobby =>
            lobby.id === lobbyId
              ? { ...lobby, members: lobby.members.filter(id => id !== state.activeCharacter!.id) }
              : lobby
          )
        }));
      },
      
      cleanupEmptyLobbies: () => {
        set(state => ({
          chatLobbies: state.chatLobbies.filter(lobby => 
            lobby.members.length > 0 || lobby.id === 'kingdom_chat'
          )
        }));
      },
      
      addReactionToMessage: (messageId: string, emoji: string) => {
        set(state => ({
          chatLobbies: state.chatLobbies.map(lobby =>
            lobby.id === state.activeChannel
              ? {
                  ...lobby,
                  messages: lobby.messages.map(msg =>
                    msg.id === messageId
                      ? {
                          ...msg,
                          reactions: [
                            ...(msg.reactions || []),
                            { emoji, count: 1, users: [state.activeCharacter?.id || ''] }
                          ]
                        }
                      : msg
                  )
                }
              : lobby
          )
        }));
      },
      
      kickFromChat: (userId: string, channelId: string) => {
        // Admin only action
        const state = get();
        if (state.userRole !== 'admin') return;
        
        set(state => ({
          chatLobbies: state.chatLobbies.map(lobby =>
            lobby.id === channelId
              ? { ...lobby, members: lobby.members.filter(id => id !== userId) }
              : lobby
          )
        }));
      },
      
      banUser: (userId: string, channelId: string) => {
        // Admin only action
        const state = get();
        if (state.userRole !== 'admin') return;
        
        // Implementation would include ban list
        get().kickFromChat(userId, channelId);
      },
      
      setChatPopout: (popout: boolean) => {
        set({ chatPopout: popout });
      },
      
      connectToChat: (userId: string, userName: string) => {
        set(state => ({
          onlineUsers: [
            ...state.onlineUsers.filter(u => u.id !== userId),
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
        set(state => ({
          onlineUsers: state.onlineUsers.filter(u => u.id !== userId)
        }));
      },
      
      updateUserPresence: (userId: string, isOnline: boolean, channelId?: string) => {
        if (isOnline && channelId) {
          set(state => ({
            onlineUsers: [
              ...state.onlineUsers.filter(u => u.id !== userId),
              { 
                id: userId, 
                name: userId, 
                isOnline: true,
                channelId,
                lastSeen: Date.now()
              }
            ]
          }));
        } else {
          set(state => ({
            onlineUsers: state.onlineUsers.filter(u => u.id !== userId)
          }));
        }
      },
      
      // Guild management
      createGuild: (name: string, description: string, clanTag: string) => {
        const state = get();
        if (!state.activeCharacter) return;
        
        const newGuild: Guild = {
          id: Date.now().toString(),
          name,
          description,
          clanTag,
          members: [{
            id: state.activeCharacter.id,
            rank: 'Leader',
            joinedAt: Date.now()
          }],
          level: 1,
          createdAt: Date.now(),
          isRoyal: false,
          royalRoles: {}
        };
        
        set(state => ({
          guilds: [...state.guilds, newGuild]
        }));
        
        // Update character's guild ID
        get().updateCharacter(state.activeCharacter.id, {
          guildId: newGuild.id
        });
      },
      
      joinGuild: (guildId: string) => {
        const state = get();
        if (!state.activeCharacter) return;
        
        set(state => ({
          guilds: state.guilds.map(guild =>
            guild.id === guildId
              ? {
                  ...guild,
                  members: [...guild.members, {
                    id: state.activeCharacter!.id,
                    rank: 'Member',
                    joinedAt: Date.now()
                  }]
                }
              : guild
          )
        }));
        
        // Update character's guild ID
        get().updateCharacter(state.activeCharacter.id, {
          guildId: guildId
        });
      },
      
      leaveGuild: () => {
        const state = get();
        if (!state.activeCharacter || !state.activeCharacter.guildId) return;
        
        const guildId = state.activeCharacter.guildId;
        
        set(state => ({
          guilds: state.guilds.map(guild =>
            guild.id === guildId
              ? {
                  ...guild,
                  members: guild.members.filter(m => m.id !== state.activeCharacter!.id)
                }
              : guild
          )
        }));
        
        // Update character to remove guild ID and role
        get().updateCharacter(state.activeCharacter.id, {
          guildId: undefined,
          guildRole: undefined
        });
      },
      
      assignGuildRole: (guildId: string, characterId: string, role: GuildRole) => {
        const state = get();
        if (!state.activeCharacter) return;
        
        // Check if user is guild leader
        const guild = state.guilds.find(g => g.id === guildId);
        if (!guild) return;
        
        const userMember = guild.members.find(m => m.id === state.activeCharacter!.id);
        if (!userMember || userMember.rank !== 'Leader') return;
        
        // Update guild's royal roles
        set(state => ({
          guilds: state.guilds.map(g =>
            g.id === guildId
              ? {
                  ...g,
                  royalRoles: {
                    ...g.royalRoles,
                    [role]: characterId
                  }
                }
              : g
          )
        }));
        
        // Update character's guild role
        get().updateCharacter(characterId, {
          guildRole: role
        });
      },
      
      removeGuildRole: (guildId: string, characterId: string) => {
        const state = get();
        if (!state.activeCharacter) return;
        
        // Check if user is guild leader
        const guild = state.guilds.find(g => g.id === guildId);
        if (!guild) return;
        
        const userMember = guild.members.find(m => m.id === state.activeCharacter!.id);
        if (!userMember || userMember.rank !== 'Leader') return;
        
        // Find and remove the role
        const newRoyalRoles = { ...guild.royalRoles };
        Object.keys(newRoyalRoles).forEach(role => {
          if (newRoyalRoles[role as keyof typeof newRoyalRoles] === characterId) {
            delete newRoyalRoles[role as keyof typeof newRoyalRoles];
          }
        });
        
        set(state => ({
          guilds: state.guilds.map(g =>
            g.id === guildId
              ? { ...g, royalRoles: newRoyalRoles }
              : g
          )
        }));
        
        // Update character to remove guild role
        get().updateCharacter(characterId, {
          guildRole: undefined
        });
      },
      
      getGuildRoleInfo: (role: GuildRole) => {
        const roleInfo = {
          King: {
            emoji: '👑',
            description: 'Supreme ruler of the kingdom with ultimate authority',
            buffs: { strength: 5, intelligence: 3, charisma: 4 }
          },
          Queen: {
            emoji: '👸',
            description: 'Royal consort with diplomatic and magical prowess',
            buffs: { wisdom: 5, charisma: 4, intelligence: 3 }
          },
          Knight: {
            emoji: '⚔️',
            description: 'Elite warrior champion of the realm',
            buffs: { strength: 4, constitution: 4, dexterity: 2 }
          },
          Bishop: {
            emoji: '🛡️',
            description: 'High priest with divine blessing and protection',
            buffs: { wisdom: 4, constitution: 3, charisma: 3 }
          },
          Member: {
            emoji: '',
            description: 'Regular guild member',
            buffs: {}
          }
        };
        
        return roleInfo[role] || roleInfo.Member;
      },
      
      // Party management
      createParty: (name: string) => {
        const state = get();
        if (!state.activeCharacter) return;
        
        const newParty: Party = {
          id: Date.now().toString(),
          name,
          leaderId: state.activeCharacter.id,
          members: [{
            id: state.activeCharacter.id,
            name: state.activeCharacter.name,
            level: state.activeCharacter.level,
            class: state.activeCharacter.class || 'Unknown',
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
      
      // Friend management
      addFriend: (playerName: string) => {
        const state = get();
        if (!state.activeCharacter) return false;
        
        // Mock friend addition
        const newFriend: Friend = {
          id: Date.now().toString(),
          name: playerName,
          level: Math.floor(Math.random() * 20) + 1,
          race: 'Human',
          class: 'Warrior',
          lastSeen: Date.now()
        };
        
        set(state => ({
          friendsList: [...state.friendsList, newFriend]
        }));
        
        return true;
      },
      
      removeFriend: (friendId: string) => {
        set(state => ({
          friendsList: state.friendsList.filter(f => f.id !== friendId)
        }));
      },
      
      // Kingdom management
      claimTerritory: (territoryId: string, guildId: string) => {
        set(state => ({
          territories: state.territories.map(territory =>
            territory.id === territoryId
              ? { ...territory, controllingGuild: guildId }
              : territory
          )
        }));
        
        // Check if this unlocks the Royal Spire
        get().checkRoyalSpireUnlock();
      },
      
      checkRoyalSpireUnlock: () => {
        const state = get();
        
        // Check if any guild controls all claimable territories (excluding water and royal spire)
        const claimableTerritories = state.territories.filter(t => t.isClaimable !== false && !t.isRoyalSpire);
        const guildTerritoryCount: Record<string, number> = {};
        
        claimableTerritories.forEach(territory => {
          if (territory.controllingGuild) {
            guildTerritoryCount[territory.controllingGuild] = 
              (guildTerritoryCount[territory.controllingGuild] || 0) + 1;
          }
        });
        
        // Find guild that controls all territories
        const totalClaimable = claimableTerritories.length;
        const dominantGuild = Object.entries(guildTerritoryCount).find(
          ([guildId, count]) => count === totalClaimable
        );
        
        if (dominantGuild && !state.royalSpireUnlocked) {
          const [guildId] = dominantGuild;
          
          // Unlock Royal Spire
          set(state => ({
            royalSpireUnlocked: true,
            territories: state.territories.map(territory =>
              territory.isRoyalSpire
                ? { ...territory, isClaimable: true }
                : territory
            ),
            guilds: state.guilds.map(guild =>
              guild.id === guildId
                ? { ...guild, isRoyal: true, royalRoles: guild.royalRoles || {} }
                : { ...guild, isRoyal: false }
            )
          }));
          
          get().addNotification('🏰 The Royal Spire has emerged! A guild has conquered all territories!', 'success');
        }
      },
      
      initiateGuildBattle: (territoryId: string, attackingGuildId: string) => {
        const state = get();
        const territory = state.territories.find(t => t.id === territoryId);
        const attackingGuild = state.guilds.find(g => g.id === attackingGuildId);
        const defendingGuild = territory?.controllingGuild 
          ? state.guilds.find(g => g.id === territory.controllingGuild)
          : undefined;
        
        if (!territory || !attackingGuild) return;
        
        const newBattle: GuildBattle = {
          id: Date.now().toString(),
          territoryId,
          attackingGuild,
          defendingGuild,
          attackers: [],
          defenders: [],
          status: 'recruiting',
          startTime: Date.now(),
          maxParticipants: 10,
          currentTurn: null
        };
        
        set(state => ({
          guildBattles: [...state.guildBattles, newBattle]
        }));
      },
      
      joinGuildBattle: (battleId: string, side: 'attacker' | 'defender') => {
        const state = get();
        if (!state.activeCharacter) return;
        
        set(state => ({
          guildBattles: state.guildBattles.map(battle =>
            battle.id === battleId
              ? {
                  ...battle,
                  attackers: side === 'attacker' 
                    ? [...battle.attackers, state.activeCharacter!.id]
                    : battle.attackers,
                  defenders: side === 'defender'
                    ? [...battle.defenders, state.activeCharacter!.id]
                    : battle.defenders
                }
              : battle
          )
        }));
      },
      
      startGuildBattle: (battleId: string) => {
        set(state => ({
          guildBattles: state.guildBattles.map(battle =>
            battle.id === battleId
              ? { ...battle, status: 'active' }
              : battle
          )
        }));
      },
      
      // Research system
      getAvailableResearch: () => {
        const state = get();
        if (!state.activeCharacter) return [];
        
        return initialResearch.filter(research => {
          // Check if already completed
          if (state.completedResearch.some(cr => cr.id === research.id)) {
            return false;
          }
          
          // Check if currently active
          if (state.activeResearch.some(ar => ar.id === research.id)) {
            return false;
          }
          
          // Check level requirement
          if (research.requirements.level > state.activeCharacter!.level) {
            return false;
          }
          
          // Check prerequisites
          if (research.requirements.prerequisites) {
            const hasAllPrereqs = research.requirements.prerequisites.every(prereq =>
              state.completedResearch.some(cr => cr.id === prereq)
            );
            if (!hasAllPrereqs) {
              return false;
            }
          }
          
          return true;
        });
      },
      
      startResearch: (researchId: string) => {
        const state = get();
        if (!state.activeCharacter) return false;
        
        const research = initialResearch.find(r => r.id === researchId);
        if (!research) return false;
        
        // Check if research is available
        const availableResearch = get().getAvailableResearch();
        if (!availableResearch.some(r => r.id === researchId)) {
          return false;
        }
        
        const activeResearch: Research = {
          ...research,
          startedAt: Date.now(),
          completedAt: Date.now() + research.duration
        };
        
        set(state => ({
          activeResearch: [...state.activeResearch, activeResearch]
        }));
        
        return true;
      },
      
      completeResearch: (researchId: string) => {
        const state = get();
        if (!state.activeCharacter) return false;
        
        const activeResearch = state.activeResearch.find(r => r.id === researchId);
        if (!activeResearch || !activeResearch.completedAt) return false;
        
        // Check if research is actually completed
        if (Date.now() < activeResearch.completedAt) return false;
        
        // Apply rewards
        if (activeResearch.rewards.experience) {
          get().gainExperience(activeResearch.rewards.experience);
        }
        
        if (activeResearch.rewards.statBoosts) {
          const currentStats = { ...state.activeCharacter.stats };
          Object.entries(activeResearch.rewards.statBoosts).forEach(([stat, boost]) => {
            currentStats[stat as keyof typeof currentStats] += boost;
          });
          
          get().updateCharacter(state.activeCharacter.id, {
            stats: currentStats
          });
        }
        
        // Move from active to completed
        set(state => ({
          activeResearch: state.activeResearch.filter(r => r.id !== researchId),
          completedResearch: [...state.completedResearch, activeResearch]
        }));
        
        return true;
      },
      
      skipResearchWithDiamonds: (researchId: string) => {
        const state = get();
        if (!state.activeCharacter) return false;
        
        const activeResearch = state.activeResearch.find(r => r.id === researchId);
        if (!activeResearch || !activeResearch.completedAt) return false;
        
        const timeRemaining = activeResearch.completedAt - Date.now();
        const minutesRemaining = Math.ceil(timeRemaining / (1000 * 60));
        const diamondCost = Math.max(1, Math.floor(minutesRemaining / 2));
        
        if (state.diamonds < diamondCost) return false;
        
        // Spend diamonds
        set(state => ({ diamonds: state.diamonds - diamondCost }));
        
        // Complete research immediately
        return get().completeResearch(researchId);
      },
      
      // Familiar system
      canSummonFamiliar: (type: string) => {
        const state = get();
        if (!state.activeCharacter) {
          return { canSummon: false, reason: 'No active character', cost: 0 };
        }
        
        if (state.activeCharacter.familiar) {
          return { canSummon: false, reason: 'Already have a familiar', cost: 0 };
        }
        
        const familiarType = familiarTypes.find(f => f.type === type);
        if (!familiarType) {
          return { canSummon: false, reason: 'Invalid familiar type', cost: 0 };
        }
        
        if (state.activeCharacter.level < familiarType.levelRequirement) {
          return { 
            canSummon: false, 
            reason: `Requires level ${familiarType.levelRequirement}`, 
            cost: familiarType.cost 
          };
        }
        
        if (state.diamonds < familiarType.cost) {
          return { 
            canSummon: false, 
            reason: `Need ${familiarType.cost} diamonds`, 
            cost: familiarType.cost 
          };
        }
        
        return { canSummon: true, reason: '', cost: familiarType.cost };
      },
      
      summonFamiliar: (type: string, name: string) => {
        const state = get();
        if (!state.activeCharacter) return false;
        
        const { canSummon, cost } = get().canSummonFamiliar(type);
        if (!canSummon) return false;
        
        const familiarType = familiarTypes.find(f => f.type === type);
        if (!familiarType) return false;
        
        const newFamiliar: Familiar = {
          name,
          type: type as any,
          level: 1,
          loyalty: 50,
          health: { current: 50, max: 50 },
          mana: { current: 25, max: 25 },
          stats: {
            strength: 5,
            dexterity: 5,
            constitution: 5,
            intelligence: 5,
            wisdom: 5,
            charisma: 5
          }
        };
        
        // Spend diamonds
        set(state => ({ diamonds: state.diamonds - cost }));
        
        // Add familiar to character
        get().updateCharacter(state.activeCharacter.id, {
          familiar: newFamiliar
        });
        
        get().addNotification(`${name} has been summoned as your faithful companion!`, 'success');
        return true;
      },
      
      dismissFamiliar: () => {
        const state = get();
        if (!state.activeCharacter || !state.activeCharacter.familiar) return;
        
        get().updateCharacter(state.activeCharacter.id, {
          familiar: undefined
        });
        
        get().addNotification('Your familiar has been dismissed.', 'info');
      },
      
      // Notifications
      addNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
        const notification = {
          id: Date.now().toString(),
          message,
          type,
          timestamp: Date.now()
        };
        
        set(state => ({
          notifications: [...state.notifications, notification]
        }));
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
          get().removeNotification(notification.id);
        }, 5000);
      },
      
      removeNotification: (id: string) => {
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }));
      },
      
      clearNotifications: () => {
        set({ notifications: [] });
      }
    }),
    {
      name: 'game-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        userRole: state.userRole,
        characters: state.characters,
        activeCharacter: state.activeCharacter,
        diamonds: state.diamonds,
        guilds: state.guilds,
        territories: state.territories,
        completedResearch: state.completedResearch,
        royalSpireUnlocked: state.royalSpireUnlocked
      })
    }
  )
);