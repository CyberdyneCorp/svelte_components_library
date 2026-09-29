---
"@cyberdynecorp/svelte-ui-core": minor
---

Trading indicators. New framework-free batch functions `sma`, `ema`, `wma`, `rsi`, `bollinger`, `atr`, `adx` (+DI/−DI), `macd`, `stochastic` and `vwap` returning series aligned with the input (`null` during warm-up; `bollinger` → `{ middle, upper, lower }`, `adx` → `{ adx, plusDI, minusDI }`, `macd` → `{ macd, signal, histogram }`, `stochastic` → `{ k, d }`), plus incremental calculators `createSMA` … `createVWAP` with O(1) `next` (append a bar) and `update` (revise the last bar), and the `trueRange` helper. Wilder smoothing for RSI/ATR/ADX, SMA-seeded EMA, population standard deviation for Bollinger Bands, VWAP with a configurable session reset (default UTC day). Invalid parameters or non-finite prices throw a `RangeError`.
