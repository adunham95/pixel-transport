import { CITIES, RAILS, ROADS, ROAD_OFF, LANE, roadSide, ENGINES, CARS, PLANES, BOATS, TRUCKS, TRAILERS, LEVELS, RATES, SPEED, CITY_PRICE, START_CITIES, JOB_TYPES, MAGLEV_LINES } from './data.js';
import { seaLane } from './sea.js';

const KEY = 'pixel-transport-save-v1';
const JOB_CAP = 6;
// a job left waiting at its town this long (game time) goes elsewhere, so towns can't clog up
export const JOB_TTL = 15 * 60 * 1000;

export const cityById = Object.fromEntries(CITIES.map((c) => [c.id, c]));

export function dist(a, b) {
  const A = cityById[a], B = cityById[b];
  return Math.hypot(A.x - B.x, A.y - B.y);
}

const adj = Object.fromEntries(CITIES.map((c) => [c.id, []]));
for (const [a, b] of RAILS) {
  const d = dist(a, b);
  adj[a].push([b, d]);
  adj[b].push([a, d]);
}

// maglev guideways are their own network, separate from the rails
const magAdj = Object.fromEntries(CITIES.map((c) => [c.id, []]));
for (const line of MAGLEV_LINES) for (let i = 1; i < line.length; i++) {
  const [a, b] = [line[i - 1], line[i]], d = dist(a, b);
  magAdj[a].push([b, d]);
  magAdj[b].push([a, d]);
}
export const onMaglev = (id) => magAdj[id].length > 0;

const roadAdj = Object.fromEntries(CITIES.map((c) => [c.id, []]));
for (const [a, b] of ROADS) {
  const d = dist(a, b);
  roadAdj[a].push([b, d]);
  roadAdj[b].push([a, d]);
}

const railCache = new Map();
// shortest rail route; with maglev set, over the maglev guideways instead
export function railPath(from, to, maglev = false) {
  if (maglev ? !onMaglev(from) || !onMaglev(to) : !cityById[from]?.rail || !cityById[to]?.rail) return null;
  const key = `${from}>${to}${maglev ? '~' : ''}`;
  if (!railCache.has(key)) railCache.set(key, findPath(maglev ? magAdj : adj, from, to));
  return railCache.get(key);
}

// shortest road route between two mainland towns
export function roadPath(from, to) {
  if (!cityById[from]?.road || !cityById[to]?.road) return null;
  const key = `${from}>${to}#`;
  if (!railCache.has(key)) railCache.set(key, findPath(roadAdj, from, to));
  return railCache.get(key);
}

// where a truck drives along a road route: each stretch shifted over to the road beside
// the rails and into the right hand lane, joining up again in each town
function roadPts(ids) {
  const pts = [];
  for (let i = 1; i < ids.length; i++) {
    const A = cityById[ids[i - 1]], B = cityById[ids[i]];
    const [sx, sy] = roadSide(A.x, A.y, B.x, B.y), L = Math.hypot(B.x - A.x, B.y - A.y);
    const rx = -(B.y - A.y) / L, ry = (B.x - A.x) / L;
    const ox = sx * ROAD_OFF + rx * LANE, oy = sy * ROAD_OFF + ry * LANE;
    pts.push([A.x + ox, A.y + oy], [B.x + ox, B.y + oy]);
  }
  return pts;
}

function findPath(adjs, from, to) {
  const D = {}, prev = {}, seen = new Set();
  for (const c of CITIES) D[c.id] = Infinity;
  D[from] = 0;
  for (;;) {
    let u = null;
    for (const id in D) if (!seen.has(id) && D[id] < Infinity && (u === null || D[id] < D[u])) u = id;
    if (u === null) return null;
    if (u === to) break;
    seen.add(u);
    for (const [v, w] of adjs[u]) if (D[u] + w < D[v]) { D[v] = D[u] + w; prev[v] = u; }
  }
  const ids = [to];
  while (ids[0] !== from) ids.unshift(prev[ids[0]]);
  return { ids, len: D[to] };
}

export function posAt(pts, d) {
  const ang = (i) => Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]);
  if (d <= 0) return { x: pts[0][0], y: pts[0][1], ang: ang(1) };
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
    const L = Math.hypot(bx - ax, by - ay);
    if (d <= L) { const f = L ? d / L : 0; return { x: ax + (bx - ax) * f, y: ay + (by - ay) * f, ang: ang(i) }; }
    d -= L;
  }
  const l = pts[pts.length - 1];
  return { x: l[0], y: l[1], ang: ang(pts.length - 1) };
}

