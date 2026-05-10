// ============================================================
// EFFECTIVENESS MATRIX
// 1.8=strong | 1.4=half-strong | 1.0=neutral | 0.6=half-weak | 0.5=weak
// Change any value here — no other file needs to change.
// Add a hero: new row. Add an apocalypse: new key per row.
// Missing combos default to 1.0 automatically.
// ============================================================
const EFFECTIVENESS = {
  rex:     { zombie:1.8, robot:1.0, alien:1.0, demon:1.4, eldritch:1.0, mutant:1.0, collapse:1.0, plague:0.6 },
  sable:   { zombie:1.0, robot:1.8, alien:0.6, demon:1.0, eldritch:1.0, mutant:0.5, collapse:1.4, plague:1.0 },
  yara:    { zombie:1.0, robot:1.4, alien:1.8, demon:0.5, eldritch:0.6, mutant:1.0, collapse:1.0, plague:1.0 },
  gage:    { zombie:1.0, robot:1.0, alien:0.6, demon:1.4, eldritch:1.0, mutant:1.8, collapse:0.5, plague:1.0 },
  malachy: { zombie:0.6, robot:1.0, alien:1.0, demon:1.8, eldritch:1.4, mutant:1.0, collapse:1.0, plague:0.5 },
  mara:    { zombie:1.0, robot:0.5, alien:1.0, demon:1.0, eldritch:1.8, mutant:0.6, collapse:1.0, plague:1.4 },
  patch:   { zombie:1.0, robot:1.0, alien:1.0, demon:1.0, eldritch:1.4, mutant:1.4, collapse:1.0, plague:1.8 },
  irina:   { zombie:0.5, robot:0.6, alien:1.0, demon:1.0, eldritch:1.0, mutant:1.0, collapse:1.8, plague:1.4 },
};

function getEffectiveness(heroId, apoc) {
  return (EFFECTIVENESS[heroId] ?? {})[apoc] ?? 1.0;
}

