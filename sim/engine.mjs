// A headless simulator for Pixel Transport: loads the real game code (src/game) through Vite, with a
// fake clock you move on yourself and seeded randomness, so a scenario plays out the same way every
// run. See sim/README.md, and sim/scenarios for examples.
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const realNow = Date.now;
const realRandom = Math.random;

// one Vite server for the whole run; each sim gets its own fresh copy of the game modules
let server = null, loads = 0;
async function vite() {
  server ??= await createServer({ root, configFile: `${root}vite.config.mjs`, server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error' });
  return server;
}
export async function closeSims() {
  Date.now = realNow;
  Math.random = realRandom;
  delete globalThis.__simToast;
  await server?.close();
  server = null;
}

// small, fast, seedable random numbers (mulberry32)
function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// '90s', '5m', '1.5h' or a number of ms, as ms
export function ms(t) {
  if (typeof t === 'number') return t;
  const m = /^([\d.]+)\s*(ms|s|m|h)$/.exec(String(t).trim());
  if (!m) throw new Error(`Can't read the time ${t}. Use a number of ms, or like 90s, 5m, 1.5h`);
  return Number(m[1]) * { ms: 1, s: 1000, m: 60000, h: 3600000 }[m[2]];
}

const BUY = { truck: 'buyTruck', train: 'buyEngine', plane: 'buyPlane', boat: 'buyBoat' };

// a new game, ready to play. Options:
//   seed   randomness, so the same seed plays out the same way (default 1)
//   level  start at this level (default 1)
//   coins  start with this many coins (default the game's own)
//   towns  extra towns to unlock for free, by id
//   save   a saved game (the object, or its JSON) to load instead of starting fresh
//   log    print toasts as they happen
export async function createSim({ seed = 1, level, coins, towns = [], save = null, log = false } = {}) {
  const srv = await vite();
  const copy = ++loads;

  // the clock and randomness the game sees, from before it loads so its first timestamps match
  let now = Date.UTC(2026, 0, 1, 12);
  const start = now;
  Date.now = () => now;
  Math.random = seeded(seed);
  const store = {};
  globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } };
  if (save) store['pixel-transport-save-v1'] = typeof save === 'string' ? save : JSON.stringify(save);

  const toasts = [];
  globalThis.__simToast = (text, kind) => {
    toasts.push({ at: now, text, kind });
    if (log) console.log(`  [${fmtClock(now - start)}] ${kind === 'bad' ? '✗' : kind === 'good' ? '✓' : '·'} ${text}`);
  };

  // a fresh copy of the game module (and so a fresh game) for each sim. The data it imports is shared,
  // which is fine since the game never changes it.
  const G = await srv.ssrLoadModule(`/src/game/game.svelte.js?sim=${copy}`);
  const D = await srv.ssrLoadModule('/src/game/data.js');
  const { game } = G;
  if (level != null) game.level = level;
  if (coins != null) game.coins = coins;
  for (const id of towns) game.unlocked[id] = true;

  const sim = {
    G, D, game, ui: G.ui, toasts,
    // game time passed since the sim started, in ms
    get elapsed() { return now - start; },
    now: () => G.gameNow(),

    // move the clock on, ticking the game every `tick` ms the way the page does (250ms)
    advance(t, { tick = 250 } = {}) {
      const end = now + ms(t);
      while (now < end) { now = Math.min(end, now + tick); G.simStep(); noteLevel(); }
      return sim;
    },
    // the player closes the game for a while and comes back: the fleet runs on, but XP comes in at the
    // away rate and can go up at most one level (see goAway). Returns what came in.
    away(t, opts) {
      const coins = game.coins, xp = game.xp, level = game.level;
      G.simAway(true);
      sim.advance(t, opts);
      G.simAway(false);
      const out = { coins: game.coins - coins, xp: game.xp - xp, level: game.level - level };
      // XP the deliveries would have paid with the game open, and what the away cap kept
      out.xpOpen = Math.round(out.coins / 8);
      return out;
    },
    // when each level was reached, in game ms since the start
    levels: [],
    // tick until test() is true or `max` game time has gone by. True if it came true.
    until(test, { max = '1h', tick = 250 } = {}) {
      const end = now + ms(max);
      while (now < end) {
        if (test()) return true;
        now = Math.min(end, now + tick);
        G.simStep();
        noteLevel();
      }
      return !!test();
    },
    // jump every moving vehicle to the end of the leg it's on
    finishLegs() { G.devFinishLegs(); return sim; },

    // ---------- setting things up ----------
    city: (id) => G.cityById[id],
    unlock(...ids) { for (const id of ids) game.unlocked[id] = true; return sim; },
    // buy a vehicle at a town (paid for as in the game). kind: truck, train, plane or boat
    buy(kind, model, at) {
      game.selected = at;
      const n = game.vehicles.length;
      G[BUY[kind]](model);
      if (game.vehicles.length === n) throw new Error(`Couldn't buy a ${model} at ${at}: ${toasts.at(-1)?.text ?? 'no reason given'}`);
      return game.vehicles.at(-1);
    },
    // a job waiting at a town, ready to be picked up
    job(from, to, { type = 'pax', pay = 100, ...rest } = {}) {
      const j = { id: game.nextId++, type, from, to, pay, at: G.gameNow(), ...rest };
      game.jobs[from].push(j);
      return j;
    },
    vehicle: (name) => game.vehicles.find((v) => v.name === name || v.id === name),
    lastToast: () => toasts.at(-1)?.text ?? null,

    // ---------- checking how it went ----------
    checks: [],
    // record a check; scenarios fail if any check fails
    expect(ok, what) {
      sim.checks.push({ ok: !!ok, what });
      return !!ok;
    },
    // a snapshot of how the company is doing
    report() {
      const t = G.gameNow();
      return {
        time: fmtClock(now - start),
        coins: Math.round(game.coins),
        level: game.level,
        xp: Math.round(game.xp),
        vehicles: game.vehicles.map((v) => ({
          name: v.name,
          model: v.model,
          where: v.city ? `at ${v.city}` : v.trip ? `to ${v.trip.to}` : 'aboard',
          route: v.loop?.route != null ? G.routeById(v.loop.route)?.name : v.loop ? 'own loop' : null,
          earned: Math.round(v.books?.earned ?? 0),
          fuel: Math.round(v.books?.fuel ?? 0),
          cargo: v.cargo.length,
        })),
        routes: game.routes.map((r) => {
          const rep = G.routeReport(r, t);
          return { name: r.name, line: r.line ?? null, stops: G.routeIds(r), vehicles: G.routeVehicles(r).length, laps: rep?.laps ?? 0, perLap: rep ? Math.round(rep.profit) : null, perMin: rep?.perMin != null ? Math.round(rep.perMin) : null, full: rep?.full != null ? Math.round(rep.full * 100) : null };
        }),
        waiting: Object.fromEntries(Object.entries(game.jobs).filter(([id, l]) => l.length && G.isOpen(id)).map(([id, l]) => [id, l.length])),
      };
    },
    // print the report as a few readable lines
    print() {
      const r = sim.report();
      console.log(`  ${r.time} · $${r.coins} · level ${r.level} (${r.xp} xp)`);
      for (const v of r.vehicles) console.log(`    ${v.name} (${v.model}) ${v.where}${v.route ? ` on ${v.route}` : ''} · earned $${v.earned}, fuel $${v.fuel}${v.cargo ? ` · ${v.cargo} aboard` : ''}`);
      for (const x of r.routes) console.log(`    ${x.line ? `${x.line} line` : 'route'} ${x.name}: ${x.stops.join(' → ') || 'no stops'} · ${x.vehicles} vehicles · ${x.laps} laps${x.perLap != null ? ` · $${x.perLap}/lap` : ''}${x.perMin != null ? ` · $${x.perMin}/min` : ''}${x.full != null ? ` · ${x.full}% full` : ''}`);
      return sim;
    },
  };
  let lastLevel = game.level;
  function noteLevel() {
    while (lastLevel < game.level) sim.levels.push({ level: ++lastLevel, at: now - start });
  }
  return sim;
}

export function fmtClock(t) {
  const s = Math.floor(t / 1000), d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
  if (d) return `${d}d${String(h).padStart(2, '0')}h${String(m).padStart(2, '0')}m`;
  return h ? `${h}h${String(m).padStart(2, '0')}m` : `${m}m${String(s % 60).padStart(2, '0')}s`;
}
