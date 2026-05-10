// ============================================================
// TERRAIN SYSTEM
// Generates a tile map from active apocalypse kits.
// Each apocalypse contributes walls, cover, and hazards.
// ============================================================

// Tile map — flat array, index = y*TILES_X + x
// Value = { type: TILE.*, apoc: 'zombie'|..., kitIndex: n }
let tileMap = [];

// ── Map generation ──────────────────────────────────────────

function generateMap(activeApocs) {
  const TX = C.TILES_X, TY = C.TILES_Y;
  tileMap = new Array(TX * TY).fill(null).map(() => ({ type: TILE.FLOOR, apoc: null, kitIndex: 0 }));

  const extra = Math.max(0, activeApocs.length - 1);
  const wallDensity   = C.WALL_DENSITY_BASE   + extra * C.DENSITY_PER_APOC;
  const coverDensity  = C.COVER_DENSITY_BASE  + extra * C.DENSITY_PER_APOC;
  const hazardDensity = C.HAZARD_DENSITY_BASE + extra * C.DENSITY_PER_APOC;

  const totalTiles = TX * TY;

  // Keep center clear — formation spawns there
  const centerX = Math.floor(TX / 2), centerY = Math.floor(TY / 2);
  const clearRadius = 4; // tiles

  function isClearZone(tx, ty) {
    return Math.abs(tx - centerX) <= clearRadius && Math.abs(ty - centerY) <= clearRadius;
  }

  // Shuffle tile indices for random placement
  const indices = Array.from({ length: totalTiles }, (_, i) => i);
  shuffleArray(indices);

  let wallCount   = Math.floor(totalTiles * wallDensity);
  let coverCount  = Math.floor(totalTiles * coverDensity);
  let hazardCount = Math.floor(totalTiles * hazardDensity);

  for (const idx of indices) {
    const tx = idx % TX, ty = Math.floor(idx / TX);
    if (isClearZone(tx, ty)) continue;

    // Alternate between active apocalypse kits for mixed visual
    const apocKey = activeApocs[Math.floor(Math.random() * activeApocs.length)];
    const apocData = getApoc(apocKey);

    if (wallCount > 0) {
      const kit = apocData.terrain.walls;
      tileMap[idx] = { type: TILE.WALL, apoc: apocKey, kitIndex: Math.floor(Math.random() * kit.length) };
      wallCount--;
    } else if (coverCount > 0) {
      const kit = apocData.terrain.covers;
      tileMap[idx] = { type: TILE.COVER, apoc: apocKey, kitIndex: Math.floor(Math.random() * kit.length) };
      coverCount--;
    } else if (hazardCount > 0) {
      const kit = apocData.terrain.hazards;
      tileMap[idx] = { type: TILE.HAZARD, apoc: apocKey, kitIndex: Math.floor(Math.random() * kit.length) };
      hazardCount--;
    }

    if (wallCount + coverCount + hazardCount === 0) break;
  }

  // Post-pass: ensure border tiles are walls (arena boundary)
  for (let x = 0; x < TX; x++) {
    setWallBorder(x, 0, activeApocs);
    setWallBorder(x, TY - 1, activeApocs);
  }
  for (let y = 0; y < TY; y++) {
    setWallBorder(0, y, activeApocs);
    setWallBorder(TX - 1, y, activeApocs);
  }
}

function setWallBorder(tx, ty, activeApocs) {
  const idx = ty * C.TILES_X + tx;
  const apocKey = activeApocs[0];
  const kit = getApoc(apocKey).terrain.walls;
  tileMap[idx] = { type: TILE.WALL, apoc: apocKey, kitIndex: 0 };
}

// ── Tile queries ─────────────────────────────────────────────

function getTile(tx, ty) {
  if (tx < 0 || ty < 0 || tx >= C.TILES_X || ty >= C.TILES_Y) return { type: TILE.WALL };
  return tileMap[ty * C.TILES_X + tx];
}

function worldToTile(wx, wy) {
  return {
    tx: Math.floor(wx / C.TILE),
    ty: Math.floor(wy / C.TILE),
  };
}

function isWalkable(wx, wy) {
  const { tx, ty } = worldToTile(wx, wy);
  const tile = getTile(tx, ty);
  return tile.type === TILE.FLOOR || tile.type === TILE.HAZARD;
}

