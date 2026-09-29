import { afterEach, describe, it, expect, vi } from "vitest";
import {
  directionOf,
  formatCompact,
  formatCountdown,
  formatFundingRate,
  formatPercent,
  formatSignedPrice,
  prefersReducedMotion,
} from "./display.js";

describe("display helpers", () => {
  it("derives a direction from a signed decimal", () => {
    expect(directionOf("1.5")).toBe("up");
    expect(directionOf("-0.01")).toBe("down");
    expect(directionOf("0.00")).toBe("flat");
    expect(directionOf(undefined)).toBe("flat");
    expect(directionOf("n/a")).toBe("flat");
  });

  it("formats compact quantities", () => {
    expect(formatCompact("12345.678", "en-US")).toBe("12.35K");
    expect(formatCompact("987", "en-US")).toBe("987");
  });

  it("formats signed percentages", () => {
    expect(formatPercent("2.345", "en-US")).toBe("+2.35%");
    expect(formatPercent("-1.2", "en-US")).toBe("-1.20%");
    expect(formatPercent("0", "en-US")).toBe("0.00%");
  });

  it("formats a funding-rate fraction as a percentage", () => {
    expect(formatFundingRate("0.0001", "en-US")).toBe("+0.0100%");
    expect(formatFundingRate("-0.000375", "en-US")).toBe("-0.0375%");
  });

  it("prefixes positive price changes with +", () => {
    const market = { tickSize: "0.1" };
    expect(formatSignedPrice("1200.5", market, "en-US")).toBe("+1,200.5");
    expect(formatSignedPrice("-3", market, "en-US")).toBe("-3.0");
    expect(formatSignedPrice("0", market, "en-US")).toBe("0.0");
  });

  it("formats a countdown as HH:MM:SS", () => {
    expect(formatCountdown(90_000)).toBe("00:01:30");
    expect(formatCountdown(60_000)).toBe("00:01:00");
    expect(formatCountdown(59_001)).toBe("00:01:00");
    expect(formatCountdown(8 * 3600_000 + 5_000)).toBe("08:00:05");
    expect(formatCountdown(-5_000)).toBe("00:00:00");
  });

  describe("prefersReducedMotion", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("is false without matchMedia", () => {
      vi.stubGlobal("matchMedia", undefined);
      expect(prefersReducedMotion()).toBe(false);
    });

    it("reads the media query", () => {
      const matchMedia = vi.fn(() => ({ matches: true }));
      vi.stubGlobal("matchMedia", matchMedia);
      expect(prefersReducedMotion()).toBe(true);
      expect(matchMedia).toHaveBeenCalledWith("(prefers-reduced-motion: reduce)");
    });
  });
});
