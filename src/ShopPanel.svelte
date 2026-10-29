<script>
  import { game, cityById, buyPlane, buyEngine, buyBoat, buyTruck, buyRepeatRoutes, isOpen, canBase, fmt } from './game.svelte.js';
  import { ENGINES, CARS, PLANES, BOATS, BARGES, TRUCKS, TRAILERS, MI, TYPE_LABEL, JOB_TYPES, REPEAT_ROUTES } from './data.js';
  const UNIT = { pax: 'seats', cargo: 'cargo', fuel: 'fuel', bulk: 'bulk' };
  const holds = (cap) => JOB_TYPES.filter((t) => cap[t]).map((t) => `${cap[t]} ${UNIT[t]}`).join(', ');
  // demo consist for the shop picture: freight engines don't get a passenger car
  const demo = (e) => (e.freightOnly ? ['box', 'hopper', 'tank'] : ['pax', 'box', 'tank']).slice(0, Math.min(3, e.maxCars));
  const demoTrailers = (t) => ['van', 'dump', 'tank'].slice(0, Math.min(3, t.maxCars));
  import Sprite from './Sprite.svelte';
  const c = $derived(cityById[game.selected]);
</script>

{#if c.anchor}
<p class="note"><b>{c.name}</b> is open sea. Select a town to buy vehicles there.</p>
{:else}
<p class="note">New vehicles show up at <b>{c.name}</b>.
  {#if !isOpen(c.id)} It’s locked, so unlock it or pick another city first.{/if}
  {#if !c.air} It has no airport, so only helicopters{c.port ? ' and seaplanes' : ''} can be bought here.{/if}
  {#if !c.rail} It has no station, so select a station city to buy engines.{/if}
  {#if !c.port} It has no port, so select a port city to buy boats.{/if}
  {#if !c.road} It has no roads, so select a mainland town to buy trucks.{/if}
</p>
{/if}

<h3>Upgrades</h3>
<div class="shop" class:locked={game.level < REPEAT_ROUTES.level}>
  <span class="grow">
    <b>Repeating routes</b>
    <small>For the whole fleet. Vehicles loop a planned route on their own, picking up jobs at every stop.</small>
  </span>
  {#if game.repeatRoutes}<span class="pay">Owned</span>
  {:else}<button class="btn primary" disabled={game.level < REPEAT_ROUTES.level || game.coins < REPEAT_ROUTES.price} onclick={buyRepeatRoutes}>{game.level < REPEAT_ROUTES.level ? `Lv ${REPEAT_ROUTES.level}` : `$${fmt(REPEAT_ROUTES.price)}`}</button>{/if}
</div>

<h3>Planes</h3>
{#each Object.entries(PLANES) as [k, p]}
  {@const locked = game.level < p.level}
  <div class="shop" class:locked>
    <span class="pv wide"><Sprite kind="plane" model={k} scale={4} /></span>
    <span class="grow">
      <b>{p.name}</b>
      <small>{holds({ pax: p.pax, cargo: p.cargo, ...p.hold })}{p.deck ? `, ${p.deck} truck spaces` : ''}{p.vtol ? '. Lands anywhere' : p.seaplane ? '. Lands at ports too' : ''}{p.deckSpace ? '. Lands on carriers' : ''}</small>
      <small>Range {Math.round(p.range * MI)} mi. Speed <span class="pips">{#each [1, 2, 3, 4, 5] as n}<i class:on={n <= p.pips}></i>{/each}</span></small>
    </span>
    <button class="btn primary" disabled={locked || !isOpen(c.id) || c.anchor || !canBase('plane', k, c) || game.coins < p.price} onclick={() => buyPlane(k)}>{locked ? `Lv ${p.level}` : `$${fmt(p.price)}`}</button>
  </div>
{/each}

<h3>Train engines</h3>
<p class="muted small">Engines come with no cars. Add cars from the Fleet tab.</p>
{#each Object.entries(ENGINES) as [k, e]}
  {@const locked = game.level < e.level}
  <div class="shop" class:locked>
    <span class="pv wide"><Sprite kind="train" model={k} cars={demo(e)} scale={4} /></span>
    <span class="grow">
      <b>{e.name}</b>
      <small>Pulls up to {e.maxCars} {e.freightOnly ? 'freight ' : ''}cars{e.maglev ? '. Maglev lines only' : ''}</small>
      <small>Speed <span class="pips">{#each [1, 2, 3, 4, 5] as n}<i class:on={n <= e.pips}></i>{/each}</span></small>
    </span>
    <button class="btn primary" disabled={locked || !isOpen(c.id) || c.anchor || !canBase('train', k, c) || game.coins < e.price} onclick={() => buyEngine(k)}>{locked ? `Lv ${e.level}` : `$${fmt(e.price)}`}</button>
  </div>
{/each}

<h3>Train cars</h3>
{#each Object.values(CARS) as car}
  <div class="shop" class:locked={game.level < car.level}>
    <span class="swatch" style:--c={car.color}></span>
    <span class="grow"><b>{car.name}</b><small>Holds {car.cap} {TYPE_LABEL[car.holds].toLowerCase()}. ${car.price} each.</small></span>
    <span class="pay">{game.level < car.level ? `Lv ${car.level}` : 'In Fleet'}</span>
  </div>
{/each}

<h3>Trucks and buses</h3>
<p class="muted small">Trucks and buses drive the roads between mainland towns. A car ferry can take them to other shores.</p>
{#each Object.entries(TRUCKS) as [k, t]}
  {@const locked = game.level < t.level}
  <div class="shop" class:locked>
    <span class="pv wide"><Sprite kind="truck" model={k} cars={demoTrailers(t)} scale={4} /></span>
    <span class="grow">
      <b>{t.name}</b>
      <small>{t.maxCars ? `Pulls ${t.maxCars > 1 ? `up to ${t.maxCars} trailers` : 'a trailer'}` : holds(t.cap)}{t.noFerry ? '. Too long for car ferries' : ''}</small>
      <small>Speed <span class="pips">{#each [1, 2, 3, 4, 5] as n}<i class:on={n <= t.pips}></i>{/each}</span></small>
    </span>
    <button class="btn primary" disabled={locked || !isOpen(c.id) || c.anchor || !canBase('truck', k, c) || game.coins < t.price} onclick={() => buyTruck(k)}>{locked ? `Lv ${t.level}` : `$${fmt(t.price)}`}</button>
  </div>
{/each}

<h3>Trailers</h3>
{#each Object.values(TRAILERS) as tr}
  <div class="shop" class:locked={game.level < tr.level}>
    <span class="swatch" style:--c={tr.color}></span>
    <span class="grow"><b>{tr.name}</b><small>Holds {tr.cap} {TYPE_LABEL[tr.holds].toLowerCase()}. ${tr.price} each.</small></span>
    <span class="pay">{game.level < tr.level ? `Lv ${tr.level}` : 'In Fleet'}</span>
  </div>
{/each}

<h3>Boats</h3>
{#each Object.entries(BOATS) as [k, bt]}
  {@const locked = game.level < bt.level}
  <div class="shop" class:locked>
    <span class="pv wide"><Sprite kind="boat" model={k} cars={bt.maxCars ? ['deck', 'hopper', 'tank'].slice(0, bt.maxCars) : []} scale={4} /></span>
    <span class="grow">
      <b>{bt.name}</b>
      <small>{bt.maxCars ? `Tows up to ${bt.maxCars} barges` : ''}{holds(bt.cap)}{bt.deck ? `${holds(bt.cap) ? ', ' : ''}${bt.deck} ${bt.deckFor ?? 'truck'} spaces` : ''}{bt.deckFor === 'plane' ? '. Anchors at sea' : ''}{bt.harbor ? '. Ports with a station only' : ''}</small>
      <small>Speed <span class="pips">{#each [1, 2, 3, 4, 5] as n}<i class:on={n <= bt.pips}></i>{/each}</span></small>
    </span>
    <button class="btn primary" disabled={locked || !isOpen(c.id) || c.anchor || !canBase('boat', k, c) || game.coins < bt.price} onclick={() => buyBoat(k)}>{locked ? `Lv ${bt.level}` : `$${fmt(bt.price)}`}</button>
  </div>
{/each}

<h3>Barges</h3>
{#each Object.values(BARGES) as bg}
  <div class="shop" class:locked={game.level < bg.level}>
    <span class="swatch" style:--c={bg.color}></span>
    <span class="grow"><b>{bg.name}</b><small>Holds {bg.cap} {TYPE_LABEL[bg.holds].toLowerCase()}. ${bg.price} each.</small></span>
    <span class="pay">{game.level < bg.level ? `Lv ${bg.level}` : 'In Fleet'}</span>
  </div>
{/each}
