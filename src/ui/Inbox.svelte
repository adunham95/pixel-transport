<script>
  // the problems inbox, opened from the bell in the top bar: everything across the company that
  // wants a look (see scanProblems), worst first. Tapping one goes to it; some have a one tap fix,
  // and any can be dismissed until it clears up and comes back. Same sheet as Settings.
  import { onMount } from 'svelte';
  import { inbox, openProblems, dismissProblem, goToProblem, fixProblem } from '../game/game.svelte.js';
  import Icon from './Icon.svelte';
  import { fade, fly, flip, slide } from './motion.js';
  let { onclose } = $props();
  const ORDER = { bad: 0, warn: 1, info: 2 };
  const items = $derived(openProblems().sort((a, b) => ORDER[a.sev] - ORDER[b.sev]));
  const hidden = $derived(inbox.items.length - items.length);
  let closeEl;
  onMount(() => closeEl?.focus());
  function key(e) {
    if (e.key !== 'Escape') return;
    e.preventDefault();
    onclose();
  }
  function go(p) { goToProblem(p); onclose(); }
  function restore() { inbox.dismissed = {}; }
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
<div class="sheet-modal" class:dragging={drag} role="dialog" aria-modal="true" aria-labelledby="inbox-title" style:--dy="{dy}px" transition:fly={{ y: 60, duration: 260 }}>
  <div class="handle" role="presentation" onpointerdown={down} onpointermove={move} onpointerup={up} onpointercancel={up}><span></span></div>
  <header>
    <b id="inbox-title">Problems</b>
    <button class="close" bind:this={closeEl} aria-label="Close problems" onclick={onclose}><Icon name="close" size={22} /></button>
  </header>
  <div class="content">
    {#if items.length}
      <div class="group">
      {#each items as p (p.key)}
        <div class="row prob sev-{p.sev}" animate:flip={{ duration: 200 }} transition:slide={{ duration: 180 }}>
          <button class="main" onclick={() => go(p)}>
            <span class="ic"><Icon name={p.icon} size={18} /></span>
            <span class="grow"><b>{p.title}</b><small>{p.text}</small></span>
          </button>
          <div class="acts">
            {#if p.act}<button class="btn small primary" onclick={() => fixProblem(p)}>{p.act.label}</button>{/if}
            <button class="dismiss" aria-label="Dismiss" title="Dismiss" onclick={() => dismissProblem(p)}><Icon name="close" size={16} /></button>
          </div>
        </div>
      {/each}
      </div>
    {:else}
      <div class="empty">
        <span class="ok"><Icon name="tick" size={28} /></span>
        <b>All running smoothly</b>
        <small>Breakdowns, idle vehicles, money-losing routes and towns with stuck jobs show up here.</small>
      </div>
    {/if}
    {#if hidden}<button class="row tbtn" onclick={restore}>Show {hidden} dismissed</button>{/if}
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
  .prob { display: flex; align-items: center; gap: 4px; padding: 0 6px 0 0; }
  .main { flex: 1; min-width: 0; display: flex; align-items: center; gap: 12px; padding: 12px 0 12px 12px; border: 0; background: none; color: inherit; font: inherit; text-align: left; cursor: pointer; }
  .main .grow { display: flex; flex-direction: column; min-width: 0; }
  .ic { flex: none; display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%; background: var(--panel-3); color: var(--ink-soft); }
  .sev-bad .ic { background: color-mix(in srgb, var(--bad) 18%, transparent); color: var(--bad); }
  .sev-warn .ic { background: color-mix(in srgb, var(--warn) 18%, transparent); color: var(--warn); }
  .acts { flex: none; display: flex; align-items: center; gap: 2px; }
  .dismiss { display: grid; place-items: center; width: 36px; height: 36px; border: 0; border-radius: 50%; background: none; color: var(--ink-soft); cursor: pointer; }
  @media (hover: hover) { .dismiss:hover { background: color-mix(in srgb, var(--ink) 8%, transparent); } }
  .empty { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 28px 12px 20px; text-align: center; }
  .empty small { color: var(--ink-soft); max-width: 300px; }
  .ok { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 50%; background: color-mix(in srgb, var(--good) 18%, transparent); color: var(--good); }
  @media (min-width: 600px) {
    .sheet-modal { left: 50%; right: auto; bottom: auto; top: 50%; width: min(460px, calc(100% - 32px)); transform: translate(-50%, -50%); border-radius: 28px; padding: 8px 0 0; }
    .handle { display: none; }
  }
</style>
