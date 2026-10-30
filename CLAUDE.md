# Pixel Transport

## Game design rules

- **Every job type needs a cheap carrier in every category.** When a new job type (like fuel or bulk) is added, or the level it starts spawning at changes, make sure that at or before that level the shop has a small, cheap vehicle that can carry it in **each category that can reach the towns spawning it**: a train car, a truck (or trailer for the Semi), a boat and a plane. Otherwise a town (especially an island with only a port or airport) fills up with jobs nothing can ship.
  - Current examples: Hopper car / Dump trailer / Barge / Bushhawk for bulk (level 4), Tanker / Tank trailer or Fuel Truck / Bunker Boat / Firefly for fuel (level 6), Mail car / Mail Van / Coaster / Sparrow for mail (level 2), Vault car / Armored Car / Courier Launch / Courier Jet for valuables (level 11). The Semi (level 2) is the cheap tractor that pulls those trailers.
  - Exception: wide loads (level 8) only move overland, between mainland towns on the same landmass, so they only need the Lowboy trailer (pulled by the Semi) and the Flatcar.
  - Superloads (level 9+, contract only) go by road on the Superload Tractor, by rail on the Heavy Haul Engine, or by sea on the Heavy Lift Ship (`by` in `SUPERLOAD.loads`), and each brings its own art (`SUPERLOAD_TRAILERS` in `src/vehicles.js`). Each also needs a set of escort vehicles: by road the Pilot Car, Police Car, Push Truck, Bucket Truck and Fire Truck; by rail the Helper Engine and Track Inspection Car; by sea the Tugboat, Pilot Boat and Fireboat. A superload's `level` in `SUPERLOAD.loads` (`src/data.js`) must be at least its carrier's level and the level of every escort it `needs`.
  - Job spawn levels are in `makeJob` in `src/game.svelte.js`; vehicle levels and capacities are in `src/vehicles.js`.
