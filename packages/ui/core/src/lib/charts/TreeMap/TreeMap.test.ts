import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, beforeAll } from "vitest";
import TreeMap from "./TreeMap.svelte";

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
});

describe("TreeMap", () => {
  const data = [
    { label: "Frontend", value: 40 },
    { label: "Backend", value: 30 },
    { label: "DevOps", value: 20 },
  ];

  it("renders the container", () => {
    render(TreeMap, { props: { data } });
    const el = document.querySelector(".cy-treemap");
    expect(el).toBeInTheDocument();
  });

  it("renders an SVG element", () => {
    render(TreeMap, { props: { data } });
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders SVG inside the treemap", () => {
    render(TreeMap, { props: { data } });
    const svg = document.querySelector(".cy-treemap__svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders with empty data", () => {
    render(TreeMap, { props: { data: [] } });
    const el = document.querySelector(".cy-treemap");
    expect(el).toBeInTheDocument();
  });
});

describe("TreeMap accessibility", () => {
  const data = [
    { label: "Stocks", value: 60 },
    { label: "Cash", value: 40 },
  ];

  it("keeps the default accessible name without a title", () => {
    render(TreeMap, { props: { data } });
    expect(screen.getByRole("img", { name: "Tree map" })).toBeInTheDocument();
  });

  it("wires title and description to the SVG", () => {
    render(TreeMap, { props: { data, title: "Allocation", description: "Stocks dominate" } });
    expect(screen.getByRole("img", { name: "Allocation" })).toHaveAccessibleDescription("Stocks dominate");
  });

  it("derives a label/value/share table of the top-level nodes", () => {
    render(TreeMap, { props: { data } });
    const rows = [...document.querySelectorAll("table tr")].map((r) => [...r.children].map((c) => c.textContent));
    expect(rows).toEqual([
      ["Label", "Value", "Share"],
      ["Stocks", "60", "60.0%"],
      ["Cash", "40", "40.0%"],
    ]);
  });

  it("toggles the table with an aria-expanded button", async () => {
    render(TreeMap, { props: { data } });
    const button = screen.getByRole("button", { name: "Show data" });
    await fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
  });
});
