import { ENGINES, CARS, PLANES, BOATS, BARGES, TRUCKS, TRAILERS, SUPERLOAD_TRAILERS } from './data.js';

// Draws vehicle art from the SVGs in vehicles.js. Each SVG is rasterized once at a
// high resolution, plus a flat silhouette of it for shadows.

const SPECS = { train: ENGINES, car: CARS, plane: PLANES, boat: BOATS, barge: BARGES, truck: TRUCKS, trailer: TRAILERS, load: SUPERLOAD_TRAILERS };
const RES = 8; // raster pixels per sub pixel
const COUPLER = 0.2; // gap between train units

const cache = new Map(); // svg text -> { w, h, img, shadow, loading }

function size(svg) {
  const [, , w, h] = svg.match(/viewBox="([^"]+)"/)[1].trim().split(/[\s,]+/).map(Number);
  return { w, h };
}

// art is rasterized the first time a model is asked for, so edited or newly added
// models show up without a reload. paint is company colors, { body, accent }, or null.
function entry(spec, paint = null) {
  const art = paint ? repaint(spec, paint) : spec.art;
  let e = cache.get(art);
  if (!e) {
    cache.set(art, (e = { ...size(art), img: null, shadow: null }));
    e.loading = typeof document === 'undefined' ? Promise.resolve()
      : rasterize(e, art).catch((err) => console.error('Bad vehicle art for', spec.name, err));
  }
  return e;
}

// ---------- company colors ----------

// glass, lamps and tyres keep their colors whatever the paint
const KEEP = new Set(['#9fd0ff', '#fff3a8', '#ffe7a3', '#5ab4e6', '#7fa8c8', '#23344f', '#23262b', '#1c1b1f']);
const COLOR = /#[0-9a-fA-F]{6}\b|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g;

function rgbOf(c) {
  return c[0] === '#' ? [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)) : c.match(/\d+/g).map(Number);
}
function hsl(c) {
  const [r, g, b] = rgbOf(c).map((x) => x / 255), max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
  if (!d) return [0, 0, l];
  const h = max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, d / (1 - Math.abs(2 * l - 1)), l];
}
function hex([h, s, l]) {
  const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  const f = (n) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))));
  return '#' + [f(0), f(8), f(4)].map((x) => x.toString(16).padStart(2, '0')).join('');
}
const same = (a, b) => rgbOf(a).join() === rgbOf(b).join();
const hueGap = (a, b) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));

// the colors a model's paint job swaps: its body (paint.body in the spec, or the fill of its first
// outlined shape that isn't a dark chassis) and its trim (paint.accent, or its trim, or the first
// other bright color in it)
function paintable(spec) {
  const outlined = [...spec.art.matchAll(/fill="([^"]+)"[^>]*stroke="rgba\(18,24,38,0\.9\)"/g)].map((m) => m[1]);
  const body = spec.paint?.body ?? outlined.find((c) => c.match(COLOR) && !(hsl(c)[1] < 0.15 && hsl(c)[2] < 0.35));
  const bright = (c) => !KEEP.has(c.toLowerCase()) && hsl(c)[1] > 0.4 && hsl(c)[2] > 0.25 && hsl(c)[2] < 0.75;
  const accent = spec.paint?.accent ?? spec.trim ?? spec.art.match(COLOR)?.find((c) => bright(c) && !(body && (same(c, body) || (hsl(body)[1] > 0.25 && hueGap(hsl(c)[0], hsl(body)[0]) < 20))));
  return { body, accent };
}

// a model's art in company colors: its body and trim colors become paint.body and paint.accent,
// and the darker and lighter shades of them in its art follow along
export function repaint(spec, paint) {
  const { body, accent } = paintable(spec);
  const swaps = [[body, paint.body], [accent, paint.accent]].filter(([from]) => from?.match(COLOR)).map(([from, to]) => ({ from, f: hsl(from), t: hsl(to), to }));
  return spec.art.replace(COLOR, (c) => {
    if (KEEP.has(c.toLowerCase())) return c;
    const x = hsl(c);
    for (const w of swaps) {
      if (same(c, w.from)) return w.to;
      if (w.f[1] > 0.25 && x[1] > 0.2 && hueGap(x[0], w.f[0]) < 15 && Math.abs(x[2] - w.f[2]) < 0.3) return hex([w.t[0], w.t[1], Math.max(0.05, Math.min(0.95, w.t[2] + x[2] - w.f[2]))]);
    }
    return c;
  });
}

function rasterize(e, svg) {
  const img = new Image();
  // give the svg a real pixel size so every browser rasterizes it crisply
  const sized = svg.replace('<svg ', `<svg width="${Math.ceil(e.w * RES)}" height="${Math.ceil(e.h * RES)}" `);
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(sized);
  return img.decode().then(() => {
    const c = document.createElement('canvas');
    c.width = Math.ceil(e.w * RES); c.height = Math.ceil(e.h * RES);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    const s = document.createElement('canvas');
    s.width = c.width; s.height = c.height;
    const sx = s.getContext('2d');
    sx.drawImage(c, 0, 0);
    sx.globalCompositeOperation = 'source-in';
    sx.fillStyle = 'rgba(8,20,40,0.3)';
    sx.fillRect(0, 0, s.width, s.height);
    e.img = c; e.shadow = s;
  });
}

