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
  customClass?: CustomClass;
  customRace?: CustomRace;
  unlockedSpells: string[];
  unlockedItems: string[];
  guildId?: string;
  familiar?: Familiar;
  // Combat properties
  currentHealth: number;
  maxHealth: number;
  armorClass: number;
  damageDie: number;
}

export interface CreateCharacterInput {
  name: string;
  race: string;
  class: string;
  profileImage?: string;
  customClass?: CustomClass;
  customRace?: CustomRace;
}

export interface CustomClass {
  name: string;
  description: string;
  primaryStat: string;
  abilities: string[];
  startingEquipment: string[];
  lore: string;
}

export interface CustomRace {
  name: string;
  description: string;
  statBonuses: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  abilities: string[];
  lore: string;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'potion' | 'tool' | 'misc';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  value: number;
  equipSlot?: string;
  stats?: {
    [key: string]: number;
  };
  boost?: {
    [key: string]: number;
  };
  effects?: {
    type: string;
    value: number;
  }[];
  stackable?: boolean;
  quantity?: number;
  icon?: string;
}

export interface Equipment {
  [key: string]: Item;
}

export interface Buff {
  id: string;
  name: string;
  description: string;
  duration: number;
  effects: {
    [key: string]: number;
  };
}

export interface Debuff {
  id: string;
  name: string;
  description: string;
  duration: number;
  effects: {
    [key: string]: number;
  };
}

export interface Enemy {
  id: string;
  name: string;
  level: number;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  experience: number;
  gold: number;
  loot: Item[];
  requiredLevel: number;
  description: string;
  type: string;
  abilities: string[];
}

export interface ShopItem {
  id: string;
  item: Item;
  price: number;
  stock: number;
}

export interface FamiliarType {
  sprite: string;
  raven: string;
  wolf: string;
  golem: string;
  dragon: string;
  phoenix: string;
}

export interface Familiar {
  type: keyof FamiliarType;
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

export interface Guild {
  id: string;
  name: string;
  clanTag: string;
  description: string;
  members: GuildMember[];
  createdAt: number;
  level: number;
}

export interface GuildMember {
  id: string;
  rank: string;
  joinedAt: number;
}

export interface Territory {
  id: string;
  name: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  description: string;
  defenseStrength: number;
  strategicValue: number;
  resources: string[];
  lore: string;
  isClaimable: boolean;
  controllingGuild?: string;
  isRoyalSpire?: boolean;
}

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

export interface Research {
  id: string;
  name: string;
  description: string;
  category: string;
  duration: number;
  requirements: {
    level: number;
    prerequisites?: string[];
  };
  rewards: {
    experience?: number;
    statBoosts?: {
      [key: string]: number;
    };
    unlocks?: string[];
  };
  isCompleted: boolean;
  startedAt?: number;
  completedAt?: number;
}

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
  status: 'active';
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: number;
  reactions: {
    emoji: string;
    count: number;
    users: string[];
  }[];
  fontColor?: string;
  messageType?: 'normal' | 'emote';
  type?: 'message' | 'system' | 'announcement';
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
  channelId: string;
  lastSeen: number;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  timestamp: number;
}

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
  chatMessages: ChatMessage[];
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
  
  // Notification system
  notifications: Notification[];
  
  // Authentication Functions
  login: (username: string) => void;
  
  // Character Functions
  createCharacter: (characterInput: CreateCharacterInput) => void;
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
  
  // Guild Battle Functions
  initiateGuildBattle: (territoryId: string, attackingGuildId: string) => void;
  joinGuildBattle: (battleId: string, side: 'attacker' | 'defender') => void;
  startGuildBattle: (battleId: string) => void;
  
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
  getBaseStats: (character: Character) => any;
  calculateTotalStats: (baseStats: any, equipment: any) => any;
  startEnemyAttack: () => void;
  handleDefeat: () => void;
  
  // Familiar Functions
  canSummonFamiliar: (type: keyof FamiliarType) => { canSummon: boolean; reason: string; cost: number };
  summonFamiliar: (type: keyof FamiliarType, name: string) => boolean;
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
  
  // Chat Pop-out Functions
  setChatPopout: (isPopout: boolean) => void;

  // Real-time Chat Functions
  connectToChat: (userId: string, userName: string) => void;
  disconnectFromChat: (userId: string) => void;
  updateUserPresence: (userId: string, isOnline: boolean, channelId?: string) => void;
  
  addNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeNotification: (id: string) => void;
  
  // Admin Functions
  logout: () => void;
}