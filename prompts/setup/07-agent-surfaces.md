# 07 · Validate the AI-agent / GEO / SEO surfaces

**Goal:** every machine-readable surface (README §7) is correct against the *real* catalog before anyone shares the URL with agents or search engines.

**Preconditions:** `PROGRESS.md` → `[x] 06-media-storage`. `pnpm dev` running with the real catalog.

## Steps

1. **Catalog feed** `GET /api/v1/mcp-catalog.json`: every product has `sku`, `url`, `price.amount > 0`, `price.currency`, `stock`, `availability`, ≥1 image. `store.url` must be the public domain (`PUBLIC_SITE_URL`), not localhost, before deploy.
2. **JSON-LD**: fetch 3 product pages, extract the `<script type="application/ld+json">` block, and validate each with https://validator.schema.org (paste) or the Rich Results test after deploy. Expect `Organization`, `WebSite`, `Product` (+`Offer`), `BreadcrumbList`, and `FAQPage` when the product has FAQs. Fix data problems in the **catalog**, and structural problems in `src/lib/geo-schema.ts` only.
3. **Sitemap / robots / llms.txt**: `/sitemap.xml` lists home + every active product with `lastmod`; `/robots.txt` allows `/`, blocks `/admin/`, points to the sitemap; `/llms.txt` names the store and links the feed.
4. **Head hygiene**: each page has one `<title>`, `<meta name="description">`, `<link rel="canonical">`, OG tags, and `<link rel="alternate" type="application/json">` to the feed. Admin/login/register carry `noindex`.
5. If anything in this list requires a code change, keep it inside `src/lib/geo-schema.ts`, `src/layouts/BaseLayout.astro`, or the relevant `src/pages/*.ts` endpoint — one source of truth each.

## Verify

```bash
B=http://localhost:4321
curl -s $B/api/v1/mcp-catalog.json | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const j=JSON.parse(s);console.log("feed ok:",j.schema_version,j.products.length,"products")})'
curl -s $B/sitemap.xml | grep -c '<url>'                          # = products + 1
curl -s $B/robots.txt | grep -c 'Sitemap:'                        # 1
curl -s $B/llms.txt | head -3
SLUG=$(curl -s $B/api/v1/mcp-catalog.json | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s).products[0].url.split("/").pop()))')
curl -s $B/product/$SLUG | grep -o '"@type":"[A-Za-z]*"' | sort | uniq -c   # Organization, WebSite, Product, Offer, Brand?, BreadcrumbList, ListItem, FAQPage?
```

## Done when

- Validator shows 0 errors for the sampled pages; counts match.
- Tick `- [ ] 07-agent-surfaces` in `prompts/PROGRESS.md`.
- **Setup is complete.** Continue with `prompts/build/10-checkout-orders.md` when the owner wants online ordering, or `15-deploy.md` to publish the catalog-only store.
