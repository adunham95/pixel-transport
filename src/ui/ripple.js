import { reduced } from './motion.js';

// Android's touch ripple: a circle of the control's own text color spreads from the finger while
// it's held, then fades on release. It's drawn in a throwaway overlay laid over the control
// (matching its corners) rather than inside it, so it never touches markup Svelte manages.
// A press that turns into a scroll or a drag gets no ripple: it waits a beat, and a move or a
// cancel before then calls it off.
const TAPPABLE = '.btn, button.row, label.row, .tabs button, .nav .back, .seg button, .fchips button, button.stat, .gear, .close, .act, .ibtn, .rowlink, .fab, .cats button';
const DELAY = 70, SLOP = 8;

export function installRipple() {
  if (reduced || typeof document === 'undefined') return;
  let pending = null, live = null;

  function start(el, x, y) {
    // a row inside a grouped list is clipped by its tile, so take the tile's shape
    const tile = el.closest('.group > *') ?? el;
    const r = tile.getBoundingClientRect(), cs = getComputedStyle(tile);
    const box = document.createElement('div');
    box.className = 'ripple-box';
    Object.assign(box.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`, borderRadius: cs.borderRadius, color: getComputedStyle(el).color });
    const size = Math.hypot(Math.max(x - r.left, r.right - x), Math.max(y - r.top, r.bottom - y)) * 2;
    const dot = document.createElement('span');
    Object.assign(dot.style, { width: `${size}px`, height: `${size}px`, left: `${x - r.left - size / 2}px`, top: `${y - r.top - size / 2}px` });
    box.appendChild(dot);
    document.body.appendChild(box);
    return box;
  }
  function end() {
    if (pending) { clearTimeout(pending.t); pending = null; }
    if (!live) return;
    const box = live;
    live = null;
    box.classList.add('out');
    setTimeout(() => box.remove(), 400);
  }

  addEventListener('pointerdown', (e) => {
    if (e.button) return;
    end();
    const el = e.target.closest?.(TAPPABLE);
    if (!el || el.disabled || el.matches(':disabled')) return;
    const { clientX: x, clientY: y } = e;
    pending = { x, y, t: setTimeout(() => { pending = null; live = start(el, x, y); }, DELAY) };
  }, { passive: true, capture: true });
  addEventListener('pointermove', (e) => {
    if (pending && Math.hypot(e.clientX - pending.x, e.clientY - pending.y) > SLOP) { clearTimeout(pending.t); pending = null; }
  }, { passive: true, capture: true });
  // a quick tap lets go before the ripple's even started: show it anyway, briefly
  addEventListener('pointerup', () => {
    if (pending) { const { x, y } = pending; clearTimeout(pending.t); pending = null; const el = document.elementFromPoint(x, y)?.closest(TAPPABLE); if (el && !el.disabled) live = start(el, x, y); setTimeout(end, 120); return; }
    end();
  }, { passive: true, capture: true });
  addEventListener('pointercancel', end, { passive: true, capture: true });
  addEventListener('scroll', end, { passive: true, capture: true });
}
