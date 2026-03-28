import { Spell } from '@/types/game';

export const spells: Spell[] = [
  {
    id: 'fireball',
    name: 'Fireball',
    description: 'A bright streak flashes from your pointing finger to a point you choose, then blossoms with a low roar into an explosion of flame.',
    school: 'evocation',
    level: 3,
    manaCost: 15,
    castTime: 1,
    cooldown: 0,
    damage: { min: 15, max: 25 },
    range: 150,
    effects: [
      { type: 'damage', value: 20, duration: 0, element: 'fire' }
    ],
    requirements: {
      class: ['mage'],
      level: 5,
      intelligence: 13
    },
    lore: 'One of the most iconic spells in a mage\'s arsenal, Fireball has decided the fate of countless battles with its explosive power.'
  },
  {
    id: 'heal',
    name: 'Cure Wounds',
    description: 'A creature you touch regains hit points equal to the spell\'s healing power.',
    school: 'divine',
    level: 1,
    manaCost: 8,
    castTime: 1,
    cooldown: 0,
    damage: { min: 0, max: 0 },
    range: 5,
    effects: [
      { type: 'heal', value: 15, duration: 0 }
    ],
    requirements: {
      class: ['cleric'],
      level: 1,
      wisdom: 11
    },
    lore: 'A fundamental healing spell that channels divine energy to mend wounds and restore vitality to the injured.'
  },
  {
    id: 'magic_missile',
    name: 'Magic Missile',
    description: 'You create three glowing darts of magical force that automatically hit their target.',
    school: 'evocation',
    level: 1,
    manaCost: 5,
    castTime: 1,
    cooldown: 0,
    damage: { min: 8, max: 12 },
    range: 120,
    effects: [
      { type: 'damage', value: 10, duration: 0, element: 'force' }
    ],
    requirements: {
      class: ['mage'],
      level: 1,
      intelligence: 11
    },
    lore: 'A reliable spell that never misses its target, Magic Missile is often the first offensive spell learned by aspiring mages.'
  },
  {
    id: 'shield_of_faith',
    name: 'Shield of Faith',
    description: 'A shimmering field appears and surrounds a creature of your choice, granting protection.',
    school: 'divine',
    level: 1,
    manaCost: 6,
    castTime: 1,
    cooldown: 0,
    damage: { min: 0, max: 0 },
    range: 60,
    effects: [
      { type: 'buff', value: 2, duration: 10 }
    ],
    requirements: {
      class: ['cleric'],
      level: 1,
      wisdom: 11
    },
    lore: 'This divine blessing creates a protective barrier that deflects incoming attacks and bolsters the recipient\'s defenses.'
  },
  {
    id: 'frost_bolt',
    name: 'Frost Bolt',
    description: 'A shard of ice streaks toward a creature within range, dealing cold damage and slowing movement.',
    school: 'evocation',
    level: 2,
    manaCost: 10,
    castTime: 1,
    cooldown: 0,
    damage: { min: 10, max: 18 },
    range: 120,
    effects: [
      { type: 'damage', value: 14, duration: 0, element: 'cold' }
    ],
    requirements: {
      class: ['mage'],
      level: 3,
      intelligence: 12
    },
    lore: 'This spell harnesses the power of winter, creating projectiles of pure cold that can freeze enemies in their tracks.'
  },
  {
    id: 'divine_light',
    name: 'Divine Light',
    description: 'You call down a beam of radiant energy that heals allies and harms undead.',
    school: 'divine',
    level: 2,
    manaCost: 12,
    castTime: 1,
    cooldown: 0,
    damage: { min: 8, max: 16 },
    range: 60,
    effects: [
      { type: 'heal', value: 20, duration: 0 },
      { type: 'damage', value: 15, duration: 0, element: 'radiant' }
    ],
    requirements: {
      class: ['cleric'],
      level: 3,
      wisdom: 12
    },
    lore: 'A versatile spell that channels divine energy to heal the faithful while burning away the darkness of undeath.'
  },
  {
    id: 'lightning_bolt',
    name: 'Lightning Bolt',
    description: 'A stroke of lightning forming a line 100 feet long and 5 feet wide blasts out from you.',
    school: 'evocation',
    level: 3,
    manaCost: 18,
    castTime: 1,
    cooldown: 0,
    damage: { min: 20, max: 30 },
    range: 100,
    effects: [
      { type: 'damage', value: 25, duration: 0, element: 'lightning' }
    ],
    requirements: {
      class: ['mage'],
      level: 6,
      intelligence: 14
    },
    lore: 'One of the most destructive spells in existence, Lightning Bolt can devastate multiple enemies with the raw power of the storm.'
  },
  {
    id: 'greater_heal',
    name: 'Greater Heal',
    description: 'You channel powerful divine energy to restore a significant amount of health.',
    school: 'divine',
    level: 3,
    manaCost: 20,
    castTime: 1,
    cooldown: 0,
    damage: { min: 0, max: 0 },
    range: 30,
    effects: [
      { type: 'heal', value: 40, duration: 0 }
    ],
    requirements: {
      class: ['cleric'],
      level: 6,
      wisdom: 14
    },
    lore: 'An advanced healing spell that can mend even grievous wounds, often turning the tide of battle.'
  }
];