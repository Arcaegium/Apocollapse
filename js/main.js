// ============================================================
// MAIN — game loop, state init, input, entry point
// ============================================================

let animId = null;

// ── State factory ─────────────────────────────────────────────

function createState() {
  return {
    phase: 'TITLE',   // TITLE | PLAYING | BREAK | DEAD
    frame: 0,

    formation: { x: C.W / 2, y: C.H / 2, rotation: 0 },

    avatars: AVATAR_CONFIG
      .filter(cfg => cfg.unlocked)
      .slice(0, 4)
      .map((cfg, i) => ({
        ...buildAvatarRunState(cfg),
        fireTimer: Math.floor(i * (WEAPONS[cfg.weapon].fireRate / 4)),
      })),

    selectedAbility: 0,

    bullets:      [],
    enemies:      [],
    dyingEnemies: [],
    particles:    [],

    spawnTimer: 0,
    wave: 1,
    waveTimer: 0,
    waveKills: 0,
    activeApocs: ['zombie'],
    waveState: 'FIGHTING',   // FIGHTING | TRANSITION | BREAK

    score: 0,
    kills: 0,

    keys: {},
    keysJustPressed: {},

    waveAnnounceTimer: 0,
  };
}

// ── Game lifecycle ────────────────────────────────────────────

function startGame(STATE) {
  // Reset run state but keep reference
  const fresh = createState();
  Object.assign(STATE, fresh);
  STATE.phase = 'PLAYING';
  STATE.activeApocs = getApocSequence(1);

  generateMap(STATE.activeApocs);
  buildAbilityBar(STATE);
  updateApocBanner(STATE);
  updateHUD(STATE);
  announceWave(STATE);

  window._gameState = STATE;

  if (animId) cancelAnimationFrame(animId);
  gameLoop(STATE);
}

function resumeGame(STATE) {
  STATE.phase = 'PLAYING';
  buildAbilityBar(STATE);
  if (animId) cancelAnimationFrame(animId);
  gameLoop(STATE);
}

function triggerDeath(STATE) {
  STATE.phase = 'DEAD';
  cancelAnimationFrame(animId);
  animId = null;
  showGameOverScreen(STATE);
}

// ── Game loop ─────────────────────────────────────────────────

function gameLoop(STATE) {
  if (STATE.phase !== 'PLAYING') return;
  STATE.frame++;

  // Input
  processInput(STATE);

  // Systems
  updateFormation(STATE);
  updateShooting(STATE);
  updateBullets(STATE);
  updateEnemies(STATE);
  checkCollisions(STATE);
  updateParticles(STATE);
  updateCooldowns(STATE);
  updateWave(STATE);
  updateWaveAnnounce(STATE);
  updateEffectFlash();

  // UI
  updateAbilityBar(STATE);

  // Render
  render(STATE);

  animId = requestAnimationFrame(() => gameLoop(STATE));
}

// ── Input ─────────────────────────────────────────────────────

function setupInput(STATE) {
  window.addEventListener('keydown', e => {
    if (!STATE.keys[e.key]) STATE.keysJustPressed[e.key] = true;
    STATE.keys[e.key] = true;
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) {
      e.preventDefault();
    }
  });
  window.addEventListener('keyup', e => {
    STATE.keys[e.key] = false;
  });

  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    STATE.selectedAbility = (STATE.selectedAbility + (e.deltaY > 0 ? 1 : 3)) % STATE.avatars.length;
  }, { passive: false });
}

function processInput(STATE) {
  const kjp = STATE.keysJustPressed;

  // 1-4 keys — select ability slot
  for (let i = 1; i <= STATE.avatars.length; i++) {
    if (kjp[String(i)]) STATE.selectedAbility = i - 1;
  }

  // Spacebar — trigger selected ability
  if (kjp[' ']) triggerAbility(STATE);

  STATE.keysJustPressed = {};
}

// ── Break screen bridge ───────────────────────────────────────
// Break screen needs STATE but is driven by onclick in HTML
// We stash STATE on window during break so the screen can reach it

function showBreakScreen(STATE) {
  STATE.phase = 'BREAK';
  cancelAnimationFrame(animId);
  animId = null;
  window._breakState = STATE;

  const el = document.getElementById('screenBreak');
  el.style.display = 'flex';

  // Delegate to breakscreen.js
  breakAvatarIndex = 0;
  showAvatarDraft(STATE, 0);
}

// ── Entry point ───────────────────────────────────────────────

(function init() {
  buildSpriteCache();

  const STATE = createState();
  window._gameState = STATE;

  setupInput(STATE);
  setupMouseTracking();
  showTitleScreen(STATE);
})();
