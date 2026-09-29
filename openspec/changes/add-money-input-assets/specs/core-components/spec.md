## ADDED Requirements

### Requirement: MoneyInput custom asset amounts

`MoneyInput` SHALL accept optional `decimals` and `symbol` props for crypto and other non-ISO assets, with the same meaning as on `CurrencyDisplay`. It SHALL:

- Enter asset mode only when `decimals` is set. In asset mode, `currency` MAY be any non-empty asset code (e.g. `USDC`, `ETH`, `BTC`). When `decimals` is omitted, all existing ISO 4217 behaviour SHALL be unchanged.
- In asset mode, use `decimals` as the fraction-digit count for parsing, clamping and the emitted canonical value. The emitted `value` and the hidden input SHALL be decimal strings with exactly `decimals` fraction digits, computed without converting to a JS `number`.
- Apply the existing separator rule with `decimals` as the limit: the last `.` or `,` is the decimal separator when at most `decimals` digits follow it, and every other separator is grouping.
- In asset mode, reject typed or pasted text whose last separator is followed by more than `decimals` digits (except a three-digit thousands group): the field SHALL keep its previous text and `value` SHALL NOT change.
- While unfocused, display the value formatted like `CurrencyDisplay` in asset mode: the code appended after a no-break space, or `symbol` in the locale's currency-symbol position when set. While focused, show the plain number with the locale's decimal mark and the code as affix.
- Treat `decimals` that is not an integer from 0 to 100, or an empty asset code, as invalid: render the input disabled with `aria-invalid="true"`, keep `value` and the hidden input unchanged, display the raw value, ignore input, and log a single `console.warn`, without throwing.

(src: packages/ui/core/src/lib/forms/MoneyInput/MoneyInput.svelte; packages/ui/core/src/lib/forms/MoneyInput/asset.ts; packages/ui/core/src/lib/forms/MoneyInput/money.ts)

#### Scenario: Typed asset amounts

- **GIVEN** `currency="USDC"`, `decimals={6}`
- **WHEN** the user types `1,234.567891` with `locale="en-US"` or `1.234,567891` with `locale="pt-BR"`
- **THEN** the system SHALL emit `"1234.567891"`
- **AND** with `currency="BTC"`, `decimals={8}`, typing `21.000,5` in pt-BR SHALL emit `"21000.50000000"`

#### Scenario: Last separator with asset decimals

- **GIVEN** `currency="BTC"`, `decimals={8}`
- **WHEN** the user types `1.234` or `1,234`
- **THEN** the system SHALL emit `"1.23400000"`

#### Scenario: 18-decimal paste without precision loss

- **GIVEN** `currency="ETH"`, `decimals={18}`, `locale="pt-BR"`, `name="amount"`
- **WHEN** the user pastes `123.456.789.012.345.678,123456789012345678` and the field blurs
- **THEN** the system SHALL emit `"123456789012345678.123456789012345678"`
- **AND** the hidden input SHALL carry that same string
- **AND** the field SHALL display `123.456.789.012.345.678,123456789012345678 ETH`

#### Scenario: Excess decimals rejected

- **GIVEN** `currency="USDC"`, `decimals={6}` and the field text `1.123456`
- **WHEN** the user types a seventh fraction digit (`1.1234567`)
- **THEN** the field SHALL keep `1.123456` and no change SHALL be emitted

#### Scenario: Negative asset amounts

- **GIVEN** `currency="ETH"`, `decimals={18}`, `locale="pt-BR"`, `allowNegative`
- **WHEN** the user types `-0,5`
- **THEN** the system SHALL emit `"-0.500000000000000000"`
- **AND** without `allowNegative` the minus sign SHALL be dropped

#### Scenario: Asset display

- **GIVEN** `value="1234.5"`, `currency="USDC"`, `decimals={6}`
- **WHEN** the field is unfocused with `locale="pt-BR"`
- **THEN** it SHALL display `1.234,500000 USDC`
- **AND** `value="1.5"`, `currency="BTC"`, `decimals={8}`, `symbol="₿"`, `locale="en-US"` SHALL display `₿1.50000000`

#### Scenario: Invalid decimals

- **GIVEN** `decimals` of `-1`, `1.5`, `101` or `NaN`, and `value="1.5"`
- **WHEN** it renders
- **THEN** the input SHALL be disabled with `aria-invalid="true"` and display `1.5`
- **AND** the hidden input SHALL keep `1.5`
- **AND** `console.warn` SHALL be called once

#### Scenario: ISO behaviour unchanged

- **GIVEN** no `decimals` and `currency="USD"`, `locale="en-US"`
- **WHEN** the user types `1.2345`
- **THEN** the system SHALL still treat the separator as grouping and emit `"12345.00"`
- **AND** `value="1234.5"` SHALL still display `$1,234.50`
