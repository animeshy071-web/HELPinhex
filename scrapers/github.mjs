// HELPINhex freshness engine — GitHub connector ("Repo Radar")
// Two jobs:
//   1. LATEST: catch brand-new AI repos (created in last 14 days, gaining stars)
//   2. CHANNELS: keep browsable, curated-by-query lists per AI topic
// Writes content/generated/repos.json (replaces the old fresh-github.json)

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const OUT = fileURLToPath(new URL('../content/generated/repos.json', import.meta.url));
const TOKEN = process.env.GITHUB_TOKEN;
const headers = {
  'User-Agent': 'HELPINhex-freshness/1.0',
  Accept: 'application/vnd.github+json',
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function since(daysAgo) {
  return new Date(Date.now() - daysAgo * 864e5).toISOString().slice(0, 10);
}

async function search(q, perPage = 10) {
  const url = `https://api.github.com/search/repositories?sort=stars&order=desc&per_page=${perPage}&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`GitHub ${res.status} for query: ${q}`);
  const json = await res.json();
  return json.items ?? [];
}

function toFreshItem(r) {
  return {
    kind: 'repo',
    source: 'github',
    title: r.full_name,
    url: r.html_url,
    detail: (r.description || 'no description yet').slice(0, 140),
    stats: `⭐ ${r.stargazers_count} · updated ${String(r.pushed_at).slice(0, 10)}`,
    when: r.pushed_at || r.created_at,
  };
}

const searchUrlFor = (q) =>
  `https://github.com/search?type=repositories&s=stars&o=desc&q=${encodeURIComponent(q)}`;

// --- 1. LATEST: new AI repos, last 14 days, already gaining stars ---
async function catchLatest() {
  const queries = [`topic:llm created:>${since(14)}`, `ai agent created:>${since(14)}`];
  const merged = new Map();
  for (const q of queries) {
    for (const r of await search(q, 15)) merged.set(r.full_name, r);
    await sleep(350); // stay under the search rate limit
  }
  return [...merged.values()]
    .filter((r) => r.stargazers_count >= 10)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 15)
    .map(toFreshItem);
}

// --- 2. CHANNELS: popular, alive, browsable per topic (pushed recently = not graveyard-bound) ---
const CHANNELS = [
  { name: '🧠 LLMs & model tools', q: `topic:llm stars:>200 pushed:>${since(90)}` },
  { name: '🤖 AI agents', q: `topic:ai-agents stars:>200 pushed:>${since(90)}` },
  { name: '🏠 Local AI (Ollama & friends)', q: `topic:ollama stars:>300 pushed:>${since(90)}` },
  { name: '🔎 RAG & search', q: `topic:rag stars:>100 pushed:>${since(90)}` },
  { name: '🎨 Image & video gen', q: `topic:stable-diffusion stars:>500 pushed:>${since(90)}` },
  { name: '🎙️ Voice & audio', q: `topic:whisper stars:>300 pushed:>${since(90)}` },
  { name: '🔗 Automation & n8n', q: `n8n stars:>100 pushed:>${since(90)}` },
  { name: '🧩 LLM frameworks', q: `topic:langchain stars:>300 pushed:>${since(90)}` },
];

async function catchChannels() {
  const channels = [];
  for (const c of CHANNELS) {
    try {
      const repos = await search(c.q, 8);
      channels.push({
        name: c.name,
        query: c.q,
        searchUrl: searchUrlFor(c.q),
        items: repos.map(toFreshItem),
      });
    } catch (e) {
      console.error(`[repos] channel "${c.name}" skipped: ${e.message}`);
      channels.push({ name: c.name, query: c.q, searchUrl: searchUrlFor(c.q), items: [] });
    }
    await sleep(350);
  }
  return channels;
}

try {
  const latest = await catchLatest();
  const channels = await catchChannels();
  mkdirSync(path.dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify({ source: 'github', fetchedAt: new Date().toISOString(), latest, channels }, null, 2));
  const total = channels.reduce((n, c) => n + c.items.length, 0);
  console.log(`[fresh] github radar: ${latest.length} just-launched + ${total} across ${channels.length} channels`);
} catch (e) {
  console.error(`[fresh] github FAILED: ${e.message} (keeping previous data)`);
}
