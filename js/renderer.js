// ============================================================
// RENDERER
// All canvas draw calls live here. No game logic.
// ============================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function render(STATE) {
  // Terrain (replaces flat background)
  drawTerrain(ctx);

  // Game objects back-to-front
  drawParticlesLayer(STATE);
  drawBulletsLayer(STATE);
  drawDyingEnemies(STATE);
  drawEnemies(STATE);
  drawAvatars(STATE);
}

// ── Particles ─────────────────────────────────────────────────

function drawParticlesLayer(STATE) {
  STATE.particles.forEach(p => {
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  });
  ctx.globalAlpha = 1;
}

// ── Bullets ───────────────────────────────────────────────────

function drawBulletsLayer(STATE) {
  STATE.bullets.forEach(b => {
    const alpha = Math.min(1, b.life / Math.min(b.maxLife, 15));
    ctx.globalAlpha = alpha * 0.92;
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x - b.size / 2, b.y - b.size / 2, b.size, b.size);
    ctx.fillStyle = '#fff';
    ctx.fillRect(b.x - 1, b.y - 1, 2, 2);
  });
  ctx.globalAlpha = 1;
}

// ── Sprite rendering ──────────────────────────────────────────

// Core sprite draw with left/right alternating leg walk
function drawSpriteAt(key, x, y, opts = {}) {
  const oc = SCACHE[key];
  if (!oc) return;
  const P = C.PIXEL, sz = C.SPRITE_SIZE * P;
  const rot      = opts.rotation  ?? 0;
  const scale    = opts.scale     ?? 1;
  const flash    = opts.flash     ?? false;
  const animPhase = opts.animPhase ?? 0;

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  if (rot)     ctx.rotate(rot);
  if (scale !== 1) ctx.scale(scale, scale);

  if (flash) {
    ctx.globalAlpha = 0.75;
    ctx.drawImage(oc, -sz / 2, -sz / 2);
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = '#ff4422';
    ctx.fillRect(-sz / 2, -sz / 2, sz, sz);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  } else {
    // Upper body — stable
    const bodyH = Math.round(sz * 0.72);
    ctx.drawImage(oc, 0, 0, sz, bodyH, -sz / 2, -sz / 2, sz, bodyH);

    // Legs — left/right alternating stride
    const legSrcY = bodyH, legH = sz - bodyH, halfW = sz / 2;
    const leftStep  = Math.round(Math.sin(animPhase) * 3);
    const rightStep = Math.round(Math.sin(animPhase + Math.PI) * 3);

    ctx.drawImage(oc,    0, legSrcY, halfW, legH, -sz/2,  -sz/2 + legSrcY + leftStep,  halfW, legH);
    ctx.drawImage(oc, halfW, legSrcY, halfW, legH,     0,  -sz/2 + legSrcY + rightStep, halfW, legH);
  }
  ctx.restore();
}

// ── Enemies ───────────────────────────────────────────────────

function drawDyingEnemies(STATE) {
  STATE.dyingEnemies.forEach(de => {
    drawSpriteAt(de.sprite, de.x, de.y, {
      rotation: de.rotation,
      scale: de.scale,
      animPhase: de.frame * 0.3,
    });
  });
}

function drawEnemies(STATE) {
  STATE.enemies.forEach(en => {
    drawSpriteAt(en.sprite, en.x, en.y, {
      flash: en.flashTimer > 0,
      animPhase: en.animPhase,
    });

    // HP bar (only when damaged)
    if (en.hp < en.maxHp) {
      const bw = 24, bh = 3;
      const bx = en.x - bw / 2, by = en.y - 22;
      ctx.fillStyle = '#220000';
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = '#ff4422';
      ctx.fillRect(bx, by, bw * (en.hp / en.maxHp), bh);
    }

    // Behavior state indicator — charge warning (demon)
    if (en.behaviorType === 'demon' && en.behaviorState === 'charge') {
      ctx.strokeStyle = '#ff440066';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(en.x, en.y, 16, 0, Math.PI * 2);
      ctx.stroke();
    }
  });
}

// ── Avatars ───────────────────────────────────────────────────

