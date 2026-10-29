<script>
  import { game, ui, dev, setDev, cityById, capacity, used, endRoute, addCar, removeCar, canRemoveCar, upgradeEngine, upgradeCost, sellVehicle, sellValue, resetGame, openLoad, followVehicle, etaText, fmt } from './game.svelte.js';
  import { ENGINES, CARS, PLANES, MI } from './data.js';
  import Sprite from './Sprite.svelte';
  import Icon from './Icon.svelte';
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
        <small>{v.trip ? `To ${cityById[v.trip.to].name}, ${etaText(v)} left${v.next?.length ? `, then ${v.next.length} more stop${v.next.length > 1 ? 's' : ''}` : ''}` : `Parked at ${cityById[v.city].name}`}</small>
      </span>
      <span class="chev">{open ? '–' : '+'}</span>
    </button>
    {#if open}
      <div class="card-body">
        <div class="meters">
          {#each ['pax', 'cargo', 'fuel'] as t}
            {#if cap[t]}<span class="meter t-{t}"><Icon name={t} size={14} />{used(v)[t]}/{cap[t]}</span>{/if}
          {/each}
          {#if v.kind === 'plane'}<span class="meter">Range {Math.round(PLANES[v.model].range * MI)} mi</span>{/if}
        </div>

        {#if v.kind === 'train'}
          {@const e = ENGINES[v.model]}
          <h4>Cars ({v.cars.length} of {e.maxCars})</h4>
          <div class="consist">
            {#each v.cars as t, i}
              <span class="unit" style:--c={CARS[t].color}>
                {CARS[t].short}
                {#if v.city}<button class="x" aria-label="Sell {CARS[t].short} car" disabled={!canRemoveCar(v, i)} onclick={() => removeCar(v, i)}>×</button>{/if}
              </span>
            {:else}
              <span class="muted small">No cars yet. Add one below.</span>
            {/each}
          </div>
          {#if v.city}
            <div class="grid3">
              {#each Object.entries(CARS) as [k, c]}
                {@const locked = game.level < c.level}
                <button class="btn small" disabled={locked || v.cars.length >= e.maxCars || game.coins < c.price} onclick={() => addCar(v, k)}>
                  {locked ? `${c.short} at Lv ${c.level}` : `+ ${c.short} $${c.price}`}
                </button>
              {/each}
            </div>
            {@const ups = Object.entries(ENGINES).filter(([, x]) => x.maxCars > e.maxCars)}
            {#if ups.length}
              <h4>Upgrade engine</h4>
              <p class="muted small">Trade in your {e.name} and keep the cars.</p>
              {#each ups as [k, x]}
                {@const locked = game.level < x.level}
                {@const cost = upgradeCost(v, k)}
                <button class="row" disabled={locked || game.coins < cost} onclick={() => upgradeEngine(v, k)}>
                  <span class="pv"><Sprite kind="train" model={k} scale={3} /></span>
                  <span class="grow"><b>{x.name}</b><small>Pulls {x.maxCars} cars. Speed <span class="pips">{#each [1, 2, 3, 4, 5] as n}<i class:on={n <= x.pips}></i>{/each}</span></small></span>
                  <span class="pay">{locked ? `Lv ${x.level}` : `$${fmt(cost)}`}</span>
                </button>
              {/each}
            {/if}
          {:else}
            <p class="muted small">Cars can be changed once it’s parked.</p>
          {/if}
        {:else if v.kind === 'boat'}
          <p class="muted small">Boats sail between ports. Bigger boats are in the Shop.</p>
        {:else}
          {@const p = PLANES[v.model]}
          <p class="muted small">{p.pax} seats and {p.cargo} cargo slots. Want more? Bigger planes are in the Shop.</p>
        {/if}

        <div class="actions">
          {#if v.city}
            <button class="btn primary" onclick={() => openLoad(v)}>Load at {cityById[v.city].name}</button>
            <button class="btn ghost" disabled={v.cargo.length > 0 || game.vehicles.length <= 1} onclick={() => sellVehicle(v)}>Sell for ${fmt(sellValue(v))}</button>
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
