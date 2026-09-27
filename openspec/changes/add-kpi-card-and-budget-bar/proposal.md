## Why

Finance consumers (CyberWealth, issues #14 and #15) need two generic dashboard pieces that the library lacks:

- A neutral KPI tile with a delta. The only KPI tile today is `crypto/MetricCard`, which is crypto-styled, takes a numeric `change`, and colours the change by sign alone.
- A budget/envelope progress component that tells "approaching" apart from "exceeded" and keeps money exact.

## What Changes

- Add `KpiCard` (`data/KpiCard/`). Issue #14 proposed the name `StatCard`, but `StatCard` is already exported from the barrel by `retro/StatCard`, so the neutral card ships as `KpiCard`.
  - Props: `label`, `value`, `delta`, `deltaLabel`, `trend` (`up | down | flat`), `sentiment` (`positive | negative | neutral`, default `neutral`), `href`, `sparkline` (snippet), `trendLabels` (i18n) and `ariaLabel`.
  - Trend is conveyed by an `aria-hidden` arrow icon plus visually hidden text; colour follows `sentiment`, independently of direction.
  - With `href` the whole card is one link; otherwise it is an `article` named by its label.
- Add `BudgetBar` (`data/BudgetBar/`).
  - Props: `spent`, `limit`, `committed` (decimal strings), `currency`, `locale`, `thresholds` (default `[0.8, 1]`), `label`, `stateLabels` and `messages` (i18n), and `ariaLabel`.
  - It renders a `role="meter"` track named by the label, with `aria-valuemin`, `aria-valuemax`, `aria-valuenow` and an `aria-valuetext` that describes the amounts and the state.
  - `ok`, `approaching` and `exceeded` differ by text, icon and colour. An over-limit bar caps at 100% and shows the overage as text. `committed` is drawn striped after `spent`.
  - Amounts are formatted with `formatMoney`, and overage is computed with BigInt minor units. `Number()` is used only for the ratio. A zero or invalid limit never divides.
- Export both components and their public types from the package root.
- The change is additive; nothing breaks.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `core-components`: adds the KpiCard and BudgetBar contracts.

## Impact

- `packages/ui/core/src/lib/data/KpiCard/*`, `packages/ui/core/src/lib/data/BudgetBar/*`, plus barrel exports in `packages/ui/core/src/lib/index.ts`.
- README and Storybook overview counts.
- Minor version bump of `@cyberdynecorp/svelte-ui-core`.
