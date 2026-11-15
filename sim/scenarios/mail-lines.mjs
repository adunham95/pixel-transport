// mail lines: post offices, a mail van running between them, and pausing the line
export default {
  name: 'Mail lines',
  about: 'a mail van on a line, and a paused line parking it',
  setup: { level: 4, coins: 100000, towns: ['frost', 'iron'] },
  run(sim) {
    const { G, game } = sim;
    G.buyLine('post', 'iron');
    G.buyLine('post', 'frost');
    const line = G.createLine('post', 'iron');
    G.addRouteStop(line, 'frost');
    const van = sim.buy('truck', 'mailvan', 'iron');
    const bus = sim.buy('truck', 'smallbus', 'iron');
    sim.expect(G.routeProblem(bus, line)?.includes('mail'), 'a bus can’t run a mail line');
    sim.expect(G.assignRoute(van, line), 'the mail van joins');

    sim.job('iron', 'frost', { type: 'mail', pay: 150 });
    sim.advance('10m');
    sim.expect(line.stats?.laps >= 1, `ran laps (${line.stats?.laps ?? 0})`);

    // paused, it parks once it's done the lap it's on
    G.setRoutePaused(line, true);
    sim.until(() => van.city && !van.trip, { max: '10m' });
    const laps = line.stats.laps;
    sim.job('iron', 'frost', { type: 'mail', pay: 150 });
    sim.advance('5m');
    sim.expect(van.city && !van.trip, `parked while paused (at ${van.city ?? 'on the road'})`);
    sim.expect(line.stats.laps === laps, 'no laps while paused');

    // mail only waits MAIL.ttl, so the letter from before the pause has gone back by now
    G.setRoutePaused(line, false);
    sim.job('iron', 'frost', { type: 'mail', pay: 150 });
    sim.advance('5m');
    sim.expect(line.stats.laps > laps, 'runs again once resumed');
  },
};
