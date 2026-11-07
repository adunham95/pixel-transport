<script>
  import { game, ui, cityById, isOpen, spec, consistOf, paintOf, createRoute, deleteRoute, renameRoute, addRouteStop, removeRouteStop, moveRouteStop, STOP_MODES, stopMode, setStopMode, routeModes, routeProblem, routeVehicles, assignRoute, stopRepeating, selectCity } from '../game/game.svelte.js';
  import { CITIES, HQ } from '../game/data.js';
  import Sprite from '../ui/Sprite.svelte';
  import Icon from '../ui/Icon.svelte';
  import { slide, fly } from '../ui/motion.js';

  const MODE = { truck: 'Road', train: 'Rail', boat: 'Sea', plane: 'Air' };
  const towns = $derived(CITIES.filter((c) => isOpen(c.id) && !c.anchor).sort((a, b) => a.name.localeCompare(b.name)));
  // vehicles not on a route yet that could run it, and how many more can't
  let showAll = $state(false);

  function add() {
    const r = createRoute();
    if (r) { ui.routeEdit = r.id; showAll = false; }
  }
  function open(r) {
    ui.routeEdit = ui.routeEdit === r.id ? null : r.id;
    showAll = false;
  }
  function status(v) {
    if (v.city) return v.trip ? '' : `Waiting at ${cityById[v.city].name}`;
    return v.trip ? `To ${cityById[v.trip.to].name}` : '';
  }
  const chain = (r) => (r.stops.length ? r.stops.map((s) => cityById[s.city].name).join(' → ') + (r.stops.length > 1 ? ' ↻' : '') : 'No stops yet');
</script>

