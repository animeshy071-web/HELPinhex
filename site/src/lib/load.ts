// HELPINhex loaders — read the single source of truth from /content at build time.
// IMPORTANT: run all site commands from inside /site (npm run dev / build / preview).

import fs from 'node:fs';
import path from 'node:path';
import type { Tool, Model, Term, Guide, Path, Workflow, NewsItem } from './types';

const contentDir = path.resolve(process.cwd(), '..', 'content');

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
  kind: 'tool' | 'model' | 'guide' | 'path' | 'term' | 'workflow';
  url: string;
  extra: string;
}

export function getSearchDocs(): SearchDoc[] {
  const docs: SearchDoc[] = [];
  for (const t of getTools()) docs.push({ id: t.id, title: t.name, kind: 'tool', url: `/tools/${t.slug}/`, extra: t.tagline });
  for (const m of getModels()) docs.push({ id: m.id, title: m.name, kind: 'model', url: `/models/${m.slug}/`, extra: m.bestFor });
  for (const g of getGuides()) docs.push({ id: g.id, title: g.title, kind: 'guide', url: `/guides/${g.slug}/`, extra: g.summary });
  for (const p of getPaths()) docs.push({ id: p.id, title: p.title, kind: 'path', url: `/paths/${p.slug}/`, extra: p.goal });
  for (const t of getTerms()) docs.push({ id: t.id, title: t.word, kind: 'term', url: `/glossary/#${t.id}`, extra: t.plain });
  for (const w of getWorkflows()) docs.push({ id: w.id, title: w.title, kind: 'workflow', url: `/ask/#${w.id}`, extra: w.totalCost });
  return docs;
}

// Term dictionary for the jargon decoder: { id: { word, plain } }
export function getTermMap(): Record<string, { word: string; plain: string }> {
  const map: Record<string, { word: string; plain: string }> = {};
  for (const t of getTerms()) map[t.id] = { word: t.word, plain: t.plain };
  return map;
}
