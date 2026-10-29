<script>
  import { game, ui, cityById, capacity, used, loadJob, unloadJob, autoLoad, destinations, dispatch, route, canReach, planLegs, autoPlan, toggleStop, fmt, fmtTime } from './game.svelte.js';
  import Icon from './Icon.svelte';
  import Sprite from './Sprite.svelte';
  import JobRow from './JobRow.svelte';
  import { TYPE_LABEL } from './data.js';
  let { v } = $props();
  const cap = $derived(capacity(v));
  const u = $derived(used(v));
  const city = $derived(cityById[v.city]);
  const score = (j) => (canReach(v, j.to) ? j.pay * 2 : j.pay);
  const waiting = $derived([...(game.jobs[v.city] ?? [])].sort((a, b) => score(b) - score(a)));

  // route planning
  const legs = $derived(planLegs(v, ui.plan));
  const last = $derived(ui.plan.length ? ui.plan[ui.plan.length - 1] : v.city);
  const total = $derived(legs.reduce((s, l) => ({ cost: s.cost + (l?.cost ?? 0), time: s.time + (l?.time ?? 0) }), { cost: 0, time: 0 }));
  const broken = $derived(legs.some((l) => !l));
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

  const NEEDS = { pax: 'passenger car', cargo: 'boxcar', fuel: 'tanker' };
  function blocker(j) {
    if (!cap[j.type]) return { block: true, text: v.kind === 'plane' ? 'Planes can’t carry fuel' : v.kind === 'boat' ? `No room for ${TYPE_LABEL[j.type].toLowerCase()} on this boat` : `Needs a ${NEEDS[j.type]}` };
    if (u[j.type] >= cap[j.type]) return { block: true, text: 'No room left' };
    if (!canReach(v, j.to)) return { block: false, text: 'Needs a transfer' };
    if (!route(v, j.to)) return { block: false, text: 'Needs fuel stops on the way' };
    return { block: false, text: '' };
  }
  function plan() { ui.plan = autoPlan(v); ui.picking = true; }
  function go() { if (dispatch(v, ui.plan)) { ui.picking = false; ui.activeVehicle = null; ui.plan = []; } }
</script>

<div class="loadhead">
  <button class="btn small" onclick={() => { ui.activeVehicle = null; ui.picking = false; ui.plan = []; }}>Back</button>
  <div class="grow"><b>{v.name}</b><small>at {city.name}</small></div>
  <Sprite kind={v.kind} model={v.model} cars={v.cars ?? []} scale={3} />
</div>
<div class="meters">
  {#each ['pax', 'cargo', 'fuel'] as t}
    {#if cap[t]}<span class="meter t-{t}" class:full={u[t] >= cap[t]}><Icon name={t} size={14} />{u[t]}/{cap[t]}</span>{/if}
  {/each}
</div>

{#if ui.picking}
  <h3>Route</h3>
  {#if ui.plan.length}
    <ol class="stops">
      {#each ui.plan as id, i}
        {@const l = legs[i]}
        <li class="row stop" class:bad={!l}>
          <span class="num">{i + 1}</span>
          <span class="grow">
            <b>{cityById[id].name}</b>
            <small>{!l ? 'Out of reach from the stop before' : drops[i].n ? `Drop off ${drops[i].n}, +$${fmt(drops[i].pay)}` : 'Nothing to drop off'}</small>
          </span>
          {#if l}<span class="right"><b>{fmtTime(l.time)}</b><small>Fuel ${l.cost}</small></span>{/if}
          <button class="x" aria-label="Remove {cityById[id].name}" onclick={() => ui.plan.splice(i, 1)}>×</button>
        </li>
      {/each}
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
  <div class="footer">
    <button class="btn" onclick={() => { ui.picking = false; ui.plan = []; }}>Back</button>
    {#if unrouted}<button class="btn" onclick={plan}>Route cargo</button>{/if}
    <button class="btn primary" disabled={!ui.plan.length || broken || game.coins < total.cost} onclick={go}>
      {ui.plan.length ? `Go ${fmtTime(total.time)}, $${fmt(total.cost)}` : 'Go'}
    </button>
  </div>
{:else}
  {#if v.cargo.length}
    <h3>On board. Tap to drop off here.</h3>
    {#each v.cargo as j (j.id)}
      <JobRow job={j} loaded onclick={() => unloadJob(v, j)} action="Drop" note={canReach(v, j.to) ? '' : 'Can’t reach from here'} />
    {/each}
  {/if}
  <h3>Waiting at {city.name}</h3>
  {#each waiting as j (j.id)}
    {@const why = blocker(j)}
    <JobRow job={j} at={v.city} onclick={() => loadJob(v, j)} disabled={why.block} note={why.text} action={why.block ? '' : 'Load'} />
  {:else}
    <p class="muted">No jobs waiting. New ones turn up every few seconds.</p>
  {/each}
  <div class="footer">
    <button class="btn" onclick={() => autoLoad(v)}>Auto load</button>
    {#if v.cargo.length}<button class="btn" onclick={plan}>Route cargo</button>{/if}
    <button class="btn primary" onclick={() => { ui.plan = []; ui.picking = true; }}>Plan route</button>
  </div>
{/if}
