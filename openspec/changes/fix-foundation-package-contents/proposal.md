## Why

`@cyberdynecorp/svelte-ui-foundation@0.4.0` shipped `src/lib/themes/calm.test.ts` and `src/lib/theme/themePreference.test.ts`, even though `files` listed `!src/lib/**/*.test.ts`. `changeset publish` packs with pnpm, and pnpm ignores a negation that sits under a bare directory entry (`"src/lib"`). npm's packlist honours that negation, so `pnpm check:package` passed: it only inspected core, using `npm pack --dry-run`.

## What Changes

- Foundation `files` now lists explicit globs (`src/lib/**/*.css`, `src/lib/**/*.ts`) with the test negation. pnpm and npm both exclude the tests.
- `scripts/check-package-contents.mjs` now builds the real tarball with `pnpm pack` and checks both core and foundation. It fails on test, story or `_testdata` files, and on relative imports that don't resolve to a shipped file (`.js` specifiers may resolve to `.ts` sources).

## Impact

- `@cyberdynecorp/svelte-ui-foundation`: patch. The two test files are no longer published; there are no runtime changes.
