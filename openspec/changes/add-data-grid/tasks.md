## 1. Implementation

- [x] 1.1 `types.ts` (`DataGridColumn`, `DataGridChange`) and `gridKeys.ts` keyboard map with unit tests for navigation and editing modes
- [x] 1.2 `DataGrid` (data): roving focus, editing per cell type, validation, boolean toggle, read-only cells, `oncellchange` and `bind:rows`
- [x] 1.3 Tests: navigation keys, edit start (Enter, F2, typing, double-click), commit and cancel, Tab wrap and exit, validation, boolean toggle, read-only cells, axe
- [x] 1.4 Stories: price list (number + validation), settings matrix (boolean + select), read-only columns

## 2. Integration and docs

- [x] 2.1 Export the component and types; `pnpm check:package` passes
- [x] 2.2 README, `documentation/TRD.md`
- [x] 2.3 Changeset: minor `@cyberdynecorp/svelte-ui-core`
- [x] 2.4 Gate: lint, svelte-check, unit and Storybook projects; cognitive-complexity check
