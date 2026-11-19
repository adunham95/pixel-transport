<script>
  import { game, ui, cityById, capacity, used, loadJob, unloadJob, autoLoad, destinations, dispatch, route, canReach, planLegs, autoPlan, toggleStop, fmt, fmtTime, aboard, canBoard, fitsAboard, deckFor, deckSize, deckUsed, deckRoom, driveOn, driveOff, wear, fetcher, convoyNeeds, pickEscorts, escortText, consistOf, optionalEscort, paintOf, spec, nextInQueue, queueLeft, escortAs, escortKind, superloadCarrier, SUPER_KIND, viaBoost, continueRoute, abandonRoute, loadFor, addStopFor } from '../game/game.svelte.js';
  import { prefs, setHoldStops } from '../ui/prefs.svelte.js';
  import Icon from '../ui/Icon.svelte';
  import Sprite from '../ui/Sprite.svelte';
  import JobRow from '../ui/JobRow.svelte';
  import NavHeader from '../ui/NavHeader.svelte';
  import { send, receive, flip, fly } from '../ui/motion.js';
  import { TYPE_LABEL, JOB_TYPES, ENGINES, TRUCKS, HQ, ESCORT_LABEL, SECURE, WEATHER } from '../game/data.js';
  let { v } = $props();
  const cap = $derived(capacity(v));
  const u = $derived(used(v));
  const city = $derived(cityById[v.city]);
  const score = (j) => (canReach(v, j.to) ? j.pay * 2 : j.pay);
  const waiting = $derived([...(game.jobs[v.city] ?? [])].sort((a, b) => score(b) - score(a)));
  // narrowing the waiting list to one kind of job (mail, wide loads…), with how many of each are
  // here. The filter lets go by itself once the last job of that kind is gone.
  let onlyType = $state(null);
  const kinds = $derived(JOB_TYPES.map((t) => ({ t, n: waiting.filter((j) => j.type === t).length })).filter((k) => k.n));
  const only = $derived(kinds.some((k) => k.t === onlyType) ? onlyType : null);
  const shown = $derived(only ? waiting.filter((j) => j.type === only) : waiting);

  // route planning
  const stops = $derived(ui.plan);
  const legs = $derived(planLegs(v, stops));
  const last = $derived(ui.plan.length ? ui.plan[ui.plan.length - 1] : v.city);
  // a superload's convoy: the escorts it needs, which are parked here, and their fuel for the route
  const needs = $derived(convoyNeeds(v));
  const convoy = $derived(pickEscorts(v));
  // an armored car can take a police car along if one's parked here, and valuables pay more for it
  const optKind = $derived(v.kind === 'truck' ? TRUCKS[v.model].escortedBy ?? null : null);
  const sidekick = $derived(optKind ? optionalEscort(v) : null);
  const riding = $derived(ui.escort && sidekick ? [sidekick] : []);
  const boost = (j) => (spec(v).pays?.[j.type] ?? 1) * (j.type === 'secure' && riding.length ? 1 + SECURE.escortBonus : 1) * viaBoost(j, v.kind);
  const escFuel = $derived([...convoy.picked, ...riding].reduce((s, x) => s + planLegs(x, stops).reduce((a, l) => a + (l?.cost ?? 0), 0), 0));
  const total = $derived(legs.reduce((s, l) => ({ cost: s.cost + (l?.cost ?? 0), time: s.time + (l?.time ?? 0) }), { cost: escFuel, time: 0 }));
  const broken = $derived(legs.some((l) => !l));
  // stopping at each town pays for one leg at a time, so only the first is due now
  const holding = $derived(prefs.holdStops && ui.plan.length > 1);
  const due = $derived(holding ? (legs[0]?.cost ?? 0) + [...convoy.picked, ...riding].reduce((s, x) => s + (planLegs(x, [stops[0]])[0]?.cost ?? 0), 0) : total.cost);
  // parked partway along a route that stops at each town: where it goes next, and its fuel there
  const heldNext = $derived(v.held ? v.held.stops[0] : null);
  const heldLeg = $derived(heldNext ? planLegs(v, [heldNext])[0] : null);
  // what this route makes: drop off pay against fuel
  const pay = $derived(drops.reduce((s, d) => s + d.pay, 0));
  // what gets dropped where: cargo leaves at the first planned stop that matches
  const drops = $derived.by(() => {
    const out = ui.plan.map(() => ({ n: 0, pay: 0 }));
    for (const j of v.cargo) {
      const i = ui.plan.indexOf(j.to);
      if (i >= 0) { out[i].n++; out[i].pay += Math.round(j.pay * boost(j)); }
    }
    return out;
  });
  const routed = $derived(new Set(ui.plan));
  const dests = $derived(
    destinations(v, last)
      .map((r) => {
        const on = routed.has(r.to) ? [] : v.cargo.filter((j) => j.to === r.to);
        return { ...r, n: on.length, pay: on.reduce((s, j) => s + j.pay, 0) };
      })
      .sort((a, b) => a.len - b.len)
  );
  const unrouted = $derived(v.cargo.filter((j) => !routed.has(j.to) && canReach(v, j.to)).length);

  const NEEDS = { pax: 'passenger car', cargo: 'boxcar', container: 'container flatcar', fuel: 'tanker', bulk: 'hopper car', mail: 'mail car', wide: 'flatcar', secure: 'vault car' };
  const TRAILER_NEEDS = { cargo: 'van trailer', container: 'container chassis', fuel: 'tank trailer', bulk: 'dump trailer', wide: 'lowboy trailer' };
  function blocker(j) {
    const f = fetcher(j);
    if (f) return { block: true, text: `${f.name} is on its way for it` };
    if (j.escort) {
      if (v.kind !== SUPER_KIND[j.by ?? 'road'] || !spec(v).superload) return { block: true, text: `Goes by ${j.by ?? 'road'}, on a ${superloadCarrier(j.by)}` };
      if (v.cargo.some((x) => x.escort)) return { block: true, text: 'Already carrying a superload' };
      return { block: false, text: '' };
    }
    if (spec(v).superload) return { block: true, text: `A ${spec(v).name} only carries superloads` };
    if (j.celeb && !spec(v).celebrity) return { block: true, text: `${j.celeb} only rides in a gold limo or gold jet` };
    if (!cap[j.type]) {
      const what = TYPE_LABEL[j.type].toLowerCase();
      if (j.type === 'tour') return { block: true, text: 'Tourists only ride in show-off vehicles' };
      if (j.type === 'wide' && v.kind !== 'truck' && v.kind !== 'train') return { block: true, text: 'Wide loads only go overland, on a lowboy trailer or flatcar' };
      if (j.type === 'container' && v.kind === 'plane') return { block: true, text: 'Containers don’t fly. They go by truck, train or ship' };
      if (j.type === 'mail' && v.kind === 'truck') return { block: true, text: 'Mail needs a mail van' };
      if (j.type === 'secure' && v.kind === 'truck') return { block: true, text: 'Valuables need an armored car' };
      if (v.kind === 'plane') return { block: true, text: `No room for ${what} on this plane` };
      if (v.kind === 'boat') return { block: true, text: `No room for ${what} on this boat` };
      if (v.kind === 'truck') {
        if (j.type === 'pax') return { block: true, text: 'Passengers need a bus' };
        return { block: true, text: TRUCKS[v.model].maxCars ? `Needs a ${TRAILER_NEEDS[j.type]}` : `No room for ${what} in this truck` };
      }
      if (j.type === 'pax' && ENGINES[v.model].freightOnly) return { block: true, text: 'Freight trains don’t carry passengers' };
      return { block: true, text: `Needs a ${NEEDS[j.type]}` };
    }
    if (u[j.type] >= cap[j.type]) return { block: true, text: 'No room left' };
    if (!canReach(v, j.to)) return { block: false, text: 'Needs a transfer' };
    if (!route(v, j.to)) return { block: false, text: 'Needs fuel stops on the way' };
    return { block: false, text: '' };
  }
  // car ferries and cargo planes carry trucks, carriers carry planes: what's on the deck, and
  // what's parked here that could come aboard
  const deck = $derived(deckRoom(v));
  const rides = $derived(deck ? deckFor(v) : null);
  const onDeck = $derived(deck ? aboard(v) : []);
  const ashore = $derived(deck ? game.vehicles.filter((t) => t.kind === rides && t.city === v.city) : []);
  const WORDS = { truck: { on: 'Drive on', off: 'Drive off', big: 'Too long to carry', none: 'trucks', aboard: 'drive it aboard' }, plane: { on: 'Take aboard', off: 'Launch', big: 'Too big for a carrier', none: 'planes', aboard: 'take it aboard' } };
  const w = $derived(WORDS[rides ?? 'truck']);
  function plan() { ui.plan = autoPlan(v); ui.picking = true; }
  // ---------- the Cargo tab: everything grouped by where it's going ----------
  // what's on board, one group per town it's for, with whether the route stops there yet
  const board = $derived.by(() => {
    const m = new Map();
    for (const j of v.cargo) {
      const g = m.get(j.to) ?? { to: j.to, jobs: [], pay: 0 };
      g.jobs.push(j); g.pay += Math.round(j.pay * boost(j));
      m.set(j.to, g);
    }
    return [...m.values()].map((g) => ({ ...g, stop: ui.plan.indexOf(g.jobs[0].hop ?? g.to), reach: canReach(v, g.jobs[0].hop ?? g.to) })).sort((a, b) => b.pay - a.pay);
  });
  const haveFor = $derived(Object.fromEntries(board.map((g) => [g.to, g.jobs.length])));
  // what's waiting here, one group per town. Towns it's already going to come first, so it's easy
  // to top up a trip with more for the same place.
  const waitGroups = $derived.by(() => {
    const m = new Map();
    for (const j of shown) {
      const g = m.get(j.to) ?? { to: j.to, jobs: [], pay: 0, types: [] };
      g.jobs.push(j); g.pay += j.pay;
      if (!g.types.includes(j.type)) g.types.push(j.type);
      m.set(j.to, g);
    }
    const going = (g) => (g.have || g.stop >= 0 ? 1 : 0);
    return [...m.values()]
      .map((g) => {
        const ok = g.jobs.filter((j) => !blocker(j).block);
        return { ...g, ok, why: ok.length ? '' : blocker(g.jobs[0]).text, have: haveFor[g.to] ?? 0, stop: ui.plan.indexOf(g.to), reach: canReach(v, g.to) };
      })
      .sort((a, b) => going(b) - going(a) || (b.ok.length && b.reach ? 1 : 0) - (a.ok.length && a.reach ? 1 : 0) || b.pay - a.pay);
  });
  // groups opened up to show their single jobs, by 'b:town' (on board) or 'w:town' (waiting)
  let expanded = $state({});
  const flip1 = (k) => (expanded[k] = !expanded[k]);
  // one tap: load all that fit for that town, and put it on the route
  // (out of reach, it needs a transfer: that's worth choosing job by job, so it opens up instead)
  function loadGroup(g) {
    if (!g.reach) { flip1(`w:${g.to}`); return; }
    if (loadFor(v, g.to, only)) addStopFor(v, g.to);
  }
  function routeTo(id) { addStopFor(v, id); }
  const setTab = (route) => { if (route && !ui.plan.length && v.cargo.length) ui.plan = autoPlan(v); ui.picking = route; };
  // escorts skip the load screen, so backing out of their route leaves them altogether
  function back() {
    ui.picking = false; ui.plan = [];
    if (escortKind(v)) ui.activeVehicle = null;
  }
  // switching between loading and planning is a new screen, so it starts at the top
  // (not on the first run, so the nav header can note where the town page was scrolled to)
  let headEl, first = true;
  $effect(() => {
    ui.picking;
    if (first) { first = false; return; }
    headEl?.closest('.body')?.scrollTo(0, 0);
  });
  function carryOn() {
    if (!continueRoute(v)) return;
    ui.picking = false; ui.activeVehicle = null; ui.plan = [];
    nextInQueue();
  }
  function leave() { ui.activeVehicle = null; ui.picking = false; ui.plan = []; ui.queue = null; }
  function go() {
    if (!dispatch(v, ui.plan, { escort: riding.length > 0, hold: prefs.holdStops })) return;
    ui.picking = false; ui.activeVehicle = null; ui.plan = [];
    nextInQueue();
  }
