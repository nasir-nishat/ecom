# 15 · Deploy to production

**Goal:** the store is live on the owner's domain with a hosted Supabase project, secrets set server-side, and the agent surfaces pointing at the public URL.

**Preconditions:** `PROGRESS.md` → all setup `[x]`; build layers as desired. `pnpm build` green.

## Steps

1. **Hosted Supabase**: create a project → `supabase link --project-ref <ref>` → `supabase db push` (migrations only — **never** run `seed.sql` in prod). Auth → *Bot protection*: enable hCaptcha with the same secret. Auth → *URL configuration*: site URL + redirect = the real domain. Register the owner, then `update public.profiles set is_admin = true …` in the SQL editor.
2. **Catalog data**: export from local (`supabase db dump --data-only --local -f catalog.sql` filtered to `categories, products` [+ `product_variants`]) and import via psql to prod; or re-enter via admin. Media: if `local` driver, copy `public/uploads/` to the server's persistent `LOCAL_UPLOAD_DIR`; if `hostinger`, nothing to move.
3. **Host** — pick one, don't hand-roll:
   - **Node VPS**: `pnpm build && node dist/server/entry.mjs` under pm2/systemd behind Caddy/nginx (serve `/uploads` from `LOCAL_UPLOAD_DIR`).
   - **Vercel / Netlify / Cloudflare**: `pnpm astro add vercel|netlify|cloudflare` swaps the adapter; `LocalStorageDriver` then can't write to disk → use `hostinger` (or the future Supabase Storage driver).
4. **Env** on the host: everything in `.env.example` with production values; `PUBLIC_SITE_URL=https://<domain>`; `SUPABASE_SERVICE_ROLE_KEY` and `HCAPTCHA_SECRET` as *secrets*.
5. **DNS + TLS** via the host. Then re-run **prompt 07's Verify** against the live domain (`B=https://<domain>`), plus Google Rich Results test on one product URL.
6. Submit `https://<domain>/sitemap.xml` to Google Search Console and Bing Webmaster Tools.

## Verify

```bash
B=https://<domain>
curl -s -o /dev/null -w '%{http_code}\n' $B/                                  # 200
curl -s $B/api/v1/mcp-catalog.json | grep -o '"url":"https://[^"]*' | head -2   # public URLs, not localhost
curl -s -o /dev/null -w '%{http_code}\n' $B/admin                             # 302 → /login
```

## Done when

- Live checks pass; owner can sign in to `/admin` on the domain.
- Tick `- [ ] 15-deploy` in `prompts/PROGRESS.md`.
- Keep the loop going: new features = new prompt in `prompts/build/`, following `_TEMPLATE.md`.
