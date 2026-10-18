# 🧠 HELPINhex — Master Plan

> **v1.0 — Oct 17, 2026** · status: ✅ approved foundation → Phase 1 building starts next

---

## 1. The one-liner

> **HELPINhex is a living map of tech that catches everything new, keeps everything old, and hands every beginner a personal path through it.**

Not a directory. Not a newsletter. A **guide that never sleeps**.

---

## 2. The problem

Every day: new models (GLM, Claude, GPT, Gemini, Llama…), new video/image tools, new platforms, new hackathons, "X just added AI", price changes, tools dying.

- **Directories** (Futurepedia, There's An AI For That) list 30,000 tools but teach nothing. A beginner drowns.
- **Newsletters** inform daily but vanish — read once, gone. No searchable knowledge.
- **Tutorials** are scattered across YouTube/blogs, outdated fast, no structure.

And the deepest beginner problem is **not** "which new tool exists" — it's *"I don't even know how to use Hugging Face, terminals, API keys, or any of the 'obvious' tools nobody explains."*

**The gap:** nobody combines **learn (structured path) + catalog (what exists) + fresh (what's new today) + act (do this, in this order, with these tools)** in one place.

---

## 3. Who it's for

| Persona | Example | What they need |
|---|---|---|
| **The Absolute Beginner** | "I keep hearing about AI but don't know where to start" | A path from zero, jargon decoded, first win in a weekend |
| **The Stuck Beginner** | "I got an API key… now what do I do with it?" | Step-by-step connect/build guides, copy-paste recipes |
| **The Catch-Up Artist** | "3 new models dropped this week, do any matter to me?" | "Why it matters" filter, honest signal vs noise |
| **The Builder** | "I want to make X — what tools, what order, what cost?" | The Answer Engine: question → sequenced workflow |

First user: **us.** The site must be genuinely useful deployed for personal use before it's a public product.

---

## 4. The four pillars

```
 WHAT COMES IN          WHAT STAYS              WHAT YOU DO
 (Fresh Engine)         (The Archive)           (Path Giver + Answer Engine)
──────────────────     ───────────────────     ─────────────────────────
 new models             what is an API?         quiz → personal path
 new GitHub repos       how to use Hugging Face   progress, streaks
 new tools/platforms    terminal / git / keys      ask a question →
 news ("X got AI")      tokens / RAG / context      get sequenced tools
 hackathons/events      CS + software basics        + how-to steps
 money opportunities    hardware basics            + costs + guides
 price changes          the "weird internet tools"  + this week's new stuff
```

- **Fresh Engine** — scrapers catch everything new daily, auto-classified, auto-explained.
- **The Archive** — evergreen guides, playbooks, glossary. Written once, updated rarely. The trust layer.
- **Path Giver** — quiz → personal learning path → progress tracking.
- **Answer Engine** — Google gives links, HELPINhex gives a plan (see §5.1 — the centerpiece).

---

## 5. Feature spec (prioritized)

### 5.1 ⭐ The Answer Engine — "ask a question, get a plan"

The front door. User types a goal/question in plain language:

> *"how do I make cartoon videos for youtube without editing skills?"*

And gets a **sequenced workflow**, not links:

| # | Step | Tool | Cost | Time | Guide |
|---|---|---|---|---|---|
| 1 | Write the script | GLM (free tier) | $0 | 30 min | → full guide |
| 2 | Generate the voice | TTS tool | $0–5/mo | 15 min | → full guide |
| 3 | Generate consistent character images | image tool | $0–10/mo | 1 hr | → full guide |
| 4 | Assemble the video | CapCut | $0 | 1 hr | → full guide |
| 5 | Thumbnail + publish | image tool | $0 | 20 min | → full guide |

…plus **alternatives per step**, **common beginner mistakes**, total cost/time estimate, and a **"new this week in this category"** box so fresh finds slot into answers automatically.

**Two modes:**
1. **Instant mode (ships first)** — curated **Workflows Database** (~30 to start) + fuzzy keyword match. Deterministic, free, offline, instant. No AI needed.
2. **AI mode ("Ask HEX+")** — bring-your-own API key (stored **only** in the browser, never on a server) → an LLM composes a custom workflow from our own catalog JSON, citing our guides. Runs on free tiers = $0.
3. **No match?** → search results + a one-click **"teach me this"** button that files the question into our content backlog. Every unanswered question is tomorrow's content.

### 5.2 v1 core features

| Feature | What it is | Why it matters |
|---|---|---|
| **Today page** | Daily briefing: 3 new things scraped overnight + 1 tip + 1 deadline | The "open it every morning" habit |
| **Catalog** | Models, tools, platforms, GitHub repos, hardware — each a **playbook card**: What → Why → How (steps) → Cost → When NOT to use → Alternatives → last-verified date | Depth no directory has |
| **Comparison tables** | Head-to-head per category (GLM vs Claude vs GPT vs Gemini: price, context, speed, best-for) | Beginners' #1 question: "which one?" |
| **Jargon decoder** | Every technical term hoverable → plain-English popup + example | Kills the #1 beginner blocker |
| **Laptop checker** | "What can MY machine run?" — pick RAM/GPU → which local models (Ollama) actually work | Unique, practical, shareable |
| **Recipes/Workflows** | The curated DB behind the Answer Engine, browsable | Instant-mode answers |
| **⌘K search** | Instant fuzzy search across everything (Pagefind/Fuse.js) | Speed = trust |
| **Personal layer** | Progress, streaks, bookmarks, "My Kit" — browser localStorage, **no accounts needed** | Zero-backend personalization |
| **PWA install** | Installs on phone/desktop like a native app, works offline on saved paths | "App" feel for $0 |
| **Freshness badges** | `auto-explained` · `human-verified` · `pricing verified Oct 17` · `possibly dead` | Trust system — freshness never lies |

### 5.3 Phase 2–4 features (the "peak" layer)

| Feature | Notes |
|---|---|
| **Ask HEX+ (AI mode)** | See 5.1 — bring-your-own-key, composes custom workflows |
| **Cost calculator** | "This project with these APIs ≈ $X/month" |
| **API price tracker** | Scraper stores price history → news like "GLM got 30% cheaper" — *our own unique data* |
| **Dead-tool radar / AI Graveyard** | GitHub inactivity + dead links → `possibly dead` badge. "Is this tool still alive?" — nobody answers this simply |
| **Deadline countdowns** | Hackathons/grants with calendar export (.ics) |
| **Curated collections** | "The $0 broke-student AI stack", "Everything a beginner needs in week 1" |
| **Prompt library** | Tested beginner prompts per tool/model |
| **Depth toggle** | Every guide readable at 3 levels: *ELI5 / Builder / Dev* — same page, one toggle |
| **First API call playground** | In-browser sandbox: paste your key (local only) → make your first real API call with a visible response |
| **News with "why it matters"** | Every news item gets a beginner-impact rating: *does this change anything for you?* |

### 5.4 Later / global (Tier 3)

Accounts (GitHub OAuth) · community submissions + upvotes · weekly digest email · i18n (multi-language) · visual skill-tree map · browser extension (highlight any term anywhere → HELPINhex explains it) · auto-generated starter-kit repos ("I want to build a chatbot" → generates a GitHub repo skeleton).

---

## 6. Learning paths (the skeleton)

Evergreen tracks, written once, updated rarely. Fresh content **plugs into them**, not the reverse.

| # | Path | Outcome |
|---|---|---|
| 1 | **AI Zero → Builder** (flagship) | Total beginner → shipped first AI thing |
| 2 | **Developer Basics** — terminal, git, GitHub, API keys, JSON, curl, VS Code, notebooks | The "weird internet tools" nobody explains |
| 3 | **Connect Any API** | First API call → first chatbot → RAG basics |
| 4 | **Run AI on Your Machine** | Ollama, LM Studio, what your hardware can do |
| 5 | **AI Image** | Prompting, free vs paid, consistent characters |
| 6 | **AI Video** | Text-to-video, avatars, full YouTube pipeline |
| 7 | **AI Voice & Music** | TTS, dubbing, music tools |
| 8 | **Automate Everything** | n8n / Make / Zapier + AI |
| 9 | **Build & Ship** | Domains, hosting, deploying your first site |
| 10 | **Earn With AI** | Gigs, offers, opportunities — with honest warnings |
| 11 | **Hackathons: How to Compete** | Find, enter, and actually finish one |
| 12 | **Hardware & Local AI** | GPUs, laptops, Raspberry Pi / edge |

---

## 7. Data sources & integrations (all free)

| Source | What we get | Endpoint | Status |
|---|---|---|---|
| **Hugging Face** | Every new model, instantly, w/ tags + downloads + likes | `huggingface.co/api/models?sort=createdAt` | ✅ **verified live, no key** |
| **OpenRouter** | Model catalog + live prices for most major LLMs | `openrouter.ai/api/v1/models` | public, no key |
| **GitHub Search API** | New AI repos, star velocity, dead-repo detection | `api.github.com/search/repositories` | free tier |
| **Hacker News (Algolia)** | "Show HN" AI tool launches | `hn.algolia.com/api` | ✅ free, no key |
| **MLH** | Hackathon/event listings | `mlh.io/seasons` + public API | free |
| **Devpost** | Hackathon details + deadlines | scrape (respectful) | free |
| **Company RSS** | OpenAI / Anthropic / Google / Meta / HF blog announcements | RSS | free |
| **Product Hunt** | New tool launches | GraphQL API (free token) | free |
| **Ollama library** | What can run locally | scrape | free |

---

## 8. Content pipeline — how "everything that comes to market" gets here

```
scrape (daily, automated)
   → classify (category: model/tool/repo/news/event + which paths it belongs to)
   → draft explanation (AI-generated beginner language, from our template)
   → VERIFY QUEUE (human = us; approve / fix / reject)
   → publish with badges (auto-explained · pricing verified · date)
   → auto-slot into: Today page, catalog, relevant paths, Answer Engine results
```

Rules:
- Every page shows **when it was last verified**. No fake freshness.
- Auto content is *always* labeled. Human-verified is a visible upgrade.
- Unanswered Answer Engine questions → content backlog. The site tells us what to write next.

---

## 9. Architecture & stack

```
┌───────────────────────── GitHub (free) ─────────────────────────┐
│  /site   Astro static site (the product)                        │
│  /content  JSON + MDX (all data: cards, guides, paths, news)    │
│  /scrapers TypeScript fetchers (HF, GitHub, HN, MLH, RSS…)      │
│  GitHub Actions: daily cron → scrapers commit fresh JSON       │
└───────────────────────────────┬────────────────────────────────┘
                                │ auto-deploys on push
┌───────────────────── Cloudflare Pages / Vercel (free) ─────────┐
│  HELPINhex (static + islands, PWA, offline)                     │
│  personal layer: localStorage (progress, bookmarks, API key)   │
│  Ask HEX+: browser → provider API directly (key never leaves)  │
└────────────────────────────────────────────────────────────────┘
```

**Stack (recommended):**
- **Astro + React islands + Tailwind CSS** — content sites' best combo: fast, SEO-native, static output, interactivity only where needed
- **Content as JSON/MDX in the repo** — versioned, PR-reviewable, no DB needed to start
- **Pagefind or Fuse.js** — client-side search, no server
- **localStorage** — personal layer with zero backend
- Later (Tier 3): Cloudflare D1 / Supabase + GitHub OAuth for accounts

**Why not Next.js/App Router?** Possible, but Astro gives us a faster static content site with less complexity for this exact shape. Revisit if the app-like features (accounts) outgrow it.

**Target repo layout:**
```
/site        → the Astro app
/content     → data files (catalog, guides, paths, workflows, news)
/scrapers    → data fetchers + classifiers
/docs        → plan, decisions, content templates
```

---

## 10. Data model (content types)

| Type | Key fields |
|---|---|
| **Tool** | name, category, pricing[], freeTier, whatItIs, whyMatters, howToUse[], whenNotToUse, alternatives[], links, lastVerified, status(alive/dead) |
| **Model** | family, modalities, context, pricePerMTok, access[], strengths, weaknesses, lastVerified |
| **Guide** | id, title, depth variants (ELI5/builder/dev optional), body (MDX), relatedTerms[] |
| **Term** | word, plainDefinition, example, related[] — powers the jargon decoder |
| **Path** | goal, steps[] (→ guides + tools), duration, prereqs |
| **Workflow** | questionPatterns[], steps[] (tool + miniHowTo + cost + time), alternatives, totalCost |
| **NewsItem** | date, source, whatHappened, whyItMatters, impactRating, links, autoFlag |
| **Event** | name, org, dates, deadline, mode, prizes, link |
| **Opportunity** | type, source, notes, link |
| **HardwareProfile** | deviceClass, ram, gpu, canRun[] (local models) |

---

## 11. Site map (v1)

```
/                    home: hero → Ask box (Answer Engine) → Today → paths → fresh
/today               daily briefing
/ask                 Answer Engine (instant + AI mode)
/catalog             everything: /catalog/models /catalog/tools /catalog/repos /catalog/hardware
/compare             comparison tables per category
/paths               all learning paths → /paths/[slug]
/guides              archive → /guides/[slug]
/glossary            jargon decoder home
/recipes             curated workflows, browsable
/checker             "what can my laptop run?"
/events              hackathons + deadlines
/opportunities       money + gigs
/graveyard           dead-tool radar (Phase 3+)
/me                  personal dashboard (local storage, no login)
```

**Homepage order (recommended): Ask box → Today → paths → freshest catches.** The question box is the product's identity — it should be the first thing anyone sees.

---

## 12. UI direction (pending final visual decision)

Principles regardless of style:
- **Dark-first** (AI-native feel), light toggle later
- **Readability over decoration** — this is a learning product
- Cards with last-verified dates everywhere; badges visible
- Mobile-first: most beginners will arrive on phones
- Fast: static, Lighthouse 95+, offline PWA

Style options still open (owner is thinking):
- **A. Dark + neon** — dev-tool vibe, glowing accents
- **B. Clean minimal** — Notion-style, calm, trustworthy
- **C. Bold + colorful** — creator energy, gradients, big cards

*(Decision does not block Phase 1 — we build with tokens/theming so reskinning is cheap.)*

---

## 13. Build phases & timeline

| Phase | Deliverable | ETA (part-time) | Status |
|---|---|---|---|
| **0** | This plan + repo | done | ✅ |
| **1** | Design system + core site: home + Ask (instant) + catalog cards + glossary/jargon decoder + paths 1–3 + ⌘K + PWA shell | week 1–2 | ✅ |
| **2** | Scrapers live (HF, GitHub, HN, MLH, RSS, OpenRouter prices) → auto "Today" + classification + badges + price tracker v0 | week 2–3 | ✅ |
| **3** | Answer Engine + 20 workflows, comparisons, laptop checker, recipes, events/opportunities, remaining paths | week 3–4 | ✅ (paths 4–12: backlog) |
| **4** | Ask HEX+ (AI mode), depth toggle, collections, prompt library, graveyard radar, cost calculator, playground | week 4–6 | ✅ |
| **5** | Ongoing: content ops (verify queue), SEO, newsletter, i18n, community | continuous | 🚧 backlog |

**MVP (Phases 1–3): ✅ done in 2 days with AI pair-building. Full vision core: shipped. Phase 5 is the forever-loop.**

---

## 14. Costs

| Item | Cost |
|---|---|
| Hosting (Cloudflare Pages/Vercel) | **$0** |
| All data sources (§7) | **$0** |
| Daily automation (GitHub Actions) | **$0** |
| Personal layer / search / PWA | **$0** |
| AI drafting + Ask HEX+ (free API tiers) | **$0** to start |
| Domain (optional, later) | ~$10–12/year |
| At scale (accounts, email, heavy AI) | covered by monetization (§15) |

**The whole product runs at $0 until it succeeds.**

---

## 15. Monetization (later — do not clutter early)

1. Affiliate links on tool cards (only where programs exist — never affects honesty; dead tools stay dead)
2. Newsletter sponsorship (only after the Today page proves the habit)
3. "Ask HEX+ hosted" — we provide the AI key so users don't need one (small subscription)
4. Ko-fi / donations

Rule: **monetization never touches the learning content.**

---

## 16. SEO & going global

- Win the **long tail**, not "AI tools directory" (saturated): "how to connect GLM to n8n", "run AI on 8GB RAM", "what tool makes cartoon videos"
- Every guide/page = structured data (schema.org HowTo / SoftwareApplication), sitemap, OpenGraph cards
- Answer Engine Q&A pages become indexable ("how do I make X" pages) — free SEO from the product itself
- Content files separated from UI strings from day 1 → i18n later is cheap

---

## 17. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Content treadmill (space moves too fast) | Automation for breadth; humans only for verification (~minutes/day, not hours) |
| Accuracy/trust decay (prices change, tools die) | Last-verified badges + verify queue + dead-tool radar |
| Scope creep ("everything tech") | **This plan is the contract.** New ideas → a "Phase 5+ backlog" file, never into v1 mid-build |
| Scraper breakage | Each source is an isolated adapter; site degrades gracefully, never breaks |
| API key security | Bring-your-own-key lives only in localStorage; never sent anywhere but the provider; clear warnings |
| SEO saturation | Long-tail strategy (§16) |

---

## 18. Success metrics

- **Honest v1 metric:** owner uses it personally every day (dogfooding = the real test)
- 100 human-verified playbook cards within 8 weeks
- Every notable model/tool/repo caught within **48h** of launch
- 10 how-to pages indexed by Google in month 1
- First stranger finishing a full path end-to-end

---

## 19. Explicitly out of scope (for now)

User accounts · comments · native mobile apps · paid tiers · community moderation tooling · native video content. All Tier 3, only after content proves itself.

---

## 20. Open questions

1. Final UI style (A/B/C in §12) — owner thinking
2. Domain: buy now or after MVP?
3. Instant mode first (recommended) vs AI mode first

---

*HELPINhex — "help in hex." Like a hex editor for the world of tech: everything, laid out, readable, decoded.*