{#if !game.repeatRoutes}
  <p class="muted">{game.level < HQ.level ? `Build an HQ from level ${HQ.level} to set up routes.` : 'Build an HQ in any town, from its town page, to set up routes.'}</p>
{:else}
  <p class="muted small intro">Set up a loop of stops, then put vehicles on it. Every stop drops off jobs that end there and picks up ones going to another stop on the route. <b>Fill</b> also picks up jobs headed off the route, <b>Drop off</b> leaves them for another route to carry on, and <b>Transfer</b> does both. For a hub and spoke, put <b>Fill</b> on the spokes and <b>Transfer</b> on the hub.</p>

  {#each game.routes as r (r.id)}
    {@const on = ui.routeEdit === r.id}
    {@const runners = routeVehicles(r)}
    {@const modes = routeModes(r)}
    <div class="card" class:open={on} in:fly={{ y: -8, duration: 200 }}>
      <button class="row card-head" onclick={() => open(r)}>
        <span class="grow">
          <b>{r.name}{#each modes as m}<span class="status info">{MODE[m]}</span>{/each}{#if runners.length}<span class="status good">{runners.length} vehicle{runners.length > 1 ? 's' : ''}</span>{/if}</b>
          <small>{chain(r)}</small>
        </span>
        <span class="chev">+</span>
      </button>
      {#if on}
        {@const others = game.vehicles.filter((v) => v.loop?.route !== r.id && modes.includes(v.kind)).map((v) => ({ v, why: routeProblem(v, r) }))}
        {@const able = others.filter((o) => !o.why)}
        {@const unable = others.filter((o) => o.why)}
        <div class="card-body" transition:slide={{ duration: 220 }}>
          <label class="name">
            <small>Name</small>
            <input value={r.name} maxlength="24" onchange={(e) => { renameRoute(r, e.currentTarget.value); e.currentTarget.value = r.name; }} onkeydown={(e) => e.key === 'Enter' && e.currentTarget.blur()} />
          </label>

          <h4 class="sec">Stops</h4>
          {#if r.stops.length}
            <ol class="stops">
              {#each r.stops as s, i (i + s.city)}
                <li class="row stop rstop">
                  <span class="num">{i + 1}</span>
                  <span class="grow">
                    <button class="town" onclick={() => selectCity(s.city, true)}>{cityById[s.city].name}</button>
                    <span class="flags" role="radiogroup" aria-label="What {cityById[s.city].name} does">
                      {#each STOP_MODES as [k, label]}
                        <button class="flag" class:on={stopMode(s) === k} role="radio" aria-checked={stopMode(s) === k} onclick={() => setStopMode(r, i, k)}>{label}</button>
                      {/each}
                    </span>
                  </span>
                  <span class="move">
                    <button class="x" aria-label="Move up" disabled={i === 0} onclick={() => moveRouteStop(r, i, -1)}>↑</button>
                    <button class="x" aria-label="Move down" disabled={i === r.stops.length - 1} onclick={() => moveRouteStop(r, i, 1)}>↓</button>
                    <button class="x" aria-label="Remove {cityById[s.city].name}" onclick={() => removeRouteStop(r, i)}>×</button>
                  </span>
                </li>
              {/each}
              {#if r.stops.length > 1}
                <li class="row stop back"><span class="num">↻</span><span class="grow"><small>Back to {cityById[r.stops[0].city].name}, then round again</small></span></li>
              {/if}
            </ol>
          {/if}
          <div class="addstop">
            <select onchange={(e) => { if (e.currentTarget.value) addRouteStop(r, e.currentTarget.value); e.currentTarget.value = ''; }}>
              <option value="">Add a stop…</option>
              {#each towns as c (c.id)}<option value={c.id}>{c.name}</option>{/each}
            </select>
            <small class="muted">or tap towns on the map</small>
          </div>
          {#if r.stops.length > 1 && !modes.length}<p class="warn small">No single kind of vehicle can make every hop on this route.</p>{/if}

          <h4 class="sec">Vehicles on this route</h4>
          {#each runners as v (v.id)}
            <div class="row vrow">
              <span class="pv"><Sprite kind={v.kind} model={v.model} cars={consistOf(v)} scale={3} paint={paintOf(v)} /></span>
              <span class="grow"><b>{v.name}{#if v.broken}<span class="status bad">Broken down</span>{:else if v.trip}<span class="status info">In transit</span>{:else}<span class="status warn">Waiting</span>{/if}</b><small>{status(v) || spec(v).name}</small></span>
              <button class="btn small ghost" onclick={() => stopRepeating(v)}>Take off</button>
            </div>
          {:else}
            <p class="muted small">None yet.</p>
          {/each}

          {#if r.stops.length > 1}
            <h4 class="sec">Add a vehicle</h4>
            {#each able as { v } (v.id)}
              <div class="row vrow">
                <span class="pv"><Sprite kind={v.kind} model={v.model} cars={consistOf(v)} scale={3} paint={paintOf(v)} /></span>
                <span class="grow"><b>{v.name}</b><small>{v.loop ? `On ${v.loop.route != null ? game.routes.find((x) => x.id === v.loop.route)?.name ?? 'a route' : 'a repeating loop'}. Switches after this lap` : v.city ? (r.stops.some((s) => s.city === v.city) ? `At ${cityById[v.city].name}, on the route` : `At ${cityById[v.city].name}, drives out to ${cityById[r.stops[0].city].name}`) : v.trip ? `Starts once it gets to ${cityById[v.next?.length ? v.next[v.next.length - 1].to : v.trip.to].name}` : spec(v).name}</small></span>
                <button class="btn small primary" onclick={() => assignRoute(v, r)}>Assign</button>
              </div>
            {:else}
              <p class="muted small">No vehicle can run this route{modes.length ? '' : ' yet'}.</p>
            {/each}
            {#if unable.length}
              <button class="btn small ghost" onclick={() => (showAll = !showAll)}>{showAll ? 'Hide' : 'Show'} {unable.length} that can’t</button>
              {#if showAll}
                {#each unable as { v, why } (v.id)}
                  <div class="row vrow off"><span class="pv"><Sprite kind={v.kind} model={v.model} cars={consistOf(v)} scale={3} paint={paintOf(v)} /></span><span class="grow"><b>{v.name}</b><small>{why}</small></span></div>
                {/each}
              {/if}
            {/if}
          {/if}

          <div class="actions">
            <button class="btn ghost" onclick={() => deleteRoute(r)}>Delete route{runners.length ? ` (stops ${runners.length})` : ''}</button>
          </div>
        </div>
      {/if}
    </div>
  {:else}
    <div class="empty">
      <span class="eicon"><Icon name="routes" size={26} /></span>
      <b>No routes yet</b>
      <p class="muted small">Make a loop of stops once, then put as many vehicles on it as you like.</p>
    </div>
  {/each}

  <button class="btn primary new" onclick={add}><Icon name="plus" size={15} /> New route</button>
{/if}

<style>
  .intro { margin: 0 0 10px; }
  .new { width: 100%; margin-top: 6px; display: flex; align-items: center; justify-content: center; gap: 6px; }
  .card-head .grow b { flex-wrap: wrap; row-gap: 3px; }
  .empty { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 22px 16px 10px; text-align: center; }
  .empty p { margin: 0; max-width: 280px; }
  .eicon { display: grid; place-items: center; width: 52px; height: 52px; margin-bottom: 6px; border-radius: 14px; background: var(--panel-2); border: 1px solid var(--line); box-shadow: var(--shadow); color: var(--ink-soft); }
  .name { display: flex; align-items: center; gap: 8px; margin: 0 0 4px; }
  .name small { color: var(--ink-soft); font-size: 12px; }
  .name input, .addstop select { flex: 1; min-width: 0; padding: 6px 10px; font: inherit; font-size: 14px; border: 1px solid var(--line); border-radius: 8px; background: var(--panel-2); color: var(--ink); }
  .name input { font-weight: 600; }
  .addstop { display: flex; align-items: center; gap: 8px; }
  .addstop small { font-size: 12px; white-space: nowrap; }
  .town { border: 0; background: none; padding: 0; font: inherit; font-weight: 600; color: inherit; cursor: pointer; display: block; text-align: left; }
  /* number, town and arrows on top, what it does across the full width below */
  .rstop { display: grid; grid-template-columns: 24px minmax(0, 1fr) auto; column-gap: 10px; row-gap: 8px; }
  .rstop .grow { display: contents; }
  .rstop .town { grid-column: 2; grid-row: 1; align-self: center; }
  .rstop .move { grid-column: 3; grid-row: 1; }
  .flags { grid-column: 1 / -1; grid-row: 2; display: grid; grid-template-columns: repeat(4, 1fr); gap: 3px; padding: 3px; background: var(--panel-3); border-radius: 10px; }
  .flags .flag { border: 0; background: transparent; padding: 5px 2px; border-radius: 7px; white-space: nowrap; }
  .flags .flag.on { box-shadow: var(--shadow); }
  .flag { padding: 2px 9px; font-size: 12px; font-weight: 500; border-radius: 999px; border: 1px solid var(--line); background: var(--panel-3); color: var(--ink-soft); cursor: pointer; }
  .flag.on { background: var(--accent); border-color: var(--accent); color: var(--accent-ink); }
  .move { display: flex; gap: 4px; }
  .move .x:disabled { opacity: .35; cursor: default; }
  .back { box-shadow: none; background: transparent; }
  .off { opacity: .5; box-shadow: none; }
  .warn { color: var(--bad); }
</style>
