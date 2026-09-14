# 12 · MCP-style JSON-RPC tools for agents

**Goal:** AI agents can call the store as tools — search, fetch, stock check, inquire (and order, if prompt 10 is done) — via one JSON-RPC 2.0 endpoint, reusing the existing data layer.

**Preconditions:** `PROGRESS.md` → `[x] 07-agent-surfaces` (and ideally `[x] 10`, `[x] 11`).

## Steps

1. Use a maintained JSON-RPC/MCP server package rather than parsing by hand — first choice `@modelcontextprotocol/sdk` (Streamable HTTP transport) mounted at `src/pages/api/v1/mcp.ts`; if its server transport doesn't fit Astro's `Request`/`Response` cleanly, fall back to a minimal JSON-RPC 2.0 handler with `zod` schemas (still no bespoke protocol).
2. Tools (thin wrappers only — logic stays in `src/lib/*`):
   - `search_products {query?, category?, page?}` → `lib/catalog.listProducts`
   - `get_product {slug | sku}` → `lib/catalog.getProductBySlug` (+ a `getProductBySku` you add to the same file)
   - `check_stock {sku[]}` → one query, returns `{sku, stock, availability}`
   - `create_inquiry {name,email,message,product_id?}` → same validation as `api/inquiry.ts` (extract the zod schema + insert into `src/lib/inquiries.ts` so both routes share it)
   - `place_order {...}` only if prompt 10 exists → `lib/orders.placeOrder`
3. Each tool has a JSON Schema `inputSchema` and a one-paragraph description written for an LLM (what it returns, units, currency).
4. Rate-limit and captcha: read-only tools are open; write tools (`create_inquiry`, `place_order`) require an `X-Agent-Key` header checked against `AGENT_API_KEYS` (comma-separated, `astro:env/server`, optional) **or** a captcha token — document both in the feed.
5. Discovery: add `endpoints.mcp` to `mcp-catalog.json.ts` and a line to `llms.txt.ts`; add `/.well-known/mcp.json`-style pointer only if the SDK version you use documents it.

## Verify

```bash
B=http://localhost:4321/api/v1/mcp
curl -s $B -H 'content-type: application/json' -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | head -c 400
curl -s $B -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"search_products","arguments":{"query":"tee"}}}' | head -c 400
```

Then connect a real client (Claude Desktop / Claude Code `claude mcp add --transport http store $B`) and ask it to find a product and check stock.

## Done when

- `tools/list` and a `tools/call` round-trip succeed from a real MCP client.
- Tick `- [ ] 12-mcp-tools` in `prompts/PROGRESS.md`.
- Next: `prompts/build/13-variants.md`.