export function tripProgress(trip, now) {
  return Math.min(1, Math.max(0, (now - trip.startAt) / trip.dur));
}

const SPECS = { train: ENGINES, plane: PLANES, boat: BOATS, truck: TRUCKS };
export function spec(v) { return SPECS[v.kind][v.model]; }
// what a train or truck hooks up behind it: cars or trailers
const TAILS = { train: CARS, truck: TRAILERS };
export function tailSpecs(v) { return TAILS[v.kind]; }

const none = () => Object.fromEntries(JOB_TYPES.map((t) => [t, 0]));

export function capacity(v) {
  const cap = none();
  if (v.kind === 'plane') { const p = PLANES[v.model]; cap.pax = p.pax; cap.cargo = p.cargo; Object.assign(cap, p.hold); }
  else if (v.kind === 'boat') Object.assign(cap, BOATS[v.model].cap);
  else {
    if (v.kind === 'truck') Object.assign(cap, TRUCKS[v.model].cap);
    const tails = tailSpecs(v);
    for (const c of v.cars) cap[tails[c].holds] += tails[c].cap;
  }
  return cap;
}

export function used(v) {
  const u = none();
  for (const j of v.cargo) u[j.type]++;
  return u;
}

export function canLoad(v, job) {
  return used(v)[job.type] < capacity(v)[job.type];
}

// one hop between two cities for this vehicle, or null if it can't make it
export function leg(v, from, to) {
  // vehicles can't stop at locked towns (trains may still roll through them on the way)
  if (!from || from === to || !isOpen(to)) return null;
  if (v.kind === 'train') {
    const e = ENGINES[v.model];
    const p = railPath(from, to, !!e.maglev);
    if (!p) return null;
    return {
      from, to, len: p.len,
      pts: p.ids.map((id) => [cityById[id].x, cityById[id].y]),
      cost: Math.max(1, Math.ceil(p.len * (e.run + 0.04 * v.cars.length))),
      time: p.len / (e.speed * SPEED),
    };
  }
  if (v.kind === 'truck') {
    const t = TRUCKS[v.model], p = roadPath(from, to);
    if (!p) return null;
    return {
      from, to, len: p.len, pts: roadPts(p.ids),
      cost: Math.max(1, Math.ceil(p.len * (t.run + 0.03 * v.cars.length))),
      time: p.len / (t.speed * SPEED),
    };
  }
  if (v.kind === 'boat') {
    const b = BOATS[v.model];
    if (!canBase('boat', v.model, cityById[from]) || !canBase('boat', v.model, cityById[to])) return null;
    const lane = seaLane(from, to);
    if (!lane) return null;
    return { from, to, len: lane.len, pts: lane.pts, cost: Math.max(1, Math.ceil(lane.len * b.run)), time: lane.len / (b.speed * SPEED) };
  }
  const A = cityById[from], B = cityById[to], p = PLANES[v.model];
  if (!canBase('plane', v.model, A) || !canBase('plane', v.model, B)) return null;
  const d = Math.hypot(A.x - B.x, A.y - B.y);
  if (d > p.range) return null;
  return { from, to, len: d, pts: [[A.x, A.y], [B.x, B.y]], cost: Math.max(1, Math.ceil(d * p.fuel)), time: d / (p.speed * SPEED) };
}

export function route(v, to) {
  return leg(v, v.city, to);
}

export function destinations(v, from = v.city) {
  return CITIES.map((c) => leg(v, from, c.id)).filter(Boolean);
}

// legs for a list of stops starting where the vehicle is parked; a null leg means that hop is out of reach
export function planLegs(v, stops) {
  let from = v.city;
  return stops.map((to) => { const l = leg(v, from, to); from = to; return l; });
}

// fewest-miles chain of hops from one city to another (planes may need fuel stops on the way)
function hops(v, from) {
  const D = { [from]: 0 }, prev = {}, seen = new Set();
  for (;;) {
    let u = null;
    for (const id in D) if (!seen.has(id) && (u === null || D[id] < D[u])) u = id;
    if (u === null) break;
    seen.add(u);
    for (const l of destinations(v, u)) if (D[u] + l.len < (D[l.to] ?? Infinity)) { D[l.to] = D[u] + l.len; prev[l.to] = u; }
  }
  return { D, path: (to) => { const ids = []; for (let c = to; c !== from; c = prev[c]) ids.unshift(c); return ids; } };
}

