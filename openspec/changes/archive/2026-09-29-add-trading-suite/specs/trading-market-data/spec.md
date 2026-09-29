## ADDED Requirements

### Requirement: Order book

The system SHALL provide `OrderBook` taking `bids` and `asks` (`BookLevel[]`, best price first) and a `market`, aggregating levels by a selectable `grouping` that is a multiple of `tickSize`, showing price, size and cumulative total per level with a depth bar proportional to the cumulative size, the spread (absolute and percent) between the sides, a `layout` of `both`, `bids` or `asks`, and a configurable number of levels. Activating a level SHALL call `onpriceclick(price)`.

#### Scenario: Grouping aggregates levels

- **GIVEN** bids at 64000.0, 63999.5 and 63999.0 with sizes 1, 2 and 3 and `grouping` `"1"`
- **WHEN** the book renders
- **THEN** it SHALL show a 64000 level with size 1 and a 63999 level with size 5

### Requirement: Recent trades

The system SHALL provide `RecentTrades` listing `trades: Trade[]` newest first with price (coloured by side, plus a ▲/▼ glyph), size and time, rendering long lists efficiently and highlighting newly arrived trades unless `prefers-reduced-motion` is set.

#### Scenario: Side is not colour-only

- **GIVEN** a sell trade
- **WHEN** it renders
- **THEN** its price SHALL use the short trade colour and SHALL be preceded by a ▼ glyph with an accessible "Sell" label

### Requirement: Ticker bar

The system SHALL provide `TickerBar` showing, from `ticker: Ticker` and `market`, the last price, mark and index price, 24h change (absolute and percent), 24h high/low, 24h volume, open interest and funding rate with a live countdown to `nextFundingTime`, omitting fields that are absent.

#### Scenario: Funding countdown

- **GIVEN** `nextFundingTime` 90 seconds in the future
- **WHEN** 30 seconds pass
- **THEN** the countdown SHALL read 00:01:00

### Requirement: High-frequency updates

`OrderBook`, `RecentTrades` and `TickerBar` SHALL coalesce prop updates to at most one render per animation frame and SHALL remain axe-clean in failing mode in their stories.

#### Scenario: Burst of book updates

- **GIVEN** 20 `bids` / `asks` updates within one animation frame
- **WHEN** the frame renders
- **THEN** the book SHALL render once, showing the last update
