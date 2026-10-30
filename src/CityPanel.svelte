<script>
  import { game, ui, cityById, etaText, fmtTime, clock, followVehicle, isOpen, connections, unlockPrice, unlockCity, carrierAt, fmt, townSize, sizeName, growthOf, buyDepot, fetcher, consistOf, paintOf, buildHQ, hqPrice, setLivery, nextContractsPerk, buyContractsPerk, contractSlots, nextSuperloadsPerk, buySuperloadsPerk, superloadSlots, buyAutoPerk, mixOf, projectTowns, landmarkAt, cantHost } from './game.svelte.js';
  import { CITY_PRICE, DEPOT, HQ, TYPE_LABEL, PROJECTS } from './data.js';
  import ProjectCard from './ProjectCard.svelte';
  import Icon from './Icon.svelte';
  import Sprite from './Sprite.svelte';
  import JobRow from './JobRow.svelte';
  import LoadPanel from './LoadPanel.svelte';
  import SendPanel from './SendPanel.svelte';
  import { fly, slide, flip } from './motion.js';
  const c = $derived(cityById[game.selected]);
  // the job types this town turns up more of than most, strongest lean first
  const knownFor = $derived(Object.entries(mixOf(c.id)).filter(([, m]) => m > 1).sort((a, b) => b[1] - a[1]).map(([t]) => t));
  const here = $derived(game.vehicles.filter((v) => v.city === c.id));
  // vehicles with this city anywhere on their route, and when they'll get here
  const incoming = $derived(game.vehicles.flatMap((v) => {
    if (!v.trip) return [];
    let t = v.trip.startAt + v.trip.dur;
    if (v.trip.to === c.id) return [{ v, at: t, later: 0, pick: v.trip.pick != null }];
    const i = (v.next ?? []).findIndex((l) => l.to === c.id);
    if (i < 0) return [];
    for (let k = 0; k <= i; k++) t += v.next[k].dur;
    return [{ v, at: t, later: i + 1, pick: v.next[i].pick != null }];
  }).sort((a, b) => a.at - b.at));
  const jobs = $derived([...(game.jobs[c.id] ?? [])].sort((a, b) => b.pay - a.pay));
  const active = $derived(game.vehicles.find((v) => v.id === ui.activeVehicle && v.city === c.id));
  const sending = $derived(jobs.find((j) => j.id === ui.sendJob && !fetcher(j)));
  // megaprojects here: the ones started (a bridge ending here, the landmark going up here), and
  // the ones that could be (bridges ending here, landmarks this town could take)
  const open = $derived(!c.anchor && isOpen(c.id));
  const projects = $derived(open ? PROJECTS.filter((p) => game.projects[p.id] && projectTowns(p).includes(c.id)) : []);
  const could = $derived(open ? PROJECTS.filter((p) => !game.projects[p.id] && (p.link ? p.link.includes(c.id) : !landmarkAt(c.id) && !cantHost(p, c))) : []);
</script>

