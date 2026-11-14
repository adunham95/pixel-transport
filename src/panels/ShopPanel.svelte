<script>
  import { game, ui, cityById, buyPlane, buyEngine, buyBoat, buyTruck, isOpen, canBase, fmt, fmtTime, paintFor, selectCity, openHQ, buyUsed, spec, wear, clock } from '../game/game.svelte.js';
  import { ENGINES, CARS, PLANES, BOATS, BARGES, TRUCKS, TRAILERS, MI, TYPE_LABEL, JOB_TYPES, HQ, ESCORT_LABEL, PROJECTS } from '../game/data.js';
  import ProjectCard from '../ui/ProjectCard.svelte';
  import Sprite from '../ui/Sprite.svelte';
  import Icon from '../ui/Icon.svelte';
  import Traits from '../ui/Traits.svelte';
  import NavHeader from '../ui/NavHeader.svelte';
  import { fly } from '../ui/motion.js';

  // one tab per kind of vehicle, each with what it pulls (cars, trailers, barges) listed underneath
  const KINDS = [
    { id: 'plane', label: 'Planes', one: 'Plane', specs: PLANES, buy: buyPlane, needs: 'an airport', where: 'air' },
    { id: 'train', label: 'Trains', one: 'Train', specs: ENGINES, buy: buyEngine, needs: 'a station', where: 'rail', tails: CARS, tail: 'car' },
    { id: 'truck', label: 'Trucks', one: 'Truck', specs: TRUCKS, buy: buyTruck, needs: 'roads', where: 'road', tails: TRAILERS, tail: 'trailer' },
    { id: 'boat', label: 'Boats', one: 'Boat', specs: BOATS, buy: buyBoat, needs: 'a port', where: 'port', tails: BARGES, tail: 'barge' },
  ];
  const kindOf = (id) => KINDS.find((k) => k.id === id);
  const c = $derived(cityById[game.selected]);
  const tab = $derived(kindOf(ui.shopTab));

  // what each model carries itself, by job type
  const capOf = (kind, s) => (kind === 'plane' ? { pax: s.pax, cargo: s.cargo, ...s.hold } : s.cap ?? {});
  // the cars, trailers or barges it can pull
  function tailsOf(kind, s) {
    if (!s.maxCars || s.superload) return [];
    const all = Object.entries(kindOf(kind).tails);
    return all.filter(([k, t]) => (!s.pulls || s.pulls.includes(k)) && !(s.freightOnly && t.holds === 'pax')).map(([, t]) => t);
  }
  // every job type it can take, on board or behind
  function carries(kind, s) {
    if (s.superload) return ['wide'];
    return JOB_TYPES.filter((t) => capOf(kind, s)[t] || tailsOf(kind, s).some((x) => x.holds === t));
  }
  function notes(kind, s) {
    const out = [];
    const tails = tailsOf(kind, s), what = kindOf(kind).tail;
    if (capOf(kind, s).tour) out.push('Show-off vehicle: the only ride tourists take');
    if (s.superload) out.push('Carries one superload from a contract');
    if (s.escort) out.push(`Escorts superloads as a ${ESCORT_LABEL[s.escort]}`);
    if (s.helps) out.push(`Can also escort superloads as a ${ESCORT_LABEL[s.helps]}`);
    if (tails.length) out.push(`Pulls up to ${s.maxCars} ${s.pulls ? s.pulls.map((k) => kindOf(kind).tails[k].short.toLowerCase()).join(' or ') + ' ' : s.freightOnly ? 'freight ' : ''}${what}${s.maxCars > 1 ? 's' : ''}`);
    for (const [t, n] of Object.entries(s.pays ?? {})) out.push(`${TYPE_LABEL[t]} pay ${n}×`);
    // a truck's deck is the ferry space it takes up, not room it has
    if (s.deck && kind !== 'truck') out.push(`${s.deck} ${s.deckFor ?? 'truck'} space${s.deck > 1 ? 's' : ''}`);
    if (s.vtol) out.push('Lands anywhere');
    else if (s.seaplane) out.push('Lands at ports too');
    if (s.deckSpace) out.push('Lands on carriers');
    if (s.deckFor === 'plane') out.push('Anchors at sea');
    if (s.maglev) out.push('Maglev lines only');
    if (s.harbor) out.push('Ports with a station only');
    if (s.amphibious) out.push('Swims between ports');
    const self = kind === 'plane' ? 'Flies itself' : 'Drives itself';
    if (s.auto) out.push(game.hqAuto ? `${self}, finding its own jobs` : `${self}. Needs auto dispatch at your HQ`);
    if (s.prototype) out.push(kind === 'plane' ? 'A prototype: one of a kind, in its test checks' : 'A prototype: quick, but it breaks down now and then, even when new');
    if (s.celebrity) out.push('Celebrities ride in it');
    if (s.escort === 'tow') out.push('Goes out to trucks that break down');
    if (s.noFerry) out.push('Too long for car ferries');
    return out;
  }
  // what the buy button says, and whether it works, for a model at the selected town
  function offer(kind, k, s) {
    const locked = game.level < s.level;
    const here = !c.anchor && isOpen(c.id) && canBase(kind, k, c);
    const needsHq = s.auto && !game.hqAuto;
    return { locked, ok: !locked && here && !needsHq && game.coins >= s.price, text: locked ? `Lv ${s.level}` : needsHq ? 'Needs HQ' : !here ? 'Not here' : `$${fmt(s.price)}` };
  }
  // buying opens the new vehicle in the Fleet tab, so the model page is done with
  function buy(kind, k) {
    const n = game.vehicles.length;
    kindOf(kind).buy(k);
    if (game.vehicles.length > n) ui.shopModel = null;
  }

  // the job types anything in this tab carries, for the filter
  const types = $derived(tab ? JOB_TYPES.filter((t) => Object.values(tab.specs).some((s) => carries(tab.id, s).includes(t))) : []);
  const type = $derived(types.includes(ui.shopType) ? ui.shopType : null);
  const models = $derived(tab ? Object.entries(tab.specs).filter(([, s]) => !type || carries(tab.id, s).includes(type)).sort(([, a], [, b]) => a.level - b.level || a.price - b.price) : []);
  const open = $derived(models.filter(([, s]) => game.level >= s.level));
  const soon = $derived(models.filter(([, s]) => game.level < s.level));
  const SOON = 3;
  const tails = $derived(tab?.tails ? Object.values(tab.tails).filter((t) => !type || t.holds === type).sort((a, b) => a.level - b.level) : []);
  // the model whose own page is open
  const model = $derived(ui.shopModel && kindOf(ui.shopModel.kind)?.specs[ui.shopModel.k] ? { ...ui.shopModel, s: kindOf(ui.shopModel.kind).specs[ui.shopModel.k] } : null);

  // a new category starts at the top of its list
  let catsEl = $state();
  function pick(id) { ui.shopTab = id; ui.shopMore = false; catsEl?.closest(".body")?.scrollTo(0, 0); }
