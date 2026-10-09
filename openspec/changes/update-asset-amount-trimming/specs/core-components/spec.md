## MODIFIED Requirements

### Requirement: CurrencyDisplay custom asset amounts

`CurrencyDisplay` SHALL accept optional `decimals`, `minDecimals` and `symbol` props for crypto and other non-ISO assets.

#### Scenario: Complete CurrencyDisplay custom asset amounts contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

`CurrencyDisplay` SHALL accept optional `decimals`, `minDecimals` and `symbol` props for crypto and other non-ISO assets. It SHALL:

- Enter asset mode only when `decimals` is set. In asset mode, `currency` MAY be any non-empty asset code (e.g. `USDC`, `ETH`, `BTC`). When `decimals` is omitted, all existing ISO 4217 behaviour SHALL be unchanged and `minDecimals` SHALL be ignored.
- In asset mode, display exactly `decimals` fraction digits, rounding half-expand. The amount SHALL be formatted from its decimal string and never converted to a JS `number`, so amounts with 18 fraction digits and 18 integer digits display without precision loss.
- When `minDecimals` is set, round at `decimals` as above and then drop trailing zeros down to `minDecimals` fraction digits, so `minDecimals={0}` shows `2 ETH` and `0.00067 ETH` and `minDecimals={2}` shows `1,250.50 USDC`. When `minDecimals` is omitted, keep exactly `decimals` digits.
- Use the locale's grouping separator, decimal separator and digits, and honour `signDisplay`, `tone`, `negativeLabel` and `masked` exactly as for ISO amounts. "Displays as zero" SHALL be judged at the asset's precision.
- By default, append the asset code after the number with a no-break space, in every locale. When `symbol` is set and `currencyDisplay` is `symbol` or `narrowSymbol` (the default), the symbol SHALL take the locale's currency-symbol position instead. `currencyDisplay` `code` or `name` SHALL always use the code suffix.
- Treat `decimals` that is not an integer from 0 to 100, `minDecimals` that is not an integer from 0 to `decimals`, or an empty asset code, as invalid input: render an em dash and log a single `console.warn`, without throwing.

(src: packages/ui/core/src/lib/data/CurrencyDisplay/CurrencyDisplay.svelte; packages/ui/core/src/lib/data/CurrencyDisplay/currencyDisplay.ts; packages/ui/core/src/lib/forms/MoneyInput/asset.ts)

#### Scenario: Assets with their own decimals

- **GIVEN** `amount="1234.5"`, `currency="USDC"`, `decimals={6}`
- **WHEN** it renders with `locale="en-US"` or `locale="pt-BR"`
- **THEN** it SHALL display `1,234.500000 USDC` or `1.234,500000 USDC` respectively
- **AND** `amount="1234.5678"`, `currency="ETH"`, `decimals={18}`, `locale="pt-BR"` SHALL display `1.234,567800000000000000 ETH`
- **AND** `amount="0.00000001"`, `currency="BTC"`, `decimals={8}`, `locale="pt-BR"` SHALL display `0,00000001 BTC`

#### Scenario: Trimmed asset amounts

- **GIVEN** `currency="ETH"`, `decimals={6}`, `minDecimals={0}`
- **WHEN** `amount="2"` renders with `locale="en-US"`
- **THEN** it SHALL display `2 ETH`
- **AND** `amount="0.00067"` with `locale="pt-BR"` SHALL display `0,00067 ETH`
- **AND** `amount="1.0000005"` SHALL display `1.000001 ETH` (rounded at `decimals`, then trimmed)
- **AND** `amount="1250.5"`, `currency="USDC"`, `minDecimals={2}` SHALL display `1,250.50 USDC`
- **AND** `amount="-0.0000004"` with `signDisplay="never"` SHALL display `0 ETH` with no tone colour
- **AND** `amount="2"` without `minDecimals` SHALL still display `2.000000 ETH`

#### Scenario: Invalid minDecimals

- **GIVEN** `decimals={6}` and `minDecimals` of `-1`, `7`, `1.5` or `NaN`
- **WHEN** it renders
- **THEN** it SHALL display an em dash and call `console.warn` once

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
- **AND** with `decimals={6}`, `minDecimals={0}`, `amount="2.5"`, `locale="en-US"` the sizer SHALL be `0.0 ETH`

#### Scenario: Asset symbol placement

- **GIVEN** `amount="1.5"`, `currency="BTC"`, `decimals={8}`, `symbol="₿"`
- **WHEN** it renders with `locale="en-US"`
- **THEN** it SHALL display `₿1.50000000`
- **AND** with `locale="de-DE"` and `amount="-1.5"` it SHALL display `-1,50000000 ₿`
- **AND** with `currencyDisplay="code"` it SHALL display `1.50000000 BTC`
- **AND** with `minDecimals={0}` it SHALL display `₿1.5`

#### Scenario: ISO behaviour unchanged

- **GIVEN** no `decimals`
- **WHEN** `currency="USDC"`
- **THEN** it SHALL render the em dash and warn once, as before
- **AND** `amount="1234.5"`, `currency="USD"`, `locale="en-US"` SHALL still display `$1,234.50`
- **AND** `amount="2"`, `currency="USD"`, `minDecimals={0}` SHALL still display `$2.00`

#### Scenario: Invalid decimals

- **GIVEN** `decimals` of `-1`, `1.5`, `101` or `NaN`
- **WHEN** it renders
- **THEN** it SHALL display an em dash and call `console.warn` once

## ADDED Requirements

### Requirement: TokenBalanceRow trimmed amounts and root attributes

`TokenBalanceRow` SHALL accept an optional `minDecimals` and forward `data-*` attributes to its root element.

#### Scenario: Complete TokenBalanceRow trimmed amounts and root attributes contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

`TokenBalanceRow` SHALL accept an optional `minDecimals` and forward `data-*` attributes to its root element. It SHALL:

- Pass `minDecimals` to the amount's `CurrencyDisplay` together with `decimals`, so the amount is trimmed with the same rules as `CurrencyDisplay` asset mode. Without `minDecimals` the amount SHALL keep exactly `decimals` fraction digits, as before.
- Spread every `data-*` attribute it receives on the root element, whether that is the default `div` or `as="li"`, without replacing its own class or the list semantics.

(src: packages/ui/core/src/lib/crypto/TokenBalanceRow/TokenBalanceRow.svelte)

#### Scenario: Trimmed holding amounts

- **GIVEN** `symbol="ETH"`, `decimals={6}`, `minDecimals={0}`, `locale="en-US"`
- **WHEN** `amount="2"` renders
- **THEN** the amount SHALL display `2 ETH`
- **AND** `amount="0.00067"` with `locale="pt-BR"` SHALL display `0,00067 ETH`
- **AND** `symbol="USDC"`, `amount="1250.5"`, `minDecimals={2}` SHALL display `1,250.50 USDC`
- **AND** `amount="2"` without `minDecimals` SHALL display `2.000000 ETH`

#### Scenario: Test hooks on the root

- **GIVEN** `data-holding="eth-mainnet"`
- **WHEN** it renders as a `div` or with `as="li"` inside a `<ul>`
- **THEN** the root element SHALL carry `data-holding="eth-mainnet"`
- **AND** the root SHALL keep its `cy-token-row` class
