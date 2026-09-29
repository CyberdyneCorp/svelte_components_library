import { describe, expect, it } from "vitest";
import { BTC_USDT, ticketState } from "../../_testdata/trading.js";
import { feeKindOf, previewOrder, type PreviewInput } from "./preview.js";
import { convertSize, percentOfPower, sizeForPercent, type SizingContext } from "./sizing.js";
import type { TicketState } from "./ticket.js";

const fees: PreviewInput = {
  market: BTC_USDT,
  makerFee: "0.0002",
  takerFee: "0.0005",
  quoteDecimals: 2,
};

function preview(overrides: Partial<TicketState>, input: Partial<PreviewInput> = {}) {
  return previewOrder(ticketState(overrides), { ...fees, ...input });
}

describe("previewOrder", () => {
  it("computes notional, initial margin (notional / leverage) and a taker fee", () => {
    // 0.015 × 64000 = 960; 960 / 20 = 48; 960 × 0.0005 = 0.48
    expect(preview({ size: "0.015", leverage: 20 })).toEqual({
      size: "0.015",
      notional: "960.00",
      initialMargin: "48.00",
      fee: "0.48",
      feeRate: "0.0005",
      feeKind: "taker",
    });
  });

  it("rounds the margin and fee up", () => {
    // 0.001 × 64000.5 = 64.0005; / 3 = 21.3335; × 0.0005 = 0.03200025
    const result = preview({ size: "0.001", price: "64000.5", leverage: 3 });
    expect(result.initialMargin).toBe("21.34");
    expect(result.fee).toBe("0.04");
    expect(result.notional).toBe("64.00");
  });

  it("uses the maker fee only for post-only limit orders", () => {
    expect(preview({ postOnly: true }).feeKind).toBe("maker");
    expect(preview({ postOnly: true }).fee).toBe("0.13"); // 640 × 0.0002 = 0.128
    expect(feeKindOf({ type: "limit", postOnly: false })).toBe("taker");
    expect(feeKindOf({ type: "stop-limit", postOnly: true })).toBe("taker");
    expect(feeKindOf({ type: "market", postOnly: false })).toBe("taker");
  });

  it("omits the fee without a rate and the margin with invalid leverage", () => {
    const result = preview({ leverage: 0 }, { takerFee: undefined });
    expect(result.fee).toBeUndefined();
    expect(result.initialMargin).toBeUndefined();
    expect(result.notional).toBe("640.00");
  });

  it("uses the reference price for market orders", () => {
    expect(preview({ type: "market" }, { referencePrice: "65000" }).notional).toBe("650.00");
    expect(preview({ type: "market" })).toEqual({ size: "0.010" });
  });
});

describe("sizing", () => {
  const ctx: SizingContext = {
    market: BTC_USDT,
    entry: "64000",
    available: "1000",
    leverage: 10,
    quoteDecimals: 2,
  };

  it("sizes a percentage of available × leverage", () => {
    expect(sizeForPercent(50, "quote", ctx)).toBe("5000.00");
    expect(sizeForPercent(50, "base", ctx)).toBe("0.078"); // 5000 / 64000 = 0.078125
    expect(sizeForPercent(150, "quote", ctx)).toBe("10000.00");
    expect(sizeForPercent(-5, "quote", ctx)).toBe("0.00");
  });

  it("returns null when it cannot size", () => {
    expect(sizeForPercent(50, "quote", { ...ctx, available: undefined })).toBeNull();
    expect(sizeForPercent(50, "quote", { ...ctx, leverage: 0 })).toBeNull();
    expect(sizeForPercent(50, "base", { ...ctx, entry: undefined })).toBeNull();
  });

  it("reads back the percentage of a notional", () => {
    expect(percentOfPower("5000", ctx)).toBe(50);
    expect(percentOfPower("12000", ctx)).toBe(100);
    expect(percentOfPower(undefined, ctx)).toBe(0);
    expect(percentOfPower("5000", { ...ctx, available: "0" })).toBe(0);
  });

  it("converts between base and quote", () => {
    expect(convertSize("0.015", "quote", ctx)).toBe("960.00");
    expect(convertSize("1000", "base", ctx)).toBe("0.015");
    expect(convertSize(null, "base", ctx)).toBeNull();
    expect(convertSize("1", "base", { ...ctx, entry: undefined })).toBeNull();
  });
});
