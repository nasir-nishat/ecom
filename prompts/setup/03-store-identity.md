# 03 · Store identity

**Goal:** the storefront carries the real store name, currency, colours and favicon — no "Agentic Store" placeholders left.

**Preconditions:** `PROGRESS.md` → `[x] 02-first-admin`.

## Steps

Ask the user for each value below, then apply it **in the one place it lives** (README §8 rule 2):

| Ask | Where it goes |
| --- | --- |
| Store name | `.env` → `PUBLIC_SITE_NAME` (also `.env.example` default if this repo is theirs) |
| One-line description (≤160 chars, used for meta description + JSON-LD) | `src/config/constants.ts` → `SITE.description` |
| Currency (ISO 4217, e.g. `BDT`, `USD`) | `.env` → `PUBLIC_CURRENCY` **and** `supabase/migrations/…_init.sql` products `currency` default (add a new migration if the DB already exists) |
| Public URL (can be the future domain) | `.env` → `PUBLIC_SITE_URL` |
| Brand colours | `src/styles/global.css` → the `@plugin "daisyui/theme" { name: "store" … }` block: change `--color-primary`, `--color-secondary`, `--color-base-200/300` (use https://daisyui.com/theme-generator/). Or replace the block with a built-in theme. Never write ad-hoc CSS for colours. |
| Fonts | `global.css` — swap the two `@fontsource-variable/*` imports (`pnpm add @fontsource-variable/<font>`) and `--font-sans` / `--font-display` |
| Announcement bar, hero headline/subtitle/CTAs, trust strip (USPs), promo banner copy | `src/config/constants.ts` → `SITE.announcement`, `HERO`, `USPS`, `PROMO` |
| Testimonials | `src/data/testimonials.json` — real quotes only, or `[]` to hide the section |
| Favicon | Replace `public/favicon.svg` (SVG only; keep the same filename). |
| Footer copy / links | `src/components/common/Footer.astro` |

Do **not** add a logo image component, a theme switcher, or a settings table for these — env + constants is the whole mechanism at this stage.

## Verify

```bash
pnpm check                                                     # green
curl -s http://localhost:4321/ | grep -o '<title>[^<]*'          # new store name
curl -s http://localhost:4321/product/classic-tee-black \
  | grep -o '"priceCurrency":"[A-Z]*"'                           # new currency
```

Open the home page at 390 px and 1280 px wide: header, product cards and footer use the chosen theme; no horizontal scroll.

## Done when

- Verify passes and the user approves the look.
- Tick `- [ ] 03-store-identity` in `prompts/PROGRESS.md`.
- Next: `prompts/setup/04-catalog.md`.
