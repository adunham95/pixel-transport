<script>
  import { game, ui, cityById, fetchPlan, sendFor, fmt, fmtTime, consistOf } from './game.svelte.js';
  import Sprite from './Sprite.svelte';
  import JobRow from './JobRow.svelte';
  let { job, at } = $props();
  // parked vehicles elsewhere, soonest to arrive at the top
  const options = $derived(
    game.vehicles
      .filter((v) => v.city && v.city !== at)
      .map((v) => ({ v, p: fetchPlan(v, job, at) }))
      .sort((a, b) => (a.p.pickIn ?? 0) - (b.p.pickIn ?? 0))
  );
  const able = $derived(options.filter((o) => !o.p.why));
  const unable = $derived(options.filter((o) => o.p.why));
  const parkedHere = $derived(game.vehicles.filter((v) => v.city === at).length);
  function send(v) { if (sendFor(v, job, at)) ui.sendJob = null; }
</script>

<div class="loadhead">
  <button class="btn small" onclick={() => (ui.sendJob = null)}>Back</button>
  <div class="grow"><b>Send a vehicle</b><small>to pick up at {cityById[at].name}</small></div>
</div>
<JobRow {job} {at} />

<h3>Parked elsewhere</h3>
{#each able as { v, p } (v.id)}
  {@const profit = job.pay - p.cost}
  <button class="row vrow" disabled={game.coins < p.cost} onclick={() => send(v)}>
    <span class="pv"><Sprite kind={v.kind} model={v.model} cars={consistOf(v)} scale={3} /></span>
    <span class="grow">
      <b>{v.name}</b>
      <small>From {cityById[v.city].name}. Picks up in {fmtTime(p.pickIn)}, delivers in {fmtTime(p.time)}{p.stops.length > 2 ? `, ${p.stops.length} stops` : ''}</small>
    </span>
    <span class="right"><b class:loss={profit < 0}>{profit < 0 ? '−' : '+'}${fmt(Math.abs(profit))}</b><small>Fuel ${fmt(p.cost)}</small></span>
  </button>
{:else}
  <p class="muted small">No parked vehicle can fetch this. It needs room for {job.type === 'pax' ? 'passengers' : 'this load'} and a way to {cityById[at].name} and on to {cityById[job.to].name}.</p>
{/each}
{#if parkedHere}<p class="muted small">{parkedHere} parked at {cityById[at].name} already. Load it from there instead.</p>{/if}

{#if unable.length}
  <h3>Can’t take it</h3>
  {#each unable as { v, p } (v.id)}
    <div class="row vrow off">
      <span class="pv"><Sprite kind={v.kind} model={v.model} cars={consistOf(v)} scale={3} /></span>
      <span class="grow"><b>{v.name}</b><small>At {cityById[v.city].name}. {p.why}</small></span>
    </div>
  {/each}
{/if}

<style>
  .off { opacity: .5; box-shadow: none; }
  .loss { color: var(--bad); }
</style>
