import { W, H, CITIES } from './data.js';
import { isLandWorld } from './terrain.js';

// Sea lanes for boats: a coarse grid over the open ocean, a mooring spot for each
// port, and shortest sailing paths between moorings that never cross land.

const G = 2; // world units per grid cell
const GW = Math.ceil(W / G), GH = Math.ceil(H / G);
let nav = null; // 1 where a boat can sail
const docks = {}; // port id -> grid cell of its mooring
const lanes = new Map();

function build() {
  const land = new Uint8Array(GW * GH);
  for (let gy = 0; gy < GH; gy++) for (let gx = 0; gx < GW; gx++) land[gy * GW + gx] = isLandWorld((gx + 0.5) * G, (gy + 0.5) * G) ? 1 : 0;
  // keep a cell of clear water from the beach so boats don't scrape the sand
  const open = new Uint8Array(GW * GH);
  for (let gy = 0; gy < GH; gy++) for (let gx = 0; gx < GW; gx++) {
    let ok = !land[gy * GW + gx];
    for (let j = -1; j <= 1 && ok; j++) for (let i = -1; i <= 1 && ok; i++) {
      const x = gx + i, y = gy + j;
      if (x >= 0 && y >= 0 && x < GW && y < GH && land[y * GW + x]) ok = false;
    }
    open[gy * GW + gx] = ok ? 1 : 0;
  }
  // only the open ocean counts: flood from a corner so inland lakes are left out
  nav = new Uint8Array(GW * GH);
  const q = [0];
  nav[0] = 1;
  while (q.length) {
    const u = q.pop(), ux = u % GW, uy = (u / GW) | 0;
    for (const [x, y] of [[ux + 1, uy], [ux - 1, uy], [ux, uy + 1], [ux, uy - 1]]) {
      const v = y * GW + x;
      if (x >= 0 && y >= 0 && x < GW && y < GH && open[v] && !nav[v]) { nav[v] = 1; q.push(v); }
    }
  }
  for (const c of CITIES) {
    if (!c.port && !c.anchor) continue;
    const sx = Math.floor(c.x / G), sy = Math.floor(c.y / G);
    let best = -1, bd = Infinity;
    for (let j = -16; j <= 16; j++) for (let i = -16; i <= 16; i++) {
      const x = sx + i, y = sy + j;
      if (x < 0 || y < 0 || x >= GW || y >= GH || !nav[y * GW + x]) continue;
      if (i * i + j * j < bd) { bd = i * i + j * j; best = y * GW + x; }
    }
    if (best >= 0) docks[c.id] = best;
    else console.warn(`${c.name} is marked as a port but has no open water nearby`);
  }
}

const cellXY = (i) => [((i % GW) + 0.5) * G, (((i / GW) | 0) + 0.5) * G];

// where boats moor at a port, in world units, or null
export function dockOf(id) {
  if (!nav) build();
  return docks[id] == null ? null : cellXY(docks[id]);
}

// Dijkstra from one mooring over the whole ocean, 8 directions, no cutting corners past land
function field(id) {
  const dist = new Float64Array(GW * GH).fill(Infinity), prev = new Int32Array(GW * GH).fill(-1);
  const start = docks[id];
  dist[start] = 0;
  const heap = [[0, start]];
  const push = (e) => {
    let i = heap.push(e) - 1;
    while (i > 0) { const p = (i - 1) >> 1; if (heap[p][0] <= e[0]) break; heap[i] = heap[p]; i = p; }
    heap[i] = e;
  };
  const pop = () => {
    const top = heap[0], last = heap.pop();
    if (heap.length) {
      let i = 0;
      for (;;) {
        const l = i * 2 + 1, r = l + 1;
        let m = i, mv = last[0];
        if (l < heap.length && heap[l][0] < mv) { m = l; mv = heap[l][0]; }
        if (r < heap.length && heap[r][0] < mv) m = r;
        if (m === i) break;
        heap[i] = heap[m]; i = m;
      }
      heap[i] = last;
    }
    return top;
  };
  const STEPS = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2]];
  while (heap.length) {
    const [d, u] = pop();
    if (d > dist[u]) continue;
    const ux = u % GW, uy = (u / GW) | 0;
    for (const [dx, dy, w] of STEPS) {
      const x = ux + dx, y = uy + dy;
      if (x < 0 || y < 0 || x >= GW || y >= GH) continue;
      const v = y * GW + x;
      if (!nav[v] || (dx && dy && (!nav[uy * GW + x] || !nav[y * GW + ux]))) continue;
      if (d + w < dist[v]) { dist[v] = d + w; prev[v] = u; push([d + w, v]); }
    }
  }
  return { dist, prev };
}

// is the straight line between two points all open water?
function clear([ax, ay], [bx, by]) {
  const n = Math.ceil(Math.hypot(bx - ax, by - ay) / (G * 0.5));
  for (let k = 1; k < n; k++) {
    const x = Math.floor((ax + ((bx - ax) * k) / n) / G), y = Math.floor((ay + ((by - ay) * k) / n) / G);
    if (!nav[y * GW + x]) return false;
  }
  return true;
}

// every lane out of one port, worked out together from a single search
function lanesFrom(a) {
  const f = field(a);
  for (const c of CITIES) {
    if ((!c.port && !c.anchor) || c.id === a || lanes.has(`${a}|${c.id}`)) continue;
    let lane = null;
    if (docks[c.id] != null && f.dist[docks[c.id]] < Infinity) {
      const cells = [];
      for (let i = docks[c.id]; i >= 0; i = f.prev[i]) cells.unshift(cellXY(i));
      // pull the grid path taut into a few straight runs
      const pts = [cells[0]];
      for (let i = 0; i < cells.length - 1;) {
        let j = i + 1;
        while (j + 1 < cells.length && clear(cells[i], cells[j + 1])) j++;
        pts.push(cells[j]);
        i = j;
      }
      let len = 0;
      for (let k = 1; k < pts.length; k++) len += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
      lane = { pts, len };
    }
    lanes.set(`${a}|${c.id}`, lane);
    lanes.set(`${c.id}|${a}`, lane && { pts: [...lane.pts].reverse(), len: lane.len });
  }
}

// shortest sailing line between two ports or anchorages, mooring to mooring: { pts, len } or null
export function seaLane(a, b) {
  const sails = (id) => cityById(id)?.port || cityById(id)?.anchor;
  if (a === b || !sails(a) || !sails(b)) return null;
  if (!nav) build();
  if (docks[a] == null || docks[b] == null) return null;
  if (!lanes.has(`${a}|${b}`)) lanesFrom(a);
  return lanes.get(`${a}|${b}`);
}

const byId = Object.fromEntries(CITIES.map((c) => [c.id, c]));
const cityById = (id) => byId[id];
