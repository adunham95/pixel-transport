// bus lines: built from bus stops, named by region and color, run by buses with no HQ
export default {
  name: 'Bus lines',
  about: 'stops, names, who can join, and a bus earning on a line',
  setup: { level: 4, coins: 100000, towns: ['frost', 'iron', 'pine', 'bay'] },
  run(sim) {
    const { G, game } = sim;
    sim.expect(!game.repeatRoutes, 'starts with no HQ');
    for (const id of ['frost', 'iron', 'pine']) G.buyLine('bus', id);
    sim.expect(G.lineTowns('bus').length === 3, 'built 3 bus stops');

    const blue = G.createLine('bus', 'iron');
    const red = G.createLine('bus', 'frost');
    G.buyLine('post', 'iron');
    const mail = G.createLine('post', 'iron');
    sim.expect(blue.name === 'Westmark Blue', `first line is Westmark Blue (got ${blue.name})`);
    sim.expect(red.name === 'Westmark Red', `second line in the region takes the next color (got ${red.name})`);
    sim.expect(mail.name.endsWith('Mail'), `mail lines say Mail (got ${mail.name})`);

    G.addRouteStop(blue, 'frost');
    G.addRouteStop(blue, 'bay');
    sim.expect(!blue.stops.some((s) => s.city === 'bay'), 'a town without a bus stop can’t join a line');
    sim.expect(G.linesAt('bus', 'frost').length === 2, 'Frostholm is on both lines');
    sim.expect(G.linesAt('bus', 'pine').length === 0, 'Pinecrest is on none yet');

    const bus = sim.buy('truck', 'smallbus', 'iron');
    const pickup = game.vehicles.find((v) => v.model === 'pickup');
    sim.expect(G.routeProblem(pickup, blue)?.includes('passengers'), 'a pickup can’t run a bus line');
    sim.expect(G.assignRoute(bus, blue), 'a bus joins a line with no HQ');

    // a fare each way, then let it run for a while picking up whatever turns up
    sim.job('iron', 'frost');
    sim.job('frost', 'iron');
    const coins = game.coins;
    sim.advance('20m');
    const st = blue.stats;
    // a two stop line only carries fares headed to its other stop, so it waits a lot
    sim.expect(st?.laps >= 1, `ran laps (${st?.laps ?? 0})`);
    sim.expect(st?.earned > st?.fuel, `earned more than it burned ($${Math.round(st?.earned ?? 0)} vs $${Math.round(st?.fuel ?? 0)} fuel)`);
    sim.expect(game.coins > coins, 'the company made money');
  },
};
