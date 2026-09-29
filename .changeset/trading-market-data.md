---
"@cyberdynecorp/svelte-ui-core": minor
---

Trading market-data widgets: `OrderBook` (decimal-string price grouping — bids round down, asks up — cumulative totals with depth bars, spread absolute and %, `both` / `bids` / `asks` layouts, `levels`, keyboard-operable `onpriceclick`), `RecentTrades` (newest first, side shown by colour plus a ▲/▼ glyph labelled Buy/Sell, `timeZone`, windowed list, new-trade flash disabled under `prefers-reduced-motion`) and `TickerBar` (last/mark/index, 24h change/high/low/volume/turnover, open interest, funding rate with a live `HH:MM:SS` countdown, absent fields omitted). All three coalesce prop updates to one render per animation frame and take a typed `labels` prop. Also exports `createFrameCoalescer`, `buildBook`, `groupLevels`, `computeSpread`, `defaultGroupingOptions` and `formatCountdown`.
