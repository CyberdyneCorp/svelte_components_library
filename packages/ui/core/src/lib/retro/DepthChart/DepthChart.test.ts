import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import DepthChart from "./DepthChart.svelte";

const bids = [
  { price: 99, size: 10 },
  { price: 98, size: 15 },
  { price: 97, size: 20 },
];
const asks = [
  { price: 101, size: 8 },
  { price: 102, size: 12 },
  { price: 103, size: 16 },
];

describe("DepthChart", () => {
  it("renders SVG role", () => {
    render(DepthChart, { props: { bids, asks } });
    expect(screen.getByRole("img", { name: "Order book depth" })).toBeInTheDocument();
  });
  it("renders bid path when bids present", () => {
    render(DepthChart, { props: { bids, asks: [] } });
    expect(screen.getByTestId("cy-depth-bids")).toBeInTheDocument();
  });
  it("renders ask path when asks present", () => {
    render(DepthChart, { props: { bids: [], asks } });
    expect(screen.getByTestId("cy-depth-asks")).toBeInTheDocument();
  });
  it("shows No data when both empty", () => {
    render(DepthChart, { props: { bids: [], asks: [] } });
    expect(screen.getByText("No depth data")).toBeInTheDocument();
  });
  it("renders current price line when provided", () => {
    render(DepthChart, { props: { bids, asks, currentPrice: 100 } });
    expect(screen.getByTestId("cy-depth-price")).toBeInTheDocument();
  });
  it("omits price line when not provided", () => {
    render(DepthChart, { props: { bids, asks } });
    expect(screen.queryByTestId("cy-depth-price")).not.toBeInTheDocument();
  });
  it("applies custom colors", () => {
    render(DepthChart, { props: { bids, asks: [], bidColor: "#00ff00" } });
    const bp = screen.getByTestId("cy-depth-bids");
    expect(bp.getAttribute("stroke")).toBe("#00ff00");
  });
  it("applies width/height to viewBox", () => {
    render(DepthChart, { props: { bids, asks, width: 320, height: 160 } });
    expect(screen.getByTestId("cy-depth")).toHaveAttribute("viewBox", "0 0 320 160");
  });
  it("handles unsorted bids/asks", () => {
    const unsorted = [
      { price: 97, size: 20 },
      { price: 99, size: 10 },
      { price: 98, size: 15 },
    ];
    expect(() => render(DepthChart, { props: { bids: unsorted, asks } })).not.toThrow();
  });
  it("custom aria-label applies", () => {
    render(DepthChart, { props: { bids, asks, ariaLabel: "Depth" } });
    expect(screen.getByRole("img", { name: "Depth" })).toBeInTheDocument();
  });
});