function isBulletPassable(wx, wy) {
  const { tx, ty } = worldToTile(wx, wy);
  const tile = getTile(tx, ty);
  // Bullets pass through cover and hazards, blocked by walls only
  return tile.type !== TILE.WALL;
}

// Resolve movement — try to slide along walls if blocked
function resolveMovement(x, y, dx, dy, radius) {
  const nx = x + dx, ny = y + dy;
  if (isWalkable(nx, ny)) return { x: nx, y: ny };
  // Try sliding X
  if (isWalkable(nx, y)) return { x: nx, y };
  // Try sliding Y
  if (isWalkable(x, ny)) return { x, y: ny };
  return { x, y };
}

// Get hazard tile at world position (for hazard effects — STUB)
function getHazardAt(wx, wy) {
  const { tx, ty } = worldToTile(wx, wy);
  const tile = getTile(tx, ty);
  if (tile.type !== TILE.HAZARD) return null;
  const apocData = getApoc(tile.apoc);
  return apocData.terrain.hazards[tile.kitIndex] ?? null;
}

// ── Rendering ────────────────────────────────────────────────

function drawTerrain(ctx) {
  const TX = C.TILES_X, TY = C.TILES_Y, T = C.TILE;

  for (let ty = 0; ty < TY; ty++) {
    for (let tx = 0; tx < TX; tx++) {
      const tile = getTile(tx, ty);
      const px = tx * T, py = ty * T;
      const apocData = tile.apoc ? getApoc(tile.apoc) : null;

      if (tile.type === TILE.FLOOR) {
        // Base floor — use first active apoc's floor color
        // In main.js we'll pass activeApocs; for now default dark
        ctx.fillStyle = '#141414';
        ctx.fillRect(px, py, T, T);
        // Subtle detail dots
        if ((tx + ty) % 3 === 0) {
          ctx.fillStyle = '#181818';
          ctx.fillRect(px + 2, py + 2, 2, 2);
        }

      } else if (tile.type === TILE.WALL) {
        const kit = apocData ? apocData.terrain.walls[tile.kitIndex] : null;
        const col = kit ? kit.color : '#1e1e1e';
        const acc = kit ? kit.accent : '#2a2a2a';
        ctx.fillStyle = col;
        ctx.fillRect(px, py, T, T);
        // Accent border
        ctx.fillStyle = acc;
        ctx.fillRect(px, py, T, 2);
        ctx.fillRect(px, py, 2, T);

      } else if (tile.type === TILE.COVER) {
        const kit = apocData ? apocData.terrain.covers[tile.kitIndex] : null;
        const col = kit ? kit.color : '#1a1a20';
        const acc = kit ? kit.accent : '#252530';
        // Cover is shorter — draw as partial fill
        ctx.fillStyle = '#141414';
        ctx.fillRect(px, py, T, T);
        ctx.fillStyle = col;
        ctx.fillRect(px + 2, py + 6, T - 4, T - 8);
        ctx.fillStyle = acc;
        ctx.fillRect(px + 2, py + 6, T - 4, 2);

      } else if (tile.type === TILE.HAZARD) {
        const kit = apocData ? apocData.terrain.hazards[tile.kitIndex] : null;
        const col = kit ? kit.color : '#141414';
        const glow = kit ? kit.glowColor : '#333333';
        ctx.fillStyle = col;
        ctx.fillRect(px, py, T, T);
        // Pulsing glow effect — use frame counter from STATE if available
        const pulse = 0.3 + Math.sin((Date.now() / 600) + tx + ty) * 0.15;
        ctx.fillStyle = glow;
        ctx.globalAlpha = pulse * 0.4;
        ctx.fillRect(px + 4, py + 4, T - 8, T - 8);
        ctx.globalAlpha = 1;
      }
    }
  }

  // Grid overlay — subtle
  ctx.strokeStyle = 'rgba(255,255,255,0.025)';
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= C.W; x += T) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, C.H); ctx.stroke();
  }
  for (let y = 0; y <= C.H; y += T) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(C.W, y); ctx.stroke();
  }
}

// ── Utility ──────────────────────────────────────────────────

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
