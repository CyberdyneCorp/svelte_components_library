---
"@cyberdynecorp/svelte-ui-core": minor
---

Trading types and precision helpers. New `trading/` category exporting the shared trading types (`Side`, `OrderType`, `TimeInForce`, `MarginMode`, `Candle`, `MarketSpec`, `OrderDraft`, `Position`, `OpenOrder`, `BookLevel`, `Trade`, `Ticker`, `ChartMarker`, `PriceLine`, `RoundingMode`) and decimal-string precision helpers: `roundToTick` / `roundToStep` (modes `down` | `up` | `nearest`, BigInt maths, ties half away from zero), `formatPrice` / `formatSize` (precision from `pricePrecision` / `sizePrecision` or derived from `tickSize` / `stepSize`), `precisionOf`, `pricePrecisionOf` and `sizePrecisionOf`. Invalid input throws a `RangeError`.