const reachCache = new Map();
// can this vehicle get there from where it's parked, stopping along the way if needed?
export function canReach(v, to) {
  if (!v.city || v.city === to || !isOpen(to)) return false;
  // every port is on the same ocean, so boats never need a stop on the way
  if (v.kind === 'train') return !!railPath(v.city, to, !!ENGINES[v.model].maglev);
  if (v.kind === 'truck') return !!roadPath(v.city, to);
  if (v.kind === 'boat') return !!leg(v, v.city, to);
  const key = `${v.model}@${v.city}`;
  if (!reachCache.has(key)) reachCache.set(key, new Set(Object.keys(hops(v, v.city).D)));
  return reachCache.get(key).has(to);
}

// visit every on-board destination, nearest first, adding fuel stops where needed
export function autoPlan(v) {
  const left = new Set(v.cargo.map((j) => j.to).filter((to) => canReach(v, to)));
  const stops = [];
  let at = v.city;
  while (left.size) {
    const h = hops(v, at);
    let best = null;
    for (const id of left) if (h.D[id] != null && (best === null || h.D[id] < h.D[best])) best = id;
    if (best === null) break;
    for (const id of h.path(best)) { stops.push(id); left.delete(id); }
    at = best;
  }
  return stops;
}

function pickWeighted(items) {
  const total = items.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [k, w] of items) { r -= w; if (r <= 0) return k; }
  return items[items.length - 1][0];
}

// a new job at an unlocked town, headed to another unlocked town (null if there's nowhere to go)
function makeJob(g, from, forceTo, forceType) {
  const A = cityById[from];
  const types = [['pax', 5], ['cargo', 4]];
  // fuel and bulk only move by rail car or ship, so they start and end at stations and ports
  if ((A.rail || A.port) && g.level >= 3) types.push(['fuel', 2]);
  if ((A.rail || A.port) && g.level >= 2) types.push(['bulk', 2]);
  const type = forceType ?? pickWeighted(types);
  const heavy = type === 'fuel' || type === 'bulk';
  const cands = CITIES.filter((c) => c.id !== from && g.unlocked[c.id] && (!heavy || c.rail || c.port));
  if (!forceTo && !cands.length) return null;
  // heavy loads leaving a port lean toward other ports, so ships have work too
  const weight = (c) => (1 / (1 + (dist(from, c.id) / 70) ** 2)) * (heavy && A.port && c.port ? 3 : 1);
  const to = forceTo ?? pickWeighted(cands.map((c) => [c.id, weight(c)]));
  const pay = Math.round(10 + dist(from, to) * RATES[type]);
  return { id: g.nextId++, type, from, to, pay };
}

function newVehicle(g, kind, model, city, cars) {
  const s = SPECS[kind][model];
  const n = g.vehicles.filter((v) => v.model === model).length + 1;
  const v = { id: g.nextId++, kind, model, name: `${s.name} ${n}`, city, cargo: [], trip: null };
  if (kind === 'train' || kind === 'truck') v.cars = cars ?? [];
  return v;
}

function fresh() {
  const now = Date.now();
  const g = { v: 1, coins: 600, xp: 0, level: 1, nextId: 1, selected: 'bay', vehicles: [], jobs: {}, spawnAt: {}, saved: now };
  g.unlocked = Object.fromEntries(START_CITIES.map((id) => [id, true]));
  g.vehicles.push(newVehicle(g, 'train', 'puffer', 'bay', ['pax', 'box']));
  g.vehicles.push(newVehicle(g, 'plane', 'sparrow', 'bay'));
  g.vehicles.push(newVehicle(g, 'boat', 'coaster', 'mill'));
  g.vehicles.push(newVehicle(g, 'truck', 'pickup', 'bay'));
  for (const c of CITIES) {
    g.jobs[c.id] = [];
    g.spawnAt[c.id] = now + 4000 + Math.random() * 8000;
  }
  // a friendly start: something for the plane, train and pickup at Bayport, and the boat at Millbrook
  g.jobs.bay.push(makeJob(g, 'bay', 'gull', 'pax'), makeJob(g, 'bay', 'gull', 'pax'), makeJob(g, 'bay', 'gull', 'cargo'));
  g.jobs.bay.push(makeJob(g, 'bay', 'mill', 'pax'), makeJob(g, 'bay', 'mill', 'cargo'), makeJob(g, 'bay', 'mill', 'pax'));
  g.jobs.mill.push(makeJob(g, 'mill', 'gull', 'cargo'), makeJob(g, 'mill', 'gull', 'pax'), makeJob(g, 'mill', 'bay', 'cargo'));
  for (let i = 0; i < 4; i++) g.jobs.gull.push(makeJob(g, 'gull'));
  return g;
}