// resolves once every model's art can be drawn
export function loadArt() {
  return Promise.all(Object.values(SPECS).flatMap((group) => Object.values(group).map((spec) => entry(spec).loading)));
}

// resolves once this model can be drawn in this paint
export function artReady(kind, model, paint = null) { return entry(specOf(kind, model), paint).loading; }

export function specOf(kind, model) { return SPECS[kind][model]; }
export function artSize(kind, model) { const { w, h } = entry(specOf(kind, model)); return { w, h }; }

// rotor discs and blades, turned by spin (radians); neighbours turn opposite ways
function drawRotors(ctx, rotors, spin, shadow) {
  rotors.forEach(([rx, ry, r], i) => {
    ctx.beginPath(); ctx.arc(rx, ry, r, 0, Math.PI * 2);
    if (shadow) { ctx.fillStyle = 'rgba(8,20,40,0.12)'; ctx.fill(); return; }
    // bold enough to survive the map's one pixel per sub pixel buffer
    ctx.fillStyle = 'rgba(20,22,28,0.22)'; ctx.fill();
    ctx.strokeStyle = 'rgba(20,22,28,0.6)'; ctx.lineWidth = 0.5; ctx.stroke();
    const a0 = (i % 2 ? -spin : spin) + i * 1.1;
    ctx.beginPath();
    for (let k = 0; k < 3; k++) {
      const a = a0 + (k * Math.PI * 2) / 3;
      ctx.moveTo(rx, ry); ctx.lineTo(rx + Math.cos(a) * r * 0.95, ry + Math.sin(a) * r * 0.95);
    }
    ctx.strokeStyle = '#1c1b1f'; ctx.lineWidth = 1.1; ctx.lineCap = 'round'; ctx.stroke();
    ctx.fillStyle = '#4a454d';
    ctx.beginPath(); ctx.arc(rx, ry, 0.9, 0, Math.PI * 2); ctx.fill();
  });
}

// draw one model centered at x, y, facing ang. Nothing is drawn until loadArt() finishes.
// spin is the rotor angle for models with rotors, and paint is company colors, or null.
export function drawArt(ctx, x, y, ang, kind, model, { shadow = false, spin = 0, paint = null } = {}) {
  const spec = specOf(kind, model), e = entry(spec, shadow ? null : paint);
  const src = shadow ? e.shadow : e.img;
  if (!src) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(src, -e.w / 2, -e.h / 2, e.w, e.h);
  if (spec.rotors) drawRotors(ctx, spec.rotors, spin, shadow);
  ctx.restore();
}

// ---------- trains, trucks pulling trailers, and tugs towing barges ----------

// what each kind of lead unit pulls
const TAIL = { train: 'car', truck: 'trailer', boat: 'barge' };

// each unit of a train, truck or tow, front first: its art, and how far its center sits behind the lead unit's center.
// A tractor with a hitch carries its first trailer's front end over its fifth wheel; the rest couple up behind.
// cars are tail models, or { kind, model } for anything else, like a superload's own trailer.
// A ship's superload rides on its deck instead (over: true), at the ship's deckAt.
export function trainUnits(kind, model, cars) {
  const lead = specOf(kind, model), units = [{ kind, model, off: 0 }], hitch = lead.hitch;
  let back = artSize(kind, model).w / 2;
  cars.forEach((c, i) => {
    const [k, t] = typeof c === 'string' ? [TAIL[kind], c] : [c.kind, c.model];
    if (kind === 'boat' && k === 'load') { units.push({ kind: k, model: t, off: -(lead.deckAt ?? 0), over: true }); return; }
    const w = artSize(k, t).w;
    const off = i === 0 && hitch != null ? w / 2 - hitch : back + COUPLER + w / 2;
    units.push({ kind: k, model: t, off });
    back = off + w / 2;
  });
  return units;
}

// the order to paint units in, so the right ones end up on top: a semi trailer lies over its
// tractor's fifth wheel, while engines and tugs sit over what they pull, and a ship's deck load over the ship
export function paintOrder(kind, units) {
  if (kind === 'truck') return units;
  return [...units.filter((u) => !u.over).reverse(), ...units.filter((u) => u.over)];
}

export function consistBox(kind, model, cars) {
  const u = trainUnits(kind, model, cars);
  const h = Math.max(...u.map((x) => artSize(x.kind, x.model).h));
  return { w: artSize(kind, model).w / 2 + Math.max(...u.map((x) => x.off + artSize(x.kind, x.model).w / 2)), h };
}

// straight consist: lead unit centered at ex facing +x, the rest trailing toward -x. Only the
// lead unit takes paint.
export function drawConsistRow(ctx, ex, y, kind, model, cars, paint = null) {
  const units = trainUnits(kind, model, cars);
  for (const u of units) drawArt(ctx, ex - u.off + 0.7, y + 1, 0, u.kind, u.model, { shadow: true });
  for (const u of paintOrder(kind, units)) drawArt(ctx, ex - u.off, y, 0, u.kind, u.model, { paint: u === units[0] ? paint : null });
}
