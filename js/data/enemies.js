// ============================================================
// ENEMY BEHAVIOR PROFILES
// Each profile defines how that enemy type moves and acts.
// Behavior logic lives in systems/enemies.js — this is just data.
// Adding a new enemy type: add entry here, reference in apocalypses.js
// ============================================================
const ENEMY_BEHAVIORS = {

  zombie: {
    // Slow shambling swarm. Moves directly toward formation.
    // Strength in numbers — dangerous in large groups.
    movementType: 'swarm',
    baseSpeed: 0.9,
    baseHP: 3,
    collisionR: 12,
    // STUB: specific behavior params
    params: {
      wobbleAmount: 0.30,
      wobbleSpeed: 0.038,
      chargeThreshold: 0,   // always moving, no pause
    },
  },

  robot: {
    // Slow, tanky, marches in straight lines.
    // Doesn't wobble — moves mechanically. Hard to kill.
    movementType: 'march',
    baseSpeed: 0.7,
    baseHP: 5,
    collisionR: 13,
    params: {
      wobbleAmount: 0.05,   // barely any wobble — mechanical
      wobbleSpeed: 0.02,
      marchInterval: 40,    // STUB: pauses briefly then advances
    },
  },

  alien: {
    // Fast, flanking. Tries to approach from the side.
    // Avoids direct frontal approach.
    movementType: 'flank',
    baseSpeed: 1.2,
    baseHP: 3,
    collisionR: 11,
    params: {
      flankOffset: Math.PI / 2.5,  // STUB: angle offset from direct path
      wobbleAmount: 0.15,
      wobbleSpeed: 0.06,
    },
  },

  demon: {
    // Charges fast, then pauses briefly. Lunges at formation.
    // Dangerous because of burst movement — hard to predict.
    movementType: 'charge',
    baseSpeed: 1.5,
    baseHP: 4,
    collisionR: 12,
    params: {
      chargeFrames: 40,    // STUB: frames of fast movement
      pauseFrames: 30,     // STUB: frames of pause between charges
      chargeSpeed: 3.0,    // STUB: speed during charge
      wobbleAmount: 0.10,
      wobbleSpeed: 0.05,
    },
  },

  eldritch: {
    // Erratic, unpredictable. Direction changes randomly.
    // Individually weak but disorienting in groups.
    movementType: 'erratic',
    baseSpeed: 0.85,
    baseHP: 2,
    collisionR: 11,
    params: {
      directionChangeInterval: 45,  // STUB: frames between direction lurches
      lurchAmount: 1.2,              // STUB: how far the lurch deviates
      wobbleAmount: 0.50,
      wobbleSpeed: 0.08,
    },
  },

  mutant: {
    // Fast swarm. Like zombies but quicker and more chaotic.
    // Individually fragile but overwhelming in numbers.
    movementType: 'swarm',
    baseSpeed: 1.3,
    baseHP: 2,
    collisionR: 11,
    params: {
      wobbleAmount: 0.40,
      wobbleSpeed: 0.06,
    },
  },

};

// Helper
function getBehavior(enemyType) {
  return ENEMY_BEHAVIORS[enemyType] ?? ENEMY_BEHAVIORS.zombie;
}
