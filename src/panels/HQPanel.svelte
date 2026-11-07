<script>
  // The HQ's own page, opened from its town's page (or the Shop's Upgrades tab): the company's
  // colors, the offices you can staff to unlock more, and a way through to its routes.
  import { game, ui, cityById, fmt, setLivery, nextContractsPerk, buyContractsPerk, contractSlots, nextSuperloadsPerk, buySuperloadsPerk, superloadSlots, buyAutoPerk } from '../game/game.svelte.js';
  import { HQ } from '../game/data.js';
  import Icon from '../ui/Icon.svelte';
  import NavHeader from '../ui/NavHeader.svelte';
  const town = $derived(cityById[game.hq]);
  const lv = $derived(game.livery ?? { body: '#2a6fd6', accent: '#f2c14e', on: false });
  const perk = $derived(nextContractsPerk());
  const heavy = $derived(nextSuperloadsPerk());
  // a perk's button: its price, or the level it opens at
  const priceOf = (p) => (game.level < p.level ? `Lv ${p.level}` : `$${fmt(p.price)}`);
  function toRoutes() { ui.hqPage = false; ui.tab = 'routes'; }
</script>

<NavHeader title="Headquarters" sub="At {town.name}" back={town.name} onback={() => (ui.hqPage = false)} />

<div class="hero">
  <span class="badge" style:--b={lv.on ? lv.body : 'var(--accent)'} style:--t={lv.on ? lv.accent : 'var(--accent-ink)'}><Icon name="town" size={34} /></span>
  <div class="stats">
    <div class="stat"><small>Routes</small><b>{game.routes.length}</b></div>
    <div class="stat"><small>Contracts</small><b>{contractSlots()}</b></div>
    <div class="stat"><small>Superloads</small><b>{superloadSlots()} each</b></div>
  </div>
</div>

<p class="sec">Company colors</p>
<div class="group">
  <label class="row">
    <span class="grow"><b>Paint the fleet</b><small>Escorts and special vehicles keep theirs</small></span>
    <input class="switch" type="checkbox" checked={lv.on} onchange={(e) => setLivery({ on: e.currentTarget.checked })} />
  </label>
  <label class="row" class:off={!lv.on}>
    <span class="grow"><b>Body</b></span>
    <input type="color" value={lv.body} disabled={!lv.on} onchange={(e) => setLivery({ body: e.currentTarget.value })} aria-label="Body color" />
  </label>
  <label class="row" class:off={!lv.on}>
    <span class="grow"><b>Trim</b></span>
    <input type="color" value={lv.accent} disabled={!lv.on} onchange={(e) => setLivery({ accent: e.currentTarget.value })} aria-label="Trim color" />
  </label>
</div>
<p class="gnote">Any vehicle can opt out on its page in the Fleet tab.</p>

<p class="sec">Offices</p>
<div class="group">
  <div class="row">
    <span class="ticon"><Icon name="contracts" size={18} /></span>
    <span class="grow"><b>Contracts office{game.hqContracts ? ` ${game.hqContracts + 1}` : ''}</b><small>{perk ? `${contractSlots() + 1} contracts at once, and one more offer` : `Fully staffed: ${contractSlots()} at once`}</small></span>
    {#if perk}<button class="btn small" class:primary={game.level >= perk.level && game.coins >= perk.price} disabled={game.level < perk.level || game.coins < perk.price} onclick={buyContractsPerk}>{priceOf(perk)}</button>{:else}<span class="done"><Icon name="check" size={20} /></span>{/if}
  </div>
  <div class="row">
    <span class="ticon"><Icon name="speed" size={18} /></span>
    <span class="grow"><b>Auto dispatch</b><small>{game.hqAuto ? 'On: self-driving vehicles find their own jobs' : 'Self-driving vehicles, and rescuers that set off on their own'}</small></span>
    {#if !game.hqAuto}<button class="btn small" class:primary={game.level >= HQ.auto.level && game.coins >= HQ.auto.price} disabled={game.level < HQ.auto.level || game.coins < HQ.auto.price} onclick={buyAutoPerk}>{priceOf(HQ.auto)}</button>{:else}<span class="done"><Icon name="check" size={20} /></span>{/if}
  </div>
  <div class="row">
    <span class="ticon"><Icon name="wide" size={18} /></span>
    <span class="grow"><b>Heavy haul office{game.hqSuperloads ? ` ${game.hqSuperloads + 1}` : ''}</b><small>{heavy ? `${superloadSlots() + 1} superloads at once by road, rail and sea` : `Fully staffed: ${superloadSlots()} by road, rail and sea`}</small></span>
    {#if heavy}<button class="btn small" class:primary={game.level >= heavy.level && game.coins >= heavy.price} disabled={game.level < heavy.level || game.coins < heavy.price} onclick={buySuperloadsPerk}>{priceOf(heavy)}</button>{:else}<span class="done"><Icon name="check" size={20} /></span>{/if}
  </div>
</div>

<p class="sec">Routes</p>
<div class="group">
  <button class="row" onclick={toRoutes}>
    <span class="ticon"><Icon name="routes" size={18} /></span>
    <span class="grow"><b>Repeating routes</b><small>{game.routes.length ? `${game.routes.length} set up` : 'Loops your vehicles run on their own'}</small></span>
    <span class="go"><Icon name="chevron" size={18} /></span>
  </button>
</div>

<style>
  .hero { display: flex; flex-direction: column; align-items: center; gap: 12px; margin: 4px 0 6px; }
  /* the HQ's badge wears the company colors once they're on */
  .badge { display: grid; place-items: center; width: 76px; height: 76px; border-radius: 24px; background: var(--b); color: var(--t); }
  .hero .stats { width: 100%; }
  .ticon { color: var(--ink-soft); }
  .done { display: flex; flex: none; color: var(--good); }
  .row.off { opacity: .5; }
  label.row { cursor: pointer; }
  input[type='color'] { width: 44px; height: 32px; padding: 0; border: 0; border-radius: 8px; background: none; flex: none; cursor: pointer; }
  input[type='color']:disabled { cursor: default; }
</style>
