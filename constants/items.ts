import { Item, ShopItem } from '@/types/game';

export const startingItems: Item[] = [
  {
    id: 'health_potion',
    name: 'Health Potion',
    description: 'A red liquid that restores health when consumed.',
    type: 'potion',
    rarity: 'common',
    value: 25,
    effects: [
      { type: 'heal', value: 25 }
    ],
    stackable: true,
    quantity: 3,
    effectValue: 25
  },
  {
    id: 'mana_potion',
    name: 'Mana Potion',
    description: 'A blue liquid that restores magical energy when consumed.',
    type: 'potion',
    rarity: 'common',
    value: 30,
    effects: [
      { type: 'heal', value: 20 }
    ],
    stackable: true,
    quantity: 2,
    effectValue: 20
  }
];

export const items: Item[] = [
  ...startingItems,
  {
    id: 'iron_sword',
    name: 'Iron Sword',
    description: 'A well-crafted iron blade, sharp and reliable.',
    type: 'weapon',
    rarity: 'common',
    value: 100,
    equipSlot: 'mainHand',
    stats: {
      attack: 8,
      strength: 2
    },
    bonus: 2
  },
  {
    id: 'leather_armor',
    name: 'Leather Armor',
    description: 'Flexible leather protection that does not restrict movement.',
    type: 'armor',
    rarity: 'common',
    value: 80,
    equipSlot: 'chest',
    stats: {
      defense: 3,
      dexterity: 1
    }
  },
  {
    id: 'wooden_shield',
    name: 'Wooden Shield',
    description: 'A sturdy wooden shield reinforced with iron bands.',
    type: 'armor',
    rarity: 'common',
    value: 60,
    equipSlot: 'offHand',
    stats: {
      defense: 2
    }
  },
  {
    id: 'steel_helmet',
    name: 'Steel Helmet',
    description: 'A protective steel helmet that guards the head.',
    type: 'armor',
    rarity: 'uncommon',
    value: 120,
    equipSlot: 'head',
    stats: {
      defense: 2,
      constitution: 1
    }
  },
  {
    id: 'magic_staff',
    name: 'Apprentice Staff',
    description: 'A wooden staff imbued with minor magical properties.',
    type: 'weapon',
    rarity: 'uncommon',
    value: 200,
    equipSlot: 'mainHand',
    stats: {
      attack: 4,
      intelligence: 3
    },
    bonus: 3
  },
  {
    id: 'greater_health_potion',
    name: 'Greater Health Potion',
    description: 'A potent red elixir that restores significant health.',
    type: 'potion',
    rarity: 'uncommon',
    value: 75,
    effects: [
      { type: 'heal', value: 50 }
    ],
    stackable: true,
    quantity: 1,
    effectValue: 50
  },
  {
    id: 'greater_mana_potion',
    name: 'Greater Mana Potion',
    description: 'A concentrated blue elixir that restores substantial magical energy.',
    type: 'potion',
    rarity: 'uncommon',
    value: 85,
    effects: [
      { type: 'heal', value: 40 }
    ],
    stackable: true,
    quantity: 1,
    effectValue: 40
  },
  {
    id: 'revive_potion',
    name: 'Revive Potion',
    description: 'A miraculous golden elixir that can bring the defeated back to life with 50% health.',
    type: 'potion',
    rarity: 'rare',
    value: 200,
    effects: [
      { type: 'heal', value: 0 }
    ],
    stackable: true,
    quantity: 1,
    effectValue: 0
  },
  {
    id: 'strength_elixir',
    name: 'Elixir of Strength',
    description: 'A golden potion that temporarily enhances physical power.',
    type: 'potion',
    rarity: 'rare',
    value: 150,
    effects: [
      { type: 'buff', value: 5, duration: 300 }
    ],
    stackable: true,
    quantity: 1,
    effectValue: 5
  }
];

