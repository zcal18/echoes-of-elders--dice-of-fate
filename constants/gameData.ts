import { Race, Class, Spell } from '@/types/game';

export const races: Race[] = [
  {
    id: 'human',
    name: 'Human',
    description: 'Versatile and adaptable, humans excel in all areas.',
    statBonuses: {
      strength: 1,
      dexterity: 1,
      constitution: 1,
      intelligence: 1,
      wisdom: 1,
      charisma: 1
    },
    abilities: ['Versatility', 'Extra Skill Point'],
    lore: 'Humans are the most adaptable and ambitious people among the common races. They have widely varying tastes, morals, and customs in the many different lands where they have settled.'
  },
  {
    id: 'elf',
    name: 'Elf',
    description: 'Graceful and magical, elves are masters of arcane arts.',
    statBonuses: {
      dexterity: 2,
      intelligence: 2,
      wisdom: 1
    },
    abilities: ['Keen Senses', 'Fey Ancestry', 'Trance'],
    lore: 'Elves are a magical people of otherworldly grace, living in places of ethereal beauty, in the midst of ancient forests or in silvery spires glittering with faerie light.'
  },
  {
    id: 'dwarf',
    name: 'Dwarf',
    description: 'Hardy and resilient, dwarves are natural warriors and craftsmen.',
    statBonuses: {
      constitution: 2,
      strength: 2,
      wisdom: 1
    },
    abilities: ['Darkvision', 'Dwarven Resilience', 'Stonecunning'],
    lore: 'Bold and hardy, dwarves are known as skilled warriors, miners, and workers of stone and metal. Though they stand well under 5 feet tall, dwarves are so broad and compact that they can weigh as much as a human.'
  },
  {
    id: 'halfling',
    name: 'Halfling',
    description: 'Small but brave, halflings are naturally lucky and nimble.',
    statBonuses: {
      dexterity: 2,
      charisma: 1,
      luck: 2
    },
    abilities: ['Lucky', 'Brave', 'Halfling Nimbleness'],
    lore: 'The diminutive halflings survive in a world full of larger creatures by avoiding notice or, barring that, avoiding offense. They are inclined to be stout, weighing between 40 and 45 pounds.'
  },
  {
    id: 'orc',
    name: 'Orc',
    description: 'Fierce and strong, orcs are natural warriors with savage instincts.',
    statBonuses: {
      strength: 3,
      constitution: 2
    },
    abilities: ['Savage Attacks', 'Relentless Endurance', 'Darkvision'],
    lore: 'Orcs are savage raiders and pillagers with stooped postures, low foreheads, and piggish faces with prominent lower canines that resemble tusks.'
  },
  {
    id: 'tiefling',
    name: 'Tiefling',
    description: 'Touched by infernal heritage, tieflings possess innate magical abilities.',
    statBonuses: {
      intelligence: 1,
      charisma: 2,
      wisdom: 1
    },
    abilities: ['Darkvision', 'Hellish Resistance', 'Infernal Legacy'],
    lore: 'To be greeted with stares and whispers, to suffer violence and insult on the street, to see mistrust and fear in every eye: this is the lot of the tiefling.'
  },
  {
    id: 'gnome',
    name: 'Gnome',
    description: 'Clever and inventive, gnomes are natural tinkerers with a knack for magic.',
    statBonuses: {
      intelligence: 2,
      dexterity: 1,
      charisma: 1
    },
    abilities: ['Gnome Cunning', 'Tinker', 'Darkvision'],
    lore: 'Gnomes are small, inquisitive folk with an affinity for invention and illusion. Their boundless energy often leads them to create whimsical devices.'
  },
  {
    id: 'dragonborn',
    name: 'Dragonborn',
    description: 'Proud descendants of dragons, dragonborn possess elemental breath weapons.',
    statBonuses: {
      strength: 2,
      charisma: 1,
      constitution: 1
    },
    abilities: ['Draconic Ancestry', 'Breath Weapon', 'Damage Resistance'],
    lore: 'Dragonborn bear the blood of ancient dragons, their scales and breath a testament to their mighty heritage.'
  },
  {
    id: 'aasimar',
    name: 'Aasimar',
    description: 'Blessed with celestial heritage, aasimar are radiant beings with divine powers.',
    statBonuses: {
      wisdom: 2,
      charisma: 1,
      intelligence: 1
    },
    abilities: ['Celestial Resistance', 'Healing Hands', 'Light Bearer'],
    lore: 'Aasimar are touched by the divine, often serving as champions of good with an otherworldly presence.'
  },
  {
    id: 'custom',
    name: 'Custom Race',
    description: 'Create your own unique race with custom traits and abilities.',
    statBonuses: {},
    abilities: ['Custom Trait 1', 'Custom Trait 2'],
    lore: 'A unique race of your own design, shaped by your imagination and tailored to your story.'
  }
];

