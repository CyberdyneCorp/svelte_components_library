## 1. Extensions

- [x] 1.1 `Dialog`: `confirmDisabled`, initial focus on the first body control; tests
- [x] 1.2 `CopyButton`: `iconOnly`, `copiedLabel`; tests and story
- [x] 1.3 `BarChart`: `barLayout.ts` (single, grouped, stacked, both orientations) with unit tests; `series` + `stacked`, legend, segment markers, data table; tests and stories; single-series output unchanged

## 2. New components

- [x] 2.1 `Timestamp` (data) + `relativeTime.ts`; fake-timer tests for live updates; stories
- [x] 2.2 `HoverCard` (overlay); delay, focus and Escape tests; stories
- [x] 2.3 `ConfirmAction` (feedback); click, confirm and type levels; tests and stories
- [x] 2.4 `CopyableValue` (data) + `truncateMiddle`; tests and stories
- [x] 2.5 `MaskedValue` (data); DOM-leak, reveal, auto-hide and copy tests; stories
- [x] 2.6 `OptionCard` (forms); radio group and checkbox tests; stories
- [x] 2.7 `FileTypeIcon` (primitives) + `fileTypes.ts`; classification tests; stories
- [x] 2.8 `FileCard` (data); preview fallback, progress, error and actions tests; stories

## 3. Integration and docs

- [x] 3.1 Export components, helpers and types from `src/lib/index.ts`; `pnpm check:package` passes
- [x] 3.2 README category lines and `documentation/TRD.md` rows
- [x] 3.3 Changeset: minor `@cyberdynecorp/svelte-ui-core`
- [x] 3.4 Gate: `pnpm lint`, `pnpm -r svelte-check`, unit project, Storybook project for the new and changed stories; cognitive-complexity check of the new files