</script>

<!-- the few things that say what a model holds: its own room, and what its cars or trailers can hold -->
{#snippet holds(kind, s)}
  {@const cap = capOf(kind, s)}
  {@const pulled = tailsOf(kind, s)}
  <span class="holds">
    {#each JOB_TYPES as t}{#if cap[t]}<span class="meter t-{t}"><Icon name={t} size={12} />{cap[t]}</span>{/if}{/each}
    {#each JOB_TYPES.filter((t) => !cap[t] && pulled.some((x) => x.holds === t)) as t}<span class="meter pull t-{t}" title="In its {kindOf(kind).tail}s"><Icon name={t} size={12} /></span>{/each}
    {#if s.superload}<span class="meter t-wide"><Icon name="wide" size={12} />1</span>{/if}
  </span>
{/snippet}
{#snippet pips(n)}<span class="pips">{#each [1, 2, 3, 4, 5] as i}<i class:on={i <= n}></i>{/each}</span>{/snippet}

{#if model}
  {@const { kind, k, s } = model}
  {@const o = offer(kind, k, s)}
  {@const pulled = tailsOf(kind, s)}
  <div in:fly={{ x: 28, duration: 220 }}>
  <NavHeader title={s.name} sub="{kindOf(kind).one} · level {s.level}" back={kindOf(kind).label} onback={() => (ui.shopModel = null)} />
  <div class="hero">
    <span class="pv big"><Sprite {kind} model={k} cars={demo(kind, s)} scale={5} paint={paintFor(kind, k)} /></span>
    {#if s.auto || s.prototype}<span class="traits"><Traits {s} {kind} /></span>{/if}
    {@render holds(kind, s)}
  </div>

  <div class="group">
    <div class="row"><span class="grow"><b>Price</b></span><span class="val">${fmt(s.price)}</span></div>
    <div class="row"><span class="grow"><b>Speed</b></span>{@render pips(s.pips)}</div>
    {#if s.range}<div class="row"><span class="grow"><b>Range</b></span><span class="val">{Math.round(s.range * MI)} mi</span></div>{/if}
    {#each JOB_TYPES.filter((t) => capOf(kind, s)[t]) as t}
      <div class="row"><span class="grow"><b>{TYPE_LABEL[t]}</b></span><span class="val t-{t}"><Icon name={t} size={14} /> {capOf(kind, s)[t]}</span></div>
    {/each}
  </div>

  {#if notes(kind, s).length}
    <p class="sec">Good to know</p>
    <div class="group">
      {#each notes(kind, s) as n}<div class="row"><span class="grow"><small class="note">{n}</small></span></div>{/each}
    </div>
  {/if}

  {#if pulled.length}
    <p class="sec">{kindOf(kind).tail}s it can pull</p>
    <div class="tails">
      {#each pulled as t}
        <div class="tail" class:locked={game.level < t.level}>
          <span class="swatch" style:--c={t.color}></span>
          <span class="grow"><b>{t.short ?? t.name}</b><small><Icon name={t.holds} size={11} /> {t.cap} · {game.level < t.level ? `Lv ${t.level}` : `$${fmt(t.price)}`}</small></span>
        </div>
      {/each}
    </div>
    <p class="gnote">Hook them up from the vehicle’s page in the Fleet tab.</p>
  {/if}

  <div class="footer">
    <button class="btn primary" disabled={!o.ok} onclick={() => buy(kind, k)}>
      {#if o.ok}Buy for ${fmt(s.price)} at {c.name}{:else if o.text === 'Not here'}Can’t base one at {c.name}{:else if o.text.startsWith('$')}Need ${fmt(s.price)}{:else}{o.text}{/if}
    </button>
  </div>
  </div>
{:else}
  <div in:fly={{ x: -28, duration: 220 }}>
  <!-- Android-style tabs: names along the top, an accent bar under the open one -->
  <div class="cats" role="tablist" aria-label="Kind of vehicle" bind:this={catsEl}>
    {#each KINDS as k}<button role="tab" aria-selected={ui.shopTab === k.id} class:on={ui.shopTab === k.id} onclick={() => pick(k.id)}>{k.label}</button>{/each}
    <button role="tab" aria-selected={ui.shopTab === 'more'} class:on={ui.shopTab === 'more'} onclick={() => pick('more')}>Upgrades</button>
  </div>

  {#if game.usedLot}
    {@const u = game.usedLot}
    {@const s = spec(u)}
    <div class="group">
      <div class="row used">
        <span class="pv wide"><Sprite kind={u.kind} model={u.model} scale={4} /></span>
        <span class="grow">
          <b><span class="status warn">Used lot</span>{s.name}</b>
          <small>At <button class="town" onclick={() => selectCity(u.at, true)}>{cityById[u.at].name}</button>, before you can buy one new (Lv {s.level}). It has {fmt(u.miles * MI)} mi on it, so it burns {Math.round(wear(u) * 100)}% more fuel until it’s serviced.</small>
          <small>Gone in {fmtTime((u.until - clock.now) / 1000)}</small>
        </span>
        <button class="btn primary small usedbuy" disabled={game.coins < u.price} onclick={buyUsed}>${fmt(u.price)}<s>${fmt(s.price)}</s></button>
      </div>
    </div>
  {/if}

  {#if ui.shopTab === 'more'}
    <div class="group">
      <div class="row" class:locked={game.level < HQ.level}>
        <span class="ticon"><Icon name="town" size={18} /></span>
        <span class="grow">
          <b>Headquarters</b>
          <small>{game.hq ? `At ${cityById[game.hq].name}. Colors and perks are on its town page.` : 'Build one on any town’s page. Unlocks repeating routes, company colors and perks.'}</small>
        </span>
        {#if game.hq}<button class="btn small" onclick={openHQ}>Open</button>
        {:else}<span class="pay">{game.level < HQ.level ? `Lv ${HQ.level}` : `$${fmt(HQ.price)}`}</span>{/if}
      </div>
    </div>
    <p class="sec">Megaprojects</p>
    <p class="gnote">Pay up front, then deliver what they need. Landmarks change what their town turns up and draw tourists. Bridges join landmasses by road and rail.</p>
    {#each PROJECTS as p (p.id)}<ProjectCard {p} />{/each}
  {:else}
    {#if c.anchor}
      <p class="note"><b>{c.name}</b> is open sea. Select a town to buy vehicles there.</p>
    {:else if !isOpen(c.id)}
      <p class="note"><b>{c.name}</b> is locked. Unlock it, or pick another town, to buy vehicles there.</p>
    {:else}
      <p class="gnote where"><Icon name="pin" size={13} /> New {tab.label.toLowerCase()} show up at <b>{c.name}</b>.{#if !c[tab.where]} It has no {tab.needs.replace(/^an? /, '')}, so only some can be bought here.{/if}</p>
    {/if}

    {#if types.length > 1}
      <div class="fchips">
        <button class:on={!type} onclick={() => (ui.shopType = null)}>All</button>
        {#each types as t}<button class:on={type === t} onclick={() => (ui.shopType = type === t ? null : t)}><span class="t-{t} ti"><Icon name={t} size={13} /></span>{TYPE_LABEL[t]}</button>{/each}
      </div>
    {/if}

    {#snippet row(k, s)}
      {@const o = offer(tab.id, k, s)}
      <div class="row model" class:locked={o.locked}>
        <button class="rowlink" onclick={() => (ui.shopModel = { kind: tab.id, k })}>
          <span class="pv wide"><Sprite kind={tab.id} model={k} cars={demo(tab.id, s)} scale={4} paint={paintFor(tab.id, k)} /></span>
          <span class="grow">
            <b>{s.name}<Traits {s} kind={tab.id} /></b>
            {@render holds(tab.id, s)}
            <small>Speed {@render pips(s.pips)}{s.range ? ` · ${Math.round(s.range * MI)} mi` : ''}</small>
          </span>
        </button>
        <button class="btn small" class:primary={o.ok} disabled={!o.ok} onclick={() => buy(tab.id, k)}>{#if o.locked}<Icon name="secure" size={12} />{/if}{o.text}</button>
      </div>
    {/snippet}

    <div class="group">{#each open as [k, s] (k)}{@render row(k, s)}{/each}</div>
    {#if !open.length}<p class="muted">Nothing yet. Level up to unlock some.</p>{/if}

    {#if soon.length}
      <p class="sec">Coming up</p>
      <div class="group">
        {#each ui.shopMore ? soon : soon.slice(0, SOON) as [k, s] (k)}{@render row(k, s)}{/each}
        {#if soon.length > SOON}
          <button class="row tbtn" onclick={() => (ui.shopMore = !ui.shopMore)}>{ui.shopMore ? 'Show fewer' : `Show ${soon.length - SOON} more`}</button>
        {/if}
      </div>
    {/if}

    {#if tails.length}
      <p class="sec">{tab.tail}s</p>
      <div class="tails">
        {#each tails as t}
          <div class="tail" class:locked={game.level < t.level}>
            <span class="swatch" style:--c={t.color}></span>
            <span class="grow"><b>{t.short ?? t.name}</b><small><Icon name={t.holds} size={11} /> {t.cap} · {game.level < t.level ? `Lv ${t.level}` : `$${fmt(t.price)}`}</small></span>
          </div>
        {/each}
      </div>
      <p class="gnote">Hook them up from a vehicle’s page in the Fleet tab.</p>
    {/if}
  {/if}
  </div>
{/if}

<script module>
  // demo consist for the shop picture: what it pulls, or a superload tractor's rocket stage
  function demo(kind, s) {
    if (!s.maxCars && !s.superload) return [];
    if (s.superload) return [{ kind: 'load', model: { truck: 'rocket', train: 'reactor', boat: 'crane' }[kind] }];
    if (kind === 'truck') return (s.pulls ? Array(s.maxCars).fill(s.pulls[0]) : ['van', 'dump', 'tank']).slice(0, Math.min(3, s.maxCars));
    if (kind === 'boat') return ['deck', 'hopper', 'tank'].slice(0, s.maxCars);
    return (s.pulls ? Array(s.maxCars).fill(s.pulls[0]) : s.freightOnly ? ['box', 'hopper', 'tank'] : ['pax', 'box', 'tank']).slice(0, Math.min(3, s.maxCars));
  }
</script>

<style>
  /* Android's scrollable tabs: names along the top with an accent bar under the open one, over a
     hairline, sticking to the top of the panel */
  .cats { position: sticky; top: -4px; z-index: 2; display: flex; margin: -4px -14px 10px; padding: 0 6px; overflow-x: auto; scrollbar-width: none; background: var(--panel); box-shadow: inset 0 -1px 0 var(--line); }
  .cats::-webkit-scrollbar { display: none; }
  .cats button { position: relative; flex: 1 0 auto; padding: 12px 12px 11px; border: 0; background: none; font: inherit; font-size: 14px; font-weight: 500; color: var(--ink-soft); cursor: pointer; white-space: nowrap; }
  .cats button.on { color: var(--ink); font-weight: 600; }
  .cats button.on::after { content: ""; position: absolute; left: 12px; right: 12px; bottom: 0; height: 3px; border-radius: 3px 3px 0 0; background: var(--accent); }
  .where { margin: 0 4px 10px; }
  .where :global(svg) { vertical-align: -2px; margin-right: 2px; }
  .fchips .ti { display: flex; }
  .fchips button.on .ti { color: inherit; }
  .grow > b { display: flex; align-items: center; gap: 6px; }
  .holds { display: flex; flex-wrap: wrap; gap: 4px; margin: 3px 0 2px; }
  .holds .meter { padding: 1px 7px; font-size: 12px; gap: 3px; }
  .holds .pull { opacity: .75; background: transparent; border: 1px dashed currentColor; padding: 0 6px; }
  .model .btn { flex: none; min-width: 76px; display: inline-flex; align-items: center; justify-content: center; gap: 4px; }
  .locked .rowlink { opacity: .6; }
  .row.locked > :not(.btn) { opacity: .6; }
  .used { box-shadow: inset 3px 0 0 var(--accent); }
  .used small { display: block; }
  .usedbuy { flex: none; display: flex; flex-direction: column; align-items: center; line-height: 1.2; }
  .usedbuy s { font-size: 11px; font-weight: 500; opacity: .7; }
  .town { border: 0; background: none; padding: 0; font: inherit; color: inherit; text-decoration: underline; cursor: pointer; }
  .tails { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 4px; margin-bottom: 12px; }
  .tail { display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: var(--panel-2); border-radius: 12px; }
  .tail.locked { opacity: .55; }
  .tail .swatch { width: 22px; height: 22px; border-radius: 7px; }
  .tail small { display: inline-flex; align-items: center; gap: 3px; }
  .ticon { color: var(--ink-soft); }
  /* a model's own page */
  .hero { display: flex; flex-direction: column; align-items: center; gap: 8px; margin: 2px 0 14px; }
  .pv.big { width: auto; min-width: 160px; max-width: 100%; height: 96px; padding: 0 18px; border-radius: 18px; }
  .hero .holds { justify-content: center; }
  .traits { display: flex; flex-wrap: wrap; justify-content: center; gap: 5px; }
  .model .grow b { flex-wrap: wrap; row-gap: 3px; }
  .val { display: inline-flex; align-items: center; gap: 4px; font-weight: 600; font-variant-numeric: tabular-nums; }
  .note { font-size: 14px; color: var(--ink); }
</style>
