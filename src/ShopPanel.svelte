<script>
  import { game, ui, cityById, buyPlane, buyEngine, buyBoat, buyTruck, isOpen, canBase, fmt, paintFor, selectCity } from './game.svelte.js';
  import { ENGINES, CARS, PLANES, BOATS, BARGES, TRUCKS, TRAILERS, MI, TYPE_LABEL, JOB_TYPES, HQ, ESCORT_LABEL } from './data.js';
  import Sprite from './Sprite.svelte';
  import Icon from './Icon.svelte';

  // one tab per kind of vehicle, each with what it pulls (cars, trailers, barges) listed underneath
  const KINDS = [
    { id: 'plane', label: 'Planes', specs: PLANES, buy: buyPlane, needs: 'an airport', where: 'air' },
    { id: 'train', label: 'Trains', specs: ENGINES, buy: buyEngine, needs: 'a station', where: 'rail', tails: CARS, tail: 'car' },
    { id: 'truck', label: 'Trucks', specs: TRUCKS, buy: buyTruck, needs: 'roads', where: 'road', tails: TRAILERS, tail: 'trailer' },
    { id: 'boat', label: 'Boats', specs: BOATS, buy: buyBoat, needs: 'a port', where: 'port', tails: BARGES, tail: 'barge' },
  ];
  const c = $derived(cityById[game.selected]);
  const tab = $derived(KINDS.find((k) => k.id === ui.shopTab));

  // what each model carries itself, by job type
  const capOf = (kind, s) => (kind === 'plane' ? { pax: s.pax, cargo: s.cargo, ...s.hold } : s.cap ?? {});
  // the cars, trailers or barges it can pull
  function tailsOf(kind, s) {
    if (!s.maxCars || s.superload) return [];
    const all = Object.entries(KINDS.find((k) => k.id === kind).tails);
    return all.filter(([k, t]) => (!s.pulls || s.pulls.includes(k)) && !(s.freightOnly && t.holds === 'pax')).map(([, t]) => t);
  }
  // every job type it can take, on board or behind
  function carries(kind, s) {
    if (s.superload) return ['wide'];
    return JOB_TYPES.filter((t) => capOf(kind, s)[t] || tailsOf(kind, s).some((x) => x.holds === t));
  }
  function notes(kind, s) {
    const out = [];
    const tails = tailsOf(kind, s), what = KINDS.find((k) => k.id === kind).tail;
    if (s.superload) out.push('Carries one superload from a contract');
    if (s.escort) out.push(`Escorts superloads as a ${ESCORT_LABEL[s.escort]}`);
    if (s.helps) out.push(`Can also escort superloads as a ${ESCORT_LABEL[s.helps]}`);
    if (tails.length) out.push(`Pulls up to ${s.maxCars} ${s.pulls ? s.pulls.map((k) => KINDS.find((x) => x.id === kind).tails[k].short.toLowerCase()).join(' or ') + ' ' : s.freightOnly ? 'freight ' : ''}${what}${s.maxCars > 1 ? 's' : ''}`);
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
    if (s.noFerry) out.push('Too long for car ferries');
    return out;
  }

  // the job types anything in this tab carries, for the filter
  const types = $derived(JOB_TYPES.filter((t) => Object.values(tab.specs).some((s) => carries(tab.id, s).includes(t))));
  const type = $derived(types.includes(ui.shopType) ? ui.shopType : null);
  const models = $derived(Object.entries(tab.specs).filter(([, s]) => !type || carries(tab.id, s).includes(type)).sort(([, a], [, b]) => a.level - b.level || a.price - b.price));
  const open = $derived(models.filter(([, s]) => game.level >= s.level));
  const soon = $derived(models.filter(([, s]) => game.level < s.level));
  const SOON = 3;
  const tails = $derived(tab.tails ? Object.values(tab.tails).filter((t) => !type || t.holds === type).sort((a, b) => a.level - b.level) : []);

  function pick(id) { ui.shopTab = id; ui.shopMore = false; }
</script>

