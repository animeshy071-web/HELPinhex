// HELPINhex client-side scoring — powers ⌘K search and the Answer Engine's
// instant mode. Zero dependencies; small, explainable, tunable.

export interface SearchDocLite {
  id: string;
  title: string;
  kind: string;
  url: string;
  extra?: string;
  /** Optional match keywords (e.g. ["video editing","youtube"]) — weighted heavily. */
  keywords?: string[];
  /** ISO date of last verification / publication — used for "latest" intent. */
  when?: string;
  /** Optional free-tier flag — used for "free" intent. */
  freeTier?: boolean;
}

// ===== Intent + synonym layer =====
// Maps query words onto concept groups so "latest tools for video editing"
// finds CapCut/DaVinci even when their titles share no literal word.
const SYN: Record<string, string[]> = {
  video: ['video', 'editing', 'editor', 'edit', 'youtube', 'tiktok', 'reels', 'shorts', 'clip', 'clips', 'film', 'movie', 'caption', 'captions', 'thumbnail', 'vlog'],
  edit: ['edit', 'editing', 'editor', 'cut', 'trim', 'caption', 'captions'],
  image: ['image', 'images', 'photo', 'photos', 'picture', 'thumbnail', 'logo'],
  audio: ['audio', 'voice', 'music', 'song', 'podcast', 'sound', 'speech', 'tts'],
  code: ['code', 'coding', 'programming', 'developer', 'vscode', 'editor'],
  chat: ['chat', 'chatbot', 'assistant', 'conversation', 'llm'],
  write: ['write', 'writing', 'blog', 'blogpost', 'notes', 'summarize', 'summary', 'transcript'],
  ai: ['ai', 'llm', 'gpt', 'model', 'models', 'agent', 'chatbot', 'prompt'],
  free: ['free', 'gratis', 'without paying', 'no cost', 'cheap', 'budget'],
  design: ['design', 'logo', 'poster', 'thumbnail', 'graphic', 'banner'],
};

// Words that trigger a freshness sort ("latest tools" = newest verified stuff).
const FRESH_WORDS = ['latest', 'newest', 'new', 'recent', 'fresh', 'hot', 'trending', '2025', '2026', 'right now', 'this month', 'this week'];
// Words that hint the user wants tools specifically.
const TOOL_WORDS = ['tool', 'tools', 'app', 'apps', 'software', 'editor', 'editors', 'platform', 'website', 'site', 'recommendation', 'recommendations'];

function tokenize(q: string): string[] {
  return q.toLowerCase().split(/[^a-z0-9-]+/).filter((w) => w.length > 1);
}

export function detectIntent(query: string): { fresh: boolean; tools: boolean; free: boolean } {
  const q = query.toLowerCase();
  return {
    fresh: FRESH_WORDS.some((w) => q.includes(w)),
    tools: TOOL_WORDS.some((w) => tokenize(q).includes(w)),
    free: SYN.free.some((w) => q.includes(w)),
  };
}

/** Recency boost: 0–7 points, only meaningful when the doc carries a date. */
function recencyBoost(when?: string): number {
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

/** Expand a query with synonym-group partners (deduped, no originals). */
function expandQuery(q: string): string[] {
  const words = tokenize(q);
  const extra = new Set<string>();
  for (const w of words) {
    for (const group of Object.values(SYN)) {
      if (group.includes(w)) for (const g of group) extra.add(g);
    }
  }
  for (const w of words) extra.delete(w);
  return [...extra];
}

/** Simple relevance score; 0 means "no match at all". */
export function scoreDoc(query: string, doc: SearchDocLite): number {
  const q = query.toLowerCase().trim();
  if (!q) return 0;
  const intent = detectIntent(q);
  const title = doc.title.toLowerCase();
  const extra = (doc.extra || '').toLowerCase();
  const kw = (doc.keywords || []).map((k) => k.toLowerCase());
  let score = 0;

  // Exact phrase hits
  if (title.includes(q)) score += 10;
  if (extra.includes(q)) score += 4;
  for (const k of kw) if (q.includes(k) || k === q) score += 8; // keyword phrase spoken by the user

  const words = tokenize(q);
  const expanded = expandQuery(q);
  let hits = 0;
  for (const w of words) {
    if (title.includes(w)) { score += 3; hits++; }
    else if (kw.some((k) => k.includes(w))) { score += 2.5; hits++; }
    else if (extra.includes(w)) { score += 1; hits++; }
  }
  // Synonym partners found in the doc (half weight)
  for (const s of expanded) {
    if (title.includes(s)) score += 1.2;
    else if (kw.some((k) => k.includes(s))) score += 1;
    else if (extra.includes(s)) score += 0.4;
  }
  if (words.length > 1 && hits === words.length) score += 4; // all words present → strong signal

  // Intent boosts
  if (intent.fresh && doc.when) score += recencyBoost(doc.when);
  if (intent.free && doc.freeTier) score += 3;
  if (intent.tools && doc.kind === 'tool') score += 2;

  return score;
}

export function searchDocs(query: string, docs: SearchDocLite[], limit = 8): SearchDocLite[] {
  return docs
    .map((d) => ({ d, s: scoreDoc(query, d) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.d);
}

/** Answer Engine instant mode: score workflows against a free-text question. */
export interface WorkflowLite {
  id: string;
  title: string;
  questionPatterns: string[];
}
export interface WorkflowHit {
  workflow: WorkflowLite;
  score: number;
}

export function matchWorkflows(query: string, workflows: WorkflowLite[]): WorkflowHit[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const hits: WorkflowHit[] = [];
  const qw = tokenize(q);
  for (const w of workflows) {
    let score = 0;
    for (const p of w.questionPatterns) {
      const pl = p.toLowerCase();
      if (q.includes(pl)) score += 10;                     // full pattern inside question
      else {
        // word overlap between pattern and question
        const pw = tokenize(pl);
        const overlap = pw.filter((x) => qw.includes(x)).length;
        if (pw.length > 0 && overlap === pw.length) score += 6;  // every pattern word present
        else score += overlap * 1.5;
      }
    }
    if (score > 0) hits.push({ workflow: w, score });
  }
  return hits.sort((a, b) => b.score - a.score);
}
