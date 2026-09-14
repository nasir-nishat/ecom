# Setup progress

Tick a box **only after that prompt's Verify section passes**. `/next` runs the first unchecked line.

## Setup (local Supabase stack)

- [ ] 00-orientation — toolchain checked, deps installed, `pnpm check` green
- [ ] 01-local-supabase — stack running, migrations + seed applied, `.env` filled
- [ ] 02-first-admin — an account exists with `is_admin = true`, `/admin` loads
- [ ] 03-store-identity — name, currency, theme, favicon, footer copy set
- [ ] 04-catalog — real categories + products entered, images uploaded
- [ ] 05-hcaptcha — keys configured in `.env` + Supabase, login/register/inquiry protected
- [ ] 06-media-storage — driver chosen (`local` or `hostinger`), upload verified end-to-end
- [ ] 07-agent-surfaces — catalog feed, JSON-LD, sitemap, robots, llms.txt validated

## Build layers (optional, in order)

- [ ] 10-checkout-orders — orders schema, `place_order` RPC, checkout page, admin orders
- [ ] 11-inquiries — inquiry form on PDP + contact page, admin inquiries list
- [ ] 12-mcp-tools — JSON-RPC `tools/list` + `tools/call` for agents
- [ ] 13-variants — size × colour variants with per-variant SKU/price/stock
- [ ] 14-tests-ci — Playwright smoke tests + GitHub Actions
- [ ] 15-deploy — hosted Supabase, production host, domain, env
