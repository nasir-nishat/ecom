---
description: Run a specific prompt, e.g. /run setup/03 or /run build/12
argument-hint: <series>/<NN>
---
Run the prompt matching `prompts/$ARGUMENTS-*.md` (e.g. `/run setup/03` → `prompts/setup/03-store-identity.md`).

Follow exactly the same procedure as `/next`: read `CLAUDE.md` + the prompt, check Preconditions (warn if unmet but continue when the user insists), execute Steps, run **Verify** and show output, and tick the matching line in `prompts/PROGRESS.md` only when Verify passes. If the prompt was already ticked, treat this as a re-run: verify again and report drift.
