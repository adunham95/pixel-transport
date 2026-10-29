<script>
  import { game, ui, dev, clock, cityById, spec, tripInfo, fmt, fmtTime } from './game.svelte.js';
  import { MI } from './data.js';
  import Sprite from './Sprite.svelte';
  import { fly, fade } from './motion.js';

  const v = $derived(ui.track != null ? game.vehicles.find((x) => x.id === ui.track && x.trip) : null);
  const info = $derived(v && tripInfo(v, clock.now));
  const value = $derived(v ? v.cargo.reduce((s, j) => s + j.pay, 0) : 0);
  // wall clock time it'll land, allowing for dev speed-up
  const clockAt = (at) => new Date(Date.now() + (at - clock.now) / dev.speed).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const KIND = { train: 'Train', plane: 'Plane', boat: 'Boat', truck: 'Road' };
  const DONE = { train: 'travelled', plane: 'flown', boat: 'sailed', truck: 'driven' };
</script>

{#if v}
  <div class="track" transition:fly={{ y: -20, duration: 240 }}>
    {#key v.id}<div in:fade={{ duration: 180 }}>
    <div class="track-head">
      <span class="pv"><Sprite kind={v.kind} model={v.model} cars={v.cars ?? []} scale={3} /></span>
      <span class="grow">
        <b>{v.name}</b>
        <small>{KIND[v.kind]} · {spec(v).name}{info.stops ? ` · ${info.stops + 1} stops` : ''}</small>
      </span>
      {#if ui.follow !== v.id}<button class="btn small" onclick={() => (ui.follow = v.id)}>Follow</button>{/if}
      <button class="x" aria-label="Close" onclick={() => (ui.track = ui.follow = null)}>×</button>
    </div>

    <div class="ends">
      <div><small>From</small><b>{cityById[info.from].name}</b><small>Left {fmtTime((clock.now - info.departAt) / 1000)} ago</small></div>
      <div class="to"><small>To</small><b>{cityById[info.to].name}</b><small>ETA {fmtTime((info.endAt - clock.now) / 1000)} · {clockAt(info.endAt)}</small></div>
    </div>

    <div class="prog" style:--p="{info.progress * 100}%"><i></i><span></span></div>
    <div class="dist">
      <small>{fmt((info.len - info.left) * MI)} mi {DONE[v.kind]}</small>
      <small>{fmt(info.left * MI)} mi to go</small>
    </div>

    {#if info.stops || v.cargo.length}
      <div class="foot">
        {#if info.stops}<small>Next stop <b>{cityById[info.next].name}</b> in {fmtTime((info.nextAt - clock.now) / 1000)}</small>{/if}
        {#if v.cargo.length}<small>{v.cargo.length} on board · <b>${fmt(value)}</b></small>{/if}
      </div>
    {/if}
    </div>{/key}
  </div>
{/if}

<style>
  .track { pointer-events: auto; width: 100%; background: var(--panel-2); color: var(--ink); border-radius: 14px; box-shadow: 0 6px 20px rgba(10,16,30,.28); padding: 10px 12px; }
  .track-head { display: flex; align-items: center; gap: 10px; }
  .x { border: 0; background: var(--panel-3); width: 28px; height: 28px; flex: none; cursor: pointer; border-radius: 50%; font-weight: 600; font-size: 16px; }
  .ends { display: flex; justify-content: space-between; gap: 12px; margin-top: 10px; }
  .ends div { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
  .ends .to { text-align: right; align-items: flex-end; }
  .ends b { font-size: 17px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
  small { color: var(--ink-soft); font-size: 12px; font-variant-numeric: tabular-nums; }
  small b { color: var(--ink); font-weight: 600; }
  .prog { position: relative; height: 6px; margin: 10px 0 4px; background: var(--panel-3); border-radius: 3px; }
  .prog i { position: absolute; inset: 0 auto 0 0; width: var(--p); background: linear-gradient(90deg, color-mix(in srgb, var(--accent) 55%, transparent), var(--accent)); border-radius: 3px; }
  .prog span { position: absolute; top: 50%; left: var(--p); width: 12px; height: 12px; transform: translate(-50%, -50%); background: var(--accent); border: 2px solid var(--panel-2); border-radius: 50%; box-shadow: 0 0 0 1px var(--line-strong); }
  .prog span::after { content: ''; position: absolute; inset: -5px; border-radius: 50%; border: 2px solid var(--accent); animation: ping 1.6s ease-out infinite; }
  @keyframes ping { from { transform: scale(.5); opacity: .9; } to { transform: scale(1.4); opacity: 0; } }
  .dist, .foot { display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
  .foot { margin-top: 6px; padding-top: 6px; border-top: 1px solid var(--line); }
  @media (prefers-reduced-motion: reduce) { .prog span::after { animation: none; display: none; } }
</style>
