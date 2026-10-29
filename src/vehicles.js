// Every vehicle model: its stats plus its art. To add a model, add an entry here.
//
// Art is an SVG drawn top down with the front pointing right (+x), in map sub pixels
// (half a world unit each). The viewBox must be centered on 0,0, and its size is the
// size the vehicle is drawn at. For engines and cars, the viewBox width is also how
// much track the unit takes up, so cars couple up nose to tail. An engine with
// steam puffs smoke from its chimney, `steam` sub pixels ahead of its center.

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
  diesel: {
    name: "Diesel Hauler",
    level: 4,
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
    level: 5,
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
    level: 6,
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
    level: 3,
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
};

// range is in world units; fuel is coins per world unit flown.
// vtol: true means it can land at any city (helicopters, tiltrotors), not just airports.
export const PLANES = {
  sparrow: {
    name: "Sparrow",
    level: 1,
    price: 600,
    pax: 2,
    cargo: 1,
    range: 120,
    speed: 9,
    fuel: 0.3,
    pips: 2,
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
  vista: {
    name: "Vista",
    level: 2,
    price: 2800,
    pax: 3,
    cargo: 1,
    range: 200,
    speed: 14,
    fuel: 0.4,
    pips: 3,
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
    level: 3,
    price: 3500,
    pax: 6,
    cargo: 3,
    range: 180,
    speed: 10,
    fuel: 0.5,
    pips: 3,
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
    level: 3,
    price: 5000,
    pax: 2,
    cargo: 6,
    range: 200,
    speed: 11,
    fuel: 0.6,
    pips: 3,
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
    level: 4,
    price: 8000,
    pax: 6,
    cargo: 1,
    range: 400,
    speed: 17,
    fuel: 0.75,
    pips: 4,
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
    level: 4,
    price: 6500,
    pax: 4,
    cargo: 6,
    range: 120,
    speed: 7,
    fuel: 0.7,
    pips: 2,
    color: "#5b6b3a",
    trim: "#3f4a28",
    vtol: true,
    art: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-13 -8 26 16">
      <path d="M-8.6 -2Q-9.4 -2 -9.4 -1.2L-9.4 1.2Q-9.4 2 -8.6 2L7 2Q9.4 2 9.6 0Q9.4 -2 7 -2Z" fill="#5b6b3a" stroke="rgba(18,24,38,0.9)" stroke-width="1" stroke-linejoin="round"/>
      <rect x="-8.6" y="-1.5" width="15" height="0.5" fill="rgba(255,255,255,0.18)"/>
      <rect x="-8.2" y="-1.2" width="3.8" height="2.4" rx="0.8" fill="#3f4a28" stroke="rgba(18,24,38,0.9)" stroke-width="0.3"/>
      <rect x="-3.4" y="-1.6" width="2.6" height="3.2" rx="0.6" fill="#3f4a28"/>
      <g fill="#2d2a2e"><rect x="-2.9" y="-1.3" width="0.4" height="0.7"/><rect x="-2.1" y="-1.3" width="0.4" height="0.7"/><rect x="-2.9" y="0.6" width="0.4" height="0.7"/><rect x="-2.1" y="0.6" width="0.4" height="0.7"/></g>
      <path d="M6.8 -1.5Q8.8 -1.3 9.1 0Q8.8 1.3 6.8 1.5Z" fill="#23344f"/>
      <rect x="7.2" y="-1.2" width="0.6" height="0.45" fill="rgba(170,215,255,0.85)"/>
      <circle cx="5.6" cy="0" r="6.9" fill="rgba(30,32,38,0.16)" stroke="rgba(30,32,38,0.35)" stroke-width="0.3"/>
      <path d="M5.6 0L11.76 2.24M5.6 0L0.58 4.21M5.6 0L4.46 -6.46" stroke="#2d2a2e" stroke-width="0.55" stroke-linecap="round"/>
      <circle cx="5.6" cy="0" r="0.6" fill="#4a454d"/>
      <circle cx="-6.2" cy="0" r="6.9" fill="rgba(30,32,38,0.16)" stroke="rgba(30,32,38,0.35)" stroke-width="0.3"/>
      <path d="M-6.2 0L-5.06 6.46M-6.2 0L-12.36 -2.24M-6.2 0L-1.18 -4.21" stroke="#2d2a2e" stroke-width="0.55" stroke-linecap="round"/>
      <circle cx="-6.2" cy="0" r="0.6" fill="#4a454d"/>
    </svg>`,
  },
  skyliner: {
    name: "Skyliner",
    level: 5,
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
  heron: {
    name: "Heron",
    level: 6,
    price: 14000,
    pax: 8,
    cargo: 4,
    range: 260,
    speed: 13,
    fuel: 0.9,
    pips: 4,
    color: "#8a949e",
    trim: "#4a525a",
    vtol: true,
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
      <circle cx="0.5" cy="-6.2" r="4.7" fill="rgba(30,32,38,0.16)" stroke="rgba(30,32,38,0.35)" stroke-width="0.3"/>
      <path d="M0.5 -6.2L4.90 -5.42M0.5 -6.2L-2.37 -2.78M0.5 -6.2L-1.03 -10.40" stroke="#2d2a2e" stroke-width="0.55" stroke-linecap="round"/>
      <circle cx="0.5" cy="-6.2" r="0.6" fill="#4a454d"/>
      <circle cx="0.5" cy="6.2" r="4.7" fill="rgba(30,32,38,0.16)" stroke="rgba(30,32,38,0.35)" stroke-width="0.3"/>
      <path d="M0.5 6.2L2.03 10.40M0.5 6.2L-3.90 5.42M0.5 6.2L3.37 2.78" stroke="#2d2a2e" stroke-width="0.55" stroke-linecap="round"/>
      <circle cx="0.5" cy="6.2" r="0.6" fill="#4a454d"/>
    </svg>`,
  },
  jumbo: {
    name: "Jumbo",
    level: 7,
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
  humpback: {
    name: "Humpback",
    level: 8,
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
    level: 9,
    price: 60000,
    pax: 8,
    cargo: 2,
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

// boats are slow but cheap to run; cap is how many of each job type fit on board
export const BOATS = {
  coaster: {
    name: "Coaster",
    level: 1,
    price: 800,
    cap: { pax: 2, cargo: 4, fuel: 0 },
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
    level: 2,
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
  freighter: {
    name: "Freighter",
    level: 3,
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
  oiler: {
    name: "Oil Tanker",
    level: 4,
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
  liner: {
    name: "Ocean Liner",
    level: 6,
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
};
