# trading-indicators Specification

## Purpose
Framework-free technical-indicator maths (`trading/indicators/`): moving averages, RSI, Bollinger Bands, ATR, ADX, MACD, Stochastic and VWAP, as batch functions aligned to their input and as incremental calculators for live feeds. `TradingChart` uses them, and apps can use them directly.

## Requirements
### Requirement: Indicator functions

The system SHALL export pure functions `sma`, `ema`, `wma`, `rsi`, `bollinger`, `atr`, `adx`, `macd`, `stochastic` and `vwap` that take a `number[]` of values or a `Candle[]` (for indicators that need high, low or volume) plus parameters, and return output aligned index-for-index with the input, using `null` for warm-up positions. Multi-output indicators SHALL return an object of aligned arrays: `bollinger` → `{ middle, upper, lower }`, `adx` → `{ adx, plusDI, minusDI }`, `macd` → `{ macd, signal, histogram }`, `stochastic` → `{ k, d }`. Definitions SHALL follow design D4 (Wilder smoothing for RSI/ATR/ADX, SMA-seeded EMA, population standard deviation for Bollinger Bands, session-reset VWAP).

#### Scenario: Output is aligned with warm-up nulls

- **GIVEN** 30 closes
- **WHEN** `sma(closes, 10)` is called
- **THEN** the result SHALL have length 30, indices 0–8 SHALL be `null`, and index 9 SHALL equal the mean of the first 10 closes

#### Scenario: Reference values

- **GIVEN** the fixture series used in the test suite with published reference outputs
- **WHEN** `rsi(closes, 14)`, `atr(candles, 14)` and `adx(candles, 14)` are computed
- **THEN** each value SHALL match the reference within 1e-6 relative error

### Requirement: Incremental calculators

For every indicator the system SHALL export a factory (`createSMA`, `createEMA`, …) returning a calculator with `next(input)` that appends a bar and `update(input)` that revises the most recent bar, each returning the current output in O(1) amortised time.

#### Scenario: Batch and incremental agree

- **GIVEN** a candle series
- **WHEN** it is fed bar by bar to an incremental calculator, including `update` calls that revise the last bar before it closes
- **THEN** every output SHALL equal the batch function's output for the same final series

