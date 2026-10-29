<script>
  import { game, ui, dev, setDev, cityById, capacity, used, endRoute, addCar, removeCar, canRemoveCar, upgradeEngine, upgradeCost, sellVehicle, sellValue, resetGame, openLoad, followVehicle, etaText, fmt, spec, tailSpecs, aboard, carrierOf, deckUsed } from './game.svelte.js';
  import { ENGINES, TRUCKS, BOATS, PLANES, MI, JOB_TYPES } from './data.js';
  import Sprite from './Sprite.svelte';
  import Icon from './Icon.svelte';
  import { slide } from './motion.js';
  const LEADS = { train: ENGINES, truck: TRUCKS };
  // where a vehicle is when it isn't moving: parked in town, or riding a car ferry
  function where(v) {
    if (v.city) return `Parked at ${cityById[v.city].name}`;
    const f = carrierOf(v);
    return f.trip ? `On ${f.name}, to ${cityById[f.trip.to].name}` : `On ${f.name} at ${cityById[f.city].name}`;
  }
</script>

<p class="muted small">Tap a vehicle to swap cars, upgrade or sell it.</p>
{#each game.vehicles as v (v.id)}
  {@const open = ui.focusVehicle === v.id}
  {@const cap = capacity(v)}
  <div class="card" class:open>
    <button class="row vrow card-head" onclick={() => (ui.focusVehicle = open ? null : v.id)}>
      <span class="pv"><Sprite kind={v.kind} model={v.model} cars={v.cars ?? []} scale={3} /></span>
      <span class="grow">
        <b>{v.name}</b>
        <small>{v.trip ? `To ${cityById[v.trip.to].name}, ${etaText(v)} left${v.next?.length ? `, then ${v.next.length} more stop${v.next.length > 1 ? 's' : ''}` : ''}` : where(v)}</small>
      </span>
      <span class="chev">+</span>
    </button>
    {#if open}
      <div class="card-body" transition:slide={{ duration: 220 }}>
        <div class="meters">
          {#each JOB_TYPES as t}
            {#if cap[t]}<span class="meter t-{t}"><Icon name={t} size={14} />{used(v)[t]}/{cap[t]}</span>{/if}
          {/each}
          {#if v.kind === 'plane'}<span class="meter">Range {Math.round(PLANES[v.model].range * MI)} mi</span>{/if}
        </div>

        {#if v.cars && spec(v).maxCars}
          {@const e = spec(v)}
          {@const tails = tailSpecs(v)}
          {@const what = v.kind === 'truck' ? 'trailer' : 'car'}
          <h4>{what === 'car' ? 'Cars' : 'Trailers'} ({v.cars.length} of {e.maxCars})</h4>
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
              <h4>Upgrade {v.kind === 'truck' ? 'tractor' : 'engine'}</h4>
              <p class="muted small">Trade in your {e.name} and keep the {what}s.</p>
              {#each ups as [k, x]}
                {@const locked = game.level < x.level}
                {@const cost = upgradeCost(v, k)}
                <button class="row" disabled={locked || game.coins < cost} onclick={() => upgradeEngine(v, k)}>
                  <span class="pv"><Sprite kind={v.kind} model={k} scale={3} /></span>
                  <span class="grow"><b>{x.name}</b><small>Pulls {x.maxCars} {what}s{x.noFerry ? ', too long for ferries' : ''}. Speed <span class="pips">{#each [1, 2, 3, 4, 5] as n}<i class:on={n <= x.pips}></i>{/each}</span></small></span>
                  <span class="pay">{locked ? `Lv ${x.level}` : `$${fmt(cost)}`}</span>
                </button>
              {/each}
            {/if}
          {:else}
            <p class="muted small">{what === 'car' ? 'Cars' : 'Trailers'} can be changed once it’s parked.</p>
          {/if}
        {:else if v.kind === 'truck'}
          <p class="muted small">Drives the roads between mainland towns. Bigger trucks and buses are in the Shop.</p>
        {:else if v.kind === 'boat' && BOATS[v.model].deck}
          {@const on = aboard(v)}
          <p class="muted small">Carries trucks between ports: {deckUsed(v)} of {BOATS[v.model].deck} deck spaces used{on.length ? `, by ${on.map((t) => t.name).join(', ')}` : ''}. Drive trucks on and off from the Load screen.</p>
        {:else if v.kind === 'boat'}
          <p class="muted small">Boats sail between ports. Bigger boats are in the Shop.</p>
        {:else}
          {@const cap = capacity(v)}
          <p class="muted small">Holds {JOB_TYPES.filter((t) => cap[t]).map((t) => `${cap[t]} ${t === 'pax' ? 'seats' : t}`).join(', ')}. Want more? Bigger planes are in the Shop.</p>
        {/if}

        <div class="actions">
          {#if v.city}
            <button class="btn primary" onclick={() => openLoad(v)}>Load at {cityById[v.city].name}</button>
            <button class="btn ghost" disabled={v.cargo.length > 0 || aboard(v).length > 0 || game.vehicles.length <= 1} onclick={() => sellVehicle(v)}>Sell for ${fmt(sellValue(v))}</button>
          {:else if !v.trip}
            {@const f = carrierOf(v)}
            {#if f.trip}<button class="btn primary" onclick={() => followVehicle(f)}>Follow {f.name}</button>
            {:else}<button class="btn primary" onclick={() => openLoad(f)}>Drive off at {cityById[f.city].name}</button>{/if}
          {:else}
            <button class="btn primary" onclick={() => followVehicle(v)}>Follow on map</button>
            {#if v.next?.length}<button class="btn ghost" onclick={() => endRoute(v)}>End route at {cityById[v.trip.to].name}</button>{/if}
          {/if}
        </div>
      </div>
    {/if}
  </div>
{/each}

<button class="btn ghost reset" onclick={resetGame}>Start a new game</button>
<button class="btn ghost reset" onclick={() => setDev(!dev.on)}>{dev.on ? 'Turn off dev mode' : 'Dev mode'}</button>
