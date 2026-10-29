export const W = 960;
export const H = 640;
export const MI = 3; // world units to "miles" for display
// every vehicle's speed is multiplied by this, so trips take 1 / SPEED times as long
export const SPEED = 0.05;
// a town costs this much to unlock for each connection it has (station, airport, port)
export const CITY_PRICE = 1000;
// towns open from the start: two stations, three airports and two ports between them, close
// enough by sea that the first boat isn't sailing round the top of Westmark
export const START_CITIES = ["frost", "iron", "puffin"];

// each continent is a band around a spine of [x, y, halfWidth] points
export const CONTINENTS = [
  {
    name: "Westmark",
    spine: [
      [125, 40, 34],
      [110, 180, 46],
      [135, 330, 48],
      [115, 480, 44],
      [130, 600, 32],
    ],
  },
  {
    name: "Frostlands",
    spine: [
      [260, 70, 30],
      [380, 60, 44],
      [520, 95, 40],
      [600, 80, 28],
    ],
  },
  {
    name: "Heartland",
    spine: [
      [330, 240, 40],
      [430, 280, 62],
      [470, 380, 58],
      [420, 460, 36],
    ],
  },
  {
    name: "Sunreach",
    spine: [
      [560, 500, 34],
      [670, 540, 52],
      [790, 520, 46],
      [870, 565, 30],
    ],
  },
  {
    name: "Eastmark",
    spine: [
      [800, 110, 34],
      [830, 220, 56],
      [810, 340, 48],
      [860, 420, 30],
    ],
  },
  {
    name: "Jade Isles",
    spine: [
      [600, 250, 26],
      [660, 300, 36],
      [640, 365, 24],
    ],
  },
];

