import { render, screen } from "@testing-library/svelte";
import { describe, it, expect, vi, beforeAll } from "vitest";
import OrgChart from "./OrgChart.svelte";

beforeAll(() => {
  // Polyfill ResizeObserver for jsdom
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
});

const root = {
  id: "ceo",
  label: "Jane Smith",
  title: "CEO",
  children: [
    { id: "cto", label: "Bob Jones", title: "CTO" },
    { id: "cfo", label: "Alice Brown", title: "CFO" },
  ],
};

describe("OrgChart", () => {
  it("renders the chart container", () => {
    const { container } = render(OrgChart, { props: { root } });
    expect(container.querySelector(".cy-org")).toBeInTheDocument();
  });

  it("renders SVG with img role", () => {
    render(OrgChart, { props: { root } });
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("renders the root node label", () => {
    render(OrgChart, { props: { root } });
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("renders child node labels", () => {
    render(OrgChart, { props: { root } });
    expect(screen.getByText("Bob Jones")).toBeInTheDocument();
    expect(screen.getByText("Alice Brown")).toBeInTheDocument();
  });

  it("renders node titles", () => {
    render(OrgChart, { props: { root } });
    expect(screen.getByText("CEO")).toBeInTheDocument();
    expect(screen.getByText("CTO")).toBeInTheDocument();
  });
});