// ============================================================
// SKILL DEFINITIONS
// Each skill: id, name, maxLevel, tags, levelDescs[], effect (STUB)
// Adding a new skill: add entry to the avatar's skillPool below.
// ============================================================
const SKILL_DEFS = {

  // ── Rex skills ──
  biohazardRounds: {
    id: 'biohazardRounds', name: 'Biohazard Rounds',
    tags: ['damage', 'zombie'],
    levelDescs: [
      'Hits apply 3 damage over 3s to zombies',
      'Increases to 6 damage over 3s',
      'Increases to 10 damage over 3s, spreads on kill',
    ],
    // STUB: effect applied in combat.js on bullet hit
    effect: null,
  },
  hollowPoint: {
    id: 'hollowPoint', name: 'Hollow Point',
    tags: ['range', 'shotgun'],
    levelDescs: [
      'Shotgun range +20%',
      'Shotgun range +40%',
      'Shotgun range +60%, no damage falloff',
    ],
    effect: null,
  },
  adrenaline: {
    id: 'adrenaline', name: 'Adrenaline',
    tags: ['speed', 'kill'],
    levelDescs: [
      'Zombie kill: +8% speed for 3s',
      'Zombie kill: +12% speed for 4s',
      'Zombie kill: +18% speed for 5s, stacks',
    ],
    effect: null,
  },
  triage: {
    id: 'triage', name: 'Triage',
    tags: ['support', 'heal'],
    levelDescs: [
      'Squad heals 0.5 HP/s when no enemies within 120px',
      'Heals 1 HP/s',
      'Heals 1.5 HP/s, radius increases to 160px',
    ],
    effect: null,
  },
  crowdBreaker: {
    id: 'crowdBreaker', name: 'Crowd Breaker',
    tags: ['damage', 'aoe'],
    levelDescs: [
      'Pellet hits have 25% chance to damage adjacent enemy',
      'Chance increases to 40%',
      'Guaranteed spread, 40% damage to adjacent',
    ],
    effect: null,
  },
  lastStand: {
    id: 'lastStand', name: 'Last Stand',
    tags: ['survival', 'fire rate'],
    levelDescs: [
      'Below 30% HP: Rex fire rate +50% for 5s',
      'Effect lasts 8s',
      'Effect lasts 12s, also boosts adjacent avatar',
    ],
    effect: null,
  },

  // ── SABLE skills ──
  armorPiercing: {
    id: 'armorPiercing', name: 'Armor Piercing',
    tags: ['damage', 'pierce'],
    levelDescs: [
      'Pierce damage reduction halved (80% per target)',
      'No pierce damage reduction',
      'Pierce shots gain +20% damage per enemy hit',
    ],
    effect: null,
  },
  overcharge: {
    id: 'overcharge', name: 'Overcharge',
    tags: ['damage', 'burst'],
    levelDescs: [
      'Every 5th shot deals 2x damage',
      'Every 4th shot deals 3x damage',
      'Every 3rd shot deals 4x damage, visual charge effect',
    ],
    effect: null,
  },
  targetingSystem: {
    id: 'targetingSystem', name: 'Targeting System',
    tags: ['accuracy', 'robot'],
    levelDescs: [
      'Rail shot auto-corrects up to 8 degrees toward nearest target',
      'Corrects up to 16 degrees',
      'Corrects up to 24 degrees, prioritizes robots',
    ],
    effect: null,
  },
  empResidue: {
    id: 'empResidue', name: 'EMP Residue',
    tags: ['control', 'robot'],
    levelDescs: [
      'Rail hit leaves 2s static field, slows enemies 20%',
      'Slow increases to 35%',
      'Field lasts 4s, slow 50%, damages robots over time',
    ],
    effect: null,
  },
  salvage: {
    id: 'salvage', name: 'Salvage',
    tags: ['support', 'buff'],
    levelDescs: [
      'Robot kills drop scrap: squad +5% damage for 8s',
      'Squad +10% damage for 10s',
      'Squad +15% damage for 12s, stacks',
    ],
    effect: null,
  },
  coldLogic: {
    id: 'coldLogic', name: 'Cold Logic',
    tags: ['fire rate', 'tradeoff'],
    levelDescs: [
      'SABLE ignores formation speed buffs, gains +10% fire rate',
      '+20% fire rate',
      '+30% fire rate, immune to slows',
    ],
    effect: null,
  },

  // ── Yara skills ──
  resonance: {
    id: 'resonance', name: 'Resonance',
    tags: ['damage', 'chain'],
    levelDescs: [
      'Pulse hits chain to nearest enemy for 40% damage',
      'Chain damage 60%',
      'Chain damage 80%, can chain twice',
    ],
    effect: null,
  },
  phaseShift: {
    id: 'phaseShift', name: 'Phase Shift',
    tags: ['utility', 'terrain'],
    levelDescs: [
      'Every 8th pulse passes through walls',
      'Every 6th pulse',
      'Every 4th pulse, wall-pass pulses deal +30% damage',
    ],
    effect: null,
  },
  xenopathy: {
    id: 'xenopathy', name: 'Xenopathy',
    tags: ['control', 'alien'],
    levelDescs: [
      'Pacify ability radius +20%, confused aliens attack others',
      'Radius +40%',
      'Radius +60%, confused aliens fight for 4s',
    ],
    effect: null,
  },
  adaptation: {
    id: 'adaptation', name: 'Adaptation',
    tags: ['damage', 'scaling'],
    levelDescs: [
      'Each different enemy type killed this wave: +3% damage',
      '+5% per type',
      '+8% per type, bonus resets more slowly',
    ],
    effect: null,
  },
  pulseOverload: {
    id: 'pulseOverload', name: 'Pulse Overload',
    tags: ['burst', 'damage'],
    levelDescs: [
      'Hold fire 1.5s: release burst dealing 3x damage in radius',
      'Burst damage 4x',
      'Burst damage 5x, radius increases',
    ],
    effect: null,
  },
  signalJam: {
    id: 'signalJam', name: 'Signal Jam',
    tags: ['control', 'slow'],
    levelDescs: [
      'Pulse hits slow enemies 5% for 2s',
      'Slow 10%',
      'Slow 15%, stacks up to 3 times',
    ],
    effect: null,
  },

  // ── Gage skills ──
  scavenger: {
    id: 'scavenger', name: 'Scavenger',
    tags: ['support', 'buff'],
    levelDescs: [
      '10% chance: enemy kill drops ammo crate, squad +15% fire rate 8s',
      'Chance 20%',
      'Chance 30%, buff lasts 12s',
    ],
    effect: null,
  },
  suppressiveFire: {
    id: 'suppressiveFire', name: 'Suppressive Fire',
    tags: ['control', 'slow'],
    levelDescs: [
      'Sustained fire on same target: 5% slow per hit (max 30%)',
      'Max slow 40%',
      'Max slow 50%, slow lingers 1s after switching targets',
    ],
    effect: null,
  },
  fortify: {
    id: 'fortify', name: 'Fortify',
    tags: ['support', 'defense'],
    levelDescs: [
      'Gage\'s aura: adjacent avatars take 5% less damage',
      '10% reduction',
      '15% reduction, radius slightly increases',
    ],
    effect: null,
  },
  fieldMedic: {
    id: 'fieldMedic', name: 'Field Medic',
    tags: ['support', 'heal'],
    levelDescs: [
      'Every 8s: toss medkit to lowest-HP avatar, heals 15%',
      'Every 6s, heals 20%',
      'Every 4s, heals 25%, can target self',
    ],
    effect: null,
  },
  doubleTap: {
    id: 'doubleTap', name: 'Double Tap',
    tags: ['damage', 'fire rate'],
    levelDescs: [
      '20% chance: shot fires a second bullet free',
      'Chance 35%',
      'Chance 50%, second bullet deals full damage',
    ],
    effect: null,
  },
  tacticalRetreat: {
    id: 'tacticalRetreat', name: 'Tactical Retreat',
    tags: ['mobility', 'fire rate'],
    levelDescs: [
      'Moving away from enemies: +10% fire rate',
      '+20% fire rate',
      '+30% fire rate, also +10% move speed',
    ],
    effect: null,
  },

};

