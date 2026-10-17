// HELPINhex client-side scoring — powers ⌘K search and the Answer Engine's
// instant mode. Zero dependencies; small, explainable, tunable.

export interface SearchDocLite {
  id: string;
  title: string;
  kind: string;
  url: string;
  extra?: string;
}

function tokenize(q: string): string[] {
  return q.toLowerCase().split(/[^a-z0-9-]+/).filter((w) => w.length > 1);
}

/** Simple relevance score; 0 means "no match at all". */
export function scoreDoc(query: string, doc: SearchDocLite): number {
  const q = query.toLowerCase().trim();
  if (!q) return 0;
  const title = doc.title.toLowerCase();
  const extra = (doc.extra || '').toLowerCase();
  let score = 0;

  if (title.includes(q)) score += 10;
  if (extra.includes(q)) score += 4;

  const words = tokenize(q);
  let hits = 0;
  for (const w of words) {
    if (title.includes(w)) { score += 3; hits++; }
    else if (extra.includes(w)) { score += 1; hits++; }
  }
  if (words.length > 1 && hits === words.length) score += 4; // all words present → strong signal
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
  for (const w of workflows) {
    let score = 0;
    for (const p of w.questionPatterns) {
      const pl = p.toLowerCase();
      if (q.includes(pl)) score += 10;                     // full pattern inside question
      else {
        // word overlap between pattern and question
        const pw = tokenize(pl);
        const qw = tokenize(q);
        const overlap = pw.filter((x) => qw.includes(x)).length;
        if (pw.length > 0 && overlap === pw.length) score += 6;  // every pattern word present
        else score += overlap * 1.5;
      }
    }
    if (score > 0) hits.push({ workflow: w, score });
  }
  return hits.sort((a, b) => b.score - a.score);
}
