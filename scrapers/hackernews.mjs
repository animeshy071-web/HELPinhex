// HELPINhex freshness engine — Hacker News connector
// Catches "Show HN" AI launches the day they appear (Algolia API — free, no key).

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const OUT = fileURLToPath(new URL('../content/generated/fresh-hackernews.json', import.meta.url));

async function fetchLaunches() {
  const url = 'https://hn.algolia.com/api/v1/search_by_date?tags=show_hn&hitsPerPage=30';
  const res = await fetch(url, { headers: { 'User-Agent': 'HELPINhex-freshness/1.0' } });
  if (!res.ok) throw new Error(`HN ${res.status}`);
  const json = await res.json();
  const aiRe = /\bai\b|llm|gpt|agent|model|chatbot|diffusion|stable.?diffusion|open.?source/i;
  return (json.hits ?? [])
    .filter((h) => h.title && aiRe.test(h.title))
    .slice(0, 10)
    .map((h) => ({
      kind: 'launch',
      source: 'hackernews',
      title: h.title,
      url: `https://news.ycombinator.com/item?id=${h.objectID}`,
      detail: h.url || 'discussion on Hacker News',
      stats: `▲ ${h.points ?? 0} · 💬 ${h.num_comments ?? 0}`,
      when: h.created_at,
    }));
}

try {
  const items = await fetchLaunches();
  mkdirSync(path.dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify({ source: 'hackernews', fetchedAt: new Date().toISOString(), items }, null, 2));
  console.log(`[fresh] hackernews: ${items.length} AI launches`);
} catch (e) {
  console.error(`[fresh] hackernews FAILED: ${e.message} (keeping previous data)`);
}
