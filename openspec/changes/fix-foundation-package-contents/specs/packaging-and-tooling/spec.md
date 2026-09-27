## ADDED Requirements

### Requirement: Published tarballs contain only runtime files

The system SHALL verify the published contents of `@cyberdynecorp/svelte-ui-core` and `@cyberdynecorp/svelte-ui-foundation` by building each tarball with `pnpm pack`, the packer that `changeset publish` uses. Neither tarball SHALL contain `.test.`, `.stories.` or `_testdata` files, and every relative import in a shipped module SHALL resolve to a shipped file. Foundation's `files` field SHALL use explicit `src/lib/**/*.css` and `src/lib/**/*.ts` globs, because pnpm ignores negations under a bare directory entry. (src: scripts/check-package-contents.mjs; packages/ui/foundation/package.json)

#### Scenario: Foundation test file excluded

- **GIVEN** foundation source containing `src/lib/themes/calm.test.ts`
- **WHEN** `pnpm check:package` packs foundation with pnpm
- **THEN** the tarball SHALL NOT contain the test file, and the check SHALL fail if it does

#### Scenario: Both packages checked

- **WHEN** `pnpm check:package` runs after `pnpm build`
- **THEN** the system SHALL inspect both the core and the foundation tarballs and report per-package results
