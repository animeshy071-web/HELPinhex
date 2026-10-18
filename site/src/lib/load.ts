// HELPINhex loaders — read the single source of truth from /content at build time.
// IMPORTANT: run all site commands from inside /site (npm run dev / build / preview).

import fs from 'node:fs';
import path from 'node:path';
import type { Tool, Model, Term, Guide, Path, Workflow, NewsItem } from './types';

const contentDir = path.resolve(process.cwd(), '..', 'content');

// ===== Generated data (written by /scrapers, refreshed daily by GitHub Actions) =====

export interface FreshItem {
  kind: string;
  source: string;
  title: string;
  url: string;
  detail: string;
  stats: string;
  when: string;
}

export interface FreshFeed {
  source: string;
  fetchedAt: string;
  items: FreshItem[];
}

export interface PriceModel {
  id: string;
  name: string;
  contextLength: number | null;
  promptPerM: number | null;
  completionPerM: number | null;
  free: boolean;
}

export interface PriceFeed {
  source: string;
  fetchedAt: string;
  models: PriceModel[];
}

export interface EventItem {
  title: string;
  url: string;
  when: string | null;
  location: string;
  org: string;
}

export interface EventFeed {
  source: string;
  fetchedAt: string;
  items: EventItem[];
}

function readGenerated<T>(name: string): T | null {
  const file = path.join(contentDir, 'generated', name);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
}

/** Merges the fresh feeds (HF models, HN launches, Repo Radar, Product Hunt, Dev.to), newest fetchedAt wins for the honesty stamp. */
export function getFresh(): { items: FreshItem[]; fetchedAt: string | null } {
  const sources = ['fresh-huggingface.json', 'fresh-hackernews.json', 'fresh-producthunt.json', 'fresh-devto.json'];
  const feeds: FreshFeed[] = [];
  for (const s of sources) {
    const f = readGenerated<FreshFeed>(s);
    if (f) feeds.push(f);
  }
  const repos = readGenerated<RepoFeed>('repos.json');
  if (repos) feeds.push(repos);
  const items = feeds.flatMap((f) => (f as RepoFeed).latest ?? f.items);
  const fetchedAt = feeds.length ? feeds.map((f) => f.fetchedAt).sort().at(-1) ?? null : null;
  return { items, fetchedAt };
}

export interface RepoChannel {
  name: string;
  query: string;
  searchUrl: string;
  items: FreshItem[];
}

export interface RepoFeed extends FreshFeed {
  latest: FreshItem[];
  channels: RepoChannel[];
}

/** The Repo Radar — just-launched AI repos + browsable topic channels. */
export function getRepos(): RepoFeed | null {
  return readGenerated<RepoFeed>('repos.json');
}

export function getPrices(): PriceFeed | null {
  return readGenerated<PriceFeed>('prices.json');
}

/** Live price for one model family — matched against the OpenRouter feed. */
export function getPriceForFamily(family: string): PriceModel | null {
  const feed = getPrices();
  if (!feed) return null;
  const needle = family.toLowerCase();
  return (
    feed.models.find((m) => m.id.toLowerCase().includes(needle)) ??
    feed.models.find((m) => m.name.toLowerCase().includes(needle)) ??
    null
  );
}

export function getEvents(): EventFeed | null {
  return readGenerated<EventFeed>('events.json');
}

function readJson<T>(name: string): T {
  const file = path.join(contentDir, name);
  if (!fs.existsSync(file)) {
    throw new Error(
      `[HELPINhex] Content file not found: ${file}.\n` +
      `Did you run the command from inside /site? Try: cd site && npm run dev`
    );
  }
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
}

export const getTools = (): Tool[] => readJson<Tool[]>('tools.json');
export const getModels = (): Model[] => readJson<Model[]>('models.json');
export const getTerms = (): Term[] => readJson<Term[]>('terms.json');
export const getGuides = (): Guide[] => readJson<Guide[]>('guides.json');
export const getPaths = (): Path[] => readJson<Path[]>('paths.json');
export const getWorkflows = (): Workflow[] => readJson<Workflow[]>('workflows.json');
export const getNews = (): NewsItem[] => readJson<NewsItem[]>('news.json');

export interface Prompt {
  id: string;
  category: string;
  title: string;
  use: string;
  text: string;
}

export interface Collection {
  id: string;
  title: string;
  promise: string;
  cost: string;
  tools: { id: string; why: string }[];
  guides: string[];
  path?: string;
  workflow?: string;
  honestNote: string;
}

export const getPrompts = (): Prompt[] => readJson<Prompt[]>('prompts.json');
export const getCollections = (): Collection[] => readJson<Collection[]>('collections.json');

export function getToolBySlug(slug: string): Tool | undefined {
  return getTools().find((t) => t.slug === slug);
}
export function getModelBySlug(slug: string): Model | undefined {
  return getModels().find((m) => m.slug === slug);
}
export function getGuideBySlug(slug: string): Guide | undefined {
  return getGuides().find((g) => g.slug === slug);
}

