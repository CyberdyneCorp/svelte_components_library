## ADDED Requirements

### Requirement: CurrencyDisplay custom asset amounts

`CurrencyDisplay` SHALL accept optional `decimals` and `symbol` props for crypto and other non-ISO assets. It SHALL:

- Enter asset mode only when `decimals` is set. In asset mode, `currency` MAY be any non-empty asset code (e.g. `USDC`, `ETH`, `BTC`). When `decimals` is omitted, all existing ISO 4217 behaviour SHALL be unchanged.
- In asset mode, display exactly `decimals` fraction digits, rounding half-expand. The amount SHALL be formatted from its decimal string and never converted to a JS `number`, so amounts with 18 fraction digits and 18 integer digits display without precision loss.
- Use the locale's grouping separator, decimal separator and digits, and honour `signDisplay`, `tone`, `negativeLabel` and `masked` exactly as for ISO amounts. "Displays as zero" SHALL be judged at the asset's precision.
- By default, append the asset code after the number with a no-break space, in every locale. When `symbol` is set and `currencyDisplay` is `symbol` or `narrowSymbol` (the default), the symbol SHALL take the locale's currency-symbol position instead. `currencyDisplay` `code` or `name` SHALL always use the code suffix.
- Treat `decimals` that is not an integer from 0 to 100, or an empty asset code, as invalid input: render an em dash and log a single `console.warn`, without throwing.

(src: packages/ui/core/src/lib/data/CurrencyDisplay/CurrencyDisplay.svelte; packages/ui/core/src/lib/data/CurrencyDisplay/currencyDisplay.ts)

#### Scenario: Assets with their own decimals

- **GIVEN** `amount="1234.5"`, `currency="USDC"`, `decimals={6}`
- **WHEN** it renders with `locale="en-US"` or `locale="pt-BR"`
- **THEN** it SHALL display `1,234.500000 USDC` or `1.234,500000 USDC` respectively
- **AND** `amount="1234.5678"`, `currency="ETH"`, `decimals={18}`, `locale="pt-BR"` SHALL display `1.234,567800000000000000 ETH`
- **AND** `amount="0.00000001"`, `currency="BTC"`, `decimals={8}`, `locale="pt-BR"` SHALL display `0,00000001 BTC`

#### Scenario: No precision loss

- **GIVEN** `amount="123456789012345678.123456789012345678"`, `currency="ETH"`, `decimals={18}`, `locale="en-US"`
- **WHEN** it renders
- **THEN** it SHALL display `123,456,789,012,345,678.123456789012345678 ETH`

#### Scenario: Asset signs and zero

- **GIVEN** `currency="ETH"`, `decimals={4}`, `locale="pt-BR"`, `tone="signed"`
- **WHEN** `amount="-0.5"`
- **THEN** it SHALL display `-0,5000 ETH` with the error colour
- **WHEN** `amount="-0.0000004"` with `currency="USDC"`, `decimals={6}`, `signDisplay="never"`
- **THEN** it SHALL display `0.000000 USDC` (en-US) with no minus sign, no `negativeLabel` and no tone colour

#### Scenario: Masked asset

- **GIVEN** `amount="-1234.5678"`, `currency="ETH"`, `decimals={4}`, `locale="pt-BR"`, `masked`
- **WHEN** it renders
- **THEN** only `maskedLabel` SHALL be exposed to assistive technology
- **AND** the DOM SHALL contain no digit of the real amount
- **AND** the hidden sizer SHALL be `-0.000,0000 ETH`

#### Scenario: Asset symbol placement

- **GIVEN** `amount="1.5"`, `currency="BTC"`, `decimals={8}`, `symbol="₿"`
- **WHEN** it renders with `locale="en-US"`
- **THEN** it SHALL display `₿1.50000000`
- **AND** with `locale="de-DE"` and `amount="-1.5"` it SHALL display `-1,50000000 ₿`
- **AND** with `currencyDisplay="code"` it SHALL display `1.50000000 BTC`

#### Scenario: ISO behaviour unchanged

- **GIVEN** no `decimals`
- **WHEN** `currency="USDC"`
- **THEN** it SHALL render the em dash and warn once, as before
- **AND** `amount="1234.5"`, `currency="USD"`, `locale="en-US"` SHALL still display `$1,234.50`

#### Scenario: Invalid decimals

- **GIVEN** `decimals` of `-1`, `1.5`, `101` or `NaN`
- **WHEN** it renders
- **THEN** it SHALL display an em dash and call `console.warn` once
