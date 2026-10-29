<script>
  import { onMount } from 'svelte';
  import MapCanvas from './MapCanvas.svelte';
  import CityPanel from './CityPanel.svelte';
  import FleetPanel from './FleetPanel.svelte';
  import ShopPanel from './ShopPanel.svelte';
  import DevPanel from './DevPanel.svelte';
  import VehicleCard from './VehicleCard.svelte';
  import Icon from './Icon.svelte';
  import { game, ui, dev, start, fmt, cityById } from './game.svelte.js';
  import { LEVELS } from './data.js';

  let sheetPx = $state(0);
  onMount(start);
  const maxed = $derived(game.level >= LEVELS.length);
  const pct = $derived(maxed ? 100 : Math.min(100, ((game.xp - LEVELS[game.level - 1]) / (LEVELS[game.level] - LEVELS[game.level - 1])) * 100));
  const moving = $derived(game.vehicles.filter((v) => v.trip).length);
  function setTab(t) {
    if (ui.tab === t && ui.sheetOpen) { ui.sheetOpen = false; return; }
    ui.tab = t;
    ui.sheetOpen = true;
  }
</script>

<div class="app">
  <header class="hud">
    <div class="brand"><span>Pixel</span><span>Transport</span></div>
    <div class="coins"><span class="coin"><Icon name="coin" size={16} /></span>{fmt(game.coins)}</div>
    <div class="lvl" title="{maxed ? 'Max level' : `${fmt(game.xp)} of ${fmt(LEVELS[game.level])} XP`}">
      <span>Lv {game.level}</span>
      <span class="bar"><i style:width="{pct}%"></i></span>
    </div>
  </header>

  <main class="stage">
    <MapCanvas {sheetPx} />
    <div class="toasts" aria-live="polite">
      <VehicleCard />
      {#each ui.toasts as t (t.id)}<div class="toast {t.kind}">{t.text}</div>{/each}
    </div>
    <section class="sheet" class:open={ui.sheetOpen} bind:offsetHeight={sheetPx}>
      <button class="grab" aria-label={ui.sheetOpen ? 'Hide panel' : 'Show panel'} onclick={() => (ui.sheetOpen = !ui.sheetOpen)}><span></span></button>
      <nav class="tabs" class:dev={dev.on}>
        <button class:on={ui.tab === 'city'} onclick={() => setTab('city')}>{cityById[game.selected].name}</button>
        <button class:on={ui.tab === 'fleet'} onclick={() => setTab('fleet')}>Fleet <em>{game.vehicles.length}{moving ? `, ${moving} out` : ''}</em></button>
        <button class:on={ui.tab === 'shop'} onclick={() => setTab('shop')}>Shop</button>
        {#if dev.on}<button class:on={ui.tab === 'dev'} onclick={() => setTab('dev')}>Dev{dev.speed > 1 ? ` ${dev.speed}×` : ''}</button>{/if}
      </nav>
      {#if ui.sheetOpen}
        <div class="body">
          {#if ui.tab === 'city'}<CityPanel />{:else if ui.tab === 'fleet'}<FleetPanel />{:else if ui.tab === 'dev'}<DevPanel />{:else}<ShopPanel />{/if}
        </div>
      {/if}
    </section>
  </main>
</div>
