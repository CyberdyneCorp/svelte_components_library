## Why

New products will trade perpetual futures (long / short) and need the usual trading-terminal UI. The library has almost nothing for it today:

- `retro/PriceChart` is an 88-line fixed-size SVG with pixel styling: no axes, zoom, pan, crosshair, volume, overlays or live updates.
- `retro/DepthChart` shows order-book depth only, and `crypto/` covers spot swaps (`SwapInterface`, `TokenSelector`, `PriceDisplay`), not derivatives.
- There are no technical indicators (moving averages, RSI, Bollinger Bands, ATR, ADX, MACD, …) and no futures components (order ticket, leverage, positions, liquidation price, order book, funding).

Decisions made with the maintainer (2026-09-29):

- **Own canvas engine**, no third-party charting dependency (lightweight-charts was considered and rejected).
- "ATX" means **ADX** (with +DI / −DI); "markets on the graph" means **trade markers** (entry/exit arrows on bars) plus **price lines** (entry, take-profit, stop-loss, liquidation).
- The first release covers all four areas: chart + indicators, order ticket, positions & orders tables, market-data widgets.

## What Changes

A new `trading/` category in `@cyberdynecorp/svelte-ui-core` plus two token groups in foundation. Everything is UI and pure computation: **no exchange connectivity, no order routing, no trading advice**. Components receive data via props and report user intent via callbacks.

1. **Foundation (shared contracts)**
   - `trading/types.ts`: `Candle`, `MarketSpec`, `Side`, `OrderType`, `TimeInForce`, `MarginMode`, `OrderDraft`, `Position`, `OpenOrder`, `BookLevel`, `Trade`, `Ticker`.
   - `trading/format.ts`: price/size formatting and rounding to `tickSize` / `stepSize` with decimal-string math (reusing the core money helpers where they fit).
   - Foundation tokens `--color-trade-long`, `--color-trade-short` (+ `-bg`, `-text` variants) defined in `:root`, `light` and every theme preset, so up/down colours are themeable (e.g. red-up markets).
2. **Indicators** (`trading/indicators/`): pure, framework-free TypeScript: SMA, EMA, WMA, RSI, Bollinger Bands, ATR, ADX (+DI/−DI), MACD, Stochastic, VWAP. Batch functions return arrays aligned to the input (`null` during warm-up), plus incremental calculators for live last-bar updates.
3. **Chart** (`trading/chart/`): `TradingChart`, a canvas candlestick chart backed by an internal engine:
   - series: candles, hollow candles, OHLC bars, line, area, volume histogram
   - main pane overlays (any number of moving averages, Bollinger band fill, VWAP) and resizable sub-panes (RSI, MACD, ATR, ADX, Stochastic, volume)
   - pan, zoom, crosshair with OHLC legend, price/time axes, last-price label
   - trade markers and horizontal price lines
   - efficient live updates of the last bar and appending new bars
   - an accessible fallback: named image, keyboard crosshair with live announcements, and a data table
4. **Order entry & account** (`trading/order/`): `OrderTicket` (Long/Short, market/limit/stop-market/stop-limit, size in base or quote, size-% slider, leverage, cross/isolated, reduce-only, post-only, time-in-force, TP/SL, cost/margin/fee preview), `LeverageSlider`, `PositionsTable`, `OpenOrdersTable`.
5. **Market data** (`trading/market/`): `OrderBook` (bids/asks with depth bars, price grouping, spread), `RecentTrades`, `TickerBar` (last/mark/index price, 24h change/high/low/volume, funding rate with countdown, open interest).

All user-facing strings go through a typed `labels` prop, consistent with the charts. All components run axe in failing mode in Storybook.

## Capabilities

### New Capabilities

- `trading-foundation`: shared trading types, precision helpers and long/short colour tokens.
- `trading-indicators`: technical-indicator computation.
- `trading-chart`: the canvas candlestick chart and its engine.
- `trading-order-entry`: order ticket, leverage control, positions and open-orders tables.
- `trading-market-data`: order book, recent trades and ticker bar.

### Modified Capabilities

- `design-foundation`: adds the trade colour tokens (they are themed, so every preset must define them).

## Non-goals

- Connecting to exchanges or brokers, websockets, authentication, order routing or risk checks. Consumers own all data and side effects.
- Computing exchange-specific values such as liquidation price, fees or funding. They are passed in, or produced by consumer callbacks (`estimate` hooks).
- Drawing tools (trend lines, Fibonacci, annotations), chart replay, multi-symbol comparison and saved layouts. These are candidates for a later change.
- Replacing `retro/PriceChart` / `retro/DepthChart`; they stay as the retro-styled variants.
- Investment or trading advice of any kind.

## Impact

- New `packages/ui/core/src/lib/trading/**`, exported from the core barrel under a `// Trading` section.
- `packages/ui/foundation/src/lib/styles/colors.css` and every `themes/*.css` preset (plus `presets.test.ts` / `style-tokens.test.ts` coverage).
- README (new Trading section), Storybook `Trading/*` stories and a Getting-Started snippet.
- Minor bumps of `@cyberdynecorp/svelte-ui-core` and `@cyberdynecorp/svelte-ui-foundation`. No new runtime dependencies.
