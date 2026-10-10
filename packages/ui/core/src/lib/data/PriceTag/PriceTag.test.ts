import { render } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import PriceTag from "./PriceTag.svelte";

/** Intl uses (narrow) no-break spaces; compare with plain spaces. */
function text(el: Element | null | undefined): string {
  return (el?.textContent ?? "").replace(/\s+/g, " ").trim();
}

const domain = {
  amount: "10.99",
  originalAmount: "103.99",
  currency: "BRL",
  locale: "pt-BR",
  period: "/1º ano",
  savings: "Economize 89%",
  originalLabel: "Preço original",
};

describe("PriceTag", () => {
  it("renders the current price through CurrencyDisplay with the period", () => {
    const { container } = render(PriceTag, { props: domain });
    expect(container.querySelector(".cy-price-tag__amount .cy-currency")).not.toBeNull();
    expect(text(container.querySelector(".cy-price-tag__amount"))).toBe("R$ 10,99");
    expect(text(container.querySelector(".cy-price-tag__period"))).toBe("/1º ano");
  });

  it("strikes the original price and prefixes it with the visually hidden label", () => {
    const { container } = render(PriceTag, { props: domain });
    const struck = container.querySelector("s");
    expect(struck).not.toBeNull();
    expect(struck?.querySelector(".cy-currency")).not.toBeNull();
    expect(text(struck)).toBe("R$ 103,99");
    const hidden = container.querySelector(".cy-price-tag__sr");
    expect(text(hidden)).toBe("Preço original");
    expect(hidden?.nextElementSibling).toBe(struck);
    expect(text(container.querySelector(".cy-price-tag__original"))).toBe(
      "Preço original R$ 103,99",
    );
  });

  it("renders the savings text as a badge", () => {
    const { container } = render(PriceTag, { props: domain });
    const badge = container.querySelector(".cy-price-tag__savings .cy-badge");
    expect(badge).not.toBeNull();
    expect(text(badge)).toBe("Economize 89%");
  });

  it("renders no struck price, period or badge without the optional props", () => {
    const { container } = render(PriceTag, {
      props: { amount: "9.00", currency: "USD", locale: "en-US" },
    });
    expect(container.querySelector("s")).toBeNull();
    expect(container.querySelector(".cy-price-tag__period")).toBeNull();
    expect(container.querySelector(".cy-badge")).toBeNull();
    expect(text(container.querySelector(".cy-price-tag"))).toBe("$9.00");
  });

  it("defaults the hidden original label to English", () => {
    const { container } = render(PriceTag, {
      props: { amount: "9.00", originalAmount: "12.00", currency: "USD", locale: "en-US" },
    });
    expect(text(container.querySelector(".cy-price-tag__sr"))).toBe("Original price");
  });

  it.each(["sm", "md", "lg"] as const)("applies the %s size modifier", (size) => {
    const { container } = render(PriceTag, { props: { amount: "9.00", currency: "USD", size } });
    expect(container.querySelector(".cy-price-tag")).toHaveClass(`cy-price-tag--${size}`);
  });

  it("defaults to the md size", () => {
    const { container } = render(PriceTag, { props: { amount: "9.00", currency: "USD" } });
    expect(container.querySelector(".cy-price-tag")).toHaveClass("cy-price-tag--md");
  });
});
