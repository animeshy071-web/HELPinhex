// HELPINhex freshness engine — DEV.to connector
// Top AI articles of the week (public API — free, no key).

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const OUT = fileURLToPath(new URL('../content/generated/fresh-devto.json', import.meta.url));

async function fetchArticles() {
  // top=7 → most-liked articles published in the last 7 days
  const res = await fetch('https://dev.to/api/articles?tag=ai&top=7&per_page=15', {
    headers: { 'User-Agent': 'HELPINhex-freshness/1.0' },
  });
  if (!res.ok) throw new Error(`DEV.to ${res.status}`);
  const json = await res.json();
  return (json ?? [])
    .slice(0, 10)
    .map((a) => ({
      kind: 'article',
      source: 'devto',
      title: a.title,
      url: a.url,
      detail: a.description || 'top AI article of the week on DEV',
      stats: `♥ ${a.positive_reactions_count ?? 0} · 💬 ${a.comments_count ?? 0}`,
      when: a.published_at,
    }));
}

try {
  const items = await fetchArticles();
  mkdirSync(path.dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify({ source: 'devto', fetchedAt: new Date().toISOString(), items }, null, 2));
  console.log(`[fresh] devto: ${items.length} AI articles`);
} catch (e) {
  console.error(`[fresh] devto FAILED: ${e.message} (keeping previous data)`);
}
