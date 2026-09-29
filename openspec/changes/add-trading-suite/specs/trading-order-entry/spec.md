## ADDED Requirements

### Requirement: Order ticket

The system SHALL provide `OrderTicket` for a `market: MarketSpec`, with a Long/Short side selector (radio group), order types market, limit, stop-market and stop-limit, size in base or quote asset, a size-percentage slider of the `available` margin, a leverage control, cross/isolated margin mode, reduce-only, post-only (limit only), time in force (GTC/IOC/FOK) and optional take-profit / stop-loss. Price and size fields SHALL use `MoneyInput` in asset mode. The ticket SHALL NOT submit orders itself: it calls `onsubmit(draft: OrderDraft)` with prices rounded to `tickSize` and size rounded down to `stepSize` and expressed in the base asset.

#### Scenario: Quote-denominated size is normalised

- **GIVEN** a BTC-USDT market with `stepSize` `"0.001"`, a limit price of `"64000"` and a size of `"1000"` USDT
- **WHEN** the user submits a Long order
- **THEN** `onsubmit` SHALL receive `side: "long"`, `sizeUnit: "base"` and `size: "0.015"`

### Requirement: Order validation and preview

`OrderTicket` SHALL validate against `MarketSpec` and `available` (min/max size, min notional, leverage ≤ `maxLeverage`, a price for limit/stop-limit orders, a trigger price for stop orders, take-profit above and stop-loss below the entry for longs and the reverse for shorts), show errors inline next to the field and block submit while invalid. It SHALL preview the notional, the initial margin (notional ÷ leverage) and the estimated fee from `makerFee` / `takerFee`, and SHALL show an estimated liquidation price only when the consumer supplies `estimateLiquidation(draft)`.

#### Scenario: Stop-loss on the wrong side

- **GIVEN** a Long limit order at 64000
- **WHEN** the user enters a stop-loss of 65000
- **THEN** the stop-loss field SHALL show an error and the submit button SHALL be disabled

### Requirement: Leverage slider

The system SHALL provide `LeverageSlider` (1× to `max`, configurable marks, a numeric input kept in sync, `aria-valuetext` such as `"20×"`), used by `OrderTicket` and usable alone.

#### Scenario: Keyboard adjusts leverage

- **GIVEN** a focused `LeverageSlider` at 10× with `max` 50
- **WHEN** the user presses → twice
- **THEN** the value SHALL be 12× and its accessible value text SHALL be "12×"

### Requirement: Positions and open orders tables

The system SHALL provide `PositionsTable` (market, side, size, entry, mark, liquidation, margin and mode, unrealized PnL with ROE, TP/SL) and `OpenOrdersTable` (market, side, type, price or trigger, size and filled, reduce-only, TIF, time), rendered as real tables, with PnL coloured by the trade tokens plus a sign, and actions reported through callbacks only (`onclose(position, "market" | "limit")`, `onedittpsl(position)`, `oncancel(order)`, `oncancelall()`). Both SHALL show an empty state and accept `labels`.

#### Scenario: Closing a position emits intent only

- **GIVEN** a `PositionsTable` with one BTC long position
- **WHEN** the user activates its "Market close" action
- **THEN** `onclose` SHALL be called with that position and `"market"`, and the table SHALL not change until the consumer updates `positions`