export const classes: Class[] = [
  {
    id: 'warrior',
    name: 'Warrior',
    description: 'Masters of combat, warriors excel in melee battle.',
    primaryStat: 'strength',
    abilities: ['Second Wind', 'Action Surge', 'Fighting Style'],
    startingEquipment: ['Iron Sword', 'Leather Armor', 'Shield'],
    lore: 'Warriors are masters of martial combat, skilled with a variety of weapons and armor. They are well acquainted with death, both meting it out and staring it defiantly in the face.'
  },
  {
    id: 'mage',
    name: 'Mage',
    description: 'Wielders of arcane magic, mages cast powerful spells.',
    primaryStat: 'intelligence',
    abilities: ['Spellcasting', 'Arcane Recovery', 'Ritual Casting'],
    startingEquipment: ['Wooden Staff', 'Robes', 'Spellbook'],
    lore: 'Mages are supreme magic-users, defined and united as a class by the spells they cast. Drawing on the subtle weave of magic that permeates the cosmos, mages cast spells of explosive fire, arcing lightning, subtle deception, and brute-force mind control.'
  },
  {
    id: 'rogue',
    name: 'Rogue',
    description: 'Stealthy and cunning, rogues strike from the shadows.',
    primaryStat: 'dexterity',
    abilities: ['Sneak Attack', 'Thieves Cant', 'Cunning Action'],
    startingEquipment: ['Dagger', 'Leather Armor', 'Thieves Tools'],
    lore: 'Rogues rely on skill, stealth, and their foes vulnerabilities to get the upper hand in any situation. They have a knack for finding the solution to just about any problem, demonstrating a resourcefulness and versatility that is the cornerstone of any successful adventuring party.'
  },
  {
    id: 'cleric',
    name: 'Cleric',
    description: 'Divine spellcasters who heal allies and smite foes.',
    primaryStat: 'wisdom',
    abilities: ['Spellcasting', 'Divine Domain', 'Channel Divinity'],
    startingEquipment: ['Mace', 'Scale Mail', 'Shield', 'Holy Symbol'],
    lore: 'Clerics are intermediaries between the mortal world and the distant planes of the gods. As varied as the gods they serve, clerics strive to embody the handiwork of their deities.'
  },
  {
    id: 'ranger',
    name: 'Ranger',
    description: 'Nature warriors who excel at tracking and archery.',
    primaryStat: 'dexterity',
    abilities: ['Favored Enemy', 'Natural Explorer', 'Spellcasting'],
    startingEquipment: ['Longbow', 'Studded Leather', 'Arrows'],
    lore: 'Rangers are warriors of the wilderness, hunters who seek out the most dangerous monsters and deadliest terrain. They are masters of tracking, survival, and combat in the wild places of the world.'
  },
  {
    id: 'paladin',
    name: 'Paladin',
    description: 'Holy warriors who combine martial prowess with divine magic.',
    primaryStat: 'strength',
    abilities: ['Divine Sense', 'Lay on Hands', 'Spellcasting'],
    startingEquipment: ['Longsword', 'Chain Mail', 'Shield', 'Holy Symbol'],
    lore: 'Paladins swear to uphold justice and righteousness, to stand with the good things of the world against the encroaching darkness, and to hunt the forces of evil wherever they lurk.'
  },
  {
    id: 'necromancer',
    name: 'Necromancer',
    description: 'Dark mages who command death and undeath.',
    primaryStat: 'intelligence',
    abilities: ['Undead Mastery', 'Life Drain', 'Soul Harvest'],
    startingEquipment: ['Bone Staff', 'Dark Robes', 'Grimoire'],
    lore: 'Necromancers walk the thin line between life and death, wielding forbidden magic to command the undead and manipulate the very essence of mortality.'
  },
  {
    id: 'druid',
    name: 'Druid',
    description: 'Nature priests who can shapeshift and control elements.',
    primaryStat: 'wisdom',
    abilities: ['Wild Shape', 'Nature Magic', 'Animal Companion'],
    startingEquipment: ['Wooden Shield', 'Leather Armor', 'Druidcraft Focus'],
    lore: 'Druids are guardians of the natural world, drawing power from nature itself to protect the balance between civilization and the wild.'
  },
  {
    id: 'monk',
    name: 'Monk',
    description: 'Martial artists who harness inner energy for combat.',
    primaryStat: 'dexterity',
    abilities: ['Martial Arts', 'Ki Points', 'Unarmored Defense'],
    startingEquipment: ['Quarterstaff', 'Simple Robes', 'Meditation Beads'],
    lore: 'Monks are masters of martial arts, harnessing the power of ki to perform superhuman feats and achieve perfect harmony between mind and body.'
  },
  {
    id: 'bard',
    name: 'Bard',
    description: 'Charismatic performers who weave magic through music.',
    primaryStat: 'charisma',
    abilities: ['Bardic Inspiration', 'Song Magic', 'Jack of All Trades'],
    startingEquipment: ['Lute', 'Leather Armor', 'Rapier'],
    lore: 'Bards are masters of song, speech, and the magic they contain. They are storytellers whose tales can inspire allies and demoralize foes.'
  },
  {
    id: 'warlock',
    name: 'Warlock',
    description: 'Pact-bound spellcasters who draw power from otherworldly beings.',
    primaryStat: 'charisma',
    abilities: ['Eldritch Blast', 'Pact Magic', 'Otherworldly Patron'],
    startingEquipment: ['Simple Weapon', 'Leather Armor', 'Arcane Focus'],
    lore: 'Warlocks are seekers of forbidden knowledge who make pacts with extraplanar beings to gain magical power at a terrible price.'
  },
  {
    id: 'artificer',
    name: 'Artificer',
    description: 'Magical inventors who infuse items with arcane power.',
    primaryStat: 'intelligence',
    abilities: ['Magical Tinkering', 'Infuse Item', 'Tool Expertise'],
    startingEquipment: ['Light Crossbow', 'Studded Leather', 'Thieves Tools'],
    lore: 'Artificers are masters of invention and innovation, using magic to create wondrous devices and enhance mundane items with extraordinary properties.'
  },
  {
    id: 'bloodhunter',
    name: 'Blood Hunter',
    description: 'Warriors who use their own life force to fuel dark magic.',
    primaryStat: 'strength',
    abilities: ['Blood Curse', 'Crimson Rite', 'Hunter\'s Bane'],
    startingEquipment: ['Martial Weapon', 'Studded Leather', 'Hunter\'s Kit'],
    lore: 'Blood Hunters are warriors who sacrifice their own vitality to gain power over the supernatural, hunting monsters with techniques as dark as their quarry.'
  },
  {
    id: 'custom',
    name: 'Custom Class',
    description: 'Create your own unique class with custom abilities.',
    primaryStat: 'strength',
    abilities: ['Custom Ability 1', 'Custom Ability 2', 'Custom Ability 3'],
    startingEquipment: ['Basic Weapon', 'Simple Armor'],
    lore: 'A unique class of your own design, forged from your imagination and tailored to your playstyle.',
    isCustom: true
  }
];

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

