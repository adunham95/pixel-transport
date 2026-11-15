# Simulator

Plays the real game code (`src/game`) headless in Node, with a fake clock and seeded randomness, so you can try a change out in seconds instead of playing for an hour. Each scenario gets a fresh game.

```sh
npm run sim                      # every scenario
npm run sim bus mail             # scenarios whose file names start with these
npm run sim starter -- --seed 7  # other randomness (same seed, same game, every time)
npm run sim -- --report          # how the company did at the end of each one
npm run sim -- --log             # every toast, with the game time it showed up at
```

It exits with 1 if any check fails, so it can run in CI.

### Progression

`npm run sim progression` plays three days the way a half idle player would: playing by hand to level 3, an HQ with rail and freight routes, bus and mail lines down Westmark from level 4, then 15 to 30 minute check-ins with hours away (game closed) in between and overnight. It prints each session (coins, XP, XP a minute, how much of the fleet is on routes or broken down) and when each level came. It takes a minute or two, so a plain `npm run sim` skips it.

```sh
npm run sim progression -- --report     # also each route's takings at the end
npm run sim progression -- --log        # also everything the player did
npm run sim progression -- --careless   # a player who never fixes breakdowns or services
npm run sim progression -- --levels 0,250,1250,2750,4750,8000,13000,20000,30000,45000,65000,95000
                                        # try another level curve (the XP each level starts at)
```

Scenarios can also take `away(t)`: the game closed for `t`, with XP at the away rate.

## Writing a scenario

Add a file to `sim/scenarios/`:

```js
export default {
  name: 'Bus lines',
  about: 'a bus earning on a line',
  // options for the new game (see createSim in engine.mjs): seed, level, coins, towns, save, log
  setup: { level: 4, coins: 100000, towns: ['frost', 'iron'] },
  run(sim) {
    const { G, game } = sim;            // G is the game module (everything it exports), game its state
    G.buyLine('bus', 'iron');
    G.buyLine('bus', 'frost');
    const line = G.createLine('bus', 'iron');
    G.addRouteStop(line, 'frost');
    const bus = sim.buy('truck', 'smallbus', 'iron');
    G.assignRoute(bus, line);
    sim.job('iron', 'frost');           // a fare waiting at Ironvale
    sim.advance('20m');                 // 20 game minutes, ticking as the page does
    sim.expect(line.stats.laps >= 1, 'ran a lap');
  },
};
```

## What `sim` has

| | |
|---|---|
| `advance(t)` | move the clock on by `t` (`'90s'`, `'5m'`, `'1.5h'` or ms), ticking every 250ms |
| `until(test, { max })` | tick until `test()` is true, or `max` (default `'1h'`) has gone by |
| `finishLegs()` | jump every moving vehicle to the end of its leg |
| `buy(kind, model, at)` | buy a vehicle at a town (`truck`, `train`, `plane`, `boat`); throws if the game says no |
| `job(from, to, { type, pay })` | put a job on a town's board |
| `unlock(...ids)` | open towns for free |
| `expect(ok, what)` | a check; the scenario fails if any fail |
| `toasts`, `lastToast()` | every toast the player would have seen |
| `report()`, `print()` | coins, level, each vehicle's takings and each route's stats |
| `elapsed` | game ms since the sim started |

For a quick one-off experiment, skip the runner:

```js
import { createSim, closeSims } from './sim/engine.mjs';
const sim = await createSim({ seed: 3 });
sim.advance('10m').print();
await closeSims();
```

## How it works

`engine.mjs` starts Vite in middleware mode and loads `src/game/game.svelte.js` through it (so Svelte runes compile), a fresh copy per sim. Before loading, it swaps `Date.now` for a clock it controls and `Math.random` for a seeded one, and gives the game an in-memory `localStorage`. The game exports `simStep()` (one tick of the loop the page runs) and calls `globalThis.__simToast` from `toast()`, so the sim can see what the player would.
