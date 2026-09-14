# 13 · Product variants (size × colour)

**Goal:** a product can have variants with their own SKU, price override and stock; storefront, cart, orders and the agent feed understand them.

**Preconditions:** `PROGRESS.md` → `[x] 10-checkout-orders`. Only run this if the owner actually sells variant goods (apparel, shoes…) — ask first.

## Steps

1. **Schema** migration: `product_variants` (`id`, `product_id`, `sku unique`, `options jsonb` e.g. `{"size":"M","color":"black"}`, `price null` (null = inherit), `stock`, `image null`, `is_active`). Keep `products.stock` as a generated/maintained sum **or** drop its use for variant products — pick one and document it in the migration header. Update `place_order` to accept `variant_id` and lock/deduct variant rows.
2. **Types/data**: `pnpm db:types`; `Variant` type; `lib/catalog.ts` gains `getVariants(productId)`; `listAllActiveProducts` returns variants nested so the feed and JSON-LD get them.
3. **PDP**: `src/components/ecom/VariantPicker.tsx` (daisyUI `btn-group`/`radio` per option axis; disabled when out of stock) that swaps price/stock/image and passes `variantId` to `AddToCart`. Cart items carry `variantId` + option label.
4. **JSON-LD**: `productSchema` emits `ProductGroup` with `hasVariant[]` when variants exist (schema.org 2024+ pattern), each variant a `Product` with its own `Offer`. Keep it in `geo-schema.ts`.
5. **Admin**: variant editor inside `ProductForm.tsx` — if the file nears 400 lines, split into `VariantEditor.tsx`. Generate a matrix from option values (sizes × colours) with one click; edit stock inline.
6. **Feed**: each product in `mcp-catalog.json` gets `variants: [{sku, options, price, stock, availability}]`.

## Verify

```bash
pnpm check && pnpm build
curl -s http://localhost:4321/api/v1/mcp-catalog.json | grep -c '"variants"'
```

Browser: pick size+colour → price/stock update → add → checkout → variant stock decrements; out-of-stock variant is disabled. Validator shows `ProductGroup` without errors.

## Done when

- Verify passes and no file exceeds 500 lines.
- Tick `- [ ] 13-variants` in `prompts/PROGRESS.md`.
- Next: `prompts/build/14-tests-ci.md`.
