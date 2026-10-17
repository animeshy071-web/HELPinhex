# HELPINhex 🧠

> **A living map of tech that catches everything new, keeps everything old, and hands every beginner a personal path through it.**

Not a directory. Not a newsletter. A **guide that never sleeps**.

- Ask a question → get a sequenced workflow (tools + steps + costs)
- Every model, tool, platform, repo, and hardware — explained in beginner language
- New stuff scraped daily; evergreen learning paths forever
- Built for the person who doesn't know how to use Hugging Face, terminals, or API keys — yet

**Status:** 🚧 Phase 1 shipped — the site skeleton is live locally (33 pages). Run it:

```bash
cd site
npm install
npm run dev        # dev server at http://localhost:4321
npm run build      # static build → site/dist (deploy anywhere free)
```

- 📋 [Master Plan (PLAN.md)](./PLAN.md) — the full product spec, architecture, and roadmap
- 🤖 [Model Guide (docs/MODEL-GUIDE.md)](./docs/MODEL-GUIDE.md) — which AI builds what (Flash vs 5.3)
- 🗓️ Roadmap: Phase 1 ✅ skeleton · Phase 2 scrapers · Phase 3 Answer Engine expansion · Phase 4 AI layer

**Phase 1 shipped:** home + Ask box (instant mode) · catalog (8 tool + 7 model playbooks) · 3 learning paths with saved progress · 6 guides · 29-term glossary with hover jargon decoder · ⌘K search · Today page · Me dashboard (streaks, My Kit, backlog) · PWA installable.

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