function drawAvatars(STATE) {
  const f = STATE.formation;

  // Formation connector lines
  ctx.strokeStyle = '#162016';
  ctx.lineWidth = 0.5;
  ctx.setLineDash([3, 7]);
  for (let i = 0; i < STATE.avatars.length; i++) {
    const a = STATE.avatars[i];
    const b = STATE.avatars[(i + 1) % STATE.avatars.length];
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  }
  ctx.setLineDash([]);

  // Aim line from formation center to mouse
  ctx.strokeStyle = '#1a2a1a';
  ctx.lineWidth = 0.5;
  ctx.setLineDash([4, 10]);
  ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(mouseX, mouseY); ctx.stroke();
  ctx.setLineDash([]);

  STATE.avatars.forEach((av, i) => {
    // Recoil
    const recoilDX = av.recoilTimer > 0 ? -Math.cos(av.angle) * 3 : 0;
    const recoilDY = av.recoilTimer > 0 ? -Math.sin(av.angle) * 3 : 0;

    drawSpriteAt(av.sprite, av.x + recoilDX, av.y + recoilDY, {
      animPhase: av.animPhase,
    });

    // Selected ability ring
    if (i === STATE.selectedAbility) {
      ctx.strokeStyle = av.bulletColor + 'cc';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(av.x, av.y, 23, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Name label
    ctx.fillStyle = i === STATE.selectedAbility ? av.bulletColor : av.bulletColor + '66';
    ctx.font = '9px "Share Tech Mono"';
    ctx.textAlign = 'center';
    ctx.fillText(av.shortName, av.x, av.y + 26);

    // Cooldown arc on ability ring
    if (STATE.selectedAbility === i && av.abilityCooldown > 0) {
      const pct = 1 - (av.abilityCooldown / av.activeAbility.cooldown);
      ctx.strokeStyle = av.bulletColor + '88';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(av.x, av.y, 23, -Math.PI / 2, -Math.PI / 2 + pct * Math.PI * 2);
      ctx.stroke();
    }
  });
}

// ── Ability bar ───────────────────────────────────────────────

function buildAbilityBar(STATE) {
  const bar = document.getElementById('abilityBar');
  if (!bar) return;
  bar.innerHTML = STATE.avatars.map((av, i) => `
    <div class="ability-slot ${i === STATE.selectedAbility ? 'selected' : ''}" id="aslot${i}" style="--sc:${av.bulletColor}">
      <div class="slot-num ${i === STATE.selectedAbility ? 'sel' : ''}">${i + 1}</div>
      <div class="slot-name ${i === STATE.selectedAbility ? 'sel' : ''}">${av.shortName}</div>
      <div class="slot-ability ${i === STATE.selectedAbility ? 'sel' : ''}">${av.activeAbility.name}</div>
      <div class="slot-skills ${i === STATE.selectedAbility ? 'sel' : ''}" id="askills${i}"></div>
      <div class="slot-cdtrack"></div>
      <div class="slot-cdfill" id="acd${i}" style="width:100%"></div>
    </div>
  `).join('');
}

function updateAbilityBar(STATE) {
  STATE.avatars.forEach((av, i) => {
    const slot   = document.getElementById(`aslot${i}`);
    const cd     = document.getElementById(`acd${i}`);
    const skills = document.getElementById(`askills${i}`);
    if (!slot || !cd) return;

    const sel = i === STATE.selectedAbility;
    slot.className = `ability-slot${sel ? ' selected' : ''}`;

    const pct = av.abilityCooldown > 0
      ? (1 - av.abilityCooldown / av.activeAbility.cooldown) * 100
      : 100;
    cd.style.width = pct + '%';

    slot.querySelectorAll('.slot-num,.slot-name,.slot-ability,.slot-skills').forEach(el => {
      el.className = el.className.replace(/ sel/g, '') + (sel ? ' sel' : '');
    });

    // Show skill pips
    if (skills) {
      skills.textContent = av.skills.map(s =>
        `${SKILL_DEFS[s.id]?.name ?? s.id} ${s.level}`
      ).join(' · ') || '';
    }
  });
}
