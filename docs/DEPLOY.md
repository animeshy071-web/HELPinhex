# Deploying HELPINhex to Firebase (project: `helpinhex`)

The site is static Astro output + one Firebase Function (`hexAsk`) that serves
keyless chatbot answers. Everything below runs from the repo root.

## 1. One-time setup

```bash
npm install -g firebase-tools
firebase login
```

Your `.firebaserc` already points at project **helpinhex**, and `firebase.json`
is preconfigured:

- **Hosting** serves `site/dist` (built automatically on deploy via predeploy)
- `/api/ask` rewrites to the `hexAsk` function
- **Functions** deploy from `functions/` (knowledge pack is rebuilt automatically on deploy)

> Note: Cloud Functions requires the **Blaze (pay-as-you-go) plan** on the project.
> The free tier included with Blaze covers this project's usage easily — the
> function only runs when someone asks HEX a question. Also enable
> **Cloud Build API** if the console asks.

## 2. Set the server key for the chatbot (one secret)

```bash
firebase functions:secrets:set OPENROUTER_KEY
# paste a free key from https://openrouter.ai/keys
```

The default function model is a **free, non-Gemini** OpenRouter model, grounded
entirely in the scraped knowledge pack — the model is just the voice.

## 3. Deploy

```bash
npm --prefix site install        # first time only
firebase deploy                  # builds the site, deploys hosting + function
```

Live at: `https://helpinhex.web.app` (also `https://helpinhex.firebaseapp.com`)

## 4. Flip the chatbot to keyless mode

After deploy, edit `site/public/hex-config.json`:

```json
{ "askUrl": "/api/ask" }
```

Commit + `firebase deploy` again. Now every visitor gets AI answers with **no
key needed** — the chat page detects the function automatically.

## 5. Keep it continuously fresh

`workflows/freshness.yml` scrapes GitHub / HN / Product Hunt / DEV.to /
Hugging Face / OpenRouter **every 6 hours** and commits new data.

To enable GitHub Actions automation, copy `workflows/freshness.yml` into
`.github/workflows/freshness.yml` on GitHub (or push with a personal access
token having `workflow` scope). To push the
fresh data live automatically, either:

- add a deploy hook: create `Firebase Hosting` release via CI, or simply run
  `firebase deploy --only hosting` on a schedule, or
- keep manual: whenever you want the newest data live, run `firebase deploy --only hosting`
  (data is already committed by the bot).

To let GitHub Actions deploy for you:
```bash
firebase login:ci   # then add the token as the FIREBASE_TOKEN secret in the repo
```

## Local development

```bash
cd site && npm run dev        # http://localhost:4321
node scrapers/run-all.mjs     # refresh scraped data + knowledge pack
```

Test the function locally with emulators:

```bash
npm --prefix functions install
firebase emulators:start      # hosting + function on :5000/:5001
```

## What runs where

| Piece | Runs | Feeds |
|---|---|---|
| `scrapers/run-all.mjs` | GitHub Actions, every 6h | `content/generated/*.json` |
| `scrapers/knowledge-pack.mjs` | after scrapers + every site build | `site/public/knowledge.json` + `functions/knowledge.json` |
| Astro static site | Firebase Hosting | everything |
| `hexAsk` function | Firebase Functions | keyless HEX answers, grounded in the knowledge pack |
