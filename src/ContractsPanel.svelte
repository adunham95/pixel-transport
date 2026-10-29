<script>
  import { game, clock, cityById, selectCity, acceptContract, dropContract, canAccept, superloadAt, escortText, followVehicle, fmt, fmtTime } from './game.svelte.js';
  import { CONTRACTS, SUPERLOAD, TYPE_LABEL } from './data.js';
  import Icon from './Icon.svelte';
  import { slide, flip } from './motion.js';
  const k = $derived(game.contracts);
  const usual = $derived(k.active.filter((c) => !c.super).length);
  const what = (c) => `${c.n} ${TYPE_LABEL[c.type].toLowerCase()}`;
  // where an active superload's load is right now
  function status(c) {
    const at = superloadAt(c);
    if (at.v) return at.v.trip ? { text: `On its way with ${at.v.name}`, v: at.v } : { text: `On ${at.v.name} at ${cityById[at.v.city].name}` };
    if (at.town) return { text: at.town === c.from ? `Waiting at ${cityById[c.from].name} for a lowboy and its escorts` : `Waiting at ${cityById[at.town].name}` };
    return { text: '' };
  }
</script>

{#snippet town(id)}<button class="town" onclick={() => selectCity(id, true)}>{cityById[id].name}</button>{/snippet}

{#if game.level < CONTRACTS.level}
  <p class="note">Contracts unlock at level {CONTRACTS.level}. Each one asks for a batch of deliveries to one town before time runs out, and pays a bonus on top of what the jobs pay.</p>
{:else}
  <p class="note">Deliver a batch of one kind of job to a town before time runs out for a bonus on top of what the jobs pay. Jobs headed there turn up more often while a contract is running.
    {#if game.level >= SUPERLOAD.level} Superloads are one huge load by road on a lowboy, with escorts driving along. They have no time limit and don’t use up a contract slot.{/if}</p>

  <h3>Working on ({usual} of {CONTRACTS.active})</h3>
  {#each k.active as c (c.id)}
    <div class="row contract" class:super={c.super} animate:flip transition:slide={{ duration: 200 }}>
      <span class="ticon t-{c.type}"><Icon name={c.type} size={16} /></span>
      {#if c.super}
        {@const s = status(c)}
        <span class="grow">
          <b>{c.name}: {@render town(c.from)} to {@render town(c.to)}</b>
          <small>Needs a lowboy and {escortText(c.needs)} · no time limit</small>
          <small>{s.text}</small>
        </span>
        <span class="side">
          <span class="pay">${fmt(c.reward)}</span>
          {#if s.v}<button class="btn small" onclick={() => followVehicle(s.v)}>Watch</button>
          {:else}<button class="btn small ghost" onclick={() => dropContract(c.id)}>Give up</button>{/if}
        </span>
      {:else}
        {@const left = (c.until - clock.now) / 1000}
        <span class="grow">
          <b>{what(c)} to {@render town(c.to)}</b>
          <span class="bar"><i style:width="{(c.done / c.n) * 100}%"></i></span>
          <small>{c.done} of {c.n} delivered · <span class:hurry={left < 120}>{fmtTime(left)} left</span></small>
        </span>
        <span class="side">
          <span class="pay">${fmt(c.reward)}</span>
          <button class="btn small ghost" onclick={() => dropContract(c.id)}>Give up</button>
        </span>
      {/if}
    </div>
  {:else}
    <p class="muted">None yet. Take one from the board below.</p>
  {/each}

  <h3>On offer</h3>
  {#each k.offers as c (c.id)}
    <div class="row contract" class:super={c.super} animate:flip transition:slide={{ duration: 200 }}>
      <span class="ticon t-{c.type}"><Icon name={c.type} size={16} /></span>
      <span class="grow">
        {#if c.super}
          <b><span class="tag hub mini">Superload</span> {c.name}: {@render town(c.from)} to {@render town(c.to)}</b>
          <small>Needs a lowboy and {escortText(c.needs)} · no time limit · offer ends in {fmtTime((c.until - clock.now) / 1000)}</small>
        {:else}
          <b>{what(c)} to {@render town(c.to)}</b>
          <small>{fmtTime(c.time / 1000)} to finish once taken · offer ends in {fmtTime((c.until - clock.now) / 1000)}</small>
        {/if}
      </span>
      <span class="side">
        <span class="pay">${fmt(c.reward)}</span>
        <button class="btn small primary" disabled={!canAccept(c)} onclick={() => acceptContract(c.id)}>Take</button>
      </span>
    </div>
  {:else}
    <p class="muted">No offers right now. New ones turn up every minute or so.</p>
  {/each}
  {#if usual >= CONTRACTS.active && k.offers.some((c) => !c.super)}<p class="muted small">Finish or give up a contract to take another.</p>{/if}
{/if}

<style>
  .contract { align-items: center; }
  .contract.super { border-color: var(--wide); }
  .grow { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
  .town { border: 0; background: none; padding: 0; font: inherit; color: inherit; text-decoration: underline; text-decoration-color: var(--line-strong); text-underline-offset: 2px; cursor: pointer; }
  .side { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
  .bar { height: 5px; background: var(--panel-3); border-radius: 3px; overflow: hidden; }
  .bar i { display: block; height: 100%; background: var(--good); border-radius: 3px; transition: width .3s; }
  .hurry { color: var(--bad); font-weight: 600; }
</style>
