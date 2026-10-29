<script>
  import { game, ui, cityById, capacity, used, loadJob, unloadJob, autoLoad, destinations, dispatch, route, canReach, planLegs, autoPlan, toggleStop, fmt, fmtTime, loopStops, buyRepeatRoutes, aboard, canBoard, fitsAboard, deckFor, deckSize, deckUsed, deckRoom, driveOn, driveOff, wear, fetcher, convoyNeeds, pickEscorts, escortText, consistOf } from './game.svelte.js';
  import Icon from './Icon.svelte';
  import Sprite from './Sprite.svelte';
  import JobRow from './JobRow.svelte';
  import { send, receive, flip, fly } from './motion.js';
  import { TYPE_LABEL, JOB_TYPES, ENGINES, TRUCKS, REPEAT_ROUTES, ESCORT_LABEL } from './data.js';
  let { v } = $props();
  const cap = $derived(capacity(v));
  const u = $derived(used(v));
  const city = $derived(cityById[v.city]);
  const score = (j) => (canReach(v, j.to) ? j.pay * 2 : j.pay);
  const waiting = $derived([...(game.jobs[v.city] ?? [])].sort((a, b) => score(b) - score(a)));

  // route planning
  // a repeating route also drives back to where it started
  const looping = $derived(ui.repeat && game.repeatRoutes);
  const legs = $derived(planLegs(v, looping ? loopStops(v, ui.plan) : ui.plan));
  const last = $derived(ui.plan.length ? ui.plan[ui.plan.length - 1] : v.city);
  // a superload's convoy: the escorts it needs, which are parked here, and their fuel for the route
  const needs = $derived(convoyNeeds(v));
  const convoy = $derived(pickEscorts(v));
  const escFuel = $derived(convoy.picked.reduce((s, x) => s + planLegs(x, ui.plan).reduce((a, l) => a + (l?.cost ?? 0), 0), 0));
  const total = $derived(legs.reduce((s, l) => ({ cost: s.cost + (l?.cost ?? 0), time: s.time + (l?.time ?? 0) }), { cost: escFuel, time: 0 }));
  const broken = $derived(legs.some((l) => !l));
  // what this route makes: drop off pay against fuel
  const pay = $derived(drops.reduce((s, d) => s + d.pay, 0));
  // what gets dropped where: cargo leaves at the first planned stop that matches
  const drops = $derived.by(() => {
    const out = ui.plan.map(() => ({ n: 0, pay: 0 }));
    for (const j of v.cargo) {
      const i = ui.plan.indexOf(j.to);
      if (i >= 0) { out[i].n++; out[i].pay += j.pay; }
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
      .sort((a, b) => b.n - a.n || b.pay - a.pay || a.len - b.len)
  );
  const unrouted = $derived(v.cargo.filter((j) => !routed.has(j.to) && canReach(v, j.to)).length);

  const NEEDS = { pax: 'passenger car', cargo: 'boxcar', fuel: 'tanker', bulk: 'hopper car', mail: 'mail car', wide: 'flatcar' };
  const TRAILER_NEEDS = { cargo: 'van trailer', fuel: 'tank trailer', bulk: 'dump trailer', wide: 'lowboy trailer' };
  function blocker(j) {
    const f = fetcher(j);
    if (f) return { block: true, text: `${f.name} is on its way for it` };
    if (j.escort) {
      if (v.kind !== 'truck' || !TRUCKS[v.model].superload) return { block: true, text: 'Superloads need a superload tractor' };
      if (v.cargo.some((x) => x.escort)) return { block: true, text: 'Already carrying a superload' };
      return { block: false, text: '' };
    }
    if (v.kind === 'truck' && TRUCKS[v.model].superload) return { block: true, text: 'Superload tractors only carry superloads' };
    if (!cap[j.type]) {
      const what = TYPE_LABEL[j.type].toLowerCase();
      if (j.type === 'wide' && v.kind !== 'truck' && v.kind !== 'train') return { block: true, text: 'Wide loads only go overland, on a lowboy trailer or flatcar' };
      if (j.type === 'mail' && v.kind === 'truck') return { block: true, text: 'Mail needs a mail van' };
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
  function go() { if (dispatch(v, ui.plan, { repeat: looping })) { ui.picking = false; ui.activeVehicle = null; ui.plan = []; } }
</script>

<div class="loadhead">
  <button class="btn small" onclick={() => { ui.activeVehicle = null; ui.picking = false; ui.plan = []; }}>Back</button>
  <div class="grow"><b>{v.name}</b><small>at {city.name}</small></div>
  <Sprite kind={v.kind} model={v.model} cars={consistOf(v)} scale={3} />
</div>
<div class="meters">
  {#each JOB_TYPES as t}
    {#if cap[t]}<span class="meter t-{t}" class:full={u[t] >= cap[t]}><Icon name={t} size={14} />{u[t]}/{cap[t]}</span>{/if}
  {/each}
</div>
{#if Object.keys(needs).length}
  <div class="convoy" class:ready={!convoy.missing.length}>
    <b>Superload convoy</b>
    <small>{convoy.missing.length ? `Needs ${escortText(Object.fromEntries(convoy.missing))} more parked at ${city.name} to set off.` : `Ready. ${escortText(needs)} will drive along${ui.plan.length ? `, $${fmt(escFuel)} of fuel` : ''}.`}</small>
    <div class="chips">
      {#each Object.entries(needs) as [k, n]}
        {@const got = convoy.picked.filter((x) => TRUCKS[x.model].escort === k).length}
        <span class="chip" class:short={got < n}>{ESCORT_LABEL[k]} {got}/{n}</span>
      {/each}
    </div>
  </div>
{/if}

{#if ui.picking}
  <h3>Route</h3>
  {#if ui.plan.length}
    <ol class="stops">
      {#each ui.plan as id, i}
        {@const l = legs[i]}
        <li class="row stop" class:bad={!l} in:fly={{ y: -8, duration: 200 }}>
          <span class="num">{i + 1}</span>
          <span class="grow">
            <b>{cityById[id].name}</b>
            <small>{!l ? 'Out of reach from the stop before' : drops[i].n ? `Drop off ${drops[i].n}, +$${fmt(drops[i].pay)}` : 'Nothing to drop off'}</small>
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
    <p class="muted small">Add stops in order. At each one, anything on board for that city is dropped off before moving on. Tap cities below or ones with a yellow ring on the map.</p>
  {/if}

  <h3>{ui.plan.length ? `Next stop after ${cityById[last].name}` : 'First stop'}</h3>
  {#each dests as d (d.to)}
    {@const c = cityById[d.to]}
    <button class="row dest" class:has={d.n} onclick={() => toggleStop(v, d.to)}>
      <span class="grow">
        <b>{c.name}{#if c.rail + c.air + c.port > 1}<span class="tag hub mini">Hub</span>{/if}</b>
        <small>{d.n ? `${d.n} on board for here, +$${fmt(d.pay)}` : 'Nothing on board for here'}</small>
      </span>
      <span class="right"><b>{fmtTime(d.time)}</b><small>Fuel ${d.cost}</small></span>
    </button>
  {:else}
    <p class="muted">Nowhere in range from {cityById[last].name}.</p>
  {/each}
  {#if game.repeatRoutes}
    <label class="row repeat">
      <input type="checkbox" bind:checked={ui.repeat} />
      <span class="grow"><b>Repeat this route</b><small>Picks up jobs for the loop at every stop, comes back to {city.name} and goes round again. Fuel is paid each lap.</small></span>
    </label>
  {:else}
    {@const locked = game.level < REPEAT_ROUTES.level}
    <div class="row repeat">
      <span class="grow"><b>Repeating routes</b><small>{locked ? `Unlocks at level ${REPEAT_ROUTES.level}. Sends vehicles round the same loop on their own.` : 'Send vehicles round the same loop on their own, for the whole fleet.'}</small></span>
      <button class="btn small" disabled={locked || game.coins < REPEAT_ROUTES.price} onclick={buyRepeatRoutes}>{locked ? `Lv ${REPEAT_ROUTES.level}` : `$${fmt(REPEAT_ROUTES.price)}`}</button>
    </div>
  {/if}
  {#if ui.plan.length && !broken}
    <div class="profit">
      <div><small>Drop offs</small><b>+${fmt(pay)}</b></div>
      <div><small>Fuel{#if wear(v)} (+{Math.round(wear(v) * 100)}% age){/if}</small><b>−${fmt(total.cost)}</b></div>
      <div><small>{looping ? 'First lap' : 'Profit'}</small><b class:loss={pay < total.cost}>{pay < total.cost ? '−' : '+'}${fmt(Math.abs(pay - total.cost))}</b></div>
    </div>
    {#if looping}<p class="muted small">Later laps earn from whatever they pick up along the way.</p>{/if}
  {/if}
  <div class="footer">
    <button class="btn" onclick={() => { ui.picking = false; ui.plan = []; }}>Back</button>
    {#if unrouted}<button class="btn" onclick={plan}>Route cargo</button>{/if}
    <button class="btn primary" disabled={!ui.plan.length || broken || game.coins < total.cost || convoy.missing.length > 0} onclick={go}>
      {!ui.plan.length ? 'Go' : looping ? `Loop ${fmtTime(total.time)}, $${fmt(total.cost)} a lap` : `Go ${fmtTime(total.time)}, $${fmt(total.cost)}`}
    </button>
  </div>
{:else}
  {#if v.cargo.length}<h3>On board. Tap to drop off here.</h3>{/if}
  <!-- outside the if, so the very first job loaded still glides up from the waiting list -->
  {#each v.cargo as j (j.id)}
    <div animate:flip in:receive={{ key: j.id }} out:send={{ key: j.id }}><JobRow job={j} loaded onclick={() => unloadJob(v, j)} action="Drop" note={canReach(v, j.to) ? '' : 'Can’t reach from here'} /></div>
  {/each}
  {#if deck}
    <h3>Vehicle deck ({deckUsed(v)} of {deck} spaces)</h3>
    {#each onDeck as t (t.id)}
      <button class="row vrow" onclick={() => driveOff(v, t)}>
        <span class="pv"><Sprite kind={t.kind} model={t.model} cars={consistOf(t)} scale={3} /></span>
        <span class="grow"><b>{t.name}</b><small>{t.cargo.filter((j) => j.to === v.city).length ? `Drops off ${t.cargo.filter((j) => j.to === v.city).length} here` : t.cargo.length ? `${t.cargo.length} on board` : 'Empty'}</small></span>
        <span class="act">{w.off}</span>
      </button>
    {/each}
    {#each ashore as t (t.id)}
      {@const nope = !fitsAboard(v, t) ? w.big : !canBoard(v, t) ? `Needs ${deckSize(t)} spaces` : ''}
      <button class="row vrow" disabled={!!nope} onclick={() => driveOn(v, t)}>
        <span class="pv"><Sprite kind={t.kind} model={t.model} cars={consistOf(t)} scale={3} /></span>
        <span class="grow"><b>{t.name}</b><small>{nope || `Parked here, takes ${deckSize(t)} space${deckSize(t) > 1 ? 's' : ''}`}</small></span>
        {#if !nope}<span class="act">{w.on}</span>{/if}
      </button>
    {/each}
    {#if !onDeck.length && !ashore.length}<p class="muted small">No {w.none} here. Park one at {city.name} to {w.aboard}.</p>{/if}
  {/if}
  <h3>Waiting at {city.name}</h3>
  {#each waiting as j (j.id)}
    {@const why = blocker(j)}
    <div animate:flip in:receive={{ key: j.id }} out:send={{ key: j.id }}><JobRow job={j} at={v.city} onclick={() => loadJob(v, j)} disabled={why.block} note={why.text} action={why.block ? '' : 'Load'} /></div>
  {:else}
    <p class="muted">No jobs waiting. New ones turn up every few seconds.</p>
  {/each}
  <div class="footer">
    <button class="btn" onclick={() => autoLoad(v)}>Auto load</button>
    {#if v.cargo.length}<button class="btn" onclick={plan}>Route cargo</button>{/if}
    <button class="btn primary" onclick={() => { ui.plan = []; ui.picking = true; }}>Plan route</button>
  </div>
{/if}

<style>
  .repeat { margin-top: 10px; cursor: pointer; }
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
  .repeat input { width: 20px; height: 20px; flex: none; accent-color: var(--accent); }
</style>
