// Base types
export interface Character {
  id: string;
  name: string;
  race: string;
  class: string;
  profileImage?: string;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  health: {
    current: number;
    max: number;
  };
  mana: {
    current: number;
    max: number;
  };
  stats: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  inventory: Item[];
  equipment: Equipment;
  gold: number;
  buffs: Buff[];
  debuffs: Debuff[];
  familiar?: Familiar;
  guildId?: string;
  guildRole?: GuildRole;
  customClass?: CustomClass;
  customRace?: CustomRace;
  unlockedSpells?: string[];
  unlockedItems?: string[];
  // Combat properties
  currentHealth: number;
  maxHealth: number;
  armorClass: number;
  damageDie: number;
  // Dice roll tracking
  lastDiceRoll?: {
    value: number;
    diceType: number;
    modifier: number;
    timestamp: number;
  };
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'potion' | 'accessory' | 'tool' | 'material' | 'quest';
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  value: number;
  icon?: string;
  equipSlot?: string;
  stats?: {
    [key: string]: number;
  };
  boost?: {
    [key: string]: number;
  };
  effects?: ItemEffect[];
  stackable?: boolean;
  quantity?: number;
}

export interface ItemEffect {
  type: 'heal' | 'mana' | 'buff' | 'debuff' | 'revive';
  value: number;
  duration?: number;
}

export interface Equipment {
  [slot: string]: Item;
}

export interface Buff {
  id: string;
  name: string;
  description: string;
  duration: number;
  effects: {
    [stat: string]: number;
  };
}

export interface Debuff {
  id: string;
  name: string;
  description: string;
  duration: number;
  effects: {
    [stat: string]: number;
  };
}

export interface Familiar {
  type: FamiliarType;
  name: string;
  level: number;
  loyalty: number;
  health: {
    current: number;
    max: number;
  };
  mana: {
    current: number;
    max: number;
  };
  stats: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
}

export type FamiliarType = 'sprite' | 'raven' | 'wolf' | 'golem' | 'dragon' | 'phoenix';

// Guild Role types
export type GuildRole = 'King' | 'Queen' | 'Knight' | 'Bishop' | 'Member';

export interface GuildRoleInfo {
  role: GuildRole;
  emoji: string;
  buffs: {
    [stat: string]: number;
  };
  description: string;
}

export interface RoyalGuild {
  id: string;
  name: string;
  clanTag: string;
  description: string;
  members: GuildMember[];
  createdAt: number;
  level: number;
  isRoyal: boolean;
  royalRoles: {
    King?: string; // character ID
    Queen?: string; // character ID
    Knight?: string; // character ID
    Bishop?: string; // character ID
  };
  royalSpireControlled: boolean;
}

// Shop types
export interface ShopItem {
  id: string;
  item: Item;
  price: number;
  stock: number;
  category: 'weapons' | 'armor' | 'potions' | 'accessories' | 'materials';
  featured?: boolean;
}

// Enemy types
export interface Enemy {
  id: string;
  name: string;
  description: string;
  level: number;
  requiredLevel: number;
  health: { max: number };
  maxHealth: number;
  currentHealth: number;
  attack: number;
  defense: number;
  experience: number;
  gold: number;
  difficulty: 'normal' | 'elite' | 'boss' | 'legendary' | 'mythic';
  stats: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  armorClass?: number;
  damageDie?: number;
  attacks: Array<{
    name: string;
    damage: string;
    description: string;
  }>;
  loot: {
    experience: number;
    gold: { min: number; max: number };
    items?: Item[];
  };
  abilities?: string[];
  weaknesses?: string[];
  resistances?: string[];
  imageUrl?: string;
  image?: string;
  profileImage?: string;
  environment?: string;
  lore?: string;
}

// Admin Enemy Editor types
export interface EnemyEditorData {
  id?: string;
  name: string;
  description: string;
  level: number;
  requiredLevel: number;
  maxHealth: number;
  attack: number;
  defense: number;
  experience: number;
  gold: number;
  difficulty: 'normal' | 'elite' | 'boss' | 'legendary' | 'mythic';
  stats: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  armorClass: number;
  damageDie: number;
  attacks: Array<{
    name: string;
    damage: string;
    description: string;
  }>;
  abilities: string[];
  weaknesses: string[];
  resistances: string[];
  profileImage: string;
  environment: string;
  lore: string;
}

