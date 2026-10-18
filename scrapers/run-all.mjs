// HELPINhex freshness engine — orchestrator
// Runs every connector; each is isolated (one failing source never kills the others).
// Run manually:  node scrapers/run-all.mjs
// Runs daily via .github/workflows/freshness.yml (GitHub Actions cron — free).

const scrapers = ['./hugging-face.mjs', './github.mjs', './hackernews.mjs', './openrouter.mjs', './events.mjs'];

for (const s of scrapers) {
  try {
    await import(s);
  } catch (e) {
    console.error(`[fresh] could not run ${s}: ${e.message}`);
  }
}
console.log('[fresh] run complete.');
