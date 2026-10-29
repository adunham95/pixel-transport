<script>
  import { game, cityById, buyPlane, buyEngine, buyBoat, fmt } from './game.svelte.js';
  import { ENGINES, CARS, PLANES, BOATS, MI } from './data.js';
  import Sprite from './Sprite.svelte';
  const c = $derived(cityById[game.selected]);
</script>

<p class="note">New vehicles show up at <b>{c.name}</b>.
  {#if !c.air} It has no airport, so select an airport city to buy planes.{/if}
  {#if !c.rail} It has no station, so select a station city to buy engines.{/if}
  {#if !c.port} It has no port, so select a port city to buy boats.{/if}
</p>

<h3>Planes</h3>
{#each Object.entries(PLANES) as [k, p]}
  {@const locked = game.level < p.level}
  <div class="shop" class:locked>
    <span class="pv wide"><Sprite kind="plane" model={k} scale={4} /></span>
    <span class="grow">
      <b>{p.name}</b>
      <small>{p.pax} seats, {p.cargo} cargo</small>
      <small>Range {Math.round(p.range * MI)} mi. Speed <span class="pips">{#each [1, 2, 3, 4, 5] as n}<i class:on={n <= p.pips}></i>{/each}</span></small>
    </span>
    <button class="btn primary" disabled={locked || !c.air || game.coins < p.price} onclick={() => buyPlane(k)}>{locked ? `Lv ${p.level}` : `$${fmt(p.price)}`}</button>
  </div>
{/each}

<h3>Train engines</h3>
<p class="muted small">Engines come with no cars. Add cars from the Fleet tab.</p>
{#each Object.entries(ENGINES) as [k, e]}
  {@const locked = game.level < e.level}
  <div class="shop" class:locked>
    <span class="pv wide"><Sprite kind="train" model={k} cars={['pax', 'box', 'tank'].slice(0, Math.min(3, e.maxCars))} scale={4} /></span>
    <span class="grow">
      <b>{e.name}</b>
      <small>Pulls up to {e.maxCars} cars</small>
      <small>Speed <span class="pips">{#each [1, 2, 3, 4, 5] as n}<i class:on={n <= e.pips}></i>{/each}</span></small>
    </span>
    <button class="btn primary" disabled={locked || !c.rail || game.coins < e.price} onclick={() => buyEngine(k)}>{locked ? `Lv ${e.level}` : `$${fmt(e.price)}`}</button>
  </div>
{/each}

<h3>Train cars</h3>
{#each Object.values(CARS) as car}
  <div class="shop" class:locked={game.level < car.level}>
    <span class="swatch" style:--c={car.color}></span>
    <span class="grow"><b>{car.name}</b><small>Holds {car.cap} {car.holds === 'pax' ? 'passengers' : car.holds}. ${car.price} each.</small></span>
    <span class="pay">{game.level < car.level ? `Lv ${car.level}` : 'In Fleet'}</span>
  </div>
{/each}

<h3>Boats</h3>
{#each Object.entries(BOATS) as [k, bt]}
  {@const locked = game.level < bt.level}
  <div class="shop" class:locked>
    <span class="pv wide"><Sprite kind="boat" model={k} scale={4} /></span>
    <span class="grow">
      <b>{bt.name}</b>
      <small>{[bt.cap.pax && `${bt.cap.pax} seats`, bt.cap.cargo && `${bt.cap.cargo} cargo`, bt.cap.fuel && `${bt.cap.fuel} fuel`].filter(Boolean).join(', ')}</small>
      <small>Speed <span class="pips">{#each [1, 2, 3, 4, 5] as n}<i class:on={n <= bt.pips}></i>{/each}</span></small>
    </span>
    <button class="btn primary" disabled={locked || !c.port || game.coins < bt.price} onclick={() => buyBoat(k)}>{locked ? `Lv ${bt.level}` : `$${fmt(bt.price)}`}</button>
  </div>
{/each}
