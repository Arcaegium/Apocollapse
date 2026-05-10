// ============================================================
// CONSTANTS — all tuning values live here
// Change a number here, nothing else needs to touch it
// ============================================================
const C = {
  // Canvas
  W: 640, H: 640,

  // Terrain
  TILE: 32,                   // tile size in px — map is W/TILE × H/TILE = 20×20
  TILES_X: 20, TILES_Y: 20,

  // Formation
  FORMATION_RADIUS: 40,       // distance from center to each avatar
  ROTATION_SPEED: 0.10,       // how fast formation tracks mouse (0-1)
  PLAYER_SPEED: 2.8,
  PLAYER_COLLISION_R: 10,     // formation center collision radius vs walls

  // Combat
  BULLET_BASE_DAMAGE: 1.0,    // weapon damage is multiplied by this
  ENEMY_BASE_SPEED: 0.9,
  ENEMY_BASE_HP: 3,
  ENEMY_COLLISION_R: 12,      // enemy collision radius
  KILL_RADIUS: 18,            // formation center = death if enemy reaches this

  // Sprites
  PIXEL: 2,                   // each sprite "pixel" = 2 canvas pixels
  SPRITE_SIZE: 16,            // sprites are 16×16

  // Spawn
  MAX_ENEMIES: 90,
  SPAWN_RATE_BASE: 85,        // frames between spawns at wave 1
  SPAWN_RATE_MIN: 22,         // fastest possible spawn rate
  SPAWN_BURST_CHANCE: 0.30,   // chance of double spawn on later waves

  // Wave
  WAVE_DURATION: 1800,        // frames per wave (~30s at 60fps)
  WAVE_TRANSITION: 180,       // frames of calm before break screen

  // Death animation
  DEATH_ANIM_FRAMES: 20,

  // Skills
  MAX_SKILL_SLOTS: 4,         // skills per avatar
  MAX_SKILL_LEVEL: 3,         // max level per skill
  DRAFT_OPTIONS: 3,           // cards shown per draft pick
  CROSS_TRAIN_CHANCE: 0.15,   // chance a draft option is from another avatar's pool

  // Progression
  SAVE_KEY: 'apocollapse-save',

  // Hazard
  HAZARD_TICK_FRAMES: 60,     // how often hazards apply their effect

  // Terrain generation
  WALL_DENSITY_BASE: 0.10,    // base % of tiles that are walls
  COVER_DENSITY_BASE: 0.08,   // base % of tiles that are cover
  HAZARD_DENSITY_BASE: 0.04,  // base % of tiles that are hazards
  DENSITY_PER_APOC: 0.02,     // additional density per extra active apocalypse
};
