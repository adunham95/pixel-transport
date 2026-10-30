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
  {:else if name === 'celeb'}
    <path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z" />
  {:else if name === 'mail'}
    <rect x="3" y="5.5" width="18" height="13" rx="2" /><path d="m3.5 7 8.5 6.5L20.5 7" />
  {:else if name === 'wide'}
    <rect x="7" y="8" width="10" height="8" rx="1" /><path d="M2 12h3M19 12h3M4 10l-2 2 2 2M20 10l2 2-2 2" />
  {:else if name === 'secure'}
    <rect x="4.5" y="10.5" width="15" height="10" rx="2" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3M12 14.5v2.5" />
  {:else if name === 'tour'}
    <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h3l1.5-2.5h6L16.5 7h3A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z" /><circle cx="12" cy="12.5" r="3.5" />
  {:else if name === 'project'}
    <path d="M4 21V9l8-5 8 5v12" /><path d="M9 21v-6h6v6M4 21h16" />
  {:else if name === 'coin'}
    <circle cx="12" cy="12" r="9" fill="currentColor" stroke="none" /><path d="M12 7.5v9M14.5 9.5c-.5-1-1.4-1.5-2.5-1.5-1.5 0-2.5.8-2.5 2s1 1.6 2.5 2 2.5.8 2.5 2-1 2-2.5 2c-1.2 0-2.1-.6-2.6-1.6" stroke="#5a4314" stroke-width="1.8" />
  {/if}
</svg>
