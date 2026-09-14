# Agentic E-Commerce

Ultra-lightweight, open-source e-commerce built for **AI shopping agents** (agentic commerce), **Generative Engine Optimization** (GEO) and classic **SEO** — without giving up a fast, normal storefront for humans.

> This README doubles as the working spec for any AI coding agent touching the repo. Sections 6–8 are the rules; everything else is what exists today.

---

## 1. Goals & philosophy

- **Machine-first surfaces, human-first pages.** Every product page carries schema.org JSON-LD; a live catalog feed and `llms.txt` exist for agents; `robots.txt` explicitly admits AI crawlers.
- **Own as little code as possible.** Every UI primitive, auth flow, form control and storage concern is a maintained library. We write glue, not frameworks. If a ready-made package does the job, use it — never reinvent.
- **DRY, modular, small files.** Domain-based folders. Soft limit 400 lines per file, hard cap **500** (enforced by `pnpm check:lines`).
- **Secrets never touch the browser.** Uploads, service-role access and Hostinger credentials live behind server-side API routes.

## 2. Stack (what and why)

| Concern | Library | Why it's the "don't manage it" choice |
| --- | --- | --- |
| Framework / SSR | **Astro 7** (`output: 'server'`, Node adapter) | Islands = near-zero JS by default; SSR keeps price/stock live for agents. |
| Interactive islands | **React 19** via `@astrojs/react` | Only for cart, auth forms, admin forms. Everything else is `.astro`. |
| Styling | **Tailwind CSS 4** + **daisyUI 5** | daisyUI is a pure Tailwind plugin: `btn`, `card`, `navbar`, `drawer`, `table`… No component source copied into the repo, nothing to maintain, themeable via one CSS line. |
| Database + Auth | **Supabase** (`@supabase/supabase-js`, `@supabase/ssr`) | Postgres + RLS + email/password auth with built-in hCaptcha support. Cookie sessions so SSR and islands share one login. |
| Bot protection | **hCaptcha** (`@hcaptcha/react-hcaptcha`) | Verified natively by Supabase Auth for login/register; verified server-side by us for the inquiry endpoint. |
| Client state | **nanostores** (+ `persistent`, `react`) | Astro's recommended cross-island store. Cart persists to `localStorage` in 3 lines. |
| Validation | **zod 4** | One schema each for admin product form and inquiry API. |
| Icons | **lucide-react** (islands) · **@lucide/astro** (`.astro`) · **lucide-static** (demo image generator) | One icon set everywhere |
| Fonts | **@fontsource-variable/inter**, **@fontsource-variable/fraunces** | Self-hosted, no Google Fonts request |
| Typed env | Astro's built-in `astro:env` | Validated at boot, split into client/server, secrets can't leak into the bundle. |

## 3. Run it (30 seconds, demo data)

```bash
git clone https://github.com/nasir-nishat/ecom && cd ecom
pnpm install
pnpm dev            # → http://localhost:4321  (or `pnpm demo` to force demo mode + open the browser)
```

No `.env`, no Docker, no Supabase. With no `PUBLIC_SUPABASE_ANON_KEY` the store boots in **demo mode**: 12 products from `src/data/demo-catalog.json`, cart works, `/admin` is open read-only, the agent feed and JSON-LD are live. A yellow **Demo data** badge reminds you nothing is persisted. In Claude Code just say **"run it"** (or `/demo`).

Demo → real is one step: fill `PUBLIC_SUPABASE_ANON_KEY` (prompt 01 below) and demo mode turns itself off. Force it with `PUBLIC_DEMO_MODE=on|off`.

## 3b. Set up *your* store — run the prompt library

The repo sets itself up. Clone it, open it in **Claude Code** (or any coding agent), and run the prompts in `prompts/` one at a time — each one does its slice, verifies it, ticks `prompts/PROGRESS.md`, and names the next.

```text
/next            # Claude Code: run the first unchecked prompt (start here on a new machine)
/run setup/03    # run a specific prompt
```

