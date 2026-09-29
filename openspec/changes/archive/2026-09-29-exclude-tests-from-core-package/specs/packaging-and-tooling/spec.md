## MODIFIED Requirements

### Requirement: Recursive build with svelte-package

The system SHALL build all packages via the root `build` script `pnpm -r build`; core SHALL build with `svelte-package` producing `dist/index.js` and `dist/index.d.ts`, while foundation (having no `scripts`) SHALL be a no-op that ships raw source. The published core tarball SHALL contain only runtime artifacts: its `files` field SHALL exclude `dist/**/*.test.*`, `dist/**/*.stories.*` and `dist/_testdata`. (src: package.json; packages/ui/core/package.json; scripts/check-package-contents.mjs)

#### Scenario: Core build output

- **WHEN** `pnpm -r build` runs
- **THEN** the system SHALL invoke `svelte-package` in core and emit compiled `dist` artifacts

#### Scenario: Tests and stories are not published

- **GIVEN** a built core package
- **WHEN** `pnpm check:package` inspects the output of `npm pack --dry-run`
- **THEN** the system SHALL fail if any `.test.`, `.stories.` or `_testdata` file would ship, or if a shipped module imports a relative path that is not shipped

### Requirement: Continuous integration

The system SHALL run PR checks via `.github/workflows/test.yaml` (on pull_request to `main`: `pnpm check`, `pnpm build`, `pnpm check:package`, Playwright chromium install, `pnpm test`), publish Storybook to GitHub Pages on push to `main`, and validate OpenSpec specs on pull requests and pushes to `main`. CI workflows SHALL use `ubuntu-latest`, Node 20, pnpm cache, and `pnpm install --frozen-lockfile`. (src: .github/workflows/test.yaml:1-23; .github/workflows/publish-storybook.yaml:1-40; .github/workflows/openspec-validate.yaml)

#### Scenario: PR test job

- **GIVEN** a pull request targeting `main`
- **WHEN** CI runs
- **THEN** the system SHALL execute `pnpm check`, `pnpm build`, `pnpm check:package`, and `pnpm test`

#### Scenario: OpenSpec validation on PRs

- **GIVEN** a pull request targeting `main`
- **WHEN** CI runs
- **THEN** the system SHALL execute `openspec validate --all --strict` and fail the build on any spec error