function load() {
  try {
    const s = localStorage.getItem(KEY);
    if (!s) return null;
    const g = JSON.parse(s);
    if (!g || g.v !== 1) return null;
    // older saves predate the bigger world: give new towns a job board
    for (const c of CITIES) { g.jobs[c.id] ??= []; g.spawnAt[c.id] ??= Date.now() + (g.skew ?? 0) + Math.random() * 8000; }
    if (!g.unlocked) {
      // older saves predate unlocking: keep the starting towns plus anywhere the fleet is, is headed or has cargo for
      const keep = new Set(START_CITIES);
      for (const v of g.vehicles) {
        if (v.city) keep.add(v.city);
        if (v.trip) keep.add(v.trip.to);
        for (const l of v.next ?? []) keep.add(l.to);
        for (const j of v.cargo) keep.add(j.to);
      }
      g.unlocked = Object.fromEntries([...keep].map((id) => [id, true]));
      for (const id in g.jobs) g.jobs[id] = keep.has(id) ? g.jobs[id].filter((j) => keep.has(j.to)) : [];
    }
    return g;
  } catch { return null; }
}

const loaded = load();
export const game = $state(loaded ?? fresh());
export const ui = $state({
  tab: 'city', sheetOpen: true, activeVehicle: null, picking: false, plan: [],
  focusVehicle: null, toasts: [], focus: null, follow: null, track: null,
});
// Game time runs ahead of the wall clock when dev mode speeds it up. The extra is kept
// in skew, which is saved so trips stay in place across reloads.
let skew = game.skew ?? 0, lastReal = Date.now();
export const dev = $state({ on: (() => { try { return localStorage.getItem(KEY + '-dev') === '1'; } catch { return false; } })(), speed: 1 });
export function gameNow() {
  const r = Date.now();
  skew += (r - lastReal) * (dev.speed - 1);
  lastReal = r;
  return r + skew;
}
export const clock = $state({ now: gameNow() });

export function save() {
  try { game.saved = Date.now(); game.skew = skew; localStorage.setItem(KEY, JSON.stringify($state.snapshot(game))); } catch {}
}

let tid = 0;
let quiet = false;
export function toast(text, kind = 'info') {
  if (quiet) return;
  const id = ++tid;
  ui.toasts.push({ id, text, kind });
  if (ui.toasts.length > 3) ui.toasts.shift();
  setTimeout(() => {
    const i = ui.toasts.findIndex((t) => t.id === id);
    if (i >= 0) ui.toasts.splice(i, 1);
  }, 3400);
}

