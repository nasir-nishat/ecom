---
description: Run the next unchecked prompt from prompts/PROGRESS.md (setup or build)
---
Open `prompts/PROGRESS.md` and find the **first** line that is still `- [ ]`.

1. Map it to its file: `NN-slug` → `prompts/setup/NN-slug.md` for 00–07, `prompts/build/NN-slug.md` for 10+.
2. Read that prompt and `CLAUDE.md`. Check the prompt's **Preconditions** are ticked; if not, stop and say which one to run first.
3. Execute the **Steps**. Ask the user whenever a step needs a value or decision only they have (credentials, business choices). Follow README §8 for any code you write.
4. Run every command in **Verify** and show the real output. If something fails, fix the root cause (code, migration, or the prompt itself if it is wrong) and re-verify.
5. Only when Verify passes: change that line to `- [x]` in `prompts/PROGRESS.md`, summarise what changed, and name the next prompt. Do not start the next one.

If every line is already ticked, say so and suggest writing a new build prompt from `prompts/_TEMPLATE.md`.
