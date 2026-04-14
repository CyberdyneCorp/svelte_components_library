import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import StatusDotList from "./StatusDotList.svelte";

const items = [
  { id: "a", label: "WETH/USDC", value: "$12.6k", tone: "success" as const },
  { id: "b", label: "UNI/WETH", value: "$8.5k", tone: "success" as const },
  { id: "c", label: "USDC/USDT", value: "$15.6k", tone: "warning" as const },
  { id: "d", label: "ARB/WETH", value: "-$5.2k", tone: "danger" as const },
];

describe("StatusDotList", () => {
  it("renders each item", () => {
    render(StatusDotList, { props: { items } });
    expect(screen.getByText("WETH/USDC")).toBeInTheDocument();
    expect(screen.getByText("ARB/WETH")).toBeInTheDocument();
  });
  it("renders title when provided", () => {
    render(StatusDotList, { props: { items, title: "Position Status" } });
    expect(screen.getByText("Position Status")).toBeInTheDocument();
  });
  it("omits header when no title", () => {
    const { container } = render(StatusDotList, { props: { items } });
    expect(container.querySelector(".cy-sdlist__header")).not.toBeInTheDocument();
  });
  it("renders icon in header when provided", () => {
    render(StatusDotList, { props: { items, title: "X", icon: "📊" } });
    expect(screen.getByText("📊")).toBeInTheDocument();
  });
  it("applies tone class on dot", () => {
    const { container } = render(StatusDotList, { props: { items } });
    expect(container.querySelector(".cy-sdlist__dot--success")).toBeInTheDocument();
    expect(container.querySelector(".cy-sdlist__dot--danger")).toBeInTheDocument();
    expect(container.querySelector(".cy-sdlist__dot--warning")).toBeInTheDocument();
  });
  it("falls back to muted tone when unset", () => {
    const { container } = render(StatusDotList, { props: { items: [{ id: "x", label: "X" }] } });
    expect(container.querySelector(".cy-sdlist__dot--muted")).toBeInTheDocument();
  });
  it("renders value when provided", () => {
    render(StatusDotList, { props: { items } });
    expect(screen.getByText("$12.6k")).toBeInTheDocument();
  });
  it("omits value when undefined", () => {
    const { container } = render(StatusDotList, { props: { items: [{ id: "x", label: "X" }] } });
    expect(container.querySelector(".cy-sdlist__value")).not.toBeInTheDocument();
  });
  it("uses title as aria-label fallback", () => {
    render(StatusDotList, { props: { items, title: "Positions" } });
    expect(screen.getByRole("region", { name: "Positions" })).toBeInTheDocument();
  });
  it("prefers explicit ariaLabel", () => {
    render(StatusDotList, { props: { items, title: "X", ariaLabel: "Y" } });
    expect(screen.getByRole("region", { name: "Y" })).toBeInTheDocument();
  });
});