<nav class="cats">
  {#each KINDS as k}<button class:on={ui.shopTab === k.id} onclick={() => pick(k.id)}>{k.label}</button>{/each}
  <button class:on={ui.shopTab === 'more'} onclick={() => pick('more')}>Upgrades</button>
</nav>

{#if ui.shopTab === 'more'}
  <div class="shop" class:locked={game.level < HQ.level}>
    <span class="grow">
      <b>Headquarters</b>
      <small>{game.hq ? `At ${cityById[game.hq].name}. Set company colors and buy perks on its town page.` : 'Build one on any town’s page. Unlocks repeating routes for the whole fleet, company colors and HQ perks.'}</small>
    </span>
    {#if game.hq}<button class="btn" onclick={() => selectCity(game.hq)}>Visit</button>
    {:else}<span class="pay">{game.level < HQ.level ? `Lv ${HQ.level}` : `$${fmt(HQ.price)}`}</span>{/if}
  </div>
{:else}
  {#if c.anchor}
    <p class="note"><b>{c.name}</b> is open sea. Select a town to buy vehicles there.</p>
  {:else if !isOpen(c.id)}
    <p class="note"><b>{c.name}</b> is locked. Unlock it, or pick another town, to buy vehicles there.</p>
  {:else}
    <p class="note">New vehicles show up at <b>{c.name}</b>.{#if !c[tab.where]} It has no {tab.needs.replace(/^an? /, '')}, so only some {tab.label.toLowerCase()} can be bought here.{/if}</p>
  {/if}

  {#if types.length > 1}
    <div class="types">
      <button class:on={!type} onclick={() => (ui.shopType = null)}>All</button>
      {#each types as t}<button class="t-{t}" class:on={type === t} onclick={() => (ui.shopType = type === t ? null : t)}><Icon name={t} size={13} />{TYPE_LABEL[t]}</button>{/each}
    </div>
  {/if}

  {#snippet row(k, s)}
    {@const locked = game.level < s.level}
    {@const here = !c.anchor && isOpen(c.id) && canBase(tab.id, k, c)}
    {@const cap = capOf(tab.id, s)}
    {@const pulled = tailsOf(tab.id, s)}
    <div class="shop" class:locked>
      <span class="pv wide"><Sprite kind={tab.id} model={k} cars={demo(tab.id, s)} scale={4} paint={paintFor(tab.id, k)} /></span>
      <span class="grow">
        <b>{s.name}</b>
        <span class="holds">
          {#each JOB_TYPES as t}{#if cap[t]}<span class="meter t-{t}"><Icon name={t} size={12} />{cap[t]}</span>{/if}{/each}
          {#each JOB_TYPES.filter((t) => !cap[t] && pulled.some((x) => x.holds === t)) as t}<span class="meter pull t-{t}" title="In its {tab.tail}s"><Icon name={t} size={12} /></span>{/each}
          {#if s.superload}<span class="meter t-wide"><Icon name="wide" size={12} />1</span>{/if}
        </span>
        {#if notes(tab.id, s).length}<small>{notes(tab.id, s).join('. ')}</small>{/if}
        <small>{s.range ? `Range ${Math.round(s.range * MI)} mi. ` : ''}Speed <span class="pips">{#each [1, 2, 3, 4, 5] as n}<i class:on={n <= s.pips}></i>{/each}</span></small>
      </span>
      <button class="btn primary" disabled={locked || !here || game.coins < s.price} onclick={() => tab.buy(k)}>{locked ? `Lv ${s.level}` : !here ? 'Not here' : `$${fmt(s.price)}`}</button>
    </div>
  {/snippet}

  {#each open as [k, s] (k)}{@render row(k, s)}{:else}<p class="muted">Nothing yet. Level up to unlock some.</p>{/each}

  {#if soon.length}
    <h3>Coming up</h3>
    {#each ui.shopMore ? soon : soon.slice(0, SOON) as [k, s] (k)}{@render row(k, s)}{/each}
    {#if soon.length > SOON}
      <button class="btn ghost more" onclick={() => (ui.shopMore = !ui.shopMore)}>{ui.shopMore ? 'Show fewer' : `Show ${soon.length - SOON} more`}</button>
    {/if}
  {/if}

  {#if tails.length}
    <h3>{tab.tail[0].toUpperCase() + tab.tail.slice(1)}s</h3>
    <p class="muted small">Hook them up from the Fleet tab.</p>
    <div class="tails">
      {#each tails as t}
        <div class="tail" class:locked={game.level < t.level}>
          <span class="swatch" style:--c={t.color}></span>
          <span class="grow"><b>{t.short ?? t.name}</b><small><Icon name={t.holds} size={11} /> {t.cap} · {game.level < t.level ? `Lv ${t.level}` : `$${fmt(t.price)}`}</small></span>
        </div>
      {/each}
    </div>
  {/if}
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
  .cats { position: sticky; top: 0; z-index: 2; box-shadow: 0 -12px 0 6px var(--panel); display: grid; grid-template-columns: repeat(5, 1fr); gap: 3px; padding: 3px; margin-bottom: 8px; background: var(--panel-3); border-radius: 11px; }
  .cats button { border: 0; background: transparent; padding: 7px 2px; border-radius: 8px; font-weight: 500; font-size: 13px; color: var(--ink-soft); cursor: pointer; white-space: nowrap; }
  .cats button.on { background: var(--panel-2); color: var(--ink); font-weight: 600; box-shadow: var(--shadow); }
  .types { display: flex; flex-wrap: wrap; gap: 5px; margin: 8px 0 10px; }
  .types button { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; font-size: 12px; font-weight: 500; border-radius: 999px; border: 1px solid var(--line); background: var(--panel-2); cursor: pointer; }
  .types button:not(.on) { color: var(--ink-soft); }
  .types button.on { background: color-mix(in srgb, currentColor 14%, var(--panel-2)); border-color: currentColor; }
  .types button.on:first-child { color: var(--ink); }
  .grow > b { display: block; }
  .holds { display: flex; flex-wrap: wrap; gap: 4px; margin: 3px 0 2px; }
  .holds .meter { padding: 1px 7px; font-size: 12px; gap: 3px; }
  .holds .pull { opacity: .75; background: transparent; border: 1px dashed currentColor; padding: 0 6px; }
  .more { width: 100%; margin-bottom: 8px; }
  .tails { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 6px; }
  .tail { display: flex; align-items: center; gap: 8px; padding: 7px 8px; background: var(--panel-2); border: 1px solid var(--line); border-radius: var(--r); }
  .tail.locked { opacity: .55; }
  .tail .swatch { width: 22px; height: 22px; border-radius: 7px; }
  .tail small { display: inline-flex; align-items: center; gap: 3px; }
</style>
