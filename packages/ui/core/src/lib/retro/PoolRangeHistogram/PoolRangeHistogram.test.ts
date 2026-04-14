import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import PoolRangeHistogram from "./PoolRangeHistogram.svelte";

const buckets = [
  { price: 100, liquidity: 5 },
  { price: 110, liquidity: 20 },
  { price: 120, liquidity: 50 },
  { price: 130, liquidity: 15 },
  { price: 140, liquidity: 8 },
];

describe("PoolRangeHistogram", () => {
  it("renders SVG role", () => {
    render(PoolRangeHistogram, { props: { buckets } });
    expect(screen.getByRole("img", { name: "Pool liquidity distribution" })).toBeInTheDocument();
  });
  it("renders a bar per bucket", () => {
    const { container } = render(PoolRangeHistogram, { props: { buckets } });
    expect(container.querySelectorAll("[data-testid^='cy-prhist-bar-']")).toHaveLength(5);
  });
  it("shows empty state when no buckets", () => {
    render(PoolRangeHistogram, { props: { buckets: [] } });
    expect(screen.getByText("No liquidity data")).toBeInTheDocument();
  });
  it("marks bars inside selected range as inrange=true", () => {
    const { container } = render(PoolRangeHistogram, {
      props: { buckets, selectedLower: 110, selectedUpper: 130 },
    });
    const bars = container.querySelectorAll<HTMLElement>("[data-testid^='cy-prhist-bar-']");
    const flags = Array.from(bars).map((b) => b.getAttribute("data-inrange"));
    expect(flags).toEqual(["false", "true", "true", "true", "false"]);
  });
  it("renders lower boundary line when selectedLower set", () => {
    render(PoolRangeHistogram, { props: { buckets, selectedLower: 110, selectedUpper: 130 } });
    expect(screen.getByTestId("cy-prhist-lower")).toBeInTheDocument();
    expect(screen.getByTestId("cy-prhist-upper")).toBeInTheDocument();
  });
  it("omits boundary lines when selection missing", () => {
    render(PoolRangeHistogram, { props: { buckets } });
    expect(screen.queryByTestId("cy-prhist-lower")).not.toBeInTheDocument();
    expect(screen.queryByTestId("cy-prhist-upper")).not.toBeInTheDocument();
  });
  it("renders current price line when provided", () => {
    render(PoolRangeHistogram, { props: { buckets, currentPrice: 120 } });
    expect(screen.getByTestId("cy-prhist-current")).toBeInTheDocument();
  });
  it("omits current price line when not provided", () => {
    render(PoolRangeHistogram, { props: { buckets } });
    expect(screen.queryByTestId("cy-prhist-current")).not.toBeInTheDocument();
  });
  it("handles unsorted buckets", () => {
    const unsorted = [
      { price: 130, liquidity: 15 },
      { price: 100, liquidity: 5 },
      { price: 120, liquidity: 50 },
    ];
    expect(() => render(PoolRangeHistogram, { props: { buckets: unsorted } })).not.toThrow();
  });
  it("applies width/height to viewBox", () => {
    render(PoolRangeHistogram, { props: { buckets, width: 300, height: 100 } });
    expect(screen.getByTestId("cy-prhist")).toHaveAttribute("viewBox", "0 0 300 100");
  });
  it("custom aria-label applies", () => {
    render(PoolRangeHistogram, { props: { buckets, ariaLabel: "TVL Curve" } });
    expect(screen.getByRole("img", { name: "TVL Curve" })).toBeInTheDocument();
  });
});
