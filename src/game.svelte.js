import { CITIES, RAILS, ROADS, ROAD_OFF, LANE, roadSide, ENGINES, CARS, PLANES, BOATS, BARGES, TRUCKS, TRAILERS, LEVELS, RATES, SPEED, CITY_PRICE, START_CITIES, JOB_TYPES, MAGLEV_LINES, HQ, WEAR, MAIL, WIDE, SECURE, GROWTH, SIZE_NAME, DEPOT, TYPE_LABEL, CONTRACTS, SUPERLOAD, ESCORT_LABEL } from './data.js';
import { seaLane } from './sea.js';

const KEY = 'pixel-transport-save-v1';
// a repeating vehicle with nothing to carry anywhere on its loop checks again this often (game time)
const LOOP_WAIT = 30 * 1000;
const JOB_CAP = 6;
// a job left waiting at its town this long (game time) goes elsewhere, so towns can't clog up
export const JOB_TTL = 15 * 60 * 1000;
export const jobTtl = (j) => (j.type === 'mail' ? MAIL.ttl : j.type === 'secure' ? SECURE.ttl : JOB_TTL);

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
// what a train, truck or tug hooks up behind it: cars, trailers or barges
const TAILS = { train: CARS, truck: TRAILERS, boat: BARGES };
const TAIL_NAME = { train: 'car', truck: 'trailer', boat: 'barge' };
export function tailSpecs(v) { return TAILS[v.kind]; }
export function tailName(v) { return TAIL_NAME[v.kind]; }

const none = () => Object.fromEntries(JOB_TYPES.map((t) => [t, 0]));

export function capacity(v) {
  const cap = none();
  if (v.kind === 'plane') { const p = PLANES[v.model]; cap.pax = p.pax; cap.cargo = p.cargo; Object.assign(cap, p.hold); }
  else {
    Object.assign(cap, spec(v).cap);
    const tails = tailSpecs(v);
    for (const c of v.cars ?? []) cap[tails[c].holds] += tails[c].cap;
  }
  return cap;
}

export function used(v) {
  const u = none();
  for (const j of v.cargo) u[j.type]++;
  return u;
}

export function canLoad(v, job) {
  // a superload carrier carries one superload of its own kind (road, rail or sea) and nothing else
  if (job.escort) return v.kind === SUPER_KIND[job.by ?? 'road'] && !!spec(v).superload && !v.cargo.some((j) => j.escort);
  return used(v)[job.type] < capacity(v)[job.type];
}

// how much extra fuel a vehicle burns from the miles on it, from 0 up to WEAR.max
export function wear(v) {
  return Math.min(WEAR.max, Math.floor((v.miles ?? 0) / WEAR.per) * WEAR.step);
}
const fuel = (v, base) => Math.max(1, Math.ceil(base * (1 + wear(v))));

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
      cost: fuel(v, p.len * (e.run + 0.04 * v.cars.length)),
      time: p.len / (e.speed * SPEED),
    };
  }
  if (v.kind === 'truck') {
    const t = TRUCKS[v.model], p = roadPath(from, to);
    if (p) return {
      from, to, len: p.len, pts: roadPts(p.ids),
      cost: fuel(v, p.len * (t.run + 0.03 * v.cars.length)),
      time: p.len / (t.speed * SPEED),
    };
    // an amphibious truck with no road there swims, port to port
    const lane = t.amphibious && cityById[from].port && cityById[to].port && seaLane(from, to);
    if (!lane) return null;
    return { from, to, len: lane.len, pts: lane.pts, sea: true, cost: fuel(v, lane.len * t.run), time: lane.len / (t.swim * SPEED) };
  }
  if (v.kind === 'boat') {
    const b = BOATS[v.model];
    if (!canBase('boat', v.model, cityById[from]) || !canBase('boat', v.model, cityById[to])) return null;
    const lane = seaLane(from, to);
    if (!lane) return null;
    return { from, to, len: lane.len, pts: lane.pts, cost: fuel(v, lane.len * (b.run + 0.02 * (v.cars?.length ?? 0))), time: lane.len / (b.speed * SPEED) };
  }
  const A = cityById[from], B = cityById[to], p = PLANES[v.model];
  if (!canBase('plane', v.model, A) || !canBase('plane', v.model, B)) return null;
  const d = Math.hypot(A.x - B.x, A.y - B.y);
  if (d > p.range) return null;
  return { from, to, len: d, pts: [[A.x, A.y], [B.x, B.y]], cost: fuel(v, d * p.fuel), time: d / (p.speed * SPEED) };
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
  if (v.kind === 'truck' && !TRUCKS[v.model].amphibious) return !!roadPath(v.city, to);
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

// the level each job type starts turning up at, and how often it does after that
const TYPE_LEVEL = { pax: 1, cargo: 1, bulk: 4, fuel: 6, mail: MAIL.level, wide: WIDE.level, secure: SECURE.level };
const TYPE_WEIGHT = { pax: 5, cargo: 4, fuel: 2, bulk: 2, mail: 3, wide: 1, secure: 2 };

// the job types town A turns up, as [type, weight] pairs
function jobTypes(g, A) {
  const types = [['pax', TYPE_WEIGHT.pax], ['cargo', TYPE_WEIGHT.cargo]];
  // fuel and bulk only move by rail car or ship, so they start and end at stations and ports
  if ((A.rail || A.port) && g.level >= TYPE_LEVEL.fuel) types.push(['fuel', TYPE_WEIGHT.fuel]);
  if ((A.rail || A.port) && g.level >= TYPE_LEVEL.bulk) types.push(['bulk', TYPE_WEIGHT.bulk]);
  if (g.level >= MAIL.level) types.push(['mail', TYPE_WEIGHT.mail]);
  if (g.level >= SECURE.level) types.push(['secure', TYPE_WEIGHT.secure]);
  if (A.road && g.level >= WIDE.level && jobDests(g, A, 'wide').length) types.push(['wide', TYPE_WEIGHT.wide]);
  return types;
}

// where a job of this type leaving town A could be headed, as [id, weight] pairs. lean is a
// town to count as wanted by a contract, on top of the ones that are.
function jobDests(g, A, type, lean = null) {
  const heavy = type === 'fuel' || type === 'bulk';
  // wide loads only go overland (by road or rail), so they stay on their own landmass
  const cands = CITIES.filter((c) => c.id !== A.id && g.unlocked[c.id] && (!heavy || c.rail || c.port) && (type !== 'wide' || (c.road && c.cont === A.cont)));
  // heavy loads leaving a port lean toward other ports, so ships have work too, and jobs lean
  // toward towns a contract wants them in
  const wanted = (c) => c.id === lean || (g.contracts?.active ?? []).some((k) => k.type === type && k.to === c.id);
  const weight = (c) => (1 / (1 + (dist(A.id, c.id) / 70) ** 2)) * (heavy && A.port && c.port ? 3 : 1) * (wanted(c) ? 3 : 1);
  return cands.map((c) => [c.id, weight(c)]);
}

