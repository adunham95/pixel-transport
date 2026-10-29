// Every vehicle model: its stats plus its art. To add a model, add an entry here.
//
// Art is an SVG drawn top down with the front pointing right (+x), in map sub pixels
// (half a world unit each). The viewBox must be centered on 0,0, and its size is the
// size the vehicle is drawn at. For engines and cars, the viewBox width is also how
// much track the unit takes up, so cars couple up nose to tail. An engine with
// steam puffs smoke from its chimney, `steam` sub pixels ahead of its center.

// freightOnly: true means it won’t pull passenger cars. maglev: true means it only runs on
// the MAGLEV_LINES guideways in data.js and only stops at their towns.
export const ENGINES = {
  puffer: {
    name: "Puffer",
    level: 1,
    price: 400,
    maxCars: 2,
    speed: 5,
    run: 0.08,
    pips: 1,
    color: "#2d2a2e",
    trim: "#d6453a",
    steam: 2.6,
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -2.6 10 5.2">
      <path d="M-2.9 -2.1H2.9A1.1 1.1 0 0 1 4 -1V1A1.1 1.1 0 0 1 2.9 2.1H-2.9A1.1 1.1 0 0 1 -4 1V-1A1.1 1.1 0 0 1 -2.9 -2.1Z" fill="#2b282d" stroke="rgba(18,24,38,0.9)" stroke-width="0.8" stroke-linejoin="round"/>
      <rect x="-4" y="-2.1" width="3" height="4.2" fill="#b8463b"/>
      <rect x="-4" y="-2.1" width="3" height="0.7" fill="#8c2f27"/>
      <rect x="-0.9" y="-1.2" width="4.6" height="2.4" fill="#4a454d"/>
      <rect x="0.6" y="-2.1" width="0.5" height="4.2" fill="#d9a92c"/>
      <path d="M-0.85 0a0.75 0.75 0 1 0 1.5 0a0.75 0.75 0 1 0 -1.5 0Z" fill="#d9a92c"/>
      <path d="M1.65 0a0.95 0.95 0 1 0 1.9 0a0.95 0.95 0 1 0 -1.9 0Z" fill="#111"/>
      <rect x="4" y="-1.6" width="0.7" height="3.2" fill="#c0392b"/>
    </svg>`,
  },
  workhorse: {
    name: "Workhorse",
    level: 2,
    price: 1500,
    maxCars: 4,
    speed: 6.5,
    run: 0.11,
    pips: 2,
    color: "#2f7a45",
    trim: "#ffd23f",
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -2.6 10 5.2">
      <path d="M-2.9 -2.1H2.9A1.1 1.1 0 0 1 4 -1V1A1.1 1.1 0 0 1 2.9 2.1H-2.9A1.1 1.1 0 0 1 -4 1V-1A1.1 1.1 0 0 1 -2.9 -2.1Z" fill="#2f7a45" stroke="rgba(18,24,38,0.9)" stroke-width="0.8" stroke-linejoin="round"/>
      <rect x="-4" y="-2.1" width="2.6" height="4.2" fill="rgb(32,85,48)"/>
      <rect x="-1.9" y="-1.4" width="0.5" height="2.8" fill="#9fd0ff"/>
      <rect x="-1.2" y="-0.3" width="5" height="0.6" fill="#ffd23f"/>
      <rect x="-1" y="-1.7" width="4.6" height="0.5" fill="rgb(99,155,115)"/>
      <rect x="3.7" y="-0.4" width="0.5" height="0.8" fill="#fff3a8"/>
    </svg>`,
  },
  freightmaster: {
    name: "Freightmaster",
    level: 3,
    price: 3000,
    maxCars: 12,
    speed: 6,
    run: 0.14,
    pips: 2,
    color: "#c4432f",
    trim: "#f2c14e",
    freightOnly: true,
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -2.6 10 5.2">
      <rect x="-4.4" y="-2.1" width="8.8" height="4.2" rx="0.8" fill="#c4432f" stroke="rgba(18,24,38,0.9)" stroke-width="0.8"/>
      <rect x="-4.4" y="-2.1" width="8.8" height="0.6" fill="#f2c14e"/><rect x="-4.4" y="1.5" width="8.8" height="0.6" fill="#f2c14e"/>
      <g fill="#7d2a1e"><rect x="-3.8" y="-1.2" width="0.5" height="2.4"/><rect x="-3" y="-1.2" width="0.5" height="2.4"/><rect x="-2.2" y="-1.2" width="0.5" height="2.4"/></g>
      <g fill="#2d2a2e"><circle cx="-0.8" cy="0" r="0.45"/><circle cx="0.4" cy="0" r="0.45"/></g>
      <rect x="1.8" y="-1.6" width="2.4" height="3.2" rx="0.4" fill="#a8382a"/>
      <rect x="3.5" y="-1.3" width="0.5" height="2.6" fill="#23344f"/>
      <rect x="4.1" y="-0.4" width="0.4" height="0.8" fill="#fff3a8"/>
    </svg>`,
  },
  diesel: {
    name: "Diesel Hauler",
    level: 5,
    price: 4000,
    maxCars: 6,
    speed: 8,
    run: 0.15,
    pips: 3,
    color: "#e08a2c",
    trim: "#2d2a2e",
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -2.6 10 5.2">
      <path d="M-2.9 -2.1H2.9A1.1 1.1 0 0 1 4 -1V1A1.1 1.1 0 0 1 2.9 2.1H-2.9A1.1 1.1 0 0 1 -4 1V-1A1.1 1.1 0 0 1 -2.9 -2.1Z" fill="#e08a2c" stroke="rgba(18,24,38,0.9)" stroke-width="0.8" stroke-linejoin="round"/>
      <rect x="-3.4" y="-2.1" width="0.7" height="4.2" fill="#2b282d"/>
      <rect x="2.1" y="-2.1" width="0.7" height="4.2" fill="#2b282d"/>
      <rect x="-2" y="-1" width="0.8" height="2" fill="#9aa3ad"/>
      <rect x="-0.7" y="-1" width="0.8" height="2" fill="#9aa3ad"/>
      <rect x="0.6" y="-1" width="0.8" height="2" fill="#9aa3ad"/>
      <rect x="3" y="-1.5" width="0.7" height="3" fill="#23344f"/>
      <rect x="-3.8" y="-1.7" width="7.4" height="0.5" fill="rgb(233,173,107)"/>
    </svg>`,
  },
  titan: {
    name: "Titan",
    level: 7,
    price: 7000,
    maxCars: 10,
    speed: 7,
    run: 0.18,
    pips: 2,
    color: "#2b282d",
    trim: "#d9a92c",
    steam: 8.4,
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-11.5 -2.6 23 5.2">
      <rect x="-11" y="-2.1" width="6.6" height="4.2" rx="0.9" fill="#2b282d" stroke="rgba(18,24,38,0.9)" stroke-width="0.8"/>
      <rect x="-10.3" y="-1.4" width="5.2" height="2.8" rx="0.4" fill="#141316"/>
      <g fill="#2e2c31"><rect x="-9.8" y="-1" width="1" height="0.7"/><rect x="-8.2" y="0.2" width="1.2" height="0.7"/><rect x="-6.6" y="-0.8" width="0.9" height="0.6"/></g>
      <rect x="-4" y="-2.1" width="14.4" height="4.2" rx="0.7" fill="#2b282d" stroke="rgba(18,24,38,0.9)" stroke-width="0.8"/>
      <rect x="-4" y="-2.1" width="3" height="4.2" rx="0.6" fill="#3a363d"/>
      <rect x="-3.6" y="-1.7" width="2.2" height="0.4" fill="#d9a92c"/>
      <rect x="-3.6" y="1.3" width="2.2" height="0.4" fill="#d9a92c"/>
      <rect x="-0.9" y="-1.45" width="10.6" height="2.9" rx="1.2" fill="#46424a"/>
      <rect x="-0.6" y="-1.2" width="10" height="0.45" fill="rgba(255,255,255,0.18)"/>
      <g fill="#d9a92c"><rect x="1.2" y="-1.45" width="0.35" height="2.9"/><rect x="4.4" y="-1.45" width="0.35" height="2.9"/><rect x="7.4" y="-1.45" width="0.35" height="2.9"/></g>
      <g fill="#2b282d" stroke="#141316" stroke-width="0.2"><circle cx="2.8" cy="0" r="0.75"/><circle cx="5.9" cy="0" r="0.7"/></g>
      <circle cx="8.4" cy="0" r="0.85" fill="#111"/>
      <rect x="9.7" y="-1.45" width="0.7" height="2.9" fill="#1c1b1f"/>
      <circle cx="10.2" cy="0" r="0.45" fill="#fff3a8"/>
      <rect x="10.4" y="-1.7" width="0.7" height="3.4" fill="#6d7680"/>
    </svg>`,
  },
  bullet: {
    name: "Bullet",
    level: 9,
    price: 10000,
    maxCars: 8,
    speed: 13,
    run: 0.22,
    pips: 5,
    color: "#f4f6f8",
    trim: "#2a6fd6",
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -2.6 10 5.2">
      <path d="M-4.5 -2.1L1.5 -2.1Q5 -2.1 5 0Q5 2.1 1.5 2.1L-4.5 2.1Z" fill="#f4f6f8" stroke="rgba(18,24,38,0.9)" stroke-width="0.8" stroke-linejoin="round"/>
      <rect x="-4.5" y="-0.45" width="7.5" height="0.9" fill="#2a6fd6"/>
      <path d="M1.5 0a1.1 1.4 0 1 0 2.2 0a1.1 1.4 0 1 0 -2.2 0Z" fill="#23344f"/>
      <rect x="-4" y="-1.7" width="5" height="0.4" fill="rgba(255,255,255,0.7)"/>
    </svg>`,
  },
  maglev: {
    name: "Maglev",
    level: 10,
    price: 18000,
    maxCars: 6,
    speed: 22,
    run: 0.24,
    pips: 5,
    color: "#f4f6f8",
    trim: "#1fa3c9",
    maglev: true,
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-5.5 -2.6 11 5.2">
      <path d="M-4.6 -2L0.6 -2Q4.9 -1.9 4.9 0Q4.9 1.9 0.6 2L-4.6 2Q-4.9 2 -4.9 1.6L-4.9 -1.6Q-4.9 -2 -4.6 -2Z" fill="#f4f6f8" stroke="rgba(18,24,38,0.9)" stroke-width="0.8" stroke-linejoin="round"/>
      <rect x="-4.6" y="-0.35" width="8" height="0.7" fill="#1fa3c9"/>
      <rect x="-4.4" y="-1.65" width="6" height="0.4" fill="rgba(255,255,255,0.9)"/>
      <path d="M1.6 -1.4Q4.2 -1.2 4.4 0Q4.2 1.2 1.6 1.4Z" fill="#23344f"/>
      <rect x="2.2" y="-1.1" width="0.7" height="0.45" fill="rgba(170,215,255,0.85)"/>
    </svg>`,
  },
};

export const CARS = {
  pax: {
    name: "Passenger car",
    short: "Passenger",
    level: 1,
    price: 150,
    holds: "pax",
    cap: 4,
    color: "#b8463b",
    dark: "#7e2c25",
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-3.9 -2.6 7.8 5.2">
      <path d="M-2.4 -2.1H2.4A1.1 1.1 0 0 1 3.5 -1V1A1.1 1.1 0 0 1 2.4 2.1H-2.4A1.1 1.1 0 0 1 -3.5 1V-1A1.1 1.1 0 0 1 -2.4 -2.1Z" fill="#b8463b" stroke="rgba(18,24,38,0.9)" stroke-width="0.8" stroke-linejoin="round"/>
      <rect x="-3.1" y="-0.55" width="6.2" height="1.1" fill="rgb(205,125,117)"/>
      <rect x="-2.6" y="-0.2" width="0.6" height="0.4" fill="#7e2c25"/>
      <rect x="2" y="-0.2" width="0.6" height="0.4" fill="#7e2c25"/>
      <rect x="-2.6" y="-2" width="0.55" height="0.35" fill="#ffe7a3"/>
      <rect x="-2.6" y="1.65" width="0.55" height="0.35" fill="#ffe7a3"/>
      <rect x="-1.3" y="-2" width="0.55" height="0.35" fill="#ffe7a3"/>
      <rect x="-1.3" y="1.65" width="0.55" height="0.35" fill="#ffe7a3"/>
      <rect x="0" y="-2" width="0.55" height="0.35" fill="#ffe7a3"/>
      <rect x="0" y="1.65" width="0.55" height="0.35" fill="#ffe7a3"/>
      <rect x="1.3" y="-2" width="0.55" height="0.35" fill="#ffe7a3"/>
      <rect x="1.3" y="1.65" width="0.55" height="0.35" fill="#ffe7a3"/>
      <rect x="2.6" y="-2" width="0.55" height="0.35" fill="#ffe7a3"/>
      <rect x="2.6" y="1.65" width="0.55" height="0.35" fill="#ffe7a3"/>
    </svg>`,
  },
  box: {
    name: "Boxcar",
    short: "Boxcar",
    level: 1,
    price: 150,
    holds: "cargo",
    cap: 4,
    color: "#8b5a33",
    dark: "#5c3a1f",
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-3.9 -2.6 7.8 5.2">
      <path d="M-2.4 -2.1H2.4A1.1 1.1 0 0 1 3.5 -1V1A1.1 1.1 0 0 1 2.4 2.1H-2.4A1.1 1.1 0 0 1 -3.5 1V-1A1.1 1.1 0 0 1 -2.4 -2.1Z" fill="#8b5a33" stroke="rgba(18,24,38,0.9)" stroke-width="0.8" stroke-linejoin="round"/>
      <rect x="-2.4" y="-1.8" width="0.3" height="3.6" fill="#5c3a1f"/>
      <rect x="-1.2" y="-1.8" width="0.3" height="3.6" fill="#5c3a1f"/>
      <rect x="0" y="-1.8" width="0.3" height="3.6" fill="#5c3a1f"/>
      <rect x="1.2" y="-1.8" width="0.3" height="3.6" fill="#5c3a1f"/>
      <rect x="2.4" y="-1.8" width="0.3" height="3.6" fill="#5c3a1f"/>
      <rect x="-3.1" y="-1.8" width="6.2" height="0.45" fill="rgb(168,131,102)"/>
    </svg>`,
  },
  tank: {
    name: "Tanker",
    short: "Tanker",
    level: 6,
    price: 300,
    holds: "fuel",
    cap: 3,
    color: "#a7b0ba",
    dark: "#6d7680",
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-3.9 -2.6 7.8 5.2">
      <path d="M-1.5 -2.1H1.5A2 2 0 0 1 3.5 -0.1V0.1A2 2 0 0 1 1.5 2.1H-1.5A2 2 0 0 1 -3.5 0.1V-0.1A2 2 0 0 1 -1.5 -2.1Z" fill="#a7b0ba" stroke="rgba(18,24,38,0.9)" stroke-width="0.8" stroke-linejoin="round"/>
      <rect x="-2.6" y="-1.2" width="5.2" height="0.5" fill="rgba(255,255,255,0.55)"/>
      <path d="M-0.9 0a0.9 0.9 0 1 0 1.8 0a0.9 0.9 0 1 0 -1.8 0Z" fill="#6d7680"/>
      <rect x="-3.3" y="1.1" width="6.6" height="0.4" fill="#d6dbe0"/>
    </svg>`,
  },
  hopper: {
    name: "Hopper car",
    short: "Hopper",
    level: 4,
    price: 200,
    holds: "bulk",
    cap: 6,
    color: "#5a4a3c",
    dark: "#2a2420",
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-3.9 -2.6 7.8 5.2">
      <rect x="-3.5" y="-2.1" width="7" height="4.2" rx="0.5" fill="#5a4a3c" stroke="rgba(18,24,38,0.9)" stroke-width="0.8"/>
      <rect x="-3.1" y="-1.6" width="2.8" height="3.2" rx="0.3" fill="#2a2420"/><rect x="0.3" y="-1.6" width="2.8" height="3.2" rx="0.3" fill="#2a2420"/>
      <g fill="#463d36"><rect x="-2.5" y="-0.9" width="0.8" height="0.6"/><rect x="-1.4" y="0.2" width="0.7" height="0.6"/><rect x="0.9" y="-0.6" width="0.8" height="0.6"/><rect x="2" y="0.5" width="0.6" height="0.5"/></g>
      <rect x="-0.3" y="-2.1" width="0.6" height="4.2" fill="#7a6552"/>
    </svg>`,
  },
  mail: {
    name: "Mail car",
    short: "Mail",
    level: 2,
    price: 250,
    holds: "mail",
    cap: 4,
    color: "#2a6fd6",
    dark: "#1d4f9c",
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-3.9 -2.6 7.8 5.2">
      <path d="M-2.4 -2.1H2.4A1.1 1.1 0 0 1 3.5 -1V1A1.1 1.1 0 0 1 2.4 2.1H-2.4A1.1 1.1 0 0 1 -3.5 1V-1A1.1 1.1 0 0 1 -2.4 -2.1Z" fill="#2a6fd6" stroke="rgba(18,24,38,0.9)" stroke-width="0.8" stroke-linejoin="round"/>
      <rect x="-3.1" y="-1.8" width="6.2" height="0.45" fill="#5d8fe0"/>
      <rect x="-3.1" y="-0.35" width="6.2" height="0.7" fill="#f4f6f8"/>
      <rect x="-3.1" y="-0.1" width="6.2" height="0.2" fill="#d6453a"/>
      <rect x="-1" y="-1.3" width="2" height="2.6" rx="0.2" fill="#1d4f9c"/>
    </svg>`,
  },
  flat: {
    name: "Flatcar",
    short: "Flatcar",
    level: 8,
    price: 700,
    holds: "wide",
    cap: 1,
    color: "#f2c14e",
    dark: "#4a4f57",
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-3.9 -2.6 7.8 5.2">
      <rect x="-3.5" y="-1.5" width="7" height="3" rx="0.3" fill="#4a4f57" stroke="rgba(18,24,38,0.9)" stroke-width="0.8"/>
      <rect x="-2.8" y="-2.2" width="5.6" height="4.4" rx="0.4" fill="#e08a2c" stroke="rgba(18,24,38,0.9)" stroke-width="0.5"/>
      <rect x="-2.4" y="-1.8" width="4.8" height="3.6" rx="0.3" fill="#f2a34a"/>
      <circle cx="0" cy="0" r="1" fill="#c96f1e"/>
      <g fill="#f2c14e"><rect x="-2.8" y="-2.2" width="0.5" height="0.5"/><rect x="2.3" y="-2.2" width="0.5" height="0.5"/><rect x="-2.8" y="1.7" width="0.5" height="0.5"/><rect x="2.3" y="1.7" width="0.5" height="0.5"/></g>
    </svg>`,
  },
};

// range is in world units; fuel is coins per world unit flown.
// vtol: true means it can land at any city (helicopters, tiltrotors), not just airports.
// seaplane: true means it can also land at ports, mooring at the pier.
// rotors: [[x, y, radius], ...] in the art's sub pixel units. They're drawn on top of the
// art and spin while flying, so leave them out of the svg itself.
// hold: { fuel, bulk } extra room for heavy loads, on top of pax and cargo.
// deck: room for trucks to drive aboard, like a car ferry (see TRUCKS).
// deckSpace: it's small enough to land on an aircraft carrier, taking that many spaces on its deck.
export const PLANES = {
  sparrow: {
    name: "Sparrow",
    level: 1,
    price: 600,
    pax: 2,
    cargo: 1,
    hold: { mail: 2 },
    range: 120,
    speed: 9,
    fuel: 0.3,
    pips: 2,
    deckSpace: 1,
    color: "#f1ead8",
    trim: "#d6453a",
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-8 -8 16 16">
      <path d="M2.42 -1.3L1.42 -6L-0.08 -6L-0.98 -1.3L-0.98 1.3L-0.08 6L1.42 6L2.42 1.3ZM-3.2 -1.04L-4.6 -3.08L-5.6 -3.08L-5.4 -1.04L-5.4 1.04L-5.6 3.08L-4.6 3.08L-3.2 1.04ZM-4.7 -1.3H4.7A1.3 1.3 0 0 1 6 0V0A1.3 1.3 0 0 1 4.7 1.3H-4.7A1.3 1.3 0 0 1 -6 0V0A1.3 1.3 0 0 1 -4.7 -1.3Z" fill="none" stroke="rgba(18,24,38,0.9)" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M2.42 -1.3L1.42 -6L-0.08 -6L-0.98 -1.3L-0.98 1.3L-0.08 6L1.42 6L2.42 1.3ZM-3.2 -1.04L-4.6 -3.08L-5.6 -3.08L-5.4 -1.04L-5.4 1.04L-5.6 3.08L-4.6 3.08L-3.2 1.04Z" fill="rgb(216,210,194)"/>
      <rect x="-0.98" y="-1.9" width="3.4" height="0.6" fill="rgb(180,175,162)"/>
      <rect x="-0.98" y="1.3" width="3.4" height="0.6" fill="rgb(180,175,162)"/>
      <path d="M-4.7 -1.3H4.7A1.3 1.3 0 0 1 6 0V0A1.3 1.3 0 0 1 4.7 1.3H-4.7A1.3 1.3 0 0 1 -6 0V0A1.3 1.3 0 0 1 -4.7 -1.3Z" fill="#f1ead8"/>
      <rect x="-4.5" y="-0.95" width="8.5" height="0.5" fill="rgba(255,255,255,0.5)"/>
      <rect x="-5.2" y="-0.3" width="7.44" height="0.6" fill="#d6453a"/>
      <rect x="-6.2" y="-0.55" width="3" height="1.1" fill="#d6453a"/>
      <rect x="-0.08" y="-6" width="1.7" height="0.8" fill="#d6453a"/>
      <rect x="-0.08" y="5.2" width="1.7" height="0.8" fill="#d6453a"/>
      <path d="M3.9 -0.85H4.3A0.5 0.5 0 0 1 4.8 -0.35V0.35A0.5 0.5 0 0 1 4.3 0.85H3.9A0.5 0.5 0 0 1 3.4 0.35V-0.35A0.5 0.5 0 0 1 3.9 -0.85Z" fill="#23344f"/>
      <rect x="3.6" y="-0.75" width="0.5" height="0.5" fill="rgba(170,215,255,0.85)"/>
      <rect x="6.2" y="-1.2" width="0.6" height="2.4" fill="rgba(40,40,48,0.85)"/>
    </svg>`,
  },
  islander: {
    name: "Islander",
    level: 2,
    price: 2000,
    pax: 4,
    cargo: 2,
    range: 160,
    speed: 11,
    fuel: 0.45,
    pips: 3,
    deckSpace: 2,
    color: "#f4f6f8",
    trim: "#2a6fd6",
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -10.25 20 20.5">
      <path d="M3.16 -1.58L1.06 -8.25L-0.79 -8.25L-1.24 -1.58L-1.24 1.58L-0.79 8.25L1.06 8.25L3.16 1.58ZM-4.75 -1.26L-6.6 -3.94L-7.6 -3.94L-7.4 -1.26L-7.4 1.26L-7.6 3.94L-6.6 3.94L-4.75 1.26ZM-6.42 -1.58H6.42A1.58 1.58 0 0 1 8 0V0A1.58 1.58 0 0 1 6.42 1.58H-6.42A1.58 1.58 0 0 1 -8 0V0A1.58 1.58 0 0 1 -6.42 -1.58Z" fill="none" stroke="rgba(18,24,38,0.9)" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M3.16 -1.58L1.06 -8.25L-0.79 -8.25L-1.24 -1.58L-1.24 1.58L-0.79 8.25L1.06 8.25L3.16 1.58ZM-4.75 -1.26L-6.6 -3.94L-7.6 -3.94L-7.4 -1.26L-7.4 1.26L-7.6 3.94L-6.6 3.94L-4.75 1.26Z" fill="rgb(219,221,223)"/>
      <rect x="-1.24" y="-2.18" width="4.4" height="0.6" fill="rgb(183,184,186)"/>
      <rect x="-1.24" y="1.58" width="4.4" height="0.6" fill="rgb(183,184,186)"/>
      <path d="M-6.42 -1.58H6.42A1.58 1.58 0 0 1 8 0V0A1.58 1.58 0 0 1 6.42 1.58H-6.42A1.58 1.58 0 0 1 -8 0V0A1.58 1.58 0 0 1 -6.42 -1.58Z" fill="#f4f6f8"/>
      <rect x="-6.5" y="-1.23" width="12.5" height="0.5" fill="rgba(255,255,255,0.5)"/>
      <rect x="-7.2" y="-0.3" width="9.92" height="0.6" fill="#2a6fd6"/>
      <rect x="-8.2" y="-0.55" width="3.4" height="1.1" fill="#2a6fd6"/>
      <rect x="-0.79" y="-8.25" width="2.05" height="0.8" fill="#2a6fd6"/>
      <rect x="-0.79" y="7.45" width="2.05" height="0.8" fill="#2a6fd6"/>
      <path d="M5.6 -1.13H6.2A0.5 0.5 0 0 1 6.7 -0.63V0.63A0.5 0.5 0 0 1 6.2 1.13H5.6A0.5 0.5 0 0 1 5.1 0.63V-0.63A0.5 0.5 0 0 1 5.6 -1.13Z" fill="#23344f"/>
      <rect x="5.3" y="-1.03" width="0.5" height="0.5" fill="rgba(170,215,255,0.85)"/>
    </svg>`,
  },
  bushhawk: {
    name: "Bushhawk",
    level: 4,
    price: 1400,
    pax: 0,
    cargo: 1,
    hold: { bulk: 3 },
    range: 130,
    speed: 8,
    fuel: 0.35,
    pips: 2,
    deckSpace: 1,
    color: "#8a7a4a",
    trim: "#e08a2c",
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-8 -8 16 16">
      <path d="M2.6 -1.7L1.6 -7L-0.2 -7L-1.2 -1.7L-1.2 1.7L-0.2 7L1.6 7L2.6 1.7ZM-3.2 -1.2L-4.6 -3.4L-5.6 -3.4L-5.4 -1.2L-5.4 1.2L-5.6 3.4L-4.6 3.4L-3.2 1.2ZM-4.3 -1.7H4.3A1.7 1.7 0 0 1 6 0V0A1.7 1.7 0 0 1 4.3 1.7H-4.3A1.7 1.7 0 0 1 -6 0V0A1.7 1.7 0 0 1 -4.3 -1.7Z" fill="none" stroke="rgba(18,24,38,0.9)" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M2.6 -1.7L1.6 -7L-0.2 -7L-1.2 -1.7L-1.2 1.7L-0.2 7L1.6 7L2.6 1.7ZM-3.2 -1.2L-4.6 -3.4L-5.6 -3.4L-5.4 -1.2L-5.4 1.2L-5.6 3.4L-4.6 3.4L-3.2 1.2Z" fill="#6f6238"/>
      <path d="M-4.3 -1.7H4.3A1.7 1.7 0 0 1 6 0V0A1.7 1.7 0 0 1 4.3 1.7H-4.3A1.7 1.7 0 0 1 -6 0V0A1.7 1.7 0 0 1 -4.3 -1.7Z" fill="#8a7a4a"/>
      <rect x="-4" y="-1.3" width="8" height="0.5" fill="rgba(255,255,255,0.35)"/>
      <rect x="-3.6" y="-1" width="3" height="2" rx="0.3" fill="#5c3a1f" stroke="rgba(18,24,38,0.6)" stroke-width="0.25"/>
      <rect x="-3.6" y="-0.12" width="3" height="0.24" fill="#e08a2c"/>
      <rect x="-0.2" y="-7" width="1.8" height="0.8" fill="#e08a2c"/>
      <rect x="-0.2" y="6.2" width="1.8" height="0.8" fill="#e08a2c"/>
      <path d="M3.9 -1H4.4A0.5 0.5 0 0 1 4.9 -0.5V0.5A0.5 0.5 0 0 1 4.4 1H3.9A0.5 0.5 0 0 1 3.4 0.5V-0.5A0.5 0.5 0 0 1 3.9 -1Z" fill="#23344f"/>
      <rect x="3.6" y="-0.9" width="0.5" height="0.5" fill="rgba(170,215,255,0.85)"/>
      <rect x="6.2" y="-1.2" width="0.6" height="2.4" fill="rgba(40,40,48,0.85)"/>
    </svg>`,
  },
  firefly: {
    name: "Firefly",
    level: 6,
    price: 1800,
    pax: 0,
    cargo: 0,
    hold: { fuel: 2 },
    range: 140,
    speed: 9,
    fuel: 0.4,
    pips: 2,
    deckSpace: 1,
    color: "#d6453a",
    trim: "#ffd23f",
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-8 -8 16 16">
      <path d="M2.6 -1.7L1.6 -7L-0.2 -7L-1.2 -1.7L-1.2 1.7L-0.2 7L1.6 7L2.6 1.7ZM-3.2 -1.2L-4.6 -3.4L-5.6 -3.4L-5.4 -1.2L-5.4 1.2L-5.6 3.4L-4.6 3.4L-3.2 1.2ZM-4.3 -1.7H4.3A1.7 1.7 0 0 1 6 0V0A1.7 1.7 0 0 1 4.3 1.7H-4.3A1.7 1.7 0 0 1 -6 0V0A1.7 1.7 0 0 1 -4.3 -1.7Z" fill="none" stroke="rgba(18,24,38,0.9)" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M2.6 -1.7L1.6 -7L-0.2 -7L-1.2 -1.7L-1.2 1.7L-0.2 7L1.6 7L2.6 1.7ZM-3.2 -1.2L-4.6 -3.4L-5.6 -3.4L-5.4 -1.2L-5.4 1.2L-5.6 3.4L-4.6 3.4L-3.2 1.2Z" fill="#b0362d"/>
      <g fill="#d6dbe0" stroke="#6d7680" stroke-width="0.3"><rect x="0" y="-5.6" width="1.4" height="1.6" rx="0.5"/><rect x="0" y="4" width="1.4" height="1.6" rx="0.5"/></g>
      <path d="M-4.3 -1.7H4.3A1.7 1.7 0 0 1 6 0V0A1.7 1.7 0 0 1 4.3 1.7H-4.3A1.7 1.7 0 0 1 -6 0V0A1.7 1.7 0 0 1 -4.3 -1.7Z" fill="#d6453a"/>
      <rect x="-4" y="-1.3" width="8" height="0.5" fill="rgba(255,255,255,0.35)"/>
      <rect x="-5.4" y="-0.3" width="8.4" height="0.6" fill="#ffd23f"/>
      <rect x="-0.2" y="-7" width="1.8" height="0.8" fill="#ffd23f"/>
      <rect x="-0.2" y="6.2" width="1.8" height="0.8" fill="#ffd23f"/>
      <path d="M3.9 -1H4.4A0.5 0.5 0 0 1 4.9 -0.5V0.5A0.5 0.5 0 0 1 4.4 1H3.9A0.5 0.5 0 0 1 3.4 0.5V-0.5A0.5 0.5 0 0 1 3.9 -1Z" fill="#23344f"/>
      <rect x="3.6" y="-0.9" width="0.5" height="0.5" fill="rgba(170,215,255,0.85)"/>
      <rect x="6.2" y="-1.2" width="0.6" height="2.4" fill="rgba(40,40,48,0.85)"/>
    </svg>`,
  },
  otter: {
    name: "Otter",
    level: 4,
    price: 2400,
    pax: 4,
    cargo: 2,
    range: 150,
    speed: 8,
    fuel: 0.4,
    pips: 2,
    deckSpace: 2,
    color: "#f2c14e",
    trim: "#2a6fd6",
    seaplane: true,
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-9 -9 18 18">
      <rect x="-3.6" y="-3.4" width="9.4" height="1.4" rx="0.7" fill="#e9e4d6" stroke="rgba(18,24,38,0.9)" stroke-width="0.4"/><rect x="-3.6" y="2" width="9.4" height="1.4" rx="0.7" fill="#e9e4d6" stroke="rgba(18,24,38,0.9)" stroke-width="0.4"/>
      <g fill="#6d7680"><rect x="0.8" y="-2.1" width="0.4" height="1"/><rect x="2.6" y="-2.1" width="0.4" height="1"/><rect x="0.8" y="1.1" width="0.4" height="1"/><rect x="2.6" y="1.1" width="0.4" height="1"/></g>
      <path d="M-5.2 -0.6L-5.8 -3.2L-7 -3.2L-7 -0.6ZM-5.2 0.6L-5.8 3.2L-7 3.2L-7 0.6ZM-7.2 -0.95Q-7.7 0 -7.2 0.95L3.6 1.3Q6.6 1.1 6.9 0Q6.6 -1.1 3.6 -1.3Z" fill="none" stroke="rgba(18,24,38,0.9)" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M-5.2 -0.6L-5.8 -3.2L-7 -3.2L-7 -0.6ZM-5.2 0.6L-5.8 3.2L-7 3.2L-7 0.6Z" fill="#d9a83c"/>
      <path d="M-7.2 -0.95Q-7.7 0 -7.2 0.95L3.6 1.3Q6.6 1.1 6.9 0Q6.6 -1.1 3.6 -1.3Z" fill="#f2c14e"/>
      <rect x="-6.6" y="-0.25" width="10" height="0.5" fill="#2a6fd6"/>
      <path d="M3.8 -0.9Q5.8 -0.8 6.2 0Q5.8 0.8 3.8 0.9Z" fill="#23344f"/>
      <path d="M3.4 -8.2L3.4 8.2L0.6 8.2L0.6 -8.2Z" fill="#f2c14e" stroke="rgba(18,24,38,0.9)" stroke-width="0.9" stroke-linejoin="round"/>
      <rect x="0.6" y="-8.2" width="2.8" height="0.4" fill="rgba(255,255,255,0.5)"/>
      <rect x="0.6" y="-8.2" width="2.8" height="1" fill="#2a6fd6"/><rect x="0.6" y="7.2" width="2.8" height="1" fill="#2a6fd6"/>
      <rect x="7" y="-1.8" width="0.45" height="3.6" fill="rgba(40,40,48,0.6)"/>
    </svg>`,
  },
  vista: {
    name: "Vista",
    level: 3,
    price: 2800,
    pax: 3,
    cargo: 1,
    range: 200,
    speed: 14,
    fuel: 0.4,
    pips: 3,
    deckSpace: 1,
    color: "#f4f6f8",
    trim: "#d6453a",
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-8 -8 16 16">
      <path d="M1.8 -1.3L-0.2 -6.4L-1.6 -6.4L-1.2 -1.3ZM1.8 1.3L-0.2 6.4L-1.6 6.4L-1.2 1.3ZM-4.4 -0.6L-6.3 -3.2L-7.1 -3.2L-6.3 -0.6ZM-4.4 0.6L-6.3 3.2L-7.1 3.2L-6.3 0.6ZM-6.6 -1.1Q-7.1 0 -6.6 1.1L3.6 1.45Q6.6 1.3 7.2 0Q6.6 -1.3 3.6 -1.45Z" fill="none" stroke="rgba(18,24,38,0.9)" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M1.8 -1.3L-0.2 -6.4L-1.6 -6.4L-1.2 -1.3ZM1.8 1.3L-0.2 6.4L-1.6 6.4L-1.2 1.3ZM-4.4 -0.6L-6.3 -3.2L-7.1 -3.2L-6.3 -0.6ZM-4.4 0.6L-6.3 3.2L-7.1 3.2L-6.3 0.6Z" fill="#dcdde0"/>
      <path d="M-6.6 -1.1Q-7.1 0 -6.6 1.1L3.6 1.45Q6.6 1.3 7.2 0Q6.6 -1.3 3.6 -1.45Z" fill="#f4f6f8"/>
      <rect x="-5.6" y="-0.95" width="9" height="0.45" fill="rgba(255,255,255,0.6)"/>
      <rect x="-5.8" y="-0.25" width="10" height="0.5" fill="#d6453a"/>
      <rect x="-0.2" y="-6.4" width="1.4" height="0.7" fill="#d6453a"/><rect x="-0.2" y="5.7" width="1.4" height="0.7" fill="#d6453a"/>
      <ellipse cx="-3.6" cy="0" rx="1.7" ry="0.95" fill="#7d8693" stroke="rgba(18,24,38,0.9)" stroke-width="0.35"/>
      <rect x="-2.1" y="-0.6" width="0.4" height="1.2" fill="#2d2a2e"/>
      <path d="M3.4 -1Q5.4 -0.9 5.8 0Q5.4 0.9 3.4 1Z" fill="#23344f"/>
      <rect x="4" y="-0.8" width="0.6" height="0.4" fill="rgba(170,215,255,0.85)"/>
    </svg>`,
  },
  dakota: {
    name: "Dakota",
    level: 5,
    price: 3500,
    pax: 6,
    cargo: 3,
    range: 180,
    speed: 10,
    fuel: 0.5,
    pips: 3,
    deckSpace: 2,
    color: "#c9ced4",
    trim: "#d6453a",
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-12 -12 24 24">
      <path d="M2.6 -1.3L1.2 -10.4Q0.4 -11.4 -0.6 -10.6L-1.8 -1.3ZM2.6 1.3L1.2 10.4Q0.4 11.4 -0.6 10.6L-1.8 1.3ZM-5.4 -0.7L-6.2 -3.9Q-6.8 -4.6 -7.5 -3.9L-7.6 -0.7ZM-5.4 0.7L-6.2 3.9Q-6.8 4.6 -7.5 3.9L-7.6 0.7ZM-7.8 -0.85Q-8.4 0 -7.8 0.85L4.4 1.45Q8 1.25 8.3 0Q8 -1.25 4.4 -1.45Z" fill="none" stroke="rgba(18,24,38,0.9)" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M2.6 -1.3L1.2 -10.4Q0.4 -11.4 -0.6 -10.6L-1.8 -1.3ZM2.6 1.3L1.2 10.4Q0.4 11.4 -0.6 10.6L-1.8 1.3ZM-5.4 -0.7L-6.2 -3.9Q-6.8 -4.6 -7.5 -3.9L-7.6 -0.7ZM-5.4 0.7L-6.2 3.9Q-6.8 4.6 -7.5 3.9L-7.6 0.7Z" fill="#b7bdc4"/>
      <rect x="-1.8" y="-1.9" width="4.4" height="0.5" fill="#a3aab2"/><rect x="-1.8" y="1.4" width="4.4" height="0.5" fill="#a3aab2"/>
      <rect x="-0.8" y="-4.65" width="4.6" height="1.7" rx="0.7" fill="#aab1b9" stroke="rgba(18,24,38,0.9)" stroke-width="0.35"/><rect x="3.4" y="-4.75" width="0.9" height="1.9" rx="0.4" fill="#2d2a2e"/><rect x="4.5" y="-5.2" width="0.35" height="2.8" fill="rgba(40,40,48,0.6)"/><rect x="-0.8" y="2.95" width="4.6" height="1.7" rx="0.7" fill="#aab1b9" stroke="rgba(18,24,38,0.9)" stroke-width="0.35"/><rect x="3.4" y="2.85" width="0.9" height="1.9" rx="0.4" fill="#2d2a2e"/><rect x="4.5" y="2.4" width="0.35" height="2.8" fill="rgba(40,40,48,0.6)"/>
      <path d="M-7.8 -0.85Q-8.4 0 -7.8 0.85L4.4 1.45Q8 1.25 8.3 0Q8 -1.25 4.4 -1.45Z" fill="#c9ced4"/>
      <rect x="-7" y="-1.1" width="12" height="0.45" fill="rgba(255,255,255,0.6)"/>
      <rect x="-7.4" y="-0.25" width="12.4" height="0.5" fill="#d6453a"/>
      <rect x="-0.5" y="-10.7" width="1.6" height="0.7" fill="#d6453a"/><rect x="-0.5" y="10" width="1.6" height="0.7" fill="#d6453a"/>
      <path d="M5 -1Q7.2 -0.9 7.6 0Q7.2 0.9 5 1Z" fill="#23344f"/>
      <rect x="5.4" y="-0.8" width="0.6" height="0.4" fill="rgba(170,215,255,0.85)"/>
    </svg>`,
  },
  cargomaster: {
    name: "Cargomaster",
    level: 6,
    price: 5000,
    pax: 2,
    cargo: 6,
    range: 200,
    speed: 11,
    fuel: 0.6,
    pips: 3,
    deckSpace: 2,
    color: "#d9a92c",
    trim: "#5a4314",
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-12 -12.5 24 25">
      <path d="M3.9 -1.85L0.7 -10.5L-1.5 -10.5L-1.5 -1.85L-1.5 1.85L-1.5 10.5L0.7 10.5L3.9 1.85ZM-6.3 -1.48L-8.6 -4.79L-9.6 -4.79L-9.4 -1.48L-9.4 1.48L-9.6 4.79L-8.6 4.79L-6.3 1.48ZM-8.15 -1.85H8.15A1.85 1.85 0 0 1 10 0V0A1.85 1.85 0 0 1 8.15 1.85H-8.15A1.85 1.85 0 0 1 -10 0V0A1.85 1.85 0 0 1 -8.15 -1.85Z" fill="none" stroke="rgba(18,24,38,0.9)" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M3.9 -1.85L0.7 -10.5L-1.5 -10.5L-1.5 -1.85L-1.5 1.85L-1.5 10.5L0.7 10.5L3.9 1.85ZM-6.3 -1.48L-8.6 -4.79L-9.6 -4.79L-9.4 -1.48L-9.4 1.48L-9.6 4.79L-8.6 4.79L-6.3 1.48Z" fill="rgb(195,152,39)"/>
      <rect x="-1.5" y="-2.45" width="5.4" height="0.6" fill="rgb(162,126,33)"/>
      <rect x="-1.5" y="1.85" width="5.4" height="0.6" fill="rgb(162,126,33)"/>
      <rect x="1.14" y="-7.84" width="3.2" height="1.9" fill="rgba(18,24,38,0.9)"/>
      <rect x="1.44" y="-7.59" width="2.7" height="1.4" fill="#7d8693"/>
      <rect x="3.64" y="-7.59" width="0.5" height="1.4" fill="#d0d6dd"/>
      <rect x="1.14" y="5.94" width="3.2" height="1.9" fill="rgba(18,24,38,0.9)"/>
      <rect x="1.44" y="6.19" width="2.7" height="1.4" fill="#7d8693"/>
      <rect x="3.64" y="6.19" width="0.5" height="1.4" fill="#d0d6dd"/>
      <path d="M-8.15 -1.85H8.15A1.85 1.85 0 0 1 10 0V0A1.85 1.85 0 0 1 8.15 1.85H-8.15A1.85 1.85 0 0 1 -10 0V0A1.85 1.85 0 0 1 -8.15 -1.85Z" fill="#d9a92c"/>
      <rect x="-8.5" y="-1.5" width="16.5" height="0.5" fill="rgba(255,255,255,0.5)"/>
      <rect x="-9.2" y="-0.3" width="12.4" height="0.6" fill="#5a4314"/>
      <rect x="-10.2" y="-0.55" width="3.8" height="1.1" fill="#5a4314"/>
      <rect x="-1.5" y="-10.5" width="2.4" height="0.8" fill="#5a4314"/>
      <rect x="-1.5" y="9.7" width="2.4" height="0.8" fill="#5a4314"/>
      <path d="M7.3 -1.4H8.1A0.5 0.5 0 0 1 8.6 -0.9V0.9A0.5 0.5 0 0 1 8.1 1.4H7.3A0.5 0.5 0 0 1 6.8 0.9V-0.9A0.5 0.5 0 0 1 7.3 -1.4Z" fill="#23344f"/>
      <rect x="7" y="-1.3" width="0.5" height="0.5" fill="rgba(170,215,255,0.85)"/>
    </svg>`,
  },
  kestrel: {
    name: "Kestrel",
    level: 7,
    price: 8000,
    pax: 6,
    cargo: 1,
    range: 400,
    speed: 17,
    fuel: 0.75,
    pips: 4,
    deckSpace: 2,
    color: "#f4f6f8",
    trim: "#1f4e8c",
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -10 20 20">
      <path d="M2.6 -1.4L-2.6 -8.4L-4 -8.4L-1.8 -1.4ZM2.6 1.4L-2.6 8.4L-4 8.4L-1.8 1.4ZM-5.8 -0.6L-8.4 -4L-9.4 -4L-8.2 -0.6ZM-5.8 0.6L-8.4 4L-9.4 4L-8.2 0.6ZM-8.6 -1.1Q-9.2 0 -8.6 1.1L5.6 1.55Q9 1.35 9.6 0Q9 -1.35 5.6 -1.55Z" fill="none" stroke="rgba(18,24,38,0.9)" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M2.6 -1.4L-2.6 -8.4L-4 -8.4L-1.8 -1.4ZM2.6 1.4L-2.6 8.4L-4 8.4L-1.8 1.4ZM-5.8 -0.6L-8.4 -4L-9.4 -4L-8.2 -0.6ZM-5.8 0.6L-8.4 4L-9.4 4L-8.2 0.6Z" fill="#dcdde0"/>
      <path d="M-8.6 -1.1Q-9.2 0 -8.6 1.1L5.6 1.55Q9 1.35 9.6 0Q9 -1.35 5.6 -1.55Z" fill="#f4f6f8"/>
      <rect x="-7.6" y="-1.15" width="13" height="0.5" fill="rgba(255,255,255,0.6)"/>
      <rect x="-8" y="-0.3" width="14" height="0.6" fill="#1f4e8c"/>
      <rect x="-4" y="-8.4" width="1.6" height="0.7" fill="#1f4e8c"/><rect x="-4" y="7.7" width="1.6" height="0.7" fill="#1f4e8c"/>
      <rect x="-6.6" y="-2.9" width="2.8" height="1.4" rx="0.7" fill="#7d8693" stroke="rgba(18,24,38,0.9)" stroke-width="0.35"/><rect x="-6.6" y="1.5" width="2.8" height="1.4" rx="0.7" fill="#7d8693" stroke="rgba(18,24,38,0.9)" stroke-width="0.35"/>
      <rect x="-7.4" y="-0.75" width="2.8" height="1.5" rx="0.75" fill="#7d8693" stroke="rgba(18,24,38,0.9)" stroke-width="0.35"/>
      <g fill="#d0d6dd"><rect x="-4.2" y="-2.7" width="0.4" height="1"/><rect x="-4.2" y="1.7" width="0.4" height="1"/><rect x="-5" y="-0.5" width="0.4" height="1"/></g>
      <path d="M6.2 -1.1Q8.4 -1 8.9 0Q8.4 1 6.2 1.1Z" fill="#23344f"/>
      <rect x="6.7" y="-0.85" width="0.6" height="0.4" fill="rgba(170,215,255,0.85)"/>
    </svg>`,
  },
  tandem: {
    name: "Tandem",
    level: 7,
    price: 6500,
    pax: 4,
    cargo: 6,
    range: 120,
    speed: 7,
    fuel: 0.7,
    pips: 2,
    deckSpace: 2,
    color: "#5b6b3a",
    trim: "#3f4a28",
    vtol: true,
    rotors: [
      [5.6, 0, 6.9],
      [-6.2, 0, 6.9],
    ],
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-13 -8 26 16">
      <path d="M-8.6 -2Q-9.4 -2 -9.4 -1.2L-9.4 1.2Q-9.4 2 -8.6 2L7 2Q9.4 2 9.6 0Q9.4 -2 7 -2Z" fill="#5b6b3a" stroke="rgba(18,24,38,0.9)" stroke-width="1" stroke-linejoin="round"/>
      <rect x="-8.6" y="-1.5" width="15" height="0.5" fill="rgba(255,255,255,0.18)"/>
      <rect x="-8.2" y="-1.2" width="3.8" height="2.4" rx="0.8" fill="#3f4a28" stroke="rgba(18,24,38,0.9)" stroke-width="0.3"/>
      <rect x="-3.4" y="-1.6" width="2.6" height="3.2" rx="0.6" fill="#3f4a28"/>
      <g fill="#2d2a2e"><rect x="-2.9" y="-1.3" width="0.4" height="0.7"/><rect x="-2.1" y="-1.3" width="0.4" height="0.7"/><rect x="-2.9" y="0.6" width="0.4" height="0.7"/><rect x="-2.1" y="0.6" width="0.4" height="0.7"/></g>
      <path d="M6.8 -1.5Q8.8 -1.3 9.1 0Q8.8 1.3 6.8 1.5Z" fill="#23344f"/>
      <rect x="7.2" y="-1.2" width="0.6" height="0.45" fill="rgba(170,215,255,0.85)"/>
    </svg>`,
  },
  skyliner: {
    name: "Skyliner",
    level: 8,
    price: 12000,
    pax: 10,
    cargo: 4,
    range: 320,
    speed: 15,
    fuel: 0.8,
    pips: 4,
    color: "#f4f6f8",
    trim: "#2f9a5a",
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-14 -14.75 28 29.5">
      <path d="M4.64 -2.13L0.34 -12.75L-2.21 -12.75L-1.76 -2.13L-1.76 2.13L-2.21 12.75L0.34 12.75L4.64 2.13ZM-7.85 -1.7L-10.6 -5.64L-11.6 -5.64L-11.4 -1.7L-11.4 1.7L-11.6 5.64L-10.6 5.64L-7.85 1.7ZM-9.88 -2.13H9.88A2.13 2.13 0 0 1 12 0V0A2.13 2.13 0 0 1 9.88 2.13H-9.88A2.13 2.13 0 0 1 -12 0V0A2.13 2.13 0 0 1 -9.88 -2.13Z" fill="none" stroke="rgba(18,24,38,0.9)" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M4.64 -2.13L0.34 -12.75L-2.21 -12.75L-1.76 -2.13L-1.76 2.13L-2.21 12.75L0.34 12.75L4.64 2.13ZM-7.85 -1.7L-10.6 -5.64L-11.6 -5.64L-11.4 -1.7L-11.4 1.7L-11.6 5.64L-10.6 5.64L-7.85 1.7Z" fill="rgb(219,221,223)"/>
      <rect x="-1.76" y="-2.73" width="6.4" height="0.6" fill="rgb(183,184,186)"/>
      <rect x="-1.76" y="2.13" width="6.4" height="0.6" fill="rgb(183,184,186)"/>
      <rect x="1.26" y="-9.2" width="3.2" height="1.9" fill="rgba(18,24,38,0.9)"/>
      <rect x="1.56" y="-8.95" width="2.7" height="1.4" fill="#7d8693"/>
      <rect x="3.76" y="-8.95" width="0.5" height="1.4" fill="#d0d6dd"/>
      <rect x="1.26" y="7.3" width="3.2" height="1.9" fill="rgba(18,24,38,0.9)"/>
      <rect x="1.56" y="7.55" width="2.7" height="1.4" fill="#7d8693"/>
      <rect x="3.76" y="7.55" width="0.5" height="1.4" fill="#d0d6dd"/>
      <path d="M-9.88 -2.13H9.88A2.13 2.13 0 0 1 12 0V0A2.13 2.13 0 0 1 9.88 2.13H-9.88A2.13 2.13 0 0 1 -12 0V0A2.13 2.13 0 0 1 -9.88 -2.13Z" fill="#f4f6f8"/>
      <rect x="-10.5" y="-1.77" width="20.5" height="0.5" fill="rgba(255,255,255,0.5)"/>
      <rect x="-11.2" y="-0.3" width="14.88" height="0.6" fill="#2f9a5a"/>
      <rect x="-12.2" y="-0.55" width="4.2" height="1.1" fill="#2f9a5a"/>
      <rect x="-2.21" y="-12.75" width="2.75" height="0.8" fill="#2f9a5a"/>
      <rect x="-2.21" y="11.95" width="2.75" height="0.8" fill="#2f9a5a"/>
      <path d="M9 -1.68H10A0.5 0.5 0 0 1 10.5 -1.18V1.18A0.5 0.5 0 0 1 10 1.68H9A0.5 0.5 0 0 1 8.5 1.18V-1.18A0.5 0.5 0 0 1 9 -1.68Z" fill="#23344f"/>
      <rect x="8.7" y="-1.57" width="0.5" height="0.5" fill="rgba(170,215,255,0.85)"/>
    </svg>`,
  },
  pelican: {
    name: "Pelican Tanker",
    short: "Pelican",
    level: 8,
    price: 6500,
    pax: 0,
    cargo: 0,
    hold: { fuel: 3 },
    range: 220,
    speed: 8,
    fuel: 0.7,
    pips: 2,
    color: "#d6453a",
    trim: "#f4f6f8",
    seaplane: true,
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-11 -11 22 22">
      <g transform="scale(1.2)">
      <rect x="-3.6" y="-3.6" width="9.6" height="1.6" rx="0.8" fill="#d6dbe0" stroke="rgba(18,24,38,0.9)" stroke-width="0.4"/><rect x="-3.6" y="2" width="9.6" height="1.6" rx="0.8" fill="#d6dbe0" stroke="rgba(18,24,38,0.9)" stroke-width="0.4"/>
      <g fill="#6d7680"><rect x="0.8" y="-2.1" width="0.4" height="1"/><rect x="2.6" y="-2.1" width="0.4" height="1"/><rect x="0.8" y="1.1" width="0.4" height="1"/><rect x="2.6" y="1.1" width="0.4" height="1"/></g>
      <path d="M-5.2 -0.7L-5.8 -3.4L-7 -3.4L-7 -0.7ZM-5.2 0.7L-5.8 3.4L-7 3.4L-7 0.7ZM-7.2 -1.1Q-7.7 0 -7.2 1.1L3.6 1.5Q6.8 1.3 7.1 0Q6.8 -1.3 3.6 -1.5Z" fill="none" stroke="rgba(18,24,38,0.9)" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M-5.2 -0.7L-5.8 -3.4L-7 -3.4L-7 -0.7ZM-5.2 0.7L-5.8 3.4L-7 3.4L-7 0.7Z" fill="#b8372e"/>
      <path d="M-7.2 -1.1Q-7.7 0 -7.2 1.1L3.6 1.5Q6.8 1.3 7.1 0Q6.8 -1.3 3.6 -1.5Z" fill="#d6453a"/>
      <rect x="-4.6" y="-0.75" width="4.2" height="1.5" rx="0.6" fill="#a7b0ba" stroke="rgba(18,24,38,0.9)" stroke-width="0.3"/>
      <rect x="-6.6" y="-0.2" width="1.8" height="0.4" fill="#f4f6f8"/>
      <path d="M3.8 -1Q6 -0.9 6.4 0Q6 0.9 3.8 1Z" fill="#23344f"/>
      <path d="M3.6 -8.6L3.6 8.6L0.6 8.6L0.6 -8.6Z" fill="#d6453a" stroke="rgba(18,24,38,0.9)" stroke-width="0.9" stroke-linejoin="round"/>
      <rect x="0.6" y="-8.6" width="3" height="0.4" fill="rgba(255,255,255,0.4)"/>
      <rect x="0.6" y="-8.6" width="3" height="1.1" fill="#f4f6f8"/><rect x="0.6" y="7.5" width="3" height="1.1" fill="#f4f6f8"/>
      <rect x="7.2" y="-1.8" width="0.45" height="3.6" fill="rgba(40,40,48,0.6)"/>
      </g>
    </svg>`,
  },
  heron: {
    name: "Heron",
    level: 9,
    price: 14000,
    pax: 8,
    cargo: 4,
    range: 260,
    speed: 13,
    fuel: 0.9,
    pips: 4,
    deckSpace: 2,
    color: "#8a949e",
    trim: "#4a525a",
    vtol: true,
    rotors: [
      [0.5, -6.2, 4.7],
      [0.5, 6.2, 4.7],
    ],
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-11 -11.5 22 23">
      <path d="M1.6 -1.4L1.6 -6.2L-1.4 -6.2L-1.4 -1.4ZM1.6 1.4L1.6 6.2L-1.4 6.2L-1.4 1.4ZM-6 -0.6L-7.4 -3.4L-8.8 -3.4L-8.6 -0.6ZM-6 0.6L-7.4 3.4L-8.8 3.4L-8.6 0.6ZM-8.8 -1.2Q-9.3 0 -8.8 1.2L5 1.55Q8.6 1.35 9 0Q8.6 -1.35 5 -1.55Z" fill="none" stroke="rgba(18,24,38,0.9)" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M1.6 -1.4L1.6 -6.2L-1.4 -6.2L-1.4 -1.4ZM1.6 1.4L1.6 6.2L-1.4 6.2L-1.4 1.4ZM-6 -0.6L-7.4 -3.4L-8.8 -3.4L-8.6 -0.6ZM-6 0.6L-7.4 3.4L-8.8 3.4L-8.6 0.6Z" fill="#79838d"/>
      <path d="M-8.8 -1.2Q-9.3 0 -8.8 1.2L5 1.55Q8.6 1.35 9 0Q8.6 -1.35 5 -1.55Z" fill="#8a949e"/>
      <rect x="-8" y="-1.15" width="13" height="0.45" fill="rgba(255,255,255,0.3)"/>
      <rect x="-8.8" y="-3.6" width="1.5" height="0.7" fill="#4a525a"/><rect x="-8.8" y="2.9" width="1.5" height="0.7" fill="#4a525a"/>
      <rect x="-1.6" y="-1" width="3.4" height="2" rx="0.5" fill="#4a525a"/>
      <path d="M5.4 -1.1Q8 -1 8.4 0Q8 1 5.4 1.1Z" fill="#23344f"/>
      <rect x="5.9" y="-0.85" width="0.6" height="0.4" fill="rgba(170,215,255,0.85)"/>
      <rect x="-1.6" y="-7.2" width="4.2" height="2" rx="0.9" fill="#4a525a" stroke="rgba(18,24,38,0.9)" stroke-width="0.4"/><rect x="-1.6" y="5.2" width="4.2" height="2" rx="0.9" fill="#4a525a" stroke="rgba(18,24,38,0.9)" stroke-width="0.4"/>
    </svg>`,
  },
  jumbo: {
    name: "Jumbo",
    level: 11,
    price: 30000,
    pax: 16,
    cargo: 10,
    range: 520,
    speed: 18,
    fuel: 1.1,
    pips: 5,
    color: "#f4f6f8",
    trim: "#7b4fc9",
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-16 -17 32 34">
      <path d="M5.38 -2.4L-0.02 -15L-2.92 -15L-2.02 -2.4L-2.02 2.4L-2.92 15L-0.02 15L5.38 2.4ZM-9.4 -1.92L-12.6 -6.5L-13.6 -6.5L-13.4 -1.92L-13.4 1.92L-13.6 6.5L-12.6 6.5L-9.4 1.92ZM-11.6 -2.4H11.6A2.4 2.4 0 0 1 14 0V0A2.4 2.4 0 0 1 11.6 2.4H-11.6A2.4 2.4 0 0 1 -14 0V0A2.4 2.4 0 0 1 -11.6 -2.4Z" fill="none" stroke="rgba(18,24,38,0.9)" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M5.38 -2.4L-0.02 -15L-2.92 -15L-2.02 -2.4L-2.02 2.4L-2.92 15L-0.02 15L5.38 2.4ZM-9.4 -1.92L-12.6 -6.5L-13.6 -6.5L-13.4 -1.92L-13.4 1.92L-13.6 6.5L-12.6 6.5L-9.4 1.92Z" fill="rgb(219,221,223)"/>
      <rect x="-2.02" y="-3" width="7.4" height="0.6" fill="rgb(183,184,186)"/>
      <rect x="-2.02" y="2.4" width="7.4" height="0.6" fill="rgb(183,184,186)"/>
      <rect x="1.91" y="-9.35" width="3.2" height="1.9" fill="rgba(18,24,38,0.9)"/>
      <rect x="2.21" y="-9.1" width="2.7" height="1.4" fill="#7d8693"/>
      <rect x="4.41" y="-9.1" width="0.5" height="1.4" fill="#d0d6dd"/>
      <rect x="1.91" y="7.45" width="3.2" height="1.9" fill="rgba(18,24,38,0.9)"/>
      <rect x="2.21" y="7.7" width="2.7" height="1.4" fill="#7d8693"/>
      <rect x="4.41" y="7.7" width="0.5" height="1.4" fill="#d0d6dd"/>
      <rect x="-0.15" y="-14.15" width="3.2" height="1.9" fill="rgba(18,24,38,0.9)"/>
      <rect x="0.15" y="-13.9" width="2.7" height="1.4" fill="#7d8693"/>
      <rect x="2.35" y="-13.9" width="0.5" height="1.4" fill="#d0d6dd"/>
      <rect x="-0.15" y="12.25" width="3.2" height="1.9" fill="rgba(18,24,38,0.9)"/>
      <rect x="0.15" y="12.5" width="2.7" height="1.4" fill="#7d8693"/>
      <rect x="2.35" y="12.5" width="0.5" height="1.4" fill="#d0d6dd"/>
      <path d="M-11.6 -2.4H11.6A2.4 2.4 0 0 1 14 0V0A2.4 2.4 0 0 1 11.6 2.4H-11.6A2.4 2.4 0 0 1 -14 0V0A2.4 2.4 0 0 1 -11.6 -2.4Z" fill="#f4f6f8"/>
      <rect x="-12.5" y="-2.05" width="24.5" height="0.5" fill="rgba(255,255,255,0.5)"/>
      <rect x="-13.2" y="-0.3" width="17.36" height="0.6" fill="#7b4fc9"/>
      <rect x="-14.2" y="-0.55" width="4.6" height="1.1" fill="#7b4fc9"/>
      <rect x="-2.92" y="-15" width="3.1" height="0.8" fill="#7b4fc9"/>
      <rect x="-2.92" y="14.2" width="3.1" height="0.8" fill="#7b4fc9"/>
      <path d="M10.7 -1.95H11.9A0.5 0.5 0 0 1 12.4 -1.45V1.45A0.5 0.5 0 0 1 11.9 1.95H10.7A0.5 0.5 0 0 1 10.2 1.45V-1.45A0.5 0.5 0 0 1 10.7 -1.95Z" fill="#23344f"/>
      <rect x="10.4" y="-1.85" width="0.5" height="0.5" fill="rgba(170,215,255,0.85)"/>
    </svg>`,
  },
  skywhale: {
    name: "Skywhale",
    level: 11,
    price: 40000,
    pax: 0,
    cargo: 16,
    deck: 4,
    range: 450,
    speed: 13,
    fuel: 1.2,
    pips: 4,
    color: "#f4f6f8",
    trim: "#2a6fd6",
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-17 -17 34 34">
      <path d="M4 -3L-1 -15.5H-3.6L-2.6 -3V3L-3.6 15.5H-1L4 3Z" fill="rgb(219,221,223)" stroke="rgba(18,24,38,0.9)" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M-11.6 -2L-14.4 -6.8H-15.6L-15.2 -2V2L-15.6 6.8H-14.4L-11.6 2Z" fill="rgb(219,221,223)" stroke="rgba(18,24,38,0.9)" stroke-width="1.1" stroke-linejoin="round"/>
      <g stroke="rgba(18,24,38,0.9)" stroke-width="0.4"><rect x="-15.9" y="-7.6" width="1.6" height="1.4" rx="0.3" fill="#f4f6f8"/><rect x="-15.9" y="6.2" width="1.6" height="1.4" rx="0.3" fill="#f4f6f8"/></g>
      <g fill="rgba(18,24,38,0.9)"><rect x="0.6" y="-10.4" width="3.4" height="2" rx="0.4"/><rect x="0.6" y="8.4" width="3.4" height="2" rx="0.4"/></g>
      <g fill="#7d8693"><rect x="0.9" y="-10.15" width="2.9" height="1.5" rx="0.3"/><rect x="0.9" y="8.65" width="2.9" height="1.5" rx="0.3"/></g>
      <path d="M-12.4 -2.2C-6 -3 -2 -4.6 6 -4.6C12 -4.6 15.6 -2.6 15.6 0C15.6 2.6 12 4.6 6 4.6C-2 4.6 -6 3 -12.4 2.2C-14.4 1.6 -14.4 -1.6 -12.4 -2.2Z" fill="#f4f6f8" stroke="rgba(18,24,38,0.9)" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M-6 -1.1C0 -2.4 6 -3 10 -2.6" stroke="rgba(18,24,38,0.18)" stroke-width="0.5" fill="none"/>
      <path d="M12.6 -2.2Q15 -1.4 15 0Q15 1.4 12.6 2.2Q14 0 12.6 -2.2Z" fill="#2a6fd6"/>
      <g fill="#23344f"><rect x="13.1" y="-1.2" width="0.7" height="0.7" rx="0.2"/><rect x="13.1" y="0.5" width="0.7" height="0.7" rx="0.2"/></g>
      <rect x="-11" y="-0.3" width="20" height="0.6" fill="#2a6fd6" opacity="0.55"/>
    </svg>`,
  },
  humpback: {
    name: "Humpback",
    level: 12,
    price: 45000,
    pax: 24,
    cargo: 14,
    range: 700,
    speed: 18,
    fuel: 1.4,
    pips: 5,
    color: "#f4f6f8",
    trim: "#2a6fd6",
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-17 -17 34 34">
      <path d="M4.2 -2L-6.2 -15L-8.4 -15L-3 -2ZM4.2 2L-6.2 15L-8.4 15L-3 2ZM-10.2 -1L-14.2 -6.4L-15.6 -6.4L-13.8 -1ZM-10.2 1L-14.2 6.4L-15.6 6.4L-13.8 1ZM-14 -1.9Q-15 0 -14 1.9L10.6 2.15Q15.6 1.95 16.2 0Q15.6 -1.95 10.6 -2.15Z" fill="none" stroke="rgba(18,24,38,0.9)" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M4.2 -2L-6.2 -15L-8.4 -15L-3 -2ZM4.2 2L-6.2 15L-8.4 15L-3 2ZM-10.2 -1L-14.2 -6.4L-15.6 -6.4L-13.8 -1ZM-10.2 1L-14.2 6.4L-15.6 6.4L-13.8 1Z" fill="#dcdde0"/>
      <rect x="-0.08" y="-6.55" width="3.2" height="1.9" rx="0.95" fill="#7d8693" stroke="rgba(18,24,38,0.9)" stroke-width="0.35"/><rect x="2.62" y="-6.3" width="0.45" height="1.4" fill="#d0d6dd"/><rect x="-0.08" y="4.65" width="3.2" height="1.9" rx="0.95" fill="#7d8693" stroke="rgba(18,24,38,0.9)" stroke-width="0.35"/><rect x="2.62" y="4.9" width="0.45" height="1.4" fill="#d0d6dd"/><rect x="-3.76" y="-11.15" width="3.2" height="1.9" rx="0.95" fill="#7d8693" stroke="rgba(18,24,38,0.9)" stroke-width="0.35"/><rect x="-1.06" y="-10.9" width="0.45" height="1.4" fill="#d0d6dd"/><rect x="-3.76" y="9.25" width="3.2" height="1.9" rx="0.95" fill="#7d8693" stroke="rgba(18,24,38,0.9)" stroke-width="0.35"/><rect x="-1.06" y="9.5" width="0.45" height="1.4" fill="#d0d6dd"/>
      <path d="M-14 -1.9Q-15 0 -14 1.9L10.6 2.15Q15.6 1.95 16.2 0Q15.6 -1.95 10.6 -2.15Z" fill="#f4f6f8"/>
      <rect x="-12.6" y="-1.7" width="23" height="0.55" fill="rgba(255,255,255,0.6)"/>
      <rect x="-13.2" y="-0.35" width="24" height="0.7" fill="#2a6fd6"/>
      <rect x="5.6" y="-1.35" width="8.4" height="2.7" rx="1.35" fill="#ffffff" stroke="rgba(18,24,38,0.35)" stroke-width="0.25"/>
      <g fill="#8aa0b8"><rect x="6.6" y="-0.95" width="0.5" height="0.35"/><rect x="7.8" y="-0.95" width="0.5" height="0.35"/><rect x="9" y="-0.95" width="0.5" height="0.35"/><rect x="10.2" y="-0.95" width="0.5" height="0.35"/><rect x="6.6" y="0.6" width="0.5" height="0.35"/><rect x="7.8" y="0.6" width="0.5" height="0.35"/><rect x="9" y="0.6" width="0.5" height="0.35"/><rect x="10.2" y="0.6" width="0.5" height="0.35"/></g>
      <rect x="-8.4" y="-15" width="2.4" height="0.9" fill="#2a6fd6"/><rect x="-8.4" y="14.1" width="2.4" height="0.9" fill="#2a6fd6"/>
      <rect x="-15.4" y="-0.35" width="4.4" height="0.7" fill="#2a6fd6"/>
      <path d="M13.4 -1.3Q15.2 -1.2 15.7 0Q15.2 1.2 13.4 1.3Z" fill="#23344f"/>
      <rect x="13.9" y="-1" width="0.7" height="0.45" fill="rgba(170,215,255,0.85)"/>
    </svg>`,
  },
  machdart: {
    name: "Mach Dart",
    level: 12,
    price: 60000,
    pax: 8,
    cargo: 2,
    hold: { mail: 6 },
    range: 800,
    speed: 32,
    fuel: 2.2,
    pips: 5,
    color: "#f4f6f8",
    trim: "#1f3f7a",
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-15 -8 30 16">
      <path d="M5.6 -1.1C0 -1.6 -5.6 -4.2 -8.8 -6.8L-12 -6.8L-12.3 -1.1ZM5.6 1.1C0 1.6 -5.6 4.2 -8.8 6.8L-12 6.8L-12.3 1.1ZM-13.6 -0.95Q-14.2 0 -13.6 0.95L8.6 1.2L14.6 0.15L14.6 -0.15L8.6 -1.2Z" fill="none" stroke="rgba(18,24,38,0.9)" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M5.6 -1.1C0 -1.6 -5.6 -4.2 -8.8 -6.8L-12 -6.8L-12.3 -1.1ZM5.6 1.1C0 1.6 -5.6 4.2 -8.8 6.8L-12 6.8L-12.3 1.1Z" fill="#e3e5e8"/>
      <g fill="#7d8693" stroke="rgba(18,24,38,0.9)" stroke-width="0.35"><rect x="-12.9" y="-3.9" width="3.6" height="1.7" rx="0.3"/><rect x="-12.9" y="2.2" width="3.6" height="1.7" rx="0.3"/></g>
      <g fill="#2d2a2e"><rect x="-13.1" y="-3.7" width="0.45" height="0.55"/><rect x="-13.1" y="-2.95" width="0.45" height="0.55"/><rect x="-13.1" y="2.4" width="0.45" height="0.55"/><rect x="-13.1" y="3.15" width="0.45" height="0.55"/></g>
      <path d="M-13.6 -0.95Q-14.2 0 -13.6 0.95L8.6 1.2L14.6 0.15L14.6 -0.15L8.6 -1.2Z" fill="#f4f6f8"/>
      <rect x="-12.6" y="-0.85" width="20" height="0.4" fill="rgba(255,255,255,0.7)"/>
      <rect x="-14.6" y="-0.3" width="5.4" height="0.6" fill="#1f3f7a"/>
      <path d="M-9 -0.2L5 -0.2L5 0.2L-9 0.2Z" fill="#d6453a"/>
      <path d="M8.4 -0.75L10.6 -0.45L10.6 0.45L8.4 0.75Z" fill="#23344f"/>
      <rect x="8.8" y="-0.55" width="0.6" height="0.35" fill="rgba(170,215,255,0.85)"/>
    </svg>`,
  },
};

