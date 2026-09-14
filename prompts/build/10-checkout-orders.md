# 10 · Checkout & orders

**Goal:** a customer (guest or signed in) can place an order from the cart; stock is deducted atomically; the owner sees and updates orders in admin.

**Preconditions:** `PROGRESS.md` → setup `[x] 00`–`[x] 07`. Read README §8 before writing code.

## Steps

1. **Schema** — new migration `supabase/migrations/<timestamp>_orders.sql`:
   - `orders` (`id`, `user_id null`, `email`, `phone`, `shipping_address jsonb`, `status` enum `pending|paid|packed|shipped|delivered|cancelled`, `subtotal`, `currency`, `note`, `idempotency_key unique`, timestamps)
   - `order_items` (`order_id`, `product_id`, `title`, `sku`, `unit_price`, `qty`) — snapshot title/price at purchase time.
   - RPC `place_order(payload jsonb, idempotency_key text) returns orders` — `security definer`; locks product rows (`select … for update`), rejects if `stock < qty` with a clear message, deducts, inserts order + items in one transaction, replays idempotently.
   - RLS: owner reads own orders (`user_id = auth.uid()`); admins read/update all; nobody inserts directly (only via RPC). Grants for `anon, authenticated` on `execute function place_order`.
2. **Types** — `pnpm db:types`, then add `Order`, `OrderItem`, `OrderStatus` to `src/types/ecom.ts`.
3. **Data layer** — `src/lib/orders.ts`: `placeOrder()`, `listOrders()`, `getOrder()`, `updateOrderStatus()`. Pages never call Supabase for orders directly.
4. **Storefront** — `src/pages/checkout.astro` + island `src/components/ecom/CheckoutForm.tsx`: reads `$cart`, zod-validates name/email/phone/address, includes `<Captcha>`, posts to a new `src/pages/api/orders.ts` (verifies captcha via `lib/captcha.ts`, calls `placeOrder`), clears the cart, redirects to `/order/[id]` (status timeline using daisyUI `steps`). Guest orders allowed; if signed in, attach `user_id`.
5. **Admin** — `src/pages/admin/orders.astro` (daisyUI `table`, status `badge`, filter by status) and `src/pages/admin/orders/[id].astro` with a status `select` that calls `updateOrderStatus`. Add "Orders" to `AdminLayout` nav and an "Orders today" tile on the dashboard.
6. **Agent feed** — add `endpoints.order` (`POST /api/orders`, field list) to `mcp-catalog.json.ts` so agents can discover checkout.
7. Payment is **out of scope** here: orders are created `pending`; owner marks `paid`. Do not add a payment SDK in this prompt.

## Verify

```bash
pnpm check && pnpm build
# oversell is rejected, stock never negative (run in psql)
#   select place_order('{"items":[{"product_id":"<id>","qty":99999}], "email":"a@b.c", ...}'::jsonb, 'k1');  → ERROR "Insufficient stock…"
# same key twice returns the same order id (idempotent)
```

Browser: add 2 items → checkout → order page shows items + "Pending"; admin → orders → change to "Shipped" → customer page reflects it. Stock on the PDP dropped by the ordered qty.

## Done when

- All checks pass, no file > 500 lines, RLS verified (`set local role anon; select * from orders;` → 0 rows).
- Tick `- [ ] 10-checkout-orders` in `prompts/PROGRESS.md`.
- Next: `prompts/build/11-inquiries.md`.
