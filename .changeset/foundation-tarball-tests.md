---
"@cyberdynecorp/svelte-ui-foundation": patch
---

Stop publishing test files. 0.4.0 and 0.5.0 shipped `*.test.ts` because `pnpm publish` ignored the nested `files` negation; `files` now uses a form pnpm honours, and `pnpm check:package` packs with pnpm and checks foundation as well as core.
