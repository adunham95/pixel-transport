// Per-device preferences that aren't part of the saved game.
const THEME_KEY = 'pixel-transport-theme';
const THEMES = ['system', 'light', 'dark'];

function read() {
  try { const t = localStorage.getItem(THEME_KEY); return THEMES.includes(t) ? t : 'system'; } catch { return 'system'; }
}

export const prefs = $state({ theme: read() });

// app.css follows the device's light or dark setting unless the page carries data-theme
function apply() {
  const root = document.documentElement;
  if (prefs.theme === 'system') delete root.dataset.theme;
  else root.dataset.theme = prefs.theme;
}

export function setTheme(t) {
  prefs.theme = t;
  apply();
  try { localStorage.setItem(THEME_KEY, t); } catch {}
}

// set before the app mounts, so a chosen theme doesn't flash the other one first
apply();

// planning a one-off route: park at each stop until sent on, rather than driving straight through
const HOLD_KEY = 'pixel-transport-hold-stops';
prefs.holdStops = (() => { try { return localStorage.getItem(HOLD_KEY) === '1'; } catch { return false; } })();
export function setHoldStops(on) {
  prefs.holdStops = on;
  try { localStorage.setItem(HOLD_KEY, on ? '1' : '0'); } catch {}
}