</script>

<!-- loading and planning are two tabs of one screen; back goes to the town -->
<NavHeader title={v.name} sub={v.held ? `At ${city.name} › ${v.held.stops.map((id) => cityById[id].name).join(' › ')}` : ui.picking ? `Planning a route from ${city.name}` : `Loading at ${city.name}`}
  back={city.name}
  onback={escortKind(v) ? back : leave} />
{#if ui.queue}
  <div class="queue">
    <span class="grow"><b>Sending idle vehicles</b><small>{queueLeft() ? `${queueLeft()} more after this one` : 'Last one'}</small></span>
    <button class="btn small" onclick={() => nextInQueue(v.id)}>Skip</button>
    <button class="btn small ghost" onclick={() => (ui.queue = null)}>Stop</button>
  </div>
{/if}
<div class="top" bind:this={headEl}>
  <div class="loadhead">
    <span class="pv wide"><Sprite kind={v.kind} model={v.model} cars={consistOf(v)} scale={3} paint={paintOf(v)} /></span>
    <div class="meters">
      {#each JOB_TYPES as t}
        {#if cap[t]}<span class="meter t-{t}" class:full={u[t] >= cap[t]}><Icon name={t} size={14} />{u[t]}/{cap[t]}</span>{/if}
      {/each}
    </div>
  </div>
  {#if !escortKind(v)}
    <div class="seg" role="tablist" aria-label="Loading or route">
      <button role="tab" aria-selected={!ui.picking} class:on={!ui.picking} onclick={() => setTab(false)}><Icon name="cargo" size={16} />Cargo{#if v.cargo.length}<em>{v.cargo.length}</em>{/if}</button>
      <button role="tab" aria-selected={ui.picking} class:on={ui.picking} onclick={() => setTab(true)}><Icon name="routes" size={16} />Route{#if ui.plan.length}<em>{ui.plan.length}</em>{/if}</button>
    </div>
  {/if}
</div>
{#if Object.keys(needs).length}
  <div class="convoy" class:ready={!convoy.missing.length}>
    <b>Superload convoy</b>
    <small>{convoy.missing.length ? `Needs ${escortText(Object.fromEntries(convoy.missing))} more parked at ${city.name} to set off.` : `Ready. ${escortText(needs)} will go along${ui.plan.length ? `, $${fmt(escFuel)} of fuel` : ''}.`}</small>
    <div class="chips">
      {#each Object.entries(needs) as [k, n]}
        {@const got = convoy.picked.filter((x) => escortAs(x) === k).length}
        <span class="chip" class:short={got < n}>{ESCORT_LABEL[k]} {got}/{n}</span>
      {/each}
    </div>
  </div>
{/if}

<!-- what a town on the route has that's worth knowing while planning: your HQ, a depot, a transfer hub -->
{#snippet townTags(c)}
  {#if game.hq === c.id}<span class="tag hub mini">HQ</span>{/if}
  {#if game.depots[c.id]}<span class="tag mini">Depot</span>{/if}
  {#if c.rail + c.air + c.port > 1}<span class="tag hub mini">Hub</span>{/if}
{/snippet}
<!-- where a town stands on the route: its stop number, or a button to add it -->
{#snippet stopBadge(stop, reach, id)}
  {#if stop >= 0}<span class="sb on" title="Stop {stop + 1} on the route">Stop {stop + 1}</span>
  {:else if reach}<button class="sb add" onclick={() => routeTo(id)}>+ Stop</button>
  {:else}<span class="sb no">Can’t reach</span>{/if}
{/snippet}

{#if ui.picking}
  <h3>Route</h3>
  {#if ui.plan.length}
    <ol class="stops group">
      {#each ui.plan as id, i}
        {@const l = legs[i]}
        <li class="row stop" class:bad={!l} in:fly={{ y: -8, duration: 200 }}>
          <span class="num">{i + 1}</span>
          <span class="grow">
            <b>{cityById[id].name}{@render townTags(cityById[id])}</b>
            <small>{!l ? 'Out of reach from the stop before' : drops[i].n ? `Drop off ${drops[i].n}, +$${fmt(drops[i].pay)}` : 'Nothing to drop off'}{#if l?.wx}<span class="tag mini wx">{WEATHER.kinds[l.wx].name}</span>{/if}</small>
          </span>
          {#if l}<span class="right"><b>{fmtTime(l.time)}</b><small>Fuel ${l.cost}</small></span>{/if}
          <button class="x" aria-label="Remove {cityById[id].name}" onclick={() => ui.plan.splice(i, 1)}>×</button>
        </li>
      {/each}
      {#if legs.length > ui.plan.length}
        {@const l = legs[legs.length - 1]}
        <li class="row stop" class:bad={!l}>
          <span class="num">↻</span>
          <span class="grow"><b>Back to {city.name}</b><small>{l ? 'Then round again' : 'Out of reach from the last stop'}</small></span>
          {#if l}<span class="right"><b>{fmtTime(l.time)}</b><small>Fuel ${l.cost}</small></span>{/if}
        </li>
      {/if}
    </ol>
  {:else}
    <p class="hint"><Icon name="pin" size={16} />Tap towns on the map to add stops, in order. Green rings are where your cargo is going.</p>
  {/if}

  <details class="more">
    <summary>{ui.plan.length ? `Or pick the next stop after ${cityById[last].name}` : 'Or pick the first stop from a list'}</summary>
    <div class="group">
    {#each dests as d (d.to)}
      {@const c = cityById[d.to]}
      <button class="row dest" class:has={d.n} onclick={() => toggleStop(v, d.to)}>
        <span class="grow">
          <b>{c.name}{@render townTags(c)}</b>
          <small>{d.n ? `${d.n} on board for here, +$${fmt(d.pay)}` : 'Nothing on board for here'}{#if d.wx}<span class="tag mini wx">{WEATHER.kinds[d.wx].name}</span>{/if}</small>
        </span>
        <span class="right"><b>{fmtTime(d.time)}</b><small>Fuel ${d.cost}</small></span>
      </button>
    {/each}
    </div>
    {#if !dests.length}<p class="muted">Nowhere in range from {cityById[last].name}.</p>{/if}
  </details>
  <div class="group">
  {#if optKind}
    <label class="row repeat" class:off={!sidekick}>
      <input type="checkbox" bind:checked={ui.escort} disabled={!sidekick} />
      <span class="grow"><b>{ESCORT_LABEL[optKind][0].toUpperCase() + ESCORT_LABEL[optKind].slice(1)} escort</b><small>{sidekick ? `${sidekick.name} rides along in convoy. Valuables pay +${Math.round(SECURE.escortBonus * 100)}%.` : `Park a ${ESCORT_LABEL[optKind]} at ${city.name} to bring one along. Valuables pay +${Math.round(SECURE.escortBonus * 100)}% with it.`}</small></span>
    </label>
  {/if}
  <label class="row repeat">
    <input type="checkbox" checked={prefs.holdStops} onchange={(e) => setHoldStops(e.currentTarget.checked)} />
    <span class="grow"><b>Stop at each town</b><small>Waits at every stop so you can load and unload, then Continue or Abandon. Fuel is paid one leg at a time.</small></span>
  </label>
  </div>
{:else}
  {#if board.length}
    <h3>On board <span class="hsub">{v.cargo.length} · ${fmt(board.reduce((s, g) => s + g.pay, 0))}</span></h3>
    <div class="group">
    {#each board as g (g.to)}
      {@const key = `b:${g.to}`}
      <div class="dgroup">
        <div class="drow-wrap">
          <button class="row drow" onclick={() => flip1(key)} aria-expanded={!!expanded[key]}>
            <span class="dot" class:on={g.stop >= 0} class:no={!g.reach}></span>
            <span class="grow"><b>{cityById[g.to].name}</b><small>{g.jobs.length} job{g.jobs.length > 1 ? 's' : ''}{g.jobs[0].hop ? `, by way of ${cityById[g.jobs[0].hop].name}` : ''}. {expanded[key] ? 'Tap a job to drop it here' : 'Tap to see them'}</small></span>
            <span class="pay">${fmt(g.pay)}</span>
          </button>
          <span class="badge">{@render stopBadge(g.stop, g.reach, g.jobs[0].hop ?? g.to)}</span>
        </div>
        {#if expanded[key]}
          <div class="sub">
          {#each g.jobs as j (j.id)}
            <div animate:flip in:receive={{ key: j.id }} out:send={{ key: j.id }}><JobRow job={j} loaded onclick={() => unloadJob(v, j)} action="Drop" note={j.hop ? `Left at ${cityById[j.hop].name} to go on from there` : ''} /></div>
          {/each}
          </div>
        {/if}
      </div>
    {/each}
    </div>
  {/if}
  {#if deck}
    <h3>Vehicle deck ({deckUsed(v)} of {deck} spaces)</h3>
    <div class="group">
    {#each onDeck as t (t.id)}
      <button class="row vrow" onclick={() => driveOff(v, t)}>
        <span class="pv"><Sprite kind={t.kind} model={t.model} cars={consistOf(t)} scale={3} paint={paintOf(t)} /></span>
        <span class="grow"><b>{t.name}</b><small>{t.cargo.filter((j) => j.to === v.city).length ? `Drops off ${t.cargo.filter((j) => j.to === v.city).length} here` : t.cargo.length ? `${t.cargo.length} on board` : 'Empty'}</small></span>
        <span class="act">{w.off}</span>
      </button>
    {/each}
    {#each ashore as t (t.id)}
      {@const nope = !fitsAboard(v, t) ? w.big : !canBoard(v, t) ? `Needs ${deckSize(t)} spaces` : ''}
      <button class="row vrow" disabled={!!nope} onclick={() => driveOn(v, t)}>
        <span class="pv"><Sprite kind={t.kind} model={t.model} cars={consistOf(t)} scale={3} paint={paintOf(t)} /></span>
        <span class="grow"><b>{t.name}</b><small>{nope || `Parked here, takes ${deckSize(t)} space${deckSize(t) > 1 ? 's' : ''}`}</small></span>
        {#if !nope}<span class="act">{w.on}</span>{/if}
      </button>
    {/each}
    </div>
    {#if !onDeck.length && !ashore.length}<p class="muted small">No {w.none} here. Park one at {city.name} to {w.aboard}.</p>{/if}
  {/if}
  <h3>Waiting at {city.name} <span class="hsub">tap a town to load it all</span></h3>
  {#if kinds.length > 1}
    <div class="fchips" role="radiogroup" aria-label="Show jobs of one kind">
      <button role="radio" aria-checked={!only} class:on={!only} onclick={() => (onlyType = null)}>All <em>{waiting.length}</em></button>
      {#each kinds as k (k.t)}
        <button role="radio" aria-checked={only === k.t} class:on={only === k.t} onclick={() => (onlyType = only === k.t ? null : k.t)}><span class="ti t-{k.t}"><Icon name={k.t} size={13} /></span>{TYPE_LABEL[k.t]} <em>{k.n}</em></button>
      {/each}
    </div>
  {/if}
  <div class="group">
  {#each waitGroups as g (g.to)}
    {@const key = `w:${g.to}`}
    <div class="dgroup" class:going={g.have || g.stop >= 0}>
      <div class="drow-wrap">
        <button class="row drow" disabled={!g.ok.length} onclick={() => loadGroup(g)}>
          <span class="types">{#each g.types as t}<span class="ti t-{t}"><Icon name={t} size={14} /></span>{/each}</span>
          <span class="grow">
            <b>To {cityById[g.to].name}{#if g.have}<span class="have">{g.have} on board</span>{/if}</b>
            <small>{g.why || `${g.jobs.length} job${g.jobs.length > 1 ? 's' : ''}${g.ok.length < g.jobs.length ? `, ${g.ok.length} can go` : ''}${!g.reach ? `. Can’t get there, only as a transfer` : ''}`}</small>
          </span>
          <span class="pay">${fmt(g.pay)}</span>
          {#if g.ok.length && g.reach}<span class="act">Load</span>{/if}
        </button>
        <button class="chev" aria-label="Show each job to {cityById[g.to].name}" aria-expanded={!!expanded[key]} onclick={() => flip1(key)}><span class:open={expanded[key]}><Icon name="chevron" size={16} /></span></button>
      </div>
      {#if expanded[key]}
        <div class="sub">
        {#each g.jobs as j (j.id)}
          {@const why = blocker(j)}
          <div animate:flip in:receive={{ key: j.id }} out:send={{ key: j.id }}><JobRow job={j} at={v.city} onclick={() => loadJob(v, j)} disabled={why.block} note={why.text} action={why.block ? '' : 'Load'} /></div>
        {/each}
        </div>
      {/if}
    </div>
  {/each}
  </div>
  {#if !waiting.length}<p class="muted">No jobs waiting. New ones turn up every few seconds.</p>{/if}
  {#if v.held}
    <div class="held">
      <span class="grow"><b>Stopped on a route</b><small>Load or drop off here first if you like.</small></span>
      <ol class="pills" aria-label="Stops still to go">
        <li class="pill here">{city.name}</li>
        {#each v.held.stops as id, i}
          {@const n = v.cargo.filter((j) => j.to === id).length}
          <li class="arrow" aria-hidden="true">›</li>
          <li class="pill" class:next={i === 0}>{cityById[id].name}{#if n}<em>{n}</em>{/if}</li>
        {/each}
      </ol>
      <div class="chips">
        <button class="btn small ghost" onclick={() => abandonRoute(v)}>Abandon route</button>
      </div>
    </div>
  {/if}
{/if}

<!-- on both tabs: what the trip makes, and the buttons to get going -->
<div class="footer" class:held-foot={v.held && !ui.picking}>
  {#if ui.plan.length && !broken}
    <div class="profit">
      <div><small>{ui.plan.map((id) => cityById[id].name).join(' › ')}</small><b>+${fmt(pay)}</b></div>
      <div><small>Fuel{#if wear(v)} (+{Math.round(wear(v) * 100)}% age){/if}</small><b>−${fmt(total.cost)}</b></div>
      <div><small>Profit</small><b class:loss={pay < total.cost}>{pay < total.cost ? '−' : '+'}${fmt(Math.abs(pay - total.cost))}</b></div>
    </div>
  {/if}
  {#if v.held && !ui.picking}<button class="btn primary next" disabled={!heldLeg || game.coins < (heldLeg?.cost ?? 0)} onclick={carryOn}>{heldLeg ? `Continue to ${cityById[heldNext].name}, $${fmt(heldLeg.cost)}` : `Can’t reach ${cityById[heldNext].name}`}</button>{/if}
  {#if !ui.picking}<button class="btn" onclick={() => autoLoad(v, only)}>Auto load{only ? ` ${TYPE_LABEL[only].toLowerCase()}` : ''}</button>{/if}
  {#if unrouted}<button class="btn" onclick={plan}>Route cargo</button>{/if}
  {#if ui.plan.length || ui.picking}
    <button class="btn primary" disabled={!ui.plan.length || broken || game.coins < due || convoy.missing.length > 0} onclick={go}>
      {!ui.plan.length ? 'Go' : holding ? `Go to ${cityById[ui.plan[0]].name}, $${fmt(due)}` : `Go ${fmtTime(total.time)}, $${fmt(total.cost)}`}
    </button>
  {:else if !v.held}
    <button class="btn primary" onclick={() => setTab(true)}>Plan route</button>
  {/if}
</div>

<style>
  .top { position: sticky; top: -4px; z-index: 2; margin: -4px 0 8px; padding: 4px 0 8px; background: var(--panel); }
  .top .seg button.on { background: color-mix(in srgb, var(--accent) 38%, var(--panel)); font-weight: 600; }
  .seg em { font-style: normal; font-size: 11px; min-width: 18px; padding: 0 5px; border-radius: 999px; background: var(--panel-3); color: var(--ink); }
  .hsub { font-weight: 400; font-size: 12px; color: var(--ink-soft); text-transform: none; letter-spacing: 0; margin-left: 6px; }
  .hint { display: flex; align-items: center; gap: 8px; margin: 0 0 12px; padding: 10px 12px; border-radius: var(--r); background: var(--accent-soft); color: var(--ink); font-size: 13px; }
  .more { margin: 0 0 12px; }
  .more summary { cursor: pointer; padding: 6px 2px 10px; font-size: 13px; color: var(--ink-soft); }
  .dgroup { display: flex; flex-direction: column; }
  .dgroup.going { box-shadow: inset 3px 0 0 var(--good); }
  .drow-wrap { display: flex; align-items: stretch; }
  .drow-wrap .drow { flex: 1; min-width: 0; padding-right: 4px; }
  .drow .grow { min-width: 0; }
  .drow .pay { font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .types { display: flex; flex-direction: column; gap: 2px; }
  .types .ti { display: flex; }
  .have { margin-left: 6px; font-size: 11px; font-weight: 600; padding: 1px 7px; border-radius: 999px; background: color-mix(in srgb, var(--good) 20%, transparent); color: var(--ink); white-space: nowrap; }
  .chev { flex: none; width: 44px; border: 0; background: transparent; color: var(--ink-soft); cursor: pointer; display: grid; place-items: center; }
  .chev span { display: flex; transition: transform .2s; transform: rotate(90deg); }
  .chev span.open { transform: rotate(-90deg); }
  .sub { padding: 0 0 4px 12px; border-top: 1px solid var(--line); }
  .badge { display: flex; align-items: center; padding-right: 12px; }
  .dot { flex: none; width: 10px; height: 10px; border-radius: 50%; border: 2px solid var(--warn); }
  .dot.on { background: var(--good); border-color: var(--good); }
  .dot.no { border-color: var(--bad); }
  .sb { flex: none; font-size: 12px; font-weight: 600; padding: 3px 9px; border-radius: 999px; white-space: nowrap; border: 0; font-family: inherit; }
  .sb.on { background: color-mix(in srgb, var(--good) 20%, transparent); color: var(--ink); }
  .sb.add { background: var(--accent); color: var(--accent-ink); cursor: pointer; }
  .sb.no { background: color-mix(in srgb, var(--bad) 15%, transparent); color: var(--bad); }
  .footer { flex-wrap: wrap; }
  .footer .profit { flex-basis: 100%; margin: 0 0 4px; }
  .profit small { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .repeat { cursor: pointer; }
  .held-foot { flex-wrap: wrap; }
  .held-foot .next { flex-basis: 100%; }
  .held { display: flex; flex-direction: column; gap: 8px; margin: 10px 0; padding: 10px 12px; background: var(--panel-3); border-radius: var(--r); border-left: 3px solid var(--accent); }
  .held .grow { display: flex; flex-direction: column; }
  .held .chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .pills { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; margin: 0; padding: 0; list-style: none; }
  .pill { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 999px; background: var(--panel-2, var(--panel)); color: var(--ink-soft); }
  .pill.here { background: transparent; border: 1px dashed var(--ink-soft); font-weight: 500; }
  .pill.next { background: var(--accent-soft); color: var(--ink); }
  .pill em { font-style: normal; font-size: 11px; min-width: 16px; padding: 0 4px; border-radius: 999px; text-align: center; background: var(--accent); color: var(--accent-ink); }
  .arrow { color: var(--ink-soft); font-size: 14px; }
  .fchips .ti { display: flex; }
  .fchips button.on .ti { color: inherit; }
  .loadhead { margin: 0 0 10px; }
  .loadhead .pv { width: auto; min-width: 64px; max-width: 55%; height: 44px; padding: 0 8px; }
  .loadhead .meters { margin: 0; }
  .wx { margin-left: 6px; }
  .queue { display: flex; align-items: center; gap: 8px; margin: 0 0 10px; padding: 8px 10px 8px 12px; background: var(--accent-soft); border-radius: var(--r); }
  .queue small { display: block; color: var(--ink-soft); font-size: 12px; }
  .profit { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin: 12px 0 4px; padding: 8px 10px; background: var(--panel-3); border-radius: var(--r); }
  .profit div { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
  .profit small { color: var(--ink-soft); font-size: 12px; }
  .profit b { font-weight: 600; font-variant-numeric: tabular-nums; }
  .profit .loss { color: var(--bad); }
  .convoy { margin: 8px 0; padding: 10px 12px; border-radius: var(--r); background: color-mix(in srgb, var(--bad) 10%, var(--panel-2)); border: 1px solid color-mix(in srgb, var(--bad) 35%, transparent); display: flex; flex-direction: column; gap: 4px; }
  .convoy.ready { background: color-mix(in srgb, var(--good) 10%, var(--panel-2)); border-color: color-mix(in srgb, var(--good) 35%, transparent); }
  .convoy small { color: var(--ink-soft); }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .chip { font-size: 12px; font-weight: 600; padding: 2px 9px; border-radius: 999px; background: color-mix(in srgb, var(--good) 18%, transparent); text-transform: capitalize; }
  .chip.short { background: color-mix(in srgb, var(--bad) 18%, transparent); }
  .repeat.off { opacity: .6; cursor: default; }
  .repeat input { width: 20px; height: 20px; flex: none; accent-color: var(--accent); }
</style>
