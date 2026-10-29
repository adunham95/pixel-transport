<script>
  import { game, ui, dev, setDev, cityById, capacity, endRoute, addCar, removeCar, canRemoveCar, upgradeEngine, upgradeCost, sellVehicle, sellValue, resetGame, openLoad, followVehicle, etaText, fmt, stopRepeating, spec, tailSpecs, tailName, aboard, carrierOf, deckUsed, deckRoom, deckFor, finances, clock, wear, service, serviceCost } from './game.svelte.js';
  import { ENGINES, TRUCKS, BOATS, PLANES, MI, JOB_TYPES } from './data.js';
  import Sprite from './Sprite.svelte';
  import LoadBadges from './LoadBadges.svelte';
  import { slide, reduced } from './motion.js';
  const LEADS = { train: ENGINES, truck: TRUCKS, boat: BOATS };
  // which vehicle's upgrade list is dropped down, if any
  let upgrading = $state(null);
  // bring a card into view when it's opened, including from the map's route card
  function reveal(node, on) {
    const go = (on) => on && setTimeout(() => node.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' }), 80);
    go(on);
    return { update: go };
  }
  const money = (n) => `${n < 0 ? '−' : ''}$${fmt(Math.abs(n))}`;
  // the whole fleet's takings, for the summary up top
  const books = $derived(game.vehicles.map((v) => finances(v, clock.now)));
  const total = $derived(books.reduce((s, b) => ({ earned: s.earned + b.earned, fuel: s.fuel + b.fuel, perHour: s.perHour + (b.perHour ?? 0) }), { earned: 0, fuel: 0, perHour: 0 }));
  // where a vehicle is when it isn't moving: parked in town, or riding a car ferry or cargo plane
  function where(v) {
    if (v.city) return v.loop ? `Repeating, waiting for jobs at ${cityById[v.city].name}` : `Parked at ${cityById[v.city].name}`;
    const f = carrierOf(v);
    return f.trip ? `On ${f.name}, to ${cityById[f.trip.to].name}` : `On ${f.name} at ${cityById[f.city].name}`;
  }
</script>

<div class="books">
  <div><small>Earned</small><b>{money(total.earned)}</b></div>
  <div><small>Fuel</small><b>{money(-total.fuel)}</b></div>
  <div><small>Profit</small><b class:loss={total.earned < total.fuel}>{money(total.earned - total.fuel)}</b></div>
  <div><small>Per hour</small><b class:loss={total.perHour < 0}>{money(total.perHour)}</b></div>
</div>
<p class="muted small">Tap a vehicle to swap cars, upgrade or sell it.</p>
{#each game.vehicles as v, i (v.id)}
  {@const open = ui.focusVehicle === v.id}
  {@const f = books[i]}
  {@const wr = wear(v)}
  <div class="card" class:open use:reveal={open}>
    <button class="row vrow card-head" onclick={() => (ui.focusVehicle = open ? null : v.id)}>
      <span class="pv"><Sprite kind={v.kind} model={v.model} cars={v.cars ?? []} scale={3} /></span>
      <span class="grow">
        <b>{v.name}{#if v.loop}<span class="tag hub mini">Repeating</span>{/if}{#if f.perHour != null}<span class="tag mini" class:loss={f.perHour < 0}>{money(f.perHour)}/h</span>{/if}{#if wr >= 0.3}<span class="tag mini loss">Needs service</span>{/if}</b>
        <small>{v.trip ? `To ${cityById[v.trip.to].name}, ${etaText(v)} left${v.next?.length ? `, then ${v.next.length} more stop${v.next.length > 1 ? 's' : ''}` : ''}` : where(v)}</small>
        <LoadBadges {v} />
      </span>
      <span class="chev">+</span>
    </button>
    {#if open}
      <div class="card-body" transition:slide={{ duration: 220 }}>
        <div class="books small">
          <div><small>Earned</small><b>{money(f.earned)}</b></div>
          <div><small>Fuel</small><b>{money(-f.fuel)}</b></div>
          <div><small>Profit</small><b class:loss={f.profit < 0}>{money(f.profit)}</b></div>
          <div><small>Per hour</small><b class:loss={f.perHour < 0}>{f.perHour == null ? 'Soon' : money(f.perHour)}</b></div>
        </div>
        <div class="payback"><i style:width="{Math.min(100, Math.max(0, f.paidBack * 100))}%"></i></div>
        <p class="muted small">{f.paidBack >= 1 ? 'Paid for itself' : `Paid back ${Math.max(0, Math.floor(f.paidBack * 100))}% of what it cost`}</p>
        {#if v.kind === 'plane'}<div class="meters"><span class="meter">Range {Math.round(PLANES[v.model].range * MI)} mi</span></div>{/if}
        <div class="row age">
          <span class="grow"><b>{Math.round((v.miles ?? 0) * MI)} mi on it</b><small>{wr ? `Burns ${Math.round(wr * 100)}% more fuel with age. Service it, or sell it.` : 'Running like new. Burns more fuel as the miles add up.'}</small></span>
          {#if wr && v.city}<button class="btn small" disabled={game.coins < serviceCost(v)} onclick={() => service(v)}>Service ${fmt(serviceCost(v))}</button>{/if}
        </div>

        {#if v.cars && spec(v).maxCars}
          {@const e = spec(v)}
          {@const tails = tailSpecs(v)}
          {@const what = tailName(v)}
          <h4>{what[0].toUpperCase() + what.slice(1)}s ({v.cars.length} of {e.maxCars})</h4>
          <div class="consist">
            {#each v.cars as t, i}
              <span class="unit" style:--c={tails[t].color}>
                {tails[t].short}
                {#if v.city}<button class="x" aria-label="Sell {tails[t].short} {what}" disabled={!canRemoveCar(v, i)} onclick={() => removeCar(v, i)}>×</button>{/if}
              </span>
            {:else}
              <span class="muted small">No {what}s yet. Add one below.</span>
            {/each}
          </div>
          {#if v.city}
            <div class="grid3">
              {#each Object.entries(tails) as [k, c]}
                {@const locked = game.level < c.level}
                {@const nope = e.freightOnly && c.holds === 'pax'}
                <button class="btn small" disabled={locked || nope || v.cars.length >= e.maxCars || game.coins < c.price} onclick={() => addCar(v, k)}>
                  {locked ? `${c.short} at Lv ${c.level}` : nope ? `No ${c.short}` : `+ ${c.short} $${c.price}`}
                </button>
              {/each}
            </div>
            {@const ups = Object.entries(LEADS[v.kind]).filter(([, x]) => x.maxCars > e.maxCars)}
            {#if ups.length}
              {@const shown = upgrading === v.id}
              <button class="row drop" class:shown aria-expanded={shown} onclick={() => (upgrading = shown ? null : v.id)}>
                <span class="grow"><b>Upgrade {v.kind === 'truck' ? 'tractor' : v.kind === 'boat' ? 'tug' : 'engine'}</b><small>{ups.length} option{ups.length > 1 ? 's' : ''}. Trade in your {e.name} and keep the {what}s.</small></span>
                <span class="chev">+</span>
              </button>
              {#if shown}<div transition:slide={{ duration: 200 }}>
              {#each ups as [k, x]}
                {@const locked = game.level < x.level}
                {@const cost = upgradeCost(v, k)}
                <button class="row" disabled={locked || game.coins < cost} onclick={() => upgradeEngine(v, k)}>
                  <span class="pv"><Sprite kind={v.kind} model={k} scale={3} /></span>
                  <span class="grow"><b>{x.name}</b><small>Pulls {x.maxCars} {what}s{x.noFerry ? ', too long for ferries' : ''}. Speed <span class="pips">{#each [1, 2, 3, 4, 5] as n}<i class:on={n <= x.pips}></i>{/each}</span></small></span>
                  <span class="pay">{locked ? `Lv ${x.level}` : `$${fmt(cost)}`}</span>
                </button>
              {/each}
              </div>{/if}
            {/if}
          {:else}
            <p class="muted small">{what[0].toUpperCase() + what.slice(1)}s can be changed once it’s parked.</p>
          {/if}
        {:else if v.kind === 'truck'}
          <p class="muted small">Drives the roads between mainland towns. Bigger trucks and buses are in the Shop.</p>
        {:else if deckRoom(v)}
          {@const on = aboard(v)}
          {#if deckFor(v) === 'plane'}
            <p class="muted small">A landing strip at sea. Anchor it at an anchorage, or moor it at a port, and small and mid-size planes and helicopters can land there. {deckUsed(v)} of {deckRoom(v)} deck spaces used{on.length ? `, by ${on.map((t) => t.name).join(', ')}` : ''}. Planes that need it come aboard when it sails.</p>
          {:else}
            <p class="muted small">Carries trucks between {v.kind === 'boat' ? 'ports' : 'airports'}: {deckUsed(v)} of {deckRoom(v)} deck spaces used{on.length ? `, by ${on.map((t) => t.name).join(', ')}` : ''}. Drive trucks on and off from the Load screen.</p>
          {/if}
        {:else if v.kind === 'boat'}
          <p class="muted small">Boats sail between ports. Bigger boats are in the Shop.</p>
        {:else}
          {@const cap = capacity(v)}
          <p class="muted small">Holds {JOB_TYPES.filter((t) => cap[t]).map((t) => `${cap[t]} ${t === 'pax' ? 'seats' : t}`).join(', ')}. Want more? Bigger planes are in the Shop.</p>
        {/if}

        <div class="actions">
          {#if v.loop}<button class="btn ghost" onclick={() => stopRepeating(v)}>Stop repeating</button>{/if}
          {#if v.city}
            <button class="btn primary" onclick={() => openLoad(v)}>Load at {cityById[v.city].name}</button>
            <button class="btn ghost" disabled={v.cargo.length > 0 || aboard(v).length > 0 || game.vehicles.length <= 1} onclick={() => sellVehicle(v)}>Sell for ${fmt(sellValue(v))}</button>
          {:else if !v.trip}
            {@const f = carrierOf(v)}
            {#if f.trip}<button class="btn primary" onclick={() => followVehicle(f)}>Follow {f.name}</button>
            {:else}<button class="btn primary" onclick={() => openLoad(f)}>{v.kind === 'plane' ? 'Launch' : 'Drive off'} at {cityById[f.city].name}</button>{/if}
          {:else}
            <button class="btn primary" onclick={() => followVehicle(v)}>Follow on map</button>
            {#if v.next?.length && !v.loop}<button class="btn ghost" onclick={() => endRoute(v)}>End route at {cityById[v.trip.to].name}</button>{/if}
          {/if}
        </div>
      </div>
    {/if}
  </div>
{/each}

<button class="btn ghost reset" onclick={resetGame}>Start a new game</button>
<button class="btn ghost reset" onclick={() => setDev(!dev.on)}>{dev.on ? 'Turn off dev mode' : 'Dev mode'}</button>

<style>
  .drop { margin-top: 10px; }
  .age { margin: 8px 0; }
  .books { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin: 6px 0 10px; padding: 10px 12px; background: var(--panel-2); border: 1px solid var(--line); border-radius: var(--r); }
  .books.small { margin: 0 0 6px; padding: 8px 10px; background: var(--panel-3); border: 0; }
  .books div { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
  .books small { color: var(--ink-soft); font-size: 12px; }
  .books b { font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .loss { color: #c0392b; }
  .payback { height: 5px; background: var(--panel-3); border-radius: 3px; overflow: hidden; }
  .payback i { display: block; height: 100%; background: var(--accent); border-radius: 3px; }
  /* the open card turns every chevron inside it, so set this one by its own state */
  .drop .chev { transform: none; }
  .drop.shown .chev { transform: rotate(45deg); }
</style>
