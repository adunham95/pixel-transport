<script>
  import Icon from './Icon.svelte';
  import { cityById, fmt, clock, jobTtl, fetcher, contractFor, escortText, projectById } from '../game/game.svelte.js';
  import { TYPE_LABEL, CONTAINER } from '../game/data.js';
  let { job, at = null, note = '', onclick = null, disabled = false, loaded = false, action = '' } = $props();
  // containers pay more for every other kind of vehicle that carries them
  const KIND = { truck: 'truck', train: 'train', boat: 'ship', plane: 'plane' };
  const via = (j) => j.via?.length ? `Container, so far by ${j.via.map((k) => KIND[k]).join(' and ')}. +${Math.round(CONTAINER.bonus * 100)}% for each other kind` : `Container. +${Math.round(CONTAINER.bonus * 100)}% for each kind of vehicle past the first`;
  const leaving = $derived(at === job.from && job.contract == null && job.project == null && job.at && clock.now - job.at > jobTtl(job) - 60000 && !fetcher(job));
  const sub = $derived([at && job.from !== at ? `Dropped off here, from ${cityById[job.from].name}` : job.escort ? `Superload: ${job.name}, needs ${escortText(job.escort)}` : job.celeb ? `${job.celeb}. Rides in a gold limo or gold jet` : job.type === 'tour' ? 'Tourists. Only ride in show-off vehicles' : job.type === 'container' ? via(job) : TYPE_LABEL[job.type], job.lucky && 'Lucky cargo: who knows what’s inside', leaving && 'Leaving soon', !job.escort && contractFor(job) && 'For a contract', job.project != null && `For the ${projectById[job.project].name}`, note].filter(Boolean).join('. '));
</script>

{#snippet inner()}
  <span class="ticon t-{job.type}"><Icon name={job.type} size={16} /></span>
  <span class="grow"><b>To {cityById[job.to].name}</b><small>{sub}</small></span>
  <span class="pay">${fmt(job.pay)}{#if job.lucky}<em class="luck">?</em>{/if}</span>
  {#if action}<span class="act">{action}</span>{/if}
{/snippet}

{#if onclick}
  <button class="row job" class:loaded class:celeb={job.celeb} class:lucky={job.lucky} {disabled} {onclick}>{@render inner()}</button>
{:else}
  <div class="row job" class:celeb={job.celeb} class:lucky={job.lucky}>{@render inner()}</div>
{/if}

<style>
  /* a celebrity's ride stands out in gold */
  .celeb { border-color: #e8b830; background: color-mix(in srgb, #e8b830 12%, var(--panel-2)); }
  /* lucky cargo pays anywhere from half to five times as much */
  .lucky { border-style: dashed; border-color: var(--good); }
  .luck { font-style: normal; color: var(--good); margin-left: 2px; }
</style>
