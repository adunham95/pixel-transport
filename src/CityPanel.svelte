<script>
  import { game, ui, cityById, etaText, fmtTime, clock, followVehicle } from './game.svelte.js';
  import Sprite from './Sprite.svelte';
  import JobRow from './JobRow.svelte';
  import LoadPanel from './LoadPanel.svelte';
  const c = $derived(cityById[game.selected]);
  const here = $derived(game.vehicles.filter((v) => v.city === c.id));
  // vehicles with this city anywhere on their route, and when they'll get here
  const incoming = $derived(game.vehicles.flatMap((v) => {
    if (!v.trip) return [];
    let t = v.trip.startAt + v.trip.dur;
    if (v.trip.to === c.id) return [{ v, at: t, later: 0 }];
    const i = (v.next ?? []).findIndex((l) => l.to === c.id);
    if (i < 0) return [];
    for (let k = 0; k <= i; k++) t += v.next[k].dur;
    return [{ v, at: t, later: i + 1 }];
  }).sort((a, b) => a.at - b.at));
  const jobs = $derived([...(game.jobs[c.id] ?? [])].sort((a, b) => b.pay - a.pay));
  const active = $derived(game.vehicles.find((v) => v.id === ui.activeVehicle && v.city === c.id));
</script>

{#if active}
  <LoadPanel v={active} />
{:else}
  <div class="cityhead">
    <h2>{c.name}</h2>
    <div class="tags">
      {#if c.rail}<span class="tag">Station</span>{/if}
      {#if c.air}<span class="tag">Airport</span>{/if}
      {#if c.port}<span class="tag">Port</span>{/if}
      {#if c.rail + c.air + c.port > 1}<span class="tag hub">Transfer hub</span>{/if}
      {#if c.island}<span class="tag">Island</span>{/if}
    </div>
  </div>

  <h3>Parked here</h3>
  {#each here as v (v.id)}
    <button class="row vrow" onclick={() => { ui.activeVehicle = v.id; ui.picking = false; }}>
      <span class="pv"><Sprite kind={v.kind} model={v.model} cars={v.cars ?? []} scale={3} /></span>
      <span class="grow"><b>{v.name}</b><small>{v.cargo.length ? `${v.cargo.length} on board` : 'Empty'}</small></span>
      <span class="act">Load</span>
    </button>
  {:else}
    <p class="muted">Nothing parked here. Send a vehicle over, or buy one in the Shop.</p>
  {/each}

  {#if incoming.length}
    <h3>On the way</h3>
    {#each incoming as { v, at, later } (v.id)}
      <button class="row vrow" onclick={() => followVehicle(v)}>
        <span class="pv"><Sprite kind={v.kind} model={v.model} cars={v.cars ?? []} scale={3} /></span>
        <span class="grow"><b>{v.name}</b><small>{later ? `Stops here in ${fmtTime((at - clock.now) / 1000)}, after ${later} other stop${later > 1 ? 's' : ''}` : `Arrives in ${etaText(v)}`}</small></span>
        <span class="act">Watch</span>
      </button>
    {/each}
  {/if}

  <h3>Waiting at {c.name} ({jobs.length})</h3>
  {#each jobs as j (j.id)}
    <JobRow job={j} at={c.id} />
  {:else}
    <p class="muted">No jobs right now. New ones turn up every few seconds.</p>
  {/each}
{/if}
