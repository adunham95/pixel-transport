<script>
  let { name, size = 14 } = $props();
</script>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  {#if name === 'pax'}
    <circle cx="12" cy="7" r="3.5" /><path d="M5 21v-1.5A5.5 5.5 0 0 1 10.5 14h3a5.5 5.5 0 0 1 5.5 5.5V21" />
  {:else if name === 'cargo'}
    <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z" /><path d="M3 7.5 12 12l9-4.5M12 12v9" />
  {:else if name === 'bulk'}
    <path d="M2.5 19.5 8 10l3.5 5 3-4.5 7 9z" /><path d="M8 10l1.5 3M14.5 10.5l1 2.5" />
  {:else if name === 'fuel'}
    <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />
  {:else if name === 'coin'}
    <circle cx="12" cy="12" r="9" fill="currentColor" stroke="none" /><path d="M12 7.5v9M14.5 9.5c-.5-1-1.4-1.5-2.5-1.5-1.5 0-2.5.8-2.5 2s1 1.6 2.5 2 2.5.8 2.5 2-1 2-2.5 2c-1.2 0-2.1-.6-2.6-1.6" stroke="#5a4314" stroke-width="1.8" />
  {/if}
</svg>
