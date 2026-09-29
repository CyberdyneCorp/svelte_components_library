## 1. Foundation (PR 1, merges first)

- [ ] 1.1 `trading/types.ts` with the D2 types, exported from the core barrel under `// Trading`
- [ ] 1.2 `trading/format.ts`: `roundToTick`, `roundToStep` (string maths, modes down/up/nearest), `formatPrice`, `formatSize`, precision derived from tick/step; unit tests incl. spec scenarios
- [ ] 1.3 Foundation trade tokens (`--color-trade-{long,short}{,-bg,-text}`) in `:root`, light, calm/calm-dark and all 17 style presets; extend preset completeness + AA contrast tests
- [ ] 1.4 Changesets (core minor, foundation minor)

## 2. Indicators (PR 2)

- [ ] 2.1 Batch functions: sma, ema, wma, rsi, bollinger, atr, adx (+DI/−DI), macd, stochastic, vwap
- [ ] 2.2 Incremental calculators (`next` / `update`) for each
- [ ] 2.3 Reference-value fixtures and batch ≡ incremental property tests
- [ ] 2.4 Exports + README + changeset

## 3. Chart (PR 3)

- [ ] 3.1 Engine: timeScale, priceScale (linear/log), layout/panes, scheduler, DPR + ResizeObserver
- [ ] 3.2 Renderers: candles, hollow, OHLC bars, line, area, histogram, band fill, grid, axes, last-price label, crosshair + legend
- [ ] 3.3 Interaction: pan, wheel/pinch zoom, double-click reset, keyboard (←/→, Shift+←/→, +/−, Home/End), follow-latest behaviour
- [ ] 3.4 `TradingChart` component: props, `indicators` wiring (via PR 2 functions), sub-panes with draggable separators, markers, price lines (draggable, tick-snapped), live last-bar/append updates
- [ ] 3.5 Theming from tokens with live theme switching; reduced motion
- [ ] 3.6 Accessibility: named image, live-region crosshair announcements, data table with indicator columns, `labels`
- [ ] 3.7 Tests: engine units (scales, layout, hit-testing), renderer tests against a recording context, component tests, Storybook stories (basic, indicators, markers/price lines, live feed, 100k candles perf) in axe failing mode
- [ ] 3.8 README + changeset

## 4. Order entry (PR 4)

- [ ] 4.1 `LeverageSlider`
- [ ] 4.2 `OrderTicket` with MoneyInput asset-mode fields, validation, preview, `estimateLiquidation` hook, normalized `onsubmit`
- [ ] 4.3 `PositionsTable`, `OpenOrdersTable` with callbacks and empty states
- [ ] 4.4 Tests (spec scenarios, keyboard, validation matrix) + stories in axe failing mode + README + changeset

## 5. Market data (PR 5)

- [ ] 5.1 `OrderBook` (grouping, depth bars, spread, layouts, `onpriceclick`)
- [ ] 5.2 `RecentTrades`
- [ ] 5.3 `TickerBar` with funding countdown
- [ ] 5.4 rAF coalescing, reduced-motion flashes
- [ ] 5.5 Tests + stories in axe failing mode + README + changeset

## 6. Integration (PR 6)

- [ ] 6.1 `Trading/Terminal` story combining chart, ticket, book, trades, ticker and tables with a simulated feed
- [ ] 6.2 README Trading section and Getting-Started snippet
- [ ] 6.3 `openspec validate --all --strict`; tick this list; archive after release