| # | Prompt | Outcome |
| --- | --- | --- |
| 00 | `setup/00-orientation` | toolchain checked, `pnpm install`, `pnpm check` green |
| 01 | `setup/01-local-supabase` | `supabase start` + `db reset`, `.env` filled, `pnpm dev` serves the seed |
| 02 | `setup/02-first-admin` | owner account with `is_admin`, `/admin` works |
| 03 | `setup/03-store-identity` | name · currency · daisyUI theme · favicon · footer |
| 04 | `setup/04-catalog` | real categories/products/images, seed removed |
| 05 | `setup/05-hcaptcha` | login/register/inquiry protected |
| 06 | `setup/06-media-storage` | `local` or `hostinger` driver verified end-to-end |
| 07 | `setup/07-agent-surfaces` | feed, JSON-LD, sitemap, robots, llms.txt validated |
| 10–15 | `build/*` | checkout & orders · inquiries · MCP tools · variants · tests/CI · deploy |

No agent? Every prompt is also a human runbook — follow its **Steps** and **Verify** sections. See `prompts/README.md`.

<details>
<summary>Manual equivalent of prompts 00–02</summary>

```bash
pnpm install
cp .env.example .env               # fill PUBLIC_SUPABASE_ANON_KEY after `supabase start`
supabase start                     # needs Docker/Colima; prints URL + anon key
supabase db reset                  # applies supabase/migrations/* then supabase/seed.sql
pnpm dev                           # http://localhost:4321
```

Register once at `/register`, then: `update public.profiles set is_admin = true where email = 'you@example.com';` and open `/admin`.

</details>

| Script | Purpose |
| --- | --- |
| `pnpm dev` / `pnpm build` / `pnpm preview` | Astro lifecycle (`dev` = demo mode until Supabase is configured) |
| `pnpm demo` | Force demo mode and open the browser |
| `pnpm check` | `astro check` (types) + line-limit guard |
| `pnpm check:lines` | Fail if any file in `src/`, `supabase/`, `scripts/` exceeds 500 lines |
| `pnpm db:reset` | Recreate local DB from migrations + seed |
| `pnpm db:types` | Regenerate `src/types/database.ts` from the local schema |

## 4. Project structure

