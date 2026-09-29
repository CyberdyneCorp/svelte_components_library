import { describe, it, expect, expectTypeOf } from "vitest";
// Type-only import from the package barrel: erased at runtime, checked by svelte-check.
import type {
  BookLevel,
  Candle,
  ChartMarker,
  MarketSpec,
  OpenOrder,
  OrderDraft,
  Position,
  PriceLine,
  Side,
  Ticker,
  Trade,
} from "../index.js";

describe("trading types", () => {
  it("resolve from the core barrel with the D2 fields", () => {
    const candle: Candle = { time: Date.UTC(2026, 0, 1), open: 1, high: 2, low: 0.5, close: 1.5 };
    const market: MarketSpec = {
      symbol: "BTC-PERP",
      baseAsset: "BTC",
      quoteAsset: "USDT",
      tickSize: "0.5",
      stepSize: "0.001",
      minSize: "0.001",
      maxLeverage: 100,
    };
    const draft: OrderDraft = {
      market: market.symbol,
      side: "long",
      type: "limit",
      size: "0.015",
      sizeUnit: "base",
      price: "64123.5",
      leverage: 20,
      marginMode: "isolated",
      reduceOnly: false,
      postOnly: true,
      timeInForce: "GTC",
    };
    expect([candle.close, market.tickSize, draft.price]).toEqual([1.5, "0.5", "64123.5"]);

    expectTypeOf<Candle["volume"]>().toEqualTypeOf<number | undefined>();
    expectTypeOf<Side>().toEqualTypeOf<"long" | "short">();
    expectTypeOf<Trade["side"]>().toEqualTypeOf<"buy" | "sell">();
    expectTypeOf<Position["entryPrice"]>().toEqualTypeOf<string>();
    expectTypeOf<OpenOrder["createdAt"]>().toEqualTypeOf<number>();
    expectTypeOf<BookLevel>().toEqualTypeOf<{ price: string; size: string }>();
    expectTypeOf<Ticker["nextFundingTime"]>().toEqualTypeOf<number | undefined>();
    expectTypeOf<ChartMarker["position"]>().toEqualTypeOf<"above" | "below" | "at">();
    expectTypeOf<PriceLine["price"]>().toEqualTypeOf<number>();
  });
});
