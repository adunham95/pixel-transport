<script>
  import { capacity, used, deckUsed, deckRoom } from './game.svelte.js';
  import { JOB_TYPES } from './data.js';
  import Icon from './Icon.svelte';
  // small used/room badges for each hold, plus truck spaces on car ferries and cargo planes
  let { v } = $props();
  const cap = $derived(capacity(v));
  const u = $derived(used(v));
  const deck = $derived(deckRoom(v));
</script>

{#if JOB_TYPES.some((t) => cap[t]) || deck}
  <span class="meters mini">
    {#each JOB_TYPES as t}
      {#if cap[t]}<span class="meter t-{t}" class:full={u[t] >= cap[t]}><Icon name={t} size={12} />{u[t]}/{cap[t]}</span>{/if}
    {/each}
    {#if deck}<span class="meter" class:full={deckUsed(v) >= deck}>Deck {deckUsed(v)}/{deck}</span>{/if}
  </span>
{/if}

<style>
  .mini { margin: 4px 0 0; gap: 4px; }
  .mini .meter { padding: 2px 7px; font-size: 12px; gap: 4px; }
</style>
