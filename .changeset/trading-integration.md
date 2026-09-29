---
"@cyberdynecorp/svelte-ui-core": minor
---

`TradingChart`: keyboard editing of draggable price lines, the accessible alternative to dragging. With the chart focused, L selects the next draggable line (Shift+L the previous), ↑/↓ move it one tick (Shift: ten ticks), Enter applies it through `onpricelinechange(id, price)` with a tick-snapped price, and Escape (or blurring the chart) cancels. Steps are announced in the chart's polite live region; the description explains the keys only when a draggable line exists. New `labels` keys: `priceLineHint`, `priceLine`, `priceLineEdit.{select,move,commit,cancel}`.

Fixed: the chart's throttled live announcements threw "Illegal invocation" in browsers when a second announcement arrived within the throttle window (`setTimeout` was called as a method of another object).

Docs: a `Trading/Terminal` story (ticker, chart with indicators, fills and position lines, order book → ticket, trades, positions and open orders on one simulated feed), a Trading overview table and terminal Getting-Started snippet in the README, and JSDoc units on `Ticker.changePct24h` / `Position.roe` (percentages) and `Ticker.fundingRate` (fraction). The order-book decimal helpers now share `trading/decimal.ts`.
