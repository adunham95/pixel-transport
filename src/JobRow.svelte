<script>
  import Icon from './Icon.svelte';
  import { cityById, fmt, clock, jobTtl, fetcher, contractFor, escortText } from './game.svelte.js';
  import { TYPE_LABEL } from './data.js';
  let { job, at = null, note = '', onclick = null, disabled = false, loaded = false, action = '' } = $props();
  const leaving = $derived(at === job.from && job.contract == null && job.at && clock.now - job.at > jobTtl(job) - 60000 && !fetcher(job));
  const sub = $derived([at && job.from !== at ? `Dropped off here, from ${cityById[job.from].name}` : job.escort ? `Superload: ${job.name}, needs ${escortText(job.escort)}` : TYPE_LABEL[job.type], leaving && 'Leaving soon', !job.escort && contractFor(job) && 'For a contract', note].filter(Boolean).join('. '));
</script>

{#snippet inner()}
  <span class="ticon t-{job.type}"><Icon name={job.type} size={16} /></span>
  <span class="grow"><b>To {cityById[job.to].name}</b><small>{sub}</small></span>
  <span class="pay">${fmt(job.pay)}</span>
  {#if action}<span class="act">{action}</span>{/if}
{/snippet}

{#if onclick}
  <button class="row job" class:loaded {disabled} {onclick}>{@render inner()}</button>
{:else}
  <div class="row job">{@render inner()}</div>
{/if}