// boats are slow but cheap to run; cap is how many of each job type fit on board (missing types are 0).
// harbor: true means it only docks at ports that also have a rail station.
// deck: room for trucks to drive aboard (see TRUCKS), on top of what cap holds.
// maxCars: a tug that tows that many BARGES, like an engine pulls cars; run goes up 0.02 for each.
// deckFor: 'plane' makes the deck an aircraft carrier's: planes with deckSpace land on it, and it can
// anchor at the ANCHORAGES in data.js as a landing strip out at sea.
export const BOATS = {
  coaster: {
    name: "Coaster",
    level: 1,
    price: 800,
    cap: { pax: 2, cargo: 4, fuel: 0, mail: 2 },
    speed: 4,
    run: 0.04,
    pips: 1,
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-7.5 -3 15 6">
      <path d="M-6.4 -2.3L3 -2.3Q7 -2.3 7 0Q7 2.3 3 2.3L-6.4 2.3Q-7 2.3 -7 1.7L-7 -1.7Q-7 -2.3 -6.4 -2.3Z" fill="#d6453a" stroke="rgba(18,24,38,0.9)" stroke-width="0.7" stroke-linejoin="round"/>
      <path d="M-6.2 -1.6L3 -1.6Q5.9 -1.6 5.9 0Q5.9 1.6 3 1.6L-6.2 1.6Z" fill="#efe6d2"/>
      <rect x="-5.8" y="-1.3" width="3" height="2.6" rx="0.4" fill="#f4f6f8" stroke="rgba(18,24,38,0.9)" stroke-width="0.4"/>
      <rect x="-3.3" y="-1" width="0.4" height="2" fill="#23344f"/>
      <rect x="-1.6" y="-1.2" width="2" height="2.4" fill="#8b5a33"/>
      <rect x="0.8" y="-1" width="1.8" height="2" fill="#a36a33"/>
      <rect x="-1.6" y="-0.15" width="4.2" height="0.3" fill="#5c3a1f"/>
    </svg>`,
  },
  ferry: {
    name: "Ferry",
    level: 3,
    price: 2200,
    cap: { pax: 10, cargo: 2, fuel: 0 },
    speed: 5,
    run: 0.06,
    pips: 2,
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-9.5 -3.5 19 7">
      <path d="M-8.4 -2.8L4 -2.8Q9 -2.8 9 0Q9 2.8 4 2.8L-8.4 2.8Q-9 2.8 -9 2.2L-9 -2.2Q-9 -2.8 -8.4 -2.8Z" fill="#f4f6f8" stroke="rgba(18,24,38,0.9)" stroke-width="0.7" stroke-linejoin="round"/>
      <path d="M-8.4 -2.8L4 -2.8Q9 -2.8 9 0L8.2 0Q8.2 -2.1 4 -2.1L-8.4 -2.1Z" fill="#2a6fd6"/>
      <path d="M-8.4 2.8L4 2.8Q9 2.8 9 0L8.2 0Q8.2 2.1 4 2.1L-8.4 2.1Z" fill="#2a6fd6"/>
      <rect x="-7" y="-1.7" width="11" height="3.4" rx="0.8" fill="#dfe4ea" stroke="rgba(18,24,38,0.6)" stroke-width="0.3"/>
      <rect x="-6" y="-1.2" width="8.6" height="2.4" rx="0.5" fill="#f4f6f8"/>
      <g fill="#2a6fd6"><rect x="-5.6" y="-1.5" width="0.6" height="0.3"/><rect x="-4.2" y="-1.5" width="0.6" height="0.3"/><rect x="-2.8" y="-1.5" width="0.6" height="0.3"/><rect x="-1.4" y="-1.5" width="0.6" height="0.3"/><rect x="0" y="-1.5" width="0.6" height="0.3"/><rect x="1.4" y="-1.5" width="0.6" height="0.3"/><rect x="-5.6" y="1.2" width="0.6" height="0.3"/><rect x="-4.2" y="1.2" width="0.6" height="0.3"/><rect x="-2.8" y="1.2" width="0.6" height="0.3"/><rect x="-1.4" y="1.2" width="0.6" height="0.3"/><rect x="0" y="1.2" width="0.6" height="0.3"/><rect x="1.4" y="1.2" width="0.6" height="0.3"/></g>
      <rect x="3" y="-1.2" width="0.6" height="2.4" fill="#23344f"/>
      <rect x="-3.4" y="-0.7" width="1.8" height="1.4" rx="0.5" fill="#d6453a" stroke="rgba(18,24,38,0.9)" stroke-width="0.3"/>
      <rect x="-3" y="-0.35" width="1" height="0.7" rx="0.3" fill="#2d2a2e"/>
    </svg>`,
  },
  carferry: {
    name: "Car Ferry",
    level: 5,
    price: 2600,
    cap: { pax: 6 },
    deck: 6,
    speed: 4.5,
    run: 0.06,
    pips: 1,
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -3.6 20 7.2">
      <path d="M-9 -2.9H6Q9.6 -2.9 9.6 0Q9.6 2.9 6 2.9H-9Q-9.6 2.9 -9.6 2.3V-2.3Q-9.6 -2.9 -9 -2.9Z" fill="#1f4e8c" stroke="rgba(18,24,38,0.9)" stroke-width="0.7" stroke-linejoin="round"/>
      <rect x="-9.2" y="-2.2" width="14.6" height="4.4" fill="#5b6470"/>
      <g fill="#ffd23f"><rect x="-9.2" y="-0.1" width="14.6" height="0.2"/><rect x="-9.6" y="-1.6" width="0.4" height="3.2"/></g>
      <g stroke="rgba(18,24,38,0.8)" stroke-width="0.25"><rect x="-8.6" y="-1.8" width="3.4" height="1.4" rx="0.2" fill="#d6453a"/><rect x="-4.6" y="-1.8" width="2.6" height="1.4" rx="0.2" fill="#2a6fd6"/><rect x="-8" y="0.4" width="4.6" height="1.4" rx="0.2" fill="#f1ead8"/><rect x="-2.8" y="0.4" width="2.2" height="1.4" rx="0.2" fill="#f2c14e"/></g>
      <rect x="5.4" y="-2.3" width="2.6" height="4.6" rx="0.6" fill="#f4f6f8" stroke="rgba(18,24,38,0.9)" stroke-width="0.4"/>
      <rect x="7.3" y="-1.7" width="0.4" height="3.4" fill="#23344f"/>
      <rect x="5.9" y="-0.6" width="1" height="1.2" rx="0.3" fill="#d6453a"/>
    </svg>`,
  },
  barge: {
    name: "Barge",
    level: 4,
    price: 1200,
    cap: { bulk: 6 },
    speed: 3.5,
    run: 0.04,
    pips: 1,
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-8.5 -3 17 6">
      <path d="M-7.4 -2.3L5 -2.3Q8 -2.3 8 0Q8 2.3 5 2.3L-7.4 2.3Q-8 2.3 -8 1.7L-8 -1.7Q-8 -2.3 -7.4 -2.3Z" fill="#5a6b3a" stroke="rgba(18,24,38,0.9)" stroke-width="0.7" stroke-linejoin="round"/>
      <path d="M-7.2 -1.6L5 -1.6Q6.9 -1.6 6.9 0Q6.9 1.6 5 1.6L-7.2 1.6Z" fill="#4a4f55"/>
      <rect x="-7" y="-1.3" width="2.6" height="2.6" rx="0.4" fill="#f4f6f8" stroke="rgba(18,24,38,0.9)" stroke-width="0.4"/>
      <rect x="-6.4" y="-0.5" width="1.2" height="1" rx="0.3" fill="#2d2a2e"/>
      <g fill="#7a5a3a"><ellipse cx="-2.4" cy="0" rx="1.5" ry="1.2"/><ellipse cx="0.8" cy="0" rx="1.5" ry="1.2"/><ellipse cx="4" cy="0" rx="1.3" ry="1.1"/></g>
      <g fill="#9a7650"><ellipse cx="-2.6" cy="-0.3" rx="0.7" ry="0.5"/><ellipse cx="0.6" cy="-0.3" rx="0.7" ry="0.5"/><ellipse cx="3.8" cy="-0.3" rx="0.6" ry="0.45"/></g>
    </svg>`,
  },
  bunker: {
    name: "Bunker Boat",
    level: 6,
    price: 1600,
    cap: { fuel: 4 },
    speed: 4,
    run: 0.05,
    pips: 1,
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-7.5 -3 15 6">
      <path d="M-6.4 -2.3L3 -2.3Q7 -2.3 7 0Q7 2.3 3 2.3L-6.4 2.3Q-7 2.3 -7 1.7L-7 -1.7Q-7 -2.3 -6.4 -2.3Z" fill="#2d2a2e" stroke="rgba(18,24,38,0.9)" stroke-width="0.7" stroke-linejoin="round"/>
      <path d="M-6.2 -1.6L3 -1.6Q5.9 -1.6 5.9 0Q5.9 1.6 3 1.6L-6.2 1.6Z" fill="#a7b0ba"/>
      <path d="M-6.2 -1.6L3 -1.6Q5.9 -1.6 5.9 0L5.2 0Q5.2 -1.1 3 -1.1L-6.2 -1.1Z" fill="#d6453a"/>
      <rect x="-5.8" y="-1.3" width="2.6" height="2.6" rx="0.4" fill="#f4f6f8" stroke="rgba(18,24,38,0.9)" stroke-width="0.4"/>
      <rect x="-3" y="-1" width="0.4" height="2" fill="#23344f"/>
      <rect x="-2.2" y="-0.25" width="6.4" height="0.5" fill="#6d7680"/>
      <g fill="#d6dbe0" stroke="#6d7680" stroke-width="0.3"><circle cx="-0.8" cy="0" r="1.1"/><circle cx="2" cy="0" r="1.1"/></g>
    </svg>`,
  },
  tug: {
    name: "Tugboat",
    level: 6,
    price: 2500,
    cap: {},
    maxCars: 3,
    speed: 3.5,
    run: 0.04,
    pips: 1,
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4.4 -2.6 8.8 5.2">
      <path d="M-3.6 -2H1.6Q4 -2 4 0Q4 2 1.6 2H-3.6Q-4 2 -4 1.6V-1.6Q-4 -2 -3.6 -2Z" fill="#d6453a" stroke="rgba(18,24,38,0.9)" stroke-width="0.6" stroke-linejoin="round"/>
      <path d="M-3.6 -2H1.6Q4 -2 4 0Q4 2 1.6 2H-3.6" fill="none" stroke="#2d2a2e" stroke-width="0.5"/>
      <rect x="-2.4" y="-1.3" width="3.2" height="2.6" rx="0.4" fill="#f4f6f8" stroke="rgba(18,24,38,0.9)" stroke-width="0.35"/>
      <rect x="0.2" y="-1" width="0.4" height="2" fill="#23344f"/>
      <rect x="-1.5" y="-0.55" width="1.1" height="1.1" rx="0.3" fill="#2d2a2e"/>
      <rect x="-3.7" y="-0.5" width="0.6" height="1" fill="#ffd23f"/>
    </svg>`,
  },
  freighter: {
    name: "Freighter",
    level: 7,
    price: 4500,
    cap: { pax: 0, cargo: 14, fuel: 0 },
    speed: 4.5,
    run: 0.08,
    pips: 1,
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-11.5 -4 23 8">
      <path d="M-10.4 -3.3L5 -3.3Q11 -3.3 11 0Q11 3.3 5 3.3L-10.4 3.3Q-11 3.3 -11 2.7L-11 -2.7Q-11 -3.3 -10.4 -3.3Z" fill="#2f7a45" stroke="rgba(18,24,38,0.9)" stroke-width="0.7" stroke-linejoin="round"/>
      <path d="M-10.2 -2.6L5 -2.6Q9.8 -2.6 9.8 0Q9.8 2.6 5 2.6L-10.2 2.6Z" fill="#5b4232"/>
      <rect x="-10" y="-2.2" width="3.4" height="4.4" rx="0.4" fill="#f4f6f8" stroke="rgba(18,24,38,0.9)" stroke-width="0.35"/>
      <rect x="-7.2" y="-1.8" width="0.4" height="3.6" fill="#23344f"/>
      <rect x="-9.3" y="-0.5" width="1.2" height="1" fill="#2d2a2e"/>
      <g stroke="rgba(18,24,38,0.55)" stroke-width="0.2">
        <rect x="-6" y="-2.2" width="3" height="2.1" fill="#d6453a"/><rect x="-6" y="0.1" width="3" height="2.1" fill="#2a6fd6"/>
        <rect x="-2.8" y="-2.2" width="3" height="2.1" fill="#ffd23f"/><rect x="-2.8" y="0.1" width="3" height="2.1" fill="#d6453a"/>
        <rect x="0.4" y="-2.2" width="3" height="2.1" fill="#2a6fd6"/><rect x="0.4" y="0.1" width="3" height="2.1" fill="#e08a2c"/>
        <rect x="3.6" y="-1.8" width="2.6" height="1.7" fill="#e08a2c"/><rect x="3.6" y="0.1" width="2.6" height="1.7" fill="#ffd23f"/>
      </g>
    </svg>`,
  },
  lakefreighter: {
    name: "Lake Freighter",
    level: 7,
    price: 5500,
    cap: { bulk: 24 },
    speed: 4,
    run: 0.07,
    pips: 1,
    color: "#8b2f2a",
    deckColor: "#4a4f55",
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-15.5 -3.2 31 6.4">
      <path d="M-14.6 -2.6L12 -2.6Q15 -2.6 15 0Q15 2.6 12 2.6L-14.6 2.6Q-15 2.6 -15 2.1L-15 -2.1Q-15 -2.6 -14.6 -2.6Z" fill="#8b2f2a" stroke="rgba(18,24,38,0.9)" stroke-width="0.7" stroke-linejoin="round"/>
      <path d="M-14.2 -1.9L12 -1.9Q14 -1.9 14 0Q14 1.9 12 1.9L-14.2 1.9Z" fill="#4a4f55"/>
      <rect x="-9.6" y="-1.3" width="1.3" height="2.6" fill="#8c939b"/><rect x="-7.55" y="-1.3" width="1.3" height="2.6" fill="#8c939b"/><rect x="-5.5" y="-1.3" width="1.3" height="2.6" fill="#8c939b"/><rect x="-3.45" y="-1.3" width="1.3" height="2.6" fill="#8c939b"/><rect x="-1.4" y="-1.3" width="1.3" height="2.6" fill="#8c939b"/><rect x="0.65" y="-1.3" width="1.3" height="2.6" fill="#8c939b"/><rect x="2.7" y="-1.3" width="1.3" height="2.6" fill="#8c939b"/><rect x="4.75" y="-1.3" width="1.3" height="2.6" fill="#8c939b"/><rect x="6.8" y="-1.3" width="1.3" height="2.6" fill="#8c939b"/>
      <rect x="-10.4" y="-0.25" width="19.6" height="0.5" fill="#d9a92c"/>
      <rect x="-14.4" y="-1.7" width="3.6" height="3.4" rx="0.4" fill="#f4f6f8" stroke="rgba(18,24,38,0.9)" stroke-width="0.35"/>
      <rect x="-13.6" y="-0.6" width="1.4" height="1.2" rx="0.3" fill="#2d2a2e"/>
      <rect x="9.8" y="-1.7" width="2.6" height="3.4" rx="0.4" fill="#f4f6f8" stroke="rgba(18,24,38,0.9)" stroke-width="0.35"/>
      <rect x="11.8" y="-1.3" width="0.4" height="2.6" fill="#23344f"/>
    </svg>`,
  },
  oiler: {
    name: "Oil Tanker",
    level: 8,
    price: 6000,
    cap: { pax: 0, cargo: 2, fuel: 10 },
    speed: 4.5,
    run: 0.09,
    pips: 1,
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-11.5 -4 23 8">
      <path d="M-10.4 -3.3L5 -3.3Q11 -3.3 11 0Q11 3.3 5 3.3L-10.4 3.3Q-11 3.3 -11 2.7L-11 -2.7Q-11 -3.3 -10.4 -3.3Z" fill="#2d2a2e" stroke="rgba(18,24,38,0.9)" stroke-width="0.7" stroke-linejoin="round"/>
      <path d="M-10.2 -2.6L5 -2.6Q9.8 -2.6 9.8 0Q9.8 2.6 5 2.6L-10.2 2.6Z" fill="#a7b0ba"/>
      <path d="M-10.2 -2.6L5 -2.6Q9.8 -2.6 9.8 0L8.8 0Q8.8 -1.9 5 -1.9L-10.2 -1.9Z" fill="#d6453a"/>
      <rect x="-10" y="-2.2" width="3.4" height="4.4" rx="0.4" fill="#f4f6f8" stroke="rgba(18,24,38,0.9)" stroke-width="0.35"/>
      <rect x="-7.2" y="-1.8" width="0.4" height="3.6" fill="#23344f"/>
      <rect x="-9.3" y="-0.5" width="1.2" height="1" fill="#d6453a"/>
      <rect x="-6" y="-0.3" width="13" height="0.6" fill="#6d7680"/>
      <g fill="#d6dbe0" stroke="#6d7680" stroke-width="0.3">
        <circle cx="-4.4" cy="0" r="1.1"/><circle cx="-1.6" cy="0" r="1.1"/><circle cx="1.2" cy="0" r="1.1"/><circle cx="4" cy="0" r="1.1"/>
      </g>
    </svg>`,
  },
  containership: {
    name: "Container Ship",
    level: 10,
    price: 20000,
    cap: { cargo: 36 },
    speed: 5,
    run: 0.2,
    pips: 2,
    color: "#23344f",
    deckColor: "#5b6470",
    harbor: true,
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-17 -4.2 34 8.4">
      <path d="M-15.8 -3.6L10 -3.6Q16.5 -3.6 16.5 0Q16.5 3.6 10 3.6L-15.8 3.6Q-16.5 3.6 -16.5 2.9L-16.5 -2.9Q-16.5 -3.6 -15.8 -3.6Z" fill="#23344f" stroke="rgba(18,24,38,0.9)" stroke-width="0.7" stroke-linejoin="round"/>
      <path d="M-15.6 -2.9L10 -2.9Q15.3 -2.9 15.3 0Q15.3 2.9 10 2.9L-15.6 2.9Z" fill="#5b6470"/>
      <g stroke="rgba(18,24,38,0.5)" stroke-width="0.15"><rect x="-10.4" y="-2.5" width="2.1" height="1.55" fill="#d6453a"/><rect x="-10.4" y="-0.8" width="2.1" height="1.55" fill="#f2c14e"/><rect x="-10.4" y="0.9" width="2.1" height="1.55" fill="#e08a2c"/><rect x="-8.1" y="-2.5" width="2.1" height="1.55" fill="#2f9a5a"/><rect x="-8.1" y="-0.8" width="2.1" height="1.55" fill="#7b4fc9"/><rect x="-8.1" y="0.9" width="2.1" height="1.55" fill="#2a6fd6"/><rect x="-5.8" y="-2.5" width="2.1" height="1.55" fill="#d6453a"/><rect x="-5.8" y="-0.8" width="2.1" height="1.55" fill="#f2c14e"/><rect x="-5.8" y="0.9" width="2.1" height="1.55" fill="#e08a2c"/><rect x="-3.5" y="-2.5" width="2.1" height="1.55" fill="#2f9a5a"/><rect x="-3.5" y="-0.8" width="2.1" height="1.55" fill="#7b4fc9"/><rect x="-3.5" y="0.9" width="2.1" height="1.55" fill="#2a6fd6"/><rect x="-1.2" y="-2.5" width="2.1" height="1.55" fill="#d6453a"/><rect x="-1.2" y="-0.8" width="2.1" height="1.55" fill="#f2c14e"/><rect x="-1.2" y="0.9" width="2.1" height="1.55" fill="#e08a2c"/><rect x="1.1" y="-2.5" width="2.1" height="1.55" fill="#2f9a5a"/><rect x="1.1" y="-0.8" width="2.1" height="1.55" fill="#7b4fc9"/><rect x="1.1" y="0.9" width="2.1" height="1.55" fill="#2a6fd6"/><rect x="3.4" y="-2.5" width="2.1" height="1.55" fill="#d6453a"/><rect x="3.4" y="-0.8" width="2.1" height="1.55" fill="#f2c14e"/><rect x="3.4" y="0.9" width="2.1" height="1.55" fill="#e08a2c"/><rect x="5.7" y="-2.5" width="2.1" height="1.55" fill="#2f9a5a"/><rect x="5.7" y="-0.8" width="2.1" height="1.55" fill="#7b4fc9"/><rect x="5.7" y="0.9" width="2.1" height="1.55" fill="#2a6fd6"/><rect x="8" y="-2.5" width="2.1" height="1.55" fill="#d6453a"/><rect x="8" y="-0.8" width="2.1" height="1.55" fill="#f2c14e"/><rect x="8" y="0.9" width="2.1" height="1.55" fill="#e08a2c"/></g>
      <rect x="-15.4" y="-2.5" width="3.8" height="5" rx="0.4" fill="#f4f6f8" stroke="rgba(18,24,38,0.9)" stroke-width="0.35"/>
      <rect x="-12.2" y="-2.1" width="0.45" height="4.2" fill="#23344f"/>
      <rect x="-14.6" y="-0.6" width="1.4" height="1.2" rx="0.3" fill="#d6453a"/>
    </svg>`,
  },
  carrier: {
    name: "Aircraft Carrier",
    short: "Carrier",
    level: 10,
    price: 25000,
    cap: {},
    deck: 8,
    deckFor: "plane",
    speed: 2,
    run: 0.6, // a floating airfield burns through fuel
    pips: 2,
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-18 -5 36 10">
      <path d="M-16.4 -3.4H8L16.8 -0.6Q17.4 0 16.8 0.6L8 3.4H-16.4Q-17 3.4 -17 2.8V-2.8Q-17 -3.4 -16.4 -3.4Z" fill="#6f7682" stroke="rgba(18,24,38,0.9)" stroke-width="0.7" stroke-linejoin="round"/>
      <path d="M-16.4 -2.8H7.6L15.6 -0.4V0.4L7.6 2.8H-16.4Z" fill="#4a4f57"/>
      <path d="M-16 1.6L6 -2.4" stroke="#f4f6f8" stroke-width="0.25" stroke-dasharray="1 0.8"/>
      <path d="M-16 -0.1H14.8" stroke="#ffd23f" stroke-width="0.25" stroke-dasharray="1.2 0.8"/>
      <g fill="none" stroke="#f4f6f8" stroke-width="0.25"><circle cx="10" cy="-0.1" r="1.1"/><circle cx="-11" cy="-1.5" r="1"/></g>
      <rect x="-3" y="2.2" width="4.6" height="2.4" rx="0.4" fill="#8a949e" stroke="rgba(18,24,38,0.9)" stroke-width="0.4"/>
      <rect x="-1.9" y="2.6" width="2.4" height="1.4" rx="0.3" fill="#5b6470"/>
      <rect x="-0.9" y="2.9" width="0.6" height="0.8" fill="#9fd0ff"/>
    </svg>`,
  },
  liner: {
    name: "Ocean Liner",
    level: 10,
    price: 15000,
    cap: { pax: 24, cargo: 8, fuel: 0 },
    speed: 7,
    run: 0.14,
    pips: 3,
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-14.5 -4.5 29 9">
      <path d="M-13.2 -3.8L7 -3.8Q14 -3.8 14 0Q14 3.8 7 3.8L-13.2 3.8Q-14 3.8 -14 3L-14 -3Q-14 -3.8 -13.2 -3.8Z" fill="#23344f" stroke="rgba(18,24,38,0.9)" stroke-width="0.7" stroke-linejoin="round"/>
      <path d="M-13 -3.1L7 -3.1Q12.8 -3.1 12.8 0Q12.8 3.1 7 3.1L-13 3.1Z" fill="#f4f6f8"/>
      <rect x="-11.5" y="-2.5" width="19" height="5" rx="1.2" fill="#dfe4ea" stroke="rgba(18,24,38,0.5)" stroke-width="0.3"/>
      <rect x="-10" y="-1.8" width="15.5" height="3.6" rx="0.8" fill="#f4f6f8"/>
      <rect x="-12.4" y="-1.1" width="2" height="2.2" rx="0.5" fill="#5ab4e6"/>
      <g fill="#ffd86b"><rect x="-9" y="-2.3" width="15" height="0.3"/><rect x="-9" y="2" width="15" height="0.3"/></g>
      <g fill="#d6453a" stroke="rgba(18,24,38,0.9)" stroke-width="0.3"><rect x="-6.6" y="-0.9" width="2.2" height="1.8" rx="0.6"/><rect x="-2.6" y="-0.9" width="2.2" height="1.8" rx="0.6"/><rect x="1.4" y="-0.9" width="2.2" height="1.8" rx="0.6"/></g>
      <g fill="#2d2a2e"><rect x="-6.1" y="-0.45" width="1.2" height="0.9" rx="0.3"/><rect x="-2.1" y="-0.45" width="1.2" height="0.9" rx="0.3"/><rect x="1.9" y="-0.45" width="1.2" height="0.9" rx="0.3"/></g>
      <rect x="5.2" y="-1.4" width="0.6" height="2.8" fill="#23344f"/>
    </svg>`,
  },
  megatanker: {
    name: "Mega Tanker",
    short: "Mega Tanker",
    level: 11,
    price: 20000,
    cap: { fuel: 24 },
    harbor: true,
    speed: 4,
    run: 0.25,
    pips: 1,
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-16 -4.5 32 9">
      <path d="M-14.8 -3.8L9 -3.8Q15.4 -3.8 15.4 0Q15.4 3.8 9 3.8L-14.8 3.8Q-15.4 3.8 -15.4 3.2L-15.4 -3.2Q-15.4 -3.8 -14.8 -3.8Z" fill="#2d2a2e" stroke="rgba(18,24,38,0.9)" stroke-width="0.7" stroke-linejoin="round"/>
      <path d="M-14.6 -3.1L9 -3.1Q14.2 -3.1 14.2 0Q14.2 3.1 9 3.1L-14.6 3.1Z" fill="#2f5d4e"/>
      <path d="M-14.6 -3.1L9 -3.1Q14.2 -3.1 14.2 0L13.2 0Q13.2 -2.4 9 -2.4L-14.6 -2.4Z" fill="#3f7a66"/>
      <rect x="-14.4" y="-2.4" width="3.6" height="4.8" rx="0.4" fill="#f4f6f8" stroke="rgba(18,24,38,0.9)" stroke-width="0.35"/>
      <rect x="-11.4" y="-2" width="0.4" height="4" fill="#23344f"/>
      <rect x="-13.7" y="-0.55" width="1.3" height="1.1" fill="#2d2a2e"/>
      <rect x="-9.6" y="-0.3" width="21" height="0.6" fill="#6d7680"/>
      <g fill="#d6dbe0" stroke="#6d7680" stroke-width="0.3"><circle cx="-6.6" cy="0" r="1.2"/><circle cx="-3.6" cy="0" r="1.2"/><circle cx="-0.6" cy="0" r="1.2"/><circle cx="2.4" cy="0" r="1.2"/><circle cx="5.4" cy="0" r="1.2"/><circle cx="8.4" cy="0" r="1.2"/></g>
    </svg>`,
  },
  cruise: {
    name: "Super Cruise Ship",
    short: "Cruise Ship",
    level: 12,
    price: 40000,
    cap: { pax: 60, mail: 4 },
    harbor: true,
    speed: 6,
    run: 0.8, // a floating city burns through fuel
    pips: 3,
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-19 -5.5 38 11">
      <path d="M-17.2 -4.6L10 -4.6Q18.6 -4.6 18.6 0Q18.6 4.6 10 4.6L-17.2 4.6Q-18 4.6 -18 3.8L-18 -3.8Q-18 -4.6 -17.2 -4.6Z" fill="#23344f" stroke="rgba(18,24,38,0.9)" stroke-width="0.7" stroke-linejoin="round"/>
      <path d="M-17 -3.9L10 -3.9Q17.4 -3.9 17.4 0Q17.4 3.9 10 3.9L-17 3.9Z" fill="#f4f6f8"/>
      <g fill="#5d8cc6"><rect x="-12.6" y="-2.95" width="1.1" height="0.35"/><rect x="-12.6" y="2.6" width="1.1" height="0.35"/><rect x="-10.8" y="-2.95" width="1.1" height="0.35"/><rect x="-10.8" y="2.6" width="1.1" height="0.35"/><rect x="-9" y="-2.95" width="1.1" height="0.35"/><rect x="-9" y="2.6" width="1.1" height="0.35"/><rect x="-7.2" y="-2.95" width="1.1" height="0.35"/><rect x="-7.2" y="2.6" width="1.1" height="0.35"/><rect x="-5.4" y="-2.95" width="1.1" height="0.35"/><rect x="-5.4" y="2.6" width="1.1" height="0.35"/><rect x="-3.6" y="-2.95" width="1.1" height="0.35"/><rect x="-3.6" y="2.6" width="1.1" height="0.35"/><rect x="-1.8" y="-2.95" width="1.1" height="0.35"/><rect x="-1.8" y="2.6" width="1.1" height="0.35"/><rect x="0" y="-2.95" width="1.1" height="0.35"/><rect x="0" y="2.6" width="1.1" height="0.35"/><rect x="1.8" y="-2.95" width="1.1" height="0.35"/><rect x="1.8" y="2.6" width="1.1" height="0.35"/><rect x="3.6" y="-2.95" width="1.1" height="0.35"/><rect x="3.6" y="2.6" width="1.1" height="0.35"/><rect x="5.4" y="-2.95" width="1.1" height="0.35"/><rect x="5.4" y="2.6" width="1.1" height="0.35"/><rect x="7.2" y="-2.95" width="1.1" height="0.35"/><rect x="7.2" y="2.6" width="1.1" height="0.35"/></g>
      <rect x="-14.6" y="-2.2" width="25" height="4.4" rx="1" fill="#dfe4ea" stroke="rgba(18,24,38,0.4)" stroke-width="0.3"/>
      <g fill="#f08a3c" stroke="rgba(18,24,38,0.6)" stroke-width="0.2"><rect x="-11" y="-3.85" width="1.6" height="0.7" rx="0.3"/><rect x="-6" y="-3.85" width="1.6" height="0.7" rx="0.3"/><rect x="-1" y="-3.85" width="1.6" height="0.7" rx="0.3"/><rect x="4" y="-3.85" width="1.6" height="0.7" rx="0.3"/><rect x="-11" y="3.15" width="1.6" height="0.7" rx="0.3"/><rect x="-6" y="3.15" width="1.6" height="0.7" rx="0.3"/><rect x="-1" y="3.15" width="1.6" height="0.7" rx="0.3"/><rect x="4" y="3.15" width="1.6" height="0.7" rx="0.3"/></g>
      <rect x="-12" y="-1.3" width="4.6" height="2.6" rx="0.8" fill="#5ab4e6" stroke="#f4f6f8" stroke-width="0.4"/>
      <rect x="-5.6" y="-1.3" width="3" height="2.6" rx="0.6" fill="#5ab4e6" stroke="#f4f6f8" stroke-width="0.4"/>
      <rect x="-1.4" y="-1.5" width="8.4" height="3" rx="0.6" fill="#2f9a5a"/>
      <g fill="#3fb36b"><circle cx="0.4" cy="-0.3" r="0.6"/><circle cx="2.6" cy="0.4" r="0.7"/><circle cx="5" cy="-0.4" r="0.6"/></g>
      <g fill="#d6453a" stroke="rgba(18,24,38,0.9)" stroke-width="0.3"><rect x="-17" y="-1.2" width="2.2" height="2.4" rx="0.7"/></g>
      <rect x="-16.6" y="-0.6" width="1.4" height="1.2" rx="0.4" fill="#2d2a2e"/>
      <rect x="9.4" y="-2" width="0.6" height="4" fill="#23344f"/>
      <rect x="10.6" y="-1.4" width="2.6" height="2.8" rx="0.6" fill="#f4f6f8" stroke="rgba(18,24,38,0.4)" stroke-width="0.3"/>
    </svg>`,
  },
};

