# trading-chart Specification

## Purpose
`TradingChart` (`trading/chart/`) is a canvas candlestick chart for trading terminals, drawn by the library's own engine with no third-party charting dependency. It shows price series, volume, indicator overlays and sub-panes, trade markers and draggable price lines, updates live, reads its colours from foundation tokens, and stays usable by keyboard and screen reader through a named summary, live announcements and a data table.

## Requirements
### Requirement: Canvas candlestick chart

The system SHALL provide `TradingChart`, rendering `candles: Candle[]` on canvas as candles, hollow candles, OHLC bars, line or area (`seriesType`), with an optional volume histogram, price and time axes, grid, a last-price label, and a crosshair with an OHLCV legend. It SHALL use only its own engine (design D3), with no third-party charting dependency, render sharply at any `devicePixelRatio`, follow container resizes, and read all colours from foundation tokens, re-reading them when the theme changes.

#### Scenario: Theme change repaints

- **GIVEN** a rendered chart
- **WHEN** `data-theme` on `<html>` changes
- **THEN** the chart SHALL repaint using the new theme's token values without remounting

### Requirement: Navigation

`TradingChart` SHALL support drag to pan, wheel or pinch to zoom around the pointer, and double-click to reset, and when focused SHALL support ←/→ (move crosshair one bar), Shift+←/→ (pan), +/− (zoom) and Home/End (first/last bar). It SHALL report the visible range through `onrangechange` and the hovered bar through `oncrosshairmove`.

#### Scenario: Keyboard crosshair announces the bar

- **GIVEN** a focused chart
- **WHEN** the user presses → three times
- **THEN** the crosshair SHALL move three bars right and a polite live region SHALL announce that bar's time and OHLC

### Requirement: Indicators and panes

`TradingChart` SHALL accept `indicators` as an array of `{ type, pane, …params, color? }` covering every function in `trading-indicators`. `pane: "main"` overlays the price pane (any number of moving averages; Bollinger Bands drawn with a band fill; VWAP), and any other pane id creates a sub-pane below with its own price scale (RSI with 30/70 guides, MACD with a histogram, ATR, ADX with +DI/−DI, Stochastic, volume). Sub-pane heights SHALL be resizable by dragging the separator and settable via `paneHeights`.

#### Scenario: Multiple moving averages and an RSI pane

- **GIVEN** `indicators` = EMA 9, EMA 21, SMA 200 on `main` and RSI 14 on `rsi`
- **WHEN** the chart renders
- **THEN** three overlay lines SHALL appear on the price pane and one RSI sub-pane with 30/70 guides SHALL appear below

### Requirement: Markers and price lines

`TradingChart` SHALL draw `markers: ChartMarker[]` anchored to bars and `priceLines: PriceLine[]` as horizontal lines with an axis label (design D5), colouring them by `kind` with token defaults. A `draggable` price line SHALL call `onpricelinechange(id, price)` with the price snapped to the market's `tickSize`.

#### Scenario: Dragging a stop-loss line

- **GIVEN** a draggable price line of kind `stop-loss` and a market with `tickSize` `"0.5"`
- **WHEN** the user drags it to a price of 63990.3
- **THEN** `onpricelinechange` SHALL be called with that line's id and 63990.5

### Requirement: Keyboard price-line editing

When `priceLines` contains a `draggable` line, `TradingChart` SHALL offer a keyboard alternative to dragging it: while the chart is focused, L selects the next draggable line (Shift+L the previous), ↑/↓ move the selected line by one `tickSize` (Shift: ten ticks), Enter applies the move by calling `onpricelinechange(id, price)` with a tick-snapped price, and Escape (or leaving the chart) cancels it without calling `onpricelinechange`. Each step SHALL be announced through the chart's polite live region, the chart's description SHALL explain these keys only when a draggable line exists, and every string SHALL be localisable through `labels`.

#### Scenario: Moving a stop-loss with the keyboard

- **GIVEN** a focused chart with a draggable `stop-loss` line at 64000 and a market with `tickSize` `"0.5"`
- **WHEN** the user presses L, ↓, Shift+↓ and Enter
- **THEN** `onpricelinechange` SHALL be called once with that line's id and 63994.5, and the live region SHALL announce "SL set to 63,994.5"

#### Scenario: Cancelling a keyboard edit

- **GIVEN** a selected draggable line that has been moved with ↑
- **WHEN** the user presses Escape
- **THEN** `onpricelinechange` SHALL NOT be called and the line SHALL be drawn at its original price

### Requirement: Live updates

When the last candle is replaced (same `time`) or a new candle is appended, `TradingChart` SHALL update the series and indicators incrementally, without recomputing indicators over the whole series, and SHALL keep following the latest bar only if the view was already at the right edge.

#### Scenario: Scrolled-back view does not jump

- **GIVEN** the user has panned 200 bars into the past
- **WHEN** a new candle is appended
- **THEN** the visible range SHALL stay where it was

### Requirement: Accessible fallback

`TradingChart` SHALL expose a named image (symbol, interval, visible range, last close and change), a "Show data" toggle for a table of the latest bars (OHLCV plus active indicator values, 50 by default) and localisable strings through `labels`. Its stories SHALL pass axe in failing mode.

#### Scenario: Data table lists indicators

- **GIVEN** a chart with EMA 21 and RSI 14
- **WHEN** the user activates "Show data"
- **THEN** a table SHALL list the latest bars with Open, High, Low, Close, Volume, EMA 21 and RSI 14 columns

