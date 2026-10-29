# Pixel Transport

## Game design rules

- **Every job type needs a cheap carrier in every category.** When a new job type (like fuel or bulk) is added, or the level it starts spawning at changes, make sure that at or before that level the shop has a small, cheap vehicle that can carry it in **each category that can reach the towns spawning it**: a train car, a truck (or trailer for the Semi), a boat and a plane. Otherwise a town (especially an island with only a port or airport) fills up with jobs nothing can ship.
  - Current examples: Hopper car / Dump trailer / Barge / Bushhawk for bulk (level 4), Tanker / Tank trailer / Bunker Boat / Firefly for fuel (level 6), Mail car / Mail Van / Coaster / Sparrow for mail (level 2). The Semi (level 2) is the cheap tractor that pulls those trailers.
  - Exception: wide loads (level 8) only move by road, between mainland towns on the same landmass, so they only need the Lowboy trailer (pulled by the Semi).
  - Job spawn levels are in `makeJob` in `src/game.svelte.js`; vehicle levels and capacities are in `src/vehicles.js`.
