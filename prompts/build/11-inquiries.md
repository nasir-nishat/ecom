# 11 · Inquiries (contact + ask-about-product)

**Goal:** customers can ask a question from any product page or a contact page; the owner reads and resolves them in admin.

**Preconditions:** `PROGRESS.md` → `[x] 07-agent-surfaces`. The API already exists: `src/pages/api/inquiry.ts` (zod + hCaptcha → `inquiries` table).

## Steps

1. **Island** `src/components/ecom/InquiryForm.tsx` (props: `productId?`): name, email, message, `<Captcha>`, posts JSON to `/api/inquiry`, shows daisyUI `alert` on success/error. One component reused in both places below.
2. **PDP** — under the FAQ block in `src/pages/product/[slug].astro`, a `collapse` titled "Ask about this product" containing the form with `productId`.
3. **Contact page** `src/pages/contact.astro` using `BaseLayout` + the form. Link it from `Footer.astro`.
4. **Admin** `src/pages/admin/inquiries.astro`: table (date, name, email, product link, message excerpt), `resolved` toggle. Add a `resolved boolean default false` column via a new migration; RLS already restricts reads to admins — add an admin `update` policy.
5. **Dashboard** — "Open inquiries" tile replaces the plain count.
6. Optional email notification is a later concern; do **not** wire SMTP here.

## Verify

```bash
pnpm check && pnpm build
curl -s -X POST http://localhost:4321/api/inquiry -H 'content-type: application/json' \
  -d '{"name":"t","email":"t@t.io","message":"hello there"}'   # 403 captcha (or 201 when captcha unset in dev)
```

Browser: submit from a PDP with captcha → success alert → appears in `/admin/inquiries` with the product linked → mark resolved.

## Done when

- Verify passes.
- Tick `- [ ] 11-inquiries` in `prompts/PROGRESS.md`.
- Next: `prompts/build/12-mcp-tools.md`.
