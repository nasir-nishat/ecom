# 00 · Orientation & toolchain

**Goal:** a fresh clone installs cleanly and `pnpm check` is green before anything else is touched.

**Preconditions:** none — this is the first prompt.

## Steps

1. Read `README.md` fully, especially §8 *Rules for contributors*. You will be held to them in every later prompt.
2. Check the toolchain and report versions. Install anything missing with Homebrew (macOS) or the official installer:
   - Node ≥ 22.12 (`node -v`)
   - pnpm ≥ 10 (`pnpm -v`; `corepack enable` if missing)
   - Supabase CLI ≥ 2.100 (`supabase --version`; `brew install supabase/tap/supabase`)
   - A container runtime for Supabase: Docker Desktop **or** `brew install colima docker && colima start`
3. `pnpm install`. If pnpm complains about ignored build scripts, the allowlist is `pnpm-workspace.yaml → allowBuilds` (pnpm 11 syntax) — do not switch package managers.
4. `cp .env.example .env`. Leave `PUBLIC_SUPABASE_ANON_KEY` empty for now (that keeps demo mode on); prompt 01 fills it.
5. Open `prompts/PROGRESS.md` and confirm nothing is ticked yet (or resume from the first unticked line).

## Verify

```bash
pnpm check                 # → "Result … 0 errors" and "✓ all files under the line limit"
pnpm build                 # → "[build] Complete!"
```

`pnpm dev` already works at this point — in **demo mode** (yellow *Demo data* badge, `src/data/demo-catalog.json`). Show it to the user so they see the target before wiring the real stack in prompt 01.

## Done when

- Both commands succeed.
- Tick `- [ ] 00-orientation` in `prompts/PROGRESS.md`.
- Next: `prompts/setup/01-local-supabase.md`.
