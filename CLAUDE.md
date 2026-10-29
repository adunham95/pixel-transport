# Pixel Transport

## Game design rules

- **Every job type needs a cheap carrier in every category.** When a new job type (like fuel or bulk) is added, or the level it starts spawning at changes, make sure that at or before that level the shop has a small, cheap vehicle that can carry it in **each category that can reach the towns spawning it**: a train car, a boat and a plane. Otherwise a town (especially an island with only a port or airport) fills up with jobs nothing can ship.
  - Current examples: Hopper car / Barge / Bushhawk for bulk (level 2), Tanker / Bunker Boat / Firefly for fuel (level 3).
  - Job spawn levels are in `makeJob` in `src/game.svelte.js`; vehicle levels and capacities are in `src/vehicles.js`.
