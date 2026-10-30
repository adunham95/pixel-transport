<script>
  import { onMount } from 'svelte';
  import { game, ui, cityById, leg, planLegs, toggleStop, selectCity, posAt, tripProgress, gameNow, isOpen, fx, darkness, loopStops, isCarrier, carrierAt, townSize, escortsOf, consistOf, paintOf } from './game.svelte.js';
  import { CITIES, ENGINES, PLANES, CARS, TRUCKS, BOATS, W, H } from './data.js';
  import { buildTerrain, makeWaterPattern, R } from './terrain.js';
  import { drawArt, trainUnits, paintOrder, artSize, loadArt } from './sprites.js';
  import { dockOf } from './sea.js';
  import { reduced } from './motion.js';

  let { sheetPx = 0 } = $props();
  const V = 1.6; // vehicles are drawn a bit larger than the map grid so their detail reads
  const CONVOY_GAP = 1.5; // sub pixels between a superload's truck and its escorts
  const TRAY_ORDER = { train: 0, truck: 1, boat: 2, plane: 3 };
  let canvas;

  // zoom levels as multiples of the screen's natural scale, rounded so pixels stay square
  const ZOOMS = [0.5, 0.75, 1, 1.5, 2, 3];
  const ZOOM_KEY = 'pixel-transport-zoom';
  let canIn = $state(false), canOut = $state(false), zoomBy = $state(null);

  const BUILDINGS = [
    // dx, dy(top of roof), w, roofH, wallH, roof, roofLight, wall
    [-8, -6, 6, 3, 5, '#c9553f', '#e2735c', '#efe6d2'],
    [-1, -11, 7, 3, 9, '#3f6fa8', '#5d8cc6', '#dfe4ea'],
    [-5, -1, 6, 2, 4, '#7a5aa8', '#9878c6', '#f2eadb'],
  ];
  // one more building for each size a town grows to, behind the first three
  const GROWN = [
    [4, -5, 5, 2, 5, '#2f9a5a', '#4cb874', '#efe6d2'],
    [-13, -4, 4, 2, 5, '#c9553f', '#e2735c', '#f2eadb'],
    [6, -13, 4, 2, 9, '#5b6470', '#7a8492', '#dfe4ea'],
    [-11, -14, 5, 2, 10, '#3f6fa8', '#5d8cc6', '#dfe4ea'],
  ];

  onMount(() => {
    const ctx = canvas.getContext('2d');
    const buf = document.createElement('canvas');
    const b = buf.getContext('2d');
    const terrain = buildTerrain();
    loadArt();
    const water = b.createPattern(makeWaterPattern(), 'repeat');
    const WS = W * R, HS = H * R;
    let dpr = 1, scale = 2, bw = 0, bh = 0;
    let levels = [1], at = 0, baseAt = 0, zoomFx = null;
    let zoomStep = (() => { try { return Number(localStorage.getItem(ZOOM_KEY)) || 0; } catch { return 0; } })();
    const snap = document.createElement('canvas');
    let camX = 0, camY = 0, vx = 0, vy = 0, drag = null, target = null, lastFocus = 0, centered = false;

    const visibleH = () => bh - (sheetPx * dpr) / scale;

    function resize() {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 3);
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      // sized off the shorter side, so a wide desktop map isn't zoomed right in
      const base = Math.max(1, Math.floor(Math.min(canvas.width, canvas.height) / 300));
      levels = [...new Set(ZOOMS.map((m) => Math.max(1, Math.round(base * m))))];
      baseAt = levels.indexOf(base);
      at = Math.min(levels.length - 1, Math.max(0, baseAt + zoomStep));
      applyScale();
    }
    function applyScale() {
      scale = levels[at];
      bw = Math.ceil(canvas.width / scale);
      bh = Math.ceil(canvas.height / scale);
      buf.width = bw; buf.height = bh;
      canIn = at < levels.length - 1;
      canOut = at > 0;
    }
    // step the zoom, keeping whatever is in the middle of the visible map where it is
    zoomBy = (d) => {
      if (!bw || at + d < 0 || at + d >= levels.length) return;
      const old = scale, mx = camX + bw / 2, my = camY + visibleH() / 2;
      const tc = target && { x: target.x + bw / 2, y: target.y + visibleH() / 2 };
      // hold on to the old view so it can grow or shrink away over the new one
      snap.width = canvas.width; snap.height = canvas.height;
      snap.getContext('2d').drawImage(canvas, 0, 0);
      at += d;
      zoomStep = at - baseAt;
      try { localStorage.setItem(ZOOM_KEY, String(zoomStep)); } catch {}
      applyScale();
      camX = mx - bw / 2; camY = my - visibleH() / 2; vx = vy = 0;
      if (tc) target = { x: tc.x - bw / 2, y: tc.y - visibleH() / 2 };
      zoomFx = { k: scale / old, t: Date.now() };
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    function clampCam() {
      const m = 28;
      const maxX = Math.max(-m, WS + m - bw), maxY = Math.max(-m, HS + m - visibleH());
      if (camX < -m) { camX = -m; vx = 0; }
      if (camX > maxX) { camX = maxX; vx = 0; }
      if (camY < -m) { camY = -m; vy = 0; }
      if (camY > maxY) { camY = maxY; vy = 0; }
    }
    // camera position that puts a world point in the middle of the visible map
    const aim = (wx, wy) => ({ x: wx * R - bw / 2, y: wy * R - visibleH() / 2 });

    const big = (x, y, fn) => { b.save(); b.translate(x, y); b.scale(V, V); fn(); b.restore(); };
    const rect = (c, x, y, w, h) => { b.fillStyle = c; b.fillRect(x, y, w, h); };

    // a wooden jetty from town out to where boats moor
    function pier(c) {
      const d = dockOf(c.id);
      if (!d) return;
      const x0 = c.x * R, y0 = c.y * R, dx = d[0] * R - x0, dy = d[1] * R - y0, L = Math.hypot(dx, dy);
      const ux = dx / L, uy = dy / L;
      for (let k = 8; k < L - 2; k++) {
        const x = Math.round(x0 + ux * k), y = Math.round(y0 + uy * k);
        rect('#5b4232', x - 1, y - 1, 3, 3);
        rect(k % 3 ? '#a07a52' : '#8a6948', x, y, 1, 1);
      }
      const ex = Math.round(d[0] * R - ux * 2), ey = Math.round(d[1] * R - uy * 2);
      rect('#5b4232', ex - 2, ey - 2, 5, 5); rect('#a07a52', ex - 1, ey - 1, 3, 3);
    }

    // white water trailing a moving boat
    function wake(x, y, ang, len, now) {
      const dx = Math.cos(ang), dy = Math.sin(ang);
      for (let i = 1; i <= 6; i++) {
        const back = (len / 2) * V + i * 2.2, spread = i * 1.1 + Math.sin(now / 200 + i) * 0.4;
        b.fillStyle = `rgba(235,245,255,${0.7 - i * 0.1})`;
        for (const side of [-1, 1]) b.fillRect(Math.round(x - dx * back - dy * spread * side), Math.round(y - dy * back + dx * spread * side), 1, 1);
      }
      b.fillStyle = 'rgba(235,245,255,0.55)';
      b.fillRect(Math.round(x - dx * ((len / 2) * V + 1)), Math.round(y - dy * ((len / 2) * V + 1)), 1, 1);
    }

    // an anchorage: a red and white buoy bobbing in a ring of rope floats
    function buoy(c, now) {
      const x = Math.round(c.x * R), y = Math.round(c.y * R) + (Math.floor(now / 600) % 2);
      b.fillStyle = 'rgba(235,245,255,0.55)';
      for (let k = 0; k < 12; k++) b.fillRect(Math.round(x + Math.cos(k / 12 * 6.283) * 11), Math.round(y + Math.sin(k / 12 * 6.283) * 8), 1, 1);
      rect('#1d2433', x - 2, y - 4, 5, 7);
      rect('#d6453a', x - 1, y - 3, 3, 2); rect('#f4f6f8', x - 1, y - 1, 3, 1); rect('#d6453a', x - 1, y, 3, 2);
      rect('#ffd23f', x, y - 5, 1, 1);
    }

    // a little grey garage with a roller door, beside towns that have a depot
    function depot(x, y) {
      rect('#1d2433', x - 1, y - 1, 8, 6);
      rect('#8a949e', x, y, 6, 4); rect('#a7b0ba', x, y, 6, 1);
      rect('#4a4f57', x + 1, y + 1, 4, 3);
      for (let k = 0; k < 3; k++) rect('#5b6470', x + 1, y + 1 + k, 4, 1 - (k % 2) * 0.5);
    }

    // a flag in company colors flying over the HQ's town
    function hqFlag(x, y, now) {
      const paint = game.livery ?? { body: '#d6453a', accent: '#f4f6f8' }, wave = Math.floor(now / 400) % 2;
      rect('#1d2433', x - 1, y - 1, 7, 5);
      rect('#1d2433', x - 1, y - 1, 2, 13);
      rect('#c9ced4', x, y, 1, 12);
      rect(paint.body, x + 1, y + wave * 0.5, 4, 3);
      rect(paint.accent, x + 1, y + 1 + wave * 0.5, 4, 1);
    }

    // a superload's escorts go along with it, the first just ahead, the next just behind, and so on.
    // units are what it's drawn as (from trainUnits), with offsets in world units; later queues night lights.
    function convoy(v, t, d, units, now, later) {
      let front = -artSize(v.kind, v.model).w / 2, back = Math.max(...units.map((u) => (u.off * R) / V + artSize(u.kind, u.model).w / 2));
      escortsOf(v).forEach((x, i) => {
        const w = artSize(x.kind, x.model).w, ahead = i % 2 === 0;
        const off = ahead ? front - CONVOY_GAP - w / 2 : back + CONVOY_GAP + w / 2;
        if (ahead) front = off - w / 2; else back = off + w / 2;
        const dd = d - (off * V) / R;
        if (dd <= 0.2) return;
        const p = posAt(t.pts, dd), u = [{ kind: x.kind, model: x.model, off: 0, p }];
        if (x.kind === 'boat') wake(p.x * R, p.y * R, p.ang, w, now);
        big(p.x * R + 0.7 * V, p.y * R + V, () => drawArt(b, 0, 0, p.ang, x.kind, x.model, { shadow: true }));
        big(p.x * R, p.y * R, () => drawArt(b, 0, 0, p.ang, x.kind, x.model, { paint: paintOf(x) }));
        beacons(x, p, now, later);
        later?.(() => (x.kind === 'boat' ? boatLights(p.x * R, p.y * R, p.ang, x.model) : consistLights(x, u)));
      });
    }

    function drawCity(c, now) {
      const x = c.x * R, y = c.y * R;
      if (game.depots[c.id]) depot(c.island ? x - 13 : x + 5, c.island ? y - 2 : y + 4);
      if (game.hq === c.id) hqFlag(c.island ? x - 9 : x - 11, c.island ? y - 12 : y - 13, now);
      if (c.air) {
        rect('#2c3038', x - 14, y + 7, 28, 8);
        rect('#535965', x - 13, y + 8, 26, 6);
        for (let i = 0; i < 6; i++) rect('#eef1f4', x - 11 + i * 4, y + 10, 2, 1);
        rect('#ffd23f', x - 13, y + 8, 1, 6); rect('#ffd23f', x + 12, y + 8, 1, 6);
      }
      if (c.island) {
        rect('rgba(0,0,0,0.25)', x - 4, y + 3, 10, 2);
        rect('#1d2433', x - 5, y - 4, 10, 8);
        rect('#d9a24a', x - 4, y - 3, 8, 3); rect('#efc067', x - 4, y - 3, 8, 1);
        rect('#efe3c6', x - 3, y, 6, 3); rect('#7a5232', x - 1, y + 1, 2, 2);
        rect('#7a5232', x + 6, y - 5, 1, 7);
        rect('#3f9a46', x + 4, y - 7, 5, 2); rect('#5cb85c', x + 5, y - 8, 3, 1);
        return;
      }
      rect('rgba(0,0,0,0.22)', x - 7, y + 4, 15, 2);
      const size = isOpen(c.id) ? townSize(c.id) : 1;
      for (const [dx, dy, w, rh, wh, roof, roofL, wall] of [...GROWN.slice(0, size - 1).reverse(), ...BUILDINGS]) {
        const bx = x + dx, by = y + dy;
        rect('#1d2433', bx - 1, by - 1, w + 2, rh + wh + 2);
        rect(roof, bx, by, w, rh); rect(roofL, bx, by, w, 1);
        rect(wall, bx, by + rh, w, wh);
        rect('rgba(0,0,0,0.12)', bx + w - 1, by + rh, 1, wh);
        for (let wy = by + rh + 1; wy < by + rh + wh - 1; wy += 2)
          for (let wx = bx + 1; wx < bx + w - 1; wx += 2) rect((wx + wy) % 3 ? '#ffd86b' : '#8aa0b8', wx, wy, 1, 1);
      }
    }

    function ring(c, now) {
      const r = 14 + (Math.floor(now / 250) % 2) * 2, x = c.x * R, y = c.y * R;
      b.strokeStyle = '#ffd23f'; b.lineWidth = 1.5;
      b.beginPath(); b.arc(x + 0.5, y + 0.5, r, 0, 7); b.stroke();
    }
    function brackets(c) {
      const x0 = c.x * R - 15, y0 = c.y * R - 15, x1 = c.x * R + 15, y1 = c.y * R + 17;
      b.fillStyle = '#ffd23f';
      for (const [x, y, sx, sy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) {
        b.fillRect(sx > 0 ? x : x - 4, sy > 0 ? y : y - 1, 5, 2);
        b.fillRect(sx > 0 ? x : x - 1, sy > 0 ? y : y - 4, 2, 5);
      }
    }

    function steam(x, y, ang, at, now) {
      const dx = Math.cos(ang), dy = Math.sin(ang);
      const sx = x + dx * at * V, sy = y + dy * at * V;
      for (let i = 0; i < 4; i++) {
        const a = ((now / 900) + i / 4) % 1;
        b.fillStyle = `rgba(245,245,245,${0.75 * (1 - a)})`;
        b.beginPath();
        b.arc(sx - dx * a * 9 + Math.sin(i * 2.1) * a * 2, sy - dy * a * 9 - a * 5, 0.9 + a * 2.2, 0, 7);
        b.fill();
      }
    }

    const path = (pts, off = 0) => { b.beginPath(); pts.forEach(([x, y], i) => (i ? b.lineTo(x * R + off, y * R + off) : b.moveTo(x * R + off, y * R + off))); b.stroke(); };
    // a leg's points split where the vehicle is: the part behind it and the part ahead
    function splitAt(pts, d) {
      const p = posAt(pts, d), behind = [pts[0]], ahead = [[p.x, p.y]];
      let acc = 0;
      for (let i = 1; i < pts.length; i++) {
        acc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        (acc <= d ? behind : ahead).push(pts[i]);
      }
      behind.push([p.x, p.y]);
      return [behind, ahead];
    }
    function stopDot(id) {
      const c = cityById[id];
      rect('#121626', c.x * R - 2, c.y * R - 2, 5, 5);
      rect('#ffd23f', c.x * R - 1, c.y * R - 1, 3, 3);
    }
    // the tracked vehicle's route: dashed where it's been, solid where it's headed
    function trackedRoute(v, gnow) {
      const t = v.trip, [behind, ahead] = splitAt(t.pts, tripProgress(t, gnow) * t.len);
      b.save();
      b.lineWidth = 1.5; b.setLineDash([3, 3]);
      b.strokeStyle = 'rgba(255,255,255,0.55)'; path(behind);
      b.setLineDash([]); b.lineWidth = 2;
      for (const pts of [ahead, ...(v.next ?? []).map((l) => l.pts)]) {
        b.strokeStyle = 'rgba(18,22,38,0.6)'; path(pts, 1);
        b.strokeStyle = '#ffd23f'; path(pts);
      }
      b.restore();
      stopDot(v.depart?.from ?? t.from);
      for (const l of [t, ...(v.next ?? [])]) stopDot(l.to);
    }
    const marker = (x, y) => { b.fillStyle = '#ffd23f'; b.beginPath(); b.moveTo(x - 3, y - 4); b.lineTo(x + 3, y - 4); b.lineTo(x, y); b.fill(); };
    const marked = (v) => ui.follow === v.id || ui.track === v.id;
    let hits = []; // where moving vehicles were drawn this frame, for tapping them
    const ripples = []; // rings spreading out from taps, in sub pixels

    function drawRipples(now) {
      for (let i = ripples.length - 1; i >= 0; i--) {
        const a = (now - ripples[i].t) / 420;
        if (a >= 1 || reduced) { ripples.splice(i, 1); continue; }
        b.strokeStyle = `rgba(255,210,63,${0.9 * (1 - a)})`; b.lineWidth = 1.5;
        b.beginPath(); b.arc(ripples[i].x, ripples[i].y, 4 + a * 14, 0, 7); b.stroke();
      }
    }

    // ---------- night lights ----------
    // the sky's tint, multiplied over the map: white by day, warm at dusk, deep blue at night
    const mix = (a, c, t) => a.map((v, i) => Math.round(v + (c[i] - v) * t));
    const tint = (k) => `rgb(${k < 0.35 ? mix([255, 255, 255], [255, 205, 170], k / 0.35) : mix([255, 205, 170], [70, 90, 165], (k - 0.35) / 0.65)})`;
    // a spot on a vehicle's art (sub pixels, front toward +x) out on the map
    const onArt = (x, y, ang, lx, ly) => [x + V * (lx * Math.cos(ang) - ly * Math.sin(ang)), y + V * (lx * Math.sin(ang) + ly * Math.cos(ang))];
    function glow(x, y, r, rgb, a) {
      const g = b.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`);
      b.fillStyle = g; b.fillRect(x - r, y - r, r * 2, r * 2);
    }
    // a small bright lamp with a halo
    function lamp([x, y], rgb, a = 1) {
      glow(x, y, 3.5, rgb, 0.6 * a);
      b.fillStyle = `rgba(${rgb},${a})`; b.fillRect(Math.floor(x), Math.floor(y), 1, 1);
    }
    // a headlight beam fanning out ahead
    function beam([x, y], ang, len, spread) {
      const dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy, ny = dx;
      const g = b.createLinearGradient(x, y, x + dx * len, y + dy * len);
      g.addColorStop(0, 'rgba(255,236,170,0.5)'); g.addColorStop(1, 'rgba(255,236,170,0)');
      b.fillStyle = g;
      b.beginPath();
      b.moveTo(x + nx * 1.5, y + ny * 1.5);
      b.lineTo(x + dx * len + nx * spread, y + dy * len + ny * spread);
      b.lineTo(x + dx * len - nx * spread, y + dy * len - ny * spread);
      b.lineTo(x - nx * 1.5, y - ny * 1.5);
      b.fill();
    }
    // lit windows, a warm glow over town and runway edge lights; locked towns stay dark
    function townLights(c, now) {
      const x = c.x * R, y = c.y * R;
      glow(x, y - 3, 18, '255,190,110', 0.3);
      b.fillStyle = '#ffd86b';
      if (c.island) { b.fillRect(x - 3, y + 1, 1, 1); b.fillRect(x + 2, y + 1, 1, 1); }
      else for (const [dx, dy, w, rh, wh] of BUILDINGS) {
        const bx = x + dx, by = y + dy;
        for (let wy = by + rh + 1; wy < by + rh + wh - 1; wy += 2)
          for (let wx = bx + 1; wx < bx + w - 1; wx += 2) if ((wx + wy) % 3) b.fillRect(wx, wy, 1, 1);
      }
      if (c.air) for (let i = 0; i < 7; i++) {
        const on = reduced || Math.floor(now / 140) % 7 !== i;
        for (const ry of [y + 8, y + 13]) lamp([x - 12 + i * 4, ry], on ? '150,200,255' : '60,90,140', 0.8);
      }
    }
    // nav lights: red on the left wingtip, green on the right, a white strobe on the tail
    function planeLights(x, y, ang, model, now) {
      const s = artSize('plane', model), p = PLANES[model];
      // a balloon just has its burner, flaring now and then
      if (p.balloon) { const k = reduced || now % 2400 < 600 ? 0.6 : 0.3; glow(x, y, 7, '255,170,60', k); lamp([x, y], '255,200,120'); return; }
      lamp(onArt(x, y, ang, 0, -s.h * 0.44), '255,70,60');
      lamp(onArt(x, y, ang, 0, s.h * 0.44), '80,255,120');
      const t = now % 1300;
      if (reduced || t < 70 || (t > 180 && t < 250)) { const tail = onArt(x, y, ang, -s.w * 0.44, 0); lamp(tail, '255,255,255'); glow(tail[0], tail[1], 7, '255,255,255', 0.35); }
      // helicopters also carry a slow red beacon
      if (p.rotors && (reduced || now % 1000 < 450)) { const c = onArt(x, y, ang, 0, 0); lamp(c, '255,60,50'); glow(c[0], c[1], 6, '255,60,50', 0.4); }
    }
    // red and green at the bow, white on the mast and stern, a glow from the cabin
    function boatLights(x, y, ang, model) {
      const s = artSize('boat', model);
      glow(x, y, 6, '255,210,130', 0.3);
      lamp(onArt(x, y, ang, s.w * 0.15, 0), '255,255,235');
      lamp(onArt(x, y, ang, s.w * 0.32, -s.h * 0.4), '255,70,60');
      lamp(onArt(x, y, ang, s.w * 0.32, s.h * 0.4), '80,255,120');
      lamp(onArt(x, y, ang, -s.w * 0.48, 0), '255,255,235', 0.7);
      // a carrier's flight deck is edged with landing lights
      if (isCarrier(model)) for (let k = -2; k <= 2; k++) for (const side of [-1, 1]) { const [lx, ly] = onArt(x, y, ang, k * s.w * 0.18, side * s.h * 0.28); b.fillStyle = 'rgba(255,220,140,0.75)'; b.fillRect(Math.floor(lx), Math.floor(ly), 1, 1); }
    }
    // trains: a headlight, lit passenger windows, a red lamp on the last car, maglevs glowing underneath.
    // trucks and buses: headlights, and tail lights on the back of each trailer (or the truck itself)
    // oversize rigs, superload carriers and escorts flash their beacons in turn, day and night: amber
    // unless they say otherwise. A tug only lights its convoy beacons while it's escorting.
    function beacons(v, p, now, later) {
      const s = { train: ENGINES, truck: TRUCKS, boat: BOATS }[v.kind]?.[v.model];
      const list = s?.beacons ?? (v.escorting != null ? s?.convoyBeacons : null);
      if (!list) return;
      const i = Math.floor(now / 280) % list.length, on = list[i], color = s.beaconColors?.[i] ?? '255,170,30';
      const at = onArt(p.x * R, p.y * R, p.ang, on[0], on[1]);
      lamp(at, color);
      later?.(() => lamp(at, color));
    }

    function consistLights(v, placed) {
      const pos = (u, lx, ly) => onArt(u.p.x * R, u.p.y * R, u.p.ang, lx, ly);
      placed.forEach((u, i) => {
        const s = artSize(u.kind, u.model), last = i === placed.length - 1;
        if (u.off === 0) {
          if (v.kind === 'truck') {
            beam(pos(u, s.w / 2, 0), u.p.ang, 14, 5);
            for (const side of [-1, 1]) lamp(pos(u, s.w / 2, side * s.h * 0.3), '255,245,200');
          } else {
            beam(pos(u, s.w / 2, 0), u.p.ang, 20, 4);
            lamp(pos(u, s.w / 2, 0), '255,245,200');
          }
        }
        if (v.kind === 'train') {
          if (ENGINES[v.model].maglev) { const c = pos(u, 0, 0); glow(c[0], c[1], 6, '80,210,255', 0.35); }
          if (u.kind === 'car' && CARS[u.model].holds === 'pax') { const c = pos(u, 0, 0); glow(c[0], c[1], 6, '255,210,120', 0.5); }
          if (last) lamp(pos(u, -s.w / 2, 0), '255,60,50');
        } else if (u.kind === 'trailer' || u.kind === 'load' || (last && u.off === 0)) {
          for (const side of [-1, 1]) lamp(pos(u, -s.w / 2, side * s.h * 0.35), '255,50,40', 0.9);
        }
      });
    }

    let raf;
    function frame() {
      raf = requestAnimationFrame(frame);
      if (!bw) return;
      const now = Date.now(), gnow = gameNow(); // now drives animation, gnow drives where vehicles are
      const dk = darkness(gnow);
      const lights = []; // drawn over the night sky once everything else is down

      if (!centered && sheetPx > 0) { centered = true; const c = cityById[game.selected]; ({ x: camX, y: camY } = aim(c.x, c.y)); }
      if (ui.focus && ui.focus.t !== lastFocus) { lastFocus = ui.focus.t; target = aim(ui.focus.x, ui.focus.y); vx = vy = 0; }
      if (ui.follow != null && !drag) {
        const v = game.vehicles.find((x) => x.id === ui.follow);
        if (v?.trip) { const p = posAt(v.trip.pts, tripProgress(v.trip, gnow) * v.trip.len); target = aim(p.x, p.y); }
        else ui.follow = null;
      }
      if (!drag) {
        if (target != null) {
          camX += (target.x - camX) * 0.16;
          camY += (target.y - camY) * 0.16;
          if (Math.hypot(target.x - camX, target.y - camY) < 0.5 && ui.follow == null) { camX = target.x; camY = target.y; target = null; }
        } else if (vx || vy) {
          camX += vx; camY += vy; vx *= 0.92; vy *= 0.92;
          if (Math.hypot(vx, vy) < 0.05) vx = vy = 0;
        }
      }
      clampCam();
      const cx = Math.round(camX), cy = Math.round(camY);

      const wave = Math.floor(now / 700) % 32;
      b.save();
      b.translate(-cx + wave, -cy);
      b.fillStyle = water;
      b.fillRect(cx - wave, cy, bw, bh);
      b.restore();

      b.save();
      b.translate(-cx, -cy);
      b.imageSmoothingEnabled = false;
      b.drawImage(terrain, 0, 0);

      const pv = ui.picking ? game.vehicles.find((v) => v.id === ui.activeVehicle && v.city) : null;
      const blink = Math.floor(now / 450) % 2 === 0;
      const lastStop = pv && (ui.plan.length ? ui.plan[ui.plan.length - 1] : pv.city);
      if (pv && ui.plan.length) {
        // the route being planned, as marching dashes
        b.save();
        b.lineWidth = 2; b.setLineDash([4, 3]); b.lineDashOffset = -Math.floor(now / 80) % 7;
        for (const l of planLegs(pv, ui.repeat && game.repeatRoutes ? loopStops(pv, ui.plan) : ui.plan)) {
          if (!l) continue;
          b.strokeStyle = 'rgba(18,22,38,0.6)'; path(l.pts, 1);
          b.strokeStyle = '#ffd23f'; path(l.pts);
        }
        b.restore();
      }
      const inView = (wx, wy) => wx * R > cx - 60 && wx * R < cx + bw + 60 && wy * R > cy - 50 && wy * R < cy + bh + 50;
      for (const c of CITIES) {
        if (!inView(c.x, c.y)) continue;
        // locked towns are drawn faded until they're bought
        b.globalAlpha = isOpen(c.id) ? 1 : 0.45;
        if (c.port) pier(c);
        if (c.anchor) buoy(c, now); else drawCity(c, now);
        b.globalAlpha = 1;
        if (dk && isOpen(c.id) && !c.anchor) lights.push(() => townLights(c, now));
        if (pv && leg(pv, lastStop, c.id)) ring(c, now);
        if (c.id === game.selected && (blink || pv)) brackets(c);
      }

      const tv = ui.track != null && game.vehicles.find((v) => v.id === ui.track && v.trip);
      if (tv) trackedRoute(tv, gnow);
      hits = [];

      // parked vehicles show as minis under their town (drawn with the labels). Aircraft
      // carriers stay on the map at full size, since planes land on them.
      for (const v of game.vehicles) {
        if (v.trip || !v.city || v.kind !== 'boat' || !isCarrier(v.model)) continue;
        const c = cityById[v.city], d = dockOf(v.city);
        if (!d) continue;
        // bow pointing out to sea; out at an anchorage there's no pier, so it just faces east
        const ang = c.anchor ? 0 : Math.atan2(d[1] - c.y, d[0] - c.x), x = d[0] * R, y = d[1] * R;
        big(x + 0.7 * V, y + V, () => drawArt(b, 0, 0, ang, 'boat', v.model, { shadow: true }));
        big(x, y, () => drawArt(b, 0, 0, ang, 'boat', v.model, { paint: paintOf(v) }));
        if (dk) lights.push(() => boatLights(x, y, ang, v.model));
      }

      // trains and trucks on the move
      for (const v of game.vehicles) {
        if (!v.trip || (v.kind !== 'train' && v.kind !== 'truck')) continue;
        const t = v.trip, d = tripProgress(t, gnow) * t.len;
        // unit offsets are in sub pixels at sprite scale; convert to world units along the track
        const units = trainUnits(v.kind, v.model, consistOf(v)).map((u) => ({ ...u, off: (u.off * V) / R }));
        const placed = units.filter((u) => d - u.off > 0.2).map((u) => ({ ...u, p: posAt(t.pts, d - u.off) }));
        // a duck boat swimming between ports leaves a wake
        if (t.sea && placed[0]) wake(placed[0].p.x * R, placed[0].p.y * R, placed[0].p.ang, artSize(v.kind, v.model).w, now);
        for (const u of placed) big(u.p.x * R + 0.7 * V, u.p.y * R + V, () => drawArt(b, 0, 0, u.p.ang, u.kind, u.model, { shadow: true }));
        for (const u of paintOrder(v.kind, placed)) big(u.p.x * R, u.p.y * R, () => drawArt(b, 0, 0, u.p.ang, u.kind, u.model, { paint: u.kind === v.kind ? paintOf(v) : null }));
        const e = placed[0];
        if (e && v.kind === 'train' && ENGINES[v.model].steam != null) steam(e.p.x * R, e.p.y * R, e.p.ang, ENGINES[v.model].steam, now);
        const later = dk ? (f) => lights.push(f) : null;
        if (e) beacons(v, e.p, now, later);
        if (dk) lights.push(() => consistLights(v, placed));
        convoy(v, t, d, units, now, later);
        if (e) hits.push({ id: v.id, x: e.p.x * R, y: e.p.y * R });
        if (e && marked(v)) marker(e.p.x * R, e.p.y * R - 6);
      }

      // boats on the move
      for (const v of game.vehicles) {
        if (!v.trip || v.kind !== 'boat') continue;
        const t = v.trip, d = tripProgress(t, gnow) * t.len, p = posAt(t.pts, d), x = p.x * R, y = p.y * R;
        wake(x, y, p.ang, artSize('boat', v.model).w, now);
        // barges follow the tug along the lane, like cars behind an engine; a heavy lift ship's load rides on its deck
        const units = trainUnits('boat', v.model, consistOf(v)).map((u) => ({ ...u, off: (u.off * V) / R }));
        const placed = units.slice(1).map((u) => ({ ...u, p: posAt(t.pts, d - u.off) })), deck = placed.filter((u) => u.over);
        const tow = placed.filter((u) => !u.over && d - u.off > 0.2);
        for (const u of tow) big(u.p.x * R + 0.7 * V, u.p.y * R + V, () => drawArt(b, 0, 0, u.p.ang, 'barge', u.model, { shadow: true }));
        for (const u of tow) big(u.p.x * R, u.p.y * R, () => drawArt(b, 0, 0, u.p.ang, 'barge', u.model));
        big(x + 0.7 * V, y + V, () => drawArt(b, 0, 0, p.ang, 'boat', v.model, { shadow: true }));
        big(x, y, () => drawArt(b, 0, 0, p.ang, 'boat', v.model, { paint: paintOf(v) }));
        for (const u of deck) big(u.p.x * R, u.p.y * R, () => drawArt(b, 0, 0, u.p.ang, 'load', u.model));
        const later = dk ? (f) => lights.push(f) : null;
        beacons(v, p, now, later);
        convoy(v, t, d, units, now, later);
        if (dk) lights.push(() => {
          boatLights(x, y, p.ang, v.model);
          const last = tow[tow.length - 1];
          if (last) lamp(onArt(last.p.x * R, last.p.y * R, last.p.ang, -artSize('barge', last.model).w / 2, 0), '255,255,235', 0.8);
        });
        hits.push({ id: v.id, x, y });
        if (marked(v)) marker(x, y - 10);
      }

      // planes on the move
      for (const v of game.vehicles) {
        if (!v.trip || v.kind !== 'plane') continue;
        const t = v.trip, pr = tripProgress(t, gnow);
        const p = posAt(t.pts, pr * t.len);
        const lift = Math.sin(pr * Math.PI) * 14;
        const x = p.x * R, y = p.y * R;
        big(x + 2 + lift * 0.4, y + 3 + lift * 0.8, () => drawArt(b, 0, 0, p.ang, 'plane', v.model, { shadow: true }));
        big(x, y - lift, () => drawArt(b, 0, 0, p.ang, 'plane', v.model, { spin: now / 45, paint: paintOf(v) }));
        if (dk) lights.push(() => planeLights(x, y - lift, p.ang, v.model, now));
        hits.push({ id: v.id, x, y: y - lift });
        if (marked(v)) marker(x, y - lift - 18);
      }
      if (dk) {
        b.globalCompositeOperation = 'multiply';
        b.fillStyle = tint(dk); b.fillRect(cx, cy, bw, bh);
        b.globalCompositeOperation = 'lighter';
        b.globalAlpha = dk;
        for (const f of lights) f();
        b.globalAlpha = 1;
        b.globalCompositeOperation = 'source-over';
      }
      drawRipples(now);
      b.restore();

      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(buf, 0, 0, bw * scale, bh * scale);

      // labels
      // zoomed out, names get smaller and locked towns drop theirs so the map doesn't drown in text
      const out = scale < levels[baseAt];
      const fs = Math.round(12 * dpr * (out ? 0.8 : 1));
      const font = (w, s) => `${w} ${s}px Rubik, system-ui, sans-serif`;
      ctx.font = font(600, fs);
      ctx.textAlign = 'center';
      ctx.lineJoin = 'round';
      // money floating up from drop offs
      ctx.lineWidth = 3.5 * dpr;
      for (let i = fx.length - 1; i >= 0; i--) {
        const f = fx[i], a = (now - f.t) / 1600;
        if (a >= 1) { fx.splice(i, 1); continue; }
        if (!inView(f.x, f.y)) continue;
        const sx = (f.x * R - cx + 0.5) * scale, sy = (f.y * R - cy - 24 - (reduced ? 0 : 18 * (1 - (1 - a) ** 3))) * scale;
        ctx.globalAlpha = a < 0.12 ? a / 0.12 : a > 0.7 ? (1 - a) / 0.3 : 1;
        ctx.font = font(700, Math.round(fs * (1 + 0.25 * Math.max(0, 1 - a * 6))));
        ctx.textBaseline = 'bottom';
        ctx.strokeStyle = 'rgba(18,22,38,0.8)'; ctx.strokeText(f.text, sx, sy);
        ctx.fillStyle = '#ffd23f'; ctx.fillText(f.text, sx, sy);
      }
      ctx.globalAlpha = 1;
      ctx.font = font(600, fs);

      for (const c of CITIES) {
        if (!inView(c.x, c.y) || (out && !isOpen(c.id) && c.id !== game.selected)) continue;
        const sx = (c.x * R - cx + 0.5) * scale;
        const sy = (c.y * R - cy - 15) * scale;
        const tw = ctx.measureText(c.name).width;
        const n = game.jobs[c.id]?.length ?? 0;
        const bs = fs * 1.15;
        const badgeW = n ? bs + 4 * dpr : 0;
        const half = (tw + badgeW) / 2;
        const lx = Math.min(canvas.width - half - 4 * dpr, Math.max(half + 4 * dpr, sx)) - badgeW / 2;
        ctx.textBaseline = 'bottom';
        ctx.lineWidth = 3.5 * dpr;
        ctx.strokeStyle = 'rgba(18,22,38,0.75)';
        ctx.strokeText(c.name, lx, sy);
        ctx.fillStyle = c.id === game.selected ? '#ffd23f' : c.anchor ? '#bfe0ff' : isOpen(c.id) ? '#ffffff' : '#b9c0cc';
        ctx.fillText(c.name, lx, sy);
        if (n) {
          const bx = lx + tw / 2 + 4 * dpr, by = sy - fs * 1.08;
          ctx.fillStyle = 'rgba(18,22,38,0.75)';
          ctx.beginPath(); ctx.arc(bx + bs / 2, by + bs / 2, bs / 2 + 1.5 * dpr, 0, 7); ctx.fill();
          ctx.fillStyle = '#ffd23f';
          ctx.beginPath(); ctx.arc(bx + bs / 2, by + bs / 2, bs / 2, 0, 7); ctx.fill();
          ctx.fillStyle = '#121626';
          ctx.font = font(700, Math.round(fs * 0.78));
          ctx.textBaseline = 'middle';
          ctx.fillText(String(n), bx + bs / 2, by + bs / 2 + dpr * 0.5);
          ctx.font = font(600, fs);
        }
      }

      // what's parked in each town: a row of mini vehicles over its name, then +N for the rest
      const parked = {};
      for (const v of game.vehicles) if (!v.trip && v.city) (parked[v.city] ??= []).push(v);
      const ih = fs * 0.9, iw = ih * 1.8, gap = 2 * dpr, pad = 4 * dpr, MAX = 4;
      ctx.font = font(700, Math.round(fs * 0.8));
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      for (const id in parked) {
        const c = cityById[id];
        if (!inView(c.x, c.y)) continue;
        const vs = parked[id].sort((a, z) => TRAY_ORDER[a.kind] - TRAY_ORDER[z.kind]);
        const shown = vs.length > MAX ? vs.slice(0, MAX - 1) : vs;
        const more = vs.length - shown.length ? `+${vs.length - shown.length}` : '';
        const mw = more ? gap + ctx.measureText(more).width : 0;
        const w = pad * 2 + shown.length * iw + (shown.length - 1) * gap + mw, h = ih + pad * 1.2;
        // sits just above the name (whose baseline is 15 above the town) and its job badge
        const x0 = (c.x * R - cx + 0.5) * scale - w / 2, y0 = (c.y * R - cy - 15) * scale - fs * 1.3 - h;
        ctx.fillStyle = 'rgba(18,22,38,0.75)';
        ctx.beginPath(); ctx.roundRect(x0, y0, w, h, h / 2); ctx.fill();
        shown.forEach((v, i) => {
          // every model is shrunk to fit the same slot, facing right
          const s = artSize(v.kind, v.model), k = Math.min(iw / s.w, ih / s.h);
          ctx.save();
          ctx.translate(x0 + pad + i * (iw + gap) + iw / 2, y0 + h / 2);
          ctx.scale(k, k);
          drawArt(ctx, 0, 0, 0, v.kind, v.model, { paint: paintOf(v) });
          ctx.restore();
        });
        if (more) { ctx.fillStyle = '#ffffff'; ctx.fillText(more, x0 + w - pad - mw + gap, y0 + h / 2 + dpr * 0.5); }
      }
      ctx.textAlign = 'center';

      if (zoomFx) {
        const a = (now - zoomFx.t) / 240;
        if (a >= 1 || reduced) zoomFx = null;
        else {
          const e = 1 - (1 - a) ** 3, k = 1 + (zoomFx.k - 1) * e;
          const ox = canvas.width / 2, oy = (canvas.height - sheetPx * dpr) / 2;
          ctx.globalAlpha = 1 - e;
          ctx.drawImage(snap, ox - ox * k, oy - oy * k, snap.width * k, snap.height * k);
          ctx.globalAlpha = 1;
        }
      }
    }
    raf = requestAnimationFrame(frame);

    function toWorld(e) {
      const r = canvas.getBoundingClientRect();
      return {
        x: (((e.clientX - r.left) * dpr) / scale + Math.round(camX)) / R,
        y: (((e.clientY - r.top) * dpr) / scale + Math.round(camY)) / R,
      };
    }
    function tap(e) {
      const w = toWorld(e);
      ripples.push({ x: w.x * R, y: w.y * R, t: Date.now() });
      const pv = ui.picking ? game.vehicles.find((v) => v.id === ui.activeVehicle && v.city) : null;
      if (!pv) {
        // moving vehicles take the tap before towns, so you can pick one out as it passes through
        let hit = null, hd = 11;
        for (const h of hits) { const d = Math.hypot(h.x - w.x * R, h.y - w.y * R); if (d < hd) { hd = d; hit = h; } }
        if (hit) { ui.track = ui.follow = hit.id; return; }
      }
      let best = null, bd = 13;
      for (const c of CITIES) { const d = Math.hypot(c.x - w.x, c.y - 2 - w.y); if (d < bd) { bd = d; best = c; } }
      if (pv) {
        if (best && (best.id !== pv.city || ui.plan.length)) toggleStop(pv, best.id);
        return;
      }
      ui.track = ui.follow = null;
      if (best) selectCity(best.id);
    }
    function down(e) {
      canvas.setPointerCapture(e.pointerId);
      drag = { x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, t: performance.now(), moved: 0 };
      vx = vy = 0; target = null;
    }
    function move(e) {
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      drag.x = e.clientX; drag.y = e.clientY;
      drag.moved = Math.max(drag.moved, Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0));
      if (drag.moved > 6) ui.follow = null;
      const k = dpr / scale;
      camX -= dx * k;
      camY -= dy * k;
      const now = performance.now(), dt = now - drag.t;
      drag.t = now;
      if (dt > 0) {
        vx = vx * 0.3 + ((-dx * k) / dt) * 16 * 0.7;
        vy = vy * 0.3 + ((-dy * k) / dt) * 16 * 0.7;
      }
    }
    function up(e) {
      if (!drag) return;
      if (drag.moved < 8) { vx = vy = 0; tap(e); }
      if (performance.now() - drag.t > 80) vx = vy = 0;
      drag = null;
    }
    function wheel(e) {
      e.preventDefault();
      ui.follow = null; target = null;
      // shift + wheel pans sideways on mice without a horizontal wheel
      const [dx, dy] = e.shiftKey && !e.deltaX ? [e.deltaY, 0] : [e.deltaX, e.deltaY];
      camX += (dx * dpr) / scale;
      camY += (dy * dpr) / scale;
    }
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', () => (drag = null));
    canvas.addEventListener('wheel', wheel, { passive: false });
    function key(e) {
      if (e.ctrlKey || e.metaKey || e.altKey || e.target.closest?.('input, textarea')) return;
      if (e.key === '+' || e.key === '=') zoomBy(1);
      else if (e.key === '-') zoomBy(-1);
    }
    addEventListener('keydown', key);

    return () => { cancelAnimationFrame(raf); ro.disconnect(); removeEventListener('keydown', key); };
  });
</script>

<canvas bind:this={canvas} aria-label="Map of cities, roads, rail lines and airports"></canvas>
<div class="zoom" style:bottom="min({sheetPx + 12}px, calc(100% - 104px))">
  <button aria-label="Zoom in" disabled={!canIn} onclick={() => zoomBy?.(1)}>+</button>
  <button aria-label="Zoom out" disabled={!canOut} onclick={() => zoomBy?.(-1)}>−</button>
</div>

<style>
  canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; touch-action: none; cursor: grab; }
  .zoom { position: absolute; right: 12px; z-index: 3; display: flex; flex-direction: column; background: var(--panel-2); border-radius: 12px; box-shadow: 0 4px 14px rgba(10,16,30,.28); overflow: hidden; }
  .zoom button { width: 40px; height: 40px; border: 0; background: none; font-size: 22px; font-weight: 500; line-height: 1; cursor: pointer; color: var(--ink); transition: background .15s, transform .08s; }
  .zoom button + button { border-top: 1px solid var(--line); }
  .zoom button:hover:not(:disabled) { background: var(--panel-3); }
  .zoom button:active:not(:disabled) { transform: scale(.9); }
  .zoom button:disabled { color: var(--line-strong); cursor: default; }
</style>
