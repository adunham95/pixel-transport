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

// id, name, x, y, continent index (-1 for a lone island), r = station, a = airport, p = sea port,
// and an optional job mix: how much more (or less) often than usual the town turns up each job
// type, as multipliers on its weight (pax, cargo, fuel, bulk, mail, wide, secure, tour), plus celeb
// for celebrities. A town still only turns up the types it can (fuel needs a station or port).
const RAW = [
  // Westmark
  ["frost", "Frostholm", 124, 40, 0, "rap"],
  ["pine", "Pinecrest", 136, 88, 0, "r", { bulk: 2, pax: 0.7 }],
  ["iron", "Ironvale", 100, 136, 0, "ra", { bulk: 6 }],
  ["bay", "Bayport", 88, 184, 0, "ra", { cargo: 2, mail: 1.5 }],
  ["mill", "Millbrook", 154, 184, 0, "rp", { bulk: 2.5, cargo: 1.5 }],
  ["cedar", "Cedar Falls", 124, 214, 0, "r", { tour: 3, wide: 1.5 }],
  ["mid", "Midland", 142, 262, 0, "ra", { mail: 2, pax: 1.5 }],
  ["copper", "Copperton", 94, 286, 0, "r", { bulk: 3 }],
  ["red", "Redrock", 130, 310, 0, "r", { bulk: 3, pax: 0.6 }],
  [
    "sun",
    "Sunhaven",
    160,
    340,
    0,
    "rap",
    { pax: 1.5, celeb: 12, fuel: 0.5, tour: 6 },
  ],
  ["dusty", "Dusty Gulch", 106, 352, 0, "r", { secure: 2, pax: 0.5 }],
  ["palm", "Palmetto", 136, 382, 0, "r", { tour: 3, pax: 1.5 }],
  ["south", "Southport", 106, 412, 0, "ra"],
  ["fjordhavn", "Fjordhavn", 154, 430, 0, "r", { tour: 4, cargo: 0.7 }],
  ["saltcove", "Saltcove", 106, 466, 0, "ra", { bulk: 2, mail: 1.5 }],
  ["ravenmoor", "Ravenmoor", 154, 484, 0, "rp", { fuel: 2, cargo: 1.5 }],
  ["hillcrest", "Hillcrest", 118, 544, 0, "r", { wide: 2.5, pax: 1.3 }],
  // Frostlands
  ["icemoor", "Icemoor", 382, 28, 1, "rp", { fuel: 3, pax: 0.6 }],
  ["snowdrift", "Snowdrift", 340, 46, 1, "ra", { tour: 3, pax: 1.5 }],
  ["wolfden", "Wolfden", 454, 52, 1, "r", { bulk: 2, pax: 0.6 }],
  ["glacierbay", "Glacier Bay", 496, 58, 1, "rp", { tour: 15 }],
  ["coldwater", "Coldwater", 298, 64, 1, "ra"],
  ["whitepeak", "Whitepeak", 256, 64, 1, "rp", { tour: 3, celeb: 3 }],
  ["hoarfrost", "Hoarfrost", 562, 70, 1, "r", { fuel: 2, pax: 0.5 }],
  ["bearpaw", "Bearpaw", 388, 70, 1, "ra", { tour: 2, cargo: 0.7 }],
  ["northwick", "Northwick", 520, 94, 1, "r", { bulk: 3 }],
  ["frostfen", "Frostfen", 346, 94, 1, "r", { fuel: 2 }],
  ["polaris", "Polaris", 436, 100, 1, "ra", { secure: 2, mail: 1.5 }],
  ["silverbirch", "Silverbirch", 478, 100, 1, "r", { secure: 2.5, bulk: 1.5 }],
  ["elkhorn", "Elkhorn", 562, 112, 1, "rap", { tour: 6 }],
  // Heartland
  ["kingsbridge", "Kingsbridge", 394, 220, 2, "rp", { pax: 2, secure: 2, celeb: 2 }],
  ["ashford", "Ashford", 346, 238, 2, "ra"],
  ["oakhollow", "Oakhollow", 460, 256, 2, "r", { bulk: 2, wide: 2 }],
  ["riverton", "Riverton", 418, 256, 2, "r"],
  ["greenfield", "Greenfield", 364, 274, 2, "ra", { bulk: 3, pax: 0.7 }],
  ["stonebridge", "Stonebridge", 400, 292, 2, "r", { bulk: 2, wide: 1.5 }],
  ["meadowbrook", "Meadowbrook", 478, 292, 2, "r", { bulk: 2.5, cargo: 0.7 }],
  ["harrow", "Harrow", 442, 310, 2, "ra", { wide: 3, cargo: 1.5 }],
  ["elmstead", "Elmstead", 394, 334, 2, "r", { pax: 1.5, mail: 1.5 }],
  ["fairhaven", "Fairhaven", 472, 346, 2, "r", { tour: 2, celeb: 2 }],
  ["brookside", "Brookside", 430, 352, 2, "ra", { cargo: 2, mail: 1.5 }],
  ["willowmere", "Willowmere", 442, 394, 2, "r", { tour: 3 }],
  ["thornbury", "Thornbury", 484, 394, 2, "r", { wide: 2.5 }],
  ["larkspur", "Larkspur", 460, 436, 2, "ra", { pax: 2 }],
  ["hollowell", "Hollowell", 418, 472, 2, "rap", { fuel: 2, cargo: 1.5 }],
  // Sunreach
  ["mirage", "Mirage", 664, 484, 3, "r", { tour: 4, celeb: 2 }],
  ["dunmore", "Dunmore", 706, 496, 3, "rap", { fuel: 4, pax: 0.5 }],
  ["saltflat", "Saltflat", 760, 502, 3, "r", { bulk: 3, pax: 0.5 }],
  ["ochresprings", "Ochre Springs", 814, 502, 3, "r", { tour: 2, bulk: 1.5 }],
  ["cactusflats", "Cactus Flats", 568, 508, 3, "rap", { fuel: 2.5 }],
  ["scorchwell", "Scorchwell", 622, 514, 3, "r", { fuel: 3, pax: 0.5 }],
  ["amberwells", "Amber Wells", 670, 526, 3, "r", { fuel: 2.5, secure: 1.5 }],
  ["sandhollow", "Sandhollow", 760, 544, 3, "ra", { tour: 6 }],
  ["sirocco", "Sirocco", 610, 556, 3, "r", { wide: 2 }],
  ["goldmesa", "Goldmesa", 862, 556, 3, "r", { secure: 3 }],
  ["drycreek", "Dry Creek", 820, 562, 3, "rap", { bulk: 2, cargo: 1.5 }],
  ["sunspire", "Sunspire", 664, 568, 3, "r", { tour: 3, celeb: 3 }],
  ["camelback", "Camelback", 706, 568, 3, "ra", { tour: 2, pax: 1.5 }],
  // Eastmark
  ["eastport", "Eastport", 784, 118, 4, "rp", { cargo: 2.5, fuel: 1.5 }],
  ["highcliff", "Highcliff", 814, 154, 4, "ra", { pax: 1.5, secure: 2 }],
  ["timberline", "Timberline", 856, 190, 4, "r", { bulk: 3, wide: 2 }],
  ["lanternbay", "Lantern Bay", 808, 202, 4, "r", { tour: 3 }],
  ["moonvale", "Moonvale", 856, 232, 4, "ra", { celeb: 3, tour: 2 }],
  ["rosewood", "Rosewood", 832, 268, 4, "r", { pax: 1.5, mail: 2 }],
  ["pinehurst", "Pinehurst", 784, 274, 4, "r", { wide: 2.5 }],
  ["copperbay", "Copperbay", 832, 316, 4, "ra", { bulk: 2.5 }],
  ["seabright", "Seabright", 790, 316, 4, "r", { tour: 2, pax: 1.5 }],
  ["cobalt", "Cobalt", 850, 352, 4, "rp", { bulk: 3, fuel: 1.5 }],
  ["drakeford", "Drakeford", 760, 352, 4, "rap", { cargo: 2, mail: 2 }],
  ["starling", "Starling", 802, 358, 4, "r", { mail: 2.5 }],
  ["juniper", "Juniper", 850, 400, 4, "ra"],
  // Jade Isles
  ["jadeharbor", "Jade Harbor", 610, 262, 5, "r", { cargo: 2, tour: 2 }],
  ["bamboocove", "Bamboo Cove", 664, 292, 5, "ra", { tour: 4 }],
  // lone islands
  ["gull", "Gull Isle", 26, 168, -1, "ap", { mail: 2 }],
  ["puffin", "Puffin Rock", 38, 42, -1, "ap"],
  ["coral", "Coral Key", 194, 426, -1, "ap", { tour: 4 }],
  ["lagoon", "Lagoon", 206, 528, -1, "ap", { tour: 4, celeb: 2 }],
  ["pelicancay", "Pelican Cay", 278, 258, -1, "ap", { tour: 2 }],
  ["shellbeach", "Shell Beach", 338, 132, -1, "p", { tour: 6, celeb: 6 }],
  ["turtlerock", "Turtle Rock", 350, 498, -1, "p", { tour: 3 }],
  ["sealpoint", "Seal Point", 446, 546, -1, "p", { fuel: 2 }],
  ["driftwood", "Driftwood", 530, 438, -1, "ap", { cargo: 2 }],
  ["albatross", "Albatross", 536, 270, -1, "ap", { mail: 2 }],
  ["mangokey", "Mango Key", 608, 414, -1, "ap", { tour: 3, cargo: 1.5 }],
  ["kelpisland", "Kelp Island", 614, 342, -1, "ap", { bulk: 2 }],
  ["pearlatoll", "Pearl Atoll", 614, 192, -1, "ap", { secure: 3 }],
  ["starfish", "Starfish", 692, 228, -1, "ap", { tour: 3 }],
  ["conch", "Conch", 698, 414, -1, "p", { tour: 2, cargo: 1.5 }],
  ["ternisland", "Tern Island", 734, 150, -1, "ap", { mail: 2 }],
  ["sandbar", "Sandbar", 932, 540, -1, "ap", { tour: 3, celeb: 2 }],
  ["wreckreef", "Wreck Reef", 938, 378, -1, "p", { secure: 2, tour: 2 }],
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
  ...RAW.map(([id, name, x, y, cont, s, mix = {}]) => ({
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
    mix,
  })),
  ...ANCHORAGES.map(([id, name, x, y]) => ({
    id,
    name,
    x,
    y,
    cont: -1,
    rail: false,
    air: false,
    port: false,
    island: false,
    road: false,
    anchor: true,
    mix: {},
  })),
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
      if (
        !st.some(
          (c) =>
            c !== a &&
            c !== b &&
            c.cont === a.cont &&
            Math.max(d(a, c), d(b, c)) < ab * 0.8,
        )
      )
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

export {
  ENGINES,
  CARS,
  PLANES,
  BOATS,
  BARGES,
  TRUCKS,
  TRAILERS,
  SUPERLOAD_TRAILERS,
} from "./vehicles.js";

// your headquarters, built once in any town from this level on. It unlocks repeating routes for the
// whole fleet and company colors, and sells perks, each tier bought in order: a `contracts` tier lets
// you work on one more contract at a time and puts one more offer on the board; a `superloads` tier
// lets you run one more superload at a time of each kind (road, rail and sea).
export const HQ = {
  level: 3,
  price: 4000,
  contracts: [
    { level: 6, price: 15000 },
    { level: 10, price: 60000 },
  ],
  superloads: [
    { level: 10, price: 50000 },
    { level: 12, price: 150000 },
  ],
  // auto dispatch: self-driving vehicles (TRUCKS with auto: true) can be bought, and find and carry
  // their own jobs; and rescuers set off for breakdowns on their own
  auto: { level: 8, price: 30000 },
};
// trucks, trains and boats break down now and then as they age: each leg has a chance of their wear
// (0 to WEAR.max) times `chance` of stopping partway along until help arrives. What helps is an
// escort kind (see TRUCKS): a tow truck for a truck, plus a fire truck if it's carrying fuel, and
// sometimes a police car for a crash; a tug for a boat, plus a fireboat for fuel; a helper engine
// for a train. Each only once it's in the shop. Or a roadside service fixes it after calloutTime
// (game time), for calloutBase plus `callout` of the vehicle's price.
export const BREAKDOWN = {
  chance: 0.25,
  crash: 0.25,
  calloutBase: 150,
  callout: 0.1,
  calloutTime: 90 * 1000,
};
// now and then from this level a celebrity turns up wanting a ride: a passenger job that only goes
// in style (models with celebrity: true), paying mult times as much and leaving after ttl (game time)
export const CELEB = {
  level: 12,
  chance: 0.04,
  mult: 8,
  ttl: 5 * 60 * 1000,
  who: [
    "A film star",
    "A pop star",
    "A royal",
    "A tech billionaire",
    "A sports legend",
    "A famous chef",
  ],
};
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
// tourists turn up everywhere from this level, once you own a show-off vehicle (the only models
// with room for them), in groups of `group` headed the same way. They lean toward towns with
// landmarks and pay more going there (see PROJECTS), and like mail, only wait ttl (game time).
export const TOURISTS = { level: 12, ttl: 5 * 60 * 1000, group: 4 };
// lucky cargo: `chance` of everyday jobs are a mystery, paying their usual pay times whatever turns
// out to be inside when they're delivered, one of `finds` picked by its weight
export const LUCKY = {
  chance: 0.06,
  types: ["pax", "cargo", "mail", "bulk", "fuel"],
  finds: [
    { mult: 0.5, weight: 3, what: "a box of old socks" },
    { mult: 1, weight: 4, what: "garden gnomes" },
    { mult: 1.5, weight: 4, what: "vintage records" },
    { mult: 2, weight: 3, what: "a rare stamp collection" },
    { mult: 3, weight: 2, what: "a lost painting" },
    { mult: 5, weight: 1, what: "a pirate's treasure chest" },
  ],
};
// weather, from this level: now and then (every `every`, game time, up to `max` at once) a spell of
// one kind settles over a circle of the map for `last`. Legs that pass through it when they set off
// take `time` times as long and burn `fuel` times as much, for the kinds of vehicle in `hits`. Fog,
// storms and tailwinds can turn up anywhere; snow only in the north (y below `north`).
export const WEATHER = {
  level: 2,
  every: 2 * 60 * 1000,
  max: 2,
  last: [3 * 60 * 1000, 6 * 60 * 1000],
  radius: [45, 80],
  north: 140,
  kinds: {
    fog: { name: "Fog", hits: ["plane"], time: 1.6, fuel: 1, about: "planes fly slow" },
    storm: { name: "Storm", hits: ["boat"], time: 1.5, fuel: 1.5, about: "boats slow down and burn more fuel" },
    snow: { name: "Snow", hits: ["train", "truck"], time: 1.4, fuel: 1.2, about: "trains and trucks slow down" },
    tailwind: { name: "Tailwind", hits: ["plane"], time: 0.7, fuel: 0.8, about: "planes fly faster on less fuel" },
  },
};
// the used lot: one secondhand vehicle at a time, from a level or two above yours, at `price` of
// new. It comes with `miles` (as a range of WEAR.per steps) already on it, so it burns more fuel and
// breaks down more until it's serviced. A new one turns up every `every`, or `after` one is bought.
export const USED = {
  ahead: 2,
  price: 0.6,
  miles: [3, 4],
  every: 6 * 60 * 1000,
  after: 90 * 1000,
};
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
// one town to another with no time limit. `by` is how it goes: by road (the default) on a superload
// tractor between towns joined by road, by rail on a heavy haul engine between stations, or by sea
// on a heavy lift ship between ports. Each brings its own trailer, car or deck art (`trailer`, from
// SUPERLOAD_TRAILERS in vehicles.js). The carrier can't set off with one until the escorts it needs
// (vehicles with an `escort` kind, or a `helps` kind when they're free) are parked alongside, and
// they go the route with it as a convoy. A new offer is a superload `chance` of the time, picking
// from the loads open at your level; the bonus is (base + perUnit * distance) * mult.
// Each load's level must be at least its carrier's and every escort's it needs.
export const SUPERLOAD = {
  level: 9,
  chance: 0.3,
  minDist: 60,
  base: 1000,
  perUnit: 12,
  loads: [
    {
      name: "Yacht hull",
      trailer: "yacht",
      level: 9,
      needs: { pilot: 1 },
      mult: 1,
    },
    {
      name: "Bridge beam",
      trailer: "beam",
      level: 9,
      needs: { pilot: 2 },
      mult: 1.5,
    },
    {
      name: "Wind turbine blade",
      trailer: "blade",
      level: 9,
      needs: { pilot: 2 },
      mult: 1.5,
    },
    {
      name: "Rocket stage",
      trailer: "rocket",
      level: 10,
      needs: { pilot: 1, police: 1 },
      mult: 2,
    },
    {
      name: "Transformer",
      trailer: "transformer",
      level: 10,
      needs: { pilot: 1, pusher: 1 },
      mult: 2,
    },
    {
      name: "Distillation tower",
      trailer: "tower",
      level: 11,
      needs: { pilot: 1, police: 1, bucket: 1 },
      mult: 2.6,
    },
    {
      name: "LNG tank",
      trailer: "lng",
      level: 11,
      needs: { pilot: 1, police: 1, fire: 1 },
      mult: 2.8,
    },
    {
      name: "Mining dump truck",
      trailer: "dumptruck",
      level: 12,
      needs: { pilot: 2, police: 1, pusher: 1 },
      mult: 3.2,
    },
    {
      name: "Space shuttle",
      trailer: "shuttle",
      level: 12,
      needs: { pilot: 2, police: 2, pusher: 1, bucket: 1, fire: 1 },
      mult: 5,
    },
    {
      name: "Locomotive",
      trailer: "loco",
      by: "rail",
      level: 10,
      needs: { inspect: 1 },
      mult: 1.5,
    },
    {
      name: "Generator stator",
      trailer: "stator",
      by: "rail",
      level: 10,
      needs: { helper: 1 },
      mult: 1.8,
    },
    {
      name: "Reactor vessel",
      trailer: "reactor",
      by: "rail",
      level: 11,
      needs: { helper: 1, inspect: 1 },
      mult: 2.6,
    },
    {
      name: "Oil rig jacket",
      trailer: "jacket",
      by: "sea",
      level: 10,
      needs: { tug: 2 },
      mult: 1.8,
    },
    {
      name: "Wind turbine towers",
      trailer: "towers",
      by: "sea",
      level: 10,
      needs: { tug: 1, pilotboat: 1 },
      mult: 1.6,
    },
    {
      name: "Container crane",
      trailer: "crane",
      by: "sea",
      level: 11,
      needs: { tug: 2, pilotboat: 1 },
      mult: 2.6,
    },
    {
      name: "Submarine",
      trailer: "sub",
      by: "sea",
      level: 12,
      needs: { tug: 2, pilotboat: 1, fireboat: 1 },
      mult: 3.6,
    },
  ],
};
// megaprojects: huge builds paid for up front and then supplied. Every job of a type in `needs`
// delivered to the project's town counts toward it (and those jobs lean its way while it's being
// built), and each superload named in `supers` (from SUPERLOAD.loads) turns up at a far off town
// to be brought there. A landmark is built in one town of your choice, one landmark to a town:
// `where` is what the town needs (road, air or port), and it must be able to take every job type
// it needs. A bridge has fixed ends in `link`, and deliveries to either end count; once built it
// joins the two landmasses by road and rail. What a built landmark does for its town: mix
// multiplies its job weights as a town's mix does, cap is more room on its job board, spawn makes
// jobs turn up that much faster, pay is extra on jobs leaving it, and launch pays out every so
// often (game time). sight draws tourists and makes them pay that much more going there (bridges
// count at both ends).
// A project's level must be at least the level each type it needs turns up at, and every superload's.
export const PROJECTS = [
  {
    id: "stadium",
    name: "Grand Stadium",
    level: 5,
    price: 60000,
    where: "road",
    needs: { cargo: 30, bulk: 24 },
    mix: { pax: 2, celeb: 3 },
    cap: 3,
    sight: 0.3,
    about:
      "Fans pour in: twice the passengers, celebrities drop by, and room for 3 more jobs.",
  },
  {
    id: "hub",
    name: "Hub Airport",
    level: 7,
    price: 180000,
    where: "air",
    needs: { cargo: 50, fuel: 30 },
    spawn: 0.5,
    pay: 0.25,
    cap: 4,
    sight: 0.2,
    about:
      "Jobs turn up 50% faster and pay 25% more leaving, with room for 4 more.",
  },
  {
    id: "harbor",
    name: "Mega Harbor",
    level: 8,
    price: 300000,
    where: "port",
    needs: { bulk: 75, cargo: 45, fuel: 30 },
    mix: { bulk: 2, fuel: 2 },
    pay: 0.2,
    cap: 4,
    sight: 0.2,
    about:
      "Twice the bulk and fuel, paying 20% more leaving, with room for 4 more jobs.",
  },
  {
    id: "tower",
    name: "Sky Tower",
    level: 10,
    price: 750000,
    where: "road",
    needs: { bulk: 120, cargo: 80, wide: 10 },
    mix: { pax: 1.5, secure: 2, celeb: 3, tour: 3 },
    pay: 0.3,
    cap: 4,
    sight: 1,
    about:
      "A skyline everyone wants to see: more passengers, valuables, celebrities and tourists, and jobs leaving pay 30% more.",
  },
  {
    id: "spaceport",
    name: "Spaceport",
    level: 12,
    price: 2500000,
    where: "road",
    needs: { bulk: 180, fuel: 120, secure: 20 },
    supers: ["Rocket stage", "Space shuttle"],
    mix: { tour: 5, celeb: 4 },
    sight: 2,
    launch: { every: 8 * 60 * 1000, pay: 75000 },
    about:
      "Launches a rocket every 8 minutes for $75,000, and tourists come from everywhere to watch.",
  },
  {
    id: "frostbridge",
    name: "Northern Strait Bridge",
    level: 6,
    price: 150000,
    link: ["frost", "whitepeak"],
    needs: { bulk: 45, cargo: 30 },
    sight: 0.3,
    about: "Joins Westmark and the Frostlands by road and rail.",
  },
  {
    id: "jadebridge",
    name: "Jade Causeway",
    level: 8,
    price: 350000,
    link: ["oakhollow", "jadeharbor"],
    needs: { bulk: 75, cargo: 40, fuel: 25 },
    sight: 0.4,
    about: "Joins the Heartland and the Jade Isles by road and rail.",
  },
  {
    id: "sunbridge",
    name: "Sunreach Bridge",
    level: 9,
    price: 600000,
    link: ["hollowell", "cactusflats"],
    needs: { bulk: 100, cargo: 50, fuel: 30 },
    supers: ["Bridge beam", "Bridge beam"],
    sight: 0.4,
    about: "Joins the Heartland and Sunreach by road and rail.",
  },
  {
    id: "polarspan",
    name: "Polar Span",
    level: 10,
    price: 900000,
    link: ["frostfen", "ashford"],
    needs: { bulk: 120, cargo: 60, wide: 8 },
    supers: ["Bridge beam", "Bridge beam"],
    sight: 0.5,
    about: "Joins the Frostlands and the Heartland by road and rail.",
  },
  {
    id: "eastgate",
    name: "Eastern Gate Bridge",
    level: 11,
    price: 1200000,
    link: ["juniper", "ochresprings"],
    needs: { bulk: 140, cargo: 70, fuel: 50 },
    supers: ["Bridge beam", "Bridge beam", "Bridge beam"],
    sight: 0.6,
    about: "Joins Eastmark and Sunreach by road and rail.",
  },
];
// what each kind of escort is called, one and many
export const ESCORT_LABEL = {
  pilot: "pilot car",
  police: "police car",
  pusher: "push truck",
  bucket: "bucket truck",
  fire: "fire truck",
  helper: "helper engine",
  inspect: "track inspection car",
  tug: "tugboat",
  pilotboat: "pilot boat",
  fireboat: "fireboat",
  tow: "tow truck",
};
export const CONTRACTS = {
  level: 3,
  offers: 3,
  active: 2,
  every: 45 * 1000,
  offerTtl: 10 * 60 * 1000,
  size: {
    pax: [5, 9],
    cargo: [4, 8],
    mail: [4, 7],
    fuel: [3, 6],
    bulk: [6, 12],
    wide: [2, 3],
    secure: [2, 4],
    tour: [8, 16],
  },
  waitSlack: 2,
  trips: 2,
  speed: 5,
  speedUp: 0.6,
  extra: 2 * 60 * 1000,
  perMin: 30,
  payUp: 0.1,
};

// xp needed to reach level i+1
export const LEVELS = [
  0, 850, 2500, 4400, 6350, 8400, 10850, 13800, 17250, 21350, 26350, 31950,
];
// job types; bulk (coal, grain, ore) turns up in batches and pays less per load
export const JOB_TYPES = [
  "pax",
  "cargo",
  "fuel",
  "bulk",
  "mail",
  "wide",
  "secure",
  "tour",
];
export const RATES = {
  pax: 0.9,
  cargo: 0.8,
  fuel: 1.3,
  bulk: 0.45,
  mail: 1.6,
  wide: 2.6,
  secure: 3,
  tour: 5,
};
export const TYPE_LABEL = {
  pax: "Passengers",
  cargo: "Cargo",
  fuel: "Fuel",
  bulk: "Bulk",
  mail: "Mail",
  wide: "Wide load",
  secure: "Valuables",
  tour: "Tourists",
};
// maglev express lines: each is a list of towns, joined in order by an elevated guideway.
// Maglev trains only run on these and only stop at their towns.
export const MAGLEV_LINES = [
  ["frost", "bay", "mid", "sun", "south", "hillcrest"], // Westmark
  ["ashford", "riverton", "harrow", "brookside", "larkspur", "hollowell"], // Heartland
  ["cactusflats", "dunmore", "sandhollow", "drycreek"], // Sunreach
  ["eastport", "moonvale", "copperbay", "juniper"], // Eastmark
];
