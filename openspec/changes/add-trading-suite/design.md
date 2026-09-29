## Context

The library is Svelte 5 (runes), styled only through CSS custom properties from `@cyberdynecorp/svelte-ui-foundation`, with 20 theme presets that must each define every themed token. Charts use `ChartFrame` for accessible names, a data-table fallback and typed `labels`. Money inputs and displays use **decimal strings** and string/BigInt math (`forms/MoneyInput/money.ts`, `forms/MoneyInput/asset.ts`). All stories run axe in failing mode. The only optional peer dependency is `cesium`; this change adds none.

## Goals / Non-Goals

**Goals:** a fast, themeable, accessible futures UI kit whose pieces work alone or together, with contracts stable enough that a consuming app can wire them to any exchange.

**Non-goals:** see proposal (no connectivity, no exchange-specific maths, no drawing tools).

## Decisions

### D1. Numbers vs decimal strings

- **Chart and indicators use `number`** (float64). Candle maths runs on thousands of values per frame; strings would be far too slow. Float precision is fine for plotting and for indicator values.
- **Order entry, positions, orders, book, trades and ticker use decimal strings** for prices and sizes (`"64123.5"`, `"0.0015"`), like `MoneyInput`. They are displayed and edited exactly, and rounded to `tickSize` / `stepSize` with string maths, so an order never carries float noise such as `0.30000000000000004`.
- `format.ts` bridges the two: `formatPrice(value: number | string, market)` accepts either.

### D2. Shared types (`trading/types.ts`)

```ts
type Side = "long" | "short";
type OrderType = "market" | "limit" | "stop-market" | "stop-limit";
type TimeInForce = "GTC" | "IOC" | "FOK";
type MarginMode = "cross" | "isolated";
interface Candle { time: number; open: number; high: number; low: number; close: number; volume?: number } // time = UTC ms, bar open
interface MarketSpec {
  symbol: string; baseAsset: string; quoteAsset: string;
  tickSize: string; stepSize: string; minSize: string; maxSize?: string; minNotional?: string;
  maxLeverage: number; pricePrecision?: number; sizePrecision?: number; // derived from tick/step if omitted
}
interface OrderDraft {
  market: string; side: Side; type: OrderType; size: string; sizeUnit: "base" | "quote";
  price?: string; triggerPrice?: string; leverage: number; marginMode: MarginMode;
  reduceOnly: boolean; postOnly: boolean; timeInForce: TimeInForce;
  takeProfit?: string; stopLoss?: string;
}
interface Position { id: string; market: string; side: Side; size: string; entryPrice: string; markPrice: string;
  liquidationPrice?: string; margin: string; leverage: number; marginMode: MarginMode;
  unrealizedPnl: string; roe?: string; takeProfit?: string; stopLoss?: string }
interface OpenOrder { id: string; market: string; side: Side; type: OrderType; size: string; filled: string;
  price?: string; triggerPrice?: string; reduceOnly: boolean; timeInForce: TimeInForce; createdAt: number }
interface BookLevel { price: string; size: string }
interface Trade { id: string; price: string; size: string; side: "buy" | "sell"; time: number }
interface Ticker { market: string; last: string; mark?: string; index?: string; change24h?: string; changePct24h?: string;
  high24h?: string; low24h?: string; volume24h?: string; quoteVolume24h?: string; openInterest?: string;
  fundingRate?: string; nextFundingTime?: number }
```

These types are the contract between all the implementation PRs. They are created first, and changing them later requires updating this design.

### D3. Chart engine architecture (`trading/chart/engine/`)

Framework-free TypeScript modules, driven by the Svelte `TradingChart` component:

| Module | Responsibility |
|---|---|
| `timeScale` | Index-based x axis: each bar gets one slot, and gaps such as weekends are skipped the way trading terminals do. It holds `barSpacing` and `rightOffset` (the visible range) and maps index ↔ x. Time labels come from the bar times at a density suited to the zoom level. |
| `priceScale` | Linear or log y scale per pane. Auto-fits to the visible bars plus the pane's overlays, with margins. Nice-number tick generation. Precision comes from `MarketSpec`. |
| `layout` | Panes: main plus sub-panes with height ratios and draggable separators, and the axis gutters. |
| `renderers/*` | Pure `draw(ctx, view, data)` functions per series type (candles, hollow, bars, line, area, histogram, band fill), plus grid, axes, crosshair, markers, price lines and last-price label. |
| `interaction` | Pointer handling: drag to pan, wheel and pinch to zoom around the cursor, and double-click to reset. Keyboard: ←/→ move the crosshair one bar, Shift+←/→ pan, +/− zoom, Home/End jump to the first/last bar. |
| `scheduler` | A dirty flag plus one `requestAnimationFrame` per frame. Rendering happens only when something changed. |

- **Canvases:** two stacked canvases per chart. The main layer holds the series and grid; the overlay layer holds the crosshair and legend hover, so moving the pointer doesn't redraw the series. Backing stores are scaled by `devicePixelRatio`, and a `ResizeObserver` handles size changes.
- **Render cost:** only the visible bars, plus one bar either side, are drawn. Indicator values are computed once per data change, not per frame.
- **Live updates:** replacing the last candle, or appending a new one, updates only the tail of the indicator series (incremental calculators, D4) and marks the view dirty. If the user is scrolled to the latest bar, the view follows new bars; otherwise it stays where it is.
- **Theming:** colours are read from CSS custom properties with `getComputedStyle` at mount, and re-read when `data-theme` / `class` changes on `<html>` (`MutationObserver`) or the colour scheme changes (`matchMedia`). There are no hard-coded colours except as fallbacks.
- **Reduced motion:** there are no animations apart from the panning inertia, and that is off under `prefers-reduced-motion`.
- **Performance targets:** load 100k candles, pan and zoom at 60 fps with about 2k visible bars on a mid-range laptop, and apply a live last-bar update in under 1 ms of script time.

### D4. Indicators (`trading/indicators/`)

- **Batch functions** take either a `number[]` of prices (e.g. closes) or `Candle[]` (for indicators that need high/low/volume), plus params. They return arrays aligned to the input, with `null` during warm-up. Multi-output indicators return an object of aligned arrays, e.g. `bollinger → { middle, upper, lower }`, `adx → { adx, plusDI, minusDI }`, `macd → { macd, signal, histogram }`.
- **Definitions follow the common TA-Lib / Wilder conventions:**
  - RSI, ATR and ADX use Wilder smoothing.
  - EMA is seeded with the SMA of the first `period` values.
  - Bollinger Bands use the population standard deviation.
  - VWAP resets on a configurable session boundary (default: UTC day).
- **Incremental calculators** (`createEMA(period)` etc.) expose `next(value)` for a new bar and `update(value)` to revise the current bar, so the chart updates in O(1) per tick.
- **Tests** check the functions against published reference values for fixed inputs, and check that batch and incremental outputs are identical.
- **Chart wiring:** the chart consumes indicators declaratively, e.g. `indicators={[{ type: "ema", period: 21, pane: "main" }, { type: "rsi", period: 14, pane: "rsi" }]}`. The same functions are exported for apps that need the values, for example for signals or tables.

### D5. Markers and price lines

```ts
interface ChartMarker { time: number; position: "above" | "below" | "at"; shape: "arrow-up" | "arrow-down" | "circle" | "square";
  color?: string; text?: string; id?: string }
interface PriceLine { price: number; kind?: "entry" | "take-profit" | "stop-loss" | "liquidation" | "custom";
  label?: string; color?: string; style?: "solid" | "dashed" | "dotted"; draggable?: boolean; id?: string }
```

- **Default colours:** each `kind` maps to a token (entry → neutral, take-profit → long, stop-loss → short, liquidation → warning), and `color` overrides it.
- **Dragging:** a `draggable` line calls `onpricelinechange(id, price)` with the price snapped to `tickSize`. This is how an app lets the user drag TP/SL on the chart.

### D6. Accessibility