```text
/
├── CLAUDE.md                  agent workflow + short-form rules (Claude Code reads it automatically)
├── .claude/commands/          /next and /run — drive the prompt library
├── prompts/
│   ├── PROGRESS.md            the setup checklist (state)
│   ├── setup/00…07            clone → running store on local Supabase
│   └── build/10…15            feature layers
├── public/                    static assets (favicon.svg, uploads/ for the local storage driver)
├── deploy/hostinger/
│   └── uploader.php           drop into Hostinger public_html — receives uploads from OUR server
├── scripts/check-lines.mjs    500-line guard
├── supabase/
│   ├── config.toml            local stack (analytics off for Colima; hCaptcha block ready)
│   ├── migrations/…_init.sql  profiles · categories · products · inquiries · RLS · grants
│   └── seed.sql               dev data only
└── src/
    ├── data/demo-catalog.json  12 demo products + 4 categories (images in public/demo/*.svg)
    ├── config/
    │   ├── constants.ts       SITE, ROUTES, PAGE_SIZE, MEDIA_* — the only place literals live
    │   └── storage.ts         STORAGE_CONFIG from env
    ├── lib/
    │   ├── supabase.ts        browser / per-request server / anon clients
    │   ├── supabase-admin.ts  service-role client (server-only module)
    │   ├── auth.ts            getViewer() → { user, profile, isAdmin }
    │   ├── catalog.ts         ALL product/category reads (pages, MCP feed, sitemap share it) — branches on demo
│   ├── admin.ts           admin reads (all products, stats) — branches on demo
│   ├── demo.ts            isDemoMode() + demo data access
    │   ├── storage-driver.ts  StorageDriver interface + Local / Hostinger drivers
    │   ├── geo-schema.ts      JSON-LD builders: Organization, WebSite, Product, Offer, FAQPage, Breadcrumb
    │   ├── captcha.ts         hCaptcha siteverify
    │   ├── format.ts          formatPrice()
    │   └── http.ts            json() / error() response helpers
    ├── stores/cart.ts         nanostores cart ($cart, addToCart, setQty…)
    ├── types/ecom.ts          Product, Category, CartItem, Inquiry, Profile
    ├── layouts/
    │   ├── BaseLayout.astro   <head> SEO/OG/canonical + JSON-LD slot, Header, Footer
    │   └── AdminLayout.astro  daisyUI drawer sidebar, noindex
    ├── components/
    │   ├── common/  Header · Footer · SchemaOrg · Captcha · AuthForm
    │   ├── ecom/    ProductCard · ProductGallery · AddToCart · CartDrawer
    │   └── admin/   ProductForm · MediaUploader
    ├── pages/
    │   ├── index.astro              landing (hero → USPs → categories → best sellers → promo → new arrivals → testimonials); any filter (?q= ?category= ?sale ?sort=) switches to <Browse>
    │   ├── product/[slug].astro     PDP with Product + FAQPage + Breadcrumb JSON-LD
    │   ├── login.astro · register.astro · 404.astro
    │   ├── admin/index.astro        KPI stats
    │   ├── admin/products.astro     list + create/edit (?new / ?id=)
    │   ├── api/v1/mcp-catalog.json.ts   agent catalog feed
    │   ├── api/upload.ts            admin-only media upload → storage driver
    │   ├── api/inquiry.ts           public contact/inquiry (zod + hCaptcha)
    │   ├── sitemap.xml.ts · robots.txt.ts · llms.txt.ts
    ├── middleware.ts          gates /admin/* and /api/upload behind profiles.is_admin
    ├── env.d.ts               App.Locals.viewer
    └── styles/global.css      tailwind + daisyUI custom theme "store" (sage/cream) + Inter/Fraunces (self-hosted via @fontsource)
```

## 5. Environment variables

See `.env.example`. Schema and defaults are declared in `astro.config.mjs` → `env.schema`; a missing required var fails at startup with a clear message.

| Var | Side | Notes |
| --- | --- | --- |
| `PUBLIC_SITE_URL` `PUBLIC_SITE_NAME` `PUBLIC_CURRENCY` | client | Canonical URLs, JSON-LD, price formatting |
| `PUBLIC_DEMO_MODE` | client | `auto` (default: demo when the anon key is empty) · `on` · `off` |
| `PUBLIC_SUPABASE_URL` `PUBLIC_SUPABASE_ANON_KEY` | client | Key empty ⇒ demo mode |
| `SUPABASE_SERVICE_ROLE_KEY` | server, secret | Optional. Only `lib/supabase-admin.ts` reads it |
| `PUBLIC_HCAPTCHA_SITE_KEY` / `HCAPTCHA_SECRET` | client / server | Optional. Forms work without them in dev; also set the secret in Supabase → Auth → Bot protection |
| `STORAGE_DRIVER` | server | `local` (default) or `hostinger` |
| `LOCAL_UPLOAD_DIR` | server | default `public/uploads` |
| `HOSTINGER_UPLOAD_ENDPOINT` `HOSTINGER_UPLOAD_SECRET` `HOSTINGER_BASE_URL` | server | Required when driver = `hostinger` |

## 6. Storage driver (local & Hostinger)

```text
browser (MediaUploader.tsx)
   └─POST /api/upload  ── middleware: must be admin
        └─ getStorageDriver()
             ├─ LocalStorageDriver     → writes LOCAL_UPLOAD_DIR, returns /uploads/<name>
             └─ HostingerStorageDriver → POST multipart to uploader.php with X-Upload-Secret
```

