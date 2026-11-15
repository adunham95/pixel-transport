<script>
  import { game, ui, cityById, isOpen, spec, consistOf, paintOf, createRoute, deleteRoute, routeIds, renameRoute, addRouteStop, removeRouteStop, moveRouteStop, STOP_MODES, stopMode, setStopMode, routeModes, routeProblem, routeVehicles, assignRoute, stopRepeating, selectCity, routeReport, resetRouteStats, requestService, setRoutePaused, setAutoService, setRouteBack, wear, fmt, fmtTime, clock, createLine, lineFits, lineTowns, setLineColor } from '../game/game.svelte.js';
  import { CITIES, HQ, LINES, LINE_COLORS } from '../game/data.js';
  import Sprite from '../ui/Sprite.svelte';
  import Icon from '../ui/Icon.svelte';
  import NavHeader from '../ui/NavHeader.svelte';
  import { slide, fly, flip } from '../ui/motion.js';

  const MODE = { truck: 'Road', train: 'Rail', boat: 'Sea', plane: 'Air' };
  const towns = $derived(CITIES.filter((c) => isOpen(c.id) && !c.anchor).sort((a, b) => a.name.localeCompare(b.name)));
  // the route whose own screen is open. Tapping towns on the map adds them to it as stops.
  const cur = $derived(ui.routeEdit != null ? game.routes.find((r) => r.id === ui.routeEdit) : null);
  // whether the vehicles that can't run it are listed too
  let showAll = $state(false);
  $effect(() => { ui.routeEdit; showAll = false; });

  function add() { const r = createRoute(); if (r) ui.routeEdit = r.id; }
  function addLine(kind) { const r = createLine(kind); if (r) ui.routeEdit = r.id; }
  // the bus and mail line sections: shown from the level they unlock, or once there's a line
  const kinds = $derived(Object.entries(LINES).filter(([k, L]) => game.level >= L.level || game.routes.some((r) => r.line === k)));
  const plain = $derived(game.routes.filter((r) => !r.line));
  // the towns a route can add as a stop: any open town, or for a line, ones with its kind of building
  const stopTowns = (r) => (r.line ? towns.filter((c) => lineTowns(r.line).includes(c.id)) : towns);
  function status(v) {
    if (v.city) return v.trip ? '' : `Waiting at ${cityById[v.city].name}`;
    return v.trip ? `To ${cityById[v.trip.to].name}` : '';
  }
  const chain = (r) => { const ids = routeIds(r); return ids.length ? ids.map((id) => cityById[id].name).join(' → ') + (ids.length > 1 ? ' ↻' : '') : 'No stops yet'; };
  // the stops it goes back through, last to first, on a route with back set
  const backThrough = (r) => r.back ? routeIds({ ...r, back: false }).slice(1, -1).reverse() : [];
  // the last stop is the same town as the first, so it's skipped until another stop goes after it
  const loopsBack = (r, i) => i > 0 && i === r.stops.length - 1 && r.stops[i].city === r.stops[0].city;
  const visits = (r, id) => r.stops.filter((s) => s.city === id).length;
  const money = (n) => `${n < 0 ? '−' : ''}$${fmt(Math.abs(n))}`;
</script>

