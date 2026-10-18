// HEX retrieval — loads the knowledge pack (built from verified content + scraped
// feeds) and ranks it against the user's question using the site scorer.
// This is what lets ANY model answer like it "knows things": context first.

import { searchDocs, detectIntent } from './score';

export interface KnowledgeDoc {
  id: string;
  title: string;
  kind: string;
  url: string;
  extra: string;
  keywords?: string[];
  when?: string | null;
  freeTier?: boolean;
}

export interface KnowledgePack {
  builtAt: string;
  freeModels: string[];
  count: number;
  docs: KnowledgeDoc[];
}

let cache: KnowledgePack | null = null;

export async function loadKnowledge(): Promise<KnowledgePack> {
  if (cache) return cache;
  const res = await fetch('/knowledge.json');
  if (!res.ok) throw new Error(`knowledge.json failed to load (${res.status})`);
  cache = (await res.json()) as KnowledgePack;
  return cache;
}

/** Rank the corpus for a question. "latest" questions get a bigger slice of fresh items. */
export async function retrieve(question: string, k = 10): Promise<KnowledgeDoc[]> {
  const pack = await loadKnowledge();
  const intent = detectIntent(question);
  const limit = intent.fresh ? Math.max(k, 14) : k;
  const ranked = searchDocs(question, pack.docs, limit);
  // If the question is freshness-driven, prefer a mix: keep ranked order but
  // guarantee at least a few fresh/repo docs when they scored anything.
  return ranked.slice(0, limit);
}

/** Format the retrieved docs as a numbered context block for the LLM. */
export function buildContext(docs: KnowledgeDoc[]): string {
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
