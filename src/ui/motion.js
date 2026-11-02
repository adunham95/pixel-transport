import { fly as flyT, fade as fadeT, slide as slideT, crossfade } from 'svelte/transition';
import { flip as flipA } from 'svelte/animate';
import { cubicOut } from 'svelte/easing';

// everything snaps into place instead of moving when the device asks for less motion
export const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const calm = (fn) => (node, p = {}) => fn(node, reduced ? { ...p, duration: 0 } : p);

export const fly = calm(flyT);
export const fade = calm(fadeT);
export const slide = calm(slideT);
export const flip = (node, a, p = {}) => flipA(node, a, reduced ? { ...p, duration: 0 } : { duration: 240, easing: cubicOut, ...p });

// jobs glide between the waiting list and the on-board list
export const [send, receive] = crossfade({
  duration: reduced ? 0 : 280,
  easing: cubicOut,
  fallback: (node) => slideT(node, { duration: reduced ? 0 : 180 }),
});
