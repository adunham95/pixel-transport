import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { viteSingleFile } from 'vite-plugin-singlefile';
// static/ holds the icons and web manifest, served from the site root
export default defineConfig({ plugins: [svelte(), viteSingleFile()], publicDir: 'static', build: { outDir: 'dist' } });
