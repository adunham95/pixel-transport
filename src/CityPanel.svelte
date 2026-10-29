<script>
  import { game, ui, cityById, etaText, fmtTime, clock, followVehicle, isOpen, connections, unlockPrice, unlockCity, carrierAt, fmt, townSize, sizeName, growthOf, buyDepot } from './game.svelte.js';
  import { CITY_PRICE, DEPOT } from './data.js';
  import Sprite from './Sprite.svelte';
  import JobRow from './JobRow.svelte';
  import LoadPanel from './LoadPanel.svelte';
  import { fly, slide, flip } from './motion.js';
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
  <div in:fly={{ x: 28, duration: 220 }}><LoadPanel v={active} /></div>
{:else}
  <div in:fly={{ x: -28, duration: 220 }}>
  <div class="cityhead">
    <h2>{c.name}</h2>
    <div class="tags">
      {#if c.rail}<span class="tag">Station</span>{/if}
      {#if c.air}<span class="tag">Airport</span>{/if}
      {#if c.port}<span class="tag">Port</span>{/if}
      {#if c.road}<span class="tag">Roads</span>{/if}
      {#if c.rail + c.air + c.port > 1}<span class="tag hub">Transfer hub</span>{/if}
      {#if c.island}<span class="tag">Island</span>{/if}
      {#if c.anchor}<span class="tag">Anchorage</span>{/if}
      {#if !c.anchor && isOpen(c.id)}<span class="tag hub">{sizeName(c.id)}</span>{/if}
      {#if game.depots[c.id]}<span class="tag">Depot</span>{/if}
      {#if carrierAt(c.id)}<span class="tag hub">{c.anchor || !c.air ? 'Carrier landing strip' : 'Carrier in port'}</span>{/if}
    </div>
  </div>
  {#if c.anchor}
    <p class="note">Open sea. Aircraft carriers can anchor here, and while one is, small and mid-size planes and helicopters can land on it to refuel or ride along.</p>
  {/if}

  {#if !isOpen(c.id)}
    {@const n = connections(c)}
    <div class="locked-card">
      <p><b>{c.name} is locked.</b> Unlock it to get jobs here and send your vehicles in.</p>
      <p class="muted small">{n} connection{n > 1 ? 's' : ''} × ${fmt(CITY_PRICE)} = ${fmt(unlockPrice(c))}</p>
      <button class="btn primary" disabled={game.coins < unlockPrice(c)} onclick={() => unlockCity(c.id)}>Unlock for ${fmt(unlockPrice(c))}</button>
    </div>
  {:else}
  {#if !c.anchor}
    {@const gr = growthOf(c.id)}
    <div class="grow-card">
      <div class="gline">
        <span><b>{sizeName(c.id)}</b>{#if townSize(c.id) > 1} · jobs pay +{(townSize(c.id) - 1) * 10}%{/if}</span>
        <small>{gr.next == null ? `${fmt(gr.n)} deliveries, as big as it gets` : `${gr.n - gr.from} of ${gr.next - gr.from} deliveries to grow`}</small>
      </div>
      {#if gr.next != null}<div class="bar"><i style:width="{((gr.n - gr.from) / (gr.next - gr.from)) * 100}%"></i></div>{/if}
      <div class="gline depot">
        {#if game.depots[c.id]}
          <small>Depot: vehicles parked here lose their age over time, and servicing here costs half.</small>
        {:else}
          <small>Build a depot: vehicles parked here lose their age over time, and servicing here costs half.</small>
          <button class="btn small" disabled={game.level < DEPOT.level || game.coins < DEPOT.price} onclick={() => buyDepot(c.id)}>{game.level < DEPOT.level ? `Lv ${DEPOT.level}` : `$${fmt(DEPOT.price)}`}</button>
        {/if}
      </div>
    </div>
  {/if}
  <h3>Parked here</h3>
  {#each here as v (v.id)}
    <button class="row vrow" animate:flip transition:slide={{ duration: 200 }} onclick={() => { ui.activeVehicle = v.id; ui.picking = false; }}>
      <span class="pv"><Sprite kind={v.kind} model={v.model} cars={v.cars ?? []} scale={3} /></span>
      <span class="grow"><b>{v.name}</b><small>{v.loop ? 'Repeating, waiting for jobs' : v.cargo.length ? `${v.cargo.length} on board` : 'Empty'}</small></span>
      <span class="act">Load</span>
    </button>
  {:else}
    <p class="muted">{c.anchor ? 'Nothing anchored here. Send an aircraft carrier over.' : 'Nothing parked here. Send a vehicle over, or buy one in the Shop.'}</p>
  {/each}

  {#if incoming.length}
    <h3>On the way</h3>
    {#each incoming as { v, at, later } (v.id)}
      <button class="row vrow" animate:flip transition:slide={{ duration: 200 }} onclick={() => followVehicle(v)}>
        <span class="pv"><Sprite kind={v.kind} model={v.model} cars={v.cars ?? []} scale={3} /></span>
        <span class="grow"><b>{v.name}</b><small>{later ? `Stops here in ${fmtTime((at - clock.now) / 1000)}, after ${later} other stop${later > 1 ? 's' : ''}` : `Arrives in ${etaText(v)}`}</small></span>
        <span class="act">Watch</span>
      </button>
    {/each}
  {/if}

  {#if !c.anchor}
  <h3>Waiting at {c.name} ({jobs.length})</h3>
  {#each jobs as j (j.id)}
    <div animate:flip transition:slide={{ duration: 200 }}><JobRow job={j} at={c.id} /></div>
  {:else}
    <p class="muted">No jobs right now. New ones turn up every few seconds.</p>
  {/each}
  {/if}
  {/if}
  </div>
{/if}

<style>
  .grow-card { margin-top: 10px; padding: 10px 12px; background: var(--panel-3); border-radius: var(--r); display: flex; flex-direction: column; gap: 6px; }
  .gline { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }
  .gline small { color: var(--ink-soft); font-size: 12px; }
  .gline b { font-weight: 600; }
  .depot { flex-wrap: nowrap; padding-top: 6px; border-top: 1px solid var(--line); }
  .bar { height: 5px; background: var(--panel-2); border-radius: 3px; overflow: hidden; }
  .bar i { display: block; height: 100%; background: var(--accent); border-radius: 3px; }
</style>