{#if active}
  <div in:fly={{ x: 28, duration: 220 }}><LoadPanel v={active} /></div>
{:else if sending}
  <div in:fly={{ x: 28, duration: 220 }}><SendPanel job={sending} at={c.id} /></div>
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
      {#if game.hq === c.id}<span class="tag hub">HQ</span>{/if}
      {#if game.depots[c.id]}<span class="tag">Depot</span>{/if}
      {#if carrierAt(c.id)}<span class="tag hub">{c.anchor || !c.air ? 'Carrier landing strip' : 'Carrier in port'}</span>{/if}
      {#each knownFor as t (t)}<span class="tag known t-{t}" title="Turns up more {t === 'celeb' ? 'celebrities' : TYPE_LABEL[t].toLowerCase()} than most towns"><Icon name={t} size={12} />{t === 'celeb' ? 'Celebrities' : TYPE_LABEL[t]}</span>{/each}
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
      {#if !game.hq}
        <div class="gline depot">
          <small>Build your HQ here: unlocks repeating routes and company colors, and sells perks. You only get one.</small>
          <button class="btn small" disabled={game.level < HQ.level || game.coins < hqPrice()} onclick={() => buildHQ(c.id)}>{game.level < HQ.level ? `Lv ${HQ.level}` : hqPrice() ? `$${fmt(hqPrice())}` : 'Free'}</button>
        </div>
      {/if}
    </div>
  {/if}
  {#if game.hq === c.id}
    {@const lv = game.livery ?? { body: '#2a6fd6', accent: '#f2c14e', on: false }}
    {@const perk = nextContractsPerk()}
    {@const heavy = nextSuperloadsPerk()}
    <h3>Headquarters</h3>
    <label class="row hq">
      <input type="checkbox" checked={lv.on} onchange={(e) => setLivery({ on: e.currentTarget.checked })} />
      <span class="grow"><b>Company colors</b><small>Paint the fleet in your colors. Escorts and special vehicles keep theirs, and any vehicle can opt out in the Fleet tab.</small></span>
    </label>
    <div class="row hq">
      <span class="grow"><b>Body and trim</b><small>{lv.on ? 'Repaints every vehicle' : 'Turn on company colors to use them'}</small></span>
      <input type="color" value={lv.body} onchange={(e) => setLivery({ body: e.currentTarget.value })} aria-label="Body color" />
      <input type="color" value={lv.accent} onchange={(e) => setLivery({ accent: e.currentTarget.value })} aria-label="Trim color" />
    </div>
    <div class="row hq">
      <span class="grow"><b>Contracts office{game.hqContracts ? ` ${game.hqContracts + 1}` : ''}</b><small>{perk ? `Work on ${contractSlots() + 1} contracts at a time instead of ${contractSlots()}, with one more offer on the board.` : `Fully staffed. You can work on ${contractSlots()} contracts at a time.`}</small></span>
      {#if perk}<button class="btn small" disabled={game.level < perk.level || game.coins < perk.price} onclick={buyContractsPerk}>{game.level < perk.level ? `Lv ${perk.level}` : `$${fmt(perk.price)}`}</button>{/if}
    </div>
    <div class="row hq">
      <span class="grow"><b>Auto dispatch</b><small>{game.hqAuto ? 'On. Self-driving vehicles find their own passengers, and rescuers set off for breakdowns on their own.' : 'Unlocks self-driving vehicles that find their own passengers, and sends rescuers out to breakdowns on their own.'}</small></span>
      {#if !game.hqAuto}<button class="btn small" disabled={game.level < HQ.auto.level || game.coins < HQ.auto.price} onclick={buyAutoPerk}>{game.level < HQ.auto.level ? `Lv ${HQ.auto.level}` : `$${fmt(HQ.auto.price)}`}</button>{/if}
    </div>
    <div class="row hq">
      <span class="grow"><b>Heavy haul office{game.hqSuperloads ? ` ${game.hqSuperloads + 1}` : ''}</b><small>{heavy ? `Run ${superloadSlots() + 1} superloads at a time by road, by rail and by sea, instead of ${superloadSlots()} of each.` : `Fully staffed. You can run ${superloadSlots()} superloads at a time by road, by rail and by sea.`}</small></span>
      {#if heavy}<button class="btn small" disabled={game.level < heavy.level || game.coins < heavy.price} onclick={buySuperloadsPerk}>{game.level < heavy.level ? `Lv ${heavy.level}` : `$${fmt(heavy.price)}`}</button>{/if}
    </div>
  {/if}
  {#if projects.length}
    <h3>{projects.some((p) => !game.projects[p.id].built) ? 'Megaprojects' : 'Landmarks'}</h3>
    {#each projects as p (p.id)}<ProjectCard {p} here={c.id} />{/each}
  {/if}
  <h3>Parked here</h3>
  {#each here as v (v.id)}
    <button class="row vrow" animate:flip transition:slide={{ duration: 200 }} onclick={() => { ui.activeVehicle = v.id; ui.picking = false; }}>
      <span class="pv"><Sprite kind={v.kind} model={v.model} cars={consistOf(v)} scale={3} paint={paintOf(v)} /></span>
      <span class="grow"><b>{v.name}</b><small>{v.loop ? 'Repeating, waiting for jobs' : v.cargo.length ? `${v.cargo.length} on board` : 'Empty'}</small></span>
      <span class="act">Load</span>
    </button>
  {:else}
    <p class="muted">{c.anchor ? 'Nothing anchored here. Send an aircraft carrier over.' : 'Nothing parked here. Send a vehicle over, or buy one in the Shop.'}</p>
  {/each}

  {#if incoming.length}
    <h3>On the way</h3>
    {#each incoming as { v, at, later, pick } (v.id)}
      <button class="row vrow" animate:flip transition:slide={{ duration: 200 }} onclick={() => followVehicle(v)}>
        <span class="pv"><Sprite kind={v.kind} model={v.model} cars={consistOf(v)} scale={3} paint={paintOf(v)} /></span>
        <span class="grow"><b>{v.name}</b><small>{pick ? 'Coming to pick up. ' : ''}{later ? `Stops here in ${fmtTime((at - clock.now) / 1000)}, after ${later} other stop${later > 1 ? 's' : ''}` : `Arrives in ${etaText(v)}`}</small></span>
        <span class="act">Watch</span>
      </button>
    {/each}
  {/if}

  {#if !c.anchor}
  <h3>Waiting at {c.name} ({jobs.length})</h3>
  {#each jobs as j (j.id)}
    {@const f = fetcher(j)}
    <div animate:flip transition:slide={{ duration: 200 }}>
      {#if f}<JobRow job={j} at={c.id} note="{f.name} is on its way for it" action="Watch" onclick={() => followVehicle(f)} />
      {:else}<JobRow job={j} at={c.id} action="Send" onclick={() => (ui.sendJob = j.id)} />{/if}
    </div>
  {:else}
    <p class="muted">No jobs right now. New ones turn up every few seconds.</p>
  {/each}
  {/if}
  {#if could.length}
    <h3>Build a megaproject</h3>
    <p class="muted small">Pay up front, then deliver what it needs. {landmarkAt(c.id) ? '' : 'A town can hold one landmark, and each is only built once.'}</p>
    {#each could as p (p.id)}<ProjectCard {p} here={c.id} />{/each}
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
  .hq { align-items: center; gap: 10px; }
  .hq input[type='checkbox'] { width: 20px; height: 20px; flex: none; accent-color: var(--accent); }
  label.hq { cursor: pointer; }
  .hq input[type='color'] { width: 34px; height: 28px; padding: 0; border: 1px solid var(--line); border-radius: 6px; background: none; flex: none; }
  .bar { height: 5px; background: var(--panel-2); border-radius: 3px; overflow: hidden; }
  .bar i { display: block; height: 100%; background: var(--accent); border-radius: 3px; }
</style>
