## ADDED Requirements

### Requirement: CurrencyDisplay contract

The system SHALL provide a `CurrencyDisplay` data component. It SHALL:

- Take a required decimal-string `amount` (e.g. `"-1234.50"`) and a required ISO 4217 `currency`, plus optional `locale`, `signDisplay` (`auto` | `always` | `exceptZero` | `negative` | `never`, default `auto`), `currencyDisplay` (`symbol` | `narrowSymbol` | `code` | `name`, default `symbol`), `tone` (`neutral` | `signed`, default `neutral`), `masked` (default `false`), `maskedLabel` (default `"Hidden amount"`) and `negativeLabel` (default `"negative"`).
- Format through `formatMoney` (Intl currency style with string input) and never convert the amount to a JS `number`.
- Render with tabular numerals (`font-variant-numeric: tabular-nums`) using foundation font tokens.
- Keep negative amounts identifiable without colour: the formatted sign SHALL be shown for negatives unless `signDisplay="never"`, in which case a visually hidden `negativeLabel` prefix SHALL be rendered. The sign SHALL be the sign of the amount as displayed after rounding to the currency's minor units: an amount that displays as zero (e.g. `"-0.00"`, or `"-0.001"` in USD) SHALL render without a minus sign, label or tone colour. `tone="signed"` MAY colour positive and negative amounts with `--color-state-success` / `--color-state-error`, and colouring SHALL be dropped while masked.
- When `masked`, keep the rendered width of the value, expose only `maskedLabel` to assistive technology, and keep the real digits (including locale-native digits such as Arabic-Indic) out of both the accessibility tree and the DOM.
- When the amount is not a decimal string or the currency cannot be formatted, render an em dash and log a single `console.warn` per invalid input, without throwing.

(src: packages/ui/core/src/lib/data/CurrencyDisplay/CurrencyDisplay.svelte; packages/ui/core/src/lib/data/CurrencyDisplay/currencyDisplay.ts)

#### Scenario: Locale formatting

- **GIVEN** a `CurrencyDisplay` with `amount="1234.56"`
- **WHEN** it renders with `currency="USD"`, `locale="en-US"`, or with `currency="EUR"`, `locale="de-DE"`, or with `amount="1500"`, `currency="JPY"`
- **THEN** it SHALL display `$1,234.56`, `1.234,56 €` and `¥1,500` respectively
- **AND** `amount="12345678901234.56"` in USD SHALL display `$12,345,678,901,234.56` exactly

#### Scenario: Negative without colour

- **GIVEN** `amount="-12.30"`, `currency="USD"`, `locale="en-US"`
- **WHEN** `signDisplay` is `auto`, `always`, `exceptZero` or `negative`
- **THEN** it SHALL display `-$12.30` with no additional label
- **WHEN** `signDisplay` is `never`
- **THEN** it SHALL display `$12.30` preceded by visually hidden text `negative`, so assistive technology announces "negative $12.30"

#### Scenario: Amount that displays as zero

- **GIVEN** `amount="-0.00"` or `amount="-0.001"`, `currency="USD"`, `locale="en-US"`, `tone="signed"`
- **WHEN** it renders
- **THEN** it SHALL display `$0.00` without a minus sign and without the error or success colour
- **AND** with `signDisplay="never"` it SHALL NOT render the `negativeLabel`

#### Scenario: Signed tone

- **GIVEN** `tone="signed"`
- **WHEN** the amount is negative, positive or zero
- **THEN** the component SHALL apply the error colour, the success colour, or no colour respectively
- **AND** the negative sign or label SHALL still be rendered

#### Scenario: Masked amount

- **GIVEN** a `CurrencyDisplay` with `amount="-1234.56"` and `masked`
- **WHEN** it renders
- **THEN** the only text exposed to assistive technology SHALL be `maskedLabel` ("Hidden amount" by default)
- **AND** the DOM SHALL contain no digit of the real amount
- **AND** its rendered width SHALL equal the width of the same amount unmasked
- **AND** with `locale="ar-EG"` the DOM SHALL contain no Arabic-Indic digit of the real amount either

#### Scenario: Invalid amount

- **GIVEN** an `amount` such as `"abc"`, `""` or `"1,234.50"`, or an unknown `currency`
- **WHEN** it renders, including on later re-renders with the same input
- **THEN** it SHALL display an em dash (`—`)
- **AND** it SHALL call `console.warn` exactly once for that input and SHALL NOT throw
