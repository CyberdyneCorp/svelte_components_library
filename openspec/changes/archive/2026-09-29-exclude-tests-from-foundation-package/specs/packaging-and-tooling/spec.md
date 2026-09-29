## MODIFIED Requirements

### Requirement: Monorepo package layout

The system SHALL define a pnpm workspace covering `packages/config/*` and `packages/ui/*`, publishing two packages: `@cyberdynecorp/svelte-ui-foundation` (private:false via `access: public`, ships raw `src/lib`, no build step, `svelte` field pointing at `./src/lib/index.ts`) and `@cyberdynecorp/svelte-ui-core` (ships compiled `dist`, `svelte` field `./dist/index.js`). Core SHALL depend on foundation via `workspace:*`. The foundation tarball SHALL contain only runtime source: its `files` field SHALL be `src` with `src/**/*.test.ts` and `src/stories` negated, a form `pnpm publish` honours. `pnpm check:package` SHALL inspect `pnpm pack` output for both packages. (src: pnpm-workspace.yaml:1-3; packages/ui/foundation/package.json; packages/ui/core/package.json:2-15,29-31; scripts/check-package-contents.mjs)

#### Scenario: Foundation ships raw source

- **WHEN** the foundation package is packed
- **THEN** the system SHALL include `src/lib` and point its `svelte`/`exports` entries at raw `./src/lib/*` files with no compiled `dist`

#### Scenario: Foundation tarball excludes tests and stories

- **GIVEN** the foundation package
- **WHEN** `pnpm check:package` inspects the output of `pnpm pack`
- **THEN** the system SHALL fail if any `.test.`, `.stories.` or `stories/` file would ship, if an `exports` target is missing from the tarball, or if a shipped module imports a relative path that is not shipped

#### Scenario: Core resolves foundation from the workspace

- **WHEN** core is installed in the workspace
- **THEN** the system SHALL resolve `@cyberdynecorp/svelte-ui-foundation` via the `workspace:*` protocol
