# Packaging & Tooling

## Purpose

The repository is a pnpm-workspace monorepo publishing two packages — `@cyberdynecorp/svelte-ui-foundation` (design tokens, shipped as raw source) and `@cyberdynecorp/svelte-ui-core` (components, compiled with `svelte-package`) — to the GitHub Packages registry. Storybook is the development and documentation surface, Vitest and Playwright provide unit/story/visual testing, and Changesets drives versioning and release. This spec captures the build, packaging, documentation, testing, and release contracts.

## Requirements

### Requirement: Monorepo package layout

The system SHALL define a pnpm workspace covering `packages/config/*` and `packages/ui/*`, publishing two packages: `@cyberdynecorp/svelte-ui-foundation` (private:false via `access: public`, ships raw `src/lib`, no build step, `svelte` field pointing at `./src/lib/index.ts`) and `@cyberdynecorp/svelte-ui-core` (ships compiled `dist`, `svelte` field `./dist/index.js`). Core SHALL depend on foundation via `workspace:*`. (src: pnpm-workspace.yaml:1-3; packages/ui/foundation/package.json:2-23; packages/ui/core/package.json:2-15,29-31)

#### Scenario: Foundation ships raw source

- **WHEN** the foundation package is packed
- **THEN** the system SHALL include `src/lib` and point its `svelte`/`exports` entries at raw `./src/lib/*` files with no compiled `dist`

#### Scenario: Core resolves foundation from the workspace

- **WHEN** core is installed in the workspace
- **THEN** the system SHALL resolve `@cyberdynecorp/svelte-ui-foundation` via the `workspace:*` protocol

### Requirement: Cesium is an optional peer dependency of core

The system SHALL declare `cesium` (`^1.124.0`) as an optional peer dependency of core via `peerDependenciesMeta.cesium.optional = true`, so installing core without cesium SHALL NOT error. (src: packages/ui/core/package.json:20-28)

#### Scenario: Install without cesium

- **GIVEN** a consumer installing `@cyberdynecorp/svelte-ui-core` without cesium
- **WHEN** the package manager resolves peers
- **THEN** the system SHALL treat the missing cesium peer as satisfied

### Requirement: Recursive build with svelte-package

The system SHALL build all packages via the root `build` script `pnpm -r build`; core SHALL build with `svelte-package` producing `dist/index.js` and `dist/index.d.ts`, while foundation (having no `scripts`) SHALL be a no-op that ships raw source. (src: package.json:8; packages/ui/core/package.json:16-19)

#### Scenario: Core build output

- **WHEN** `pnpm -r build` runs
- **THEN** the system SHALL invoke `svelte-package` in core and emit compiled `dist` artifacts

### Requirement: Storybook documentation surface

The system SHALL configure Storybook (`@storybook/svelte-vite`) to load `*.stories.svelte` from the packages plus static MDX docs, enabling the `addon-svelte-csf`, `addon-a11y`, `addon-docs`, and `addon-vitest` addons, applying a Cyberdyne dark theme, aliasing the published package names to raw source, and building static output to `docs/` via `storybook build -o docs`. A `predev`/`prebuild-storybook` step SHALL run `scripts/copy-cesium.mjs` to copy Cesium runtime assets into `.storybook/public/cesium/`. (src: .storybook/main.ts:10-45; .storybook/manager.ts:4-14; package.json:6-11; scripts/copy-cesium.mjs:1-63)

#### Scenario: Cesium assets copied before Storybook

- **WHEN** `pnpm dev` or `pnpm build-storybook` runs
- **THEN** the system SHALL first execute `scripts/copy-cesium.mjs` to stage Cesium assets under `.storybook/public/cesium/`

### Requirement: Testing configuration

The system SHALL define two Vitest projects — a jsdom unit project over `packages/**/*.test.ts` and a browser-based `storybook` project driven by the Storybook test plugin and Playwright/chromium — with coverage thresholds of 90% statements, 85% branches, 90% functions, and 90% lines over core `src/lib`. The system SHALL provide a Playwright config running Cesium globe visual/smoke E2E against a Storybook dev server on `http://localhost:6006` using SwiftShader WebGL. (src: vitest.config.ts:26-86; playwright.config.ts:9-37)

#### Scenario: Coverage thresholds

- **WHEN** `pnpm test` runs with coverage
- **THEN** the system SHALL enforce 90/85/90/90 thresholds for statements/branches/functions/lines

### Requirement: Versioning and release to GitHub Packages

The system SHALL manage versioning with Changesets (base branch `main`, `access: public`) and SHALL publish `@cyberdynecorp`-scoped packages to `https://npm.pkg.github.com` (configured in `.npmrc`) via the `release` script `pnpm build && changeset publish`. The release workflow SHALL run on push to `main` and verify published tarball exports after a successful publish. (src: .changeset/config.json:2-10; .npmrc:1; package.json:24; .github/workflows/release.yaml:4-5,39-57)

#### Scenario: Scoped publish target

- **WHEN** a scoped `@cyberdynecorp` package is published
- **THEN** the system SHALL target the GitHub Packages registry per `.npmrc`

### Requirement: Continuous integration

The system SHALL run PR checks via `.github/workflows/test.yaml` (on pull_request to `main`: `pnpm check`, `pnpm build`, Playwright chromium install, `pnpm test`), publish Storybook to GitHub Pages on push to `main`, and validate OpenSpec specs on pull requests and pushes to `main`. CI workflows SHALL use `ubuntu-latest`, Node 20, pnpm cache, and `pnpm install --frozen-lockfile`. (src: .github/workflows/test.yaml:1-23; .github/workflows/publish-storybook.yaml:1-40; .github/workflows/openspec-validate.yaml)

#### Scenario: PR test job

- **GIVEN** a pull request targeting `main`
- **WHEN** CI runs
- **THEN** the system SHALL execute `pnpm check`, `pnpm build`, and `pnpm test`

#### Scenario: OpenSpec validation on PRs

- **GIVEN** a pull request targeting `main`
- **WHEN** CI runs
- **THEN** the system SHALL execute `openspec validate --all --strict` and fail the build on any spec error
