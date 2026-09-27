import { render, screen, fireEvent, within } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, it, expect } from "vitest";
import ChartFrame from "./ChartFrame.svelte";
import type { ChartA11yAttributes, ChartTableData } from "./chartTable.js";

// Stand-in chart: an <svg role="img"> carrying the attributes ChartFrame hands out.
const children = createRawSnippet((a11y: () => ChartA11yAttributes) => ({
  render: () => `<svg role="img" class="test-chart"></svg>`,
  setup(svg: Element) {
    for (const [name, value] of Object.entries(a11y())) {
      if (value !== undefined) svg.setAttribute(name, value);
    }
  },
}));

const data: ChartTableData = {
  columns: ["Month", "Income", "Spend"],
  rows: [
    ["Jan", 4200, 3100],
    ["Feb", 4300, 2900],
  ],
};

function frame(props: Record<string, unknown> = {}) {
  return render(ChartFrame, { props: { children, data, ...props } });
}

describe("ChartFrame", () => {
  describe("accessible name", () => {
    it("names the chart by its title and describes it by its description", () => {
      frame({ title: "Cash flow", description: "Income beats spend every month." });
      const chart = screen.getByRole("img", { name: "Cash flow" });
      expect(chart).toHaveAccessibleDescription("Income beats spend every month.");
      expect(chart).not.toHaveAttribute("aria-label");
    });

    it("falls back to aria-label when there is no title", () => {
      frame({ fallbackLabel: "Line chart" });
      const chart = screen.getByRole("img", { name: "Line chart" });
      expect(chart).not.toHaveAttribute("aria-labelledby");
      expect(chart).not.toHaveAttribute("aria-describedby");
    });

    it("renders the title in a figcaption, visible by default", () => {
      frame({ title: "Cash flow" });
      const caption = document.querySelector("figure > figcaption");
      expect(caption).toHaveTextContent("Cash flow");
      expect(caption).not.toHaveClass("cy-chart-frame__sr-only");
    });

    it("visually hides title and description with hideTitle", () => {
      frame({ title: "Cash flow", description: "Summary", hideTitle: true });
      expect(document.querySelector("figcaption")).toHaveClass("cy-chart-frame__sr-only");
      expect(screen.getByRole("img", { name: "Cash flow" })).toBeInTheDocument();
    });

    it("renders no figcaption without title or description", () => {
      frame();
      expect(document.querySelector("figcaption")).not.toBeInTheDocument();
    });
  });

  describe("data table", () => {
    it("renders a captioned table with column and row headers", () => {
      frame({ title: "Cash flow" });
      const table = screen.getByRole("table", { name: "Cash flow data" });
      const colHeaders = within(table).getAllByRole("columnheader");
      expect(colHeaders.map((h) => h.textContent)).toEqual(["Month", "Income", "Spend"]);
      colHeaders.forEach((h) => expect(h).toHaveAttribute("scope", "col"));
      const rowHeaders = within(table).getAllByRole("rowheader");
      expect(rowHeaders.map((h) => h.textContent)).toEqual(["Jan", "Feb"]);
      rowHeaders.forEach((h) => expect(h).toHaveAttribute("scope", "row"));
      expect(within(table).getAllByRole("cell").map((c) => c.textContent)).toEqual([
        "4200", "3100", "4300", "2900",
      ]);
    });

    it("uses a custom caption", () => {
      frame({ tableCaption: "Monthly totals" });
      expect(screen.getByRole("table", { name: "Monthly totals" })).toBeInTheDocument();
    });

    it("renders no table or toggle without data", () => {
      frame({ data: undefined });
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("renders no table when there are no columns", () => {
      frame({ data: { columns: [], rows: [] } });
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });
  });

  describe("show data toggle", () => {
    it("starts collapsed with the table kept for screen readers only", () => {
      frame();
      const button = screen.getByRole("button", { name: "Show data" });
      expect(button).toHaveAttribute("aria-expanded", "false");
      const wrap = document.getElementById(button.getAttribute("aria-controls")!);
      expect(wrap).toHaveClass("cy-chart-frame__sr-only");
      expect(wrap).not.toHaveAttribute("tabindex");
      expect(within(wrap!).getByRole("table")).toBeInTheDocument();
    });

    it("reveals the table and makes it keyboard-reachable when expanded", async () => {
      frame({ title: "Cash flow" });
      const button = screen.getByRole("button", { name: "Show data" });
      await fireEvent.click(button);
      expect(button).toHaveAttribute("aria-expanded", "true");
      expect(button).toHaveTextContent("Hide data");
      const wrap = document.getElementById(button.getAttribute("aria-controls")!);
      expect(wrap).not.toHaveClass("cy-chart-frame__sr-only");
      expect(wrap).toHaveAttribute("tabindex", "0");
      expect(screen.getByRole("region", { name: "Cash flow data" })).toBe(wrap);
    });

    it("collapses again on a second click", async () => {
      frame();
      const button = screen.getByRole("button");
      await fireEvent.click(button);
      await fireEvent.click(button);
      expect(button).toHaveAttribute("aria-expanded", "false");
      expect(button).toHaveTextContent("Show data");
    });

    it("honours an initially expanded state and custom labels", () => {
      frame({ dataExpanded: true, showDataLabel: "Mostrar", hideDataLabel: "Ocultar" });
      expect(screen.getByRole("button", { name: "Ocultar" })).toHaveAttribute("aria-expanded", "true");
    });

    it("can drop the toggle while keeping the screen-reader table", () => {
      frame({ showDataToggle: false, dataExpanded: true });
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
      expect(document.querySelector(".cy-chart-frame__table-wrap")).toHaveClass("cy-chart-frame__sr-only");
      expect(screen.getByRole("table")).toBeInTheDocument();
    });
  });

  it("lays out inline and forwards a class", () => {
    frame({ inline: true, class: "extra" });
    const figure = document.querySelector("figure");
    expect(figure).toHaveClass("cy-chart-frame", "cy-chart-frame--inline", "extra");
  });

  it("gives each instance unique ids", () => {
    frame({ title: "One" });
    frame({ title: "Two" });
    const ids = [...document.querySelectorAll("[id]")].map((el) => el.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
