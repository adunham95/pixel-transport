// the opening of a fresh game, played by tapping Quick send on every idle vehicle each time it's free.
// A balance check: the starting fleet should make money and levels from day one.
export default {
  name: 'Starter economy',
  about: 'a fresh game played on Quick send for 30 game minutes',
  run(sim) {
    const { G, game } = sim;
    const coins = game.coins, level = game.level;
    sim.expect(game.vehicles.length > 0, `starts with a fleet (${game.vehicles.map((v) => v.model).join(', ')})`);
    // jobs turn up on their own as the clock runs
    sim.advance('1m');
    const waiting = Object.values(game.jobs).reduce((n, l) => n + l.length, 0);
    sim.expect(waiting > 0, `jobs turned up (${waiting} waiting after a minute)`);

    for (let t = 0; t < 30 * 60; t += 15) {
      if (G.idleVehicles().length) G.quickSendAll();
      sim.advance('15s');
    }
    sim.expect(game.coins > coins, `made money: $${coins} → $${Math.round(game.coins)}`);
    sim.expect(game.level > level, `levelled up: ${level} → ${game.level}`);
    // nothing should be stuck: every vehicle with room for cargo earned something (the tow truck only does rescues)
    for (const v of game.vehicles.filter((x) => Object.values(G.capacity(x)).some((n) => n > 0))) sim.expect((v.books?.earned ?? 0) > 0, `${v.name} earned $${Math.round(v.books?.earned ?? 0)}`);
  },
};
