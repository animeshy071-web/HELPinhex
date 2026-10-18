# /scrapers — the freshness engine

Seven polite connectors, zero dependencies (plain Node 20+, global fetch). Each one:
- fetches from a free, public API (no keys — except the optional GITHUB_TOKEN in Actions)
- writes a JSON file into `/content/generated/`
- **fails gracefully**: on error it logs and keeps the previous file (stale > broken)

## Connectors

| File | Source | Writes | What it catches |
|---|---|---|---|
| `hugging-face.mjs` | Hugging Face API | `fresh-huggingface.json` | notable new open-weight models (likes/downloads floor cuts test-repo noise) |
| `github.mjs` | GitHub Search API | `repos.json` | **Repo Radar**: brand-new AI repos (≤14 days, earning stars) + 8 browsable topic channels (LLMs, agents, local AI, RAG, image gen, voice, automation, frameworks) with alive-repo filtering |
| `hackernews.mjs` | HN Algolia API | `fresh-hackernews.json` | "Show HN" AI launches |
| `producthunt.mjs` | Product Hunt (Atom feed) | `fresh-producthunt.json` | brand-new product launches, same day they ship |
| `devto.mjs` | DEV.to public API | `fresh-devto.json` | top AI articles of the week |
| `openrouter.mjs` | OpenRouter public API | `prices.json` | live per-million-token prices + context sizes (kills hardcoded pricing forever) |
| `events.mjs` | MLH (best effort) | `events.json` | hackathon listings; degrades to portal fallback |

## Run

```bash
node scrapers/run-all.mjs        # from repo root
```

## Automation

`.github/workflows/freshness.yml` runs this **every 6 hours** on GitHub Actions (free),
plus on demand via the "Run workflow" button. It commits whatever changed under
`content/generated/` and pushes. The site rebuilds itself from the updated JSON
(deploy hook on push, once hosting is connected).

The `fetchedAt` timestamp in every generated file is the honesty mechanism: the site shows it,
so data can never pretend to be fresher than it is.
