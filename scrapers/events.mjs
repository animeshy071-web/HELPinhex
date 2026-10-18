// HELPINhex freshness engine — hackathon/events connector
// Attempts public MLH event feeds. If MLH changes/blocks, we degrade gracefully to []
// and the /events page falls back to its hand-verified portal list. No fake events, ever.

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const OUT = fileURLToPath(new URL('../content/generated/events.json', import.meta.url));

const CANDIDATE_URLS = [
  'https://mlh.io/seasons/2026/events?format=json',
  'https://mlh.io/api/seasons/2026/events',
];

async function tryFetchEvents() {
  for (const url of CANDIDATE_URLS) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'HELPINhex-freshness/1.0', Accept: 'application/json' } });
      if (!res.ok) continue;
      const json = await res.json();
      const raw = Array.isArray(json) ? json : json.data ?? json.events ?? [];
      const items = raw
        .filter((e) => e)
        .map((e) => ({
          title: e.name || e.title || 'Unnamed event',
          url: e.url || e.website || 'https://mlh.io',
          when: e.start_date || e.startDate || e.date || null,
          location: e.location || (e.is_virtual || e.isVirtual ? 'online' : '') || 'see page',
          org: 'MLH',
        }))
        .slice(0, 30);
      if (items.length) return items;
    } catch {
      // try next candidate
    }
  }
  return [];
}

try {
  const items = await tryFetchEvents();
  mkdirSync(path.dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify({ source: 'mlh', fetchedAt: new Date().toISOString(), items }, null, 2));
  console.log(`[events] mlh: ${items.length} events${items.length ? '' : ' (feed unavailable — portal fallback on /events)'}`);
} catch (e) {
  console.error(`[events] FAILED: ${e.message} (keeping previous data)`);
}
