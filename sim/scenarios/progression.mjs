// A normal first three days, half played and half idle, to see how fast levels come once routes run.
//   Play: Quick send every 15s, and every minute open towns and buy vehicles on Westmark, the starting island.
//   Level 3: build the HQ, then a rail route and a freight route down Westmark.
//   Level 4: a bus stop and post office in every open Westmark town, and bus and mail lines between them.
//   Idle: check in for 15 minutes a few times a day, away (game closed) in between and overnight.
// It prints a timeline of each session and when each level came. Run it on its own with:
//   npm run sim progression -- --report
import { fmtClock } from '../engine.mjs';

// how many towns each bus or mail line strings together; neighboring lines share an end stop
const LINE_LEN = 4;
// coins kept back when shopping, so fuel never runs out
const RESERVE = 400;

export default {
  name: 'Progression',
  about: 'three days of check-ins: manual play, then routes at level 3, then bus and mail lines',
  // takes a minute or two, so it only runs when asked for by name
  slow: true,
  run(sim) {
    const { G, D, game } = sim;
    // try another level curve: --levels 0,250,1250,... (the XP each level starts at, as in LEVELS)
    const li = process.argv.indexOf('--levels');
    if (li >= 0) {
      const want = process.argv[li + 1].split(',').map(Number);
      D.LEVELS.splice(0, D.LEVELS.length, ...want);
      console.log(`  trying levels ${D.LEVELS.join(' ')}`);
    }
    const west = D.CITIES.filter((c) => c.cont === 0).sort((a, b) => a.y - b.y);
    const openWest = () => west.filter((c) => G.isOpen(c.id));
    const rows = [];
    const log = (what) => rows.push({ at: sim.elapsed, what });
    let lastBuy = -Infinity;

    // ---------- the player's habits ----------

    // keep the HQ fund once it's due, so shopping doesn't spend it
    const reserve = () => (game.level >= D.HQ.level && !game.hq ? D.HQ.price + RESERVE : RESERVE);

    // open the next town down the island, cheapest first among the next two
    function unlockNext() {
      const next = west.filter((c) => !G.isOpen(c.id)).slice(0, 2).sort((a, b) => G.unlockPrice(a) - G.unlockPrice(b))[0];
      if (next && game.coins >= G.unlockPrice(next) + reserve() + 600) { G.unlockCity(next.id); log(`opened ${next.name} ($${G.unlockPrice(next)})`); sync(); return true; }
      return false;
    }

    // buy a road vehicle where jobs pile up: a bus for passengers, a box truck for cargo, a mail van for mail
    function buySome() {
      if (sim.elapsed - lastBuy < 120000) return;
      const waiting = (t) => openWest().map((c) => ({ c, n: game.jobs[c.id].filter((j) => j.type === t).length })).sort((a, b) => b.n - a.n)[0];
      const fleet = (t) => game.vehicles.filter((v) => v.kind === 'truck' && (G.capacity(v)[t] ?? 0) > 0).length;
      const wants = [['pax', 'smallbus'], ['cargo', 'boxtruck'], ['mail', 'mailvan']]
        .filter(([, m]) => D.TRUCKS[m].level <= game.level)
        .map(([t, m]) => ({ t, m, top: waiting(t), have: fleet(t) }))
        .filter((w) => w.top && w.top.n >= 3 + w.have)
        .sort((a, b) => b.top.n - b.have - (a.top.n - a.have));
      const w = wants[0];
      if (!w || game.coins < D.TRUCKS[w.m].price + reserve()) return;
      const v = sim.buy('truck', w.m, w.top.c.id);
      lastBuy = sim.elapsed;
      log(`bought ${D.TRUCKS[w.m].name} at ${w.top.c.name}`);
      sync(v);
    }

    // a careful player has routes service worn vehicles, and calls the roadside service out to
    // anything broken down when they check in (--careless skips both)
    const careful = !process.argv.includes('--careless');
    function repair() {
      if (!careful) return;
      for (const r of game.routes) r.autoService = true;
      for (const v of game.vehicles) if (v.broken && !v.broken.fixAt && game.coins >= G.calloutCost(v) + RESERVE) G.callRoadside(v);
    }

    // ---------- routes and lines ----------

    let rail = null, freight = null;
    function setUpRoutes() {
      if (game.hq || game.level < D.HQ.level || game.coins < D.HQ.price) return;
      G.buildHQ('frost');
      rail = G.createRoute(); G.renameRoute(rail, 'Westmark Rail');
      freight = G.createRoute(); G.renameRoute(freight, 'Westmark Freight');
      for (const r of [rail, freight]) r.back = true;
      log('built the HQ at Frostholm, set up Westmark Rail and Westmark Freight');
      sync();
    }

    // bus and mail lines once they unlock: a stop in every open town, lines of LINE_LEN towns down the island
    const lines = { bus: [], post: [] };
    function setUpLines() {
      if (game.level < D.LINES.bus.level) return;
      for (const kind of ['bus', 'post']) for (const c of openWest()) {
        if (!game.buildings[kind][c.id] && game.coins >= D.LINES[kind].price + reserve()) G.buyLine(kind, c.id);
      }
      for (const kind of ['bus', 'post']) {
        const stops = openWest().filter((c) => game.buildings[kind][c.id]).map((c) => c.id);
        for (let i = 0, k = 0; i < stops.length - 1; i += LINE_LEN - 1, k++) {
          const want = stops.slice(i, i + LINE_LEN);
          if (want.length < 2) break;
          let r = lines[kind][k];
          if (!r) { r = lines[kind][k] = G.createLine(kind, want[0]); r.back = true; log(`made ${r.name}`); }
          for (const id of want) if (!r.stops.some((s) => s.city === id)) G.addRouteStop(r, id);
        }
      }
      sync();
    }

    // put every road and rail vehicle that fits on a route or line, rebuilding the routes' stops as towns open
    function sync() {
      const ids = openWest().map((c) => c.id);
      for (const r of [rail, freight]) if (r) r.stops = ids.map((city) => ({ city, fill: false, drop: false }));
      for (const v of game.vehicles) {
        if (v.loop || G.escortKind(v) || !(v.city || v.trip)) continue;
        const cap = G.capacity(v);
        const line = (kind) => lines[kind].filter((r) => G.routeIds(r).length > 1).sort((a, b) => G.routeVehicles(a).length - G.routeVehicles(b).length)[0];
        let r = null;
        if (v.kind === 'truck' && cap.pax > 0 && line('bus')) r = line('bus');
        else if (v.kind === 'truck' && cap.mail > 0 && line('post')) r = line('post');
        else if (v.kind === 'truck' && cap.cargo > 0 && freight && G.routeIds(freight).length > 1) r = freight;
        else if (v.kind === 'train' && rail && G.routeIds(rail).length > 1) r = rail;
        if (r && !G.routeProblem(v, r)) { G.assignRoute(v, r); log(`put ${v.name} on ${r.name}`); }
      }
    }

    // a line running more than full gets another vehicle
    function topUpLines() {
      for (const kind of ['bus', 'post']) for (const r of lines[kind]) {
        const rep = G.routeReport(r);
        const n = G.routeVehicles(r).length;
        const m = kind === 'bus' ? 'smallbus' : 'mailvan';
        if ((n === 0 || (rep?.full ?? 0) > 0.6) && n < 3 && game.coins >= D.TRUCKS[m].price + reserve()) {
          const v = sim.buy('truck', m, G.routeIds(r)[0]);
          G.assignRoute(v, r);
          log(`added ${v.name} to ${r.name}`);
        }
      }
    }

    // ---------- sessions ----------

    function session(label, length, { until = null } = {}) {
      const s = snap();
      const end = sim.elapsed + (typeof length === 'number' ? length : parse(length));
      while (sim.elapsed < end && !(until && until())) {
        repair();
        if (G.idleVehicles().length) G.quickSendAll();
        if (Math.round(sim.elapsed / 15000) % 4 === 0) {
          setUpRoutes();
          setUpLines();
          topUpLines();
          unlockNext();
          buySome();
        }
        sim.advance('15s');
      }
      phase(label, s);
    }
    function idle(label, length) {
      const s = snap();
      sim.advance(length);
      phase(label, s);
    }
    function away(label, length) {
      const s = snap();
      const got = sim.away(length);
      phase(label, s, got.xp < got.xpOpen * 0.5 - 5 ? ` · away cap kept ${got.xp} of ${Math.round(got.xpOpen * 0.5)} XP` : '');
    }

    const phases = [];
    const snap = () => ({ at: sim.elapsed, coins: game.coins, xp: game.xp, level: game.level });
    function phase(label, s, note = '') {
      const mins = (sim.elapsed - s.at) / 60000;
      const carriers = game.vehicles.filter((v) => !G.escortKind(v) && Object.values(G.capacity(v)).some((n) => n > 0));
      const health = {
        looping: carriers.filter((v) => v.loop).length,
        broken: game.vehicles.filter((v) => v.broken).length,
        wear: Math.round((carriers.reduce((a, v) => a + G.wear(v), 0) / Math.max(1, carriers.length)) * 100),
        cash: Math.round(game.coins),
      };
      phases.push({ label, from: s.at, mins, coins: game.coins - s.coins, xp: game.xp - s.xp, level: game.level, note, fleet: game.vehicles.length, towns: openWest().length, health, carriers: carriers.length });
    }
    const parse = (t) => ({ s: 1000, m: 60000, h: 3600000 })[t.slice(-1)] * Number(t.slice(0, -1));

    // ---------- the three days ----------

    session('Day 1 · first sitting, to level 3 and the HQ', '3h', { until: () => !!game.hq });
    session('Day 1 · setting up routes', '15m');
    idle('Day 1 · left open, not touching it', '30m');
    away('Day 1 · away', '1h');
    session('Day 1 · check in', '15m');
    away('Day 1 · away', '3h');
    session('Day 1 · check in', '15m');
    away('Night 1', '8h');
    for (const day of [2, 3]) {
      session(`Day ${day} · morning check in`, '15m');
      away(`Day ${day} · away`, '4h');
      session(`Day ${day} · lunch check in`, '15m');
      away(`Day ${day} · away`, '4h');
      session(`Day ${day} · evening sitting`, '30m');
      away(`Night ${day}`, '8h');
    }
    session('Day 4 · morning check in', '15m');

    // ---------- what happened ----------

    console.log('\n  Sessions');
    for (const p of phases) {
      console.log(`  ${fmtClock(p.from).padStart(9)}  ${p.label.padEnd(46)} ${fmtClock(p.mins * 60000).padStart(7)}  ${`+$${Math.round(p.coins)}`.padStart(9)}  ${`+${Math.round(p.xp)} xp`.padStart(10)}  ${`${Math.round(p.xp / Math.max(1, p.mins))} xp/min`.padStart(12)}  lvl ${p.level}  ${p.fleet} vehicles, ${p.towns} towns${p.note}`);
      console.log(`  ${''.padStart(9)}  ${''.padEnd(46)} ${p.health.looping}/${p.carriers} on routes · ${p.health.broken} broken down · ${p.health.wear}% wear · $${p.health.cash} in the bank`);
    }
    if (process.argv.includes('--report')) {
      console.log('\n  Routes at the end');
      for (const r of game.routes) {
        const rep = G.routeReport(r);
        console.log(`    ${r.name.padEnd(22)} ${G.routeVehicles(r).length} vehicles · ${rep?.laps ?? 0} laps · ${rep ? `$${Math.round(rep.profit)}/lap` : '–'} · ${rep?.perMin != null ? `$${Math.round(rep.perMin)}/min` : '–'} · ${rep?.full != null ? `${Math.round(rep.full * 100)}% full` : '–'}`);
      }
      console.log(`  Broken down: ${game.vehicles.filter((v) => v.broken).map((v) => v.name).join(', ') || 'none'}`);
    }
    console.log('\n  Levels');
    for (const l of sim.levels) {
      const p = phases.find((x) => l.at >= x.from && l.at <= x.from + x.mins * 60000);
      console.log(`  level ${String(l.level).padStart(2)} at ${fmtClock(l.at).padStart(8)}  (${p?.label ?? ''})  needs ${D.LEVELS[l.level - 1]} xp`);
    }
    if (process.argv.includes('--log')) {
      console.log('\n  What the player did');
      for (const r of rows) console.log(`  ${fmtClock(r.at).padStart(9)}  ${r.what}`);
    }

    sim.expect(sim.levels.some((l) => l.level === 3), 'reached level 3');
    sim.expect(!!game.hq, 'built the HQ');
    sim.expect(lines.bus.length > 0 && lines.post.length > 0, `made bus and mail lines (${lines.bus.length} bus, ${lines.post.length} mail)`);
  },
};
