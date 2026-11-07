<script>
  import { onMount } from 'svelte';
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import MapCanvas from './map/MapCanvas.svelte';
  import CityPanel from './panels/CityPanel.svelte';
  import FleetPanel from './panels/FleetPanel.svelte';
  import ShopPanel from './panels/ShopPanel.svelte';
  import DevPanel from './panels/DevPanel.svelte';
  import ContractsPanel from './panels/ContractsPanel.svelte';
  import RoutesPanel from './panels/RoutesPanel.svelte';
  import VehicleCard from './ui/VehicleCard.svelte';
  import Icon from './ui/Icon.svelte';
  import { game, ui, dev, start, fmt, cityById, isIdle } from './game/game.svelte.js';
  import { LEVELS, CONTRACTS } from './game/data.js';
  import { fly, fade, flip, reduced } from './ui/motion.js';

  let sheetPx = $state(0);
  onMount(start);
  // on wide screens the panel sits beside the map as a sidebar instead of a sheet over it
  const wideQuery = typeof matchMedia === 'function' ? matchMedia('(min-width: 900px)') : null;
  let wide = $state(wideQuery?.matches ?? false);
  $effect(() => {
    if (!wideQuery) return;
    const on = (e) => (wide = e.matches);
    wideQuery.addEventListener('change', on);
    return () => wideQuery.removeEventListener('change', on);
  });
  const open = $derived(wide || ui.sheetOpen);
  const maxed = $derived(game.level >= LEVELS.length);
  const pct = $derived(maxed ? 100 : Math.max(0, Math.min(100, ((game.xp - LEVELS[game.level - 1]) / (LEVELS[game.level] - LEVELS[game.level - 1])) * 100)));
  const idle = $derived(game.vehicles.filter(isIdle).length);
  const broken = $derived(game.vehicles.some((v) => v.broken));
  // one row of tabs, each an icon and a short word. A dot means something there wants a look:
  // red for a breakdown, gold for idle vehicles or contract offers waiting.
  const tabs = $derived([
    { k: 'city', icon: 'town', label: 'Town', title: cityById[game.selected].name },
    { k: 'fleet', icon: 'fleet', label: 'Fleet', title: `${game.vehicles.length} vehicles${idle ? `, ${idle} idle` : ''}`, dot: broken ? 'bad' : idle ? 'on' : null },
    ...(game.repeatRoutes ? [{ k: 'routes', icon: 'routes', label: 'Routes', title: `${game.routes.length} routes` }] : []),
    { k: 'contracts', icon: 'contracts', label: 'Contracts', title: `${game.contracts.active.length} under way`, dot: game.level >= CONTRACTS.level && game.contracts.offers.length ? 'on' : null },
    { k: 'shop', icon: 'shop', label: 'Shop', title: 'Shop' },
    ...(dev.on ? [{ k: 'dev', icon: 'dev', label: dev.speed > 1 ? `${dev.speed}×` : '', title: 'Dev', slim: true }] : []),
  ]);
  function setTab(t) {
    if (ui.tab === t && ui.sheetOpen && !wide) { ui.sheetOpen = false; return; }
    ui.tab = t;
    ui.sheetOpen = true;
  }

  // ---------- coins roll up to their new value, with a +/- chip for the change ----------
  const coins = new Tween(game.coins, { duration: reduced ? 0 : 600, easing: cubicOut });
  let deltas = $state([]), bump = $state(0), lastCoins = game.coins, did = 0;
  $effect(() => {
    const now = game.coins, d = now - lastCoins;
    lastCoins = now;
    coins.target = now;
    if (!d) return;
    const id = ++did;
    deltas.push({ id, d });
    if (d > 0) bump++;
    setTimeout(() => (deltas = deltas.filter((x) => x.id !== id)), 1100);
  });

  // ---------- sliding pill behind the active tab ----------
  const tabEls = {};
  let pill = $state(null);
  $effect(() => {
    const el = tabEls[ui.tab], nav = el?.parentElement;
    tabs.length; // a tab coming or going (dev, routes) changes every column's width
    if (!el) return;
    const set = () => (pill = { x: el.offsetLeft, w: el.offsetWidth });
    set();
    const ro = new ResizeObserver(set);
    ro.observe(nav);
    return () => ro.disconnect();
  });

  // ---------- dragging the sheet to set its height ----------
  const SHEET_KEY = 'pixel-transport-sheet', CLOSED = 80, SNAP = 60;
  let stageEl, sheetEl;
  let sheetFrac = $state((() => { try { return Number(localStorage.getItem(SHEET_KEY)) || 0.56; } catch { return 0.56; } })());
  let dragH = $state(null), drag = null, dragged = false;
  function headDown(e) {
    if (e.button || wide) return;
    drag = { y0: e.clientY, h0: sheetEl.offsetHeight, y: e.clientY, t: performance.now(), v: 0 };
    dragged = false;
  }
  function headMove(e) {
    if (!drag) return;
    const dy = e.clientY - drag.y0;
    if (!dragged && Math.abs(dy) < 6) return;
    dragged = true;
    const now = performance.now();
    drag.v = drag.v * 0.4 + ((e.clientY - drag.y) / Math.max(1, now - drag.t)) * 0.6;
    drag.y = e.clientY; drag.t = now;
    dragH = Math.min(stageEl.clientHeight - 24, Math.max(CLOSED, drag.h0 - dy));
  }
  function headUp() {
    if (!drag) return;
    if (dragged) {
      const flick = drag.v > 0.5 ? 'down' : drag.v < -0.5 ? 'up' : null;
      if (flick === 'down' || (!flick && dragH < CLOSED + SNAP)) ui.sheetOpen = false;
      else {
        ui.sheetOpen = true;
        // a quick flick up from near closed opens to the last height instead of a sliver
        if (dragH >= CLOSED + SNAP) {
          sheetFrac = Math.max(0.25, dragH / stageEl.clientHeight);
          try { localStorage.setItem(SHEET_KEY, String(sheetFrac)); } catch {}
        }
      }
    }
    drag = null; dragH = null;
  }
  // a drag that ends over a tab shouldn't also switch tabs
  function headClick(e) {
    if (!dragged) return;
    dragged = false;
    e.stopPropagation(); e.preventDefault();
  }
