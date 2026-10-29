<script>
  import { game, clock, cityById, selectCity, acceptContract, dropContract, fmt, fmtTime } from './game.svelte.js';
  import { CONTRACTS, TYPE_LABEL } from './data.js';
  import Icon from './Icon.svelte';
  import { slide, flip } from './motion.js';
  const k = $derived(game.contracts);
  const full = $derived(k.active.length >= CONTRACTS.active);
  const what = (c) => `${c.n} ${TYPE_LABEL[c.type].toLowerCase()}`;
</script>

{#if game.level < CONTRACTS.level}
  <p class="note">Contracts unlock at level {CONTRACTS.level}. Each one asks for a batch of deliveries to one town before time runs out, and pays a bonus on top of what the jobs pay.</p>
{:else}
  <p class="note">Deliver a batch of one kind of job to a town before time runs out for a bonus on top of what the jobs pay. Jobs headed there turn up more often while a contract is running.</p>

  <h3>Working on ({k.active.length} of {CONTRACTS.active})</h3>
  {#each k.active as c (c.id)}
    {@const left = (c.until - clock.now) / 1000}
    <div class="row contract" animate:flip transition:slide={{ duration: 200 }}>
      <span class="ticon t-{c.type}"><Icon name={c.type} size={16} /></span>
      <span class="grow">
        <b>{what(c)} to <button class="town" onclick={() => selectCity(c.to, true)}>{cityById[c.to].name}</button></b>
        <span class="bar"><i style:width="{(c.done / c.n) * 100}%"></i></span>
        <small>{c.done} of {c.n} delivered · <span class:hurry={left < 120}>{fmtTime(left)} left</span></small>
      </span>
      <span class="side">
        <span class="pay">${fmt(c.reward)}</span>
        <button class="btn small ghost" onclick={() => dropContract(c.id)}>Give up</button>
      </span>
    </div>
  {:else}
    <p class="muted">None yet. Take one from the board below.</p>
  {/each}

  <h3>On offer</h3>
  {#each k.offers as c (c.id)}
    <div class="row contract" animate:flip transition:slide={{ duration: 200 }}>
      <span class="ticon t-{c.type}"><Icon name={c.type} size={16} /></span>
      <span class="grow">
        <b>{what(c)} to <button class="town" onclick={() => selectCity(c.to, true)}>{cityById[c.to].name}</button></b>
        <small>{fmtTime(c.time / 1000)} to finish once taken · offer ends in {fmtTime((c.until - clock.now) / 1000)}</small>
      </span>
      <span class="side">
        <span class="pay">${fmt(c.reward)}</span>
        <button class="btn small primary" disabled={full} onclick={() => acceptContract(c.id)}>Take</button>
      </span>
    </div>
  {:else}
    <p class="muted">No offers right now. New ones turn up every minute or so.</p>
  {/each}
  {#if full && k.offers.length}<p class="muted small">Finish or give up a contract to take another.</p>{/if}
{/if}

<style>
  .contract { align-items: center; }
  .grow { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
  .town { border: 0; background: none; padding: 0; font: inherit; color: inherit; text-decoration: underline; text-decoration-color: var(--line-strong); text-underline-offset: 2px; cursor: pointer; }
  .side { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
  .bar { height: 5px; background: var(--panel-3); border-radius: 3px; overflow: hidden; }
  .bar i { display: block; height: 100%; background: var(--good); border-radius: 3px; transition: width .3s; }
  .hurry { color: var(--bad); font-weight: 600; }
</style>