// Race and Class types
export interface Race {
  id: string;
  name: string;
  description: string;
  statBonuses: {
    [key: string]: number;
  };
  abilities: string[];
  lore: string;
}

export interface Class {
  id: string;
  name: string;
  description: string;
  primaryStat: string;
  abilities: string[];
  startingEquipment: string[];
  lore: string;
  isCustom?: boolean;
  statBonuses?: {
    [key: string]: number;
  };
}

// Spell types
export interface Spell {
  id: string;
  name: string;
  description: string;
  school: string;
  level: number;
  manaCost: number;
  castTime: number;
  cooldown: number;
  damage: { min: number; max: number };
  range: number;
  effects: Array<{
    type: string;
    value: number;
    duration: number;
    element?: string;
  }>;
  requirements: {
    class: string[];
    level: number;
    intelligence?: number;
    wisdom?: number;
  };
  lore: string;
}

// Social types
export interface Guild {
  id: string;
  name: string;
  clanTag: string;
  description: string;
  members: GuildMember[];
  createdAt: number;
  level: number;
  isRoyal?: boolean;
  royalRoles?: {
    King?: string; // character ID
    Queen?: string; // character ID
    Knight?: string; // character ID
    Bishop?: string; // character ID
  };
  royalSpireControlled?: boolean;
}

export interface GuildMember {
  id: string;
  rank: 'Leader' | 'Officer' | 'Member';
  joinedAt: number;
}

export interface Party {
  id: string;
  name: string;
  leaderId: string;
  members: PartyMember[];
  maxMembers: number;
  createdAt: number;
}

export interface PartyMember {
  id: string;
  name: string;
  level: number;
  class: string;
  isOnline: boolean;
}

export interface Friend {
  id: string;
  name: string;
  level: number;
  race: string;
  class: string;
  lastSeen: number;
}

// Chat types
export interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
  reactions?: MessageReaction[];
  fontColor?: string;
  messageType?: 'normal' | 'emote';
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface ChatLobby {
  id: string;
  name: string;
  description: string;
  type: 'default' | 'user' | 'guild';
  createdBy?: string;
  createdAt: number;
  members: string[];
  messages: ChatMessage[];
  isPrivate: boolean;
}

export interface OnlineUser {
  id: string;
  name: string;
  isOnline: boolean;
  channelId?: string;
  lastSeen: number;
}

// Territory types
export interface Territory {
  id: string;
  name: string;
  type: 'plains' | 'forest' | 'mountain' | 'water' | 'desert' | 'castle';
  position: { x: number; y: number };
  description: string;
  defenseStrength: number;
  strategicValue: number;
  resources: string[];
  lore: string;
  controllingGuild?: string;
  isClaimable: boolean;
  isRoyalSpire?: boolean;
}

// Guild Battle types
export interface GuildBattle {
  id: string;
  territoryId: string;
  attackingGuild: Guild;
  defendingGuild?: Guild;
  attackers: string[];
  defenders: string[];
  status: 'recruiting' | 'active' | 'completed';
  startTime: number;
  maxParticipants: number;
  currentTurn: string | null;
}

// Mail types
export interface Mail {
  id: string;
  sender: string;
  recipient: string;
  subject: string;
  message: string;
  timestamp: number;
  isRead: boolean;
  isStarred: boolean;
}

// Research types
export interface Research {
  id: string;
  name: string;
  description: string;
  category: 'combat' | 'magic' | 'crafting' | 'exploration';
  duration: number; // in milliseconds
  requirements: {
    level: number;
    prerequisites?: string[];
  };
  rewards: {
    experience?: number;
    unlocks?: string[];
    statBoosts?: {
      [stat: string]: number;
    };
  };
  isCompleted: boolean;
  startedAt?: number;
  completedAt?: number;
}

// PVP types
export interface PvpPlayer {
  playerId: string;
  playerName: string;
  level: number;
  ranking: number;
  queueTime: number;
}

export interface PvpMatch {
  id: string;
  player1: {
    id: string;
    name: string;
    level: number;
    health: number;
    maxHealth: number;
  };
  player2: PvpPlayer;
  startTime: number;
  currentTurn: string;
  status: 'active' | 'completed';
}

