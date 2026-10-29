import { CITIES, RAILS, ENGINES, CARS, PLANES, BOATS, LEVELS, RATES, SPEED } from './data.js';
import { seaLane } from './sea.js';

const KEY = 'pixel-transport-save-v1';
const JOB_CAP = 6;

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

const railCache = new Map();
export function railPath(from, to) {
  if (!cityById[from]?.rail || !cityById[to]?.rail) return null;
  const key = `${from}>${to}`;
  if (!railCache.has(key)) railCache.set(key, findRail(from, to));
  return railCache.get(key);
}

function findRail(from, to) {
  const D = {}, prev = {}, seen = new Set();
  for (const c of CITIES) D[c.id] = Infinity;
  D[from] = 0;
  for (;;) {
    let u = null;
    for (const id in D) if (!seen.has(id) && D[id] < Infinity && (u === null || D[id] < D[u])) u = id;
    if (u === null) return null;
    if (u === to) break;
    seen.add(u);
    for (const [v, w] of adj[u]) if (D[u] + w < D[v]) { D[v] = D[u] + w; prev[v] = u; }
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

const SPECS = { train: ENGINES, plane: PLANES, boat: BOATS };
export function spec(v) { return SPECS[v.kind][v.model]; }

export function capacity(v) {
  if (v.kind === 'plane') { const p = PLANES[v.model]; return { pax: p.pax, cargo: p.cargo, fuel: 0 }; }
  if (v.kind === 'boat') return { ...BOATS[v.model].cap };
  const cap = { pax: 0, cargo: 0, fuel: 0 };
  for (const c of v.cars) cap[CARS[c].holds] += CARS[c].cap;
  return cap;
}

export function used(v) {
  const u = { pax: 0, cargo: 0, fuel: 0 };
  for (const j of v.cargo) u[j.type]++;
  return u;
}

export function canLoad(v, job) {
  return used(v)[job.type] < capacity(v)[job.type];
}

// one hop between two cities for this vehicle, or null if it can't make it
export function leg(v, from, to) {
  if (!from || from === to) return null;
  if (v.kind === 'train') {
    const p = railPath(from, to);
    if (!p) return null;
    const e = ENGINES[v.model];
    return {
      from, to, len: p.len,
      pts: p.ids.map((id) => [cityById[id].x, cityById[id].y]),
      cost: Math.max(1, Math.ceil(p.len * (e.run + 0.04 * v.cars.length))),
      time: p.len / (e.speed * SPEED),
    };
  }
  if (v.kind === 'boat') {
    const lane = seaLane(from, to), b = BOATS[v.model];
    if (!lane) return null;
    return { from, to, len: lane.len, pts: lane.pts, cost: Math.max(1, Math.ceil(lane.len * b.run)), time: lane.len / (b.speed * SPEED) };
  }
  const A = cityById[from], B = cityById[to], p = PLANES[v.model];
  if ((!A.air || !B.air) && !p.vtol) return null;
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
  if (!v.city || v.city === to) return false;
  // every port is on the same ocean, so boats never need a stop on the way
  if (v.kind === 'train') return !!railPath(v.city, to);
  if (v.kind === 'boat') return !!seaLane(v.city, to);
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

function makeJob(g, from, forceTo, forceType) {
  const A = cityById[from];
  const types = [['pax', 5], ['cargo', 4]];
  // fuel only moves by tanker car or oil tanker, so it starts and ends at stations and ports
  if ((A.rail || A.port) && g.level >= 3) types.push(['fuel', 2]);
  const type = forceType ?? pickWeighted(types);
  const cands = CITIES.filter((c) => c.id !== from && (type !== 'fuel' || c.rail || c.port));
  const to = forceTo ?? pickWeighted(cands.map((c) => [c.id, 1 / (1 + (dist(from, c.id) / 70) ** 2)]));
  const pay = Math.round(10 + dist(from, to) * RATES[type]);
  return { id: g.nextId++, type, from, to, pay };
}

function newVehicle(g, kind, model, city, cars) {
  const s = SPECS[kind][model];
  const n = g.vehicles.filter((v) => v.model === model).length + 1;
  const v = { id: g.nextId++, kind, model, name: `${s.name} ${n}`, city, cargo: [], trip: null };
  if (kind === 'train') v.cars = cars ?? [];
  return v;
}

function fresh() {
  const now = Date.now();
  const g = { v: 1, coins: 600, xp: 0, level: 1, nextId: 1, selected: 'bay', vehicles: [], jobs: {}, spawnAt: {}, saved: now };
  g.vehicles.push(newVehicle(g, 'train', 'puffer', 'bay', ['pax', 'box']));
  g.vehicles.push(newVehicle(g, 'plane', 'sparrow', 'bay'));
  g.vehicles.push(newVehicle(g, 'boat', 'coaster', 'mill'));
  for (const c of CITIES) {
    g.jobs[c.id] = [];
    g.spawnAt[c.id] = now + 4000 + Math.random() * 8000;
  }
  // a friendly start at Bayport: something for each vehicle
  const b = g.jobs.bay;
  b.push(makeJob(g, 'bay', 'gull', 'pax'), makeJob(g, 'bay', 'gull', 'pax'), makeJob(g, 'bay', 'gull', 'cargo'));
  b.push(makeJob(g, 'bay', 'mid', 'pax'), makeJob(g, 'bay', 'mid', 'cargo'), makeJob(g, 'bay', 'cedar', 'pax'));
  // and a boat run from Millbrook, the nearest port, out to islands planes can't reach
  g.jobs.mill.push(makeJob(g, 'mill', 'shellbeach', 'cargo'), makeJob(g, 'mill', 'shellbeach', 'pax'), makeJob(g, 'mill', 'gull', 'cargo'));
  for (const c of CITIES) if (c.id !== 'bay') for (let i = 0; i < 4; i++) g.jobs[c.id].push(makeJob(g, c.id));
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
    return g;
  } catch { return null; }
}

const loaded = load();
export const game = $state(loaded ?? fresh());
export const ui = $state({
  tab: 'city', sheetOpen: true, activeVehicle: null, picking: false, plan: [],
  focusVehicle: null, toasts: [], focus: null, follow: null,
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

function unlocksAt(level) {
  const out = [];
  for (const s of [...Object.values(PLANES), ...Object.values(ENGINES), ...Object.values(CARS), ...Object.values(BOATS)]) if (s.level === level) out.push(s.short ?? s.name);
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

// at is when the leg finished, so chained legs line up even when catching up after time away
function arrive(v, at) {
  const to = v.trip.to;
  let total = 0, n = 0;
  v.cargo = v.cargo.filter((j) => {
    if (j.to === to) { total += j.pay; n++; return false; }
    return true;
  });
  if (n) earn(total);
  const name = cityById[to].name;
  const next = v.next?.shift();
  if (next) {
    v.trip = { ...next, startAt: at };
    if (n) toast(`${v.name} dropped off ${n} at ${name}. +$${fmt(total)}`, 'good');
    return;
  }
  v.city = to;
  v.trip = null;
  if (n) toast(`${v.name} delivered ${n} at ${name}. +$${fmt(total)}`, 'good');
  else toast(`${v.name} arrived at ${name}`);
}

function ownJobs(id) { return game.jobs[id].filter((j) => j.from === id).length; }

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
    if (now >= game.spawnAt[c.id]) {
      game.spawnAt[c.id] = now + 7000 + Math.random() * 8000;
      if (ownJobs(c.id) < JOB_CAP) game.jobs[c.id].push(makeJob(game, c.id));
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
  for (const c of CITIES) while (ownJobs(c.id) < 4) game.jobs[c.id].push(makeJob(game, c.id));
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
  if (!c.air && !p.vtol) { toast(`${c.name} has no airport. Pick an airport city first.`, 'bad'); return; }
  if (!spend(p.price, p.level, p.name)) return;
  const v = newVehicle(game, 'plane', model, c.id);
  game.vehicles.push(v);
  toast(`${v.name} is waiting at ${c.name}`, 'good');
  ui.tab = 'fleet';
  ui.focusVehicle = v.id;
}

export function buyBoat(model) {
  const c = cityById[game.selected], b = BOATS[model];
  if (!c.port) { toast(`${c.name} has no port. Pick a port city first.`, 'bad'); return; }
  if (!spend(b.price, b.level, b.name)) return;
  const v = newVehicle(game, 'boat', model, c.id);
  game.vehicles.push(v);
  toast(`${v.name} is moored at ${c.name}`, 'good');
  ui.tab = 'fleet';
  ui.focusVehicle = v.id;
}

export function buyEngine(model) {
  const c = cityById[game.selected], e = ENGINES[model];
  if (!c.rail) { toast(`${c.name} has no station. Pick a station city first.`, 'bad'); return; }
  if (!spend(e.price, e.level, e.name)) return;
  const v = newVehicle(game, 'train', model, c.id, []);
  game.vehicles.push(v);
  toast(`${v.name} is at ${c.name}. Add some cars to it.`, 'good');
  ui.tab = 'fleet';
  ui.focusVehicle = v.id;
}

export function addCar(v, type) {
  const car = CARS[type], e = ENGINES[v.model];
  if (!v.city) return;
  if (v.cars.length >= e.maxCars) { toast(`${e.name} can pull ${e.maxCars} cars at most`, 'bad'); return; }
  if (!spend(car.price, car.level, car.name)) return;
  v.cars.push(type);
}

export function canRemoveCar(v, i) {
  if (!v.city) return false;
  const after = { ...v, cars: v.cars.filter((_, k) => k !== i) };
  const cap = capacity(after), u = used(v);
  return u.pax <= cap.pax && u.cargo <= cap.cargo && u.fuel <= cap.fuel;
}

export function removeCar(v, i) {
  if (!canRemoveCar(v, i)) { toast('Drop off what’s in that car first', 'bad'); return; }
  const [t] = v.cars.splice(i, 1);
  game.coins += Math.floor(CARS[t].price / 2);
}

export function upgradeCost(v, model) {
  return ENGINES[model].price - Math.floor(ENGINES[v.model].price / 2);
}

export function upgradeEngine(v, model) {
  const e = ENGINES[model];
  if (!v.city) return;
  if (!spend(upgradeCost(v, model), e.level, e.name)) return;
  v.model = model;
  const n = game.vehicles.filter((x) => x.model === model && x.id !== v.id).length + 1;
  v.name = `${e.name} ${n}`;
  toast(`Swapped in a ${e.name}`, 'good');
}

export function sellValue(v) {
  const base = Math.floor(spec(v).price / 2);
  return v.kind === 'train' ? base + v.cars.reduce((s, c) => s + Math.floor(CARS[c].price / 2), 0) : base;
}

export function sellVehicle(v) {
  if (!v.city || v.cargo.length || game.vehicles.length <= 1) return;
  game.coins += sellValue(v);
  game.vehicles.splice(game.vehicles.findIndex((x) => x.id === v.id), 1);
  if (ui.activeVehicle === v.id) ui.activeVehicle = null;
  toast(`Sold ${v.name}`);
}

export function resetGame() {
  if (!confirm('Start a new game? Your current progress will be gone.')) return;
  const g = fresh();
  for (const k of Object.keys(game)) delete game[k];
  Object.assign(game, g);
  skew = 0;
  dev.speed = 1;
  Object.assign(ui, { tab: 'city', sheetOpen: true, activeVehicle: null, picking: false, plan: [], focusVehicle: null, follow: null, focus: { x: cityById.bay.x, y: cityById.bay.y, t: Date.now() } });
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

// a free vehicle of any model at the selected city, if it has the right station, airport or port
export function devSpawn(kind, model) {
  const c = cityById[game.selected];
  const need = { train: ['rail', 'station'], plane: ['air', 'airport'], boat: ['port', 'port'] }[kind];
  if (!c[need[0]] && !(kind === 'plane' && PLANES[model].vtol)) { toast(`${c.name} has no ${need[1]}`, 'bad'); return; }
  const v = newVehicle(game, kind, model, c.id, kind === 'train' ? Array(ENGINES[model].maxCars).fill(0).map((_, i) => ['pax', 'box', 'tank'][i % 3]) : undefined);
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
  const id = game.selected;
  for (let i = 0; i < 6; i++) game.jobs[id].push(makeJob(game, id));
}
