# 14 · Tests & CI

**Goal:** every push runs type checks, the line-limit guard, a production build and a browser smoke test of the money path.

**Preconditions:** `PROGRESS.md` → `[x] 07-agent-surfaces` (money-path test additionally needs `[x] 10`).

## Steps

1. `pnpm create playwright@latest` (TypeScript, `e2e/` folder, Chromium only, no GitHub Action from the wizard — we write ours). `playwright.config.ts` `webServer` runs `pnpm dev` against the local Supabase stack.
2. Tests in `e2e/` (keep each file focused):
   - `storefront.spec.ts`: home lists ≥1 `[data-testid=product-card]`; PDP has `application/ld+json`; `/api/v1/mcp-catalog.json` returns `schema_version`.
   - `auth.spec.ts`: `/admin` redirects guests to `/login?next=`.
   - `checkout.spec.ts` (if prompt 10): add to cart → checkout → order page shows "Pending". Use existing `data-testid`s (`add-to-cart`, `product-card`); add `place-order` in `CheckoutForm.tsx`.
   - Captcha: tests run with `PUBLIC_HCAPTCHA_SITE_KEY` unset / hCaptcha test keys so forms pass.
3. `.github/workflows/ci.yml`: `pnpm install` → `pnpm check` → `pnpm build` → `supabase start` (uses `supabase/setup-cli` action) → `supabase db reset` → write `.env` from `supabase status -o env` → `pnpm exec playwright test`. Cache pnpm store + Playwright browsers.
4. Add `"test": "playwright test"` to `package.json` and a CI badge to the README.

## Verify

```bash
pnpm exec playwright test        # all green locally
git push                          # Actions run green
```

## Done when

- Local and CI both green.
- Tick `- [ ] 14-tests-ci` in `prompts/PROGRESS.md`.
- Next: `prompts/build/15-deploy.md`.
