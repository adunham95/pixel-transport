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

    // mail never goes stale, so the letter from before the pause is still waiting
    sim.expect(game.jobs.iron.some((j) => j.type === 'mail' && j.to === 'frost'), 'mail is still waiting after 5 minutes');
    G.setRoutePaused(line, false);
    sim.advance('5m');
    sim.expect(line.stats.laps > laps, 'runs again once resumed');

    // left a long while with nothing to carry it, mail fills only its share of a town's board
    G.setRoutePaused(line, true);
    sim.advance('2h');
    const board = game.jobs.iron.filter((j) => j.from === 'iron');
    const mail = board.filter((j) => j.type === 'mail').length;
    sim.expect(board.length - mail > 0, `other jobs still turn up beside the mail (${mail} mail, ${board.length - mail} others)`);
    sim.expect(mail <= Math.ceil(board.length * 0.75), `mail doesn't take over the board (${mail} of ${board.length})`);
  },
};
