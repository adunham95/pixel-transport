<script>
  import { game, ui, cityById, etaText, fmtTime, clock, followVehicle, isOpen, connections, unlockPrice, unlockCity, carrierAt, fmt, townSize, sizeName, growthOf, buyDepot, fetcher, consistOf, paintOf, buildHQ, hqPrice, mixOf, projectTowns, landmarkAt, cantHost, escortKind, rescueAt, rescueStatus, rolesText, sendRescue, rescueCandidates, sendToRescue, buyLine, lineTowns, onLine, lineFits, lineProblem, assignLine } from '../game/game.svelte.js';
  import { CITY_PRICE, DEPOT, HQ, TYPE_LABEL, PROJECTS, CONTINENTS, RESCUE, LINES } from '../game/data.js';
  import ProjectCard from '../ui/ProjectCard.svelte';
  import Icon from '../ui/Icon.svelte';
  import Sprite from '../ui/Sprite.svelte';
  import JobRow from '../ui/JobRow.svelte';
  import LoadPanel from './LoadPanel.svelte';
  import SendPanel from './SendPanel.svelte';
  import HQPanel from './HQPanel.svelte';
  import { fly, slide, flip } from '../ui/motion.js';
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
  // a rescue going on here, and who's covering it
  const rescue = $derived(rescueAt(c.id));
  const rst = $derived(rescue ? rescueStatus(rescue) : null);
  let showAllCands = $state(false);
  const active = $derived(game.vehicles.find((v) => v.id === ui.activeVehicle && v.city === c.id));
  const sending = $derived(jobs.find((j) => j.id === ui.sendJob && !fetcher(j)));
  // megaprojects here: the ones started (a bridge ending here, the landmark going up here), and
  // the ones that could be (bridges ending here, landmarks this town could take) once they're
  // no more than a level off, so a new player's town page isn't a wall of locked landmarks
  const open = $derived(!c.anchor && isOpen(c.id));
  const projects = $derived(open ? PROJECTS.filter((p) => game.projects[p.id] && projectTowns(p).includes(c.id)) : []);
  const could = $derived(open ? PROJECTS.filter((p) => !game.projects[p.id] && p.level <= game.level + 1 && (p.link ? p.link.includes(c.id) : !landmarkAt(c.id) && !cantHost(p, c))) : []);
</script>

