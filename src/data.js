export const W = 960;
export const H = 640;
export const MI = 3; // world units to "miles" for display
// every vehicle's speed is multiplied by this, so trips take 1 / SPEED times as long
export const SPEED = 0.05;
// a town costs this much to unlock for each connection it has (station, airport, port)
export const CITY_PRICE = 1000;
// towns open from the start: two stations, two airports and two ports between them
export const START_CITIES = ["bay", "mill", "gull"];

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
export const CITIES = RAW.map(([id, name, x, y, cont, s]) => ({
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
}));

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

export { ENGINES, CARS, PLANES, BOATS, BARGES, TRUCKS, TRAILERS } from "./vehicles.js";

// repeating routes are bought once, for the whole fleet, from this level on
export const REPEAT_ROUTES = { level: 3, price: 4000 };

// xp needed to reach level i+1
export const LEVELS = [0, 400, 1000, 2000, 3500, 5500, 8500, 12500, 18000];
// job types; bulk (coal, grain, ore) turns up in batches and pays less per load
export const JOB_TYPES = ["pax", "cargo", "fuel", "bulk"];
export const RATES = { pax: 0.9, cargo: 0.8, fuel: 1.3, bulk: 0.45 };
export const TYPE_LABEL = { pax: "Passengers", cargo: "Cargo", fuel: "Fuel", bulk: "Bulk" };
// maglev express lines: each is a list of towns, joined in order by an elevated guideway.
// Maglev trains only run on these and only stop at their towns.
export const MAGLEV_LINES = [
  ["frost", "bay", "mid", "sun", "south", "hillcrest"], // Westmark
  ["ashford", "riverton", "harrow", "brookside", "larkspur", "hollowell"], // Heartland
  ["cactusflats", "dunmore", "sandhollow", "drycreek"], // Sunreach
  ["eastport", "moonvale", "copperbay", "juniper"], // Eastmark
];
