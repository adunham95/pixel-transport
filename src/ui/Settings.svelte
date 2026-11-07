<script>
  // Settings, opened from the gear in the top bar: a modal bottom sheet on phones, a dialog in the
  // middle on bigger screens, both Material 3 style. Tapping outside, ✕, Escape or the phone's back
  // button (App.svelte) closes it, and on phones it can be dragged down to close. Things about the
  // whole game rather than any one town or vehicle live here.
  import { onMount } from 'svelte';
  import { game, dev, setDev, resetGame } from '../game/game.svelte.js';
  import { prefs, setTheme } from './prefs.svelte.js';
  import Icon from './Icon.svelte';
  import { fade, fly } from './motion.js';
  let { onclose } = $props();
  const THEMES = [['system', 'Auto'], ['light', 'Light'], ['dark', 'Dark']];
  let closeEl;
  onMount(() => closeEl?.focus());
  // caught on the way down, so a screen's own back-on-Escape underneath doesn't also go
  function key(e) {
    if (e.key !== 'Escape') return;
    e.preventDefault();
    onclose();
  }
  function newGame() {
    const was = game.saved;
    resetGame(); // asks first, and does nothing if you say no
    if (game.saved !== was) onclose();
  }
  // dragging the handle down far enough, or flicking it, closes the sheet
  let dy = $state(0), drag = $state(null);
  function down(e) { if (!e.button) { drag = { y: e.clientY, t: performance.now() }; e.currentTarget.setPointerCapture(e.pointerId); } }
  function move(e) { if (drag) dy = Math.max(0, e.clientY - drag.y); }
  function up() {
    if (!drag) return;
    const fast = dy / Math.max(1, performance.now() - drag.t) > 0.6;
    drag = null;
    if (dy > 90 || (fast && dy > 20)) onclose();
    else dy = 0;
  }
</script>

<svelte:window onkeydowncapture={key} />

<div class="scrim" role="presentation" transition:fade={{ duration: 180 }} onclick={onclose}></div>
<div class="sheet-modal" class:dragging={drag} role="dialog" aria-modal="true" aria-labelledby="settings-title" style:--dy="{dy}px" transition:fly={{ y: 60, duration: 260 }}>
  <div class="handle" role="presentation" onpointerdown={down} onpointermove={move} onpointerup={up} onpointercancel={up}><span></span></div>
  <header>
    <b id="settings-title">Settings</b>
    <button class="close" bind:this={closeEl} aria-label="Close settings" onclick={onclose}><Icon name="close" size={22} /></button>
  </header>
  <div class="content">
    <p class="sec">Appearance</p>
    <div class="seg" role="radiogroup" aria-label="Theme">
      {#each THEMES as [k, label]}
        <button role="radio" aria-checked={prefs.theme === k} class:on={prefs.theme === k} onclick={() => setTheme(k)}>
          {#if prefs.theme === k}<Icon name="tick" size={16} />{/if}{label}
        </button>
      {/each}
    </div>
    <p class="gnote">Auto follows your device’s light or dark setting.</p>

    <p class="sec">Game</p>
    <div class="group">
      <label class="row">
        <span class="grow"><b>Dev mode</b><small>Adds a tab to speed up time and try things out</small></span>
        <input class="switch" type="checkbox" checked={dev.on} onchange={(e) => setDev(e.currentTarget.checked)} />
      </label>
      <button class="row tbtn bad" onclick={newGame}>Start a new game</button>
    </div>
    <p class="gnote">Your game saves on this device as you play. Starting over can’t be undone.</p>
  </div>
</div>

<style>
  .scrim { position: fixed; inset: 0; z-index: 30; background: rgba(8, 12, 22, .45); }
  .sheet-modal { position: fixed; left: 0; right: 0; bottom: 0; z-index: 31; max-height: 85%; display: flex; flex-direction: column; background: var(--panel); color: var(--ink); border-radius: 28px 28px 0 0; box-shadow: 0 -8px 30px rgba(10, 16, 30, .3); padding-bottom: env(safe-area-inset-bottom, 0px); transform: translateY(var(--dy)); transition: transform .25s cubic-bezier(.2, .9, .3, 1); }
  .sheet-modal.dragging { transition: none; }
  .handle { display: flex; justify-content: center; padding: 14px 0 6px; cursor: grab; touch-action: none; }
  .handle span { width: 32px; height: 4px; border-radius: 2px; background: var(--ink-soft); opacity: .5; }
  header { display: flex; align-items: center; justify-content: space-between; padding: 0 8px 4px 22px; }
  header b { font-size: 22px; font-weight: 600; }
  .close { display: grid; place-items: center; width: 44px; height: 44px; border: 0; border-radius: 50%; background: none; color: var(--ink); cursor: pointer; }
  @media (hover: hover) { .close:hover { background: color-mix(in srgb, var(--ink) 8%, transparent); } }
  .content { overflow-y: auto; padding: 0 16px 20px; overscroll-behavior: contain; }
  .seg { margin-bottom: 8px; }
  label.row { cursor: pointer; }
  @media (min-width: 600px) {
    .sheet-modal { left: 50%; right: auto; bottom: auto; top: 50%; width: min(420px, calc(100% - 32px)); transform: translate(-50%, -50%); border-radius: 28px; padding: 8px 0 0; }
    .handle { display: none; }
  }
</style>
