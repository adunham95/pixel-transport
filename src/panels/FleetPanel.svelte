<script>
  import { game, ui, cityById, capacity, endRoute, addCar, removeCar, canRemoveCar, upgradeEngine, upgradeCost, canRefit, sellVehicle, sellValue, openLoad, followVehicle, etaText, fmt, stopRepeating, spec, tailSpecs, tailName, aboard, carrierOf, deckUsed, deckRoom, deckFor, finances, clock, wear, service, serviceCost, sendToService, canSendService, depotFor, escortee, consistOf, paintOf, paintFor, isIdle, idleVehicles, quickSend, quickSendAll, startQueue, toast, brokenVehicles, sendHelp, callRoadside, calloutCost, stillNeeded, escortText, renameVehicle, escortKind, assignRoute, routeById, tripInfo } from '../game/game.svelte.js';
  import { ENGINES, TRUCKS, BOATS, PLANES, MI, JOB_TYPES, ESCORT_LABEL } from '../game/data.js';
  import Sprite from '../ui/Sprite.svelte';
  import LoadBadges from '../ui/LoadBadges.svelte';
  import Icon from '../ui/Icon.svelte';
  import Traits, { autoVerb } from '../ui/Traits.svelte';
  import NavHeader from '../ui/NavHeader.svelte';
  import { slide, fly, flip } from '../ui/motion.js';
  const LEADS = { train: ENGINES, truck: TRUCKS, boat: BOATS };
  // is the upgrade list dropped down on the vehicle screen
  let upgrading = $state(false);
  const money = (n) => `${n < 0 ? '−' : ''}$${fmt(Math.abs(n))}`;
  // the whole fleet's takings, for the summary up top
  const books = $derived(game.vehicles.map((v) => finances(v, clock.now)));
  const bookOf = $derived(Object.fromEntries(game.vehicles.map((v, i) => [v.id, books[i]])));
  const total = $derived(books.reduce((s, b) => ({ earned: s.earned + b.earned, fuel: s.fuel + b.fuel, perHour: s.perHour + (b.perHour ?? 0) }), { earned: 0, fuel: 0, perHour: 0 }));
  // the vehicle whose own screen is open, if any. Picking one here, from the map's route card or
  // after buying one all set ui.focusVehicle.
  const cur = $derived(ui.focusVehicle != null ? game.vehicles.find((v) => v.id === ui.focusVehicle) : null);
  $effect(() => { ui.focusVehicle; upgrading = false; });
  // finding a vehicle: by kind, by what it's up to, and by name or town
  const KINDS = [['plane', 'Planes'], ['train', 'Trains'], ['truck', 'Trucks'], ['boat', 'Boats']];
  const STATUS = [
    ['broken', 'Broken down', (v) => !!v.broken],
    ['idle', 'Idle', isIdle],
    ['moving', 'Moving', (v) => !!v.trip],
    ['loop', 'Repeating', (v) => !!v.loop],
    ['service', 'Needs service', (v) => wear(v) >= 0.3],
    ['auto', 'Autonomous', (v) => !!spec(v).auto],
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

  // one pill for what it's up to, most pressing first
  function statusOf(v) {
    if (v.broken) return { text: 'Broken down', c: 'bad' };
    if (v.loop) return { text: v.loop.route != null ? routeById(v.loop.route)?.name ?? 'Repeating' : 'Repeating', c: 'good' };
    if (isIdle(v)) return { text: 'Idle', c: 'warn' };
    if (v.trip) return { text: escortee(v) || v.trip.rescue != null ? 'Helping' : 'In transit', c: 'info' };
    if (!v.city) return { text: escortee(v) ? 'Escorting' : 'Aboard', c: 'info' };
    // a self-driving vehicle parked in town is only waiting for its next job to turn up
    if (spec(v).auto && game.hqAuto) return { text: 'Finding jobs', c: 'info' };
    return { text: 'Parked', c: '' };
  }
  // where a vehicle is when it isn't moving: parked in town, riding a car ferry or cargo plane, or in a convoy
  function where(v) {
    if (v.city) return v.loop ? `Repeating, waiting for jobs at ${cityById[v.city].name}` : `Parked at ${cityById[v.city].name}`;
    const e = escortee(v);
    if (e) return `Escorting ${e.name} to ${cityById[e.trip.to].name}`;
    const f = carrierOf(v);
    return f.trip ? `On ${f.name}, to ${cityById[f.trip.to].name}` : `On ${f.name} at ${cityById[f.city].name}`;
  }
  const whereNow = (v) => v.trip ? `To ${cityById[v.trip.to].name}, ${etaText(v)} left${v.next?.length ? `, then ${v.next.length} more stop${v.next.length > 1 ? 's' : ''}` : ''}` : where(v);
</script>

{#if cur}
  {@const v = cur}
  {@const f = bookOf[v.id]}
  {@const wr = wear(v)}
  {@const st = statusOf(v)}
  <div in:fly={{ x: 28, duration: 220 }}>
  <NavHeader title={v.name} sub={spec(v).name} back="Fleet" onback={() => (ui.focusVehicle = null)} />

  <!-- the vehicle itself, what it's up to and what it's carrying -->
  <div class="hero">
    <span class="pv big"><Sprite kind={v.kind} model={v.model} cars={consistOf(v)} scale={4} paint={paintOf(v)} /></span>
    <div class="hstat">
      <span class="status {st.c}">{st.text}</span>
      {#if wr >= 0.3}<span class="status warn"><Icon name="wrench" size={11} />Service</span>{/if}
      <Traits s={spec(v)} kind={v.kind} />
      {#if v.kind === 'plane'}<span class="status">Range {Math.round(PLANES[v.model].range * MI)} mi</span>{/if}
    </div>
    <small class="hwhere">{whereNow(v)}</small>
    {#if v.trip && !v.broken}<span class="prog trip"><i style:width="{tripInfo(v, clock.now).progress * 100}%"></i></span>{/if}
    <LoadBadges {v} />
  </div>

  {#if v.broken}
    <div class="alert bad">
      <span class="ai"><Icon name="alert" size={18} /></span>
      <span class="grow"><b>Broken down</b><small>{helpText(v)}.</small></span>
      {#if !v.broken.fixAt}
        <div class="btns">
          {#if Object.keys(stillNeeded(v)).length}<button class="btn primary small" onclick={() => sendHelp(v)}>Send help</button>{/if}
          <button class="btn small" disabled={game.coins < calloutCost(v)} onclick={() => callRoadside(v)}>Roadside service ${fmt(calloutCost(v))}</button>
        </div>
      {/if}
    </div>
  {/if}

  <div class="stats">
    <div class="stat"><small>Earned</small><b>{money(f.earned)}</b></div>
    <div class="stat"><small>Fuel</small><b>{money(-f.fuel)}</b></div>
    <div class="stat"><small>Profit</small><b class:loss={f.profit < 0}>{money(f.profit)}</b></div>
    <div class="stat"><small>Per hour</small><b class:loss={f.perHour < 0}>{f.perHour == null ? 'Soon' : money(f.perHour)}</b></div>
  </div>
  <div class="payback"><i style:width="{Math.min(100, Math.max(0, f.paidBack * 100))}%"></i></div>
  <p class="gnote">{f.paidBack >= 1 ? 'Paid for itself' : `Paid back ${Math.max(0, Math.floor(f.paidBack * 100))}% of what it cost`}</p>

  <h3>Condition</h3>
  <div class="group">
    <div class="row">
      <span class="grow"><b>{Math.round((v.miles ?? 0) * MI)} mi on it</b><small>{wr ? `Burns ${Math.round(wr * 100)}% more fuel with age${game.depots[v.city] ? '. Half price at this depot' : ''}` : 'Running like new'}</small></span>
      {#if wr && v.city && !v.trip}<button class="btn small" disabled={game.coins < serviceCost(v)} onclick={() => service(v)}>Service ${fmt(serviceCost(v))}</button>{/if}
    </div>
    {#if canSendService(v)}
      {@const due = v.loop ? !!v.loop.service : !!v.serviceDue}
      {@const dep = !v.trip ? depotFor(v) : null}
      {#if v.trip || v.loop || dep || due}
        <div class="row">
          <span class="grow"><small>{due ? (v.trip ? `Goes in for a service ${v.loop ? 'at the end of this lap' : 'when it stops'}, at a depot if that works out cheaper.` : 'Heading in for a service.') : dep ? `The depot at ${cityById[dep.id].name} works out cheaper, about $${fmt(dep.total)} with fuel there and back.` : v.loop ? 'Service it at the end of this lap, then it carries on the route.' : 'Service it once this trip is over, at a depot if that works out cheaper.'}</small></span>
          {#if due}
            <button class="btn small ghost" onclick={() => sendToService(v)}>Cancel</button>
          {:else if dep && !v.loop}
            <button class="btn small primary" onclick={() => sendToService(v)}>Go to {cityById[dep.id].name}</button>
          {:else}
            <button class="btn small" onclick={() => sendToService(v)}>{v.trip ? 'When it stops' : 'Send for service'}</button>
          {/if}
        </div>
      {/if}
    {/if}
  </div>
  {#if !wr}<p class="gnote">Older vehicles burn more fuel. Service them to make them like new.</p>{/if}

  {#if v.cars && spec(v).maxCars}
    {@const e = spec(v)}
    {@const tails = tailSpecs(v)}
    {@const what = tailName(v)}
    <h3>{what[0].toUpperCase() + what.slice(1)}s ({v.cars.length} of {e.maxCars})</h3>
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
        {@const shop = canRefit(v.city)}
        <div class="group up">
          <button class="row drop" class:shown={upgrading} aria-expanded={upgrading} onclick={() => (upgrading = !upgrading)}>
            <span class="grow"><b>Upgrade {v.kind === 'truck' ? 'tractor' : v.kind === 'boat' ? 'tug' : 'engine'}</b><small>{shop ? `${ups.length} option${ups.length > 1 ? 's' : ''}. Keeps the ${what}s.` : 'Only at your HQ or a depot'}</small></span>
            <span class="go"><Icon name="chevron" size={18} /></span>
          </button>
          {#if upgrading}
            {#each ups as [k, x] (k)}
              {@const locked = game.level < x.level}
              {@const cost = upgradeCost(v, k)}
              <button class="row vrow" transition:slide={{ duration: 200 }} disabled={!shop || locked || game.coins < cost} onclick={() => upgradeEngine(v, k)}>
                <span class="pv"><Sprite kind={v.kind} model={k} scale={3} /></span>
                <span class="grow"><b>{x.name}</b><small>Pulls {x.maxCars} {what}s{x.noFerry ? ', too long for ferries' : ''}. Speed <span class="pips">{#each [1, 2, 3, 4, 5] as n}<i class:on={n <= x.pips}></i>{/each}</span></small></span>
                <span class="pay">{locked ? `Lv ${x.level}` : `$${fmt(cost)}`}</span>
              </button>
            {/each}
          {/if}
        </div>
      {/if}
    {:else}
      <p class="gnote">{what[0].toUpperCase() + what.slice(1)}s can be changed once it’s parked.</p>
    {/if}
  {:else}
    <h3>About</h3>
    <p class="note">
      {#if capacity(v).tour}
        A show-off vehicle. Only tourists ride in it, {capacity(v).tour} at a time, and they pay more headed for towns with landmarks. Send it round a repeating route between the sights.
      {:else if spec(v).superload}
        Carries one superload at a time, from a contract. Take on one in the Contracts tab, then park its escorts alongside to set off.
      {:else if spec(v).escort}
        Goes along with superload convoys as a {ESCORT_LABEL[spec(v).escort]}. Park it where a superload is waiting.
      {:else if spec(v).auto}
        {autoVerb(v.kind)[0].toUpperCase() + autoVerb(v.kind).slice(1)} itself. {game.hqAuto ? `It finds jobs it can carry, ${autoVerb(v.kind)} out to pick them up and delivers them, handing on anything it can’t take all the way to your repeating routes.` : 'Buy auto dispatch at your HQ and it’ll find and carry its own jobs.'}
      {:else if v.kind === 'truck'}
        Drives the roads between mainland towns. Bigger trucks and buses are in the Shop.
      {:else if deckRoom(v)}
        {@const on = aboard(v)}
        {#if deckFor(v) === 'plane'}
          A landing strip at sea. Anchor it at an anchorage, or moor it at a port, and small and mid-size planes and helicopters can land there. {deckUsed(v)} of {deckRoom(v)} deck spaces used{on.length ? `, by ${on.map((t) => t.name).join(', ')}` : ''}. Planes that need it come aboard when it sails.
        {:else}
          Carries trucks between {v.kind === 'boat' ? 'ports' : 'airports'}: {deckUsed(v)} of {deckRoom(v)} deck spaces used{on.length ? `, by ${on.map((t) => t.name).join(', ')}` : ''}. Drive trucks on and off from the Load screen.
        {/if}
      {:else if v.kind === 'boat'}
        Boats sail between ports. Bigger boats are in the Shop.
      {:else}
        {@const cap = capacity(v)}
        Holds {JOB_TYPES.filter((t) => cap[t]).map((t) => `${cap[t]} ${t === 'pax' ? 'seats' : t}`).join(', ')}. Want more? Bigger {v.kind}s are in the Shop.
      {/if}
    </p>
  {/if}

  <h3>Settings</h3>
  <div class="group">
    <label class="row tfield">
      <span class="lab">Name</span>
      <input value={v.name} maxlength="24" placeholder={spec(v).name} onchange={(e) => { renameVehicle(v, e.currentTarget.value); e.currentTarget.value = v.name; }} onkeydown={(e) => e.key === 'Enter' && e.currentTarget.blur()} />
    </label>
    {#if game.routes.length && !escortKind(v) && !spec(v).superload && v.aboard == null}
      <label class="row tfield">
        <span class="lab">Route</span>
        <select value={v.loop?.route ?? ''} onchange={(e) => { const r = routeById(Number(e.currentTarget.value)); if (r) assignRoute(v, r); else stopRepeating(v); e.currentTarget.value = v.loop?.route ?? ''; }}>
          <option value="">{v.loop && v.loop.route == null ? 'Its own repeating loop' : 'None'}</option>
          {#each game.routes as r (r.id)}<option value={r.id}>{r.name}</option>{/each}
        </select>
      </label>
    {/if}
    {#if paintFor(v.kind, v.model)}
      <label class="row field">
        <span class="grow"><b>Company colors</b><small>Off keeps its factory paint</small></span>
        <input class="switch" type="checkbox" checked={!v.factoryPaint} onchange={(e) => (v.factoryPaint = !e.currentTarget.checked)} />
      </label>
    {/if}
  </div>

  <!-- things that end what it's doing, or let it go, kept apart from everyday actions -->
  {#if v.loop || v.city || (v.trip && v.next?.length && !v.loop)}
    <div class="group quiet">
      {#if v.loop}<button class="row tbtn" onclick={() => stopRepeating(v)}>Stop repeating</button>{/if}
      {#if !v.city && v.trip && v.next?.length && !v.loop}<button class="row tbtn" onclick={() => endRoute(v)}>End route at {cityById[v.trip.to].name}</button>{/if}
      {#if v.city}<button class="row tbtn bad" disabled={v.cargo.length > 0 || aboard(v).length > 0 || game.vehicles.length <= 1} onclick={() => sellVehicle(v)}>Sell for ${fmt(sellValue(v))}</button>{/if}
    </div>
  {/if}

  <div class="footer">
    {#if v.city}
      {#if isIdle(v)}<button class="btn primary" onclick={() => quickSend(v) || toast(`Nothing at ${cityById[v.city].name} that ${v.name} can take`)}>Quick send</button>{/if}
      <button class="btn" class:primary={!isIdle(v)} onclick={() => openLoad(v)}>{escortKind(v) ? 'Move' : 'Load'} at {cityById[v.city].name}</button>
    {:else if escortee(v)}
      <button class="btn primary" onclick={() => followVehicle(escortee(v))}>Follow {escortee(v).name}</button>
    {:else if !v.trip}
      {@const c = carrierOf(v)}
      {#if c.trip}<button class="btn primary" onclick={() => followVehicle(c)}>Follow {c.name}</button>
      {:else}<button class="btn primary" onclick={() => openLoad(c)}>{v.kind === 'plane' ? 'Launch' : 'Drive off'} at {cityById[c.city].name}</button>{/if}
    {:else}
      <button class="btn primary" onclick={() => followVehicle(v)}>Follow on map</button>
    {/if}
  </div>
  </div>
{:else}
  <div in:fly={{ x: -28, duration: 220 }}>
  <div class="stats">
    <div class="stat"><small>Earned</small><b>{money(total.earned)}</b></div>
    <div class="stat"><small>Fuel</small><b>{money(-total.fuel)}</b></div>
    <div class="stat"><small>Profit</small><b class:loss={total.earned < total.fuel}>{money(total.earned - total.fuel)}</b></div>
    <div class="stat"><small>Per hour</small><b class:loss={total.perHour < 0}>{money(total.perHour)}</b></div>
  </div>
  {#if broken.length}
    <div class="alert bad">
      <span class="ai"><Icon name="alert" size={18} /></span>
      <span class="grow"><b>{broken.length} broken down</b><small>Send a tow truck, police car, fire truck, tug or helper engine from a nearby town, or call the roadside service.</small></span>
      <div class="btns">
        <button class="btn small" onclick={() => (ui.fleetStatus = 'broken')}>Show</button>
        <button class="btn primary small" onclick={() => broken.forEach((v) => sendHelp(v))}>Send help to all</button>
      </div>
    </div>
  {/if}
  {#if idle.length}
    <div class="alert">
      <span class="ai"><Icon name="pause" size={18} /></span>
      <span class="grow"><b>{idle.length} parked with nothing to do</b><small>Quick send loads each one with the best paying jobs it can deliver and sets off.</small></span>
      <div class="btns">
        <button class="btn primary small" onclick={quickSendAll}>Quick send all</button>
        <button class="btn small" onclick={startQueue}>One by one</button>
      </div>
    </div>
  {/if}

  <div class="find">
    <span class="sicon"><Icon name="search" size={15} /></span>
    <input type="search" placeholder="Find by name or town" bind:value={ui.fleetFind} />
    {#if filtered}<button class="btn small ghost" onclick={clear}>Clear</button>{/if}
  </div>
  <div class="fchips">
    <button class:on={!ui.fleetKind && !ui.fleetStatus} onclick={() => { ui.fleetKind = null; ui.fleetStatus = null; }}>All <em>{game.vehicles.length}</em></button>
    {#if kinds.length > 1}{#each kinds as x}<button class:on={ui.fleetKind === x.k} onclick={() => (ui.fleetKind = ui.fleetKind === x.k ? null : x.k)}>{x.label} <em>{x.n}</em></button>{/each}{/if}
    {#each statuses as x}<button class:on={ui.fleetStatus === x.k} onclick={() => (ui.fleetStatus = ui.fleetStatus === x.k ? null : x.k)}>{x.label} <em>{x.n}</em></button>{/each}
  </div>
  {#if !shown.length}<p class="muted">No vehicles match. <button class="link" onclick={clear}>Show all</button></p>{/if}
  <div class="group">
    {#each shown as v (v.id)}
      {@const f = bookOf[v.id]}
      {@const st = statusOf(v)}
      <button class="row vrow" animate:flip onclick={() => (ui.focusVehicle = v.id)}>
        <span class="pv"><Sprite kind={v.kind} model={v.model} cars={consistOf(v)} scale={3} paint={paintOf(v)} /></span>
        <span class="grow">
          <b><span class="vname">{v.name}</span><span class="status {st.c}">{st.text}</span><Traits s={spec(v)} kind={v.kind} />{#if wear(v) >= 0.3}<span class="status warn"><Icon name="wrench" size={11} />Service</span>{/if}</b>
          <small>{whereNow(v)}</small>
          {#if v.trip && !v.broken}<span class="prog trip"><i style:width="{tripInfo(v, clock.now).progress * 100}%"></i></span>{/if}
          <LoadBadges {v} />
        </span>
        {#if f.perHour != null}<span class="ph" class:loss={f.perHour < 0}>{money(f.perHour)}<small>/h</small></span>{/if}
        <span class="go"><Icon name="chevron" size={18} /></span>
      </button>
    {/each}
  </div>
  </div>
{/if}

<style>
  .find { position: relative; display: flex; gap: 6px; align-items: center; margin-bottom: 8px; }
  .find .sicon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); display: flex; color: var(--ink-soft); pointer-events: none; }
  .find input { flex: 1; min-width: 0; padding: 9px 12px 9px 34px; font: inherit; font-size: 14px; border: 1px solid var(--line); border-radius: 999px; background: var(--panel-2); color: var(--ink); }
  .vname { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .vrow .grow b { flex-wrap: wrap; row-gap: 3px; }
  .prog.trip { margin: 3px 0 1px; max-width: 220px; }
  .ph { display: flex; align-items: baseline; flex: none; font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; }
  .ph small { font-size: 11px; font-weight: 500; color: var(--ink-soft); }
  .link { border: 0; background: none; padding: 0; color: inherit; text-decoration: underline; cursor: pointer; font: inherit; }
  .loss { color: var(--bad); }

  /* the vehicle screen */
  .hero { display: flex; flex-direction: column; align-items: center; gap: 6px; margin: 2px 0 12px; text-align: center; }
  .pv.big { width: auto; min-width: 140px; max-width: 100%; height: 76px; padding: 0 16px; border-radius: 14px; }
  .hstat { display: flex; flex-wrap: wrap; justify-content: center; gap: 5px; }
  .hwhere { font-size: 13px; color: var(--ink-soft); }
  .hero .prog.trip { width: 100%; max-width: 240px; }
  .hero :global(.meters) { justify-content: center; }
  .payback { height: 5px; margin: 0 2px 8px; background: var(--panel-3); border-radius: 3px; overflow: hidden; }
  .payback i { display: block; height: 100%; background: var(--accent); border-radius: 3px; }
  .up { margin-top: 10px; }
  .drop .go { transition: transform .2s; }
  .drop.shown .go { transform: rotate(90deg); }
  /* a setting with a switch on the end */
  .field { cursor: pointer; }
  .quiet { margin-top: 18px; }
</style>