export const fmt = (n) => Math.round(n).toLocaleString('en-US');
export function fmtTime(s) {
  s = Math.max(0, Math.ceil(s));
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`;
}
export function etaText(v) {
  if (!v.trip) return '';
  return fmtTime((v.trip.startAt + v.trip.dur - clock.now) / 1000);
}

// the whole route a moving vehicle is on, from where it set out to its last stop
export function tripInfo(v, now = clock.now) {
  const t = v.trip, rest = v.next ?? [];
  const left = (1 - tripProgress(t, now)) * t.len + rest.reduce((s, l) => s + l.len, 0);
  // saves from before routes were tracked only know about the current leg
  const d = v.depart ?? { from: t.from, at: t.startAt, len: t.len + rest.reduce((s, l) => s + l.len, 0) };
  const endAt = tripEnd(v) + rest.reduce((s, l) => s + l.dur, 0);
  return {
    from: d.from, to: rest.length ? rest[rest.length - 1].to : t.to, next: t.to, stops: rest.length,
    departAt: d.at, nextAt: tripEnd(v), endAt, len: d.len, left,
    progress: Math.min(1, Math.max(0, (now - d.at) / (endAt - d.at))),
  };
}

function unlocksAt(level) {
  const out = [];
  for (const s of [...Object.values(PLANES), ...Object.values(ENGINES), ...Object.values(CARS), ...Object.values(BOATS), ...Object.values(TRUCKS), ...Object.values(TRAILERS)]) if (s.level === level) out.push(s.short ?? s.name);
  return out;
}

function earn(amount) {
  game.coins += amount;
  game.xp += Math.max(4, Math.round(amount / 8));
  while (game.level < LEVELS.length && game.xp >= LEVELS[game.level]) {
    game.level++;
    const n = unlocksAt(game.level);
    const was = quiet; quiet = false;
    toast(`Level ${game.level}! ${n.length ? `New in the shop: ${n.join(', ')}` : ''}`, 'level');
    quiet = was;
  }
}

const tripEnd = (v) => v.trip.startAt + v.trip.dur;

// hand over everything on board that's for this town, and get paid for it
function dropOff(v, to) {
  let total = 0, n = 0;
  v.cargo = v.cargo.filter((j) => {
    if (j.to === to) { total += j.pay; n++; return false; }
    return true;
  });
  if (n) earn(total);
  if (n && !quiet) fx.push({ x: cityById[to].x, y: cityById[to].y, text: `+$${fmt(total)}`, t: Date.now() });
  return { n, total };
}

// short lived effects for the map to draw, like money floating up from a drop off
export const fx = [];

// at is when the leg finished, so chained legs line up even when catching up after time away
function arrive(v, at) {
  const to = v.trip.to;
  const { n, total } = dropOff(v, to);
  const name = cityById[to].name;
  const next = v.next?.shift();
  if (next) {
    v.trip = { ...next, startAt: at };
    if (n) toast(`${v.name} dropped off ${n} at ${name}. +$${fmt(total)}`, 'good');
    return;
  }
  v.city = to;
  v.trip = null;
  delete v.depart;
  if (ui.track === v.id) ui.track = null;
  if (n) toast(`${v.name} delivered ${n} at ${name}. +$${fmt(total)}`, 'good');
  else toast(`${v.name} arrived at ${name}`);
}

function ownJobs(id) { return game.jobs[id].filter((j) => j.from === id).length; }
function addJob(id) {
  const j = makeJob(game, id);
  if (!j) return;
  game.jobs[id].push(j);
  // bulk comes in batches of three loads headed the same way
  if (j.type === 'bulk') for (let i = 0; i < 2; i++) game.jobs[id].push({ ...j, id: game.nextId++ });
}

// can this model be based at (start from, stop at) this city?
export function canBase(kind, model, c) {
  if (kind === 'train') return ENGINES[model].maglev ? onMaglev(c.id) : c.rail;
  if (kind === 'boat') return c.port && (!BOATS[model].harbor || c.rail);
  if (kind === 'truck') return c.road;
  const p = PLANES[model];
  return c.air || !!p.vtol || (!!p.seaplane && c.port);
}


// ---------- unlocking towns ----------

export function isOpen(id) { return !!game.unlocked[id]; }
export function connections(c) { return c.rail + c.air + c.port; }
export function unlockPrice(c) { return CITY_PRICE * connections(c); }

export function unlockCity(id) {
  const c = cityById[id], price = unlockPrice(c);
  if (isOpen(id)) return;
  if (game.coins < price) { toast(`You need $${fmt(price)} to unlock ${c.name}`, 'bad'); return; }
  game.coins -= price;
  game.unlocked[id] = true;
  reachCache.clear();
  for (let i = 0; i < 4; i++) addJob(id);
  toast(`${c.name} is open for business`, 'good');
}

function step() {
  const now = gameNow();
  // earliest arrival first, again and again, since one arrival can start a leg that's also done
  for (;;) {
    let v = null;
    for (const x of game.vehicles) if (x.trip && now >= tripEnd(x) && (!v || tripEnd(x) < tripEnd(v))) v = x;
    if (!v) break;
    arrive(v, tripEnd(v));
  }
  for (const c of CITIES) {
    // jobs are stamped the first time they're seen waiting; ones dropped off for a transfer never expire
    const list = game.jobs[c.id];
    for (const j of list) j.at ??= now;
    if (list.some((j) => j.from === c.id && now - j.at > JOB_TTL)) game.jobs[c.id] = list.filter((j) => j.from !== c.id || now - j.at <= JOB_TTL);
    if (now >= game.spawnAt[c.id]) {
      game.spawnAt[c.id] = now + 7000 + Math.random() * 8000;
      if (isOpen(c.id) && ownJobs(c.id) < JOB_CAP) addJob(c.id);
    }
  }
}

let started = false;
export function start() {
  if (started) return;
  started = true;
  const before = game.coins;
  quiet = true;
  step();
  for (const c of CITIES) if (isOpen(c.id)) for (let i = ownJobs(c.id); i < 4; i++) addJob(c.id);
  quiet = false;
  if (loaded && game.coins > before) toast(`Welcome back. Your fleet earned $${fmt(game.coins - before)} while you were away.`, 'good');
  setInterval(() => { clock.now = gameNow(); step(); }, 250);
  setInterval(save, 3000);
  document.addEventListener('visibilitychange', save);
  addEventListener('pagehide', save);
}

// ---------- actions ----------

export function selectCity(id, focus = false) {
  game.selected = id;
  ui.tab = 'city';
  ui.sheetOpen = true;
  ui.picking = false;
  ui.plan = [];
  const av = game.vehicles.find((v) => v.id === ui.activeVehicle);
  if (!av || av.city !== id) ui.activeVehicle = null;
  if (focus) ui.focus = { x: cityById[id].x, y: cityById[id].y, t: Date.now() };
}

export function openLoad(v) {
  if (!v.city) return;
  selectCity(v.city, true);
  ui.activeVehicle = v.id;
}

export function followVehicle(v) {
  ui.follow = v.id;
  ui.track = v.id;
}

export function loadJob(v, job) {
  const list = game.jobs[v.city];
  const i = list.findIndex((j) => j.id === job.id);
  if (i < 0 || !canLoad(v, job)) return;
  const [j] = list.splice(i, 1);
  v.cargo.push(j);
}

export function unloadJob(v, job) {
  if (!v.city) return;
  const i = v.cargo.findIndex((j) => j.id === job.id);
  if (i < 0) return;
  const [j] = v.cargo.splice(i, 1);
  // put back at its own town, it gets a fresh wait
  if (j.from === v.city) j.at = gameNow();
  game.jobs[v.city].push(j);
}

export function autoLoad(v) {
  // only jobs this vehicle can get to their destination, best paying first
  const list = [...game.jobs[v.city]].filter((j) => canReach(v, j.to)).sort((a, b) => b.pay - a.pay);
  let n = 0;
  for (const j of list) if (canLoad(v, j)) { loadJob(v, j); n++; }
  if (!n) toast(list.length ? 'Nothing more fits on board' : `No jobs here that ${v.name} can deliver`);
}

// add a stop to the route being planned, or take it off again if it's the last one
export function toggleStop(v, id) {
  const p = ui.plan;
  if (p.length && p[p.length - 1] === id) { p.pop(); return; }
  if (!isOpen(id)) { toast(`${cityById[id].name} is locked. Unlock it from its city panel.`, 'bad'); return; }
  if (leg(v, p.length ? p[p.length - 1] : v.city, id)) p.push(id);
  else toast(`${v.name} can’t reach ${cityById[id].name} from ${cityById[p.length ? p[p.length - 1] : v.city].name}`, 'bad');
}

// fuel for the whole route is paid up front
export function dispatch(v, stops) {
  const legs = planLegs(v, stops);
  const bad = legs.findIndex((l) => !l);
  if (!legs.length || bad >= 0) { toast(`${v.name} can’t reach ${cityById[stops[Math.max(0, bad)]].name} on this route`, 'bad'); return false; }
  const cost = legs.reduce((s, l) => s + l.cost, 0);
  if (game.coins < cost) { toast(`Not enough coins for fuel. You need $${fmt(cost)}.`, 'bad'); return false; }
  game.coins -= cost;
  const [first, ...rest] = legs.map((l) => ({ from: l.from, to: l.to, pts: l.pts, len: l.len, dur: l.time * 1000, cost: l.cost }));
  v.trip = { ...first, startAt: gameNow() };
  v.next = rest;
  v.depart = { from: v.city, at: v.trip.startAt, len: legs.reduce((s, l) => s + l.len, 0) };
  v.city = null;
  toast(rest.length ? `${v.name} left on a ${legs.length} stop route. Fuel $${fmt(cost)}` : `${v.name} left for ${cityById[first.to].name}. Fuel $${cost}`);
  return true;
}

// drop the rest of the route after the current leg, refunding fuel for legs not flown or driven
export function endRoute(v) {
  if (!v.next?.length) return;
  const refund = v.next.reduce((s, l) => s + l.cost, 0);
  v.next = [];
  game.coins += refund;
  toast(`${v.name} will stop at ${cityById[v.trip.to].name}. Refunded $${fmt(refund)}`);
}

function spend(price, level, label) {
  if (game.level < level) { toast(`${label} unlocks at level ${level}`, 'bad'); return false; }
  if (game.coins < price) { toast(`You need $${fmt(price)} for that`, 'bad'); return false; }
  game.coins -= price;
  return true;
}

export function buyPlane(model) {
  const c = cityById[game.selected], p = PLANES[model];
  if (!isOpen(c.id)) { toast(`Unlock ${c.name} first`, 'bad'); return; }
  if (!canBase('plane', model, c)) { toast(`${c.name} has no airport${p.seaplane ? ' or port' : ''}. Pick another city first.`, 'bad'); return; }
  if (!spend(p.price, p.level, p.name)) return;
  const v = newVehicle(game, 'plane', model, c.id);
  game.vehicles.push(v);
  toast(`${v.name} is waiting at ${c.name}`, 'good');
  ui.tab = 'fleet';
  ui.focusVehicle = v.id;
}

export function buyBoat(model) {
  const c = cityById[game.selected], b = BOATS[model];
  if (!isOpen(c.id)) { toast(`Unlock ${c.name} first`, 'bad'); return; }
  if (!canBase('boat', model, c)) { toast(b.harbor ? `${b.name} needs a port with a rail station` : `${c.name} has no port. Pick a port city first.`, 'bad'); return; }
  if (!spend(b.price, b.level, b.name)) return;
  const v = newVehicle(game, 'boat', model, c.id);
  game.vehicles.push(v);
  toast(`${v.name} is moored at ${c.name}`, 'good');
  ui.tab = 'fleet';
  ui.focusVehicle = v.id;
}

export function buyTruck(model) {
  const c = cityById[game.selected], t = TRUCKS[model];
  if (!isOpen(c.id)) { toast(`Unlock ${c.name} first`, 'bad'); return; }
  if (!canBase('truck', model, c)) { toast(`${c.name} has no roads. Pick a mainland town first.`, 'bad'); return; }
  if (!spend(t.price, t.level, t.name)) return;
  const v = newVehicle(game, 'truck', model, c.id, []);
  game.vehicles.push(v);
  toast(t.maxCars ? `${v.name} is at ${c.name}. Hook up a trailer.` : `${v.name} is parked at ${c.name}`, 'good');
  ui.tab = 'fleet';
  ui.focusVehicle = v.id;
}

export function buyEngine(model) {
  const c = cityById[game.selected], e = ENGINES[model];
  if (!isOpen(c.id)) { toast(`Unlock ${c.name} first`, 'bad'); return; }
  if (!canBase('train', model, c)) { toast(e.maglev ? `${c.name} isn’t on a maglev line` : `${c.name} has no station. Pick a station city first.`, 'bad'); return; }
  if (!spend(e.price, e.level, e.name)) return;
  const v = newVehicle(game, 'train', model, c.id, []);
  game.vehicles.push(v);
  toast(`${v.name} is at ${c.name}. Add some cars to it.`, 'good');
  ui.tab = 'fleet';
  ui.focusVehicle = v.id;
}

export function addCar(v, type) {
  const car = tailSpecs(v)[type], e = spec(v), what = v.kind === 'truck' ? 'trailer' : 'car';
  if (!v.city) return;
  if (v.cars.length >= e.maxCars) { toast(`${e.name} can pull ${e.maxCars} ${what}${e.maxCars > 1 ? 's' : ''} at most`, 'bad'); return; }
  if (e.freightOnly && car.holds === 'pax') { toast(`${e.name} only pulls freight cars`, 'bad'); return; }
  if (!spend(car.price, car.level, car.name)) return;
  v.cars.push(type);
}

export function canRemoveCar(v, i) {
  if (!v.city) return false;
  const after = { ...v, cars: v.cars.filter((_, k) => k !== i) };
  const cap = capacity(after), u = used(v);
  return JOB_TYPES.every((t) => u[t] <= cap[t]);
}

export function removeCar(v, i) {
  if (!canRemoveCar(v, i)) { toast('Drop off what’s in that car first', 'bad'); return; }
  const [t] = v.cars.splice(i, 1);
  game.coins += Math.floor(tailSpecs(v)[t].price / 2);
}

// trains swap engines and trucks swap tractors, keeping what's hooked up behind
export function upgradeCost(v, model) {
  return SPECS[v.kind][model].price - Math.floor(spec(v).price / 2);
}

export function upgradeEngine(v, model) {
  const e = SPECS[v.kind][model];
  if (!v.city) return;
  if (e.maglev && !onMaglev(v.city)) { toast(`${cityById[v.city].name} isn’t on a maglev line`, 'bad'); return; }
  if (e.freightOnly && v.cars.some((c) => tailSpecs(v)[c].holds === 'pax')) { toast(`${e.name} only pulls freight cars. Sell the passenger cars first.`, 'bad'); return; }
  if (!spend(upgradeCost(v, model), e.level, e.name)) return;
  v.model = model;
  const n = game.vehicles.filter((x) => x.model === model && x.id !== v.id).length + 1;
  v.name = `${e.name} ${n}`;
  toast(`Swapped in a ${e.name}`, 'good');
}

export function sellValue(v) {
  const base = Math.floor(spec(v).price / 2);
  return v.cars ? base + v.cars.reduce((s, c) => s + Math.floor(tailSpecs(v)[c].price / 2), 0) : base;
}

export function sellVehicle(v) {
  if (!v.city || v.cargo.length || aboard(v).length || game.vehicles.length <= 1) return;
  game.coins += sellValue(v);
  game.vehicles.splice(game.vehicles.findIndex((x) => x.id === v.id), 1);
  if (ui.activeVehicle === v.id) ui.activeVehicle = null;
  toast(`Sold ${v.name}`);
}

// ---------- car ferries ----------

// trucks riding on this ferry
export function aboard(f) { return game.vehicles.filter((t) => t.aboard === f.id); }
export function carrierOf(t) { return t.aboard != null ? game.vehicles.find((f) => f.id === t.aboard) : null; }
// how much ferry deck a truck takes up, trailers and all
export function deckSize(t) { return TRUCKS[t.model].deck + t.cars.reduce((s, c) => s + TRAILERS[c].deck, 0); }
export function deckUsed(f) { return aboard(f).reduce((s, t) => s + deckSize(t), 0); }
export function canBoard(f, t) {
  return !!f.city && t.city === f.city && t.kind === 'truck' && !TRUCKS[t.model].noFerry && deckUsed(f) + deckSize(t) <= (BOATS[f.model].deck ?? 0);
}

export function driveOn(f, t) {
  if (TRUCKS[t.model].noFerry) { toast(`A ${TRUCKS[t.model].name} is too long for the ferry`, 'bad'); return; }
  if (!canBoard(f, t)) { toast(`No room for ${t.name} on the deck`, 'bad'); return; }
  t.aboard = f.id;
  t.city = null;
  if (ui.activeVehicle === t.id) ui.activeVehicle = f.id;
}

// a truck drives off wherever the ferry is docked, dropping off anything it has for this town
export function driveOff(f, t) {
  if (!f.city || t.aboard !== f.id) return;
  delete t.aboard;
  t.city = f.city;
  const { n, total } = dropOff(t, f.city);
  if (n) toast(`${t.name} delivered ${n} at ${cityById[f.city].name}. +$${fmt(total)}`, 'good');
}

export function resetGame() {
  if (!confirm('Start a new game? Your current progress will be gone.')) return;
  const g = fresh();
  for (const k of Object.keys(game)) delete game[k];
  Object.assign(game, g);
  reachCache.clear();
  skew = 0;
  dev.speed = 1;
  Object.assign(ui, { tab: 'city', sheetOpen: true, activeVehicle: null, picking: false, plan: [], focusVehicle: null, follow: null, track: null, focus: { x: cityById.bay.x, y: cityById.bay.y, t: Date.now() } });
  save();
}

// ---------- dev mode: for trying things out ----------

export function setDev(on) {
  dev.on = on;
  if (!on) { dev.speed = 1; if (ui.tab === 'dev') ui.tab = 'city'; }
  try { localStorage.setItem(KEY + '-dev', on ? '1' : '0'); } catch {}
}

export function devCoins(n) { game.coins += n; }

export function devMaxLevel() {
  game.level = LEVELS.length;
  game.xp = Math.max(game.xp, LEVELS[LEVELS.length - 1]);
  toast(`Level ${game.level}. Everything in the shop is unlocked.`, 'level');
}

// a free vehicle of any model at the selected city, if it has the right station, airport, port or roads
export function devSpawn(kind, model) {
  const c = cityById[game.selected];
  if (!isOpen(c.id)) { toast(`Unlock ${c.name} first`, 'bad'); return; }
  if (!canBase(kind, model, c)) { toast(`${SPECS[kind][model].name} can’t be based at ${c.name}`, 'bad'); return; }
  const s = SPECS[kind][model];
  const mix = kind === 'truck' ? ['van', 'dump', 'tank'] : s.freightOnly ? ['box', 'tank', 'hopper'] : ['pax', 'box', 'tank', 'hopper'];
  const v = newVehicle(game, kind, model, c.id, s.maxCars ? Array(s.maxCars).fill(0).map((_, i) => mix[i % mix.length]) : undefined);
  game.vehicles.push(v);
  toast(`${v.name} added at ${c.name}`, 'good');
}

// jump every trip to the end of its current leg
export function devFinishLegs() {
  const now = gameNow();
  for (const v of game.vehicles) if (v.trip) v.trip.startAt = now - v.trip.dur;
  step();
}

export function devFillJobs() {
  if (!isOpen(game.selected)) { toast('Unlock this town first', 'bad'); return; }
  for (let i = 0; i < 6; i++) addJob(game.selected);
}

export function devUnlockAll() {
  for (const c of CITIES) if (!isOpen(c.id)) { game.unlocked[c.id] = true; for (let i = 0; i < 4; i++) addJob(c.id); }
  reachCache.clear();
  toast('Every town is unlocked', 'good');
}