// Character Creation types
export interface CreateCharacterInput {
  name: string;
  race: string;
  class: string;
  profileImage?: string;
  customRace?: CustomRace;
  customClass?: CustomClass;
}

export interface CustomRace {
  name: string;
  description: string;
  statBonuses: {
    [stat: string]: number;
  };
  abilities: string[];
  lore: string;
}

export interface CustomClass {
  name: string;
  description: string;
  primaryStat: string;
  abilities: string[];
  startingEquipment: string[];
  lore: string;
}

// Notification types
export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  timestamp: number;
}

// Combat Participant type for ReactivePlayerCard
export interface CombatParticipant {
  id: string;
  name: string;
  level: number;
  race: string;
  class: string;
  health: {
    current: number;
    max: number;
  };
  mana: {
    current: number;
    max: number;
  };
  stats: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  isPlayer: boolean;
  buffs: Array<{
    name: string;
    effect: string;
    duration: number;
    type: 'magic' | 'attack' | 'defense' | 'speed';
  }>;
  debuffs: Array<{
    name: string;
    effect: string;
    duration: number;
    type: 'curse' | 'poison' | 'weakness' | 'slow';
  }>;
  profileImage?: string;
  customRace?: CustomRace;
  customClass?: CustomClass;
  guildRole?: GuildRole;
  lastDiceRoll?: {
    value: number;
    diceType: number;
    modifier: number;
    timestamp: number;
  };
}

// Admin types
export interface AdminUser {
  id: string;
  username: string;
  role: 'admin' | 'moderator';
  permissions: string[];
  createdAt: number;
}

export interface BannedUser {
  userId: string;
  username: string;
  reason: string;
  bannedAt: number;
  bannedBy: string;
  isActive: boolean;
}

// Main game state
export interface GameState {
  // Authentication
  isAuthenticated: boolean;
  username: string;
  
  // Character Management
  characters: Character[];
  activeCharacter: Character | null;
  userRole: 'player' | 'moderator' | 'admin';
  
  // Currency
  diamonds: number;
  
  // Social
  guilds: Guild[];
  activeParty: Party | null;
  friendsList: Friend[];
  onlineFriends: string[];
  
  // Territory System
  territories: Territory[];
  royalSpireUnlocked: boolean;
  
  // Guild Battles
  guildBattles: GuildBattle[];
  activeGuildBattle: GuildBattle | null;
  
  // Mail System
  mailbox: Mail[];
  
  // Research System
  researchItems: Research[];
  activeResearch: Research[];
  completedResearch: Research[];
  
  // Chat State
  activeChannel: string;
  chatLobbies: ChatLobby[];
  chatPopout: boolean;
  
  // Online Users
  onlineUsers: OnlineUser[];
  
  // Shop State
  shopItems: ShopItem[];
  availableEnemies: Enemy[];
  
  // Combat State
  selectedOpponent: Enemy | null;
  
  // PVP State
  pvpQueue: PvpPlayer[];
  activePvpMatch: PvpMatch | null;
  pvpRanking: number;
  
  // Admin State
  bannedUsers: string[];
  customEnemies: Enemy[];
  
  // Notification system
  notifications: Notification[];
  
  // Authentication Functions
  login: (username: string) => void;
  
  // Character Functions
  createCharacter: (character: CreateCharacterInput) => void;
  deleteCharacter: (characterId: string) => void;
  selectCharacter: (characterId: string) => void;
  updateCharacterProfileImage: (characterId: string, imageUrl: string) => void;
  addExperience: (amount: number) => void;
  gainExperience: (amount: number) => void;
  addGold: (amount: number) => void;
  gainGold: (amount: number) => void;
  gainDiamonds: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  updateCharacterHealth: (characterId: string, newHealth: number) => void;
  
  // Territory Functions
  claimTerritory: (territoryId: string, guildId: string) => void;
  unlockRoyalSpire: () => void;
  checkRoyalSpireUnlock: () => void;
  
  // Guild Battle Functions
  initiateGuildBattle: (territoryId: string, attackingGuildId: string) => void;
  joinGuildBattle: (battleId: string, side: 'attacker' | 'defender') => void;
  startGuildBattle: (battleId: string) => void;
  
