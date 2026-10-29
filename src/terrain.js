import { W, H, CITIES, RAILS, CONTINENTS } from './data.js';

export const R = 2; // sub pixels per world unit
const TW = W * R, TH = H * R;
const byId = Object.fromEntries(CITIES.map((c) => [c.id, c]));

function hash(x, y) {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}
function noise(x, y, s) {
  const gx = x / s, gy = y / s, x0 = Math.floor(gx), y0 = Math.floor(gy);
  const fx = gx - x0, fy = gy - y0;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const a = hash(x0, y0), b = hash(x0 + 1, y0), c = hash(x0, y0 + 1), d = hash(x0 + 1, y0 + 1);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}
const rgbCache = {};
function rgb(h) { return (rgbCache[h] ??= [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]); }

export function makeWaterPattern() {
  const c = document.createElement('canvas');
  c.width = 32; c.height = 32;
  const x = c.getContext('2d');
  x.fillStyle = '#2e5f9f'; x.fillRect(0, 0, 32, 32);
  x.fillStyle = '#3266a8';
  for (let i = 0; i < 32; i++) for (let j = 0; j < 32; j++) if (hash(i * 7, j * 13) > 0.86) x.fillRect(i, j, 1, 1);
  x.fillStyle = 'rgba(140,190,240,0.75)';
  [[3, 5], [19, 14], [9, 25], [26, 28]].forEach(([a, b]) => x.fillRect(a, b, 3, 1));
  return c;
}

// which continent (index) covers this spot, or -1. Each continent is a wobbly band
// around a spine of [x, y, halfWidth] points that narrows toward both ends.
const SHAPES = CONTINENTS.map(({ spine: sp }) => {
  let total = 0;
  for (let i = 1; i < sp.length; i++) total += Math.hypot(sp[i][0] - sp[i - 1][0], sp[i][1] - sp[i - 1][1]);
  const pad = Math.max(...sp.map((p) => p[2])) + 30;
  return {
    sp, total,
    x0: Math.min(...sp.map((p) => p[0])) - pad, x1: Math.max(...sp.map((p) => p[0])) + pad,
    y0: Math.min(...sp.map((p) => p[1])) - pad, y1: Math.max(...sp.map((p) => p[1])) + pad,
  };
});

export function continentAt(x, y) {
  let n = null;
  for (let k = 0; k < SHAPES.length; k++) {
    const { sp, total, x0, x1, y0, y1 } = SHAPES[k];
    if (x < x0 || x > x1 || y < y0 || y > y1) continue;
    n ??= (noise(x, y, 30) - 0.5) * 26 + (noise(x, y, 7) - 0.5) * 7 + (noise(x + 50, y, 3) - 0.5) * 2;
    let run = 0;
    for (let i = 1; i < sp.length; i++) {
      const [ax, ay, ah] = sp[i - 1], [bx, by, bh] = sp[i];
      const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy);
      const f = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (L * L)));
      const px = ax + dx * f, py = ay + dy * f;
      const s = run + L * f;
      const t = Math.min(1, s / 50, (total - s) / 50);
      const hw = (ah + (bh - ah) * f) * (0.45 + 0.55 * t * t * (3 - 2 * t))
        + 5 * Math.sin((px + py) / 40 + k) + 3 * Math.sin((px - py) / 13);
      if (Math.hypot(x - px, y - py) < hw + n) return k;
      run += L;
    }
  }
  return -1;
}

export function isLandWorld(x, y) {
  if (continentAt(x, y) >= 0) return true;
  for (const c of CITIES) {
    if (Math.abs(x - c.x) > 13 || Math.abs(y - c.y) > 13) continue;
    const r = (c.rail ? 10 : 9) + (noise(x + 100, y, 4) - 0.5) * 4;
    if ((x - c.x) ** 2 + (y - c.y) ** 2 < r * r) return true;
  }
  return false;
}

function bfs(seedTest, passTest, max) {
  const d = new Uint8Array(TW * TH).fill(255);
  let q = [];
  for (let i = 0; i < TW * TH; i++) if (seedTest(i)) { d[i] = 0; q.push(i); }
  for (let k = 1; k <= max && q.length; k++) {
    const nq = [];
    for (const i of q) {
      const x = i % TW, y = (i / TW) | 0;
      for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
        if (nx < 0 || ny < 0 || nx >= TW || ny >= TH) continue;
        const j = ny * TW + nx;
        if (d[j] === 255 && passTest(j)) { d[j] = k; nq.push(j); }
      }
    }
    q = nq;
  }
  return d;
}