{#if cur && (cur.line || game.repeatRoutes)}
  {@const r = cur}
  {@const L = r.line ? LINES[r.line] : null}
  {@const runners = routeVehicles(r)}
  {@const modes = routeModes(r)}
  {@const rep = routeReport(r, clock.now)}
  {@const others = game.vehicles.filter((v) => v.loop?.route !== r.id && (L ? lineFits(v, r.line) : modes.includes(v.kind))).map((v) => ({ v, why: routeProblem(v, r) }))}
  {@const able = others.filter((o) => !o.why)}
  {@const unable = others.filter((o) => o.why)}
  <div in:fly={{ x: 28, duration: 220 }}>
  <NavHeader title={r.name} sub={chain(r)} back="Routes" onback={() => (ui.routeEdit = null)} />

  <div class="group">
    <label class="row tfield">
      <span class="lab">Name</span>
      <input value={r.name} maxlength="24" onchange={(e) => { renameRoute(r, e.currentTarget.value); e.currentTarget.value = r.name; }} onkeydown={(e) => e.key === 'Enter' && e.currentTarget.blur()} />
    </label>
    {#if L}
      <div class="row tfield">
        <span class="lab">Color</span>
        <span class="swatches" role="radiogroup" aria-label="Line color">
          {#each LINE_COLORS as [label, hex] (hex)}
            <button class="sw" class:on={r.color === hex} style:background={hex} role="radio" aria-checked={r.color === hex} aria-label={label} title={label} onclick={() => setLineColor(r, hex)}></button>
          {/each}
        </span>
      </div>
    {/if}
  </div>

  <p class="sec">How it’s doing</p>
  {#if rep}
    <div class="stats">
      <div class="stat"><small>A minute</small><b class:loss={rep.perMin != null && rep.perMin < 0}>{rep.perMin == null ? '…' : money(rep.perMin)}</b></div>
      <div class="stat"><small>A lap</small><b class:loss={rep.profit < 0}>{money(rep.profit)}</b></div>
      <div class="stat"><small>Full</small><b>{rep.full == null ? '–' : `${Math.round(rep.full * 100)}%`}</b></div>
    </div>
    <p class="gnote">Profit averaged over {rep.laps} lap{rep.laps > 1 ? 's' : ''}: earns ${fmt(rep.earned)}, fuel ${fmt(rep.fuel)}, about {fmtTime(rep.lapTime)} a lap.{#if rep.perMin != null} A minute is for {Math.max(1, runners.length)} vehicle{Math.max(1, runners.length) > 1 ? 's' : ''}.{/if} <button class="link" onclick={() => resetRouteStats(r)}>Reset</button></p>
  {:else}
    <p class="gnote">Stats show up once a vehicle runs a lap.</p>
  {/if}
  <div class="group">
    <label class="row">
      <span class="grow"><b>Running</b><small>{r.paused ? 'Paused. Vehicles park after this lap' : 'Vehicles go round on their own'}</small></span>
      <input class="switch" type="checkbox" checked={!r.paused} onchange={(e) => setRoutePaused(r, !e.currentTarget.checked)} />
    </label>
    <label class="row">
      <span class="grow"><b>Go back through the stops</b><small>{r.back ? 'At the last stop it turns round and visits them in reverse' : 'From the last stop it heads straight back to the first'}</small></span>
      <input class="switch" type="checkbox" checked={!!r.back} onchange={(e) => setRouteBack(r, e.currentTarget.checked)} />
    </label>
    <label class="row">
      <span class="grow"><b>Service worn vehicles</b><small>At the end of a lap, at a depot if cheaper</small></span>
      <input class="switch" type="checkbox" checked={!!r.autoService} onchange={(e) => setAutoService(r, e.currentTarget.checked)} />
    </label>
  </div>

  <p class="sec">Stops</p>
  {#if r.stops.length}
    <ol class="group">
      {#each r.stops as s, i (i + s.city)}
        {@const n = visits(r, s.city)}
        <li class="row rstop" class:skip={loopsBack(r, i)}>
          <span class="num">{i + 1}</span>
          <button class="town" onclick={() => selectCity(s.city, true)}>
            {cityById[s.city].name}
            {#if loopsBack(r, i)}<small>Same as stop 1, so skipped until a stop goes after it</small>{:else if n > 1}<small>Visited {n} times a lap</small>{/if}
          </button>
          <span class="move">
            <button class="ibtn" aria-label="Move {cityById[s.city].name} up" disabled={i === 0} onclick={() => moveRouteStop(r, i, -1)}><Icon name="up" size={18} /></button>
            <button class="ibtn" aria-label="Move {cityById[s.city].name} down" disabled={i === r.stops.length - 1} onclick={() => moveRouteStop(r, i, 1)}><Icon name="down" size={18} /></button>
            <button class="ibtn" aria-label="Remove {cityById[s.city].name}" onclick={() => removeRouteStop(r, i)}><Icon name="close" size={18} /></button>
          </span>
          <span class="seg small flags" role="radiogroup" aria-label="What {cityById[s.city].name} does">
            {#each STOP_MODES as [k, label, tip]}
              <button class:on={stopMode(s) === k} role="radio" aria-checked={stopMode(s) === k} title={tip} onclick={() => setStopMode(r, i, k)}>{label}</button>
            {/each}
          </span>
        </li>
      {/each}
      {#if routeIds(r).length > 1}
        <li class="row back"><span class="num">↻</span><span class="grow"><small>{backThrough(r).length ? `Back through ${backThrough(r).map((id) => cityById[id].name).join(', ')} to ${cityById[r.stops[0].city].name}, then round again` : `Back to ${cityById[r.stops[0].city].name}, then round again`}</small></span></li>
      {/if}
    </ol>
  {/if}
  <div class="group">
    <label class="row tfield">
      <span class="lab">Add a stop</span>
      <select onchange={(e) => { if (e.currentTarget.value) addRouteStop(r, e.currentTarget.value); e.currentTarget.value = ''; }}>
        <option value="">{L ? `Pick a ${L.name.toLowerCase()}, or tap its town on the map` : 'Pick a town, or tap one on the map'}</option>
        {#each stopTowns(r) as c (c.id)}<option value={c.id}>{c.name}</option>{/each}
      </select>
    </label>
  </div>
  {#if L && lineTowns(r.line).length < 2}
    <p class="gnote">A line stops at {L.name.toLowerCase()}s. Build {lineTowns(r.line).length ? 'another' : 'some'} from a town’s page to add {lineTowns(r.line).length ? 'it' : 'them'} here.</p>
  {/if}
  {#if routeIds(r).length > 1 && !modes.length}
    <div class="alert bad"><span class="ai"><Icon name="alert" size={18} /></span><p class="txt small">No single kind of vehicle can make every hop on this route.</p></div>
  {/if}
  {#if r.line === 'post'}<p class="gnote">Mail lines start every stop on <b>Transfer</b>, so letters change vans wherever two mail lines meet and can get anywhere your lines reach.</p>{/if}
  <p class="gnote">Every stop drops off jobs that end there and picks up ones for another stop. <b>Fill</b> also takes jobs headed off the route, <b>Drop off</b> leaves them for another route, and <b>Transfer</b> does both. For hub and spoke, use Fill on the spokes and Transfer on the hub.</p>

  <p class="sec">Vehicles · {runners.length}</p>
  <div class="group">
    {#each runners as v (v.id)}
      <div class="row vrow" animate:flip>
        <span class="pv"><Sprite kind={v.kind} model={v.model} cars={consistOf(v)} scale={3} paint={paintOf(v)} /></span>
        <span class="grow"><b>{v.name}{#if v.broken}<span class="status bad">Broken down</span>{:else if v.trip}<span class="status info">In transit</span>{:else if r.paused}<span class="status warn">Parked</span>{:else}<span class="status warn">Waiting</span>{/if}{#if v.loop.service}<span class="status info">Service due</span>{/if}</b><small>{status(v) || spec(v).name}{#if wear(v)} · +{Math.round(wear(v) * 100)}% fuel from wear{/if}</small></span>
        <span class="vbtns">
          {#if wear(v) || v.loop.service}<button class="btn small" class:primary={v.loop.service} title={v.loop.service ? 'Call off the service' : 'Service it at the end of this lap, at a depot if that works out cheaper'} onclick={() => requestService(v)}>{v.loop.service ? 'Cancel service' : 'Service'}</button>{/if}
          <button class="ibtn" aria-label="Take {v.name} off this route" title="Take off this route" onclick={() => stopRepeating(v)}><Icon name="close" size={18} /></button>
        </span>
      </div>
    {/each}
  </div>
  {#if !runners.length}<p class="gnote">None yet. Add one below.</p>{/if}

  {#if routeIds(r).length > 1}
    <p class="sec">Add a vehicle</p>
    <div class="group">
      {#each able as { v } (v.id)}
        <div class="row vrow" animate:flip>
          <span class="pv"><Sprite kind={v.kind} model={v.model} cars={consistOf(v)} scale={3} paint={paintOf(v)} /></span>
          <span class="grow"><b>{v.name}</b><small>{v.loop ? `On ${v.loop.route != null ? game.routes.find((x) => x.id === v.loop.route)?.name ?? 'a route' : 'a repeating loop'}. Switches after this lap` : v.city ? (r.stops.some((s) => s.city === v.city) ? `At ${cityById[v.city].name}, on the route` : `At ${cityById[v.city].name}, drives out to ${cityById[r.stops[0].city].name}`) : v.trip ? `Starts once it gets to ${cityById[v.next?.length ? v.next[v.next.length - 1].to : v.trip.to].name}` : spec(v).name}</small></span>
          <button class="btn small primary" onclick={() => assignRoute(v, r)}>Assign</button>
        </div>
      {/each}
      {#if unable.length}
        <button class="row tbtn" onclick={() => (showAll = !showAll)}>{showAll ? 'Hide' : 'Show'} {unable.length} that can’t</button>
      {/if}
      {#if showAll}
        {#each unable as { v, why } (v.id)}
          <div class="row vrow off" transition:slide={{ duration: 180 }}><span class="pv"><Sprite kind={v.kind} model={v.model} cars={consistOf(v)} scale={3} paint={paintOf(v)} /></span><span class="grow"><b>{v.name}</b><small>{why}</small></span></div>
        {/each}
      {/if}
    </div>
    {#if !able.length}<p class="gnote">{L && !others.length ? `No road vehicle you own carries ${r.line === 'bus' ? 'passengers' : 'mail'}. Buy one from the shop.` : `No vehicle can run this ${L ? 'line' : 'route'}${modes.length ? '' : ' yet'}.`}</p>{/if}
  {/if}

  <div class="group danger">
    <button class="row tbtn bad" onclick={() => deleteRoute(r)}>Delete {L ? 'line' : 'route'}{runners.length ? `, taking ${runners.length} vehicle${runners.length > 1 ? 's' : ''} off` : ''}</button>
  </div>
  </div>
{:else}
  <div class="fill" in:fly={{ x: -28, duration: 220 }}>
  {#snippet routeRow(r)}
    {@const runners = routeVehicles(r)}
    {@const rep = routeReport(r, clock.now)}
    <button class="row" onclick={() => (ui.routeEdit = r.id)}>
      <span class="ticon">{#if r.line}<i class="dot" style:background={r.color}></i>{:else}<Icon name="routes" size={18} />{/if}</span>
      <span class="grow">
        <b>{r.name}{#if !r.line}{#each routeModes(r) as m}<span class="status info">{MODE[m]}</span>{/each}{/if}{#if r.paused}<span class="status warn">Paused</span>{/if}</b>
        <small>{chain(r)}</small>
        <small>{runners.length ? `${runners.length} vehicle${runners.length > 1 ? 's' : ''}` : 'No vehicles yet'}{#if !r.paused && rep?.perMin != null} · <span class:loss={rep.perMin < 0} class:gain={rep.perMin >= 0}>{rep.perMin < 0 ? '−' : '+'}${fmt(Math.abs(rep.perMin))}/min</span>{/if}</small>
      </span>
      <span class="go"><Icon name="chevron" size={18} /></span>
    </button>
  {/snippet}
  {#each kinds as [k, L] (k)}
    {@const mine = game.routes.filter((r) => r.line === k)}
    <p class="sec">{L.line}s</p>
    <div class="group">
      {#each mine as r (r.id)}{@render routeRow(r)}{/each}
      <button class="row tbtn" onclick={() => addLine(k)}><Icon name="plus" size={16} /> New {L.line.toLowerCase()}</button>
    </div>
    {#if !mine.length}<p class="gnote">Build {L.name.toLowerCase()}s from town pages, make a line through them, then put {k === 'bus' ? 'buses' : 'mail vans'} on it. No HQ needed.</p>{/if}
  {/each}
  {#if kinds.length}<p class="sec">Routes</p>{/if}
  {#if !game.repeatRoutes}
    <div class="empty">
      <span class="eicon"><Icon name="routes" size={26} /></span>
      <b>Routes need an HQ</b>
      <p class="muted small">{game.level < HQ.level ? `Build an HQ from level ${HQ.level} to set up loops your vehicles run on their own.` : 'Build an HQ in any town, from its town page, to set up loops your vehicles run on their own.'}</p>
    </div>
  {:else if plain.length}
    <p class="gnote intro">Loops your vehicles run on their own. Tap one to edit its stops and put vehicles on it.</p>
    <div class="group">
      {#each plain as r (r.id)}{@render routeRow(r)}{/each}
    </div>
  {:else}
    <div class="empty">
      <span class="eicon"><Icon name="routes" size={26} /></span>
      <b>No routes yet</b>
      <p class="muted small">Make a loop of stops once, then put as many vehicles on it as you like.</p>
    </div>
  {/if}
  {#if game.repeatRoutes}<div class="fabwrap"><button class="fab" onclick={add}><Icon name="plus" size={20} />New route</button></div>{/if}
  </div>
{/if}

<style>
  .intro { margin: 0 4px 10px; }
  .grow b { flex-wrap: wrap; row-gap: 3px; }
  .ticon { color: var(--ink-soft); }
  /* a line's color: a dot in the list, and the swatches to pick it on its page */
  .dot { display: block; width: 14px; height: 14px; border-radius: 50%; margin: 2px; }
  .swatches { display: flex; flex-wrap: wrap; gap: 6px; justify-content: flex-end; }
  .sw { width: 22px; height: 22px; border-radius: 50%; border: 2px solid transparent; padding: 0; cursor: pointer; }
  .sw.on { border-color: var(--ink); box-shadow: 0 0 0 2px var(--bg, #fff) inset; }
  .loss { color: var(--bad); }
  .gain { color: var(--good); font-weight: 600; }
  .link { border: 0; background: none; padding: 0; font: inherit; color: var(--ink); font-weight: 600; cursor: pointer; text-decoration: underline; }
  /* a stop: number, town and arrows on top, what it does across the full width below */
  .rstop { display: grid; grid-template-columns: 24px minmax(0, 1fr) auto; column-gap: 10px; row-gap: 8px; }
  .town { grid-column: 2; grid-row: 1; align-self: center; border: 0; background: none; padding: 0; font: inherit; font-weight: 600; color: inherit; cursor: pointer; text-align: left; }
  .town small { display: block; font-weight: 400; font-size: 12px; color: var(--ink-soft); }
  .move { grid-column: 3; grid-row: 1; display: flex; gap: 0; margin-right: -6px; }
  .flags { grid-column: 1 / -1; grid-row: 2; }
  .skip { opacity: .6; }
  .back small { color: var(--ink-soft); }
  .vbtns { display: flex; align-items: center; gap: 2px; flex: none; margin-right: -6px; }
  .off { opacity: .5; }
  .danger { margin-top: 18px; }
</style>
