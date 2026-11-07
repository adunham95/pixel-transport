import './app.css';
import './ui/prefs.svelte.js';
import { installRipple } from './ui/ripple.js';
installRipple();
import { mount } from 'svelte';
import App from './App.svelte';
mount(App, { target: document.getElementById('app') });
