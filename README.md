# HELPINhex 🧠

> **A living map of tech that catches everything new, keeps everything old, and hands every beginner a personal path through it.**

Not a directory. Not a newsletter. A **guide that never sleeps**.

- Ask a question → get a sequenced workflow (tools + steps + costs)
- Every model, tool, platform, repo, and hardware — explained in beginner language
- New stuff scraped daily; evergreen learning paths forever
- Built for the person who doesn't know how to use Hugging Face, terminals, or API keys — yet

**Status:** ✅ Phases 1–4 shipped — 43 static pages, live freshness engine, AI layer. Run it:

```bash
cd site
npm install
npm run dev        # dev server at http://localhost:4321
npm run build      # static build → site/dist (deploy anywhere free)
node scrapers/run-all.mjs   # (from repo root) refresh all live data now
```

- 📋 [Master Plan (PLAN.md)](./PLAN.md) — the full product spec, architecture, and roadmap
- 🤖 [Model Guide (docs/MODEL-GUIDE.md)](./docs/MODEL-GUIDE.md) — which AI builds what (Flash vs 5.3)

## What shipped

| Phase | Delivered |
|---|---|
| **1 — Skeleton** | Home + Ask (instant) + catalog (8 tools, 7 model families) + 3 paths + 6 guides + 29-term glossary w/ hover decoder + ⌘K + PWA + Me dashboard (streaks, My Kit, backlog) |
| **2 — Freshness engine** | 5 scrapers (Hugging Face, GitHub **Repo Radar**, Hacker News, OpenRouter prices, events) + daily GitHub Actions cron + live Today page + live prices on model pages |
| **3 — Answer Engine ×4** | 20 verified workflows, live-price Compare table, laptop checker, Events portals, honest Opportunities page |
| **4 — AI layer** | **Ask HEX+** (bring-your-own-key streaming answers, ELI5/Builder/Dev depth), first-API-call playground, 15-prompt library, 4 curated stacks, cost calculator, AI Graveyard |

**Phase 5 backlog (ongoing):** hosting + domain, SEO pass (sitemap/structured data), i18n, accounts/community, per-repo activity tracking for the graveyard radar, weekly digest.

**One pending item:** run `gh auth refresh --scopes workflow` once to unlock pushing the daily-cron file (`.github/workflows/freshness.yml` is ready, waiting on token scope).

## Repository layout (target)

```
/site        → the Astro app (static + islands, PWA)
/content     → data files (catalog, guides, paths, workflows, news)
/scrapers    → data fetchers + classifiers (run by GitHub Actions daily)
/docs        → plan, decisions, content templates
```

## Why it can run at $0

Free hosting (Cloudflare Pages/Vercel) · free data sources (Hugging Face, GitHub, HN Algolia, MLH, RSS) · free automation (GitHub Actions) · personal features via browser localStorage. Optional domain later (~$12/yr).

## License

MIT — see [LICENSE](./LICENSE).
