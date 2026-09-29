## ADDED Requirements

### Requirement: Foundation subpath exports

The foundation package SHALL expose, besides `.`, `./styles` and `./tokens`, the subpaths `./themes/calm.css` (pointing to `./src/lib/themes/calm.css`) and `./theme` (with `types` and `default` conditions pointing to `./src/lib/theme/index.ts`). Its `files` field SHALL exclude `src/lib/**/*.test.ts` so tests are not published. Storybook SHALL alias `@cyberdynecorp/svelte-ui-foundation/theme` ahead of the bare package alias, so that the subpath resolves to source. (src: packages/ui/foundation/package.json; .storybook/main.ts)

#### Scenario: Consumer imports the calm preset and helper

- **WHEN** an app imports `@cyberdynecorp/svelte-ui-foundation/themes/calm.css` and `@cyberdynecorp/svelte-ui-foundation/theme`
- **THEN** both SHALL resolve through the package `exports` map

#### Scenario: Foundation tarball excludes tests

- **WHEN** the foundation package is packed
- **THEN** no `*.test.ts` file SHALL be included
