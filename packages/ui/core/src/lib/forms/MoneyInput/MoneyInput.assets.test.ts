import { render, fireEvent } from "@testing-library/svelte";
import { afterEach, describe, it, expect, vi } from "vitest";
import MoneyInput from "./MoneyInput.svelte";

const usdc = { currency: "USDC", decimals: 6 };
const eth = { currency: "ETH", decimals: 18 };
const btc = { currency: "BTC", decimals: 8 };
const exact18 = "123456789012345678.123456789012345678";

function field(container: HTMLElement): HTMLInputElement {
  return container.querySelector(".cy-mi__field") as HTMLInputElement;
}

function hidden(container: HTMLElement): HTMLInputElement {
  return container.querySelector('input[type="hidden"]') as HTMLInputElement;
}

async function type(input: HTMLInputElement, text: string) {
  await fireEvent.focus(input);
  await fireEvent.input(input, { target: { value: text } });
}

/** Intl uses (narrow) no-break spaces; compare with plain spaces. */
const plain = (s: string) => s.replace(/\s/g, " ");

afterEach(() => vi.restoreAllMocks());

describe("MoneyInput asset mode", () => {
  it.each([
    ["en-US", usdc, "1234.5", "1,234.500000 USDC"],
    ["pt-BR", usdc, "1234.5", "1.234,500000 USDC"],
    ["en-US", btc, "0.00000001", "0.00000001 BTC"],
    ["pt-BR", btc, "0.00000001", "0,00000001 BTC"],
    ["en-US", eth, "1234.5678", "1,234.567800000000000000 ETH"],
    ["pt-BR", eth, "1234.5678", "1.234,567800000000000000 ETH"],
  ])("formats %s %o when not focused", (locale, asset, value, expected) => {
    const { container } = render(MoneyInput, { props: { ...asset, locale, value } });
    expect(plain(field(container).value)).toBe(expected);
  });

  it.each([
    ["en-US", usdc, "1,234.567891", "1234.567891"],
    ["pt-BR", usdc, "1.234,567891", "1234.567891"],
    ["en-US", btc, "21,000.5", "21000.50000000"],
    ["pt-BR", btc, "21.000,5", "21000.50000000"],
    ["en-US", eth, "0.000000000000000001", "0.000000000000000001"],
    ["pt-BR", eth, "0,000000000000000001", "0.000000000000000001"],
  ])("parses typed %s text for %o", async (locale, asset, typed, expected) => {
    const onchange = vi.fn();
    const { container } = render(MoneyInput, { props: { ...asset, locale, onchange } });
    await type(field(container), typed);
    expect(onchange).toHaveBeenLastCalledWith(expected);
  });

  it("reads the last separator as decimal within the asset's decimals", async () => {
    const onchange = vi.fn();
    const { container } = render(MoneyInput, { props: { ...btc, locale: "pt-BR", onchange } });
    const input = field(container);
    await type(input, "1.234");
    expect(onchange).toHaveBeenLastCalledWith("1.23400000");
    await type(input, "1,5");
    expect(onchange).toHaveBeenLastCalledWith("1.50000000");
    await type(input, "1.234.567");
    expect(onchange).toHaveBeenLastCalledWith("1234.56700000");
  });

  it.each([
    ["en-US", "123,456,789,012,345,678.123456789012345678", "123,456,789,012,345,678.123456789012345678 ETH"],
    ["pt-BR", "123.456.789.012.345.678,123456789012345678", "123.456.789.012.345.678,123456789012345678 ETH"],
  ])("pastes a long 18-decimal value in %s without precision loss", async (locale, pasted, shown) => {
    const onchange = vi.fn();
    const { container } = render(MoneyInput, { props: { ...eth, locale, name: "amount", onchange } });
    const input = field(container);
    await type(input, pasted);
    expect(onchange).toHaveBeenLastCalledWith(exact18);
    await fireEvent.blur(input);
    expect(plain(input.value)).toBe(shown);
    expect(hidden(container).value).toBe(exact18);
  });

  it("rejects a keystroke that exceeds the asset's decimals", async () => {
    const onchange = vi.fn();
    const { container } = render(MoneyInput, { props: { ...usdc, locale: "en-US", onchange } });
    const input = field(container);
    await type(input, "1.123456");
    await fireEvent.input(input, { target: { value: "1.1234567" } });
    expect(input.value).toBe("1.123456");
    expect(onchange).toHaveBeenCalledTimes(1);
    expect(onchange).toHaveBeenLastCalledWith("1.123456");
  });

  it("rejects a pasted ETH value with 19 fraction digits", async () => {
    const onchange = vi.fn();
    const { container } = render(MoneyInput, { props: { ...eth, locale: "pt-BR", onchange } });
    const input = field(container);
    await type(input, "0,1234567890123456789");
    expect(input.value).toBe("");
    expect(onchange).not.toHaveBeenCalled();
  });

  it("accepts negatives with allowNegative", async () => {
    const onchange = vi.fn();
    const { container } = render(MoneyInput, {
      props: { ...eth, locale: "pt-BR", allowNegative: true, onchange },
    });
    await type(field(container), "-0,5");
    expect(onchange).toHaveBeenLastCalledWith("-0.500000000000000000");
  });

  it("drops the minus sign without allowNegative", async () => {
    const onchange = vi.fn();
    const { container } = render(MoneyInput, { props: { ...btc, locale: "en-US", onchange } });
    await type(field(container), "-0.5");
    expect(onchange).toHaveBeenLastCalledWith("0.50000000");
  });

  it("posts the canonical decimal string in the hidden input", async () => {
    const { container } = render(MoneyInput, { props: { ...btc, locale: "pt-BR", name: "btc" } });
    await type(field(container), "1.234,5");
    expect(hidden(container).name).toBe("btc");
    expect(hidden(container).value).toBe("1234.50000000");
  });

  it("edits with the locale decimal mark and shows the code as affix", async () => {
    const { container } = render(MoneyInput, {
      props: { ...usdc, locale: "pt-BR", value: "1234.500000" },
    });
    await fireEvent.focus(field(container));
    expect(field(container).value).toBe("1234,500000");
    expect(container.querySelector(".cy-mi__currency")?.textContent).toBe("USDC");
  });

  it("clamps to asset bounds on blur", async () => {
    const onchange = vi.fn();
    const { container } = render(MoneyInput, { props: { ...usdc, min: "0.000001", onchange } });
    const input = field(container);
    await type(input, "0");
    await fireEvent.blur(input);
    expect(onchange).toHaveBeenLastCalledWith("0.000001");
  });

  it("places a symbol where the locale puts currency symbols", () => {
    const { container } = render(MoneyInput, {
      props: { ...btc, symbol: "₿", locale: "en-US", value: "1.5" },
    });
    expect(field(container).value).toBe("₿1.50000000");
  });

  it("switches an ISO code to asset mode when decimals is set", () => {
    const { container } = render(MoneyInput, {
      props: { currency: "USD", decimals: 4, locale: "en-US", value: "1.2345" },
    });
    expect(plain(field(container).value)).toBe("1.2345 USD");
  });

  it.each([-1, 1.5, 101, Number.NaN])(
    "treats decimals %s as invalid: read-only, value kept, warned once",
    async (decimals) => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const onchange = vi.fn();
      const { container } = render(MoneyInput, {
        props: { currency: "ETH", decimals, locale: "en-US", value: "1.5", name: "eth", onchange },
      });
      const input = field(container);
      expect(input).toBeDisabled();
      expect(input.getAttribute("aria-invalid")).toBe("true");
      expect(input.value).toBe("1.5");
      await fireEvent.input(input, { target: { value: "2" } });
      expect(onchange).not.toHaveBeenCalled();
      expect(hidden(container).value).toBe("1.5");
      expect(warn).toHaveBeenCalledTimes(1);
    },
  );

  it("treats an empty asset code as invalid", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(MoneyInput, { props: { currency: " ", decimals: 6 } });
    expect(field(container)).toBeDisabled();
    expect(warn).toHaveBeenCalledTimes(1);
  });
});

describe("MoneyInput ISO regression", () => {
  it("keeps the ISO display, last-separator rule and no warnings without decimals", async () => {
    const warn = vi.spyOn(console, "warn");
    const onchange = vi.fn();
    const { container } = render(MoneyInput, {
      props: { currency: "USD", locale: "en-US", value: "1234.5", name: "usd", onchange },
    });
    const input = field(container);
    expect(input.value).toBe("$1,234.50");
    await type(input, "1.2345");
    expect(onchange).toHaveBeenLastCalledWith("12345.00");
    await type(input, "1,234.5");
    expect(onchange).toHaveBeenLastCalledWith("1234.50");
    expect(hidden(container).value).toBe("1234.50");
    expect(warn).not.toHaveBeenCalled();
  });

  it("still throws for a non-ISO code without decimals", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(MoneyInput, { props: { currency: "USDC" } })).toThrow(RangeError);
  });
});