// A compact map of every searchable thing on the site — powers ⌘K and Ask fallback.
export interface SearchDoc {
  id: string;
  title: string;
  kind: 'tool' | 'model' | 'guide' | 'path' | 'term' | 'workflow' | 'page' | 'fresh';
  url: string;
  extra: string;
  keywords?: string[];
  when?: string;
  freeTier?: boolean;
}

export function getSearchDocs(): SearchDoc[] {
  const docs: SearchDoc[] = [];
  for (const t of getTools()) {
    const keywords = [...(t.keywords ?? []), t.category];
    docs.push({
      id: t.id,
      title: t.name,
      kind: 'tool',
      url: `/tools/${t.slug}/`,
      extra: `${t.tagline} — ${t.whatItIs.slice(0, 160)}`,
      keywords,
      when: t.lastVerified,
      freeTier: t.freeTier,
    });
  }
  for (const m of getModels()) {
    docs.push({
      id: m.id,
      title: m.name,
      kind: 'model',
      url: `/models/${m.slug}/`,
      extra: `${m.bestFor} — by ${m.by}. Strengths: ${m.strengths.join(', ').slice(0, 140)}`,
      keywords: [m.by, ...m.modalities],
      when: m.lastVerified,
      freeTier: m.freeTier,
    });
  }
  for (const g of getGuides()) docs.push({ id: g.id, title: g.title, kind: 'guide', url: `/guides/${g.slug}/`, extra: g.summary });
  for (const p of getPaths()) docs.push({ id: p.id, title: p.title, kind: 'path', url: `/paths/${p.slug}/`, extra: p.goal });
  for (const t of getTerms()) docs.push({ id: t.id, title: t.word, kind: 'term', url: `/glossary/#${t.id}`, extra: t.plain });
  for (const w of getWorkflows()) docs.push({ id: w.id, title: w.title, kind: 'workflow', url: `/ask/#${w.id}`, extra: w.totalCost, keywords: w.questionPatterns });
  // Fresh from the internet — scraped launches/repos are searchable too
  const fresh = getFresh();
  for (const [i, f] of fresh.items.slice(0, 60).entries()) {
    docs.push({
      id: `fresh-${i}`,
      title: f.title,
      kind: 'fresh',
      url: f.url,
      extra: `${f.detail} ${f.stats} (${f.source})`.slice(0, 220),
      when: f.when,
    });
  }
  docs.push({ id: 'repos', title: 'Repo Radar', kind: 'page', url: '/repos/', extra: 'Latest AI repos + find repos by topic — where AI launches first' });
  docs.push({ id: 'chat', title: 'Chat with HEX', kind: 'page', url: '/chat/', extra: 'The AI chatbot grounded in our verified catalog + live scraped feeds, with sources' });
  docs.push({ id: 'compare', title: 'Compare models', kind: 'page', url: '/compare/', extra: 'Every model family with live prices, free tiers, context sizes' });
  docs.push({ id: 'checker', title: 'Laptop checker', kind: 'page', url: '/checker/', extra: 'What AI can YOUR machine run? Answer two questions' });
  docs.push({ id: 'events', title: 'Events & hackathons', kind: 'page', url: '/events/', extra: 'Where beginners find hackathons — and how to actually finish one' });
  docs.push({ id: 'opportunities', title: 'Opportunities', kind: 'page', url: '/opportunities/', extra: 'Real ways to earn with AI — honest difficulty, honest warnings' });
  docs.push({ id: 'playground', title: 'First API call playground', kind: 'page', url: '/playground/', extra: 'Make a real AI API call in your browser — see the raw JSON' });
  docs.push({ id: 'prompts', title: 'Prompt library', kind: 'page', url: '/prompts/', extra: 'Tested prompts that actually work — with copy buttons' });
  docs.push({ id: 'collections', title: 'Collections (curated stacks)', kind: 'page', url: '/collections/', extra: 'The $0 stack, first-chatbot kit, privacy kit, video kit' });
  docs.push({ id: 'calculator', title: 'Cost calculator', kind: 'page', url: '/calculator/', extra: 'What would your project cost per month? Live prices in' });
  docs.push({ id: 'graveyard', title: 'The AI Graveyard', kind: 'page', url: '/graveyard/', extra: 'How to tell if a tool is dead — before you build on it' });
  for (const p of getPrompts()) docs.push({ id: `prompt-${p.id}`, title: p.title, kind: 'guide', url: `/prompts/#${p.id}`, extra: p.use });
  return docs;
}

// Term dictionary for the jargon decoder: { id: { word, plain } }
export function getTermMap(): Record<string, { word: string; plain: string }> {
  const map: Record<string, { word: string; plain: string }> = {};
  for (const t of getTerms()) map[t.id] = { word: t.word, plain: t.plain };
  return map;
}
