## 1. Model

- [ ] 1.1 `query.ts`: types, `operatorsFor`, `defaultOperator`, `valueShape`, `isConditionComplete`, `describeCondition`, `evaluateQuery`, default labels; unit tests for every operator, the empty rules and date-day comparison

## 2. Components

- [ ] 2.1 `QueryBuilder` (forms): rows, value controls per shape, combinator, add and remove with focus management, `maxConditions`; tests and stories
- [ ] 2.2 `FilterChipRow` (data): chips, "Match any", clear all, focus after removal; tests and stories
- [ ] 2.3 `SavedViews` (data): select, modified badge, SplitButton actions, name and delete dialogs; tests and stories

## 3. Integration and docs

- [ ] 3.1 Composed "Filtered list" story: SavedViews + QueryBuilder + FilterChipRow + DataTable with `evaluateQuery` over synthetic rows
- [ ] 3.2 Export components, helpers and types; `pnpm check:package` passes
- [ ] 3.3 `guides/query-filtering.md`, README, `documentation/TRD.md`
- [ ] 3.4 Changeset: minor `@cyberdynecorp/svelte-ui-core`
- [ ] 3.5 Gate: lint, svelte-check, unit and Storybook projects; cognitive-complexity check of `query.ts` and the components
