// run simulator scenarios: npm run sim [names...] [--seed 7] [--log] [--report]
//   names     scenario files in sim/scenarios to run (default all), matched by the start of the name
//   --seed N  randomness to use (default 1); the same seed plays out the same way
//   --log     print every toast as it happens
//   --report  print how the company is doing at the end of each scenario
import { readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createSim, closeSims } from './engine.mjs';

const args = process.argv.slice(2);
const flag = (k) => args.includes(`--${k}`);
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const seed = Number(opt('seed', 1));
const names = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--seed');

const dir = fileURLToPath(new URL('./scenarios/', import.meta.url));
const files = readdirSync(dir).filter((f) => f.endsWith('.mjs')).sort()
  .filter((f) => !names.length || names.some((n) => f.startsWith(n)));
if (!files.length) { console.error(`No scenarios match ${names.join(', ')}`); process.exit(1); }

let failed = 0;
for (const f of files) {
  const { default: sc } = await import(pathToFileURL(dir + f).href);
  // long runs (slow: true) only when named
  if (sc.slow && !names.length) { console.log(`\n· skipped ${sc.name ?? f} (slow; run it with npm run sim ${f.replace('.mjs', '')})`); continue; }
  console.log(`\n▶ ${sc.name ?? f}${sc.about ? ` — ${sc.about}` : ''}`);
  const sim = await createSim({ seed, log: flag('log'), ...(sc.setup ?? {}) });
  const t0 = performance.now();
  try {
    await sc.run(sim);
  } catch (e) {
    sim.checks.push({ ok: false, what: `threw: ${e.stack ?? e}` });
  }
  if (flag('report')) sim.print();
  for (const c of sim.checks) console.log(`  ${c.ok ? '✓' : '✗'} ${c.what}`);
  const bad = sim.checks.filter((c) => !c.ok).length;
  if (bad) failed++;
  console.log(`  ${bad ? `FAILED ${bad} of ${sim.checks.length}` : `passed ${sim.checks.length}`} · ${sim.elapsed / 60000 | 0} game min in ${Math.round(performance.now() - t0)}ms`);
}
await closeSims();
console.log(failed ? `\n${failed} of ${files.length} scenarios failed` : `\nAll ${files.length} scenarios passed`);
process.exit(failed ? 1 : 0);
