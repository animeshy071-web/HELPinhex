// HELPINhex freshness engine — OpenRouter price feed
// One public call → live prices + context sizes for hundreds of models.
// This kills hardcoded prices forever: model pages read from here (fetchedAt = honesty).

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const OUT = fileURLToPath(new URL('../content/generated/prices.json', import.meta.url));

async function fetchPrices() {
  const res = await fetch('https://openrouter.ai/api/v1/models', { headers: { 'User-Agent': 'HELPINhex-freshness/1.0' } });
  if (!res.ok) throw new Error(`OpenRouter ${res.status}`);
  const json = await res.json();
  const models = (json.data ?? []).map((m) => {
    const p = m.pricing ?? {};
    const toPerM = (v) => {
      const n = Number(v);
      if (!Number.isFinite(n)) return null;
      const perM = n * 1_000_000;
      return perM < 0.01 && perM > 0 ? Number(perM.toFixed(6)) : Number(perM.toFixed(4));
    };
    const promptPerM = toPerM(p.prompt);
    const completionPerM = toPerM(p.completion);
    return {
      id: m.id,
      name: m.name,
      contextLength: m.context_length ?? null,
      promptPerM,
      completionPerM,
      free: promptPerM === 0 && completionPerM === 0,
    };
  });
  models.sort((a, b) => (b.free - a.free) || a.id.localeCompare(b.id));
  return models;
}

try {
  const models = await fetchPrices();
  mkdirSync(path.dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify({ source: 'openrouter', fetchedAt: new Date().toISOString(), models }, null, 2));
  console.log(`[prices] openrouter: ${models.length} models priced (${models.filter((m) => m.free).length} free)`);
} catch (e) {
  console.error(`[prices] openrouter FAILED: ${e.message} (keeping previous data)`);
}
