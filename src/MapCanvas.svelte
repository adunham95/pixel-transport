<script>
  import { onMount } from 'svelte';
  import { game, ui, cityById, leg, planLegs, toggleStop, selectCity, posAt, tripProgress, gameNow, isOpen } from './game.svelte.js';
  import { CITIES, ENGINES, PLANES, W, H } from './data.js';
  import { buildTerrain, makeWaterPattern, R } from './terrain.js';
  import { drawArt, drawConsistRow, trainUnits, consistBox, artSize, loadArt } from './sprites.js';
  import { dockOf } from './sea.js';

  let { sheetPx = 0 } = $props();
  const V = 1.6; // vehicles are drawn a bit larger than the map grid so their detail reads
  let canvas;

  const BUILDINGS = [
    // dx, dy(top of roof), w, roofH, wallH, roof, roofLight, wall
    [-8, -6, 6, 3, 5, '#c9553f', '#e2735c', '#efe6d2'],
    [-1, -11, 7, 3, 9, '#3f6fa8', '#5d8cc6', '#dfe4ea'],
    [-5, -1, 6, 2, 4, '#7a5aa8', '#9878c6', '#f2eadb'],
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
    let camX = 0, camY = 0, vx = 0, vy = 0, drag = null, target = null, lastFocus = 0, centered = false;

    const visibleH = () => bh - (sheetPx * dpr) / scale;

    function resize() {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 3);
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      scale = Math.max(1, Math.floor(canvas.width / 300));
      bw = Math.ceil(canvas.width / scale);
      bh = Math.ceil(canvas.height / scale);
      buf.width = bw; buf.height = bh;
    }
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

    function drawCity(c) {
      const x = c.x * R, y = c.y * R;
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
      for (const [dx, dy, w, rh, wh, roof, roofL, wall] of BUILDINGS) {
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

    let raf;
    function frame() {
      raf = requestAnimationFrame(frame);
      if (!bw) return;
      const now = Date.now(), gnow = gameNow(); // now drives animation, gnow drives where vehicles are

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
        for (const l of planLegs(pv, ui.plan)) {
          if (!l) continue;
          b.strokeStyle = 'rgba(18,22,38,0.6)';
          b.beginPath(); l.pts.forEach(([x, y], i) => (i ? b.lineTo(x * R + 1, y * R + 1) : b.moveTo(x * R + 1, y * R + 1))); b.stroke();
          b.strokeStyle = '#ffd23f';
          b.beginPath(); l.pts.forEach(([x, y], i) => (i ? b.lineTo(x * R, y * R) : b.moveTo(x * R, y * R))); b.stroke();
        }
        b.restore();
      }
      const inView = (wx, wy) => wx * R > cx - 60 && wx * R < cx + bw + 60 && wy * R > cy - 50 && wy * R < cy + bh + 50;
      for (const c of CITIES) {
        if (!inView(c.x, c.y)) continue;
        // locked towns are drawn faded until they're bought
        b.globalAlpha = isOpen(c.id) ? 1 : 0.45;
        if (c.port) pier(c);
        drawCity(c);
        b.globalAlpha = 1;
        if (pv && leg(pv, lastStop, c.id)) ring(c, now);
        if (c.id === game.selected && (blink || pv)) brackets(c);
      }

      // parked vehicles
      const pt = {}, pp = {}, pb = {};
      for (const v of game.vehicles) if (!v.trip && v.city) ({ train: pt, plane: pp, boat: pb }[v.kind][v.city] ??= []).push(v);
      for (const id in pb) {
        // moored side by side at the end of the pier, bows pointing out to sea
        const c = cityById[id], d = dockOf(id);
        if (!d) continue;
        const ang = Math.atan2(d[1] - c.y, d[0] - c.x), nx = -Math.sin(ang), ny = Math.cos(ang);
        pb[id].slice(0, 3).forEach((v, i) => {
          const side = i === 0 ? 0 : i === 1 ? 1 : -1, gap = (artSize('boat', v.model).h + 1) * V;
          const x = d[0] * R + nx * side * gap, y = d[1] * R + ny * side * gap;
          big(x + 0.7 * V, y + V, () => drawArt(b, 0, 0, ang, 'boat', v.model, { shadow: true }));
          big(x, y, () => drawArt(b, 0, 0, ang, 'boat', v.model));
        });
      }
      for (const id in pt) {
        const c = cityById[id];
        pt[id].slice(0, 2).forEach((v, i) => {
          const cars = v.cars.slice(0, 4);
          big(c.x * R + 12 + (consistBox(v.model, cars).w - 1) * V, c.y * R - 3 + i * 8, () => drawConsistRow(b, 0, 0, v.model, cars));
        });
      }
      for (const id in pp) {
        const c = cityById[id];
        pp[id].slice(0, 2).forEach((v, i) => {
          // seaplanes at a town with no runway float at the end of the pier
          const d = !c.air && PLANES[v.model].seaplane && dockOf(id);
          if (d) big(d[0] * R + i * 14, d[1] * R + 6, () => drawArt(b, 0, 0, Math.atan2(d[1] - c.y, d[0] - c.x), 'plane', v.model));
          else big(c.x * R - 2 - i * 20, c.y * R + 11, () => drawArt(b, 0, 0, 0, 'plane', v.model));
        });
      }

      // trains on the move
      for (const v of game.vehicles) {
        if (!v.trip || v.kind !== 'train') continue;
        const t = v.trip, d = tripProgress(t, gnow) * t.len;
        // unit offsets are in sub pixels at sprite scale; convert to world units along the track
        const units = trainUnits(v.model, v.cars).map((u) => ({ ...u, off: (u.off * V) / R }));
        const placed = units.filter((u) => d - u.off > 0.2).map((u) => ({ ...u, p: posAt(t.pts, d - u.off) }));
        for (const u of placed) big(u.p.x * R + 0.7 * V, u.p.y * R + V, () => drawArt(b, 0, 0, u.p.ang, u.kind, u.model, { shadow: true }));
        for (const u of placed.slice().reverse()) big(u.p.x * R, u.p.y * R, () => drawArt(b, 0, 0, u.p.ang, u.kind, u.model));
        const e = placed[0];
        if (e && ENGINES[v.model].steam != null) steam(e.p.x * R, e.p.y * R, e.p.ang, ENGINES[v.model].steam, now);
        if (e && ui.follow === v.id) { b.fillStyle = '#ffd23f'; b.beginPath(); b.moveTo(e.p.x * R - 3, e.p.y * R - 10); b.lineTo(e.p.x * R + 3, e.p.y * R - 10); b.lineTo(e.p.x * R, e.p.y * R - 6); b.fill(); }
      }

      // boats on the move
      for (const v of game.vehicles) {
        if (!v.trip || v.kind !== 'boat') continue;
        const t = v.trip, p = posAt(t.pts, tripProgress(t, gnow) * t.len), x = p.x * R, y = p.y * R;
        wake(x, y, p.ang, artSize('boat', v.model).w, now);
        big(x + 0.7 * V, y + V, () => drawArt(b, 0, 0, p.ang, 'boat', v.model, { shadow: true }));
        big(x, y, () => drawArt(b, 0, 0, p.ang, 'boat', v.model));
        if (ui.follow === v.id) { b.fillStyle = '#ffd23f'; b.beginPath(); b.moveTo(x - 3, y - 14); b.lineTo(x + 3, y - 14); b.lineTo(x, y - 10); b.fill(); }
      }

      // planes on the move
      for (const v of game.vehicles) {
        if (!v.trip || v.kind !== 'plane') continue;
        const t = v.trip, pr = tripProgress(t, gnow);
        const p = posAt(t.pts, pr * t.len);
        const lift = Math.sin(pr * Math.PI) * 14;
        const x = p.x * R, y = p.y * R;
        big(x + 2 + lift * 0.4, y + 3 + lift * 0.8, () => drawArt(b, 0, 0, p.ang, 'plane', v.model, { shadow: true }));
        big(x, y - lift, () => drawArt(b, 0, 0, p.ang, 'plane', v.model, { spin: now / 45 }));
        if (ui.follow === v.id) { b.fillStyle = '#ffd23f'; b.beginPath(); b.moveTo(x - 3, y - lift - 22); b.lineTo(x + 3, y - lift - 22); b.lineTo(x, y - lift - 18); b.fill(); }
      }
      b.restore();

      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(buf, 0, 0, bw * scale, bh * scale);

      // labels
      const fs = Math.round(12 * dpr);
      const font = (w, s) => `${w} ${s}px Rubik, system-ui, sans-serif`;
      ctx.font = font(600, fs);
      ctx.textAlign = 'center';
      ctx.lineJoin = 'round';
      for (const c of CITIES) {
        if (!inView(c.x, c.y)) continue;
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
        ctx.fillStyle = c.id === game.selected ? '#ffd23f' : isOpen(c.id) ? '#ffffff' : '#b9c0cc';
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
      let best = null, bd = 13;
      for (const c of CITIES) { const d = Math.hypot(c.x - w.x, c.y - 2 - w.y); if (d < bd) { bd = d; best = c; } }
      if (!best) return;
      const pv = ui.picking ? game.vehicles.find((v) => v.id === ui.activeVehicle && v.city) : null;
      if (pv) {
        if (best.id !== pv.city || ui.plan.length) toggleStop(pv, best.id);
        return;
      }
      selectCity(best.id);
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

    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  });
</script>

<canvas bind:this={canvas} aria-label="Map of cities, rail lines and airports"></canvas>

<style>
  canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; touch-action: none; cursor: grab; }
</style>
