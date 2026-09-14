# Agentic E-Commerce — agent guide

`README.md` is the spec; **§8 "Rules for contributors" is binding**. This file only adds the workflow.

## "Run it" = demo mode, instantly

When the user says anything like **"run it"**, "start it", "show me the store", "demo": follow `.claude/commands/demo.md` (`/demo`). That is `pnpm install && pnpm dev` — no `.env`, no Supabase, no Docker. Demo mode (`src/lib/demo.ts`) is on automatically while `PUBLIC_SUPABASE_ANON_KEY` is empty; data comes from `src/data/demo-catalog.json`, writes are accepted but not persisted, `/admin` is open read-only, a yellow **Demo data** badge shows in the header. Only start the prompt library when they want *their* store.

## Setting up or extending the store = run the prompt library

- `prompts/PROGRESS.md` is the state. `prompts/setup/*` gets a clone to a running store on the local Supabase stack; `prompts/build/*` adds features.
- `/next` → execute the first unchecked prompt in `PROGRESS.md`. `/run setup/03` → a specific one.
- A prompt is finished only when its **Verify** section passes; then tick its line in `PROGRESS.md` and stop — tell the user what to run next. Never tick ahead, never skip Verify.
- If a prompt's Steps and the code disagree, the **code is the truth** — fix the prompt.
- If a prompt turns out to need a decision the user must make (real credentials, which storage driver, whether they sell variants), ask before proceeding.

## Non-negotiables (from README §8, short form)

1. Ready-made libraries over custom code: daisyUI for UI, zod for validation, nanostores for state, Supabase for auth/db, `astro:env` for config.
2. One source of truth: `src/config/constants.ts`, `src/lib/catalog.ts` (+ `lib/admin.ts` for admin reads), `src/lib/geo-schema.ts`. Every data read must branch on `isDemoMode()` so demo never breaks. No `import.meta.env`/`process.env` in `src/`.
3. Files: split at ~400 lines; `pnpm check` fails at 500.
4. Nothing importing `astro:env/server` or `node:*` may be reachable from a `.tsx` island.
5. New tables ship with RLS + grants in the same migration. Public write endpoints validate with zod and call `verifyCaptcha`.
6. Default to `.astro`; React islands only for real interactivity.

## Commands

`pnpm dev` · `pnpm check` (types + line guard) · `pnpm build` · `pnpm db:reset` · `pnpm db:types` · `supabase start|stop|status`

## Local stack facts

Supabase API `http://127.0.0.1:54321`, Studio `:54323`, mail inbox `:54324`. DB container `supabase_db_agentic-ecom`; psql via `docker exec -i supabase_db_agentic-ecom psql -U postgres -d postgres`. `[analytics]` is disabled in `supabase/config.toml` (Colima); leave it.
