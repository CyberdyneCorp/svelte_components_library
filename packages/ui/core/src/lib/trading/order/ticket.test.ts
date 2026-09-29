import { describe, expect, it } from "vitest";
import { BTC_USDT, ETH_USDT, ticketState } from "../../_testdata/trading.js";
import { baseSize, entryPrice, normalizeDraft, notionalOf, quoteToBase } from "./ticket.js";

describe("entryPrice", () => {
  it.each([
    ["limit", { price: "64000.0" }, undefined, "64000.0"],
    ["stop-limit", { price: "64000.0", triggerPrice: "63000.0" }, undefined, "64000.0"],
    ["stop-market", { triggerPrice: "63000.0" }, "1", "63000.0"],
    ["market", {}, "64100", "64100"],
    ["market", {}, undefined, undefined],
    ["limit", { price: null }, "64100", undefined],
    ["limit", { price: "0" }, undefined, undefined],
  ] as const)("%s %o ref %s → %s", (type, fields, reference, expected) => {
    expect(entryPrice(ticketState({ type, ...fields }), reference)).toBe(expected);
  });
});

describe("baseSize", () => {
  it("rounds a base size down to the step", () => {
    expect(baseSize(ticketState({ size: "0.0159" }), BTC_USDT, "64000")).toBe("0.015");
  });

  it("converts a quote size at the entry and rounds down (spec: 1000 USDT at 64000 → 0.015)", () => {
    const state = ticketState({ size: "1000.00", sizeUnit: "quote" });
    expect(baseSize(state, BTC_USDT, "64000")).toBe("0.015");
    expect(quoteToBase("1000", "64000", BTC_USDT)).toBe("0.015");
  });

  it("needs an entry to convert a quote size", () => {
    expect(baseSize(ticketState({ sizeUnit: "quote", size: "10" }), BTC_USDT)).toBeUndefined();
  });

  it("is undefined without a positive size", () => {
    expect(baseSize(ticketState({ size: null }), BTC_USDT, "1")).toBeUndefined();
    expect(baseSize(ticketState({ size: "0" }), BTC_USDT, "1")).toBeUndefined();
  });

  it("uses step sizes that are not a power of ten", () => {
    const market = { ...ETH_USDT, stepSize: "0.05" };
    expect(baseSize(ticketState({ size: "1.29" }), market, "1")).toBe("1.25");
  });
});

describe("notionalOf", () => {
  it("multiplies exactly", () => {
    expect(notionalOf("0.015", "64000.0")).toBe("960.0000");
    expect(notionalOf(undefined, "1")).toBeUndefined();
  });
});

describe("normalizeDraft", () => {
  it("spec scenario: quote-denominated size is normalised", () => {
    const state = ticketState({ side: "long", price: "64000", size: "1000", sizeUnit: "quote" });
    expect(normalizeDraft(state, BTC_USDT)).toEqual({
      market: "BTC-USDT",
      side: "long",
      type: "limit",
      size: "0.015",
      sizeUnit: "base",
      price: "64000.0",
      leverage: 10,
      marginMode: "cross",
      reduceOnly: false,
      postOnly: false,
      timeInForce: "GTC",
    });
  });

  it("rounds prices to the tick (nearest) and keeps only the fields the type uses", () => {
    const state = ticketState({
      type: "stop-limit",
      price: "64000.7",
      triggerPrice: "63999.2",
      takeProfit: "70000.3",
      stopLoss: "60000.8",
      postOnly: true,
    });
    const draft = normalizeDraft(state, BTC_USDT);
    expect(draft).toMatchObject({
      price: "64000.5",
      triggerPrice: "63999.0",
      takeProfit: "70000.5",
      stopLoss: "60001.0",
      postOnly: false, // post-only is limit-only
    });
  });

  it("drops the limit price of market and stop-market orders", () => {
    const market = normalizeDraft(ticketState({ type: "market", price: "1" }), BTC_USDT, "64000");
    expect(market).not.toHaveProperty("price");
    expect(market).not.toHaveProperty("triggerPrice");
    const stop = normalizeDraft(
      ticketState({ type: "stop-market", price: "1", triggerPrice: "63000" }),
      BTC_USDT,
    );
    expect(stop).toMatchObject({ triggerPrice: "63000.0" });
    expect(stop).not.toHaveProperty("price");
  });

  it("keeps post-only for limit orders", () => {
    expect(normalizeDraft(ticketState({ postOnly: true }), BTC_USDT)?.postOnly).toBe(true);
  });

  it("is undefined without a size", () => {
    expect(normalizeDraft(ticketState({ size: null }), BTC_USDT)).toBeUndefined();
  });
});