</script>

<!-- moves are watched on the window since the pointer soon leaves the sheet's header -->
<svelte:window onpointermove={headMove} onpointerup={headUp} onpointercancel={headUp} />

<div class="app">
  <header class="hud">
    <div class="brand"><span>Pixel</span><span>Transport</span></div>
    <div class="coins">
      <span class="coin">{#key bump}<span class="spin"><Icon name="coin" size={16} /></span>{/key}</span>{fmt(coins.current)}
      {#each deltas as x (x.id)}<span class="delta" class:neg={x.d < 0}>{x.d > 0 ? '+' : '−'}${fmt(Math.abs(x.d))}</span>{/each}
    </div>
    <div class="lvl" title="{maxed ? 'Max level' : `${fmt(game.xp)} of ${fmt(LEVELS[game.level])} XP`}">
      {#key game.level}<span class="lvnum">Lv {game.level}</span>{/key}
      <span class="bar"><i style:width="{pct}%"></i></span>
    </div>
  </header>

  <main class="stage" bind:this={stageEl}>
    <div class="mapwrap">
      <MapCanvas sheetPx={wide ? 0 : sheetPx} />
      <div class="toasts" aria-live="polite">
        <VehicleCard />
        {#each ui.toasts as t (t.id)}
          <div class="toast {t.kind}" animate:flip in:fly={{ y: -12, duration: 220 }} out:fade={{ duration: 180 }}>{t.text}</div>
        {/each}
      </div>
    </div>
    <section class="sheet" class:open class:dragging={dragH != null} bind:this={sheetEl} bind:offsetHeight={sheetPx}
      style:height={wide ? null : dragH != null ? `${dragH}px` : ui.sheetOpen ? `${sheetFrac * 100}%` : null}>
      <div class="sheet-head" role="presentation" onpointerdown={headDown} onclickcapture={headClick}>
        <button class="grab" aria-label={ui.sheetOpen ? 'Hide panel' : 'Show panel'} onclick={() => (ui.sheetOpen = !ui.sheetOpen)}><span></span></button>
        <nav class="tabs">
          {#if pill}<span class="pill" style:width="{pill.w}px" style:transform="translateX({pill.x}px)"></span>{/if}
          {#each tabs as t (t.k)}
            <button bind:this={tabEls[t.k]} class:on={ui.tab === t.k} class:slim={t.slim} aria-label={t.label ? undefined : t.title} aria-current={ui.tab === t.k ? 'page' : undefined} title={t.title} onclick={() => setTab(t.k)}>
              <span class="ico"><Icon name={t.icon} size={18} />{#if t.dot}<i class="dot {t.dot}"></i>{/if}</span>
              {#if t.label}<span class="lbl">{t.label}</span>{/if}
            </button>
          {/each}
        </nav>
      </div>
      {#if open}
        <div class="body">
          {#key ui.tab}
            <div in:fly={{ y: 10, duration: 200 }}>
              {#if ui.tab === 'city'}<CityPanel />{:else if ui.tab === 'fleet'}<FleetPanel />{:else if ui.tab === 'routes'}<RoutesPanel />{:else if ui.tab === 'contracts'}<ContractsPanel />{:else if ui.tab === 'dev'}<DevPanel />{:else}<ShopPanel />{/if}
            </div>
          {/key}
        </div>
      {/if}
    </section>
  </main>
</div>
