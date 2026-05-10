// ============================================================
// ENEMY SYSTEM
// Spawn logic, AI movement, behavior dispatch
// ============================================================

function spawnEnemy(STATE) {
  if (STATE.enemies.length >= C.MAX_ENEMIES) return;

  const apocKey = STATE.activeApocs[Math.floor(Math.random() * STATE.activeApocs.length)];
  const apocData = getApoc(apocKey);
  const behavior = getBehavior(apocData.enemyType);
  const wave = STATE.wave;

  // Spawn from edges
  let x, y;
  const side = Math.floor(Math.random() * 4);
  const m = C.TILE + 4;
  if (side === 0)      { x = Math.random() * C.W; y = m; }
  else if (side === 1) { x = C.W - m; y = Math.random() * C.H; }
  else if (side === 2) { x = Math.random() * C.W; y = C.H - m; }
  else                 { x = m; y = Math.random() * C.H; }

  // Push spawn point to nearest walkable tile
  if (!isWalkable(x, y)) {
    x = Math.max(m, Math.min(C.W - m, x));
    y = Math.max(m, Math.min(C.H - m, y));
  }

  const speedScale = 1 + (wave - 1) * 0.10;
  const hpScale    = 1 + (wave - 1) * 0.15;

  STATE.enemies.push({
    x, y,
    apoc: apocKey,
    sprite: apocData.enemyType,
    hp:    Math.ceil(behavior.baseHP  * apocData.hpMult    * hpScale),
    maxHp: Math.ceil(behavior.baseHP  * apocData.hpMult    * hpScale),
    speed:           behavior.baseSpeed * apocData.speedMult * speedScale,
    flashTimer: 0,
    animPhase: Math.random() * Math.PI * 2,
    behaviorType: apocData.enemyType,

    // Behavior state — used by movement AI
    behaviorState: 'move',   // move | pause | charge
    behaviorTimer: 0,
    lurchAngle: 0,
  });
}

// ── Enemy update ─────────────────────────────────────────────

function updateEnemies(STATE) {
  const fx = STATE.formation.x, fy = STATE.formation.y;

  STATE.enemies.forEach(en => {
    en.animPhase += 0.14;
    if (en.flashTimer > 0) en.flashTimer--;

    // Dispatch to behavior-specific movement
    switch (en.behaviorType) {
      case 'zombie':   moveSwarm(en, fx, fy);    break;
      case 'robot':    moveMarch(en, fx, fy);    break;
      case 'alien':    moveFlank(en, fx, fy);    break;
      case 'demon':    moveCharge(en, fx, fy);   break;
      case 'eldritch': moveErratic(en, fx, fy);  break;
      case 'mutant':   moveSwarm(en, fx, fy);    break;
      default:         moveSwarm(en, fx, fy);    break;
    }

    // Terrain collision — resolve movement
    if (!isWalkable(en.x, en.y)) {
      // Push out of wall — find nearest walkable direction
      const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
      for (const [ddx, ddy] of dirs) {
        const nx = en.x + ddx * C.TILE;
        const ny = en.y + ddy * C.TILE;
        if (isWalkable(nx, ny)) { en.x = nx; en.y = ny; break; }
      }
    }
  });

  // Update dying enemies
  STATE.dyingEnemies = STATE.dyingEnemies.filter(de => {
    de.frame++;
    de.x += de.vx; de.y += de.vy;
    de.rotation += de.rotSpeed;
    de.scale = Math.max(0, 1 - (de.frame / C.DEATH_ANIM_FRAMES));
    return de.frame < C.DEATH_ANIM_FRAMES;
  });
}

// ── Movement behaviors ────────────────────────────────────────

// Swarm — direct approach with wobble (zombies, mutants)
function moveSwarm(en, fx, fy) {
  const behavior = getBehavior(en.behaviorType);
  const p = behavior.params;
  en.behaviorTimer += p.wobbleSpeed;

  const dx = fx - en.x, dy = fy - en.y;
  const dist = Math.hypot(dx, dy);
  if (dist > 1) {
    en.x += (dx / dist) * en.speed + Math.cos(en.behaviorTimer) * p.wobbleAmount;
    en.y += (dy / dist) * en.speed + Math.sin(en.behaviorTimer * 1.3) * p.wobbleAmount;
  }
}

