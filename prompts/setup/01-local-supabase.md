# 01 · Local Supabase stack

**Goal:** Postgres + Auth + REST running locally with our schema and seed applied, and `.env` pointing at it.

**Preconditions:** `PROGRESS.md` → `[x] 00-orientation`. Container runtime running (`docker ps` works).

## Steps

1. Check nothing else owns the default ports: `docker ps --format '{{.Names}}' | grep supabase_`.
   If another project's containers appear (e.g. `supabase_db_<other>`), stop them with
   `supabase stop --project-id <other>` **or** change `[api] port`, `[db] port`, `[studio] port` in `supabase/config.toml`. Ask the user before stopping someone else's stack.
2. `supabase start` — first run pulls images (a few minutes). `supabase/config.toml` already has `[analytics] enabled = false` (required under Colima) — leave it.
3. `supabase db reset` — applies `supabase/migrations/*` then `supabase/seed.sql`. Any SQL error here is a bug in the repo: fix the migration, don't hand-patch the DB.
4. `supabase status -o env` — copy the anon/publishable key into `.env` as `PUBLIC_SUPABASE_ANON_KEY` (this alone switches demo mode **off**; the *Demo data* badge disappears); keep `PUBLIC_SUPABASE_URL=http://127.0.0.1:54321`. Put the service-role key in `SUPABASE_SERVICE_ROLE_KEY` (server-only; never prefix with `PUBLIC_`).
5. `pnpm db:types` to generate `src/types/database.ts` from the live schema. Do not hand-edit that file.

## Verify

```bash
supabase status                                           # all services "running", API URL on :54321
curl -s "http://127.0.0.1:54321/rest/v1/products?select=title,stock" \
  -H "apikey: $PUBLIC_SUPABASE_ANON_KEY"                  # → 2 seeded products as JSON
pnpm dev &  sleep 4
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:4321/                     # 200
curl -s http://localhost:4321/ | grep -c 'Demo data'                                # 0  (demo mode is off)
curl -s http://localhost:4321/product/classic-tee-black | grep -c 'application/ld+json'  # ≥ 1
curl -s http://localhost:4321/api/v1/mcp-catalog.json | head -c 300               # JSON with "schema_version"
```

Studio is at http://127.0.0.1:54323, local mail inbox (auth emails) at http://127.0.0.1:54324.

## Done when

- Verify passes and the home page shows the two seeded products.
- Tick `- [ ] 01-local-supabase` in `prompts/PROGRESS.md`.
- Next: `prompts/setup/02-first-admin.md`.
