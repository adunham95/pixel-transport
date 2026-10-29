<script>
  import { game, dev, cityById, devCoins, devMaxLevel, devSpawn, devFinishLegs, devFillJobs, setDev, fmt } from './game.svelte.js';
  import { ENGINES, PLANES, BOATS, LEVELS } from './data.js';
  import Sprite from './Sprite.svelte';
  const c = $derived(cityById[game.selected]);
  const groups = $derived([
    { kind: 'train', title: 'Trains', specs: ENGINES, ok: c.rail, need: 'a station' },
    { kind: 'plane', title: 'Planes', specs: PLANES, ok: c.air, need: 'an airport' },
    { kind: 'boat', title: 'Boats', specs: BOATS, ok: c.port, need: 'a port' },
  ]);
</script>

<p class="note">Dev mode is for trying things out. Spawned vehicles are free and ignore levels.</p>

<h3>Money and level</h3>
<div class="grid3">
  <button class="btn small" onclick={() => devCoins(10000)}>+ $10,000</button>
  <button class="btn small" onclick={() => devCoins(100000)}>+ $100,000</button>
  <button class="btn small" disabled={game.level >= LEVELS.length} onclick={devMaxLevel}>Max level</button>
</div>

<h3>Game speed</h3>
<div class="grid3">
  {#each [1, 5, 20] as n}
    <button class="btn small" class:primary={dev.speed === n} onclick={() => (dev.speed = n)}>{n}×</button>
  {/each}
</div>
<div class="grid3 two">
  <button class="btn small" onclick={devFinishLegs}>Finish current legs</button>
  <button class="btn small" onclick={devFillJobs}>+6 jobs at {c.name}</button>
</div>

{#each groups as g}
  <h3>Spawn {g.title.toLowerCase()} at {c.name}</h3>
  {#if g.ok}
    {#each Object.entries(g.specs) as [k, s]}
      <button class="row" onclick={() => devSpawn(g.kind, k)}>
        <span class="pv"><Sprite kind={g.kind} model={k} cars={g.kind === 'train' ? ['pax', 'box', 'tank'].slice(0, Math.min(3, s.maxCars)) : []} scale={3} /></span>
        <span class="grow"><b>{s.name}</b><small>Lv {s.level}, ${fmt(s.price)} in the shop</small></span>
        <span class="act">Spawn</span>
      </button>
    {/each}
  {:else}
    <p class="muted small">{c.name} doesn’t have {g.need}. Select a city that does.</p>
  {/if}
{/each}

<button class="btn ghost reset" onclick={() => setDev(false)}>Turn off dev mode</button>