- The browser **never** holds the Hostinger secret (a deliberate change from the original sketch where the client posted it).
- `deploy/hostinger/uploader.php`: whitelist of extensions, random filenames, JSON responses. Set `UPLOAD_SECRET` in the PHP env or hard-code it and `chmod 600`.
- Adding a driver (S3, Supabase Storage…) = one class implementing `StorageDriver` + one `case` in `getStorageDriver()`.

## 7. AI-agent, GEO & SEO surfaces

| Surface | Where | Notes |
| --- | --- | --- |
| **Catalog feed** | `GET /api/v1/mcp-catalog.json` | `schema_version`, store metadata, endpoints, every active product with `sku`, `price`, `stock`, `availability`, `attributes`, canonical `url`. 60s cache. Bump `schema_version` on breaking changes. |
| **JSON-LD** | every page via `<SchemaOrg>` in `BaseLayout` | `Organization` + `WebSite` always; PDP adds `Product`/`Offer` (with `additionalProperty` from `attributes`), `FAQPage`, `BreadcrumbList`. All serialised as one `@graph`. |
| **llms.txt** | `/llms.txt` | Plain-language brief pointing agents to the feed |
| **robots.txt** | `/robots.txt` | Allows GPTBot / ClaudeBot / PerplexityBot; blocks `/admin`, `/api/upload` |
| **Sitemap** | `/sitemap.xml` | Dynamic (SSR product routes aren't visible to the static sitemap integration) |
| **Discovery** | `<link rel="alternate" type="application/json">` in `<head>` | Points at the catalog feed |

Roadmap for this layer: JSON-RPC `tools/list` + `tools/call` (`search_products`, `get_product`, `check_stock`, `create_inquiry`) on top of the same `lib/catalog.ts`, then a checkout intent endpoint.

## 8. Rules for contributors (human or AI)

1. **Never reinvent.** Need a UI element? daisyUI has it (`https://daisyui.com/components/`). Need a form/validation/state pattern? zod / nanostores. Only write a component when no maintained package fits, and say why in a comment.
2. **One source of truth.** Literals → `config/constants.ts`. Catalog reads → `lib/catalog.ts`. JSON-LD → `lib/geo-schema.ts`. Env → `astro:env` (never `import.meta.env` / `process.env` in `src/`).
3. **File size.** Split at ~400 lines. `pnpm check:lines` fails the build at 500.
4. **Server vs client.** Anything importing `astro:env/server`, `node:*`, or the service-role key lives in a server-only module and is never imported from a `.tsx` island.
5. **Security defaults.** New tables get RLS + explicit `grant`s in the same migration. Admin writes go through Supabase with `is_admin()` policies, not bespoke API routes. Public write endpoints validate with zod and call `verifyCaptcha`.
6. **Islands are the exception.** Default to `.astro`; add `client:load` React only for genuinely interactive UI.
7. **Keep types in sync.** After a schema change: `pnpm db:types`, then reconcile `types/ecom.ts`.

## 8b. Design system (where to change the look)

Reference: soft retail landing (sage + cream, serif display headings, rounded cards, no shadows).

| Want to change… | Edit only |
| --- | --- |
| Colours, radius, borders | `src/styles/global.css` → `@plugin "daisyui/theme" { name: "store" … }` (or swap for a built-in daisyUI theme) |
| Fonts | `global.css` `@import "@fontsource-variable/…"` + `--font-sans` / `--font-display` |
| Announcement bar, hero copy, USPs, promo, social links | `src/config/constants.ts` (`SITE`, `HERO`, `USPS`, `PROMO`) |
| Testimonials | `src/data/testimonials.json` (sample content — replace with real quotes or empty the array to hide the section) |
| Section order on the landing page | `src/pages/index.astro` |
| Category icons/tints | `src/components/home/CategoryCircles.astro` (`ICONS`, `TINTS`) |

Ratings shown on cards/PDP come from `products.rating` / `review_count` (aggregate only — no fabricated review text) and feed `AggregateRating` JSON-LD.

## 9. Database

`supabase/migrations/20260914000000_init.sql`:

- `profiles` (1:1 `auth.users`, `is_admin`) auto-created by trigger; `is_admin()` helper (security definer).
- `categories` (tree via `parent_id`), `products` (slug, sku, price, `compare_at_price`, stock, `images text[]`, `attributes jsonb`, `faqs jsonb`, generated `search tsvector` + GIN index, `updated_at` trigger), `inquiries`.
- RLS: public read of active products/categories; admins full write; anyone can insert an inquiry, only admins read them. Grants included (PostgREST needs both).

## 10. Deploy

- **App:** any Node host (`pnpm build` → `node dist/server/entry.mjs`), Vercel/Netlify via their Astro adapters (swap `@astrojs/node`), or a VPS. Set `PUBLIC_SITE_URL` to the real domain.
- **Database:** hosted Supabase → `supabase link` + `supabase db push` (never run `seed.sql` in production). Enable hCaptcha under Auth → Bot protection.
- **Media:** `STORAGE_DRIVER=hostinger` + upload `deploy/hostinger/uploader.php`; or keep `local` on a VPS with a persistent `LOCAL_UPLOAD_DIR`.

## 11. Status

### Layer 1 verification (2026-09-14)

| Area | Verified | How | Not yet |
| --- | --- | --- | --- |
| Types, line guard, build | ✅ | `pnpm check` 0 errors · `pnpm build` complete (also with **no `.env`**) | — |
| **Demo mode** (client + admin, no Supabase) | ✅ | Built server, no `.env`: `/` 200 with 12 cards, PDP 200 with Product/Offer/FAQ JSON-LD, unknown slug 404, `/admin` + `/admin/products` + edit 200, search + category filter, sitemap, feed 12 products, upload → 503, inquiry → 202 demo | — |
| Client site | ◑ | Built server curl-tested: `/login` `/register` `/404` `/robots.txt` `/llms.txt` render; JSON-LD, React islands, daisyUI CSS present | Home + PDP against a live DB (`prompts/setup/01`) |
| Admin panel | ◑ | Middleware: guest `/admin` → 302 `/login?next=`, guest `POST /api/upload` → 403 | Signed-in dashboard + product CRUD (`prompts/setup/02`) |
| Supabase | ◑ | Migration + seed applied in a rolled-back transaction on a live Postgres; RLS checked as `anon` (reads products, can insert inquiry, cannot read inquiries or write products) | `supabase start` + `db reset` on this repo (`prompts/setup/01`) |
| Storage drivers | ○ | Compiles; middleware gate verified | Real upload via `local` and `hostinger` (`prompts/setup/06`) |
| hCaptcha | ○ | Compiles; falls through when keys unset | Keys + Supabase Auth config (`prompts/setup/05`) |

✅ verified · ◑ partially · ○ code only. Everything in "Not yet" is covered by a setup prompt — run `/next` and this table gets completed by the prompts' Verify steps.

### Layers

- [x] **Layer 1** — demo mode (clone → `pnpm dev`), scaffold, typed env, daisyUI, Supabase auth + RLS schema, catalog + PDP, cart, admin products CRUD, media upload drivers, JSON-LD, catalog feed, sitemap/robots/llms.txt, 500-line guard, prompt library.
- [ ] `prompts/build/10-checkout-orders` — orders schema, `place_order` RPC, checkout, admin orders
- [ ] `prompts/build/11-inquiries` — inquiry form on PDP + contact page, admin inquiries
- [ ] `prompts/build/12-mcp-tools` — JSON-RPC `tools/list` / `tools/call`
- [ ] `prompts/build/13-variants` — size × colour variants, `ProductGroup` JSON-LD
- [ ] `prompts/build/14-tests-ci` — Playwright + GitHub Actions
- [ ] `prompts/build/15-deploy` — hosted Supabase, production host, domain

Adding a feature = adding a prompt (`prompts/_TEMPLATE.md`) and running it. The prompt is the spec; the code is the truth.