// id, name, x, y, continent index (-1 for a lone island), r = station, a = airport, p = sea port
const RAW = [
  // Westmark
  ["frost", "Frostholm", 124, 40, 0, "rap"],
  ["pine", "Pinecrest", 136, 88, 0, "r"],
  ["iron", "Ironvale", 100, 136, 0, "ra"],
  ["bay", "Bayport", 88, 184, 0, "ra"],
  ["mill", "Millbrook", 154, 184, 0, "rp"],
  ["cedar", "Cedar Falls", 124, 214, 0, "r"],
  ["mid", "Midland", 142, 262, 0, "ra"],
  ["copper", "Copperton", 94, 286, 0, "r"],
  ["red", "Redrock", 130, 310, 0, "r"],
  ["sun", "Sunhaven", 160, 340, 0, "rap"],
  ["dusty", "Dusty Gulch", 106, 352, 0, "r"],
  ["palm", "Palmetto", 136, 382, 0, "r"],
  ["south", "Southport", 106, 412, 0, "ra"],
  ["fjordhavn", "Fjordhavn", 154, 430, 0, "r"],
  ["saltcove", "Saltcove", 106, 466, 0, "ra"],
  ["ravenmoor", "Ravenmoor", 154, 484, 0, "rp"],
  ["hillcrest", "Hillcrest", 118, 544, 0, "r"],
  // Frostlands
  ["icemoor", "Icemoor", 382, 28, 1, "rp"],
  ["snowdrift", "Snowdrift", 340, 46, 1, "ra"],
  ["wolfden", "Wolfden", 454, 52, 1, "r"],
  ["glacierbay", "Glacier Bay", 496, 58, 1, "rp"],
  ["coldwater", "Coldwater", 298, 64, 1, "ra"],
  ["whitepeak", "Whitepeak", 256, 64, 1, "rp"],
  ["hoarfrost", "Hoarfrost", 562, 70, 1, "r"],
  ["bearpaw", "Bearpaw", 388, 70, 1, "ra"],
  ["northwick", "Northwick", 520, 94, 1, "r"],
  ["frostfen", "Frostfen", 346, 94, 1, "r"],
  ["polaris", "Polaris", 436, 100, 1, "ra"],
  ["silverbirch", "Silverbirch", 478, 100, 1, "r"],
  ["elkhorn", "Elkhorn", 562, 112, 1, "rap"],
  // Heartland
  ["kingsbridge", "Kingsbridge", 394, 220, 2, "rp"],
  ["ashford", "Ashford", 346, 238, 2, "ra"],
  ["oakhollow", "Oakhollow", 460, 256, 2, "r"],
  ["riverton", "Riverton", 418, 256, 2, "r"],
  ["greenfield", "Greenfield", 364, 274, 2, "ra"],
  ["stonebridge", "Stonebridge", 400, 292, 2, "r"],
  ["meadowbrook", "Meadowbrook", 478, 292, 2, "r"],
  ["harrow", "Harrow", 442, 310, 2, "ra"],
  ["elmstead", "Elmstead", 394, 334, 2, "r"],
  ["fairhaven", "Fairhaven", 472, 346, 2, "r"],
  ["brookside", "Brookside", 430, 352, 2, "ra"],
  ["willowmere", "Willowmere", 442, 394, 2, "r"],
  ["thornbury", "Thornbury", 484, 394, 2, "r"],
  ["larkspur", "Larkspur", 460, 436, 2, "ra"],
  ["hollowell", "Hollowell", 418, 472, 2, "rap"],
  // Sunreach
  ["mirage", "Mirage", 664, 484, 3, "r"],
  ["dunmore", "Dunmore", 706, 496, 3, "rap"],
  ["saltflat", "Saltflat", 760, 502, 3, "r"],
  ["ochresprings", "Ochre Springs", 814, 502, 3, "r"],
  ["cactusflats", "Cactus Flats", 568, 508, 3, "rap"],
  ["scorchwell", "Scorchwell", 622, 514, 3, "r"],
  ["amberwells", "Amber Wells", 670, 526, 3, "r"],
  ["sandhollow", "Sandhollow", 760, 544, 3, "ra"],
  ["sirocco", "Sirocco", 610, 556, 3, "r"],
  ["goldmesa", "Goldmesa", 862, 556, 3, "r"],
  ["drycreek", "Dry Creek", 820, 562, 3, "rap"],
  ["sunspire", "Sunspire", 664, 568, 3, "r"],
  ["camelback", "Camelback", 706, 568, 3, "ra"],
  // Eastmark
  ["eastport", "Eastport", 784, 118, 4, "rp"],
  ["highcliff", "Highcliff", 814, 154, 4, "ra"],
  ["timberline", "Timberline", 856, 190, 4, "r"],
  ["lanternbay", "Lantern Bay", 808, 202, 4, "r"],
  ["moonvale", "Moonvale", 856, 232, 4, "ra"],
  ["rosewood", "Rosewood", 832, 268, 4, "r"],
  ["pinehurst", "Pinehurst", 784, 274, 4, "r"],
  ["copperbay", "Copperbay", 832, 316, 4, "ra"],
  ["seabright", "Seabright", 790, 316, 4, "r"],
  ["cobalt", "Cobalt", 850, 352, 4, "rp"],
  ["drakeford", "Drakeford", 760, 352, 4, "rap"],
  ["starling", "Starling", 802, 358, 4, "r"],
  ["juniper", "Juniper", 850, 400, 4, "ra"],
  // Jade Isles
  ["jadeharbor", "Jade Harbor", 610, 262, 5, "r"],
  ["bamboocove", "Bamboo Cove", 664, 292, 5, "ra"],
  // lone islands
  ["gull", "Gull Isle", 26, 168, -1, "ap"],
  ["puffin", "Puffin Rock", 38, 42, -1, "ap"],
  ["coral", "Coral Key", 194, 426, -1, "ap"],
  ["lagoon", "Lagoon", 206, 528, -1, "ap"],
  ["pelicancay", "Pelican Cay", 278, 258, -1, "ap"],
  ["shellbeach", "Shell Beach", 338, 132, -1, "p"],
  ["turtlerock", "Turtle Rock", 350, 498, -1, "p"],
  ["sealpoint", "Seal Point", 446, 546, -1, "p"],
  ["driftwood", "Driftwood", 530, 438, -1, "ap"],
  ["albatross", "Albatross", 536, 270, -1, "ap"],
  ["mangokey", "Mango Key", 608, 414, -1, "ap"],
  ["kelpisland", "Kelp Island", 614, 342, -1, "ap"],
  ["pearlatoll", "Pearl Atoll", 614, 192, -1, "ap"],
  ["starfish", "Starfish", 692, 228, -1, "ap"],
  ["conch", "Conch", 698, 414, -1, "p"],
  ["ternisland", "Tern Island", 734, 150, -1, "ap"],
  ["sandbar", "Sandbar", 932, 540, -1, "ap"],
  ["wreckreef", "Wreck Reef", 938, 378, -1, "p"],
];
// anchorages: spots out at sea with no town. Only aircraft carriers sail to them, and
// planes can land there while a carrier is anchored. They have no jobs and are never locked.
const ANCHORAGES = [
  ["frostgap", "Frost Gap", 240, 150],
  ["midsea", "Midsea", 250, 330],
  ["sealbank", "Seal Bank", 480, 500],
  ["pearldeep", "Pearl Deep", 560, 180],
  ["ternreach", "Tern Reach", 680, 180],
  ["eastdeep", "Eastern Deep", 920, 470],
  ["westdeep", "Western Deep", 40, 300],
];
export const CITIES = [
  ...RAW.map(([id, name, x, y, cont, s]) => ({
    id,
    name,
    x,
    y,
    cont,
    rail: s.includes("r"),
    air: s.includes("a"),
    port: s.includes("p"),
    island: cont < 0,
    // every mainland town is on the road network
    road: cont >= 0,
  })),
  ...ANCHORAGES.map(([id, name, x, y]) => ({ id, name, x, y, cont: -1, rail: false, air: false, port: false, island: false, road: false, anchor: true })),
];

