import { ENGINES, CARS, PLANES, BOATS } from './data.js';

// Draws vehicle art from the SVGs in vehicles.js. Each SVG is rasterized once at a
// high resolution, plus a flat silhouette of it for shadows.

const SPECS = { train: ENGINES, car: CARS, plane: PLANES, boat: BOATS };
const RES = 8; // raster pixels per sub pixel
const COUPLER = 0.2; // gap between train units

const cache = new Map(); // svg text -> { w, h, img, shadow, loading }

function size(svg) {
  const [, , w, h] = svg.match(/viewBox="([^"]+)"/)[1].trim().split(/[\s,]+/).map(Number);
  return { w, h };
}

// art is rasterized the first time a model is asked for, so edited or newly added
// models show up without a reload
function entry(spec) {
  let e = cache.get(spec.art);
  if (!e) {
    cache.set(spec.art, (e = { ...size(spec.art), img: null, shadow: null }));
    e.loading = typeof document === 'undefined' ? Promise.resolve()
      : rasterize(e, spec.art).catch((err) => console.error('Bad vehicle art for', spec.name, err));
  }
  return e;
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
// spin is the rotor angle for models with rotors.
export function drawArt(ctx, x, y, ang, kind, model, { shadow = false, spin = 0 } = {}) {
  const spec = specOf(kind, model), e = entry(spec);
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

// ---------- trains ----------

// each unit of a train, front first: its art, and how far its center sits behind the engine's center
export function trainUnits(model, cars) {
  const units = [{ kind: 'train', model, off: 0 }];
  let back = artSize('train', model).w / 2;
  for (const t of cars) {
    const w = artSize('car', t).w;
    units.push({ kind: 'car', model: t, off: back + COUPLER + w / 2 });
    back += COUPLER + w;
  }
  return units;
}

export function consistBox(model, cars) {
  const u = trainUnits(model, cars), last = u[u.length - 1];
  const h = Math.max(...u.map((x) => artSize(x.kind, x.model).h));
  return { w: artSize('train', model).w / 2 + last.off + artSize(last.kind, last.model).w / 2, h };
}

// straight consist: engine centered at ex facing +x, cars trailing toward -x
export function drawConsistRow(ctx, ex, y, model, cars) {
  const units = trainUnits(model, cars);
  for (const u of units) drawArt(ctx, ex - u.off + 0.7, y + 1, 0, u.kind, u.model, { shadow: true });
  for (const u of units.slice().reverse()) drawArt(ctx, ex - u.off, y, 0, u.kind, u.model);
}