export const shopItems: ShopItem[] = [
  {
    id: 'iron_sword_shop',
    item: {
      id: 'iron_sword',
      name: 'Iron Sword',
      description: 'A well-crafted iron blade, sharp and reliable.',
      type: 'weapon',
      rarity: 'common',
      value: 100,
      equipSlot: 'mainHand',
      stats: {
        attack: 8,
        strength: 2
      },
      bonus: 2
    },
    price: 150,
    stock: 5,
    category: 'weapons',
    featured: true
  },
  {
    id: 'leather_armor_shop',
    item: {
      id: 'leather_armor',
      name: 'Leather Armor',
      description: 'Flexible leather protection that does not restrict movement.',
      type: 'armor',
      rarity: 'common',
      value: 80,
      equipSlot: 'chest',
      stats: {
        defense: 3,
        dexterity: 1
      }
    },
    price: 120,
    stock: 3,
    category: 'armor',
    featured: false
  },
  {
    id: 'wooden_shield_shop',
    item: {
      id: 'wooden_shield',
      name: 'Wooden Shield',
      description: 'A sturdy wooden shield reinforced with iron bands.',
      type: 'armor',
      rarity: 'common',
      value: 60,
      equipSlot: 'offHand',
      stats: {
        defense: 2
      }
    },
    price: 90,
    stock: 4,
    category: 'armor',
    featured: false
  },
  {
    id: 'steel_helmet_shop',
    item: {
      id: 'steel_helmet',
      name: 'Steel Helmet',
      description: 'A protective steel helmet that guards the head.',
      type: 'armor',
      rarity: 'uncommon',
      value: 120,
      equipSlot: 'head',
      stats: {
        defense: 2,
        constitution: 1
      }
    },
    price: 180,
    stock: 2,
    category: 'armor',
    featured: false
  },
  {
    id: 'magic_staff_shop',
    item: {
      id: 'magic_staff',
      name: 'Apprentice Staff',
      description: 'A wooden staff imbued with minor magical properties.',
      type: 'weapon',
      rarity: 'uncommon',
      value: 200,
      equipSlot: 'mainHand',
      stats: {
        attack: 4,
        intelligence: 3
      },
      bonus: 3
    },
    price: 300,
    stock: 2,
    category: 'weapons',
    featured: true
  },
  {
    id: 'greater_health_potion_shop',
    item: {
      id: 'greater_health_potion',
      name: 'Greater Health Potion',
      description: 'A potent red elixir that restores significant health.',
      type: 'potion',
      rarity: 'uncommon',
      value: 75,
      effects: [
        { type: 'heal', value: 50 }
      ],
      stackable: true,
      quantity: 1,
      effectValue: 50
    },
    price: 100,
    stock: 10,
    category: 'potions',
    featured: false
  },
  {
    id: 'greater_mana_potion_shop',
    item: {
      id: 'greater_mana_potion',
      name: 'Greater Mana Potion',
      description: 'A concentrated blue elixir that restores substantial magical energy.',
      type: 'potion',
      rarity: 'uncommon',
      value: 85,
      effects: [
        { type: 'heal', value: 40 }
      ],
      stackable: true,
      quantity: 1,
      effectValue: 40
    },
    price: 110,
    stock: 8,
    category: 'potions',
    featured: false
  },
  {
    id: 'revive_potion_shop',
    item: {
      id: 'revive_potion',
      name: 'Revive Potion',
      description: 'A miraculous golden elixir that can bring the defeated back to life with 50% health.',
      type: 'potion',
      rarity: 'rare',
      value: 200,
      effects: [
        { type: 'heal', value: 0 }
      ],
      stackable: true,
      quantity: 1,
      effectValue: 0
    },
    price: 300,
    stock: 5,
    category: 'potions',
    featured: true
  },
  {
    id: 'strength_elixir_shop',
    item: {
      id: 'strength_elixir',
      name: 'Elixir of Strength',
      description: 'A golden potion that temporarily enhances physical power.',
      type: 'potion',
      rarity: 'rare',
      value: 150,
      effects: [
        { type: 'buff', value: 5, duration: 300 }
      ],
      stackable: true,
      quantity: 1,
      effectValue: 5
    },
    price: 200,
    stock: 3,
    category: 'potions',
    featured: true
  }
];