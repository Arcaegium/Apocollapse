// ============================================================
// WEAPON PROFILES — modular, one entry per weapon
// Adding a new weapon: add entry here, reference in avatars.js
// ============================================================
const WEAPONS = {

  shotgun: {
    name: 'Shotgun',
    desc: 'Wide spread, devastating up close',
    pellets: 5,
    spread: 0.45,       // total arc in radians
    range: 155,         // effective range in px
    damage: 1.1,
    fireRate: 26,       // frames between shots
    bulletSpeed: 6.5,
    bulletSize: 3,
    pierce: false,
    homing: 0,
    color: '#88ff44',
  },

  railCannon: {
    name: 'Rail Cannon',
    desc: 'Piercing single shot, infinite range',
    pellets: 1,
    spread: 0,
    range: 999,
    damage: 4.0,
    fireRate: 48,
    bulletSpeed: 16,
    bulletSize: 5,
    pierce: true,
    homing: 0,
    color: '#44ccff',
  },

  pulseEmitter: {
    name: 'Pulse Emitter',
    desc: 'Homing pulses, rapid fire',
    pellets: 2,
    spread: 0.15,
    range: 240,
    damage: 0.85,
    fireRate: 13,
    bulletSpeed: 4.5,
    bulletSize: 4,
    pierce: false,
    homing: 0.055,
    color: '#aa88ff',
  },

  assaultRifle: {
    name: 'Assault Rifle',
    desc: 'Reliable, fast, consistent',
    pellets: 1,
    spread: 0.10,
    range: 290,
    damage: 1.0,
    fireRate: 9,
    bulletSpeed: 10,
    bulletSize: 3,
    pierce: false,
    homing: 0,
    color: '#ffcc44',
  },

};
