# Finance dashboard visual improvements

## Why

A read-only review of CyberWealth development on 2026-10-06 covered overview, portfolio, empty bills and transactions, at desktop and mobile widths. The current calm-dark page makes card surfaces difficult to distinguish and gives primary metrics, contextual text and actions similar visual weight. Transaction page actions overlap its heading at 390px and the document measures 411px wide. Portfolio distribution uses identical bars and includes negative liabilities; a conventional donut would misrepresent those values.

The library has PageHeader, KpiCard, DataTable, EmptyState, PageShell and calm themes. Improvements should extend those primitives and add only the missing reusable patterns.

## What Changes

- Make PageHeader action layout wrap safely on narrow screens and with long translated titles.
- Add opt-in KpiCard emphasis and value tone; preserve current defaults and keep sentiment separate from trend.
- Extend the existing FilterBar with an opt-in composable mode that lays out application-owned filter controls and actions responsively.
- Add AllocationBreakdown with distinguishable category markers, explicit signed percentages, accessible text and signed bars around a zero baseline. Inputs and labels come from the application.
- Add a finance dashboard Storybook composition using synthetic records, existing layout/table/empty-state primitives and flat calm-dark surfaces; demonstrate desktop and mobile patterns and an integration guide.

## Capabilities

### New Capabilities

- `finance-dashboard-patterns`: reusable financial presentation and responsive filter composition.

### Modified Capabilities

- `core-components`: additive KpiCard options and responsive PageHeader layout.

## Impact

Changes are limited to svelte-ui-core, documentation, examples and an appropriate changeset. No globally applied theme palette change. CyberWealth has application-owned wave decorations, data transformations and page composition; those require adoption in the application's source. This change supplies the components and instructions, and does not deploy CyberWealth or modify its financial records.

## Review

The user approved the proposal, design, tasks and local HTML prototype on 2026-10-06. Implementation extends the existing FilterBar rather than creating a duplicate public component. The prototype is a design artifact, not implemented library components. No credentials, account identifiers, balances or real transaction descriptions are included in repository artifacts.
