// ============================================================
// FORMATION SYSTEM
// Handles formation movement, rotation, and avatar positioning
// ============================================================

let mouseX = C.W / 2, mouseY = C.H / 2;

function setupMouseTracking() {
  const canvas = document.getElementById('gameCanvas');
  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouseX = e.clientX - r.left;
    mouseY = e.clientY - r.top;
  });
}

function updateFormation(STATE) {
  const f = STATE.formation;
  const keys = STATE.keys;

  // WASD movement
  let dx = 0, dy = 0;
  if (keys['w'] || keys['W']) dy -= C.PLAYER_SPEED;
  if (keys['s'] || keys['S']) dy += C.PLAYER_SPEED;
  if (keys['a'] || keys['A']) dx -= C.PLAYER_SPEED;
  if (keys['d'] || keys['D']) dx += C.PLAYER_SPEED;
  if (dx && dy) { dx *= 0.707; dy *= 0.707; }

  // Resolve movement against terrain
  if (dx !== 0 || dy !== 0) {
    const resolved = resolveMovement(f.x, f.y, dx, dy, C.PLAYER_COLLISION_R);
    f.x = resolved.x;
    f.y = resolved.y;
  }

  // Clamp to canvas bounds (terrain border handles this, but safety net)
  const PAD = C.TILE + 4;
  f.x = Math.max(PAD, Math.min(C.W - PAD, f.x));
  f.y = Math.max(PAD, Math.min(C.H - PAD, f.y));

  // Smooth rotation toward mouse
  const targetRot = Math.atan2(mouseY - f.y, mouseX - f.x);
  let diff = targetRot - f.rotation;
  while (diff >  Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  f.rotation += diff * C.ROTATION_SPEED;

  // Compute avatar world positions — all face the mouse
  const isMoving = dx !== 0 || dy !== 0;
  STATE.avatars.forEach((av, i) => {
    const slotAngle = SLOT_ANGLES[i] + f.rotation;
    av.x = f.x + Math.cos(slotAngle) * C.FORMATION_RADIUS;
    av.y = f.y + Math.sin(slotAngle) * C.FORMATION_RADIUS;
    av.angle = Math.atan2(mouseY - av.y, mouseX - av.x);
    if (isMoving) av.animPhase += 0.18;
    if (av.recoilTimer > 0) av.recoilTimer--;
  });
}
