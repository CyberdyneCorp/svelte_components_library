## Why

`@cyberdynecorp/svelte-ui-core@0.8.0` shipped 1326 of its 2920 files as compiled tests, stories and `_testdata`, because `files` was just `dist`. This nearly doubled the tarball (726 KB packed, 3.8 MB unpacked). It also published modules such as `token-coverage.test.js`, which imports `node:fs` and would break a browser bundle if anything imported it.

## What Changes

- Core `files` excludes `dist/**/*.test.*`, `dist/**/*.stories.*` and `dist/_testdata`. The package drops to 1603 files (457 KB packed, 2.0 MB unpacked).
- New `scripts/check-package-contents.mjs` (`pnpm check:package`), run in the PR test job after `pnpm build`. It fails if the pack would contain test, story or test-data files, or if a shipped module imports a relative path that is not shipped.

## Impact

- `@cyberdynecorp/svelte-ui-core`: patch. There are no runtime changes; consumers only stop receiving non-runtime files.