The canvas is not accessible by itself, so `TradingChart` wraps it the way `ChartFrame` does:

- A named figure: `role="img"` with an aria-label summarising the symbol, interval, visible range and the last close/change.
- A "Show data" toggle for a table of the most recent N bars (default 50) with OHLCV and the active indicator values.
- A keyboard crosshair (focusable chart, D3 keys) whose current bar is announced through a polite `aria-live` region, throttled.

The ticket, tables and widgets use native controls:

- The side toggle is a radio group.
- The leverage slider is `input[type=range]` with `aria-valuetext` ("20×").
- The tables are real tables.
- Price-flash colour is never the only signal: text and ▲/▼ glyphs are used too.

### D7. Order ticket behaviour

- **Controlled output:** the ticket never submits by itself. `onsubmit(draft: OrderDraft)` fires with a normalized draft, meaning prices rounded to `tickSize`, size rounded down to `stepSize`, and size converted to base if it was entered in quote.
- **Validation:** runs against `MarketSpec` and `available` margin: min/max size, min notional, leverage ≤ `maxLeverage`, and TP/SL on the correct side of the entry for the chosen side. Errors are shown inline and block submit.
- **Preview** shows the notional, the required initial margin (= notional / leverage) and the estimated fee (`makerFee` / `takerFee` props). The estimated liquidation price comes from an optional consumer callback `estimateLiquidation?(draft) => string | undefined`, because it is exchange-specific.
- **Inputs** use `MoneyInput` in asset mode (`decimals` from `tickSize` / `stepSize`, quote/base asset codes), so typing, pasting and locale separators work exactly like the rest of the library.

### D8. Market-data widgets

- **`OrderBook`:**
  - takes `bids` and `asks` (`BookLevel[]`, best first) and aggregates them by a selectable `grouping` step (multiples of `tickSize`)
  - shows the cumulative size as a background depth bar
  - shows the spread (absolute and %) between the two sides
  - `onpriceclick(price)` lets the app fill the ticket
  - the layout can be `both`, `bids` or `asks`, and levels shown per side is configurable
- **`RecentTrades`:** a virtualised list (reusing `VirtualizedList` if it fits) with side colouring.
- **`TickerBar`:** a horizontal strip with a funding countdown to `nextFundingTime`, ticking every second.
- **High update rates:** incoming prop changes are coalesced to one render per animation frame. Flash-on-change is subtle and disabled under reduced motion.

### D9. Tokens

Foundation adds `--color-trade-long`, `--color-trade-long-bg`, `--color-trade-long-text`, `--color-trade-short`, `--color-trade-short-bg` and `--color-trade-short-text`.

- **`:root` and `light`:** mapped to the existing success/error primitives.
- **Presets:** every theme preset defines them with AA contrast for the text variant against its surfaces, enforced by the existing preset contrast tests.
- **Red-up markets:** a consumer can swap them in one place.

### D10. Delivery plan (PRs)

1. **Foundation PR:** `types.ts`, `format.ts`, tokens and this change. It merges first, and the others branch from it.
2. **Four parallel PRs:**
   - Indicators.
   - Chart. It can start on the engine immediately and wire indicators through the D4 signatures, merging after Indicators.
   - Order entry.
   - Market data.
3. **Integration PR:** a `Trading/Terminal` story combining everything, the README Trading section, and ticking `tasks.md`.

## Risks / Trade-offs

- **Own engine = larger maintenance surface.** Mitigation: a strict module split (D3), pure renderers that are unit-tested against a recording 2D-context mock, and Playwright visual smoke tests on a few stories.
- **Canvas in jsdom:** unit tests use a mock context, and real rendering is checked in the Storybook browser project (Chromium).
- **Float drift in indicators** is acceptable for display. Order maths never uses floats (D1).
- **Bundle size:** the whole `trading/` category is tree-shakeable, and the engine is imported only by `TradingChart`.

## Open Questions

- **Timezone for time-axis labels:** the proposal is UTC by default with a `timeZone` prop using `Intl`.
- **Heikin-Ashi:** add it as a series type now, or later? Proposed later.