function bresenham(x0, y0, x1, y1) {
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  const pts = [];
  for (;;) {
    pts.push([x0, y0]);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
  return { pts, horiz: dx > -dy };
}

export function buildTerrain() {
  const land = new Uint8Array(TW * TH);
  for (let sy = 0; sy < TH; sy++) for (let sx = 0; sx < TW; sx++)
    land[sy * TW + sx] = isLandWorld((sx + 0.5) / R, (sy + 0.5) / R) ? 1 : 0;

  const waterDist = bfs((i) => land[i], (j) => !land[j], 7);
  const shoreDist = bfs((i) => !land[i], (j) => land[j], 3);

  // rail lines in sub pixel space
  const rails = RAILS.map(([a, b]) => {
    const A = byId[a], B = byId[b];
    const l = bresenham(A.x * R, A.y * R, B.x * R, B.y * R);
    l.pts = l.pts.filter(([x, y]) => Math.hypot(x - A.x * R, y - A.y * R) > 9 && Math.hypot(x - B.x * R, y - B.y * R) > 9);
    return l;
  });
  const nearRail = new Uint8Array(TW * TH);
  for (const { pts } of rails) for (const [x, y] of pts) for (let j = -3; j <= 3; j++) for (let i = -3; i <= 3; i++) {
    const nx = x + i, ny = y + j;
    if (nx >= 0 && ny >= 0 && nx < TW && ny < TH) nearRail[ny * TW + nx] = 1;
  }

  const canvas = document.createElement('canvas');
  canvas.width = TW; canvas.height = TH;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(TW, TH);
  const put = (x, y, hex) => {
    if (x < 0 || y < 0 || x >= TW || y >= TH) return;
    const i = (y * TW + x) * 4, [r, g, b] = rgb(hex);
    img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b; img.data[i + 3] = 255;
  };
  // distance (in whole world units, square) to the nearest town, for keeping trees and peaks clear
  const cityGap = new Uint8Array(W * H).fill(255);
  for (const c of CITIES) for (let j = -9; j <= 9; j++) for (let i = -9; i <= 9; i++) {
    const x = Math.round(c.x) + i, y = Math.round(c.y) + j;
    if (x >= 0 && y >= 0 && x < W && y < H) cityGap[y * W + x] = Math.min(cityGap[y * W + x], Math.max(Math.abs(i), Math.abs(j)));
  }
  const nearCity = (wx, wy, r) => (cityGap[Math.min(H - 1, wy | 0) * W + Math.min(W - 1, wx | 0)] ?? 255) < r;
  const biome = (wx, wy) => {
    if (wy < 112 + (noise(wx, wy, 10) - 0.5) * 18) return 'snow';
    if (wy > 400 + (noise(wx + 30, wy, 12) - 0.5) * 28) return 'desert';
    return 'grass';
  };
  // ranges sit where a slow noise field runs high, north of the desert
  const mountainH = (wx, wy) => (wy < 380 && noise(wx + 500, wy, 40) > 0.68 ? noise(wx + 200, wy, 9) : 0);
  const mesaH = (wx, wy) => (wy > 410 ? noise(wx + 11, wy + 5, 8) : 0);

  for (let sy = 0; sy < TH; sy++) for (let sx = 0; sx < TW; sx++) {
    const i = sy * TW + sx;
    const wx = (sx + 0.5) / R, wy = (sy + 0.5) / R;
    const d = hash(sx, sy);
    if (!land[i]) {
      const wd = waterDist[i];
      if (wd === 1) put(sx, sy, '#9ccbee');
      else if (wd <= 3) put(sx, sy, '#5d9fd6');
      else if (wd <= 5) put(sx, sy, '#4a89c4');
      else if (wd <= 7 && (sx + sy) % 2 === 0) put(sx, sy, '#4a89c4');
      continue;
    }
    const b = biome(wx, wy);
    const sd = shoreDist[i];
    let col;
    if (sd <= 2) col = b === 'snow' ? (d > 0.5 ? '#d3dce2' : '#c6d0d7') : (sd === 1 ? '#ecd79c' : (d > 0.5 ? '#e4cb88' : '#ddc27e'));
    else if (b === 'snow') col = d > 0.55 ? '#f1f5f8' : '#e3eaef';
    else if (b === 'grass') col = d > 0.97 ? '#8cc96a' : d > 0.5 ? '#6db450' : '#66ab4a';
    else col = d > 0.96 ? '#c99f5a' : d > 0.5 ? '#e3c078' : '#dcb86f';

    if (sd > 2 && !nearCity(wx, wy, 7)) {
      const m = mountainH(wx, wy);
      if (m > 0.6) {
        const lit = m >= mountainH(wx - 0.6, wy - 0.6);
        if (m > 0.78) col = lit ? '#f7f9fb' : '#cbd5dd';
        else col = lit ? (d > 0.5 ? '#a4acb5' : '#9aa3ac') : (d > 0.5 ? '#77808a' : '#6f7882');
      } else {
        const ms = mesaH(wx, wy);
        if (ms > 0.66) {
          const lit = ms >= mesaH(wx - 0.6, wy - 0.6);
          col = ms > 0.74 ? (lit ? '#d99560' : '#b06a3c') : (lit ? '#cf8a55' : '#a8653a');
        }
      }
    }
    put(sx, sy, col);
  }

  // trees, cacti
  for (let gy = 0; gy < TH; gy += 3) for (let gx = 0; gx < TW; gx += 3) {
    const jx = gx + Math.floor(hash(gx, gy + 7) * 3), jy = gy + Math.floor(hash(gx + 3, gy) * 3);
    const i = jy * TW + jx;
    if (jx >= TW || jy >= TH || !land[i] || shoreDist[i] <= 3 || nearRail[i]) continue;
    const wx = jx / R, wy = jy / R;
    if (nearCity(wx, wy, 8) || mountainH(wx, wy) > 0.54) continue;
    const b = biome(wx, wy);
    if (b === 'desert') {
      if (mesaH(wx, wy) < 0.6 && hash(jx, jy) > 0.965) {
        put(jx + 1, jy + 3, '#b9934f');
        put(jx, jy, '#4f8f3c'); put(jx, jy + 1, '#4f8f3c'); put(jx, jy + 2, '#3f7a30'); put(jx - 1, jy + 1, '#5ea248'); put(jx + 1, jy, '#5ea248');
      }
      continue;
    }
    const f = noise(wx + 7, wy + 3, 9);
    if (f < 0.58 || hash(jx + 1, jy + 1) < 0.25) continue;
    const [lt, mid, dk, sh] = b === 'snow'
      ? ['#6f9c80', '#4e8063', '#3a6650', '#c3ced6']
      : ['#5aa64b', '#3d8638', '#2c6a2b', '#4a8a3a'];
    put(jx + 1, jy + 2, sh); put(jx + 2, jy + 2, sh); put(jx + 2, jy + 1, sh);
    put(jx, jy, mid); put(jx + 1, jy, mid); put(jx - 1, jy, mid);
    put(jx, jy - 1, lt); put(jx - 1, jy - 1, lt); put(jx, jy + 1, dk); put(jx + 1, jy + 1, dk); put(jx + 1, jy - 1, mid);
  }
  ctx.putImageData(img, 0, 0);

  // track: ties, then two steel rails
  for (const { pts, horiz } of rails) pts.forEach(([x, y], k) => {
    if (k % 3) return;
    ctx.fillStyle = land[y * TW + x] ? '#8a6948' : '#5b4232';
    if (horiz) ctx.fillRect(x, y - 2, 1, 5); else ctx.fillRect(x - 2, y, 5, 1);
  });
  ctx.fillStyle = '#4d535d';
  for (const { pts, horiz } of rails) for (const [x, y] of pts) {
    if (horiz) { ctx.fillRect(x, y - 1, 1, 1); ctx.fillRect(x, y + 1, 1, 1); }
    else { ctx.fillRect(x - 1, y, 1, 1); ctx.fillRect(x + 1, y, 1, 1); }
  }
  return canvas;
}
