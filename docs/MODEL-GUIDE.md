# 🤖 Model Workflow Guide — GLM Flash vs GLM 5.3

> Which model builds what, phase by phase. Both are $0 on this plan — switch by **task type**, not cost.

## The two models

| Model | ID | Use for |
|---|---|---|
| **GLM-5.3 Flash** | `nvidia/z-ai/glm-5.3-flash` | Fast execution, high volume, mechanical work |
| **GLM-5.3** | `nvidia/z-ai/glm-5.3` | Deep reasoning, design, debugging, security |

Variants:
- Flash has reasoning-effort variants (`low/high/max`) — bump to `high` or `max` when a Flash task is slightly harder than usual, instead of switching models.
- 5.3 has a `thinking` variant — use it for the hardest problems (architecture, gnarly bugs, security).

## The rule of thumb

> **Task has a clear spec and repeats? → Flash.**
> **Task involves deciding, designing, ambiguity, cross-cutting changes, security, or weird bugs? → 5.3.**

If Flash produces something subtly wrong twice in a row → switch to 5.3 for that task, then return to Flash.

## Phase-by-phase assignment

### Phase 1 — Site skeleton (week 1–2)
| Task | Model |
|---|---|
| Project architecture, data model, design-system tokens | **5.3** |
| Answer Engine instant-mode matching design | **5.3** |
| Scaffold pages, routes, components | Flash |
| Glossary + content data entry (JSON/MDX) | Flash |
| Card components, CSS polish, responsive tweaks | Flash |

### Phase 2 — Freshness engine (week 2–3)
| Task | Model |
|---|---|
| Scraper **adapter architecture** (one clean shared pattern), error handling, rate-limit strategy | **5.3** |
| GitHub Actions workflow design | **5.3** |
| Each individual scraper fetcher (HF, GitHub, HN, MLH, RSS, OpenRouter) | Flash |
| Classification keyword lists, badge logic wiring | Flash |
| Today page wiring, price-history storage | Flash |

### Phase 3 — Answer Engine + comparisons (week 3–4)
| Task | Model |
|---|---|
| Matching/ranking logic, synonyms, edge cases | **5.3** |
| Laptop-checker logic | **5.3** |
| Enter ~30 workflows into the JSON database | Flash |
| Comparison-table data entry, events/opportunities pages, countdown UI | Flash |

### Phase 4 — AI layer (week 4–6)
| Task | Model |
|---|---|
| Ask HEX+ prompt design, retrieval format, citation format | **5.3** (`thinking`) |
| **Key security:** localStorage handling, CORS, streaming, "key never leaves browser" guarantees | **5.3** (`thinking`) |
| PWA manifest + service worker | Flash |
| Collections, prompt library, cost calculator UI | Flash |

### Phase 5 — Ops, content, SEO (ongoing)
| Task | Model |
|---|---|
| SEO metadata, sitemap, schema.org tags | Flash |
| Content formatting, backlog triage, translations prep | Flash |
| Deep bug hunts, refactors, performance | **5.3** |

## Daily usage pattern

- **Open the day with 5.3** when: planning today's work, reviewing yesterday's output, designing a new feature, or a bug is unexplained.
- **Switch to Flash** when: executing a clear written list, bulk content, formatting, repetitive edits, docs.
- **Come back to 5.3** when: something Flash built is subtly wrong twice, or anything touches keys/security/external APIs for the first time.

## What "training" exists in this project (context)

| Component | Trains? | Instead |
|---|---|---|
| LLMs (GLM/Claude/GPT) | ❌ never | Used via API as-is |
| Data flywheel (cards, workflows, news) | ❌ no GPU — but it's the real "training" | Daily loop: scrape → draft → verify → publish. Compounds forever, $0 |
| Answer Engine accuracy | ❌ no GPU | Weekly tuning: log bad/unanswered questions → improve workflows + synonyms |
| Search quality | ❌ no GPU | Tune synonyms/weights over time |
| Mini-HEX (Phase 5+, optional) | ✅ only real training | Fine-tune small open model (LoRA) on verified content, ~$5–50 rented GPU. Educational + becomes a site learning path |
