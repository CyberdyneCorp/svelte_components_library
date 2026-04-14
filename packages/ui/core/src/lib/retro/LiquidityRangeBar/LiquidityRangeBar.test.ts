import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import LiquidityRangeBar from "./LiquidityRangeBar.svelte";

const base = { min: 1000, max: 2000, lower: 1200, upper: 1800, current: 1500 };

describe("LiquidityRangeBar", () => {
  it("renders progressbar with min/max/current", () => {
    render(LiquidityRangeBar, { props: base });
    const p = screen.getByRole("progressbar");
    expect(p).toHaveAttribute("aria-valuemin", "1000");
    expect(p).toHaveAttribute("aria-valuemax", "2000");
    expect(p).toHaveAttribute("aria-valuenow", "1500");
  });
  it("shows 'In Range' when current inside", () => {
    render(LiquidityRangeBar, { props: base });
    expect(screen.getByText("In Range")).toBeInTheDocument();
  });
  it("shows 'Out of Range' when current below lower", () => {
    render(LiquidityRangeBar, { props: { ...base, current: 500 } });
    expect(screen.getByText("Out of Range")).toBeInTheDocument();
  });
  it("shows 'Out of Range' when current above upper", () => {
    render(LiquidityRangeBar, { props: { ...base, current: 1900 } });
    expect(screen.getByText("Out of Range")).toBeInTheDocument();
  });
  it("applies in-range band modifier", () => {
    const { container } = render(LiquidityRangeBar, { props: base });
    expect(container.querySelector(".cy-lrange__band--in")).toBeInTheDocument();
  });
  it("applies out-of-range band modifier", () => {
    const { container } = render(LiquidityRangeBar, { props: { ...base, current: 900 } });
    expect(container.querySelector(".cy-lrange__band--out")).toBeInTheDocument();
  });
  it("hides labels when showLabels=false", () => {
    const { container } = render(LiquidityRangeBar, { props: { ...base, showLabels: false } });
    expect(container.querySelector(".cy-lrange__meta")).not.toBeInTheDocument();
  });
  it("formats numbers with precision", () => {
    render(LiquidityRangeBar, { props: { ...base, precision: 2 } });
    expect(screen.getByTestId("cy-lrange-current")).toHaveTextContent("1500.00");
  });
  it("positions marker at current pct", () => {
    const { container } = render(LiquidityRangeBar, { props: base });
    const marker = container.querySelector<HTMLElement>(".cy-lrange__marker")!;
    expect(marker.style.left).toBe("50%");
  });
  it("positions band between lower and upper", () => {
    const { container } = render(LiquidityRangeBar, { props: base });
    const band = container.querySelector<HTMLElement>(".cy-lrange__band")!;
    expect(band.style.left).toBe("20%");
    expect(band.style.width).toBe("60%");
  });
  it("clamps marker within bounds when current below min", () => {
    const { container } = render(LiquidityRangeBar, { props: { ...base, current: 500 } });
    const marker = container.querySelector<HTMLElement>(".cy-lrange__marker")!;
    expect(marker.style.left).toBe("0%");
  });
  it("clamps marker when current above max", () => {
    const { container } = render(LiquidityRangeBar, { props: { ...base, current: 3000 } });
    const marker = container.querySelector<HTMLElement>(".cy-lrange__marker")!;
    expect(marker.style.left).toBe("100%");
  });
  it("handles max<=min by clamping to 0%", () => {
    const { container } = render(LiquidityRangeBar, { props: { ...base, min: 2000, max: 1000 } });
    const marker = container.querySelector<HTMLElement>(".cy-lrange__marker")!;
    expect(marker.style.left).toBe("0%");
  });
});