// rails join neighbors on the same continent: a pair is linked unless some third
// station sits closer to both of them (a relative neighborhood graph)
export const RAILS = [];
{
  const st = CITIES.filter((c) => c.rail);
  const d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  for (let i = 0; i < st.length; i++)
    for (let j = i + 1; j < st.length; j++) {
      const a = st[i],
        b = st[j];
      if (a.cont !== b.cont) continue;
      const ab = d(a, b);
      if (
        !st.some(
          (c) =>
            c !== a &&
            c !== b &&
            c.cont === a.cont &&
            Math.max(d(a, c), d(b, c)) < ab * 0.92,
        )
      )
        RAILS.push([a.id, b.id]);
    }
}

// roads join mainland towns the same way, but a little more freely, so they have
// a few shortcuts the rails don't
export const ROADS = [];
{
  const st = CITIES.filter((c) => c.road);
  const d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  for (let i = 0; i < st.length; i++)
    for (let j = i + 1; j < st.length; j++) {
      const a = st[i],
        b = st[j];
      if (a.cont !== b.cont) continue;
      const ab = d(a, b);
      if (!st.some((c) => c !== a && c !== b && c.cont === a.cont && Math.max(d(a, c), d(b, c)) < ab * 0.8))
        ROADS.push([a.id, b.id]);
    }
}
// roads run beside the rails, this many world units to one side, and trucks keep LANE to
// the right of the road's middle
export const ROAD_OFF = 3.5;
export const LANE = 0.75;
// which side of a line from a to b the road runs on: the same whichever way it's walked
export function roadSide(ax, ay, bx, by) {
  const L = Math.hypot(bx - ax, by - ay) || 1;
  const k = bx > ax || (bx === ax && by > ay) ? 1 : -1;
  return [(-(by - ay) / L) * k, ((bx - ax) / L) * k];
}

export { ENGINES, CARS, PLANES, BOATS, BARGES, TRUCKS, TRAILERS, SUPERLOAD_TRAILERS } from "./vehicles.js";

