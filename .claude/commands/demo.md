---
description: "Run it" — start the store instantly with demo data (no Supabase, no .env needed)
---
The user wants to see the store running right now. Do exactly this, nothing more:

1. `pnpm install` (skip if `node_modules` exists). If pnpm is missing: `corepack enable`.
2. Do **not** create or edit `.env`. Demo mode switches on by itself when `PUBLIC_SUPABASE_ANON_KEY` is empty (`src/lib/demo.ts`).
3. Start `pnpm dev` in the background and wait until it prints the local URL (default http://localhost:4321).
4. Smoke-check with curl and report the real results: `/` (200, 12 product cards), `/product/field-watch-steel` (200, JSON-LD), `/admin` (200, read-only), `/api/v1/mcp-catalog.json` (12 products).
5. Tell the user: the URL, that the yellow **Demo data** badge means nothing is persisted, that `/admin` is open read-only, and that `/next` starts the real setup (`prompts/setup/00`) when they want their own store.

Do not start Supabase, Docker, or any prompt from `prompts/` unless asked.
