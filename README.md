# HELPINhex 🧠

> **A living map of tech that catches everything new, keeps everything old, and hands every beginner a personal path through it.**

Not a directory. Not a newsletter. A **guide that never sleeps**.

- Ask a question → get a sequenced workflow (tools + steps + costs)
- Every model, tool, platform, repo, and hardware — explained in beginner language
- New stuff scraped daily; evergreen learning paths forever
- Built for the person who doesn't know how to use Hugging Face, terminals, or API keys — yet

**Status:** 📐 Phase 0 — planning complete, build starting.

- 📋 [Master Plan (PLAN.md)](./PLAN.md) — the full product spec, architecture, and roadmap
- 🗓️ MVP target: Phases 1–3 (~3–4 weeks part-time)

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
