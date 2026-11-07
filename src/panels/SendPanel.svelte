<script>
  import { game, ui, cityById, fetchPlan, sendFor, fmt, fmtTime, consistOf, paintOf, escortKind } from '../game/game.svelte.js';
  import Sprite from '../ui/Sprite.svelte';
  import JobRow from '../ui/JobRow.svelte';
  import NavHeader from '../ui/NavHeader.svelte';
  let { job, at } = $props();
  // parked vehicles, the ones already here first, then soonest to arrive. Escorts never carry jobs,
  // so they're left out.
  const options = $derived(
    game.vehicles
      .filter((v) => v.city && !escortKind(v))
      .map((v) => ({ v, p: fetchPlan(v, job, at) }))
      .sort((a, b) => (a.p.pickIn ?? 0) - (b.p.pickIn ?? 0) || (a.p.time ?? 0) - (b.p.time ?? 0))
  );
  const here = $derived(options.filter((o) => !o.p.why && o.v.city === at));
  const able = $derived(options.filter((o) => !o.p.why && o.v.city !== at));
  const unable = $derived(options.filter((o) => o.p.why));
  function send(v) { if (sendFor(v, job, at)) ui.sendJob = null; }
</script>

<NavHeader title="Send a vehicle" sub="to pick up at {cityById[at].name}" back={cityById[at].name} onback={() => (ui.sendJob = null)} />
<div class="group"><JobRow {job} {at} /></div>

{#snippet option(v, p, where)}
  {@const profit = job.pay - p.cost}
  <button class="row vrow" disabled={game.coins < p.cost} onclick={() => send(v)}>
    <span class="pv"><Sprite kind={v.kind} model={v.model} cars={consistOf(v)} scale={3} paint={paintOf(v)} /></span>
    <span class="grow"><b>{v.name}</b><small>{where}</small></span>
    <span class="right"><b class:loss={profit < 0}>{profit < 0 ? '−' : '+'}${fmt(Math.abs(profit))}</b><small>Fuel ${fmt(p.cost)}</small></span>
  </button>
{/snippet}

{#if here.length}
  <h3>Parked at {cityById[at].name}</h3>
  <div class="group">
    {#each here as { v, p } (v.id)}
      {@render option(v, p, `Loads it now and delivers in ${fmtTime(p.time)}${p.stops.length > 1 ? `, ${p.stops.length} stops` : ''}${v.cargo.length ? `. ${v.cargo.length} already on board` : ''}`)}
    {/each}
  </div>
{/if}

<h3>Parked elsewhere</h3>
<div class="group">
  {#each able as { v, p } (v.id)}
    {@render option(v, p, `From ${cityById[v.city].name}. Picks up in ${fmtTime(p.pickIn)}, delivers in ${fmtTime(p.time)}${p.stops.length > 2 ? `, ${p.stops.length} stops` : ''}`)}
  {/each}
</div>
{#if !able.length}
  <p class="muted small">No parked vehicle {here.length ? 'elsewhere ' : ''}can fetch this. It needs room for {job.type === 'pax' ? 'passengers' : 'this load'} and a way to {cityById[at].name} and on to {cityById[job.to].name}.</p>
{/if}

{#if unable.length}
  <h3>Can’t take it</h3>
  <div class="group">
    {#each unable as { v, p } (v.id)}
      <div class="row vrow off">
        <span class="pv"><Sprite kind={v.kind} model={v.model} cars={consistOf(v)} scale={3} paint={paintOf(v)} /></span>
        <span class="grow"><b>{v.name}</b><small>At {cityById[v.city].name}. {p.why}</small></span>
      </div>
    {/each}
  </div>
{/if}

<style>
  .off { opacity: .5; }
  .loss { color: var(--bad); }
</style>
