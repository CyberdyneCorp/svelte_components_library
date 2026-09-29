import { render } from "@testing-library/svelte";
import { afterEach, describe, it, expect, vi } from "vitest";
import CurrencyDisplay from "./CurrencyDisplay.svelte";
import {
  displayedSign,
  formatAsset,
  isValidAmount,
  maskGlyphs,
  maskSizer,
  tryFormatAmount,
} from "./currencyDisplay.js";

/** Intl uses (narrow) no-break spaces; compare with plain spaces. */
function text(el: Element | null | undefined): string {
  return (el?.textContent ?? "").replace(/\s/g, " ");
}

/** Text an assistive technology would read: skips aria-hidden subtrees. */
function accessibleText(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
  if (node instanceof Element && node.getAttribute("aria-hidden") === "true") return "";
  return Array.from(node.childNodes).map(accessibleText).join("");
}

function root(container: HTMLElement): HTMLElement {
  return container.querySelector(".cy-currency") as HTMLElement;
}

function value(container: HTMLElement): string {
  return text(container.querySelector(".cy-currency__value"));
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("CurrencyDisplay formatting", () => {
  it("formats en-US USD", () => {
    const { container } = render(CurrencyDisplay, {
      props: { amount: "1234.5", currency: "USD", locale: "en-US" },
    });
    expect(value(container)).toBe("$1,234.50");
  });

  it("formats de-DE EUR", () => {
    const { container } = render(CurrencyDisplay, {
      props: { amount: "1234.56", currency: "EUR", locale: "de-DE" },
    });
    expect(value(container)).toBe("1.234,56 €");
  });

  it("formats JPY without minor units", () => {
    const { container } = render(CurrencyDisplay, {
      props: { amount: "1500", currency: "JPY", locale: "en-US" },
    });
    expect(value(container)).toBe("¥1,500");
  });

  it("formats amounts beyond float precision exactly", () => {
    const { container } = render(CurrencyDisplay, {
      props: { amount: "12345678901234.56", currency: "USD", locale: "en-US" },
    });
    expect(value(container)).toBe("$12,345,678,901,234.56");
  });

  it("supports currencyDisplay code and name", () => {
    const code = render(CurrencyDisplay, {
      props: { amount: "5", currency: "USD", locale: "en-US", currencyDisplay: "code" },
    });
    expect(value(code.container)).toBe("USD 5.00");
    const name = render(CurrencyDisplay, {
      props: { amount: "5", currency: "USD", locale: "en-US", currencyDisplay: "name" },
    });
    expect(value(name.container)).toBe("5.00 US dollars");
  });
});

describe("CurrencyDisplay negatives", () => {
  const cases: Array<[string, string, string]> = [
    ["auto", "-12.30", "-$12.30"],
    ["always", "-12.30", "-$12.30"],
    ["exceptZero", "-12.30", "-$12.30"],
    ["negative", "-12.30", "-$12.30"],
    ["never", "-12.30", "$12.30"],
    ["always", "12.30", "+$12.30"],
    ["exceptZero", "0", "$0.00"],
  ];

  it.each(cases)("signDisplay=%s formats %s as %s", (signDisplay, amount, expected) => {
    const { container } = render(CurrencyDisplay, {
      props: { amount, currency: "USD", locale: "en-US", signDisplay: signDisplay as "auto" },
    });
    expect(value(container)).toBe(expected);
  });

  it.each(["auto", "always", "exceptZero", "negative"])(
    "adds no extra label when signDisplay=%s shows the sign",
    (s) => {
      const { container } = render(CurrencyDisplay, {
        props: { amount: "-1", currency: "USD", locale: "en-US", signDisplay: s as "auto" },
      });
      expect(container.querySelector(".cy-currency__sr")).toBeNull();
    },
  );

  it("adds a visually hidden negative label when signDisplay=never", () => {
    const { container } = render(CurrencyDisplay, {
      props: { amount: "-12.30", currency: "USD", locale: "en-US", signDisplay: "never" },
    });
    expect(accessibleText(root(container)).trim()).toBe("negative $12.30");
  });

  it("lets the negative label be customised", () => {
    const { container } = render(CurrencyDisplay, {
      props: {
        amount: "-1",
        currency: "EUR",
        locale: "de-DE",
        signDisplay: "never",
        negativeLabel: "minus",
      },
    });
    expect(text(container.querySelector(".cy-currency__sr")).trim()).toBe("minus");
  });

  it("does not label negative zero or positives with signDisplay=never", () => {
    const zero = render(CurrencyDisplay, {
      props: { amount: "-0.00", currency: "USD", locale: "en-US", signDisplay: "never" },
    });
    expect(zero.container.querySelector(".cy-currency__sr")).toBeNull();
  });

  it.each(["-0.00", "-0.001"])("renders %s (displayed as zero) without a minus sign", (amount) => {
    const { container } = render(CurrencyDisplay, {
      props: { amount, currency: "USD", locale: "en-US", tone: "signed" },
    });
    expect(value(container)).toBe("$0.00");
    expect(root(container).className).not.toMatch(/--positive|--negative/);
  });

  it("does not label or colour an amount that rounds to zero with signDisplay=never", () => {
    const { container } = render(CurrencyDisplay, {
      props: {
        amount: "-0.001",
        currency: "USD",
        locale: "en-US",
        signDisplay: "never",
        tone: "signed",
      },
    });
    expect(container.querySelector(".cy-currency__sr")).toBeNull();
    expect(root(container).classList.contains("cy-currency--negative")).toBe(false);
  });

  it("keeps neutral colour by default", () => {
    const { container } = render(CurrencyDisplay, {
      props: { amount: "-1", currency: "USD", locale: "en-US" },
    });
    expect(root(container).classList.contains("cy-currency--negative")).toBe(false);
  });

  it("colours signed amounts while keeping the sign", () => {
    const neg = render(CurrencyDisplay, {
      props: { amount: "-1", currency: "USD", locale: "en-US", tone: "signed" },
    });
    expect(root(neg.container).classList.contains("cy-currency--negative")).toBe(true);
    expect(value(neg.container)).toBe("-$1.00");
    const pos = render(CurrencyDisplay, {
      props: { amount: "1", currency: "USD", locale: "en-US", tone: "signed" },
    });
    expect(root(pos.container).classList.contains("cy-currency--positive")).toBe(true);
    const zero = render(CurrencyDisplay, {
      props: { amount: "0", currency: "USD", locale: "en-US", tone: "signed" },
    });
    expect(root(zero.container).className).not.toMatch(/--positive|--negative/);
  });
});

describe("CurrencyDisplay masked", () => {
  const props = { amount: "-1234.56", currency: "USD", locale: "en-US", masked: true };

  it("exposes only the masked label to assistive technology", () => {
    const { container } = render(CurrencyDisplay, { props });
    expect(accessibleText(root(container)).trim()).toBe("Hidden amount");
  });

  it("keeps the real digits out of the DOM entirely", () => {
    const { container } = render(CurrencyDisplay, { props });
    expect(container.textContent).not.toMatch(/[1-9]/);
  });

  it("preserves width with a hidden sizer of the same shape", () => {
    const { container } = render(CurrencyDisplay, { props });
    expect(root(container).classList.contains("cy-currency--masked")).toBe(true);
    const sizer = container.querySelector(".cy-currency__sizer") as HTMLElement;
    expect(text(sizer)).toBe("-$0,000.00");
    expect(sizer.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelector(".cy-currency__mask")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("keeps native digits out of the DOM (ar-EG)", () => {
    const { container } = render(CurrencyDisplay, {
      props: { amount: "-1234.56", currency: "EGP", locale: "ar-EG", masked: true },
    });
    expect(container.textContent).not.toMatch(/[1-9١-٩]/u);
    expect(text(container.querySelector(".cy-currency__sizer"))).toMatch(/٠٬٠٠٠٫٠٠/u);
    expect(text(container.querySelector(".cy-currency__mask"))).toBe("••••••");
  });

  it("uses a custom masked label", () => {
    const { container } = render(CurrencyDisplay, {
      props: { ...props, maskedLabel: "Balance hidden" },
    });
    expect(accessibleText(root(container)).trim()).toBe("Balance hidden");
  });

  it("drops the signed tone while masked", () => {
    const { container } = render(CurrencyDisplay, { props: { ...props, tone: "signed" } });
    expect(root(container).classList.contains("cy-currency--negative")).toBe(false);
  });

  it("reveals the value again when unmasked", async () => {
    const { container, rerender } = render(CurrencyDisplay, { props });
    await rerender({ ...props, masked: false });
    expect(value(container)).toBe("-$1,234.56");
  });
});

describe("CurrencyDisplay invalid input", () => {
  it.each(["abc", "", "1,234.50", "1e5", "--1"])("renders an em dash for %j", (amount) => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(CurrencyDisplay, {
      props: { amount, currency: "USD", locale: "en-US" },
    });
    expect(value(container)).toBe("—");
    expect(root(container).classList.contains("cy-currency--invalid")).toBe(true);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("renders an em dash for an unknown currency", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(CurrencyDisplay, { props: { amount: "1", currency: "NOPE" } });
    expect(value(container)).toBe("—");
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("warns only once for the same invalid input across re-renders", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { rerender } = render(CurrencyDisplay, {
      props: { amount: "x", currency: "USD", masked: false },
    });
    await rerender({ amount: "x", currency: "USD", masked: true });
    expect(warn).toHaveBeenCalledTimes(1);
  });
});

describe("currencyDisplay helpers", () => {
  it("validates decimal strings", () => {
    expect(["1", "-1.5", ".5", "10.", " 3 "].every(isValidAmount)).toBe(true);
    expect(["", "-", ".", "1.2.3", "1,0", "NaN"].some(isValidAmount)).toBe(false);
    expect(isValidAmount(12 as unknown)).toBe(false);
  });

  it("detects the displayed sign, treating values that round to zero as zero", () => {
    const usd = { currency: "USD", locale: "en-US" };
    expect(displayedSign("-0.01", usd)).toBe(-1);
    expect(displayedSign("-0.00", usd)).toBe(0);
    expect(displayedSign("-0.001", usd)).toBe(0);
    expect(displayedSign("-0.4", { currency: "JPY", locale: "en-US" })).toBe(0);
    expect(displayedSign("5", usd)).toBe(1);
  });

  it("builds mask sizer and glyphs", () => {
    expect(maskSizer("$1,234.56")).toBe("$0,000.00");
    expect(maskGlyphs("$1,234.56")).toBe("••••••");
    expect(maskGlyphs("$1")).toBe("••••");
  });

  it("masks native digits too", () => {
    expect(maskSizer("١٬٢٣٤٫٥٠", "٠")).toBe("٠٬٠٠٠٫٠٠");
    expect(maskGlyphs("१,२३४.५०")).toBe("••••••");
  });
});

describe("CurrencyDisplay crypto / custom assets", () => {
  const cases: Array<[string, string, number, string, string]> = [
    ["USDC", "1234.5", 6, "en-US", "1,234.500000 USDC"],
    ["USDC", "1234.5", 6, "pt-BR", "1.234,500000 USDC"],
    ["ETH", "1234.5678", 18, "pt-BR", "1.234,567800000000000000 ETH"],
    ["ETH", "1234.5678", 18, "en-US", "1,234.567800000000000000 ETH"],
    ["BTC", "0.00000001", 8, "pt-BR", "0,00000001 BTC"],
    ["BTC", "21000000", 8, "en-US", "21,000,000.00000000 BTC"],
  ];

  it.each(cases)(
    "formats %s %s (%i decimals, %s) as %s",
    (currency, amount, decimals, locale, expected) => {
      const { container } = render(CurrencyDisplay, {
        props: { amount, currency, decimals, locale },
      });
      expect(value(container)).toBe(expected);
    },
  );

  it("formats long 18-decimal amounts without precision loss", () => {
    const amount = "123456789012345678.123456789012345678";
    const { container } = render(CurrencyDisplay, {
      props: { amount, currency: "ETH", decimals: 18, locale: "en-US" },
    });
    expect(value(container)).toBe("123,456,789,012,345,678.123456789012345678 ETH");
    const wei = render(CurrencyDisplay, {
      props: { amount: "0.000000000000000001", currency: "ETH", decimals: 18, locale: "pt-BR" },
    });
    expect(value(wei.container)).toBe("0,000000000000000001 ETH");
  });

  it("rounds half-expand to the asset decimals using the decimal string", () => {
    const { container } = render(CurrencyDisplay, {
      props: { amount: "1.0000005", currency: "USDC", decimals: 6, locale: "en-US" },
    });
    expect(value(container)).toBe("1.000001 USDC");
  });

  it("shows negatives and honours signDisplay for assets", () => {
    const neg = render(CurrencyDisplay, {
      props: { amount: "-0.5", currency: "ETH", decimals: 4, locale: "pt-BR", tone: "signed" },
    });
    expect(value(neg.container)).toBe("-0,5000 ETH");
    expect(root(neg.container).classList.contains("cy-currency--negative")).toBe(true);
    const always = render(CurrencyDisplay, {
      props: { amount: "2", currency: "BTC", decimals: 8, locale: "en-US", signDisplay: "always" },
    });
    expect(value(always.container)).toBe("+2.00000000 BTC");
    const never = render(CurrencyDisplay, {
      props: { amount: "-2", currency: "BTC", decimals: 8, locale: "en-US", signDisplay: "never" },
    });
    expect(text(root(never.container)).trim()).toBe("negative 2.00000000 BTC");
    expect(never.container.querySelector(".cy-currency__sr")).not.toBeNull();
  });

  it("treats an asset amount that rounds to zero as zero", () => {
    const { container } = render(CurrencyDisplay, {
      props: {
        amount: "-0.0000004",
        currency: "USDC",
        decimals: 6,
        locale: "en-US",
        tone: "signed",
        signDisplay: "never",
      },
    });
    expect(value(container)).toBe("0.000000 USDC");
    expect(container.querySelector(".cy-currency__sr")).toBeNull();
    expect(root(container).className).not.toMatch(/--positive|--negative/);
  });

  it("masks asset amounts keeping the code and hiding every digit", () => {
    const { container } = render(CurrencyDisplay, {
      props: { amount: "-1234.5678", currency: "ETH", decimals: 4, locale: "pt-BR", masked: true },
    });
    expect(accessibleText(root(container)).trim()).toBe("Hidden amount");
    expect(container.textContent).not.toMatch(/[1-9]/);
    expect(text(container.querySelector(".cy-currency__sizer"))).toBe("-0.000,0000 ETH");
    expect(text(container.querySelector(".cy-currency__mask"))).toBe("••••••••");
  });

  it("places a symbol where the locale puts currency symbols", () => {
    const en = render(CurrencyDisplay, {
      props: { amount: "1.5", currency: "BTC", decimals: 8, symbol: "₿", locale: "en-US" },
    });
    expect(value(en.container)).toBe("₿1.50000000");
    const de = render(CurrencyDisplay, {
      props: { amount: "-1.5", currency: "BTC", decimals: 8, symbol: "₿", locale: "de-DE" },
    });
    expect(value(de.container)).toBe("-1,50000000 ₿");
    const code = render(CurrencyDisplay, {
      props: {
        amount: "1.5",
        currency: "BTC",
        decimals: 8,
        symbol: "₿",
        locale: "en-US",
        currencyDisplay: "code",
      },
    });
    expect(value(code.container)).toBe("1.50000000 BTC");
  });

  it.each([-1, 1.5, 101, Number.NaN])("renders an em dash for invalid decimals %d", (decimals) => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(CurrencyDisplay, {
      props: { amount: "1", currency: "ETH", decimals, locale: "en-US" },
    });
    expect(value(container)).toBe("—");
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("keeps rejecting non-ISO codes without decimals (ISO mode unchanged)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(CurrencyDisplay, { props: { amount: "1", currency: "USDC" } });
    expect(value(container)).toBe("—");
    expect(warn).toHaveBeenCalledTimes(1);
  });
});

describe("asset helpers", () => {
  it("formats assets from decimal strings", () => {
    expect(formatAsset("1234.5678", { currency: "ETH", decimals: 4, locale: "pt-BR" })).toBe(
      "1.234,5678\u00a0ETH",
    );
    expect(() => formatAsset("1", { currency: " ", decimals: 2 })).toThrow(RangeError);
  });

  it("detects the displayed sign at the asset precision", () => {
    const eth = { currency: "ETH", decimals: 18, locale: "en-US" };
    expect(displayedSign("-0.000000000000000001", eth)).toBe(-1);
    expect(displayedSign("-0.0000000000000000004", eth)).toBe(0);
  });

  it("leaves ISO formatting untouched when decimals is not set", () => {
    expect(tryFormatAmount("1234.5", { currency: "USD", locale: "en-US" })?.text).toBe("$1,234.50");
    const brl = tryFormatAmount("-1234.5", { currency: "BRL", locale: "pt-BR" });
    expect(brl?.text.replace(/\s/g, " ")).toBe("-R$ 1.234,50");
  });
});
