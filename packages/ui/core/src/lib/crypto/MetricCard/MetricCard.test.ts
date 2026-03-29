import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import MetricCard from "./MetricCard.svelte";

describe("MetricCard", () => {
  it("renders with required props", () => {
    render(MetricCard, { props: { label: "TVL", value: "$1.2B" } });
    expect(screen.getByText("TVL")).toBeInTheDocument();
    expect(screen.getByText("$1.2B")).toBeInTheDocument();
  });

  it("displays change percentage", () => {
    render(MetricCard, { props: { label: "TVL", value: "$1.2B", change: 12.5 } });
    expect(screen.getByText(/\+12\.50%/)).toBeInTheDocument();
  });

  it("displays change label", () => {
    render(MetricCard, { props: { label: "TVL", value: "$1.2B", change: 5, changeLabel: "vs last week" } });
    expect(screen.getByText("vs last week")).toBeInTheDocument();
  });

  it("applies variant class", () => {
    const { container } = render(MetricCard, { props: { label: "TVL", value: "$1.2B", variant: "brand" } });
    const metric = container.querySelector(".cy-metric--brand");
    expect(metric).toBeInTheDocument();
  });

  it("does not render footer when no change", () => {
    const { container } = render(MetricCard, { props: { label: "TVL", value: "$1.2B" } });
    const footer = container.querySelector(".cy-metric__footer");
    expect(footer).not.toBeInTheDocument();
  });
});
