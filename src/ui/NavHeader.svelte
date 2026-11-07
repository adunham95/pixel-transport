<script>
  // The bar across the top of a screen pushed on top of a tab's page, laid out like an Android
  // top app bar: a back arrow, the title beside it, and room for actions on the right. It sticks
  // to the top of the panel while the screen scrolls under it, and lifts onto a tinted surface
  // once there's something under it. Escape goes back too; the phone's back button is handled
  // in App.svelte.
  //
  // Pushing a screen scrolls the panel to the top; going back puts the scroll where it was,
  // as long as the tab hasn't changed in between.
  import { onMount, tick } from 'svelte';
  import { ui } from '../game/game.svelte.js';
  import Icon from './Icon.svelte';
  let { title, sub = '', back = 'Back', onback, trailing } = $props();
  let el, lifted = $state(false);
  onMount(() => {
    const sc = el.closest('.body'), saved = sc?.scrollTop ?? 0, tab = ui.tab;
    if (!sc) return;
    sc.scrollTop = 0;
    const on = () => (lifted = sc.scrollTop > 2);
    sc.addEventListener('scroll', on, { passive: true });
    return () => {
      sc.removeEventListener('scroll', on);
      if (ui.tab === tab) tick().then(() => (sc.scrollTop = saved));
    };
  });
  function key(e) {
    if (e.key !== 'Escape' || e.defaultPrevented || e.target.closest?.('input, select, textarea')) return;
    e.preventDefault();
    onback();
  }
</script>

<svelte:window onkeydown={key} />

<header class="nav" class:lifted bind:this={el}>
  <button class="back" aria-label="Back to {back}" title="Back to {back}" onclick={onback}><Icon name="back" size={22} /></button>
  <div class="ttl"><b>{title}</b>{#if sub}<small>{sub}</small>{/if}</div>
  {#if trailing}<div class="trail">{@render trailing()}</div>{/if}
</header>

<style>
  .nav { position: sticky; top: -4px; /* the panel's 4px top padding counts against sticky offsets */ z-index: 3; display: flex; align-items: center; gap: 4px; margin: -4px -14px 8px; padding: 6px 10px 6px 4px; background: var(--panel); transition: background .2s, box-shadow .2s; }
  .nav.lifted { background: color-mix(in srgb, var(--accent) 7%, var(--panel)); box-shadow: 0 1px 0 var(--line); }
  .back { flex: none; display: grid; place-items: center; width: 44px; height: 44px; border: 0; border-radius: 50%; background: none; color: var(--ink); cursor: pointer; }
  @media (hover: hover) { .back:hover { background: color-mix(in srgb, var(--ink) 8%, transparent); } }
  .ttl { flex: 1; display: flex; flex-direction: column; min-width: 0; padding-left: 2px; }
  .ttl b { font-size: 19px; font-weight: 600; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ttl small { font-size: 13px; color: var(--ink-soft); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .trail { flex: none; display: flex; align-items: center; gap: 6px; }
</style>
