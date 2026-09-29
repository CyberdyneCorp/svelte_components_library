/**
 * Technical indicators (OpenSpec add-trading-suite, design D4): pure,
 * framework-free batch functions returning series aligned with the input
 * (`null` during warm-up) plus O(1) incremental calculators with
 * `next` (append a bar) / `update` (revise the last bar).
 */
export type { IndicatorCalculator, IndicatorSeries, IndicatorValue } from "./calculator.js";
export { createEMA, createSMA, createWMA, ema, sma, wma } from "./averages.js";
export { createRSI, rsi } from "./rsi.js";
export { bollinger, createBollinger } from "./bollinger.js";
export type { BollingerOptions, BollingerResult, BollingerValue } from "./bollinger.js";
export { atr, createATR, trueRange } from "./atr.js";
export { adx, createADX } from "./adx.js";
export type { AdxResult, AdxValue } from "./adx.js";
export { createMACD, macd } from "./macd.js";
export type { MacdOptions, MacdResult, MacdValue } from "./macd.js";
export { createStochastic, stochastic } from "./stochastic.js";
export type { StochasticOptions, StochasticResult, StochasticValue } from "./stochastic.js";
export { createVWAP, vwap } from "./vwap.js";
export type { VwapOptions, VwapSession } from "./vwap.js";
