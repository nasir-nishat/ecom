# 02 · First admin account

**Goal:** the store owner can sign in and open `/admin`.

**Preconditions:** `PROGRESS.md` → `[x] 01-local-supabase`. `pnpm dev` running.

## Steps

1. Ask the user for the email + password they want for the owner account (min 8 chars). Do not invent credentials for a real store; for a throwaway dev box `owner@example.com / changeme-123` is fine.
2. Register at http://localhost:4321/register. Locally, Supabase auto-confirms and signs you in (`enable_confirmations = false` in `supabase/config.toml`), so the form redirects to `/`.
3. Promote the account. The `profiles` row was created automatically by the `on_auth_user_created` trigger:

   ```bash
   docker exec -i supabase_db_agentic-ecom psql -U postgres -d postgres \
     -c "update public.profiles set is_admin = true where email = 'owner@example.com' returning email, is_admin;"
   ```

   (Container name is `supabase_db_<project_id>`; `project_id` is the first line of `supabase/config.toml`.)
4. Reload http://localhost:4321/admin — the dashboard should render with three stat tiles.

## Verify

```bash
# signed-out request is redirected to login
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' http://localhost:4321/admin
# → 302 http://localhost:4321/login?next=%2Fadmin
```

In the browser, signed in: `/admin` → 200 with stats; `/admin/products` lists the 2 seeded products with **Edit** buttons.

## Done when

- The owner can open `/admin/products` and a signed-out request is redirected.
- Tick `- [ ] 02-first-admin` in `prompts/PROGRESS.md`.
- Next: `prompts/setup/03-store-identity.md`.
