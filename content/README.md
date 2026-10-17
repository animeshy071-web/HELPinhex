# /content — the single source of truth

Everything the site shows lives here as plain JSON. No database. Version-controlled. 
The site (`/site`) reads these at build time. Scrapers (`/scrapers`, Phase 2) will append to them daily.

**Run all site commands from inside `/site`** (`npm run dev`, `npm run build`) — the loaders resolve `../content` from there.

## Files & schemas

### tools.json — `Tool[]`
```
id, slug, name, category, tagline, freeTier, pricing (plain-language string),
whatItIs, whyMatters, howToUse: string[], whenNotToUse, alternatives: string[],
links: { official }, status: "alive", lastVerified (YYYY-MM-DD)
```

### models.json — `Model[]`
```
id, slug, name, family, by, modalities: string[], context (plain-language),
access: string[], freeTier, pricingNote, strengths: string[], weaknesses: string[],
bestFor, lastVerified
```
Pricing is deliberately plain-language: **live prices auto-arrive in Phase 2** (OpenRouter feed). Never hardcode prices here.

### terms.json — `Term[]` — powers the jargon decoder
```
id, word, plain, example, related: string[]
```
Any term id referenced in guide/tool text gets hover-decoded automatically (build-time linking in `site/src/lib/format.ts`).

### guides.json — `Guide[]` — evergreen explainers
```
id, slug, title, minutes, summary, body: string[] (plain paragraphs), relatedTerms: string[]
```

### paths.json — `Path[]` — the learning tracks
```
id, slug, title, goal, duration, prereqs: string[],
steps: { title, description, guide?: slug, tool?: slug, minutes }[]
```

### workflows.json — `Workflow[]` — powers the Answer Engine (instant mode)
```
id, title, level, totalCost, totalTime, questionPatterns: string[],
steps: { title, tool, how, cost, time, guide? }[], mistakes: string[]
```

### news.json — `NewsItem[]` (empty until Phase 2)
```
date, source, whatHappened, whyItMatters, impact ("game-changer"|"useful"|"meh"), links, auto: boolean, lastVerified
```

## Rules (from PLAN.md §8 — the trust system)

1. **Every entry carries `lastVerified`.** No fake freshness, ever.
2. Auto-generated content must be labeled `auto: true` → rendered with the `auto-explained` badge.
3. Prices never hardcode — pricingNote points at the Phase 2 price feed.
4. Unsure about a fact? Leave it out. The site teaches trust or nothing.
