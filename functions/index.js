// HEX Firebase function — keyless answers for every visitor.
// Receives { question, model? } → retrieves from the bundled knowledge pack
// (the same scraped + verified corpus) → asks OpenRouter with the SERVER key.
// The visitor never sees a key; the model never answers without our data.

const { onRequest } = require('firebase-functions/v2/https');
const fs = require('fs');
const path = require('path');

const knowledge = JSON.parse(fs.readFileSync(path.join(__dirname, 'knowledge.json'), 'utf8'));

// ===== retrieval (plain-JS mirror of site/src/lib/score.ts) =====
const SYN = {
  video: ['video', 'editing', 'editor', 'edit', 'youtube', 'tiktok', 'reels', 'shorts', 'clip', 'clips', 'film', 'movie', 'caption', 'captions', 'thumbnail', 'vlog'],
  image: ['image', 'images', 'photo', 'photos', 'picture', 'thumbnail', 'logo'],
  audio: ['audio', 'voice', 'music', 'song', 'podcast', 'sound', 'speech', 'tts'],
  ai: ['ai', 'llm', 'gpt', 'model', 'models', 'agent', 'chatbot', 'prompt'],
  free: ['free', 'gratis', 'cheap', 'budget', 'without paying'],
};
const FRESH_WORDS = ['latest', 'newest', 'new', 'recent', 'fresh', 'hot', 'trending', '2025', '2026', 'right now', 'this month', 'this week'];

const tokenize = (q) => q.toLowerCase().split(/[^a-z0-9-]+/).filter((w) => w.length > 1);

function detectIntent(q) {
  const ql = q.toLowerCase();
  return {
    fresh: FRESH_WORDS.some((w) => ql.includes(w)),
    free: SYN.free.some((w) => ql.includes(w)),
  };
}

function expand(q) {
  const words = tokenize(q);
  const extra = new Set();
  for (const w of words) for (const g of Object.values(SYN)) if (g.includes(w)) for (const x of g) extra.add(x);
  for (const w of words) extra.delete(w);
  return [...extra];
}

function recency(when) {
  if (!when) return 0;
  const t = Date.parse(when);
  if (Number.isNaN(t)) return 0;
  const days = (Date.now() - t) / 864e5;
  if (days <= 7) return 7;
  if (days <= 30) return 5;
  if (days <= 90) return 3;
  if (days <= 365) return 1;
  return 0;
}

function score(query, doc) {
  const q = query.toLowerCase().trim();
  const title = doc.title.toLowerCase();
  const extra = (doc.extra || '').toLowerCase();
  const kw = (doc.keywords || []).map((k) => String(k).toLowerCase());
  const intent = detectIntent(query);
  let s = 0;
  if (title.includes(q)) s += 10;
  if (extra.includes(q)) s += 4;
  for (const k of kw) if (q.includes(k) || k === q) s += 8;
  const words = tokenize(q);
  let hits = 0;
  for (const w of words) {
    if (title.includes(w)) { s += 3; hits++; }
    else if (kw.some((k) => k.includes(w))) { s += 2.5; hits++; }
    else if (extra.includes(w)) { s += 1; hits++; }
  }
  for (const syn of expand(query)) {
    if (title.includes(syn)) s += 1.2;
    else if (kw.some((k) => k.includes(syn))) s += 1;
    else if (extra.includes(syn)) s += 0.4;
  }
  if (words.length > 1 && hits === words.length) s += 4;
  if (intent.fresh && doc.when) s += recency(doc.when);
  if (intent.free && doc.freeTier) s += 3;
  if (intent.fresh && (doc.kind === 'fresh' || doc.kind === 'repo')) s += 1.5;
  return s;
}

function retrieve(question, k = 10) {
  const limit = detectIntent(question).fresh ? Math.max(k, 14) : k;
  return knowledge.docs
    .map((d) => ({ d, s: score(question, d) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.d);
}

function buildContext(docs) {
  if (!docs.length) return 'CONTEXT: (nothing relevant found in the knowledge base for this question)';
  return (
    'CONTEXT (verified knowledge base of HELPINhex — catalog entries are human-verified; ' +
    'fresh/repo items are auto-scraped from GitHub, Hacker News, Product Hunt and DEV.to with their dates):\n' +
    docs
      .map((d, i) => {
        const date = d.when ? `, dated ${String(d.when).slice(0, 10)}` : '';
        const free = d.freeTier ? ', has a free tier' : '';
        return `[${i + 1}] ${d.title} (${d.kind}${date}${free})\n${d.extra}\nSource: ${d.url}`;
      })
      .join('\n\n')
  );
}

exports.hexAsk = onRequest(
  {
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 60,
    cors: true, // same-origin via Hosting rewrite + explicit calls
    secrets: ['OPENROUTER_KEY'],
  },
  async (req, res) => {
    if (req.method === 'OPTIONS') return res.status(204).send('');
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
    try {
      const { question, model, history } = req.body || {};
      if (!question || typeof question !== 'string') return res.status(400).json({ error: 'question required' });
      const key = process.env.OPENROUTER_KEY;
      if (!key) return res.status(500).json({ error: 'OPENROUTER_KEY secret not set — run: firebase functions:secrets:set OPENROUTER_KEY' });

      const docs = retrieve(question, 10);
      const picked = model || knowledge.freeModels.find((m) => !/gemini/i.test(m)) || 'meta-llama/llama-3.3-70b-instruct:free';
      const today = new Date().toISOString().slice(0, 10);
      const system = [
        `You are HEX, the chatbot of HELPINhex — a beginner-first map of tech and AI. Today is ${today}.`,
        'RULES:',
        '1. Answer using the CONTEXT below — it is freshly scraped and verified site data. This data is your knowledge; do not lean on your own training memory when the context covers the topic.',
        '2. Cite sources inline like [1], [2] matching the context numbers.',
        "3. When the question asks for 'latest/new' items, prefer the most recent dates in the context and say each item's date.",
        '4. If the context does not cover the question, say so in one line, then answer from general knowledge clearly labeled "general knowledge — not from our live data".',
        '5. Beginner tone: plain English, short sentences, explain jargon in one clause. No invented prices or features.',
        '6. Keep answers under ~300 words unless asked for depth.',
        '',
        buildContext(docs),
      ].join('\n');

      const messages = [
        { role: 'system', content: system },
        ...(Array.isArray(history) ? history.slice(-6).map((m) => ({ role: m.role, content: String(m.content).slice(0, 2000) })) : []),
        { role: 'user', content: String(question).slice(0, 2000) },
      ];

      const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}`, 'X-Title': 'HELPinhex' },
        body: JSON.stringify({ model: picked, messages }),
      });
      if (!orRes.ok) {
        const t = await orRes.text().catch(() => '');
        return res.status(502).json({ error: `OpenRouter ${orRes.status}: ${t.slice(0, 200)}` });
      }
      const data = await orRes.json();
      const answer = data.choices?.[0]?.message?.content || 'The model returned an empty answer.';
      return res.status(200).json({
        answer,
        model: picked,
        sources: docs.slice(0, 8).map((d) => ({ title: d.title, url: d.url, kind: d.kind, when: d.when })),
      });
    } catch (e) {
      console.error('hexAsk error', e);
      return res.status(500).json({ error: e.message || 'internal error' });
    }
  }
);
