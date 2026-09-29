import { render, screen } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, it, expect } from "vitest";
import TokenBalanceRow from "./TokenBalanceRow.svelte";

/** Intl uses (narrow) no-break spaces; compare with plain spaces. */
function text(el: Element | null | undefined): string {
  return (el?.textContent ?? "").replace(/\s/g, " ").trim();
}

const ETH = { symbol: "ETH", name: "Ether", decimals: 18 };

describe("TokenBalanceRow", () => {
  it("formats an 18-decimal amount exactly, without float rounding", () => {
    const { container } = render(TokenBalanceRow, {
      props: { ...ETH, amount: "123456789012345678.123456789012345678", locale: "en-US" },
    });
    expect(text(container.querySelector(".cy-token-row__amount"))).toBe(
      "123,456,789,012,345,678.123456789012345678 ETH",
    );
  });

  it("pads to the token decimals and follows the locale", () => {
    const { container } = render(TokenBalanceRow, {
      props: { ...ETH, amount: "0.000000000000000001", locale: "pt-BR" },
    });
    expect(text(container.querySelector(".cy-token-row__amount"))).toBe("0,000000000000000001 ETH");
  });

  it("renders symbol, name and the fiat value through CurrencyDisplay", () => {
    const { container } = render(TokenBalanceRow, {
      props: {
        ...ETH,
        amount: "1.5",
        value: { amount: "4512.3", currency: "USD" },
        locale: "en-US",
      },
    });
    expect(screen.getByText("ETH")).toBeInTheDocument();
    expect(screen.getByText("Ether")).toBeInTheDocument();
    expect(text(container.querySelector(".cy-token-row__value"))).toBe("$4,512.30");
    expect(container.querySelector(".cy-token-row__unpriced")).not.toBeInTheDocument();
  });

  it("shows the default unpriced label when no value is given", () => {
    const { container } = render(TokenBalanceRow, {
      props: { symbol: "XYZ", amount: "10", decimals: 2 },
    });
    expect(screen.getByText("No price available")).toBeInTheDocument();
    expect(container.querySelector(".cy-token-row__value")).not.toBeInTheDocument();
  });

  it("shows a custom unpriced reason", () => {
    render(TokenBalanceRow, {
      props: { symbol: "XYZ", amount: "10", decimals: 2, unpricedLabel: "Sem cotação" },
    });
    expect(screen.getByText("Sem cotação")).toBeInTheDocument();
  });

  it("shows the chain as a name-only badge without status dot or chain id", () => {
    const { container } = render(TokenBalanceRow, {
      props: { ...ETH, amount: "1", chain: "Base" },
    });
    expect(screen.getByText("Base")).toBeInTheDocument();
    expect(container.querySelector(".cy-network-badge__dot")).not.toBeInTheDocument();
    expect(container.querySelector(".cy-network-badge__chain-id")).not.toBeInTheDocument();
  });

  it("omits the chain badge and name when not given", () => {
    const { container } = render(TokenBalanceRow, {
      props: { symbol: "ETH", amount: "1", decimals: 18 },
    });
    expect(container.querySelector(".cy-network-badge")).not.toBeInTheDocument();
    expect(container.querySelector(".cy-token-row__name")).not.toBeInTheDocument();
  });

  it("renders a div by default and an li when as='li'", () => {
    const div = render(TokenBalanceRow, { props: { ...ETH, amount: "1" } });
    expect(div.container.querySelector(".cy-token-row")?.tagName).toBe("DIV");

    const list = document.createElement("ul");
    document.body.appendChild(list);
    render(TokenBalanceRow, { target: list, props: { ...ETH, amount: "1", as: "li" } });
    expect(list.querySelector(":scope > li.cy-token-row")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    list.remove();
  });

  it("renders the icon snippet hidden from assistive technology", () => {
    const icon = createRawSnippet(() => ({ render: () => "<svg data-testid='icon'></svg>" }));
    render(TokenBalanceRow, { props: { ...ETH, amount: "1", icon } });
    expect(screen.getByTestId("icon").parentElement).toHaveAttribute("aria-hidden", "true");
  });
});
