## Why

`@cyberdynecorp/svelte-ui-foundation@0.4.0` and `0.5.0` shipped their Vitest files (`presets.test.ts`, `style-tokens.test.ts`, `themePreference.test.ts`). The `files` field said `"src/lib", "!src/lib/**/*.test.ts"`, but `changeset publish` runs `pnpm publish`, and pnpm 9 ignores a negation under a nested directory entry. `npm pack` honours it, so a check built on `npm pack` would have passed. The test files import `node:fs` and Vitest, so a bundler that globbed the package would break.

## What Changes

- Foundation `files` becomes `"src", "!src/**/*.test.ts", "!src/stories"`. pnpm honours negations under a top-level directory entry. The tarball is back to its 30 runtime files, with every theme preset included.
- `pnpm check:package` now packs with `pnpm pack`, the tool that publishes, and checks both core and foundation. Each tarball must contain every file its `exports` map points at, no test, story or test-data files, and no module importing a relative path that is not shipped. A `./x.js` specifier also resolves to a shipped `./x.ts`.

## Impact

- `@cyberdynecorp/svelte-ui-foundation`: patch. There are no runtime changes; consumers only stop receiving test files.
