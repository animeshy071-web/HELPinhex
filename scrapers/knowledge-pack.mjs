// HELPINhex — Knowledge Pack builder
// Compiles the verified catalog (tools, models, guides, workflows, terms...)
// PLUS the live scraped feeds (GitHub radar, HN, Product Hunt, DEV.to, prices)
// into one compact RAG corpus: site/public/knowledge.json
// This file is the brain of the HEX chatbot — LLMs speak, this knows.

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = fileURLToPath(new URL('..', import.meta.url)); // repo root
const CONTENT = path.join(ROOT, 'content');
const GENERATED = path.join(CONTENT, 'generated');
const OUT = path.join(ROOT, 'site', 'public', 'knowledge.json');
const FUNCTIONS_OUT = path.join(ROOT, 'functions', 'knowledge.json'); // copy for the Firebase function

const readJson = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null);
const clip = (s, n) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, n);

const docs = [];

// ===== Verified catalog =====
for (const t of readJson(path.join(CONTENT, 'tools.json')) ?? []) {
  docs.push({
    id: t.id, title: t.name, kind: 'tool', url: `/tools/${t.slug}/`,
    extra: clip(`${t.tagline} What it is: ${t.whatItIs} Why it matters: ${t.whyMatters} Pricing: ${t.pricing}`, 620),
    keywords: [...(t.keywords ?? []), t.category],
    when: t.lastVerified, freeTier: t.freeTier,
  });
}

for (const m of readJson(path.join(CONTENT, 'models.json')) ?? []) {
  docs.push({
    id: m.id, title: m.name, kind: 'model', url: `/models/${m.slug}/`,
    extra: clip(`Made by ${m.by}. Best for: ${m.bestFor} Context: ${m.context} Strengths: ${m.strengths.join('; ')} Weaknesses: ${m.weaknesses.join('; ')} Pricing: ${m.pricingNote}`, 620),
    keywords: [m.by, m.family, ...m.modalities],
    when: m.lastVerified, freeTier: m.freeTier,
  });
}

for (const g of readJson(path.join(CONTENT, 'guides.json')) ?? []) {
  docs.push({
    id: g.id, title: g.title, kind: 'guide', url: `/guides/${g.slug}/`,
    extra: clip(`${g.summary} ${Array.isArray(g.body) ? g.body.join(' ') : ''}`, 700),
    when: null,
  });
}

for (const p of readJson(path.join(CONTENT, 'paths.json')) ?? []) {
  docs.push({
    id: p.id, title: p.title, kind: 'path', url: `/paths/${p.slug}/`,
    extra: clip(`Goal: ${p.goal} Duration: ${p.duration}. Steps: ${(p.steps ?? []).map((s) => s.title).join(' → ')}`, 500),
  });
}

for (const w of readJson(path.join(CONTENT, 'workflows.json')) ?? []) {
  docs.push({
    id: w.id, title: w.title, kind: 'workflow', url: `/ask/#${w.id}`,
    extra: clip(`${w.totalCost}, ${w.totalTime}. Steps: ${(w.steps ?? []).map((s, i) => `${i + 1}) ${s.title} with ${s.tool} (${s.cost})`).join(' ')} Mistakes: ${(w.mistakes ?? []).join(' ')}`, 700),
    keywords: w.questionPatterns,
  });
}

for (const t of readJson(path.join(CONTENT, 'terms.json')) ?? []) {
  docs.push({ id: t.id, title: t.word, kind: 'term', url: `/glossary/#${t.id}`, extra: clip(t.plain, 300) });
}

for (const p of readJson(path.join(CONTENT, 'prompts.json')) ?? []) {
  docs.push({ id: `prompt-${p.id}`, title: p.title, kind: 'prompt', url: `/prompts/#${p.id}`, extra: clip(p.use, 250) });
}

for (const c of readJson(path.join(CONTENT, 'collections.json')) ?? []) {
  docs.push({ id: c.id, title: c.title, kind: 'collection', url: `/collections/#${c.id}`, extra: clip(`${c.promise} Cost: ${c.cost}. Tools: ${(c.tools ?? []).map((t) => t.id).join(', ')}`, 400) });
}

// ===== Live scraped feeds (the "continuously fresh" half of the brain) =====
let freshCount = 0;
for (const file of ['fresh-huggingface.json', 'fresh-hackernews.json', 'fresh-producthunt.json', 'fresh-devto.json', 'repos.json']) {
  const feed = readJson(path.join(GENERATED, file));
  if (!feed) continue;
  const items = feed.latest ?? feed.items ?? [];
  for (const [i, f] of items.entries()) {
    if (freshCount >= 100) break;
    docs.push({
      id: `${feed.source}-${i}`,
      title: clip(f.title, 140),
      kind: 'fresh',
      url: f.url,
      extra: clip(`${f.detail} ${f.stats}`, 300),
      when: f.when ?? feed.fetchedAt,
      keywords: [feed.source],
    });
    freshCount++;
  }
}

// Channel repos from Repo Radar (popular alive repos per topic)
const repos = readJson(path.join(GENERATED, 'repos.json'));
if (repos?.channels) {
  for (const ch of repos.channels) {
    for (const r of ch.items ?? []) {
      docs.push({
        id: `repo-${r.title}`, title: clip(r.title, 140), kind: 'repo', url: r.url,
        extra: clip(`${r.detail} ${r.stats} — from channel "${ch.name}"`, 300),
        when: r.when, keywords: ['github', 'repo', 'open source'],
      });
    }
  }
}

// Free model list snapshot (so the bot can name today's free options)
const prices = readJson(path.join(GENERATED, 'prices.json'));
const freeModels = prices ? prices.models.filter((m) => m.free).slice(0, 15).map((m) => m.id) : [];

const pack = {
  builtAt: new Date().toISOString(),
  freeModels,
  count: docs.length,
  docs,
};

mkdirSync(path.dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(pack));
console.log(`[knowledge] ${docs.length} docs (${freshCount} fresh) -> ${path.relative(ROOT, OUT)} (${Math.round(JSON.stringify(pack).length / 1024)} KB)`);

// Copy into functions/ for the Firebase server-side brain (if the folder exists)
if (existsSync(path.join(ROOT, 'functions'))) {
  mkdirSync(FUNCTIONS_OUT ? path.dirname(FUNCTIONS_OUT) : '.', { recursive: true });
  writeFileSync(FUNCTIONS_OUT, JSON.stringify(pack));
  console.log(`[knowledge] copy -> ${path.relative(ROOT, FUNCTIONS_OUT)}`);
}
