# trading-foundation Specification

## Purpose
TBD - created by archiving change add-trading-suite. Update Purpose after archive.
## Requirements
### Requirement: Shared trading types

The system SHALL export from `@cyberdynecorp/svelte-ui-core` the trading types `Side`, `OrderType`, `TimeInForce`, `MarginMode`, `Candle`, `MarketSpec`, `OrderDraft`, `Position`, `OpenOrder`, `BookLevel`, `Trade` and `Ticker` as defined in design D2. Prices and sizes in `MarketSpec`, `OrderDraft`, `Position`, `OpenOrder`, `BookLevel`, `Trade` and `Ticker` SHALL be decimal strings; `Candle` fields SHALL be numbers with `time` in UTC milliseconds at bar open.

#### Scenario: Types are importable

- **GIVEN** a consumer TypeScript project depending on core
- **WHEN** it imports `Candle`, `MarketSpec` and `OrderDraft` from `@cyberdynecorp/svelte-ui-core`
- **THEN** the types SHALL resolve with the fields listed in design D2

### Requirement: Precision helpers

The system SHALL provide `roundToTick(price, tickSize, mode)` and `roundToStep(size, stepSize, mode)` operating on decimal strings with no floating-point arithmetic, `mode` being `"down" | "up" | "nearest"`, plus `formatPrice(value, market, locale?)` and `formatSize(value, market, locale?)` that accept a number or decimal string and render with the market's precision (derived from `tickSize` / `stepSize` when `pricePrecision` / `sizePrecision` are absent).

#### Scenario: Exact tick rounding

- **GIVEN** `tickSize` `"0.5"`
- **WHEN** `roundToTick("64123.74", "0.5", "nearest")` is called
- **THEN** it SHALL return `"64123.5"`

#### Scenario: Step rounding never rounds size up by default

- **GIVEN** `stepSize` `"0.001"`
- **WHEN** `roundToStep("0.12399", "0.001", "down")` is called
- **THEN** it SHALL return `"0.123"`

#### Scenario: Precision derived from the tick size

- **GIVEN** a market with `tickSize` `"0.01"` and no `pricePrecision`
- **WHEN** `formatPrice(64123.5, market, "en-US")` is called
- **THEN** it SHALL return `"64,123.50"`