// repeating routes are bought once, for the whole fleet, from this level on
export const REPEAT_ROUTES = { level: 3, price: 4000 };
// vehicles age as they travel: fuel costs step more for every `per` world units, up to max.
// A service resets it, costing the vehicle's price times its wear times `service`.
export const WEAR = { per: 2500, step: 0.1, max: 0.5, service: 0.5 };
// mail turns up everywhere from this level. It pays well but goes back to the post office
// if it waits at its town longer than ttl (game time).
export const MAIL = { level: 2, ttl: 4 * 60 * 1000 };
// wide loads (turbine blades, boat hulls, little houses) only go overland, on lowboy trailers or
// flatcars, between mainland towns on the same landmass
export const WIDE = { level: 8 };
// valuables (gold, cash, art) turn up everywhere from this level, in armored cars, vault cars,
// courier launches and courier jets. They pay the most per mile but, like mail, only wait ttl.
// With a police car riding along an armored car (escortedBy in TRUCKS), they pay escortBonus more.
export const SECURE = { level: 11, ttl: 3 * 60 * 1000, escortBonus: 0.3 };
// towns grow as jobs to and from them are delivered: GROWTH[i] deliveries to reach size i + 1.
// Each size up adds jobs, spawns them faster and pays 10% more for jobs leaving the town.
export const GROWTH = [0, 25, 75, 175, 350];
export const SIZE_NAME = ["Village", "Town", "City", "Big city", "Metropolis"];
// a depot at a town: servicing there costs `service` of the usual, and vehicles parked
// there slowly lose their age, `repair` world units of it each game minute
export const DEPOT = { level: 3, price: 3000, service: 0.5, repair: 150 };
// contracts: deliver n jobs of one type to one town before time runs out, for a bonus on top of
// what the jobs pay. Up to `offers` wait on the board, each for offerTtl, a new one turning up
// every `every`, and up to `active` can be taken on at once. size is the [min, max] jobs for
// each type (game time throughout).
// The time allowed is waitSlack times how long the jobs take to turn up, plus `trips` trips from
// where they come from at an everyday speed (speed, plus speedUp a level), plus extra. The bonus
// is perMin for every minute allowed, plus payUp of that a level.
// superloads (transformers, rocket stages, bridge beams) only come from contracts: one load from
// one town to another, by road on a superload tractor, with no time limit. Each brings its own
// trailer (`trailer`, from SUPERLOAD_TRAILERS in vehicles.js). The tractor can't set off
// with one until the escorts it needs (TRUCKS with an `escort` kind) are parked alongside, and
// they drive the route with it as a convoy. A new offer is a superload `chance` of the time,
// picking from the loads open at your level; the bonus is (base + perUnit * distance) * mult.
// Each load's level must be at least the superload tractor's and every escort's it needs.
export const SUPERLOAD = {
  level: 9, chance: 0.3, minDist: 60, base: 1000, perUnit: 12,
  loads: [
    { name: "Yacht hull", trailer: "yacht", level: 9, needs: { pilot: 1 }, mult: 1 },
    { name: "Bridge beam", trailer: "beam", level: 9, needs: { pilot: 2 }, mult: 1.5 },
    { name: "Wind turbine blade", trailer: "blade", level: 9, needs: { pilot: 2 }, mult: 1.5 },
    { name: "Rocket stage", trailer: "rocket", level: 10, needs: { pilot: 1, police: 1 }, mult: 2 },
    { name: "Transformer", trailer: "transformer", level: 10, needs: { pilot: 1, pusher: 1 }, mult: 2 },
    { name: "Distillation tower", trailer: "tower", level: 11, needs: { pilot: 1, police: 1, bucket: 1 }, mult: 2.6 },
    { name: "Mining dump truck", trailer: "dumptruck", level: 12, needs: { pilot: 2, police: 1, pusher: 1 }, mult: 3.2 },
  ],
};
// what each kind of escort is called, one and many
export const ESCORT_LABEL = { pilot: "pilot car", police: "police car", pusher: "push truck", bucket: "bucket truck" };
export const CONTRACTS = {
  level: 3, offers: 3, active: 2, every: 45 * 1000, offerTtl: 10 * 60 * 1000,
  size: { pax: [5, 9], cargo: [4, 8], mail: [4, 7], fuel: [3, 6], bulk: [6, 12], wide: [2, 3], secure: [2, 4] },
  waitSlack: 2, trips: 2, speed: 5, speedUp: 0.6, extra: 2 * 60 * 1000, perMin: 30, payUp: 0.1,
};

// xp needed to reach level i+1
export const LEVELS = [0, 850, 2500, 4400, 6350, 8400, 10850, 13800, 17250, 21350, 26350, 31950];
// job types; bulk (coal, grain, ore) turns up in batches and pays less per load
export const JOB_TYPES = ["pax", "cargo", "fuel", "bulk", "mail", "wide", "secure"];
export const RATES = { pax: 0.9, cargo: 0.8, fuel: 1.3, bulk: 0.45, mail: 1.6, wide: 2.6, secure: 3 };
export const TYPE_LABEL = { pax: "Passengers", cargo: "Cargo", fuel: "Fuel", bulk: "Bulk", mail: "Mail", wide: "Wide load", secure: "Valuables" };
// maglev express lines: each is a list of towns, joined in order by an elevated guideway.
// Maglev trains only run on these and only stop at their towns.
export const MAGLEV_LINES = [
  ["frost", "bay", "mid", "sun", "south", "hillcrest"], // Westmark
  ["ashford", "riverton", "harrow", "brookside", "larkspur", "hollowell"], // Heartland
  ["cactusflats", "dunmore", "sandhollow", "drycreek"], // Sunreach
  ["eastport", "moonvale", "copperbay", "juniper"], // Eastmark
];
