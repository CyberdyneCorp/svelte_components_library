import { render } from "@testing-library/svelte";
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
