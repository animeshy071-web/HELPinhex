// HELPINhex freshness engine — Product Hunt connector
// Catches brand-new product launches the day they ship (official RSS — free, no key).

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const OUT = fileURLToPath(new URL('../content/generated/fresh-producthunt.json', import.meta.url));

function decodeXml(s = '') {
  return s
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/&#39;|'/g, "'")
    .replace(/&#8217;|&rsquo;/g, "'")
    .replace(/&#821[12];/g, '-')
    .trim();
}

function tag(block, name) {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? decodeXml(m[1]) : '';
}

function firstHref(block) {
  // Atom: <link rel="alternate" type="text/html" href="..."/>
  const m = block.match(/<link[^>]*rel="alternate"[^>]*href="([^"]+)"/i) || block.match(/<link[^>]*href="([^"]+)"/i);
  return m ? decodeXml(m[1]) : 'https://www.producthunt.com';
}

async function fetchLaunches() {
  const res = await fetch('https://www.producthunt.com/feed', {
    headers: { 'User-Agent': 'HELPINhex-freshness/1.0' },
  });
  if (!res.ok) throw new Error(`Product Hunt ${res.status}`);
  const xml = await res.text();
  const items = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/gi)]
    .map((m) => m[1])
    .slice(0, 14)
    .map((block) => {
      const title = tag(block, 'title');
      const desc = (tag(block, 'content') || tag(block, 'summary'))
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .slice(0, 160);
      const link = firstHref(block);
      const pub = tag(block, 'published') || tag(block, 'updated');
      return {
        kind: 'launch',
        source: 'producthunt',
        title,
        url: link,
        detail: desc || 'new product launch on Product Hunt',
        stats: '🚀 Product Hunt launch',
        when: pub ? new Date(pub).toISOString() : new Date().toISOString(),
      };
    })
    .filter((i) => i.title);
  return items;
}

try {
  const items = await fetchLaunches();
  mkdirSync(path.dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify({ source: 'producthunt', fetchedAt: new Date().toISOString(), items }, null, 2));
  console.log(`[fresh] producthunt: ${items.length} launches`);
} catch (e) {
  console.error(`[fresh] producthunt FAILED: ${e.message} (keeping previous data)`);
}
