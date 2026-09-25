## ADDED Requirements

### Requirement: MoneyInput contract

The system SHALL provide a `MoneyInput` form component. It SHALL:

- Take a bindable `value` of type `string | null`, where `null` means empty. When set, the value SHALL always be a canonical decimal string with exactly the currency's minor-unit fraction digits (`"1234.56"`, `"-5.00"`, `"1500"` for JPY). The component SHALL never convert an amount to a JS `number`.
- Take a required ISO 4217 `currency`, plus optional `locale`, decimal-string `min`/`max`, `label`, `error`, `hint`, `name`, `disabled`, `required`, `id`, `allowNegative` (default `false`) and `onchange(value)`.
- Derive minor units from `Intl.NumberFormat(locale, { style: "currency", currency }).resolvedOptions().maximumFractionDigits`.
- Render a `type="text"` input with `inputmode="decimal"`.
- Format with Intl currency style while unfocused, and show the plain number with the locale's decimal mark while focused.
- Clamp to `min`/`max` on blur.
- When `name` is set, render a hidden input carrying the canonical value.

(src: packages/ui/core/src/lib/forms/MoneyInput/MoneyInput.svelte; packages/ui/core/src/lib/forms/MoneyInput/money.ts)

#### Scenario: Round-trip precision

- **GIVEN** a `MoneyInput` with `currency="USD"`
- **WHEN** the user types `12345678901234.56` and the field blurs
- **THEN** the system SHALL emit the value `"12345678901234.56"` exactly
- **AND** the field SHALL display `$12,345,678,901,234.56`

#### Scenario: Separator parsing

- **GIVEN** a currency with 2 minor units
- **WHEN** the user types `1.234,56`, `1,234.56`, `12,5` or `1,234`
- **THEN** the system SHALL treat the last `.` or `,` as the decimal separator only when at most 2 digits follow it, and SHALL drop every other separator as grouping
- **AND** it SHALL emit `"1234.56"`, `"1234.56"`, `"12.50"` and `"1234.00"` respectively

#### Scenario: Blur formatting

- **GIVEN** a `MoneyInput` with `currency="EUR"`, `locale="de-DE"` and `value="1234.56"`
- **WHEN** the field is unfocused
- **THEN** it SHALL display `1.234,56 €`
- **WHEN** the field receives focus
- **THEN** it SHALL display the editable text `1234,56`

#### Scenario: Minor-unit limit

- **GIVEN** a `MoneyInput` with `currency="JPY"` (0 minor units)
- **WHEN** the user types `1.500`
- **THEN** the system SHALL treat the separator as grouping and emit `"1500"`
- **AND** characters other than digits, `.`, `,` and (only with `allowNegative`) a leading `-` SHALL be removed from the field while typing

#### Scenario: Accessible error

- **GIVEN** a `MoneyInput` with a `label`, a `hint` and an `error`
- **WHEN** it renders
- **THEN** the label SHALL be tied to the input via `for`/`id`
- **AND** the input SHALL set `aria-invalid="true"` and an `aria-describedby` that references both the hint id and the error id
- **AND** the error text SHALL be rendered with `role="alert"`
