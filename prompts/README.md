# Prompt library

This folder turns the repo into a **self-setting-up store**. Each file is a prompt you hand to an AI coding agent (Claude Code, Cursor, Codex…). Run them **in order**; every prompt verifies its own result and tells you which one comes next.

```text
prompts/
├── PROGRESS.md        ← the checklist. The agent ticks a box only after "Verify" passes.
├── setup/             ← clone → running store on the LOCAL Supabase stack (run once per machine)
│   ├── 00-orientation.md
│   ├── 01-local-supabase.md
│   ├── 02-first-admin.md
│   ├── 03-store-identity.md
│   ├── 04-catalog.md
│   ├── 05-hcaptcha.md
│   ├── 06-media-storage.md
│   └── 07-agent-surfaces.md
└── build/             ← feature layers from README §11 (run when you want the feature)
    ├── 10-checkout-orders.md
    ├── 11-inquiries.md
    ├── 12-mcp-tools.md
    ├── 13-variants.md
    ├── 14-tests-ci.md
    └── 15-deploy.md
```

## How to run

**Claude Code** (recommended):

```text
/next            # runs the first unchecked prompt in PROGRESS.md, verifies, ticks it
/run setup/03    # runs a specific prompt
```

**Any other agent:** paste the contents of the prompt file as your message. Say "continue with the next prompt" when it finishes.

**Human, no agent:** every prompt is also a plain runbook — follow "Steps" and "Verify" yourself.

## Prompt anatomy

Every prompt has the same five sections so the agent never guesses:

| Section | Meaning |
| --- | --- |
| **Goal** | One sentence. |
| **Preconditions** | Which earlier prompts must be ticked in `PROGRESS.md`. |
| **Steps** | What to do. Prefer existing scripts/libraries; never reinvent. |
| **Verify** | Commands + expected output. Nothing is "done" without this. |
| **Done when** | The exact `PROGRESS.md` line to tick, and the next prompt to run. |

## Writing a new prompt

Copy `_TEMPLATE.md`, number it into the right series, add a line to `PROGRESS.md`. Keep every prompt under ~120 lines; if it grows, split it. Reference code by path, not by pasting it — the code is the source of truth, prompts describe intent + verification.
