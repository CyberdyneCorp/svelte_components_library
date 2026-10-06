import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import { createRawSnippet } from "svelte";
import KpiCard from "./KpiCard.svelte";

const base = { label: "Monthly spend", value: "€1,240.00" };

describe("KpiCard", () => {
  it("renders label and value in a non-interactive article named by the label", () => {
    const { container } = render(KpiCard, { props: base });
    const card = screen.getByRole("article", { name: "Monthly spend" });
    expect(card).toHaveTextContent("€1,240.00");
    expect(container.querySelector("a")).toBeNull();
  });

  it("omits the delta row when there is no trend, delta or deltaLabel", () => {
    const { container } = render(KpiCard, { props: base });
    expect(container.querySelector(".cy-kpi__delta")).toBeNull();
  });

  it("renders delta and deltaLabel", () => {
    const { container } = render(KpiCard, {
      props: { ...base, delta: "+4.2%", deltaLabel: "vs last month" },
    });
    expect(container.querySelector(".cy-kpi__delta-value")).toHaveTextContent("+4.2%");
    expect(container.querySelector(".cy-kpi__delta-label")).toHaveTextContent("vs last month");
  });

  it.each([
    ["up", "increased"],
    ["down", "decreased"],
    ["flat", "unchanged"],
  ] as const)("conveys trend %s with a hidden icon and the text '%s'", (trend, word) => {
    const { container } = render(KpiCard, { props: { ...base, trend, delta: "4%" } });
    const icon = container.querySelector(".cy-kpi__icon");
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector(".cy-kpi__sr")).toHaveTextContent(word);
  });

  it("draws a distinct arrow for each trend", () => {
    const paths = (["up", "down", "flat"] as const).map((trend) => {
      const { container } = render(KpiCard, { props: { ...base, trend } });
      return container.querySelector(".cy-kpi__icon path")?.getAttribute("d");
    });
    expect(new Set(paths).size).toBe(3);
  });

  it("accepts translated trend labels", () => {
    const { container } = render(KpiCard, {
      props: { ...base, trend: "down", trendLabels: { down: "diminuiu" } },
    });
    expect(container.querySelector(".cy-kpi__sr")).toHaveTextContent("diminuiu");
  });

  it("colours by sentiment independently of direction and defaults to neutral", () => {
    const rising = render(KpiCard, { props: { ...base, trend: "up", delta: "+12%", sentiment: "negative" } });
    expect(rising.container.querySelector(".cy-kpi__delta")).toHaveClass("cy-kpi__delta--negative");
    const neutral = render(KpiCard, { props: { ...base, trend: "up", delta: "+1%" } });
    expect(neutral.container.querySelector(".cy-kpi__delta")).toHaveClass("cy-kpi__delta--neutral");
  });

  it("renders the whole card as a link whose name includes label, value and trend", () => {
    render(KpiCard, {
      props: { ...base, href: "/spend", trend: "up", delta: "+4.2%", deltaLabel: "vs last month" },
    });
    const link = screen.getByRole("link", { name: "Monthly spend €1,240.00 increased +4.2% vs last month" });
    expect(link).toHaveAttribute("href", "/spend");
    expect(screen.queryByRole("article")).toBeNull();
  });

  it("lets ariaLabel override the accessible name", () => {
    render(KpiCard, { props: { ...base, href: "/spend", ariaLabel: "Open monthly spend report" } });
    expect(screen.getByRole("link", { name: "Open monthly spend report" })).toBeInTheDocument();
  });

  it("renders the sparkline snippet", () => {
    const sparkline = createRawSnippet(() => ({ render: () => `<svg data-testid="spark"></svg>` }));
    const { container } = render(KpiCard, { props: { ...base, sparkline } });
    expect(container.querySelector(".cy-kpi__sparkline [data-testid='spark']")).not.toBeNull();
  });

  describe("value", () => {
    const richValue = createRawSnippet(() => ({
      render: () => `<span data-testid="rich"><strong>€1,240</strong>.00</span>`,
    }));
    // Mirrors a masked CurrencyDisplay: hidden glyphs, spoken label.
    const maskedValue = createRawSnippet(() => ({
      render: () =>
        `<span><span class="sr">Hidden amount</span><span aria-hidden="true">••••••</span></span>`,
    }));

    it("renders a string value as plain text (unchanged)", () => {
      const { container } = render(KpiCard, { props: base });
      const valueEl = container.querySelector(".cy-kpi__value");
      expect(valueEl?.textContent?.trim()).toBe("€1,240.00");
      expect(valueEl?.children).toHaveLength(0);
    });

    it("renders a snippet value inside the value element", () => {
      const { container } = render(KpiCard, { props: { ...base, value: richValue } });
      const rich = container.querySelector(".cy-kpi__value [data-testid='rich']");
      expect(rich).not.toBeNull();
      expect(rich).toHaveTextContent("€1,240.00");
    });

    it("keeps the article named by the label with a snippet value", () => {
      render(KpiCard, { props: { ...base, value: richValue } });
      expect(screen.getByRole("article", { name: "Monthly spend" })).toHaveTextContent("€1,240.00");
    });

    it("includes snippet text in the link's accessible name", () => {
      render(KpiCard, {
        props: { ...base, value: richValue, href: "/spend", trend: "up", delta: "+4.2%" },
      });
      expect(screen.getByRole("link", { name: "Monthly spend €1,240.00 increased +4.2%" })).toBeInTheDocument();
    });

    it("announces a masked snippet's label, not its hidden glyphs", () => {
      render(KpiCard, { props: { ...base, value: maskedValue, href: "/spend" } });
      expect(screen.getByRole("link", { name: "Monthly spend Hidden amount" })).toBeInTheDocument();
    });
  });

  it("renders no sparkline area without the snippet", () => {
    const { container } = render(KpiCard, { props: base });
    expect(container.querySelector(".cy-kpi__sparkline")).toBeNull();
  });
});

it("allows featured emphasis and negative value without changing delta sentiment", () => {
  const { container } = render(KpiCard, { props: { ...base, emphasis: "featured", valueTone: "negative", delta: "+1%", sentiment: "positive" } });
  expect(screen.getByRole("article", { name: base.label })).toHaveClass("cy-kpi--featured");
  expect(container.querySelector(".cy-kpi__value")).toHaveClass("cy-kpi__value--negative");
  expect(container.querySelector(".cy-kpi__delta")).toHaveClass("cy-kpi__delta--positive");
});

it("keeps default emphasis and tone opt-in", () => {
  const { container } = render(KpiCard, { props: base });
  expect(screen.getByRole("article")).not.toHaveClass("cy-kpi--featured");
  expect(container.querySelector(".cy-kpi__value")).not.toHaveClass("cy-kpi__value--negative", "cy-kpi__value--positive");
});