  // Royal Guild Functions
  assignGuildRole: (guildId: string, characterId: string, role: GuildRole) => void;
  removeGuildRole: (guildId: string, characterId: string) => void;
  getGuildRoleInfo: (role: GuildRole) => GuildRoleInfo;
  applyRoyalBuffs: (characterId: string) => void;
  removeRoyalBuffs: (characterId: string) => void;
  
  // Inventory Functions
  addItem: (item: Item) => void;
  removeItem: (itemId: string) => void;
  equipItem: (itemId: string, slot?: string) => void;
  unequipItem: (slot: string) => void;
  useItem: (itemId: string) => boolean;
  
  // Shop Functions
  buyItem: (itemId: string) => boolean;
  purchaseItem: (itemId: string, quantity?: number) => boolean;
  sellItem: (itemId: string) => boolean;
  
  // Combat Functions
  getAvailableEnemies: () => Enemy[];
  
  // Helper functions for stat calculation
  getBaseStats: (character: Character) => any;
  calculateTotalStats: (baseStats: any, equipment: any) => any;
  
  startEnemyAttack: () => void;
  handleDefeat: () => void;
  
  // Familiar Functions
  canSummonFamiliar: (type: FamiliarType) => { canSummon: boolean; reason: string; cost: number };
  summonFamiliar: (type: FamiliarType, name: string) => boolean;
  dismissFamiliar: () => void;
  
  // Party Functions
  createParty: (name: string) => void;
  leaveParty: () => void;
  inviteToParty: (playerName: string) => boolean;
  kickFromParty: (playerId: string) => void;
  
  // Friend Functions
  addFriend: (playerName: string) => boolean;
  removeFriend: (friendId: string) => void;
  sendQuickMessage: (friendId: string, message: string) => void;
  
  // Guild Functions
  createGuild: (name: string, description: string, tag: string) => void;
  joinGuild: (guildId: string) => void;
  leaveGuild: () => void;
  
  // Guild Chat Functions
  createGuildChat: (guild: Guild) => void;
  autoJoinGuildChat: (guildId: string) => void;
  leaveGuildChat: (guildId: string) => void;
  
  // Mail Functions
  sendMail: (recipient: string, subject: string, message: string) => void;
  markMailAsRead: (mailId: string) => void;
  deleteMail: (mailId: string) => void;
  toggleMailStar: (mailId: string) => void;
  
  // Research Functions
  getAvailableResearch: () => Research[];
  startResearch: (researchId: string) => boolean;
  completeResearch: (researchId: string) => boolean;
  skipResearchWithDiamonds: (researchId: string) => boolean;
  
  // PVP Functions
  joinPvpQueue: () => boolean;
  leavePvpQueue: () => void;
  startPvpMatch: (opponentId: string) => boolean;
  endPvpMatch: (winnerId: string) => void;
  
  // Chat Functions
  setActiveChannel: (channelId: string) => void;
  addChatMessage: (message: ChatMessage) => void;
  createChatLobby: (name: string, description: string, isPrivate: boolean) => void;
  joinChatLobby: (lobbyId: string) => void;
  leaveChatLobby: (lobbyId: string) => void;
  cleanupEmptyLobbies: () => void;
  addReactionToMessage: (messageId: string, emoji: string) => void;
  kickFromChat: (userId: string, lobbyId: string) => void;
  banUser: (userId: string, reason: string) => void;
  unbanUser: (userId: string) => void;
  
  // Chat Pop-out Functions
  setChatPopout: (isPopout: boolean) => void;

  // Real-time Chat Functions
  connectToChat: (userId: string, userName: string) => void;
  disconnectFromChat: (userId: string) => void;
  updateUserPresence: (userId: string, isOnline: boolean, channelId?: string) => void;
  
  // Admin Functions
  createEnemy: (enemyData: EnemyEditorData) => boolean;
  updateEnemy: (enemyId: string, enemyData: EnemyEditorData) => boolean;
  deleteEnemy: (enemyId: string) => boolean;
  uploadEnemyImage: (enemyId: string, imageUrl: string) => boolean;
  getAllEnemiesForAdmin: () => Enemy[];
  setUserRole: (username: string, role: 'player' | 'moderator' | 'admin') => void;
  
  addNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeNotification: (id: string) => void;
  
  // Admin Functions
  logout: () => void;
}