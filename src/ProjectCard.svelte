<script>
  import { game, cityById, selectCity, followVehicle, fmt, isOpen, startProject, projectProgress, projectTowns, projectLoads, cantHost, superloadCarrier } from './game.svelte.js';
  import { TYPE_LABEL } from './data.js';
  import Icon from './Icon.svelte';
  // here: the town page it's shown on, if any, so a landmark can be built there
  let { p, here = null } = $props();
  const s = $derived(game.projects[p.id]);
  const towns = $derived(projectTowns(p));
  const WHERE = { road: 'with roads', air: 'with an airport', port: 'with a port' };
  // what's stopping it from being started (from this page), or ''
  const why = $derived.by(() => {
    if (game.level < p.level) return `Lv ${p.level}`;
    if (p.link) { const shut = p.link.find((t) => !isOpen(t)); return shut ? `Unlock ${cityById[shut].name}` : ''; }
    return here ? cantHost(p, cityById[here]) : '';
  });
  const loads = $derived(s && !s.built ? projectLoads(p) : []);
</script>

{#snippet town(id)}<button class="town" onclick={() => selectCity(id, true)}>{cityById[id].name}</button>{/snippet}

<div class="project" class:built={s?.built} class:locked={!s && game.level < p.level}>
  <div class="head">
    <span class="ticon"><Icon name="project" size={16} /></span>
    <span class="grow">
      <b>{p.name}{#if s?.built}<span class="tag hub mini">Built</span>{:else if s}<span class="tag mini">Under way</span>{/if}</b>
      <small>
        {#if p.link}Bridge between {@render town(p.link[0])} and {@render town(p.link[1])}
        {:else if s}At {@render town(s.at)}
        {:else}Goes up in one town {WHERE[p.where]}{/if}
      </small>
    </span>
    {#if !s && (p.link || here)}
      <button class="btn small primary" disabled={!!why || game.coins < p.price} title={why} onclick={() => startProject(p.id, here)}>{why && why.startsWith('Lv') ? why : `$${fmt(p.price)}`}</button>
    {:else if !s}
      <span class="pay">{game.level < p.level ? `Lv ${p.level}` : `$${fmt(p.price)}`}</span>
    {/if}
  </div>
  <p class="about">{p.about}</p>
  {#if !s}
    {#if why && !why.startsWith('Lv')}<p class="muted small">{why}.</p>{/if}
    {#if !p.link && !here}<p class="muted small">Pick a town on the map and build it from its page.</p>{/if}
    <div class="needs">
      {#each Object.entries(p.needs) as [t, n]}<span class="meter t-{t}"><Icon name={t} size={12} />{n}</span>{/each}
      {#each p.supers ?? [] as name}<span class="meter t-wide"><Icon name="wide" size={12} />{name}</span>{/each}
    </div>
  {:else if !s.built}
    <div class="bar"><i style:width="{projectProgress(p) * 100}%"></i></div>
    <div class="needs">
      {#each Object.entries(p.needs) as [t, n]}
        {@const got = Math.min(n, s.got[t] ?? 0)}
        <span class="meter t-{t}" class:full={got >= n} title="{TYPE_LABEL[t]} delivered to {towns.map((id) => cityById[id].name).join(' or ')}"><Icon name={t} size={12} />{got}/{n}</span>
      {/each}
    </div>
    <p class="muted small">Deliver to {towns.length > 1 ? 'either end' : cityById[towns[0]].name}. Jobs headed there turn up more often while it’s being built.</p>
    {#each loads as l}
      <div class="load">
        <Icon name="wide" size={12} />
        {#if l.v}
          <small>{l.name} {l.v.trip ? 'on its way with' : 'on'} <b>{l.v.name}</b></small>
          {#if l.v.trip}<button class="btn small" onclick={() => followVehicle(l.v)}>Watch</button>{/if}
        {:else}
          <small>{l.name} waiting at {@render town(l.town)} for a {superloadCarrier(l.by)} and its escorts</small>
        {/if}
      </div>
    {/each}
    {#if p.supers?.length}<p class="muted small">{s.supers} of {p.supers.length} superload{p.supers.length > 1 ? 's' : ''} delivered.</p>{/if}
  {/if}
</div>

<style>
  .project { padding: 10px 12px; margin-bottom: 8px; background: var(--panel-2); border: 1px solid var(--line); border-radius: var(--r); display: flex; flex-direction: column; gap: 6px; }
  .project.built { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 8%, var(--panel-2)); }
  .project.locked { opacity: .6; }
  .head { display: flex; align-items: center; gap: 10px; }
  .head small { display: block; color: var(--ink-soft); font-size: 12px; }
  .about { margin: 0; font-size: 13px; }
  .needs { display: flex; flex-wrap: wrap; gap: 4px; }
  .needs .meter { padding: 1px 7px; font-size: 12px; gap: 3px; }
  .bar { height: 6px; background: var(--panel-3); border-radius: 3px; overflow: hidden; }
  .bar i { display: block; height: 100%; background: var(--good); border-radius: 3px; transition: width .3s; }
  .load { display: flex; align-items: center; gap: 6px; color: var(--wide); }
  .load small { flex: 1; color: var(--ink-soft); font-size: 12px; }
  .town { border: 0; background: none; padding: 0; font: inherit; color: inherit; text-decoration: underline; text-decoration-color: var(--line-strong); text-underline-offset: 2px; cursor: pointer; }
</style>
