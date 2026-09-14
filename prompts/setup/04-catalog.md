# 04 · Real catalog

**Goal:** the seed products are gone and the store shows the owner's real categories and products with images.

**Preconditions:** `PROGRESS.md` → `[x] 03-store-identity`. Signed in as admin.

## Steps

1. Ask the user how the catalog arrives: **(a)** typed in by hand, **(b)** a CSV/XLSX/JSON they have, or **(c)** scraped from an existing site they own.
2. Categories first. There is no admin UI for categories yet — insert them via Studio (http://127.0.0.1:54323 → Table editor → `categories`) or one SQL `insert … on conflict (slug) do nothing`. Use `parent_id` for a tree.
3. Products:
   - **(a)** `/admin/products?new` — one form per product. `attributes` is free JSON (`{"color":"red","size":"M"}`) and feeds JSON-LD `additionalProperty` and the agent feed, so use consistent keys across products.
   - **(b)/(c)** Write a one-off import as `supabase/imports/<date>-products.sql` (a plain `insert` list — matches the pattern in `seed.sql`, casts included: `'{}'::text[]`, `'{…}'::jsonb`). Run it with `psql`. Do **not** add an import feature to the app for a one-time load.
4. Images: upload through the product form (`MediaUploader` → `/api/upload` → `public/uploads/` with the default `local` driver). Prefer WebP ≤ 300 KB; square or 4:5. For bulk, copy files into `public/uploads/` and reference `/uploads/<file>` in `images`.
5. Remove seed products: `delete from public.products where sku in ('TEE-BLK-M','TOTE-NAT');` and update `supabase/seed.sql` so a future `db reset` seeds *their* first few products instead.
6. Every product needs: unique `slug` (lowercase-dash), unique `sku`, `description` ≥ 10 chars, ≥ 1 image, correct `stock`. Add 2–3 `faqs` per product where the owner has real answers — they become `FAQPage` JSON-LD.

## Verify

```bash
curl -s http://localhost:4321/api/v1/mcp-catalog.json | node -e '
 let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const j=JSON.parse(s);
 const bad=j.products.filter(p=>!p.images.length||!p.description||p.price.amount<=0);
 console.log(j.products.length,"products;",bad.length,"incomplete", bad.map(p=>p.sku));})'
# → N products; 0 incomplete
```

Browse `/` and 3 random product pages: images load, prices formatted in the store currency, "In stock" reflects real numbers.

## Done when

- 0 incomplete products and no seed SKUs remain.
- Tick `- [ ] 04-catalog` in `prompts/PROGRESS.md`.
- Next: `prompts/setup/05-hcaptcha.md`.
