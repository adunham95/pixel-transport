<script>
  import { game, dev, cityById, devCoins, devMaxLevel, devSpawn, devFinishLegs, devFillJobs, devUnlockAll, devSkipHalfDay, devSuperload, setDev, isOpen, canBase, fmt } from './game.svelte.js';
  import { ENGINES, PLANES, BOATS, TRUCKS, LEVELS } from './data.js';
  import Sprite from './Sprite.svelte';
  const c = $derived(cityById[game.selected]);
  const groups = $derived([
    { kind: 'train', title: 'Trains', specs: ENGINES },
    { kind: 'plane', title: 'Planes', specs: PLANES },
    { kind: 'boat', title: 'Boats', specs: BOATS },
    { kind: 'truck', title: 'Trucks', specs: TRUCKS },
  ].map((g) => {
    // only what can actually be based here: maglevs need a maglev town, seaplanes a port or airport, and so on
    const list = Object.entries(g.specs).filter(([k]) => canBase(g.kind, k, c));
    return { ...g, list, some: list.length < Object.keys(g.specs).length };
  }));
  const demo = (kind, s) => (kind === 'truck' ? s.pulls ?? ['van', 'dump', 'tank'] : kind === 'boat' ? ['deck', 'hopper', 'tank'] : s.pulls ? Array(s.maxCars).fill(s.pulls[0]) : s.freightOnly ? ['box', 'hopper', 'tank'] : ['pax', 'box', 'tank']).slice(0, Math.min(3, s.maxCars));
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
  <button class="btn small" disabled={!isOpen(c.id)} onclick={devFillJobs}>+6 jobs at {c.name}</button>
</div>
<div class="grid3 two">
  <button class="btn small" onclick={devUnlockAll}>Unlock all towns</button>
  <button class="btn small" onclick={devSkipHalfDay}>Skip half a day</button>
</div>
<div class="grid3 two">
  <button class="btn small" onclick={devSuperload}>Superload contract{c.road && isOpen(c.id) ? ` from ${c.name}` : ''}</button>
</div>

{#if !isOpen(c.id)}<p class="muted small">{c.name} is locked, so nothing can be spawned there.</p>{/if}
{#each groups as g}
  <h3>Spawn {g.title.toLowerCase()} at {c.name}</h3>
  {#if !g.list.length}<p class="muted small">None can be based at {c.name}.</p>{:else if g.some}<p class="muted small">Only the ones that can be based at {c.name}.</p>{/if}
  {#if g.list.length}
    {#each g.list as [k, s]}
      <button class="row" onclick={() => devSpawn(g.kind, k)}>
        <span class="pv"><Sprite kind={g.kind} model={k} cars={s.maxCars ? demo(g.kind, s) : []} scale={3} /></span>
        <span class="grow"><b>{s.name}</b><small>Lv {s.level}, ${fmt(s.price)} in the shop</small></span>
        <span class="act">Spawn</span>
      </button>
    {/each}
  {/if}
{/each}

<button class="btn ghost reset" onclick={() => setDev(false)}>Turn off dev mode</button>
