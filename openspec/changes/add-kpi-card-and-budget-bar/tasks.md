## 1. KpiCard

- [x] 1.1 Build `KpiCard.svelte` with `label`, `value`, `delta`, `deltaLabel`, `trend`, `sentiment`, `href`, `sparkline`, `trendLabels` and `ariaLabel`
- [x] 1.2 Convey trend with an `aria-hidden` arrow plus visually hidden text, and colour by `sentiment` using state tokens
- [x] 1.3 Render a single link when `href` is set, otherwise an `article` labelled by the label
- [x] 1.4 Add tests (trend text and icons, i18n labels, sentiment classes, link vs article, accessible names, sparkline snippet) and stories

## 2. BudgetBar

- [x] 2.1 Add pure helpers in `budget.ts` (safe parsing, ratio without division by zero, state thresholds, BigInt overage, stacked widths)
- [x] 2.2 Build `BudgetBar.svelte` with a named `role="meter"`, min/max/now and a formatted `aria-valuetext`
- [x] 2.3 Distinguish states by text, icon and colour; cap the bar at 100% and show the overage; draw `committed` striped after `spent`
- [x] 2.4 Add `stateLabels` and `messages` for i18n
- [x] 2.5 Add helper and component tests (states, meter attributes, committed, zero/invalid limit, locale formatting, large amounts, i18n) and stories

## 3. Release

- [x] 3.1 Export both components and their types from the barrel
- [x] 3.2 Update the README and the Storybook overview counts
- [x] 3.3 Add a changeset (minor bump of `@cyberdynecorp/svelte-ui-core`)
- [ ] 3.4 Archive this change once released
