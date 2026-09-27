---
"@cyberdynecorp/svelte-ui-foundation": patch
---

Stop publishing `themes/calm.test.ts` and `theme/themePreference.test.ts`. pnpm ignored the `files` negation under the bare `src/lib` entry, so the package now lists explicit css/ts globs.