// Familiar types for summoning
export const familiarTypes = [
  {
    type: 'sprite',
    name: 'Forest Sprite',
    icon: '🧚',
    description: 'A tiny magical being that provides healing and support.',
    levelRequirement: 1,
    cost: 50,
    abilities: ['Healing Aura', 'Nature Magic']
  },
  {
    type: 'raven',
    name: 'Shadow Raven',
    icon: '🐦‍⬛',
    description: 'An intelligent bird that scouts and provides reconnaissance.',
    levelRequirement: 5,
    cost: 75,
    abilities: ['Scouting', 'Message Delivery']
  },
  {
    type: 'wolf',
    name: 'Spirit Wolf',
    icon: '🐺',
    description: 'A loyal companion that fights alongside you in battle.',
    levelRequirement: 10,
    cost: 100,
    abilities: ['Pack Tactics', 'Fierce Loyalty']
  },
  {
    type: 'golem',
    name: 'Stone Golem',
    icon: '🗿',
    description: 'A magical construct that provides protection and strength.',
    levelRequirement: 15,
    cost: 150,
    abilities: ['Stone Skin', 'Guardian Shield']
  },
  {
    type: 'dragon',
    name: 'Young Dragon',
    icon: '🐉',
    description: 'A powerful draconic companion with elemental breath.',
    levelRequirement: 25,
    cost: 300,
    abilities: ['Breath Weapon', 'Dragon Fear']
  },
  {
    type: 'phoenix',
    name: 'Phoenix',
    icon: '🔥',
    description: 'A legendary firebird that can resurrect from ashes.',
    levelRequirement: 35,
    cost: 500,
    abilities: ['Rebirth', 'Flame Aura']
  }
];

// Re-export enemies from the new fragmented system
export { getAllEnemies, getEnemiesByLevel, getEnemiesByDifficulty } from './enemies';