// ============================================================
// AVATAR CONFIG
// recruitedAt: wave threshold at which this avatar can be recruited
// (null = starting avatar, chosen at character select)
// ============================================================
const AVATAR_CONFIG = [
  {
    id: 'rex',
    sprite: 'rex',
    name: 'Rex Harlan',
    shortName: 'Rex',
    focus: 'zombie',
    weapon: 'shotgun',
    bulletColor: '#88ff44',
    bio: 'Former CDC field agent. Has seen every outbreak. Methodical, never panics.',
    skillPool: ['biohazardRounds','hollowPoint','adrenaline','triage','crowdBreaker','lastStand'],
    activeAbility: { name: 'Biohazard Grenade', desc: 'Slows enemies in radius for 3s', cooldown: 300 },
    recruitedAt: null, // starter avatar (selectable)
    unlocked: true,
  },
  {
    id: 'sable',
    sprite: 'sable',
    name: 'SABLE-7',
    shortName: 'SABLE',
    focus: 'robot',
    weapon: 'railCannon',
    bulletColor: '#44ccff',
    bio: 'Rogue military AI in a human chassis. Cold, precise, efficient.',
    skillPool: ['armorPiercing','overcharge','targetingSystem','empResidue','salvage','coldLogic'],
    activeAbility: { name: 'EMP Burst', desc: 'Stuns all mechanical enemies for 2s', cooldown: 360 },
    recruitedAt: null,
    unlocked: true,
  },
  {
    id: 'yara',
    sprite: 'yara',
    name: 'Dr. Yara Osei',
    shortName: 'Yara',
    focus: 'alien',
    weapon: 'pulseEmitter',
    bulletColor: '#aa88ff',
    bio: 'Xenobiologist who made first contact and survived. Curious, adaptive.',
    skillPool: ['resonance','phaseShift','xenopathy','adaptation','pulseOverload','signalJam'],
    activeAbility: { name: 'Pacify Signal', desc: 'Confuses nearby aliens, turns them on each other', cooldown: 420 },
    recruitedAt: null,
    unlocked: true,
  },
  {
    id: 'gage',
    sprite: 'gage',
    name: 'Gage',
    shortName: 'Gage',
    focus: 'collapse',
    weapon: 'assaultRifle',
    bulletColor: '#ffcc44',
    bio: 'Road warrior survivor. Ruthless, resourceful, knows how people think.',
    skillPool: ['scavenger','suppressiveFire','fortify','fieldMedic','doubleTap','tacticalRetreat'],
    activeAbility: { name: 'Suppressing Fire', desc: 'Pushes all enemies outward from formation', cooldown: 240 },
    recruitedAt: null,
    unlocked: true,
  },
  // Future avatars — unlocked through gameplay
  // { id: 'malachy', ..., recruitedAt: 3, unlocked: false },
  // { id: 'mara',    ..., recruitedAt: 4, unlocked: false },
  // { id: 'patch',   ..., recruitedAt: 5, unlocked: false },
  // { id: 'irina',   ..., recruitedAt: 6, unlocked: false },
];

// Formation slot angles — relative to facing direction
// Slot 0 = front, 1 = right, 2 = back, 3 = left
const SLOT_ANGLES = [0, Math.PI/2, Math.PI, -Math.PI/2];
