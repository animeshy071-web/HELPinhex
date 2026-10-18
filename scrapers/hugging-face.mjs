// HELPINhex freshness engine — Hugging Face connector
// Catches notable NEW open-weight models (filters test-repo noise with a likes/downloads floor).

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const OUT = fileURLToPath(new URL('../content/generated/fresh-huggingface.json', import.meta.url));

async function fetchNewest() {
  const url = 'https://huggingface.co/api/models?sort=createdAt&direction=-1&limit=200';
  const res = await fetch(url, { headers: { 'User-Agent': 'HELPINhex-freshness/1.0' } });
  if (!res.ok) throw new Error(`HF ${res.status}`);
  const all = await res.json();
  const notable = all
    .filter((m) => (m.likes ?? 0) >= 2 || (m.downloads ?? 0) >= 100)
    .filter((m) => !m.id.toLowerCase().includes('test'))
    .sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0))
    .slice(0, 10)
    .map((m) => ({
      kind: 'model',
      source: 'huggingface',
      title: m.id,
      url: `https://huggingface.co/${m.id}`,
      detail: m.pipeline_tag ? `pipeline: ${m.pipeline_tag}` : 'new open-weight release',
      stats: `⭐ ${m.likes ?? 0} · ⬇ ${m.downloads ?? 0}`,
      when: m.createdAt,
    }));
  return notable;
}

try {
  const items = await fetchNewest();
  mkdirSync(path.dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify({ source: 'huggingface', fetchedAt: new Date().toISOString(), items }, null, 2));
  console.log(`[fresh] huggingface: ${items.length} notable new models`);
} catch (e) {
  console.error(`[fresh] huggingface FAILED: ${e.message} (keeping previous data)`);
}
