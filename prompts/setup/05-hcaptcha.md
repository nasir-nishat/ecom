# 05 · hCaptcha

**Goal:** login, register and the inquiry API reject requests without a valid hCaptcha token.

**Preconditions:** `PROGRESS.md` → `[x] 04-catalog`. Stack running.

## Steps

1. The user creates a site at https://dashboard.hcaptcha.com → *New site*, hostnames `localhost` + the real domain. Ask them for the **site key** and **secret**. (For dev-only, hCaptcha's test keys `10000000-ffff-ffff-ffff-000000000001` / `0x0000000000000000000000000000000000000000` always pass.)
2. `.env`:
   ```env
   PUBLIC_HCAPTCHA_SITE_KEY=<site key>
   HCAPTCHA_SECRET=<secret>
   ```
   `src/components/common/Captcha.tsx` renders the widget automatically once the site key is set — no code change.
3. Supabase Auth must verify the same secret for `signInWithPassword` / `signUp`:
   - `supabase/.env` (gitignored): `HCAPTCHA_SECRET=<secret>`
   - `supabase/config.toml` → `[auth.captcha]`: set `enabled = true` and uncomment `secret = "env(HCAPTCHA_SECRET)"`.
   - `supabase stop && supabase start` to reload config.
4. The inquiry endpoint (`src/pages/api/inquiry.ts`) verifies via `lib/captcha.ts` and needs nothing else.

## Verify

```bash
# no token → rejected by our endpoint
curl -s -X POST http://localhost:4321/api/inquiry -H 'content-type: application/json' \
  -d '{"name":"t","email":"t@t.io","message":"hello there"}'          # → {"error":"Captcha failed"}

# Supabase rejects a login without a token
curl -s -X POST "http://127.0.0.1:54321/auth/v1/token?grant_type=password" \
  -H "apikey: $PUBLIC_SUPABASE_ANON_KEY" -H 'content-type: application/json' \
  -d '{"email":"owner@example.com","password":"wrong"}' | grep -io 'captcha'   # → captcha
```

In the browser: `/login` shows the widget; solving it and signing in works; `/register` likewise.

## Done when

- Both curls reject and browser login with captcha succeeds.
- Tick `- [ ] 05-hcaptcha` in `prompts/PROGRESS.md`.
- Next: `prompts/setup/06-media-storage.md`.
