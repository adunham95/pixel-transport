<script>
  import { drawArt, artSize, consistBox, drawConsistRow, loadArt } from './sprites.js';
  // scale 4 is used for the larger shop previews
  let { kind, model, cars = [], scale = 3 } = $props();
  let canvas;
  const maxW = $derived(scale >= 4 ? 78 : 58);
  const maxH = $derived(scale >= 4 ? 42 : 28);
  const chain = $derived(kind === 'train' || kind === 'truck');
  const box = $derived(chain ? consistBox(kind, model, cars) : artSize(kind, model));
  const k = $derived(Math.min(scale * 1.4, maxW / (box.w + 2), maxH / (box.h + 2)));
  $effect(() => {
    const list = [...cars], b = box, kk = k;
    loadArt().then(() => {
      if (!canvas) return;
      const d = window.devicePixelRatio || 1;
      canvas.width = Math.ceil((b.w + 2) * kk * d);
      canvas.height = Math.ceil((b.h + 2) * kk * d);
      const ctx = canvas.getContext('2d');
      ctx.setTransform(kk * d, 0, 0, kk * d, 0, 0);
      ctx.clearRect(0, 0, b.w + 2, b.h + 2);
      // engine or cab at the right end, cars or trailers trailing left
      if (chain) drawConsistRow(ctx, 1 + b.w - artSize(kind, model).w / 2, 1 + b.h / 2, kind, model, list);
      else drawArt(ctx, 1 + b.w / 2, 1 + b.h / 2, 0, kind, model);
    });
  });
</script>
<canvas bind:this={canvas} style:width="{(box.w + 2) * k}px" style:height="{(box.h + 2) * k}px"></canvas>
<style>canvas { display: block; flex: none; }</style>
