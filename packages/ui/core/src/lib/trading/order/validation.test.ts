import { describe, expect, it } from "vitest";
import { BTC_USDT, ticketState } from "../../_testdata/trading.js";
import type { MarketSpec } from "../types.js";
import { DEFAULT_ORDER_TICKET_LABELS as L } from "./labels.js";
import type { TicketState } from "./ticket.js";
import { hasErrors, validateTicket, type ValidationContext } from "./validation.js";

function validate(overrides: Partial<TicketState>, ctx: Partial<ValidationContext> = {}) {
  return validateTicket(ticketState(overrides), { market: BTC_USDT, labels: L, ...ctx });
}

describe("validateTicket", () => {
  it("accepts a valid limit order", () => {
    const errors = validate({});
    expect(errors).toEqual({});
    expect(hasErrors(errors)).toBe(false);
  });

  describe("size", () => {
    it.each([
      [{ size: null }, L.errorRequired],
      [{ size: "  " }, L.errorRequired],
      [{ size: "0" }, L.errorPositive],
      [{ size: "-1" }, L.errorPositive],
      [{ size: "abc" }, L.errorPositive],
      [{ size: "0.0009" }, L.errorMinSize("0.001 BTC")],
      [{ size: "100.001" }, L.errorMaxSize("100 BTC")],
      [{ size: "0.001", price: "4000" }, L.errorMinNotional("5 USDT")],
      [{ size: "1", sizeUnit: "quote" as const }, L.errorMinSize("0.001 BTC")],
    ])("%o → %s", (overrides, message) => {
      expect(validate(overrides).size).toBe(message);
    });

    it("accepts the bounds themselves", () => {
      expect(validate({ size: "0.001", price: "5000" }).size).toBeUndefined();
      expect(validate({ size: "100" }).size).toBeUndefined();
    });

    it("skips maxSize / minNotional when the market has none", () => {
      const market: MarketSpec = { ...BTC_USDT, maxSize: undefined, minNotional: undefined };
      expect(validate({ size: "1000", price: "1" }, { market }).size).toBeUndefined();
    });

    it("rejects margin above the available balance unless reduce-only", () => {
      // 0.1 × 64000 = 6400 notional; at 10× the margin is 640.
      expect(validate({ size: "0.1" }, { available: "639.99" }).size).toBe(L.errorInsufficientMargin);
      expect(validate({ size: "0.1" }, { available: "640" }).size).toBeUndefined();
      expect(validate({ size: "0.1", reduceOnly: true }, { available: "1" }).size).toBeUndefined();
    });

    it("needs a reference price for a quote-sized market order", () => {
      const state = { type: "market" as const, size: "1000", sizeUnit: "quote" as const };
      expect(validate(state).size).toBe(L.errorNoReferencePrice);
      expect(validate(state, { referencePrice: "64000" }).size).toBeUndefined();
    });

    it("reports a missing limit price on the price field only", () => {
      const errors = validate({ price: null, size: "1000", sizeUnit: "quote" });
      expect(errors.price).toBe(L.errorRequired);
      expect(errors.size).toBeUndefined();
    });
  });

  describe("prices by order type", () => {
    it.each([
      ["market", {}, {}],
      ["limit", { price: null }, { price: L.errorRequired }],
      ["limit", { price: "0" }, { price: L.errorPositive }],
      ["stop-market", { triggerPrice: null }, { triggerPrice: L.errorRequired }],
      ["stop-market", { triggerPrice: "63000" }, {}],
      [
        "stop-limit",
        { price: null, triggerPrice: null },
        { price: L.errorRequired, triggerPrice: L.errorRequired },
      ],
      ["stop-limit", { triggerPrice: "63000" }, {}],
    ] as const)("%s %o → %o", (type, overrides, expected) => {
      const errors = validate({ type, ...overrides }, { referencePrice: "64000" });
      expect({ price: errors.price, triggerPrice: errors.triggerPrice }).toEqual({
        price: undefined,
        triggerPrice: undefined,
        ...expected,
      });
    });
  });

  describe("leverage", () => {
    it.each([
      [1, undefined],
      [50, undefined],
      [51, L.errorLeverage(50)],
      [0, L.errorLeverage(50)],
      [2.5, L.errorLeverage(50)],
    ])("%d× → %s", (leverage, message) => {
      expect(validate({ leverage }).leverage).toBe(message);
    });
  });

  describe("take profit / stop loss side of the entry", () => {
    it.each([
      ["long", "takeProfit", "65000", undefined],
      ["long", "takeProfit", "64000", L.errorTakeProfitAbove],
      ["long", "takeProfit", "63000", L.errorTakeProfitAbove],
      ["long", "stopLoss", "63000", undefined],
      ["long", "stopLoss", "65000", L.errorStopLossBelow],
      ["short", "takeProfit", "63000", undefined],
      ["short", "takeProfit", "65000", L.errorTakeProfitBelow],
      ["short", "stopLoss", "65000", undefined],
      ["short", "stopLoss", "63000", L.errorStopLossAbove],
      ["short", "stopLoss", "64000", L.errorStopLossAbove],
    ] as const)("%s %s %s → %s", (side, field, value, message) => {
      expect(validate({ side, [field]: value })[field]).toBe(message);
    });

    it("spec scenario: a long limit at 64000 rejects a stop loss of 65000", () => {
      const errors = validate({ side: "long", price: "64000", stopLoss: "65000" });
      expect(errors.stopLoss).toBe(L.errorStopLossBelow);
      expect(hasErrors(errors)).toBe(true);
    });

    it("uses the reference price for market orders and skips the check without one", () => {
      const state = { type: "market" as const, stopLoss: "65000" };
      expect(validate(state, { referencePrice: "64000" }).stopLoss).toBe(L.errorStopLossBelow);
      expect(validate(state).stopLoss).toBeUndefined();
    });

    it("rejects a non-positive exit price", () => {
      expect(validate({ takeProfit: "0" }).takeProfit).toBe(L.errorPositive);
    });
  });
});