// barges for the tugboat in BOATS; same fields as CARS
export const BARGES = {
  deck: {
    name: "Deck barge",
    short: "Deck",
    level: 6,
    price: 300,
    holds: "cargo",
    cap: 6,
    color: "#8b5a33",
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -2.4 10 4.8">
      <rect x="-4.6" y="-2" width="9.2" height="4" rx="0.6" fill="#4a4f55" stroke="rgba(18,24,38,0.9)" stroke-width="0.6"/>
      <g fill="#8b5a33" stroke="rgba(18,24,38,0.7)" stroke-width="0.25"><rect x="-3.8" y="-1.4" width="2.2" height="1.3"/><rect x="-1.2" y="-1.4" width="2.2" height="1.3"/><rect x="-3.8" y="0.1" width="2.2" height="1.3"/><rect x="1.4" y="0.1" width="2.4" height="1.3" fill="#2a6fd6"/></g>
    </svg>`,
  },
  hopper: {
    name: "Hopper barge",
    short: "Hopper",
    level: 6,
    price: 300,
    holds: "bulk",
    cap: 8,
    color: "#5a4a3c",
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -2.4 10 4.8">
      <rect x="-4.6" y="-2" width="9.2" height="4" rx="0.6" fill="#5a6b3a" stroke="rgba(18,24,38,0.9)" stroke-width="0.6"/>
      <rect x="-4" y="-1.4" width="8" height="2.8" rx="0.3" fill="#2a2420"/>
      <g fill="#7a5a3a"><ellipse cx="-2" cy="0" rx="1.7" ry="1.1"/><ellipse cx="1.8" cy="0" rx="1.7" ry="1.1"/></g>
      <g fill="#9a7650"><ellipse cx="-2.2" cy="-0.3" rx="0.8" ry="0.5"/><ellipse cx="1.6" cy="-0.3" rx="0.8" ry="0.5"/></g>
    </svg>`,
  },
  tank: {
    name: "Tank barge",
    short: "Tank",
    level: 6,
    price: 400,
    holds: "fuel",
    cap: 6,
    color: "#a7b0ba",
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -2.4 10 4.8">
      <rect x="-4.6" y="-2" width="9.2" height="4" rx="0.6" fill="#8b2f2a" stroke="rgba(18,24,38,0.9)" stroke-width="0.6"/>
      <rect x="-4" y="-1.4" width="8" height="2.8" rx="0.3" fill="#4a4f55"/>
      <g fill="#c9ced4" stroke="rgba(18,24,38,0.7)" stroke-width="0.25"><circle cx="-2.2" cy="0" r="1.1"/><circle cx="0.4" cy="0" r="1.1"/><circle cx="2.9" cy="0" r="0.9"/></g>
      <rect x="-3.6" y="-0.1" width="7" height="0.2" fill="#6d7680"/>
    </svg>`,
  },
};

// Trucks and buses drive the roads between mainland towns. cap is a fixed load (missing types are 0);
// a tractor with maxCars pulls that many TRAILERS instead, like an engine pulls cars.
// run is coins per world unit, plus 0.03 for each trailer. deck is how many spaces it takes
// on a car ferry, plus each trailer's; noFerry: true means it's too long to board one.
// pulls: [trailer, ...] limits a tractor to those TRAILERS. beacons: [[x, y], ...] amber lights,
// in the art's sub pixel units, that flash on the map while it drives (beaconColors: ["r,g,b", ...]
// colors them instead). escort: "pilot", "police", "pusher" or "bucket" means it carries nothing,
// but rides along in a superload's convoy (see SUPERLOAD in data.js).
export const TRUCKS = {
  pickup: {
    name: "Pickup",
    level: 1,
    price: 300,
    cap: { cargo: 2 },
    maxCars: 0,
    speed: 6,
    run: 0.03,
    deck: 1,
    pips: 2,
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-3.2 -1.8 6.4 3.6">
      <path d="M-2.4 -1.4H2A0.8 0.8 0 0 1 2.8 -0.6V0.6A0.8 0.8 0 0 1 2 1.4H-2.4A0.4 0.4 0 0 1 -2.8 1V-1A0.4 0.4 0 0 1 -2.4 -1.4Z" fill="#d6453a" stroke="rgba(18,24,38,0.9)" stroke-width="0.6" stroke-linejoin="round"/>
      <rect x="-2.4" y="-1" width="2.3" height="2" fill="#7e2c25"/>
      <rect x="-1.9" y="-0.7" width="1.3" height="1.4" fill="#8b5a33"/>
      <rect x="-1.9" y="-0.1" width="1.3" height="0.2" fill="#5c3a1f"/>
      <rect x="0.1" y="-1.1" width="0.5" height="2.2" fill="#9fd0ff"/>
      <rect x="0.6" y="-1.1" width="1.1" height="2.2" fill="#e2735c"/>
      <rect x="1.7" y="-1.1" width="0.5" height="2.2" fill="#9fd0ff"/>
      <g fill="#fff3a8"><rect x="2.4" y="-1" width="0.4" height="0.5"/><rect x="2.4" y="0.5" width="0.4" height="0.5"/></g>
    </svg>`,
  },
  boxtruck: {
    name: "Small Box Truck",
    short: "Small Box",
    level: 1,
    price: 700,
    cap: { cargo: 4 },
    maxCars: 0,
    speed: 5.5,
    run: 0.05,
    deck: 1,
    pips: 2,
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-3.8 -1.9 7.6 3.8">
      <path d="M1 -1.3H2.6A0.8 0.8 0 0 1 3.4 -0.5V0.5A0.8 0.8 0 0 1 2.6 1.3H1Z" fill="#2a6fd6" stroke="rgba(18,24,38,0.9)" stroke-width="0.6" stroke-linejoin="round"/>
      <rect x="2.3" y="-1" width="0.5" height="2" fill="#9fd0ff"/>
      <g fill="#fff3a8"><rect x="3" y="-0.9" width="0.4" height="0.4"/><rect x="3" y="0.5" width="0.4" height="0.4"/></g>
      <rect x="-3.4" y="-1.5" width="4.6" height="3" rx="0.3" fill="#f1ead8" stroke="rgba(18,24,38,0.9)" stroke-width="0.6"/>
      <rect x="-3.1" y="-0.25" width="4" height="0.5" fill="#2a6fd6"/>
      <g fill="#d8cfb8"><rect x="-2.2" y="-1.2" width="0.25" height="2.4"/><rect x="-0.9" y="-1.2" width="0.25" height="2.4"/></g>
    </svg>`,
  },
  smallbus: {
    name: "Small Bus",
    level: 1,
    price: 500,
    cap: { pax: 4 },
    maxCars: 0,
    speed: 6,
    run: 0.04,
    deck: 1,
    pips: 2,
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-3.6 -1.9 7.2 3.8">
      <rect x="-3.2" y="-1.5" width="6.4" height="3" rx="0.7" fill="#2f9a5a" stroke="rgba(18,24,38,0.9)" stroke-width="0.6"/>
      <rect x="-2.8" y="-1.1" width="5.2" height="2.2" rx="0.4" fill="#f4f6f8"/>
      <g fill="#9fd0ff"><rect x="-2.6" y="-1.5" width="4.6" height="0.35"/><rect x="-2.6" y="1.15" width="4.6" height="0.35"/></g>
      <rect x="2.4" y="-1.1" width="0.5" height="2.2" fill="#9fd0ff"/>
      <rect x="-1.6" y="-0.5" width="1.4" height="1" rx="0.2" fill="#c9ced4"/>
      <g fill="#fff3a8"><rect x="2.9" y="-1.1" width="0.3" height="0.45"/><rect x="2.9" y="0.65" width="0.3" height="0.45"/></g>
    </svg>`,
  },
  mailvan: {
    name: "Mail Van",
    level: 2,
    price: 450,
    cap: { mail: 4 },
    maxCars: 0,
    speed: 6.5,
    run: 0.04,
    deck: 1,
    pips: 2,
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-3.6 -1.8 7.2 3.6">
      <rect x="-3.2" y="-1.4" width="6.2" height="2.8" rx="0.6" fill="#f4f6f8" stroke="rgba(18,24,38,0.9)" stroke-width="0.6"/>
      <rect x="1.6" y="-1.1" width="0.6" height="2.2" fill="#9fd0ff"/>
      <rect x="-2.9" y="-0.4" width="4.2" height="0.8" fill="#2a6fd6"/>
      <rect x="-2.9" y="-0.12" width="4.2" height="0.24" fill="#d6453a"/>
      <g fill="#fff3a8"><rect x="2.7" y="-1" width="0.3" height="0.4"/><rect x="2.7" y="0.6" width="0.3" height="0.4"/></g>
    </svg>`,
  },
  bigbox: {
    name: "Large Box Truck",
    short: "Large Box",
    level: 3,
    price: 1100,
    cap: { cargo: 4 },
    maxCars: 0,
    speed: 5,
    run: 0.08,
    deck: 2,
    pips: 2,
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4.8 -2 9.6 4">
      <path d="M2 -1.4H3.6A0.8 0.8 0 0 1 4.4 -0.6V0.6A0.8 0.8 0 0 1 3.6 1.4H2Z" fill="#e08a2c" stroke="rgba(18,24,38,0.9)" stroke-width="0.6" stroke-linejoin="round"/>
      <rect x="3.2" y="-1.1" width="0.5" height="2.2" fill="#9fd0ff"/>
      <g fill="#fff3a8"><rect x="4" y="-1" width="0.4" height="0.4"/><rect x="4" y="0.6" width="0.4" height="0.4"/></g>
      <rect x="-4.4" y="-1.6" width="6.6" height="3.2" rx="0.3" fill="#f4f6f8" stroke="rgba(18,24,38,0.9)" stroke-width="0.6"/>
      <rect x="-4.1" y="-0.3" width="6" height="0.6" fill="#e08a2c"/>
      <g fill="#c9ced4"><rect x="-3" y="-1.3" width="0.25" height="2.6"/><rect x="-1.5" y="-1.3" width="0.25" height="2.6"/><rect x="0" y="-1.3" width="0.25" height="2.6"/></g>
    </svg>`,
  },
  fueltruck: {
    name: "Fuel Truck",
    short: "Fuel Truck",
    level: 6,
    price: 900,
    cap: { fuel: 2 },
    maxCars: 0,
    speed: 5.5,
    run: 0.06,
    deck: 2,
    pips: 2,
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4.4 -1.9 8.8 3.8">
      <path d="M1.6 -1.3H3.2A0.8 0.8 0 0 1 4 -0.5V0.5A0.8 0.8 0 0 1 3.2 1.3H1.6Z" fill="#7b4fc9" stroke="rgba(18,24,38,0.9)" stroke-width="0.6" stroke-linejoin="round"/>
      <rect x="2.9" y="-1" width="0.5" height="2" fill="#9fd0ff"/>
      <g fill="#fff3a8"><rect x="3.6" y="-0.9" width="0.4" height="0.4"/><rect x="3.6" y="0.5" width="0.4" height="0.4"/></g>
      <rect x="-4" y="-1.5" width="5.5" height="3" rx="1.4" fill="#c9ced4" stroke="rgba(18,24,38,0.9)" stroke-width="0.6"/>
      <rect x="-3.5" y="-1.05" width="4.5" height="0.45" rx="0.22" fill="#eef1f4"/>
      <rect x="-3.5" y="-0.12" width="4.5" height="0.24" fill="#7b4fc9"/>
      <circle cx="-1.25" cy="0" r="0.4" fill="#6d7680"/>
    </svg>`,
  },
  pilot: {
    name: "Pilot Car",
    short: "Pilot",
    level: 9,
    price: 600,
    cap: {},
    escort: "pilot",
    maxCars: 0,
    beacons: [[-0.2, -0.7], [-0.2, 0.7]],
    speed: 8,
    run: 0.03,
    deck: 1,
    pips: 3,
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2.8 -1.6 5.6 3.2">
      <path d="M-2 -1.2H1.7A0.7 0.7 0 0 1 2.4 -0.5V0.5A0.7 0.7 0 0 1 1.7 1.2H-2A0.4 0.4 0 0 1 -2.4 0.8V-0.8A0.4 0.4 0 0 1 -2 -1.2Z" fill="#f4f6f8" stroke="rgba(18,24,38,0.9)" stroke-width="0.5" stroke-linejoin="round"/>
      <rect x="-2.1" y="-0.85" width="1.5" height="1.7" fill="#f2c14e"/>
      <rect x="-1.95" y="-0.15" width="1.2" height="0.3" fill="#2a2310"/>
      <rect x="-0.45" y="-0.95" width="0.5" height="1.9" fill="#e08a2c"/>
      <rect x="0.3" y="-0.95" width="0.5" height="1.9" fill="#9fd0ff"/>
      <g fill="#fff3a8"><rect x="2.05" y="-0.95" width="0.35" height="0.4"/><rect x="2.05" y="0.55" width="0.35" height="0.4"/></g>
    </svg>`,
  },
  police: {
    name: "Police Car",
    short: "Police",
    level: 10,
    price: 1500,
    cap: {},
    escort: "police",
    maxCars: 0,
    beacons: [[-0.2, -0.6], [-0.2, 0.6]],
    beaconColors: ["255,50,40", "60,120,255"],
    speed: 9,
    run: 0.04,
    deck: 1,
    pips: 4,
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2.8 -1.6 5.6 3.2">
      <path d="M-2 -1.2H1.7A0.7 0.7 0 0 1 2.4 -0.5V0.5A0.7 0.7 0 0 1 1.7 1.2H-2A0.4 0.4 0 0 1 -2.4 0.8V-0.8A0.4 0.4 0 0 1 -2 -1.2Z" fill="#23283a" stroke="rgba(18,24,38,0.9)" stroke-width="0.5" stroke-linejoin="round"/>
      <rect x="-1.5" y="-1.2" width="2.6" height="2.4" fill="#f4f6f8"/>
      <rect x="-1.2" y="-0.85" width="1.6" height="1.7" rx="0.2" fill="#f4f6f8" stroke="#c9ced4" stroke-width="0.12"/>
      <rect x="-0.4" y="-0.85" width="0.4" height="0.85" fill="#d6453a"/><rect x="-0.4" y="0" width="0.4" height="0.85" fill="#2a6fd6"/>
      <rect x="0.6" y="-0.95" width="0.5" height="1.9" fill="#9fd0ff"/>
      <rect x="-2.2" y="-0.9" width="0.45" height="1.8" fill="#9fd0ff"/>
      <g fill="#fff3a8"><rect x="2.05" y="-0.95" width="0.35" height="0.4"/><rect x="2.05" y="0.55" width="0.35" height="0.4"/></g>
    </svg>`,
  },
  pusher: {
    name: "Push Truck",
    short: "Pusher",
    level: 10,
    price: 3000,
    cap: {},
    escort: "pusher",
    maxCars: 0,
    beacons: [[0.3, -1.3], [0.3, 1.3]],
    speed: 6,
    run: 0.08,
    deck: 2,
    pips: 2,
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-3 -2 6 4">
      <rect x="-2.8" y="-1.3" width="3.2" height="2.6" rx="0.3" fill="#3a3f47" stroke="rgba(18,24,38,0.9)" stroke-width="0.5"/>
      <g fill="#f2c14e"><rect x="-2.6" y="-1.1" width="0.5" height="2.2"/><rect x="-1.8" y="-1.1" width="0.5" height="2.2"/></g>
      <rect x="-1" y="-0.7" width="1.2" height="1.4" fill="#6f7682"/>
      <path d="M0.2 -1.6H1.9A0.8 0.8 0 0 1 2.7 -0.8V0.8A0.8 0.8 0 0 1 1.9 1.6H0.2Z" fill="#e08a2c" stroke="rgba(18,24,38,0.9)" stroke-width="0.6" stroke-linejoin="round"/>
      <rect x="0.4" y="-1.3" width="0.9" height="2.6" fill="#c96f1e"/>
      <rect x="1.5" y="-1.3" width="0.5" height="2.6" fill="#9fd0ff"/>
      <rect x="2.6" y="-1.7" width="0.35" height="3.4" rx="0.15" fill="#c9ced4" stroke="rgba(18,24,38,0.9)" stroke-width="0.25"/>
    </svg>`,
  },
  bucket: {
    name: "Bucket Truck",
    short: "Bucket",
    level: 11,
    price: 2200,
    cap: {},
    escort: "bucket",
    maxCars: 0,
    beacons: [[1.2, -1.1], [1.2, 1.1]],
    speed: 6.5,
    run: 0.06,
    deck: 2,
    pips: 2,
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-3.6 -1.9 7.2 3.8">
      <path d="M1.2 -1.3H2.7A0.8 0.8 0 0 1 3.5 -0.5V0.5A0.8 0.8 0 0 1 2.7 1.3H1.2Z" fill="#f4f6f8" stroke="rgba(18,24,38,0.9)" stroke-width="0.6" stroke-linejoin="round"/>
      <rect x="2.4" y="-1" width="0.5" height="2" fill="#9fd0ff"/>
      <rect x="-3.2" y="-1.5" width="4.4" height="3" rx="0.3" fill="#f4f6f8" stroke="rgba(18,24,38,0.9)" stroke-width="0.6"/>
      <rect x="-3" y="-1.3" width="1" height="2.6" fill="#c9ced4"/>
      <rect x="-2.6" y="-0.25" width="3.6" height="0.5" rx="0.2" fill="#f2c14e" stroke="rgba(18,24,38,0.9)" stroke-width="0.25"/>
      <rect x="-3.3" y="-0.65" width="1.1" height="1.3" rx="0.2" fill="#e08a2c" stroke="rgba(18,24,38,0.9)" stroke-width="0.3"/>
      <circle cx="0.6" cy="0" r="0.45" fill="#6f7682"/>
      <g fill="#fff3a8"><rect x="3.1" y="-0.9" width="0.4" height="0.4"/><rect x="3.1" y="0.5" width="0.4" height="0.4"/></g>
    </svg>`,
  },
  largebus: {
    name: "Large Bus",
    level: 4,
    price: 2400,
    cap: { pax: 10 },
    maxCars: 0,
    speed: 6.5,
    run: 0.08,
    deck: 2,
    pips: 3,
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -2 10 4">
      <rect x="-4.6" y="-1.6" width="9.2" height="3.2" rx="0.6" fill="#d6453a" stroke="rgba(18,24,38,0.9)" stroke-width="0.6"/>
      <rect x="-4.2" y="-1.2" width="8" height="2.4" rx="0.4" fill="#f4f6f8"/>
      <g fill="#9fd0ff"><rect x="-4" y="-1.6" width="7.4" height="0.35"/><rect x="-4" y="1.25" width="7.4" height="0.35"/></g>
      <rect x="3.8" y="-1.2" width="0.5" height="2.4" fill="#9fd0ff"/>
      <g fill="#c9ced4"><rect x="-3.4" y="-0.5" width="1.6" height="1" rx="0.2"/><rect x="0.4" y="-0.5" width="1.6" height="1" rx="0.2"/></g>
      <rect x="-4.2" y="-0.1" width="8" height="0.2" fill="#d6453a"/>
      <g fill="#fff3a8"><rect x="4.3" y="-1.2" width="0.3" height="0.45"/><rect x="4.3" y="0.75" width="0.3" height="0.45"/></g>
    </svg>`,
  },
  semi: {
    name: "Semi",
    level: 2,
    price: 1400,
    maxCars: 1,
    speed: 6,
    run: 0.05,
    deck: 1,
    pips: 2,
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2.8 -1.9 5.6 3.8">
      <rect x="-2.6" y="-1.1" width="3.4" height="2.2" rx="0.3" fill="#3a3f47" stroke="rgba(18,24,38,0.9)" stroke-width="0.5"/>
      <circle cx="-1.5" cy="0" r="0.7" fill="#6f7682"/>
      <path d="M0.2 -1.5H1.8A0.8 0.8 0 0 1 2.6 -0.7V0.7A0.8 0.8 0 0 1 1.8 1.5H0.2Z" fill="#c4432f" stroke="rgba(18,24,38,0.9)" stroke-width="0.6" stroke-linejoin="round"/>
      <rect x="0.4" y="-1.2" width="0.9" height="2.4" fill="#e2735c"/>
      <rect x="1.5" y="-1.2" width="0.5" height="2.4" fill="#9fd0ff"/>
      <g fill="#c9ced4"><circle cx="0" cy="-1.5" r="0.3"/><circle cx="0" cy="1.5" r="0.3"/></g>
    </svg>`,
  },
  sleeper: {
    name: "Sleeper Cab",
    short: "Sleeper",
    level: 5,
    price: 3200,
    maxCars: 2,
    speed: 7,
    run: 0.06,
    deck: 2,
    pips: 3,
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-3.9 -1.9 7.8 3.8">
      <rect x="-3.7" y="-1.1" width="2.4" height="2.2" rx="0.3" fill="#3a3f47" stroke="rgba(18,24,38,0.9)" stroke-width="0.5"/>
      <circle cx="-2.6" cy="0" r="0.65" fill="#6f7682"/>
      <path d="M2 -1.1H3.2Q3.6 -1.1 3.6 -0.7V0.7Q3.6 1.1 3.2 1.1H2Z" fill="#2a6fd6" stroke="rgba(18,24,38,0.9)" stroke-width="0.5" stroke-linejoin="round"/>
      <rect x="3.3" y="-0.8" width="0.3" height="1.6" fill="#c9ced4"/>
      <rect x="-1.5" y="-1.5" width="3.6" height="3" rx="0.4" fill="#2a6fd6" stroke="rgba(18,24,38,0.9)" stroke-width="0.6"/>
      <rect x="-1.2" y="-1.2" width="1.8" height="2.4" rx="0.2" fill="#1d4f9c"/>
      <rect x="1.3" y="-1.2" width="0.5" height="2.4" fill="#9fd0ff"/>
      <rect x="0.7" y="-1.2" width="0.5" height="2.4" fill="#5d8fe0"/>
      <g fill="#c9ced4"><rect x="0.8" y="-1.75" width="0.35" height="0.35" rx="0.1"/><rect x="0.8" y="1.4" width="0.35" height="0.35" rx="0.1"/></g>
      <g fill="#fff3a8"><rect x="3.4" y="-1" width="0.25" height="0.35"/><rect x="3.4" y="0.65" width="0.25" height="0.35"/></g>
    </svg>`,
  },
  oversize: {
    name: "Oversize Rig",
    short: "Oversize",
    level: 8,
    price: 6000,
    maxCars: 2,
    pulls: ["lowboy"],
    beacons: [[0.9, -1.25], [0.9, 1.25]],
    speed: 6.5,
    run: 0.07,
    deck: 2,
    pips: 3,
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-3.9 -2 7.8 4">
      <rect x="-3.7" y="-1.2" width="2.6" height="2.4" rx="0.3" fill="#3a3f47" stroke="rgba(18,24,38,0.9)" stroke-width="0.5"/>
      <circle cx="-2.7" cy="0" r="0.6" fill="#6f7682"/><circle cx="-1.6" cy="0" r="0.6" fill="#6f7682"/>
      <path d="M1.9 -1.1H3.1Q3.5 -1.1 3.5 -0.7V0.7Q3.5 1.1 3.1 1.1H1.9Z" fill="#f4f6f8" stroke="rgba(18,24,38,0.9)" stroke-width="0.5" stroke-linejoin="round"/>
      <rect x="3.45" y="-1.4" width="0.35" height="2.8" fill="#f2c14e" stroke="rgba(18,24,38,0.9)" stroke-width="0.2"/>
      <rect x="-1.1" y="-1.6" width="3.1" height="3.2" rx="0.4" fill="#f4f6f8" stroke="rgba(18,24,38,0.9)" stroke-width="0.6"/>
      <rect x="-0.8" y="-1.3" width="1.3" height="2.6" rx="0.2" fill="#dfe4ea"/>
      <rect x="1.2" y="-1.3" width="0.5" height="2.6" fill="#9fd0ff"/>
      <rect x="0.6" y="-1.45" width="0.6" height="2.9" fill="#3a3f47"/>
      <g fill="#e08a2c"><rect x="0.65" y="-1.45" width="0.5" height="0.4" rx="0.1"/><rect x="0.65" y="1.05" width="0.5" height="0.4" rx="0.1"/></g>
      <path d="M-0.8 -1.3L0.5 -0.2V0.2L-0.8 1.3Z" fill="#e08a2c" opacity="0.8"/>
    </svg>`,
  },
  roadtrain: {
    name: "Road Train",
    level: 9,
    price: 5000,
    maxCars: 4,
    speed: 6.5,
    run: 0.08,
    deck: 2,
    noFerry: true,
    pips: 3,
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-3.4 -2 6.8 4">
      <rect x="-3.2" y="-1.2" width="3.8" height="2.4" rx="0.3" fill="#3a3f47" stroke="rgba(18,24,38,0.9)" stroke-width="0.5"/>
      <circle cx="-2" cy="0" r="0.75" fill="#6f7682"/>
      <path d="M0 -1.6H2A0.8 0.8 0 0 1 2.8 -0.8V0.8A0.8 0.8 0 0 1 2 1.6H0Z" fill="#f2c14e" stroke="rgba(18,24,38,0.9)" stroke-width="0.6" stroke-linejoin="round"/>
      <rect x="0.2" y="-1.3" width="1.2" height="2.6" fill="#d9a92c"/>
      <rect x="1.6" y="-1.3" width="0.5" height="2.6" fill="#9fd0ff"/>
      <rect x="2.8" y="-1.6" width="0.45" height="3.2" rx="0.2" fill="#c9ced4" stroke="rgba(18,24,38,0.9)" stroke-width="0.3"/>
      <g fill="#c9ced4"><circle cx="-0.2" cy="-1.6" r="0.3"/><circle cx="-0.2" cy="1.6" r="0.3"/></g>
    </svg>`,
  },
  coach: {
    name: "Coach",
    level: 9,
    price: 6500,
    cap: { pax: 18 },
    maxCars: 0,
    speed: 8,
    run: 0.1,
    deck: 3,
    pips: 4,
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6.2 -2 12.4 4">
      <rect x="-5.8" y="-1.6" width="11.6" height="3.2" rx="0.7" fill="#23344f" stroke="rgba(18,24,38,0.9)" stroke-width="0.6"/>
      <rect x="-5.4" y="-1.2" width="10.4" height="2.4" rx="0.5" fill="#dfe4ea"/>
      <g fill="#5ab4e6"><rect x="-5.2" y="-1.6" width="9.6" height="0.35"/><rect x="-5.2" y="1.25" width="9.6" height="0.35"/></g>
      <rect x="4.9" y="-1.2" width="0.6" height="2.4" fill="#9fd0ff"/>
      <g fill="#c9ced4"><rect x="-4.6" y="-0.5" width="1.4" height="1" rx="0.2"/><rect x="-1.4" y="-0.5" width="1.4" height="1" rx="0.2"/><rect x="1.8" y="-0.5" width="1.4" height="1" rx="0.2"/></g>
      <path d="M-5.4 0.6L-1 -1.2H0.4L-4 0.6Z" fill="#f2c14e"/>
      <g fill="#fff3a8"><rect x="5.5" y="-1.2" width="0.3" height="0.45"/><rect x="5.5" y="0.75" width="0.3" height="0.45"/></g>
    </svg>`,
  },
  esemi: {
    name: "Electric Semi",
    short: "E-Semi",
    level: 10,
    price: 9000,
    maxCars: 3,
    speed: 7,
    run: 0.03,
    deck: 1,
    pips: 4,
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-3.4 -1.9 6.8 3.8">
      <rect x="-3.2" y="-1.05" width="2.8" height="2.1" rx="0.3" fill="#3a3f47" stroke="rgba(18,24,38,0.9)" stroke-width="0.5"/>
      <circle cx="-2.2" cy="0" r="0.65" fill="#6f7682"/>
      <g fill="#23262b"><rect x="-1.9" y="-1.45" width="1.6" height="0.35" rx="0.15"/><rect x="-1.9" y="1.1" width="1.6" height="0.35" rx="0.15"/></g>
      <path d="M-0.8 -1.5H1.4Q3.3 -1.5 3.3 0Q3.3 1.5 1.4 1.5H-0.8Q-1.2 1.5 -1.2 1.1V-1.1Q-1.2 -1.5 -0.8 -1.5Z" fill="#eef1f4" stroke="rgba(18,24,38,0.9)" stroke-width="0.55" stroke-linejoin="round"/>
      <path d="M-1 -0.7H1.2Q1.6 -0.7 1.6 0Q1.6 0.7 1.2 0.7H-1Z" fill="#ffffff"/>
      <path d="M-1 -1.25H0.9V-0.85H-1ZM-1 0.85H0.9V1.25H-1Z" fill="#d3d9e0"/>
      <path d="M1.3 -1.3Q2.75 -1.25 2.9 0Q2.75 1.25 1.3 1.3L1.75 0.85Q2.35 0.75 2.4 0Q2.35 -0.75 1.75 -0.85Z" fill="#23344f"/>
      <path d="M1.7 -1.1Q2.5 -1 2.6 -0.5" fill="none" stroke="#5d7fa8" stroke-width="0.15"/>
      <path d="M3.05 -0.9Q3.3 0 3.05 0.9" fill="none" stroke="#e8f4ff" stroke-width="0.18" stroke-linecap="round"/>
      <g fill="#23262b"><rect x="1.2" y="-1.75" width="0.4" height="0.28" rx="0.1"/><rect x="1.2" y="1.47" width="0.4" height="0.28" rx="0.1"/></g>
    </svg>`,
  },
  hauler: {
    name: "Heavy Hauler",
    short: "Hauler",
    level: 11,
    price: 14000,
    maxCars: 6,
    speed: 6,
    run: 0.12,
    deck: 3,
    noFerry: true,
    pips: 3,
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-3.8 -2.2 7.6 4.4">
      <rect x="-3.6" y="-1.35" width="4.2" height="2.7" rx="0.3" fill="#3a3f47" stroke="rgba(18,24,38,0.9)" stroke-width="0.5"/>
      <circle cx="-2.6" cy="0" r="0.8" fill="#6f7682"/><circle cx="-0.8" cy="0" r="0.8" fill="#6f7682"/>
      <path d="M0 -1.8H2.2A0.8 0.8 0 0 1 3 -1V1A0.8 0.8 0 0 1 2.2 1.8H0Z" fill="#2f9a5a" stroke="rgba(18,24,38,0.9)" stroke-width="0.6" stroke-linejoin="round"/>
      <rect x="0.2" y="-1.5" width="1.3" height="3" fill="#237a47"/>
      <rect x="1.7" y="-1.5" width="0.55" height="3" fill="#9fd0ff"/>
      <rect x="3" y="-1.8" width="0.5" height="3.6" rx="0.2" fill="#c9ced4" stroke="rgba(18,24,38,0.9)" stroke-width="0.3"/>
      <g fill="#f2c14e"><rect x="0.3" y="-1.75" width="0.6" height="0.3"/><rect x="0.3" y="1.45" width="0.6" height="0.3"/></g>
      <g fill="#c9ced4"><circle cx="-0.2" cy="-1.8" r="0.3"/><circle cx="-0.2" cy="1.8" r="0.3"/></g>
    </svg>`,
  },
};

// trailers for tractors in TRUCKS; same fields as CARS, plus the ferry deck space each takes
export const TRAILERS = {
  van: {
    name: "Van trailer",
    short: "Van",
    level: 2,
    price: 200,
    holds: "cargo",
    cap: 4,
    deck: 2,
    color: "#f4f6f8",
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -1.9 8 3.8">
      <rect x="-3.7" y="-1.6" width="7.4" height="3.2" rx="0.3" fill="#f4f6f8" stroke="rgba(18,24,38,0.9)" stroke-width="0.6"/>
      <rect x="-3.4" y="-0.3" width="6.8" height="0.6" fill="#d6453a"/>
      <g fill="#c9ced4"><rect x="-2.2" y="-1.3" width="0.25" height="2.6"/><rect x="-0.6" y="-1.3" width="0.25" height="2.6"/><rect x="1" y="-1.3" width="0.25" height="2.6"/></g>
    </svg>`,
  },
  dump: {
    name: "Dump trailer",
    short: "Dump",
    level: 4,
    price: 200,
    holds: "bulk",
    cap: 3,
    deck: 2,
    color: "#e08a2c",
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -1.9 8 3.8">
      <rect x="-3.7" y="-1.6" width="7.4" height="3.2" rx="0.4" fill="#e08a2c" stroke="rgba(18,24,38,0.9)" stroke-width="0.6"/>
      <rect x="-3.2" y="-1.1" width="6.4" height="2.2" rx="0.3" fill="#5a4a3c"/>
      <g fill="#7a5a3a"><ellipse cx="-1.6" cy="0" rx="1.4" ry="0.9"/><ellipse cx="1.4" cy="0" rx="1.4" ry="0.9"/></g>
      <g fill="#9a7650"><ellipse cx="-1.8" cy="-0.25" rx="0.6" ry="0.4"/><ellipse cx="1.2" cy="-0.25" rx="0.6" ry="0.4"/></g>
    </svg>`,
  },
  tank: {
    name: "Tank trailer",
    short: "Tank",
    level: 6,
    price: 300,
    holds: "fuel",
    cap: 2,
    deck: 2,
    color: "#a7b0ba",
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -1.9 8 3.8">
      <rect x="-3.7" y="-1.6" width="7.4" height="3.2" rx="1.5" fill="#c9ced4" stroke="rgba(18,24,38,0.9)" stroke-width="0.6"/>
      <rect x="-3.2" y="-1.1" width="6.4" height="0.5" rx="0.25" fill="#eef1f4"/>
      <rect x="-3.2" y="-0.12" width="6.4" height="0.24" fill="#6d7680"/>
      <g fill="#6d7680"><circle cx="-1.6" cy="0" r="0.4"/><circle cx="1.6" cy="0" r="0.4"/></g>
    </svg>`,
  },
  lowboy: {
    name: "Lowboy trailer",
    short: "Lowboy",
    level: 8,
    price: 900,
    holds: "wide",
    cap: 1,
    deck: 3,
    color: "#f2c14e",
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4.6 -2.4 9.2 4.8">
      <rect x="-4.2" y="-1.3" width="8.2" height="2.6" rx="0.2" fill="#4a4f57" stroke="rgba(18,24,38,0.9)" stroke-width="0.5"/>
      <rect x="-3.4" y="-2.1" width="5.8" height="4.2" rx="0.4" fill="#e08a2c" stroke="rgba(18,24,38,0.9)" stroke-width="0.5"/>
      <rect x="-3" y="-1.7" width="5" height="3.4" rx="0.3" fill="#f2a34a"/>
      <circle cx="-0.5" cy="0" r="1" fill="#c96f1e"/>
      <g fill="#f2c14e"><rect x="-3.4" y="-2.1" width="0.5" height="0.5"/><rect x="1.9" y="-2.1" width="0.5" height="0.5"/><rect x="-3.4" y="1.6" width="0.5" height="0.5"/><rect x="1.9" y="1.6" width="0.5" height="0.5"/></g>
    </svg>`,
  },
};