{#if active}
  <div in:fly={{ x: 28, duration: 220 }}><LoadPanel v={active} /></div>
{:else if sending}
  <div in:fly={{ x: 28, duration: 220 }}><SendPanel job={sending} at={c.id} /></div>
{:else if ui.hqPage && game.hq === c.id}
  <div in:fly={{ x: 28, duration: 220 }}><HQPanel /></div>
{:else}
  <div in:fly={{ x: -28, duration: 220 }}>
  <div class="cityhead">
    <h2>{c.name}</h2>
    <span class="region"><Icon name="pin" size={13} />{c.anchor ? 'Open sea' : c.cont < 0 ? 'Lone island' : CONTINENTS[c.cont].name}</span>
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
      {#each Object.entries(LINES) as [kind, L] (kind)}{#if game.lines[kind][c.id]}<span class="tag">{L.name}</span>{/if}{/each}
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
  {#if rescue && rst}
    {@const k = RESCUE.kinds[rescue.kind]}
    <div class="alert bad rescue">
      <span class="ai"><Icon name="alert" size={18} /></span>
      <span class="grow">
        <b>{k.name}</b>
        <small>Needs {rolesText(k.needs)} parked here. {fmtTime((rescue.until - clock.now) / 1000)} left. Pays ${fmt(k.pay)}.</small>
        {#if rst.here.length || rst.coming.length}<small>{rst.here.length ? `Here: ${rst.here.map((v) => v.name).join(', ')}. ` : ''}{rst.coming.length ? `On the way: ${rst.coming.map((v) => v.name).join(', ')}.` : ''}</small>{/if}
        {#if k.needs.includes('air')}<small>A rescue aircraft is a helicopter or any plane that lands anywhere.</small>{/if}
      </span>
      {#if rst.missing.length}
        {@const cands = rescueCandidates(rescue)}
        {#if cands.length}
          <div class="btns"><button class="btn small primary" onclick={() => sendRescue(rescue)}>Send the nearest</button></div>
          <ul class="cands">
            {#each cands.slice(0, showAllCands ? cands.length : 4) as o (o.v.id)}
              {@const late = clock.now + o.l.time * 1000 > rescue.until}
              <li class:late>
                <span class="pv"><Sprite kind={o.v.kind} model={o.v.model} cars={consistOf(o.v)} scale={2} paint={paintOf(o.v)} /></span>
                <span class="grow"><b>{o.v.name}</b><small>{late ? 'Too far to make it in time · ' : ''}As {RESCUE.roles[o.role][0]} · from {cityById[o.v.city].name} · {fmtTime(o.l.time)} · ${fmt(o.l.cost)}{o.v.cargo.length ? ` · ${o.v.cargo.length} on board` : ''}</small></span>
                <button class="btn small" disabled={game.coins < o.l.cost} onclick={() => sendToRescue(o.v, rescue)}>Send</button>
              </li>
            {/each}
          </ul>
          {#if cands.length > 4}<button class="link more" onclick={() => (showAllCands = !showAllCands)}>{showAllCands ? 'Fewer' : `All ${cands.length} that can go`}</button>{/if}
        {:else}
          <small class="none">Nothing free can get here right now. Park {rolesText(rst.missing)} somewhere it can drive, sail or fly from, or take one off its route.</small>
        {/if}
      {/if}
    </div>
  {/if}
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
      {#if c.road}
        {#each Object.entries(LINES) as [kind, L] (kind)}
          {@const what = kind === 'bus' ? 'passengers' : 'mail'}
          <div class="gline depot">
            {#if game.lines[kind][c.id]}
              {@const n = lineTowns(kind).length}
              {@const runs = onLine(kind).length}
              {@const free = here.filter((v) => !v.loop?.line && lineFits(v, kind) && !lineProblem(v, kind))}
              <small><b>{L.name}.</b> {n < 2 ? `Build another ${L.name.toLowerCase()} in a town nearby to start a ${L.line.toLowerCase()}.` : `${n} on the ${L.line.toLowerCase()}, ${runs} vehicle${runs === 1 ? '' : 's'} running it, picking up ${what} between them.`}</small>
              {#each free.slice(0, 3) as v (v.id)}
                <button class="btn small" title="Run {v.name} round every {L.name.toLowerCase()} it can drive to" onclick={() => assignLine(v, kind)}>Put {v.name} on</button>
              {/each}
            {:else}
              <small>Build a {L.name.toLowerCase()}: road vehicles you put on the {L.line.toLowerCase()} loop round every {L.name.toLowerCase()}, picking up {what}. No HQ needed.</small>
              <button class="btn small" disabled={game.level < L.level || game.coins < L.price} onclick={() => buyLine(kind, c.id)}>{game.level < L.level ? `Lv ${L.level}` : `$${fmt(L.price)}`}</button>
            {/if}
          </div>
        {/each}
      {/if}
      {#if !game.hq}
        <div class="gline depot">
          <small>Build your HQ here: unlocks repeating routes and company colors, and sells perks. You only get one.</small>
          <button class="btn small" disabled={game.level < HQ.level || game.coins < hqPrice()} onclick={() => buildHQ(c.id)}>{game.level < HQ.level ? `Lv ${HQ.level}` : hqPrice() ? `$${fmt(hqPrice())}` : 'Free'}</button>
        </div>
      {/if}
    </div>
  {/if}
  {#if game.hq === c.id}
    <!-- the HQ has its own page, for colors and offices -->
    <h3>Headquarters</h3>
    <div class="group">
      <button class="row" onclick={() => (ui.hqPage = true)}>
        <span class="ticon hqicon"><Icon name="town" size={18} /></span>
        <span class="grow"><b>Your headquarters</b><small>Company colors, offices and perks</small></span>
        <span class="go"><Icon name="chevron" size={18} /></span>
      </button>
    </div>
  {/if}
  {#if projects.length}
    <h3>{projects.some((p) => !game.projects[p.id].built) ? 'Megaprojects' : 'Landmarks'}</h3>
    {#each projects as p (p.id)}<ProjectCard {p} here={c.id} />{/each}
  {/if}
  <h3>Parked here</h3>
  <!-- each opens its load screen, so these end in a chevron rather than a button -->
  <div class="group">
  {#each here as v (v.id)}
    <button class="row vrow" animate:flip transition:slide={{ duration: 200 }} onclick={() => { ui.activeVehicle = v.id; ui.plan = []; ui.picking = !!escortKind(v); }}>
      <span class="pv"><Sprite kind={v.kind} model={v.model} cars={consistOf(v)} scale={3} paint={paintOf(v)} /></span>
      <span class="grow"><b>{v.name}</b><small>{escortKind(v) ? 'Escort. Tap to move it' : v.loop ? 'Repeating, waiting for jobs' : v.held ? `Stopped on a route, next ${cityById[v.held.stops[0]].name}` : v.cargo.length ? `${v.cargo.length} on board` : 'Empty. Tap to load'}</small></span>
      <span class="go"><Icon name="chevron" size={18} /></span>
    </button>
  {/each}
  </div>
  {#if !here.length}
    <p class="muted">{c.anchor ? 'Nothing anchored here. Send an aircraft carrier over.' : 'Nothing parked here. Send a vehicle over, or buy one in the Shop.'}</p>
  {/if}

  {#if incoming.length}
    <h3>On the way</h3>
    <div class="group">
    {#each incoming as { v, at, later, pick } (v.id)}
      <button class="row vrow" animate:flip transition:slide={{ duration: 200 }} onclick={() => followVehicle(v)}>
        <span class="pv"><Sprite kind={v.kind} model={v.model} cars={consistOf(v)} scale={3} paint={paintOf(v)} /></span>
        <span class="grow"><b>{v.name}</b><small>{pick ? 'Coming to pick up. ' : ''}{later ? `Stops here in ${fmtTime((at - clock.now) / 1000)}, after ${later} other stop${later > 1 ? 's' : ''}` : `Arrives in ${etaText(v)}`}</small></span>
        <span class="act">Watch</span>
      </button>
    {/each}
    </div>
  {/if}

  {#if !c.anchor}
  <h3>Waiting at {c.name} ({jobs.length})</h3>
  <div class="group">
  {#each jobs as j (j.id)}
    {@const f = fetcher(j)}
    <div animate:flip transition:slide={{ duration: 200 }}>
      {#if f}<JobRow job={j} at={c.id} note="{f.name} is on its way for it" action="Watch" onclick={() => followVehicle(f)} />
      {:else}<JobRow job={j} at={c.id} action="Send" onclick={() => (ui.sendJob = j.id)} />{/if}
    </div>
  {/each}
  </div>
  {#if !jobs.length}<p class="muted">No jobs right now. New ones turn up every few seconds.</p>{/if}
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
  .region { display: inline-flex; align-items: center; gap: 4px; margin: -4px 0 2px; font-size: 13px; color: var(--ink-soft); }
  .rescue { margin-top: 10px; }
  .rescue .grow { display: flex; flex-direction: column; gap: 2px; }
  /* min-width 0 all the way down, so a long line wraps inside the card rather than pushing Send off it */
  .cands { flex: 1 0 100%; min-width: 0; margin: 0; padding: 0 0 0 28px; list-style: none; display: flex; flex-direction: column; gap: 4px; }
  .cands li { display: flex; align-items: center; gap: 8px; min-width: 0; padding: 6px 8px; border-radius: 10px; background: var(--panel); }
  .cands li .btn { flex: none; }
  .cands .pv { flex: none; display: grid; place-items: center; width: 40px; height: 28px; overflow: hidden; }
  .cands .grow { flex: 1; min-width: 0; }
  .cands b { font-size: 13px; }
  .cands .late { opacity: .6; }
  .cands .late small { color: var(--bad); }
  .cands b { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .cands small { font-size: 12px; line-height: 1.35; overflow-wrap: anywhere; }
  .rescue .more { padding-left: 28px; font-size: 13px; }
  .rescue .none { flex: 1 0 100%; padding-left: 28px; color: var(--ink-soft); }
  .grow-card { margin-top: 10px; padding: 10px 12px; background: var(--panel-3); border-radius: var(--r); display: flex; flex-direction: column; gap: 6px; }
  .gline { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }
  .gline small { color: var(--ink-soft); font-size: 12px; }
  .gline b { font-weight: 600; }
  .depot { flex-wrap: nowrap; padding-top: 6px; border-top: 1px solid var(--line); }
  .bar { height: 5px; background: var(--panel-2); border-radius: 3px; overflow: hidden; }
  .bar i { display: block; height: 100%; background: var(--accent); border-radius: 3px; }
</style>
