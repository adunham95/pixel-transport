<script>
  import { drawArt, artSize, consistBox, drawConsistRow, loadArt, artReady } from './sprites.js';
  // scale 4 is used for the larger shop previews; paint is company colors for the lead unit, or null
  let { kind, model, cars = [], scale = 3, paint = null } = $props();
  let canvas;
  const maxW = $derived(scale >= 4 ? 78 : 58);
  const maxH = $derived(scale >= 4 ? 42 : 28);
  const chain = $derived(kind !== 'plane');
  const box = $derived(chain ? consistBox(kind, model, cars) : artSize(kind, model));
  const k = $derived(Math.min(scale * 1.4, maxW / (box.w + 2), maxH / (box.h + 2)));
  $effect(() => {
    const list = [...cars], b = box, kk = k, pt = paint && { ...paint };
    Promise.all([loadArt(), artReady(kind, model, pt)]).then(() => {
      if (!canvas) return;
      const d = window.devicePixelRatio || 1;
      canvas.width = Math.ceil((b.w + 2) * kk * d);
      canvas.height = Math.ceil((b.h + 2) * kk * d);
      const ctx = canvas.getContext('2d');
      ctx.setTransform(kk * d, 0, 0, kk * d, 0, 0);
      ctx.clearRect(0, 0, b.w + 2, b.h + 2);
      // engine or cab at the right end, cars or trailers trailing left
      if (chain) drawConsistRow(ctx, 1 + b.w - artSize(kind, model).w / 2, 1 + b.h / 2, kind, model, list, pt);
      else drawArt(ctx, 1 + b.w / 2, 1 + b.h / 2, 0, kind, model, { paint: pt });
    });
  });
</script>
<canvas bind:this={canvas} style:width="{(box.w + 2) * k}px" style:height="{(box.h + 2) * k}px"></canvas>
<style>canvas { display: block; flex: none; }</style>
