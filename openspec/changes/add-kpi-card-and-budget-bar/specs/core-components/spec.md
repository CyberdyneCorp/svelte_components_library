## ADDED Requirements

### Requirement: KpiCard contract

The system SHALL provide a neutral `KpiCard` data-display component, exported from the package root. (`StatCard` is taken by `retro/StatCard`.) It SHALL:

- Take a required `label` and a preformatted `value`, plus optional preformatted `delta`, `deltaLabel`, `trend` (`"up" | "down" | "flat"`), `sentiment` (`"positive" | "negative" | "neutral"`, default `"neutral"`), `href`, a `sparkline` snippet, `trendLabels` and `ariaLabel`.
- Drive the arrow icon from `trend` and the colour from `sentiment`, so the two stay independent.
- Never convey the trend by colour alone. It SHALL render an `aria-hidden` arrow icon together with visually hidden text, which defaults to `increased`, `decreased` and `unchanged` and can be overridden per trend through `trendLabels`.
- When `href` is set, render the whole card as a single `<a>` whose accessible name is the card text (label, value, trend text, delta and delta label) unless `ariaLabel` overrides it.
- When `href` is not set, render a non-interactive `<article>` labelled by the label (or by `ariaLabel`).
- Render the `sparkline` snippet in its own area below the value, and omit that area when no snippet is given.
- Style only with defined card and state tokens (`--card-bg`, `--card-border`, `--card-hover-border`, `--color-state-success`, `--color-state-error`).

(src: packages/ui/core/src/lib/data/KpiCard/KpiCard.svelte)

#### Scenario: Rising expenses are negative

- **GIVEN** a `KpiCard` with `trend="up"`, `sentiment="negative"` and `delta="+12%"`
- **WHEN** it renders
- **THEN** it SHALL show an upward arrow icon with `aria-hidden="true"` and the visually hidden text `increased`
- **AND** the delta SHALL use the negative (error) colour

#### Scenario: Linked card

- **GIVEN** a `KpiCard` with `label="Monthly spend"`, `value="€1,240.00"`, `trend="up"`, `delta="+4.2%"`, `deltaLabel="vs last month"` and `href="/spend"`
- **WHEN** it renders
- **THEN** it SHALL render exactly one link to `/spend` with the accessible name `Monthly spend €1,240.00 increased +4.2% vs last month`
- **AND** it SHALL NOT render an `article`

#### Scenario: Static card

- **GIVEN** a `KpiCard` without `href`
- **WHEN** it renders
- **THEN** it SHALL render an `article` whose accessible name is the label, with no link

#### Scenario: Translated trend text

- **GIVEN** a `KpiCard` with `trend="down"` and `trendLabels={{ down: "diminuiu" }}`
- **WHEN** it renders
- **THEN** the visually hidden trend text SHALL be `diminuiu`

### Requirement: BudgetBar contract

The system SHALL provide a `BudgetBar` data-display component, exported from the package root. It SHALL:

- Take `spent`, `limit` and an optional `committed` as decimal strings, a required ISO 4217 `currency`, an optional `locale`, `thresholds` (default `[0.8, 1]`), a required `label`, plus `stateLabels`, `messages` and `ariaLabel` for i18n and naming.
- Treat an invalid amount as `"0"` and an empty `committed` as absent. Truncate every amount to the currency's minor units, and display that same canonical amount, so the shown values always agree with the state and overage. Compute the overage with BigInt minor units. Use `Number()` only to derive the spent/limit ratio, and format every displayed amount with `formatMoney`.
- Never divide by a zero or negative limit. With such a limit, any positive spending SHALL be `exceeded`, and no spending SHALL be `ok`.
- Derive the state from the ratio: `approaching` when the ratio is at or above `thresholds[0]`, `exceeded` when it is strictly above `thresholds[1]`, and `ok` otherwise.
- Distinguish the states by visible text and a distinct `aria-hidden` icon, as well as colour (`--color-state-success`, `--color-state-warning`, `--color-state-error`).
- Render the track with `role="meter"`, named by the label through `aria-labelledby` (or by `ariaLabel`), with `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-valuenow` equal to the rounded spent percentage capped at 100, and an `aria-valuetext` joining the amount text, the committed text, the overage text and the state label.
- Cap the spent segment at 100% width and show the overage as text when `spent` exceeds `limit`.
- Draw `committed` as a striped, translucent segment stacked after `spent`, capped so both segments fit within 100%.

(src: packages/ui/core/src/lib/data/BudgetBar/BudgetBar.svelte; packages/ui/core/src/lib/data/BudgetBar/budget.ts)

#### Scenario: Approaching the limit

- **GIVEN** a `BudgetBar` with `spent="820"`, `limit="1000"`, `currency="EUR"`, `locale="en-IE"` and `label="Groceries"`
- **WHEN** it renders
- **THEN** a meter named `Groceries` SHALL expose `aria-valuenow="82"` and `aria-valuetext="€820.00 of €1,000.00, approaching limit"`
- **AND** the visible state SHALL read `approaching limit` next to the approaching icon

#### Scenario: Over the limit

- **GIVEN** a `BudgetBar` with `spent="1120.50"` and `limit="1000"` in EUR
- **WHEN** it renders
- **THEN** the spent segment SHALL be 100% wide and `aria-valuenow` SHALL be `100`
- **AND** the text `€120.50 over` SHALL be shown
- **AND** `aria-valuetext` SHALL be `€1,120.50 of €1,000.00, €120.50 over, limit exceeded`

#### Scenario: Zero limit

- **GIVEN** a `BudgetBar` with `spent="25"` and `limit="0"`
- **WHEN** it renders
- **THEN** no division by zero SHALL occur, the state SHALL be `exceeded` and no text SHALL contain `NaN`

#### Scenario: Sub-minor-unit precision

- **GIVEN** a `BudgetBar` with `spent="1000.009"` and `limit="1000"` in EUR
- **WHEN** it renders
- **THEN** `aria-valuetext` SHALL be `€1,000.00 of €1,000.00, approaching limit` (no rounded-up `€1,000.01` beside a non-exceeded state)

#### Scenario: Committed amount

- **GIVEN** a `BudgetBar` with `spent="600"`, `committed="150"` and `limit="1000"`
- **WHEN** it renders
- **THEN** a committed segment 15% wide SHALL follow the spent segment
- **AND** `aria-valuetext` SHALL include `€150.00 committed`

#### Scenario: Translated text

- **GIVEN** a `BudgetBar` with `stateLabels={{ exceeded: "orçamento estourado" }}` and `messages` overriding `amount` and `overage`
- **WHEN** it renders over the limit
- **THEN** the visible state and `aria-valuetext` SHALL use the translated words
