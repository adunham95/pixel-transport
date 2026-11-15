// mail changing vans: two mail lines meeting at Ironvale carry a letter from Frostholm to Bayport
export default {
  name: 'Mail transfers',
  about: 'a letter changing vans where two mail lines meet',
  setup: { level: 4, coins: 100000, towns: ['frost', 'iron', 'bay'] },
  run(sim) {
    const { G, game } = sim;
    for (const id of ['frost', 'iron', 'bay']) G.buyLine('post', id);
    const north = G.createLine('post', 'frost');
    G.addRouteStop(north, 'iron');
    const south = G.createLine('post', 'iron');
    G.addRouteStop(south, 'bay');
    sim.expect(north.stops.every((s) => G.stopMode(s) === 'transfer'), 'mail line stops start on transfer');
    // bus lines are left alone
    G.buyLine('bus', 'frost'); G.buyLine('bus', 'iron');
    const bus = G.createLine('bus', 'frost');
    G.addRouteStop(bus, 'iron');
    sim.expect(bus.stops.every((s) => G.stopMode(s) === 'stop'), 'bus line stops start as plain stops');

    G.assignRoute(sim.buy('truck', 'mailvan', 'frost'), north);
    G.assignRoute(sim.buy('truck', 'mailvan', 'iron'), south);
    const letter = sim.job('frost', 'bay', { type: 'mail', pay: 200 });
    const delivered = sim.until(() => !Object.values(game.jobs).some((l) => l.includes(letter)) && !game.vehicles.some((v) => v.cargo.includes(letter)), { max: '1h' });
    sim.expect(delivered, `the letter got to Bayport by way of Ironvale (${sim.elapsed / 60000 | 0} min)`);
    // a job that changes hands is paid once, in full, to whoever finishes it (see dropOff)
    sim.expect(south.stats?.earned > 0 && !north.stats?.earned, `paid once, to the line that delivered it ($${Math.round(south.stats?.earned ?? 0)})`);
  },
};
