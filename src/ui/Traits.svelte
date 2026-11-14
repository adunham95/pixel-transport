<script module>
  // what a self-driving vehicle is called, and what it does, by kind of vehicle
  const AUTO = { truck: ['Self-driving', 'drives'], train: ['Self-driving', 'drives'], boat: ['Self-sailing', 'sails'], plane: ['Self-flying', 'flies'] };
  export const autoLabel = (kind) => (AUTO[kind] ?? AUTO.truck)[0];
  export const autoVerb = (kind) => (AUTO[kind] ?? AUTO.truck)[1];
</script>

<script>
  // pills for the things that make a model unusual at a glance: it drives itself, or it's a prototype
  import Icon from './Icon.svelte';
  let { s, kind = 'truck' } = $props();
</script>

{#if s.auto}<span class="status auto" title="Finds and carries its own jobs with auto dispatch at your HQ"><Icon name="auto" size={11} />{autoLabel(kind)}</span>{/if}
{#if s.prototype}<span class="status proto" title="Still being tested: it breaks down now and then, even when new"><Icon name="proto" size={11} />Prototype</span>{/if}