// a new job at an unlocked town, headed to another unlocked town (null if there's nowhere to go)
function makeJob(g, from, forceTo, forceType) {
  const A = cityById[from];
  const type = forceType ?? pickWeighted(jobTypes(g, A));
  const dests = jobDests(g, A, type);
  if (!forceTo && !dests.length) return null;
  const to = forceTo ?? pickWeighted(dests);
  // bigger towns pay more for what leaves them
  const pay = Math.round((10 + dist(from, to) * RATES[type]) * (1 + 0.1 * (townSize(from, g) - 1)));
  return { id: g.nextId++, type, from, to, pay };
}

function newVehicle(g, kind, model, city, cars) {
  const s = SPECS[kind][model];
  const n = g.vehicles.filter((v) => v.model === model).length + 1;
  const v = { id: g.nextId++, kind, model, name: `${s.name} ${n}`, city, cargo: [], trip: null };
  if (s.maxCars != null) v.cars = cars ?? [];
  return v;
}

function fresh() {
  const now = Date.now();
  const g = { v: 1, coins: 600, xp: 0, level: 1, nextId: 1, selected: 'frost', vehicles: [], jobs: {}, spawnAt: {}, growth: {}, depots: {}, hqContracts: 0, hqSuperloads: 0, contracts: { offers: [], active: [], nextAt: 0 }, saved: now };
  g.unlocked = Object.fromEntries(START_CITIES.map((id) => [id, true]));
  g.vehicles.push(newVehicle(g, 'train', 'puffer', 'frost', ['pax', 'box']));
  g.vehicles.push(newVehicle(g, 'plane', 'sparrow', 'frost'));
  g.vehicles.push(newVehicle(g, 'boat', 'coaster', 'frost'));
  g.vehicles.push(newVehicle(g, 'truck', 'pickup', 'frost'));
  for (const c of CITIES) {
    g.jobs[c.id] = [];
    g.spawnAt[c.id] = now + 4000 + Math.random() * 8000;
  }
  // a friendly start at Frostholm: Ironvale for the train and pickup, Puffin Rock for the plane and boat
  g.jobs.frost.push(makeJob(g, 'frost', 'iron', 'pax'), makeJob(g, 'frost', 'iron', 'cargo'), makeJob(g, 'frost', 'iron', 'pax'));
  g.jobs.frost.push(makeJob(g, 'frost', 'puffin', 'pax'), makeJob(g, 'frost', 'puffin', 'pax'), makeJob(g, 'frost', 'puffin', 'cargo'));
  g.jobs.frost.push(makeJob(g, 'frost', 'puffin', 'cargo'), makeJob(g, 'frost', 'puffin', 'pax'), makeJob(g, 'frost', 'puffin', 'cargo'));
  for (let i = 0; i < 4; i++) g.jobs.iron.push(makeJob(g, 'iron'), makeJob(g, 'puffin'));
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
    g.growth ??= {};
    g.depots ??= {};
    g.hqContracts ??= 0;
    g.hqSuperloads ??= 0;
    g.contracts ??= { offers: [], active: [], nextAt: 0 };
    if (!g.unlocked) {
      // older saves predate unlocking: keep the starting towns plus anywhere the fleet is, is headed or has cargo for
      const keep = new Set(['bay', 'mill', 'gull']); // the starting towns back then
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
  tab: 'city', sheetOpen: true, activeVehicle: null, picking: false, plan: [], repeat: false, escort: false, sendJob: null,
  focusVehicle: null, toasts: [], focus: null, follow: null, track: null, shopTab: 'plane', shopType: null, shopMore: false, queue: null, fleetFind: '', fleetKind: null, fleetStatus: null,
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

// one whole day and night, in game time
export const DAY_LEN = 8 * 60 * 1000;
// how dark it is, from 0 through the day to 1 in the dead of night, easing in at dusk and out at dawn
export function darkness(now) {
  const t = (((now + (game.dayShift ?? 0)) % DAY_LEN) + DAY_LEN) % DAY_LEN / DAY_LEN;
  const d = 0.5 - 0.5 * Math.cos(2 * Math.PI * t); // 0 at noon, 1 at midnight
  const k = Math.min(1, Math.max(0, (d - 0.45) / 0.35));
  return k * k * (3 - 2 * k);
}

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
  const out = level === HQ.level ? ['Headquarters'] : [];
  if (level === CONTRACTS.level) out.push('Contracts');
  for (const s of [...Object.values(PLANES), ...Object.values(ENGINES), ...Object.values(CARS), ...Object.values(BOATS), ...Object.values(BARGES), ...Object.values(TRUCKS), ...Object.values(TRAILERS)]) if (s.level === level) out.push(s.short ?? s.name);
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

// what a vehicle has earned and spent on fuel since it joined the fleet (game time)
function books(v) { return (v.books ??= { earned: 0, fuel: 0, since: gameNow() }); }

// hand over everything on board that's for this town, and get paid for it; at is when (game time)
function dropOff(v, to, at = gameNow()) {
  let total = 0, n = 0;
  const pay = (j) => Math.round(j.pay * payBoost(v, j));
  v.cargo = v.cargo.filter((j) => {
    if (j.to === to) { total += pay(j); n++; grow(j.to); grow(j.from); countToward(j, at); return false; }
    return true;
  });
  if (n) { earn(total); books(v).earned += total; }
  finishContracts();
  if (n && !quiet) fx.push({ x: cityById[to].x, y: cityById[to].y, text: `+$${fmt(total)}`, t: Date.now() });
  return { n, total };
}

// short lived effects for the map to draw, like money floating up from a drop off
export const fx = [];

// at is when the leg finished, so chained legs line up even when catching up after time away
function arrive(v, at) {
  const to = v.trip.to, pick = v.trip.pick;
  const { n, total } = dropOff(v, to, at);
  const name = cityById[to].name;
  const next = v.next?.shift();
  if (!next) releaseEscorts(v, to);
  if (pick != null) collect(v, to, pick, next);
  if (next) {
    if (v.loop) pickUp(v, to);
    v.trip = { ...next, startAt: at };
    if (n) toast(`${v.name} dropped off ${n} at ${name}. +$${fmt(total)}`, 'good');
    return;
  }
  v.city = to;
  v.trip = null;
  delete v.depart;
  // planes can now land wherever this carrier has parked
  if (v.kind === 'boat' && isCarrier(v.model)) reachCache.clear();
  if (v.loop) {
    // back home: load up and go round again, without a toast every lap
    if (n) toast(`${v.name} delivered ${n} at ${name}. +$${fmt(total)}`, 'good');
    runLoop(v, at);
    return;
  }
  if (ui.track === v.id) ui.track = null;
  if (n) toast(`${v.name} delivered ${n} at ${name}. +$${fmt(total)}`, 'good');
  else toast(`${v.name} arrived at ${name}`);
}

// ---------- town growth and depots ----------

// 1 (village) to GROWTH.length (metropolis), from how many jobs to and from it have been delivered
export function townSize(id, g = game) {
  const n = g.growth?.[id] ?? 0;
  let s = 1;
  while (s < GROWTH.length && n >= GROWTH[s]) s++;
  return s;
}
export const sizeName = (id) => SIZE_NAME[townSize(id) - 1];
// deliveries made, and needed for the next size (null once it's as big as it gets)
export function growthOf(id) {
  const n = game.growth[id] ?? 0, s = townSize(id);
  return { n, from: GROWTH[s - 1], next: GROWTH[s] ?? null };
}
function grow(id) {
  if (cityById[id].anchor) return;
  const before = townSize(id);
  game.growth[id] = (game.growth[id] ?? 0) + 1;
  if (townSize(id) > before && !quiet) toast(`${cityById[id].name} grew into a ${sizeName(id).toLowerCase()}. More jobs, better pay.`, 'level');
}
const jobCap = (id) => JOB_CAP + 2 * (townSize(id) - 1);
// game time until a town's next job; bigger towns turn them up faster. Without random, the average.
const spawnGap = (id, random = 0.5) => (7000 + random * 8000) / (1 + 0.25 * (townSize(id) - 1));

// your HQ: built once, in any town. Older saves that bought repeating routes before the HQ
// came along build theirs for free.
export const hqPrice = () => (game.repeatRoutes ? 0 : HQ.price);
export function buildHQ(id) {
  if (game.hq || cityById[id].anchor) return;
  if (!spend(hqPrice(), HQ.level, 'Headquarters')) return;
  game.hq = id;
  game.repeatRoutes = true;
  toast(`HQ built at ${cityById[id].name}. Repeating routes and company colors are unlocked.`, 'good');
}
// the next contracts perk to buy at the HQ, or null once you have them all
export const nextContractsPerk = () => HQ.contracts[game.hqContracts] ?? null;
export function buyContractsPerk() {
  const p = nextContractsPerk();
  if (!game.hq || !p) return;
  if (!spend(p.price, p.level, 'Contracts office')) return;
  game.hqContracts++;
  toast(`You can work on ${contractSlots()} contracts at a time now`, 'good');
}
export const contractSlots = () => CONTRACTS.active + game.hqContracts;
// the next superloads perk, or null once you have them all
export const nextSuperloadsPerk = () => HQ.superloads[game.hqSuperloads] ?? null;
export function buySuperloadsPerk() {
  const p = nextSuperloadsPerk();
  if (!game.hq || !p) return;
  if (!spend(p.price, p.level, 'Heavy haul office')) return;
  game.hqSuperloads++;
  toast(`You can run ${superloadSlots()} superloads of each kind at a time now`, 'good');
}
// how many superloads of each kind (road, rail, sea) can be under way at once
export const superloadSlots = () => 1 + game.hqSuperloads;
const contractOffers = () => CONTRACTS.offers + game.hqContracts;

// company colors, { body, accent }, for a vehicle, or null for its factory paint. Only the lead
// unit is painted: cars, trailers and barges keep the colors that show what they carry.
export function paintFor(kind, model) {
  const s = SPECS[kind][model];
  return game.livery?.on && !s.escort && !s.factoryPaint ? game.livery : null;
}
export const paintOf = (v) => (v.factoryPaint ? null : paintFor(v.kind, v.model));
export function setLivery(changes) {
  if (!game.hq) return;
  game.livery = { body: '#2a6fd6', accent: '#f2c14e', on: false, ...game.livery, ...changes };
}

export function buyDepot(id) {
  if (game.depots[id] || cityById[id].anchor) return;
  if (!spend(DEPOT.price, DEPOT.level, 'Depots')) return;
  game.depots[id] = true;
  toast(`Depot built at ${cityById[id].name}`, 'good');
}

function ownJobs(id) { return game.jobs[id].filter((j) => j.from === id).length; }
function addJob(id) {
  const j = makeJob(game, id);
  if (!j) return;
  game.jobs[id].push(j);
  // bulk comes in batches of three loads headed the same way
  if (j.type === 'bulk') for (let i = 0; i < 2; i++) game.jobs[id].push({ ...j, id: game.nextId++ });
}

// ---------- contracts ----------

// is there somewhere open that would send jobs of this type to this town?
function canSend(type, to) {
  const T = cityById[to];
  if (T.anchor || !isOpen(to)) return false;
  const heavy = type === 'fuel' || type === 'bulk';
  if (heavy && !T.rail && !T.port) return false;
  if (type === 'wide' && !T.road) return false;
  return CITIES.some((c) => c.id !== to && isOpen(c.id) && !c.anchor && (!heavy || c.rail || c.port) && (type !== 'wide' || (c.road && c.cont === T.cont)));
}

// how many jobs of this type would turn up a game minute headed for this town, with a contract
// leaning them its way, if every open town had room on its board; and on average how far they'd come
function supply(type, to) {
  let rate = 0, d = 0;
  if (!game.unlocked[to]) return { rate, d };
  for (const A of CITIES) {
    if (A.id === to || A.anchor || !isOpen(A.id)) continue;
    const types = jobTypes(game, A), w = types.find(([t]) => t === type)?.[1];
    if (!w) continue;
    const dests = jobDests(game, A, type, to), here = dests.find(([id]) => id === to)?.[1];
    if (!here) continue;
    const odds = (w / types.reduce((s, [, x]) => s + x, 0)) * (here / dests.reduce((s, [, x]) => s + x, 0));
    // bulk turns up in batches of three
    const r = (60000 / spawnGap(A.id)) * odds * (type === 'bulk' ? 3 : 1);
    rate += r;
    d += r * dist(A.id, to);
  }
  return { rate, d: rate ? d / rate : 0 };
}

function makeContract(now) {
  const { offers, active } = game.contracts;
  const taken = new Set([...offers, ...active].map((k) => `${k.type}>${k.to}`));
  const opts = [];
  for (const t of JOB_TYPES) if (game.level >= TYPE_LEVEL[t]) for (const c of CITIES) if (!taken.has(`${t}>${c.id}`) && canSend(t, c.id)) opts.push([[t, c.id], TYPE_WEIGHT[t]]);
  if (!opts.length) return null;
  const [type, to] = pickWeighted(opts), [lo, hi] = CONTRACTS.size[type];
  let n = lo + Math.floor(Math.random() * (hi - lo + 1));
  // bulk turns up in batches of three
  if (type === 'bulk') n = Math.max(3, Math.round(n / 3) * 3);
  const s = supply(type, to);
  // time to wait for the jobs to turn up, plus a couple of trips' worth at an everyday speed for
  // this level. The bonus goes by the time it takes, so scarce jobs and far off towns pay more.
  const lv = game.level - 1, speed = CONTRACTS.speed + CONTRACTS.speedUp * lv;
  const wait = (n / s.rate) * 60000, trip = (s.d / (speed * SPEED)) * 1000;
  const time = Math.ceil((CONTRACTS.waitSlack * wait + CONTRACTS.trips * trip + CONTRACTS.extra) / 60000) * 60000;
  const reward = Math.round(((time / 60000) * CONTRACTS.perMin * (1 + CONTRACTS.payUp * lv)) / 10) * 10;
  return { id: game.nextId++, type, to, n, done: 0, reward, time, until: now + CONTRACTS.offerTtl };
}

// what carries each way a superload can go, and the towns and routes it can use
export const SUPER_KIND = { road: 'truck', rail: 'train', sea: 'boat' };
const SUPER_TOWN = { road: (c) => c.road, rail: (c) => c.rail, sea: (c) => c.port && !c.anchor };
const SUPER_ROUTE = { road: roadPath, rail: (a, b) => railPath(a, b), sea: seaLane };
// what a superload going this way needs to carry it: "superload tractor", "heavy haul engine"...
export function superloadCarrier(by = 'road') {
  return Object.values(SPECS[SUPER_KIND[by]]).find((s) => s.superload).name.toLowerCase();
}

// a superload offer: one named load between two towns it can go between (by road, rail or sea),
// or null if there's no such pair open yet. from fixes where it starts; any picks from every
// load, whatever the level; load picks that one; skip leaves out those ways (road, rail, sea).
function makeSuperload(now, { from = null, any = false, load: only = null, skip = [] } = {}) {
  const loads = only ? [only] : SUPERLOAD.loads.filter((l) => (any || game.level >= l.level) && !skip.includes(l.by ?? 'road'));
  for (let tries = 0; loads.length && tries < 24; tries++) {
    const load = loads[Math.floor(Math.random() * loads.length)], by = load.by ?? 'road';
    const towns = CITIES.filter((c) => SUPER_TOWN[by](c) && isOpen(c.id));
    const A = from ? cityById[from] : towns[Math.floor(Math.random() * towns.length)];
    if (!A || !towns.includes(A)) continue;
    const far = towns.filter((c) => c !== A && dist(A.id, c.id) >= SUPERLOAD.minDist && SUPER_ROUTE[by](A.id, c.id));
    if (!far.length) continue;
    const B = far[Math.floor(Math.random() * far.length)];
    const reward = Math.round(((SUPERLOAD.base + SUPERLOAD.perUnit * dist(A.id, B.id)) * load.mult) / 10) * 10;
    return { id: game.nextId++, super: true, by, name: load.name, trailer: load.trailer, needs: { ...load.needs }, type: 'wide', from: A.id, to: B.id, n: 1, done: 0, reward, until: now + CONTRACTS.offerTtl };
  }
  return null;
}

const isSuper = (c) => !!c.super;
const byOf = (c) => c.by ?? 'road';
// what a contract asks for, for toasts
export function contractText(c) {
  return c.super ? `${c.name} from ${cityById[c.from].name} to ${cityById[c.to].name}` : `${c.n} ${TYPE_LABEL[c.type].toLowerCase()} to ${cityById[c.to].name}`;
}

// keep the board stocked, and let contracts and offers whose time is up go (superloads never run out of time)
function tickContracts(now) {
  const k = game.contracts, late = (c) => c.until != null && now > c.until;
  if (k.offers.some(late)) k.offers = k.offers.filter((o) => !late(o));
  for (const c of k.active.filter(late)) toast(`Contract missed: ${c.done} of ${contractText(c)}`, 'bad');
  if (k.active.some(late)) k.active = k.active.filter((c) => !late(c));
  if (game.level < CONTRACTS.level) return;
  // an empty board fills right up; after that a new offer turns up every so often. Superload
  // offers don't take up room on the board, but there's at most one of each kind (road, rail, sea).
  const fill = !k.offers.length;
  while (k.offers.filter((o) => !o.super).length < contractOffers() && (fill || now >= k.nextAt)) {
    const offered = k.offers.filter(isSuper).map(byOf);
    const sup = game.level >= SUPERLOAD.level && offered.length < 3 && Math.random() < SUPERLOAD.chance;
    const o = (sup && makeSuperload(now, { skip: offered })) || makeContract(now);
    if (!o) break;
    k.offers.push(o);
    k.nextAt = now + CONTRACTS.every;
  }
}

// a superload counts toward its own contract; other jobs toward one wanting their type in their town
function counts(c, j, at) {
  return j.contract != null ? c.id === j.contract : !c.super && c.type === j.type && c.to === j.to && at <= c.until;
}

function countToward(j, at) {
  for (const c of game.contracts.active) if (counts(c, j, at)) c.done = Math.min(c.n, c.done + 1);
}

function finishContracts() {
  const k = game.contracts, done = k.active.filter((c) => c.done >= c.n);
  if (!done.length) return;
  k.active = k.active.filter((c) => c.done < c.n);
  for (const c of done) {
    earn(c.reward);
    if (!quiet) fx.push({ x: cityById[c.to].x, y: cityById[c.to].y - 6, text: `Contract +$${fmt(c.reward)}`, t: Date.now() });
    toast(`Contract done: ${contractText(c)}. +$${fmt(c.reward)}`, 'good');
  }
}

// the active contract a job would count toward when it's delivered, if any
export function contractFor(j) {
  return game.contracts.active.find((c) => (j.contract != null ? c.id === j.contract : !c.super && c.type === j.type && c.to === j.to)) ?? null;
}

// superloads don't take up one of the usual contract slots, but only so many of each kind (road,
// rail, sea) can be under way at a time
export function canAccept(c) {
  const a = game.contracts.active;
  return c.super ? a.filter((x) => x.super && byOf(x) === byOf(c)).length < superloadSlots() : a.filter((x) => !x.super).length < contractSlots();
}

export function acceptContract(id) {
  const k = game.contracts, i = k.offers.findIndex((o) => o.id === id);
  if (i < 0) return;
  if (!canAccept(k.offers[i])) { toast(k.offers[i].super ? `You can run ${superloadSlots()} superload${superloadSlots() > 1 ? 's' : ''} by ${byOf(k.offers[i])} at a time. Finish one first.` : `You can work on ${contractSlots()} contracts at a time`, 'bad'); return; }
  const [c] = k.offers.splice(i, 1);
  if (c.super) {
    // no time limit: the load waits at its town until a convoy comes for it
    c.until = null;
    game.jobs[c.from].push({ id: game.nextId++, type: 'wide', from: c.from, to: c.to, pay: Math.round(10 + dist(c.from, c.to) * RATES.wide), name: c.name, trailer: c.trailer, by: c.by ?? 'road', escort: { ...c.needs }, contract: c.id });
  } else c.until = gameNow() + c.time;
  k.active.push(c);
  toast(`Contract taken: ${contractText(c)}`, 'good');
}

// giving up a superload takes the load away too, wherever it is
export function dropContract(id) {
  const k = game.contracts;
  k.active = k.active.filter((c) => c.id !== id);
  for (const t in game.jobs) if (game.jobs[t].some((j) => j.contract === id)) game.jobs[t] = game.jobs[t].filter((j) => j.contract !== id);
  for (const v of game.vehicles) if (v.cargo.some((j) => j.contract === id)) v.cargo = v.cargo.filter((j) => j.contract !== id);
}

// where a superload contract's load is: waiting at a town, or on board a vehicle
export function superloadAt(c) {
  for (const v of game.vehicles) if (v.cargo.some((j) => j.contract === c.id)) return { v };
  for (const t in game.jobs) if (game.jobs[t].some((j) => j.contract === c.id)) return { town: t };
  return {};
}

// ---------- superload convoys ----------

// what's hooked up behind a vehicle, for drawing: its cars, trailers or barges, then the trailer
// any superload on board brings with it
export function consistOf(v) {
  const loads = v.cargo.filter((j) => j.trailer).map((j) => ({ kind: 'load', model: j.trailer }));
  return loads.length ? [...(v.cars ?? []), ...loads] : v.cars ?? [];
}

// the kind of escort a vehicle is built to be, if any
export const escortKind = (v) => spec(v).escort ?? null;
// the kind of escort it can ride along as right now: its own, or the one it helps out as when it's empty
export const escortAs = (v) => escortKind(v) ?? (v.cargo.length ? null : spec(v).helps ?? null);
// the escorts the loads on board need, by kind
export function convoyNeeds(v) {
  const need = {};
  for (const j of v.cargo) for (const k in j.escort ?? {}) need[k] = Math.max(need[k] ?? 0, j.escort[k]);
  return need;
}
// escorts parked here, free to join a convoy
export function freeEscorts(at, but = null) {
  return game.vehicles.filter((x) => x.id !== but && x.city === at && !x.trip && !x.loop && escortAs(x));
}
// which free escorts would go with this vehicle, or what's missing: { picked, missing: [[kind, n], ...] }
export function pickEscorts(v) {
  const need = convoyNeeds(v), free = freeEscorts(v.city, v.id), picked = [], missing = [];
  for (const k in need) {
    const got = free.filter((x) => escortAs(x) === k).slice(0, need[k]);
    picked.push(...got);
    if (got.length < need[k]) missing.push([k, need[k] - got.length]);
  }
  return { picked, missing };
}
// "2 pilot cars and 1 police car"
export function escortText(needs) {
  const parts = Object.entries(needs).map(([k, n]) => `${n} ${ESCORT_LABEL[k]}${n > 1 ? 's' : ''}`);
  return parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}` : parts.join('');
}
// the escorts driving along with this vehicle
export function escortsOf(v) { return game.vehicles.filter((x) => x.escorting === v.id); }
export function escortee(x) { return x.escorting != null ? game.vehicles.find((v) => v.id === x.escorting) : null; }

// some models pay more for some jobs (pays in their spec), and valuables pay more with a police car riding along
export function payBoost(v, j) {
  const police = j.type === 'secure' && escortsOf(v).some((x) => escortKind(x) === 'police');
  return (spec(v).pays?.[j.type] ?? 1) * (police ? 1 + SECURE.escortBonus : 1);
}

// a free escort here that this vehicle can take along if it likes (an armored car's police car), or null
export function optionalEscort(v) {
  const kind = v.kind === 'truck' ? TRUCKS[v.model].escortedBy : null;
  return kind ? freeEscorts(v.city, v.id).find((x) => escortKind(x) === kind) ?? null : null;
}

// the convoy breaks up where the route ends
function releaseEscorts(v, at) {
  for (const x of escortsOf(v)) { delete x.escorting; x.city = at; }
}

// can this model be based at (start from, stop at) this city?
export function canBase(kind, model, c) {
  if (kind === 'train') return ENGINES[model].maglev ? onMaglev(c.id) : c.rail;
  // only aircraft carriers sail out to the anchorages
  if (kind === 'boat') return c.anchor ? isCarrier(model) : c.port && (!BOATS[model].harbor || c.rail);
  if (kind === 'truck') return c.road || (!!TRUCKS[model].amphibious && c.port && !c.anchor);
  return landsWithout(model, c) || (!!PLANES[model].deckSpace && !!carrierAt(c.id));
}

// ---------- aircraft carriers ----------

export function isCarrier(model) { return BOATS[model]?.deckFor === 'plane'; }
// a carrier parked (anchored or moored) here, if any
export function carrierAt(id) { return game.vehicles.find((v) => v.kind === 'boat' && isCarrier(v.model) && v.city === id); }
// can this plane land here with no carrier's help?
export function landsWithout(model, c) {
  const p = PLANES[model];
  return !c.anchor && (c.air || !!p.vtol || (!!p.seaplane && c.port));
}
// planes that are here, or on their way, only because a carrier is: it can't sail off and leave them
function leaning(f) {
  const c = cityById[f.city], on = (p) => p.kind === 'plane' && !landsWithout(p.model, c);
  return {
    parked: game.vehicles.filter((p) => on(p) && p.city === f.city),
    inbound: game.vehicles.filter((p) => on(p) && p.trip && [p.trip, ...(p.next ?? [])].some((l) => l.to === f.city)),
  };
}


// ---------- unlocking towns ----------

// anchorages are always open: there's nothing there to unlock
export function isOpen(id) { return !!game.unlocked[id] || !!cityById[id]?.anchor; }
// can vehicles be bought or spawned here?
function shopHere(c) {
  if (c.anchor) { toast(`${c.name} is open sea. Pick a town to buy vehicles.`, 'bad'); return false; }
  if (!isOpen(c.id)) { toast(`Unlock ${c.name} first`, 'bad'); return false; }
  return true;
}
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
  const taken = fetching();
  // earliest arrival first, again and again, since one arrival can start a leg that's also done
  for (;;) {
    let v = null;
    for (const x of game.vehicles) if (x.trip && now >= tripEnd(x) && (!v || tripEnd(x) < tripEnd(v))) v = x;
    if (!v) break;
    arrive(v, tripEnd(v));
  }
  for (const v of game.vehicles) books(v);
  tickContracts(now);
  for (const v of game.vehicles) if (v.loop && v.city && !v.trip && now >= (v.loop.wait ?? 0)) runLoop(v, now);
  for (const c of CITIES) {
    // jobs are stamped the first time they're seen waiting; ones dropped off for a transfer, or with
    // a vehicle on its way to fetch them, never expire
    const list = game.jobs[c.id], stale = (j) => j.from === c.id && j.contract == null && !taken.has(j.id) && now - j.at > jobTtl(j);
    for (const j of list) j.at ??= now;
    if (list.some(stale)) game.jobs[c.id] = list.filter((j) => !stale(j));
    if (now >= game.spawnAt[c.id]) {
      game.spawnAt[c.id] = now + spawnGap(c.id, Math.random());
      if (isOpen(c.id) && !c.anchor && ownJobs(c.id) < jobCap(c.id)) addJob(c.id);
    }
  }
  // vehicles resting at a depot slowly lose their age
  const dt = now - (game.repairAt ?? now);
  game.repairAt = now;
  if (dt > 0) for (const v of game.vehicles) if (v.city && game.depots[v.city] && v.miles) v.miles = Math.max(0, v.miles - (DEPOT.repair * dt) / 60000);
}

let started = false;
export function start() {
  if (started) return;
  started = true;
  const before = game.coins;
  quiet = true;
  step();
  for (const c of CITIES) if (isOpen(c.id) && !c.anchor) for (let i = ownJobs(c.id); i < 4; i++) addJob(c.id);
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
  ui.sendJob = null;
  const av = game.vehicles.find((v) => v.id === ui.activeVehicle);
  if (!av || av.city !== id) ui.activeVehicle = null;
  if (focus) ui.focus = { x: cityById[id].x, y: cityById[id].y, t: Date.now() };
}

export function openLoad(v) {
  if (!v.city) return;
  selectCity(v.city, true);
  ui.activeVehicle = v.id;
}

// ---------- idle vehicles ----------

// parked in town with nothing to do: not repeating, and not an escort, which only moves with a convoy
export const isIdle = (v) => !!v.city && !v.trip && !v.loop && !escortKind(v);
export const idleVehicles = () => game.vehicles.filter(isIdle);

// load the best paying jobs it can deliver and set off on the nearest-first route, all in one go.
// False if there was nothing to take, or it couldn't leave. Superload carriers wait for their convoy.
export function quickSend(v) {
  if (!isIdle(v) || spec(v).superload) return false;
  const was = quiet;
  quiet = true;
  try {
    if (!v.cargo.length) autoLoad(v);
    const stops = v.cargo.length ? autoPlan(v) : [];
    return stops.length > 0 && dispatch(v, stops);
  } finally { quiet = was; }
}
export function quickSendAll() {
  const idle = idleVehicles(), sent = idle.filter(quickSend).length, stuck = idle.length - sent;
  toast(sent ? `Sent ${sent} vehicle${sent > 1 ? 's' : ''}${stuck ? `. ${stuck} had nothing to take` : ''}` : 'Nothing for the idle vehicles to take right now', sent ? 'good' : 'info');
}

// sending idle vehicles one at a time: each one's load panel opens in turn, skipping any passed over
export function startQueue() {
  ui.queue = { skipped: [] };
  nextInQueue();
}
export function nextInQueue(skip = null) {
  if (!ui.queue) return;
  if (skip != null) ui.queue.skipped.push(skip);
  ui.picking = false; ui.plan = [];
  const v = idleVehicles().find((x) => !ui.queue.skipped.includes(x.id));
  if (v) { openLoad(v); return; }
  ui.queue = null;
  ui.activeVehicle = null;
  toast('That’s every idle vehicle', 'good');
}
// how many more are waiting after the one open now
export const queueLeft = () => (ui.queue ? idleVehicles().filter((x) => x.id !== ui.activeVehicle && !ui.queue.skipped.includes(x.id)).length : 0);

export function followVehicle(v) {
  ui.follow = v.id;
  ui.track = v.id;
}

export function loadJob(v, job) {
  const list = game.jobs[v.city];
  const i = list.findIndex((j) => j.id === job.id);
  if (i < 0 || !canLoad(v, job) || fetcher(job)) return;
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
  const taken = fetching();
  const list = [...game.jobs[v.city]].filter((j) => canReach(v, j.to) && !taken.has(j.id)).sort((a, b) => b.pay - a.pay);
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

// the stops of a repeating route: always ending back where it started
export function loopStops(v, stops) {
  return stops.length && stops[stops.length - 1] !== v.city ? [...stops, v.city] : stops;
}

// fuel for the whole route is paid up front. With repeat, the vehicle comes back to where it
// started and goes round again; lap is for those later laps, which set off at a given time quietly.
// escort: take along the optional escort parked here (see optionalEscort); on later laps it just
// comes if it's still free
export function dispatch(v, stops, { repeat = false, lap = null, escort = false } = {}) {
  if (repeat && !game.repeatRoutes) { toast('Build an HQ to unlock repeating routes', 'bad'); return false; }
  if (repeat) stops = loopStops(v, stops);
  // a carrier takes the planes that need it along, and waits for any still flying in to land
  let stow = [];
  if (v.kind === 'boat' && isCarrier(v.model) && v.city) {
    const { parked, inbound } = leaning(v);
    if (inbound.length) { toast(`${v.name} can’t leave while ${inbound[0].name} is flying in to land on it`, 'bad'); return false; }
    if (deckUsed(v) + parked.reduce((s, p) => s + deckSize(p), 0) > deckRoom(v)) { toast(`No room on ${v.name}’s deck for every plane parked here. Fly some off first.`, 'bad'); return false; }
    stow = parked;
  }
  const legs = planLegs(v, stops);
  const bad = legs.findIndex((l) => !l);
  if (!legs.length || bad >= 0) { toast(`${v.name} can’t reach ${cityById[stops[Math.max(0, bad)]].name} on this route`, 'bad'); return false; }
  // a superload can't set off without its escorts, who pay their own fuel to drive along
  let escorts = [];
  if (v.cargo.some((j) => j.escort)) {
    if (repeat) { toast('A superload convoy can’t run a repeating route', 'bad'); return false; }
    const { picked, missing } = pickEscorts(v);
    if (missing.length) { toast(`${v.name} needs ${escortText(Object.fromEntries(missing))} more parked at ${cityById[v.city].name} to set off`, 'bad'); return false; }
    escorts = picked.map((x) => ({ x, cost: planLegs(x, stops).reduce((s, l) => s + (l?.cost ?? 0), 0) }));
  } else if (escort) {
    const x = optionalEscort(v);
    if (!x && lap == null) { toast(`No free ${ESCORT_LABEL[TRUCKS[v.model].escortedBy]} parked at ${cityById[v.city].name} to ride along`, 'bad'); return false; }
    if (x) escorts = [{ x, cost: planLegs(x, stops).reduce((s, l) => s + (l?.cost ?? 0), 0) }];
  }
  const cost = legs.reduce((s, l) => s + l.cost, 0) + escorts.reduce((s, e) => s + e.cost, 0);
  if (game.coins < cost) { toast(lap == null ? `Not enough coins for fuel. You need $${fmt(cost)}.` : `${v.name} stopped repeating. It needs $${fmt(cost)} for fuel.`, 'bad'); return false; }
  game.coins -= cost;
  books(v).fuel += cost;
  v.miles = (v.miles ?? 0) + legs.reduce((s, l) => s + l.len, 0);
  for (const p of stow) { p.aboard = v.id; p.city = null; delete p.loop; }
  for (const { x, cost: c } of escorts) {
    books(x).fuel += c;
    books(v).fuel -= c;
    x.miles = (x.miles ?? 0) + legs.reduce((s, l) => s + l.len, 0);
    x.escorting = v.id;
    x.city = null;
  }
  if (v.kind === 'boat' && isCarrier(v.model)) reachCache.clear();
  const [first, ...rest] = legs.map((l) => ({ from: l.from, to: l.to, pts: l.pts, len: l.len, dur: l.time * 1000, cost: l.cost, sea: l.sea }));
  v.trip = { ...first, startAt: lap ?? gameNow() };
  v.next = rest;
  v.depart = { from: v.city, at: v.trip.startAt, len: legs.reduce((s, l) => s + l.len, 0) };
  if (repeat) v.loop = escort ? { stops, escort } : { stops };
  else if (lap == null) delete v.loop;
  v.city = null;
  if (lap == null) toast(repeat ? `${v.name} is running a ${legs.length} stop loop. Fuel $${fmt(cost)} a lap` : rest.length ? `${v.name} left on a ${legs.length} stop route. Fuel $${fmt(cost)}` : `${v.name} left for ${cityById[first.to].name}. Fuel $${cost}`);
  return true;
}

// ---------- sending a parked vehicle to fetch a job from another town ----------

// the stops from one town to another: straight there, or by way of fuel stops for planes
function stopsTo(v, from, to) {
  if (v.kind !== 'plane') return leg(v, from, to) ? [to] : null;
  const h = hops(v, from);
  return h.D[to] != null ? h.path(to) : null;
}

// which vehicle is on its way to fetch each job, by job id. A job is spoken for while some
// route has a leg that picks it up, so ending that route early lets it go again.
function fetching() {
  const m = new Map();
  for (const v of game.vehicles) if (v.trip) for (const l of [v.trip, ...(v.next ?? [])]) if (l.pick != null) m.set(l.pick, v);
  return m;
}
export function fetcher(job) { return fetching().get(job.id) ?? null; }

// how a parked vehicle would go and get a job waiting at another town and take it where it's
// headed, or why it can't: { why } or { stops, pick (index of the pick up stop), cost, time, pickIn }
export function fetchPlan(v, job, at) {
  if (!v.city || v.trip) return { why: 'Out on a trip' };
  if (v.loop) return { why: 'Running a repeating route' };
  const cap = capacity(v)[job.type];
  if (job.escort) return { why: 'Superloads need their escorts. Drive over with them and load it there.' };
  if (!cap) return { why: `Can’t carry ${TYPE_LABEL[job.type].toLowerCase()}` };
  if (used(v)[job.type] >= cap) return { why: 'No room left on board' };
  const there = stopsTo(v, v.city, at);
  if (!there) return { why: `Can’t reach ${cityById[at].name}` };
  const on = stopsTo(v, at, job.to);
  if (!on) return { why: `Can’t get it to ${cityById[job.to].name}` };
  const stops = [...there, ...on], legs = planLegs(v, stops);
  if (legs.some((l) => !l)) return { why: `Can’t reach ${cityById[at].name}` };
  const sum = (ls, k) => ls.reduce((s, l) => s + l[k], 0);
  return { stops, pick: there.length - 1, cost: sum(legs, 'cost'), time: sum(legs, 'time'), pickIn: sum(legs.slice(0, there.length), 'time') };
}

export function sendFor(v, job, at) {
  const p = fetchPlan(v, job, at), f = fetcher(job);
  if (f) { toast(`${f.name} is already on its way for that`, 'bad'); return false; }
  if (p.why) { toast(`${v.name}: ${p.why}`, 'bad'); return false; }
  if (!dispatch(v, p.stops)) return false;
  (p.pick ? v.next[p.pick - 1] : v.trip).pick = job.id;
  return true;
}

// a vehicle sent to fetch a job loads it, along with anything else here headed for its later stops that fits
function collect(v, at, id, next) {
  const list = game.jobs[at], i = list.findIndex((j) => j.id === id);
  if (i >= 0 && canLoad(v, list[i])) v.cargo.push(...list.splice(i, 1));
  const ahead = new Set([next, ...(v.next ?? [])].filter(Boolean).map((l) => l.to)), taken = fetching();
  for (const j of [...list].sort((a, b) => b.pay - a.pay)) {
    if (!ahead.has(j.to) || taken.has(j.id) || j.escort || !canLoad(v, j)) continue;
    list.splice(list.indexOf(j), 1);
    v.cargo.push(j);
  }
}

// ---------- repeating routes ----------

// load jobs here that are headed somewhere else on the loop, best paying first
function pickUp(v, at) {
  const ring = new Set(v.loop.stops), list = game.jobs[at], taken = fetching();
  for (const j of [...list].sort((a, b) => b.pay - a.pay)) {
    if (j.to === at || !ring.has(j.to) || taken.has(j.id) || j.escort || !canLoad(v, j)) continue;
    list.splice(list.indexOf(j), 1);
    v.cargo.push(j);
  }
}

// is there anything waiting anywhere on the loop that this vehicle could carry along it?
function loopHasWork(v) {
  const ring = new Set(v.loop.stops), cap = capacity(v), taken = fetching();
  return v.loop.stops.some((id) => game.jobs[id].some((j) => j.to !== id && ring.has(j.to) && !taken.has(j.id) && cap[j.type] > 0));
}

// start another lap from home, or wait a while if there's nothing to carry
function runLoop(v, at) {
  delete v.loop.wait;
  pickUp(v, v.city);
  if (!v.cargo.length && !loopHasWork(v)) { v.loop.wait = at + LOOP_WAIT; return; }
  if (!dispatch(v, v.loop.stops, { repeat: true, lap: at, escort: !!v.loop.escort })) delete v.loop;
}

// finish the lap it's on and then stop
export function stopRepeating(v) {
  if (!v.loop) return;
  delete v.loop;
  toast(v.trip ? `${v.name} will stop repeating at the end of this lap` : `${v.name} stopped repeating`);
}

// drop the rest of the route after the current leg, refunding fuel for legs not flown or driven
export function endRoute(v) {
  if (!v.next?.length) return;
  const refund = v.next.reduce((s, l) => s + l.cost, 0);
  v.miles -= v.next.reduce((s, l) => s + l.len, 0);
  v.next = [];
  delete v.loop;
  game.coins += refund;
  books(v).fuel -= refund;
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
  if (!shopHere(c)) return;
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
  if (!shopHere(c)) return;
  if (!canBase('boat', model, c)) { toast(b.harbor ? `${b.name} needs a port with a rail station` : `${c.name} has no port. Pick a port city first.`, 'bad'); return; }
  if (!spend(b.price, b.level, b.name)) return;
  const v = newVehicle(game, 'boat', model, c.id);
  game.vehicles.push(v);
  toast(b.maxCars ? `${v.name} is moored at ${c.name}. Hook up some barges.` : `${v.name} is moored at ${c.name}`, 'good');
  ui.tab = 'fleet';
  ui.focusVehicle = v.id;
}

export function buyTruck(model) {
  const c = cityById[game.selected], t = TRUCKS[model];
  if (!shopHere(c)) return;
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
  if (!shopHere(c)) return;
  if (!canBase('train', model, c)) { toast(e.maglev ? `${c.name} isn’t on a maglev line` : `${c.name} has no station. Pick a station city first.`, 'bad'); return; }
  if (!spend(e.price, e.level, e.name)) return;
  const v = newVehicle(game, 'train', model, c.id, []);
  game.vehicles.push(v);
  toast(e.maxCars ? `${v.name} is at ${c.name}. Add some cars to it.` : `${v.name} is at ${c.name}`, 'good');
  ui.tab = 'fleet';
  ui.focusVehicle = v.id;
}

export function addCar(v, type) {
  const car = tailSpecs(v)[type], e = spec(v), what = tailName(v);
  if (!v.city) return;
  if (v.cars.length >= e.maxCars) { toast(`${e.name} can pull ${e.maxCars} ${what}${e.maxCars > 1 ? 's' : ''} at most`, 'bad'); return; }
  if (e.freightOnly && car.holds === 'pax') { toast(`${e.name} only pulls freight cars`, 'bad'); return; }
  if (e.pulls && !e.pulls.includes(type)) { toast(`${e.name} only pulls ${e.pulls.map((k) => tailSpecs(v)[k].name.toLowerCase()).join(' and ')}s`, 'bad'); return; }
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
  if (e.pulls && v.cars.some((c) => !e.pulls.includes(c))) { toast(`${e.name} only pulls ${e.pulls.map((k) => tailSpecs(v)[k].name.toLowerCase()).join(' and ')}s. Sell the other ${tailName(v)}s first.`, 'bad'); return; }
  if (!spend(upgradeCost(v, model), e.level, e.name)) return;
  v.model = model;
  v.miles = 0;
  const n = game.vehicles.filter((x) => x.model === model && x.id !== v.id).length + 1;
  v.name = `${e.name} ${n}`;
  toast(`Swapped in a ${e.name}`, 'good');
}

// money in and out for a vehicle: profit, profit per game hour once it's been around a few
// minutes, and how much of what it cost (with its cars, trailers or barges) it has made back
export function finances(v, now = clock.now) {
  // read only: this runs while the page draws, and books are started in step()
  const b = v.books ?? { earned: 0, fuel: 0, since: now }, profit = b.earned - b.fuel, age = now - b.since;
  const cost = spec(v).price + (v.cars ?? []).reduce((s, c) => s + tailSpecs(v)[c].price, 0);
  return { ...b, profit, perHour: age > 3 * 60 * 1000 ? profit / (age / 3.6e6) : null, paidBack: profit / cost };
}

export function serviceCost(v) {
  return Math.ceil(spec(v).price * wear(v) * WEAR.service * (game.depots[v.city] ? DEPOT.service : 1));
}

// a parked vehicle gets back to burning fuel like new
export function service(v) {
  if (!v.city || !wear(v)) return;
  const cost = serviceCost(v);
  if (game.coins < cost) { toast(`You need $${fmt(cost)} for that`, 'bad'); return; }
  game.coins -= cost;
  v.miles = 0;
  toast(`${v.name} is serviced and running like new`, 'good');
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

// ---------- carrying vehicles: trucks on car ferries and cargo planes, planes on carriers ----------

// vehicles riding on this ferry, plane or carrier
export function aboard(f) { return game.vehicles.filter((t) => t.aboard === f.id); }
export function carrierOf(t) { return t.aboard != null ? game.vehicles.find((f) => f.id === t.aboard) : null; }
// what kind of vehicle rides on this one's deck
export function deckFor(f) { return spec(f).deckFor ?? 'truck'; }
// how much deck a truck (trailers and all) or a plane takes up
export function deckSize(t) {
  if (t.kind === 'plane') return PLANES[t.model].deckSpace ?? 0;
  return TRUCKS[t.model].deck + t.cars.reduce((s, c) => s + TRAILERS[c].deck, 0);
}
// is it the right kind, and small enough, to come aboard at all?
export function fitsAboard(f, t) {
  if (t.kind !== deckFor(f) || t.cargo.some((j) => j.escort)) return false;
  return t.kind === 'plane' ? !!PLANES[t.model].deckSpace : !TRUCKS[t.model].noFerry;
}
export function deckUsed(f) { return aboard(f).reduce((s, t) => s + deckSize(t), 0); }
// truck spaces on a car ferry or cargo plane (a truck's own deck is the room it takes up)
export function deckRoom(f) { return f.kind === 'truck' ? 0 : spec(f).deck ?? 0; }
export function canBoard(f, t) {
  return !!f.city && t.city === f.city && fitsAboard(f, t) && deckUsed(f) + deckSize(t) <= deckRoom(f);
}

export function driveOn(f, t) {
  if (t.cargo.some((j) => j.escort)) { toast('A superload only goes by road, with its convoy', 'bad'); return; }
  if (!fitsAboard(f, t)) { toast(t.kind === 'plane' ? `A ${PLANES[t.model].name} is too big for a carrier` : `A ${TRUCKS[t.model].name} is too long to carry`, 'bad'); return; }
  if (!canBoard(f, t)) { toast(`No room for ${t.name} on the deck`, 'bad'); return; }
  t.aboard = f.id;
  t.city = null;
  delete t.loop;
  if (ui.activeVehicle === t.id) ui.activeVehicle = f.id;
}

// a truck drives off (or a plane takes off) wherever its carrier is parked, dropping off anything it has for this town
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
  Object.assign(ui, { tab: 'city', sheetOpen: true, activeVehicle: null, picking: false, plan: [], repeat: false, sendJob: null, focusVehicle: null, follow: null, track: null, focus: { x: cityById[g.selected].x, y: cityById[g.selected].y, t: Date.now() } });
  save();
}

// ---------- dev mode: for trying things out ----------

export function setDev(on) {
  dev.on = on;
  if (!on) { dev.speed = 1; if (ui.tab === 'dev') ui.tab = 'city'; }
  try { localStorage.setItem(KEY + '-dev', on ? '1' : '0'); } catch {}
}

export function devCoins(n) { game.coins += n; }

// jump the sky half a day on, without moving anything else
export function devSkipHalfDay() { game.dayShift = ((game.dayShift ?? 0) + DAY_LEN / 2) % DAY_LEN; }

export function devMaxLevel() {
  game.level = LEVELS.length;
  game.xp = Math.max(game.xp, LEVELS[LEVELS.length - 1]);
  toast(`Level ${game.level}. Everything in the shop is unlocked.`, 'level');
}

// a free vehicle of any model at the selected city, if it has the right station, airport, port or roads
export function devSpawn(kind, model) {
  const c = cityById[game.selected];
  if (!shopHere(c)) return;
  if (!canBase(kind, model, c)) { toast(`${SPECS[kind][model].name} can’t be based at ${c.name}`, 'bad'); return; }
  const s = SPECS[kind][model];
  const mix = kind === 'truck' ? s.pulls ?? ['van', 'dump', 'tank'] : kind === 'boat' ? ['deck', 'hopper', 'tank'] : s.pulls ?? (s.freightOnly ? ['box', 'tank', 'hopper'] : ['pax', 'box', 'tank', 'hopper']);
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

// a superload offer on the board (that one, or any), starting at the selected town if it can, in
// place of any already there
export function devSuperload(load = null) {
  const c = cityById[game.selected], now = gameNow();
  const o = makeSuperload(now, { from: isOpen(c.id) ? c.id : null, any: true, load }) ?? makeSuperload(now, { any: true, load });
  if (!o) { toast(`No two open towns that ${load ? `a ${load.name.toLowerCase()} can go` : 'a superload can go'} between. Unlock some first.`, 'bad'); return; }
  game.contracts.offers = [...game.contracts.offers.filter((x) => !x.super || byOf(x) !== o.by), o];
  toast(`Superload on offer: ${contractText(o)}`, 'good');
}

export function devFillJobs() {
  if (!isOpen(game.selected) || cityById[game.selected].anchor) { toast('Pick an unlocked town first', 'bad'); return; }
  for (let i = 0; i < 6; i++) addJob(game.selected);
}

export function devUnlockAll() {
  for (const c of CITIES) if (!isOpen(c.id)) { game.unlocked[c.id] = true; for (let i = 0; i < 4; i++) addJob(c.id); }
  reachCache.clear();
  toast('Every town is unlocked', 'good');
}
