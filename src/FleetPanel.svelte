<script>
  import { game, ui, dev, setDev, cityById, capacity, endRoute, addCar, removeCar, canRemoveCar, upgradeEngine, upgradeCost, sellVehicle, sellValue, resetGame, openLoad, followVehicle, etaText, fmt, stopRepeating, spec, tailSpecs, tailName, aboard, carrierOf, deckUsed, deckRoom, deckFor, finances, clock, wear, service, serviceCost, escortee, consistOf, paintOf, paintFor, isIdle, idleVehicles, quickSend, quickSendAll, startQueue, toast, brokenVehicles, sendHelp, callRoadside, calloutCost, stillNeeded, escortText } from './game.svelte.js';
  import { ENGINES, TRUCKS, BOATS, PLANES, MI, JOB_TYPES, ESCORT_LABEL } from './data.js';
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
  const bookOf = $derived(Object.fromEntries(game.vehicles.map((v, i) => [v.id, books[i]])));
  const total = $derived(books.reduce((s, b) => ({ earned: s.earned + b.earned, fuel: s.fuel + b.fuel, perHour: s.perHour + (b.perHour ?? 0) }), { earned: 0, fuel: 0, perHour: 0 }));
  // finding a vehicle: by kind, by what it's up to, and by name or town
  const KINDS = [['plane', 'Planes'], ['train', 'Trains'], ['truck', 'Trucks'], ['boat', 'Boats']];
  const STATUS = [
    ['broken', 'Broken down', (v) => !!v.broken],
    ['idle', 'Idle', isIdle],
    ['moving', 'Moving', (v) => !!v.trip],
    ['loop', 'Repeating', (v) => !!v.loop],
    ['service', 'Needs service', (v) => wear(v) >= 0.3],
  ];
  const idle = $derived(idleVehicles());
  const broken = $derived(brokenVehicles());
  // what a broken down vehicle is waiting for
  function helpText(v) {
    if (v.broken.fixAt) return 'The roadside service is on its way';
    const left = stillNeeded(v), coming = game.vehicles.some((x) => x.trip?.rescue === v.id);
    return Object.keys(left).length ? `Needs ${escortText(left)}${coming ? '. Help is on the way' : ''}` : 'Help is on the way';
  }
  const kinds = $derived(KINDS.map(([k, label]) => ({ k, label, n: game.vehicles.filter((v) => v.kind === k).length })).filter((x) => x.n));
  const statuses = $derived(STATUS.map(([k, label, test]) => ({ k, label, test, n: game.vehicles.filter(test).length })).filter((x) => x.n || ui.fleetStatus === x.k));
  const placeOf = (v) => cityById[v.city ?? v.trip?.to]?.name ?? '';
  const shown = $derived.by(() => {
    const q = ui.fleetFind.trim().toLowerCase(), test = STATUS.find(([k]) => k === ui.fleetStatus)?.[2];
    return game.vehicles.filter((v) => (!ui.fleetKind || v.kind === ui.fleetKind) && (!test || test(v))
      && (!q || [v.name, spec(v).name, placeOf(v)].some((x) => x.toLowerCase().includes(q))));
  });
  const filtered = $derived(!!(ui.fleetFind.trim() || ui.fleetKind || ui.fleetStatus));
  function clear() { ui.fleetFind = ''; ui.fleetKind = null; ui.fleetStatus = null; }

  // where a vehicle is when it isn't moving: parked in town, riding a car ferry or cargo plane, or in a convoy
  function where(v) {
    if (v.city) return v.loop ? `Repeating, waiting for jobs at ${cityById[v.city].name}` : `Parked at ${cityById[v.city].name}`;
    const e = escortee(v);
    if (e) return `Escorting ${e.name} to ${cityById[e.trip.to].name}`;
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
{#if broken.length}
  <div class="idle broken">
    <span class="grow"><b>{broken.length} broken down</b><small>Send a tow truck, police car, fire truck, tug or helper engine from a nearby town, or call the roadside service.</small></span>
    <div class="idle-btns">
      <button class="btn small" onclick={() => (ui.fleetStatus = 'broken')}>Show</button>
      <button class="btn primary small" onclick={() => broken.forEach((v) => sendHelp(v))}>Send help to all</button>
    </div>
  </div>
{/if}
{#if idle.length}
  <div class="idle">
    <span class="grow"><b>{idle.length} parked with nothing to do</b><small>Quick send loads each one with the best paying jobs it can deliver and sets off.</small></span>
    <div class="idle-btns">
      <button class="btn primary small" onclick={quickSendAll}>Quick send all</button>
      <button class="btn small" onclick={startQueue}>One by one</button>
    </div>
  </div>
{/if}

<div class="find">
  <input type="search" placeholder="Find by name or town" bind:value={ui.fleetFind} />
  {#if filtered}<button class="btn small ghost" onclick={clear}>Clear</button>{/if}
</div>
<div class="chips">
  {#if kinds.length > 1}{#each kinds as x}<button class:on={ui.fleetKind === x.k} onclick={() => (ui.fleetKind = ui.fleetKind === x.k ? null : x.k)}>{x.label} <em>{x.n}</em></button>{/each}<span class="sep"></span>{/if}
  {#each statuses as x}<button class:on={ui.fleetStatus === x.k} class:hot={x.k === 'idle' || x.k === 'service' || x.k === 'broken'} onclick={() => (ui.fleetStatus = ui.fleetStatus === x.k ? null : x.k)}>{x.label} <em>{x.n}</em></button>{/each}
</div>
{#if !shown.length}<p class="muted">No vehicles match. <button class="link" onclick={clear}>Show all</button></p>{/if}
{#each shown as v (v.id)}
  {@const open = ui.focusVehicle === v.id}
  {@const f = bookOf[v.id]}
  {@const wr = wear(v)}
  <div class="card" class:open use:reveal={open}>
    <button class="row vrow card-head" onclick={() => (ui.focusVehicle = open ? null : v.id)}>
      <span class="pv"><Sprite kind={v.kind} model={v.model} cars={consistOf(v)} scale={3} paint={paintOf(v)} /></span>
      <span class="grow">
        <b>{v.name}{#if v.broken}<span class="tag mini loss-tag">Broken down</span>{/if}{#if isIdle(v)}<span class="tag mini idle-tag">Idle</span>{/if}{#if v.loop}<span class="tag hub mini">Repeating</span>{/if}{#if f.perHour != null}<span class="tag mini" class:loss={f.perHour < 0}>{money(f.perHour)}/h</span>{/if}{#if wr >= 0.3}<span class="tag mini loss">Needs service</span>{/if}</b>
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
          <span class="grow"><b>{Math.round((v.miles ?? 0) * MI)} mi on it</b><small>{wr ? `Burns ${Math.round(wr * 100)}% more fuel with age. Service it, or sell it.${game.depots[v.city] ? ' Half price at this depot.' : ''}` : 'Running like new. Burns more fuel as the miles add up.'}</small></span>
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
                {@const nope = (e.freightOnly && c.holds === 'pax') || (e.pulls && !e.pulls.includes(k))}
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
        {:else if spec(v).superload}
          <p class="muted small">Carries one superload at a time, from a contract. Take on one in the Contracts tab, then park its escorts alongside to set off.</p>
        {:else if spec(v).escort}
          <p class="muted small">Goes along with superload convoys as a {ESCORT_LABEL[spec(v).escort]}. Park it where a superload is waiting.</p>
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

        {#if v.broken}
          <div class="row breakdown">
            <span class="grow"><b>Broken down</b><small>{helpText(v)}.</small></span>
          </div>
          {#if !v.broken.fixAt}
            <div class="actions">
              {#if Object.keys(stillNeeded(v)).length}<button class="btn primary" onclick={() => sendHelp(v)}>Send help</button>{/if}
              <button class="btn" disabled={game.coins < calloutCost(v)} onclick={() => callRoadside(v)}>Roadside service ${fmt(calloutCost(v))}</button>
            </div>
          {/if}
        {/if}
        {#if paintFor(v.kind, v.model)}
          <label class="row paint">
            <input type="checkbox" checked={!v.factoryPaint} onchange={(e) => (v.factoryPaint = !e.currentTarget.checked)} />
            <span class="grow"><b>Company colors</b><small>Untick to keep its factory paint.</small></span>
          </label>
        {/if}

        <div class="actions">
          {#if v.loop}<button class="btn ghost" onclick={() => stopRepeating(v)}>Stop repeating</button>{/if}
          {#if v.city}
            {#if isIdle(v)}<button class="btn primary" onclick={() => quickSend(v) || toast(`Nothing at ${cityById[v.city].name} that ${v.name} can take`)}>Quick send</button>{/if}
            <button class="btn" class:primary={!isIdle(v)} onclick={() => openLoad(v)}>Load at {cityById[v.city].name}</button>
            <button class="btn ghost" disabled={v.cargo.length > 0 || aboard(v).length > 0 || game.vehicles.length <= 1} onclick={() => sellVehicle(v)}>Sell for ${fmt(sellValue(v))}</button>
          {:else if escortee(v)}
            <button class="btn primary" onclick={() => followVehicle(escortee(v))}>Follow {escortee(v).name}</button>
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
  .idle { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 0 0 10px; padding: 10px 12px; background: var(--accent-soft); border-radius: var(--r); }
  .idle small { display: block; color: var(--ink-soft); font-size: 12px; }
  .idle-btns { display: flex; gap: 6px; }
  .idle-tag { background: var(--accent-soft); color: var(--ink); }
  .loss-tag { background: color-mix(in srgb, #c0392b 15%, transparent); color: #c0392b; }
  .idle.broken { background: color-mix(in srgb, #c0392b 12%, var(--panel-2)); }
  .breakdown { margin: 8px 0; border-color: #c0392b; }
  .breakdown small { display: block; }
  .find { display: flex; gap: 6px; align-items: center; margin-bottom: 6px; }
  .find input { flex: 1; min-width: 0; padding: 8px 12px; font: inherit; font-size: 14px; border: 1px solid var(--line); border-radius: 999px; background: var(--panel-2); color: var(--ink); }
  .chips { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px; }
  .chips button { padding: 4px 10px; font-size: 12px; font-weight: 500; border-radius: 999px; border: 1px solid var(--line); background: var(--panel-2); color: var(--ink-soft); cursor: pointer; }
  .chips button em { font-style: normal; opacity: .7; }
  .chips button.on { background: var(--ink); border-color: var(--ink); color: var(--panel); }
  .chips button.hot:not(.on) { border-color: var(--accent); color: var(--ink); }
  .chips .sep { width: 1px; background: var(--line); margin: 2px 2px; }
  .link { border: 0; background: none; padding: 0; color: inherit; text-decoration: underline; cursor: pointer; font: inherit; }
  .age { margin: 8px 0; }
  .paint { margin: 8px 0; cursor: pointer; }
  .paint input { width: 20px; height: 20px; flex: none; accent-color: var(--accent); }
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
