import { render, within, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import BarChart from "./BarChart.svelte";

// The data-table fallback repeats every label, so scope text queries.
const plot = () => document.querySelector(".cy-bar-chart svg") as HTMLElement;

describe("BarChart", () => {
  const data = [
    { label: "A", value: 10 },
    { label: "B", value: 20 },
    { label: "C", value: 15 },
  ];

  it("renders the container", () => {
    render(BarChart, { props: { data } });
    const el = document.querySelector(".cy-bar-chart");
    expect(el).toBeInTheDocument();
  });

  it("renders an SVG element", () => {
    render(BarChart, { props: { data } });
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders bar elements for each data point", () => {
    render(BarChart, { props: { data } });
    const bars = document.querySelectorAll(".cy-bar-chart__bar");
    expect(bars.length).toBe(3);
  });

  it("displays labels", () => {
    render(BarChart, { props: { data } });
    expect(within(plot()).getByText("A")).toBeInTheDocument();
    expect(within(plot()).getByText("B")).toBeInTheDocument();
  });

  it("shows values when showValues is true", () => {
    render(BarChart, { props: { data, showValues: true } });
    const values = document.querySelectorAll(".cy-bar-chart__value");
    expect(values.length).toBe(3);
  });
});

describe("BarChart accessibility", () => {
  const data = [
    { label: "Rent", value: 1200 },
    { label: "Food", value: 450 },
  ];

  it("keeps the default accessible name without a title", () => {
    render(BarChart, { props: { data } });
    expect(screen.getByRole("img", { name: "Bar chart" })).toBeInTheDocument();
  });

  it("wires title and description to the SVG", () => {
    render(BarChart, { props: { data, title: "Spending", description: "By category" } });
    expect(screen.getByRole("img", { name: "Spending" })).toHaveAccessibleDescription("By category");
  });

  it("derives a label/value data table", () => {
    render(BarChart, { props: { data, title: "Spending" } });
    const table = screen.getByRole("table", { name: "Spending data" });
    const rows = [...table.querySelectorAll("tr")].map((r) => [...r.children].map((c) => c.textContent));
    expect(rows).toEqual([
      ["Label", "Value"],
      ["Rent", "1200"],
      ["Food", "450"],
    ]);
  });

  it("toggles the table with an aria-expanded button", async () => {
    render(BarChart, { props: { data } });
    const button = screen.getByRole("button", { name: "Show data" });
    await fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  it("can drop the toggle", () => {
    render(BarChart, { props: { data, showDataToggle: false } });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("BarChart multi-series", () => {
  const usage = [
    { name: "Compute", data: [{ label: "Jan", value: 10 }, { label: "Feb", value: 20 }] },
    { name: "Storage", data: [{ label: "Jan", value: 5 }, { label: "Feb", value: 5 }] },
  ];

  const tableRows = (name: string) =>
    [...screen.getByRole("table", { name }).querySelectorAll("tr")].map((r) => [...r.children].map((c) => c.textContent));

  it("stacks segments, scales to the largest total and lists the series in a legend", () => {
    render(BarChart, { props: { series: usage, stacked: true, title: "Usage" } });
    expect(document.querySelectorAll(".cy-bar-chart__bar")).toHaveLength(4);
    const ticks = [...document.querySelectorAll(".cy-bar-chart__tick")].map((t) => Number(t.textContent));
    expect(Math.max(...ticks)).toBeGreaterThanOrEqual(25);
    const legend = screen.getByRole("list", { name: "Legend" });
    expect(within(legend).getByText("Compute")).toBeInTheDocument();
    expect(within(legend).getByText("Storage")).toBeInTheDocument();
    expect(tableRows("Usage data")).toEqual([
      ["Label", "Compute", "Storage"],
      ["Jan", "10", "5"],
      ["Feb", "20", "5"],
    ]);
  });

  it("labels stack totals when showValues is on", () => {
    render(BarChart, { props: { series: usage, stacked: true } });
    const values = [...document.querySelectorAll(".cy-bar-chart__value")].map((v) => v.textContent);
    expect(values).toEqual(["15", "25"]);
  });

  it("groups bars and fills a missing category with 0", () => {
    render(BarChart, {
      props: {
        title: "Grouped",
        series: [
          { name: "A", data: [{ label: "x", value: 1 }, { label: "y", value: 2 }] },
          { name: "B", data: [{ label: "y", value: 3 }] },
        ],
      },
    });
    expect(document.querySelectorAll(".cy-bar-chart__bar")).toHaveLength(4);
    expect(document.querySelectorAll(".cy-bar-chart__value")).toHaveLength(4);
    expect(tableRows("Grouped data")).toEqual([
      ["Label", "A", "B"],
      ["x", "1", "0"],
      ["y", "2", "3"],
    ]);
  });

  it("draws each series' legend shape inside segments that fit it", () => {
    render(BarChart, { props: { series: usage, stacked: true } });
    const shapes = new Set([...document.querySelectorAll(".cy-bar-chart__marker")].map((m) => m.getAttribute("data-marker")));
    expect(shapes).toEqual(new Set(["circle", "square"]));
  });

  it("uses series colours, falling back to the default palette", () => {
    render(BarChart, { props: { series: [{ ...usage[0], color: "#123456" }, usage[1]] } });
    const fills = [...document.querySelectorAll(".cy-bar-chart__bar")].map((b) => b.getAttribute("fill"));
    expect(fills).toEqual(["#123456", "#123456", "#00d4ff", "#00d4ff"]);
  });

  it("prefers series over data and shows no legend or markers for one series", () => {
    render(BarChart, { props: { data: [{ label: "ignored", value: 1 }], series: [usage[0]] } });
    expect(within(plot()).queryByText("ignored")).not.toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Legend" })).not.toBeInTheDocument();
    expect(document.querySelector(".cy-bar-chart__marker")).not.toBeInTheDocument();
  });
});

describe("BarChart degenerate data", () => {
  it("renders all-zero data without NaN geometry", () => {
    render(BarChart, { props: { data: [{ label: "A", value: 0 }, { label: "B", value: 0 }] } });
    expect(plot().outerHTML).not.toContain("NaN");
    expect(document.querySelectorAll(".cy-bar-chart__bar")).toHaveLength(2);
  });
});
