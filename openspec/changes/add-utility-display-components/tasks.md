## 1. Extensions

- [ ] 1.1 `Dialog`: `confirmDisabled`, initial focus on the first body control; tests
- [ ] 1.2 `CopyButton`: `iconOnly`, `copiedLabel`; tests and story
- [ ] 1.3 `BarChart`: `barLayout.ts` (single, grouped, stacked, both orientations) with unit tests; `series` + `stacked`, legend, segment markers, data table; tests and stories; single-series output unchanged

## 2. New components

- [ ] 2.1 `Timestamp` (data) + `relativeTime.ts`; fake-timer tests for live updates; stories
- [ ] 2.2 `HoverCard` (overlay); delay, focus and Escape tests; stories
- [ ] 2.3 `ConfirmAction` (feedback); click, confirm and type levels; tests and stories
- [ ] 2.4 `CopyableValue` (data) + `truncateMiddle`; tests and stories
- [ ] 2.5 `MaskedValue` (data); DOM-leak, reveal, auto-hide and copy tests; stories
- [ ] 2.6 `OptionCard` (forms); radio group and checkbox tests; stories
- [ ] 2.7 `FileTypeIcon` (primitives) + `fileTypes.ts`; classification tests; stories
- [ ] 2.8 `FileCard` (data); preview fallback, progress, error and actions tests; stories

## 3. Integration and docs

- [ ] 3.1 Export components, helpers and types from `src/lib/index.ts`; `pnpm check:package` passes
- [ ] 3.2 README category lines and `documentation/TRD.md` rows
- [ ] 3.3 Changeset: minor `@cyberdynecorp/svelte-ui-core`
- [ ] 3.4 Gate: `pnpm lint`, `pnpm -r svelte-check`, unit project, Storybook project for the new and changed stories; cognitive-complexity check of the new files