// March — mechanical, minimal wobble (robots)
function moveMarch(en, fx, fy) {
  const behavior = getBehavior(en.behaviorType);
  const p = behavior.params;

  if (en.behaviorState === 'pause') {
    en.behaviorTimer--;
    if (en.behaviorTimer <= 0) {
      en.behaviorState = 'move';
      en.behaviorTimer = p.marchInterval;
    }
    return;
  }

  const dx = fx - en.x, dy = fy - en.y;
  const dist = Math.hypot(dx, dy);
  if (dist > 1) {
    en.x += (dx / dist) * en.speed;
    en.y += (dy / dist) * en.speed;
  }

  en.behaviorTimer--;
  if (en.behaviorTimer <= 0) {
    en.behaviorState = 'pause';
    en.behaviorTimer = Math.floor(p.marchInterval * 0.5);
  }
}

// Flank — approaches from the side (aliens)
function moveFlank(en, fx, fy) {
  const behavior = getBehavior(en.behaviorType);
  const p = behavior.params;
  en.behaviorTimer += p.wobbleSpeed;

  const directAngle = Math.atan2(fy - en.y, fx - en.x);
  // Offset approach angle — flank from the side
  const flankAngle = directAngle + p.flankOffset * Math.sin(en.behaviorTimer * 0.5);
  const dist = Math.hypot(fx - en.x, fy - en.y);

  if (dist > 1) {
    en.x += Math.cos(flankAngle) * en.speed;
    en.y += Math.sin(flankAngle) * en.speed;
  }
}

// Charge — burst then pause (demons)
function moveCharge(en, fx, fy) {
  const behavior = getBehavior(en.behaviorType);
  const p = behavior.params;

  if (en.behaviorState === 'pause') {
    en.behaviorTimer--;
    if (en.behaviorTimer <= 0) {
      en.behaviorState = 'charge';
      en.behaviorTimer = p.chargeFrames;
      // Lock charge direction toward formation
      en.lurchAngle = Math.atan2(fy - en.y, fx - en.x);
    }
    return;
  }

  // Charging
  en.x += Math.cos(en.lurchAngle) * p.chargeSpeed;
  en.y += Math.sin(en.lurchAngle) * p.chargeSpeed;
  en.behaviorTimer--;

  if (en.behaviorTimer <= 0) {
    en.behaviorState = 'pause';
    en.behaviorTimer = p.pauseFrames;
  }
}

// Erratic — random lurches (eldritch)
function moveErratic(en, fx, fy) {
  const behavior = getBehavior(en.behaviorType);
  const p = behavior.params;

  en.behaviorTimer++;
  if (en.behaviorTimer >= p.directionChangeInterval) {
    en.behaviorTimer = 0;
    // Bias toward formation but with large random offset
    const baseAngle = Math.atan2(fy - en.y, fx - en.x);
    en.lurchAngle = baseAngle + (Math.random() - 0.5) * p.lurchAmount * 2;
  }

  en.x += Math.cos(en.lurchAngle) * en.speed;
  en.y += Math.sin(en.lurchAngle) * en.speed;
}

// ── Wave spawning ─────────────────────────────────────────────

function updateSpawner(STATE) {
  const spawnRate = Math.max(
    C.SPAWN_RATE_MIN,
    C.SPAWN_RATE_BASE - STATE.wave * 5
  );
  STATE.spawnTimer++;
  if (STATE.spawnTimer >= spawnRate) {
    STATE.spawnTimer = 0;
    spawnEnemy(STATE);
    if (STATE.wave > 2 && Math.random() < C.SPAWN_BURST_CHANCE) {
      spawnEnemy(STATE);
    }
  }
}
