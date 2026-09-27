import { render, screen, within } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import Gauge from "./Gauge.svelte";

// The data-table fallback repeats every label, so scope text queries.
const plot = () => document.querySelector(".cy-gauge svg") as HTMLElement;

describe("Gauge", () => {
  it("renders the container", () => {
    render(Gauge, { props: { value: 50 } });
    const el = document.querySelector(".cy-gauge");
    expect(el).toBeInTheDocument();
  });

  it("renders an SVG element", () => {
    render(Gauge, { props: { value: 50 } });
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("displays the value", () => {
    render(Gauge, { props: { value: 75, showValue: true } });
    expect(within(plot()).getByText("75")).toBeInTheDocument();
  });

  it("displays the label", () => {
    render(Gauge, { props: { value: 50, label: "CPU Usage" } });
    expect(within(plot()).getByText("CPU Usage")).toBeInTheDocument();
  });

  it("renders track and fill arcs", () => {
    render(Gauge, { props: { value: 50 } });
    const track = document.querySelector(".cy-gauge__track");
    const fill = document.querySelector(".cy-gauge__fill");
    expect(track).toBeInTheDocument();
    expect(fill).toBeInTheDocument();
  });
});

describe("Gauge accessibility", () => {
  it("is an image named by its label and current value", () => {
    render(Gauge, { props: { value: 40, label: "Budget used", unit: "%" } });
    expect(screen.getByRole("img", { name: "Budget used: 40%" })).toBeInTheDocument();
  });

  it("falls back to 'Gauge' without label or title", () => {
    render(Gauge, { props: { value: 40 } });
    expect(screen.getByRole("img", { name: "Gauge: 40" })).toBeInTheDocument();
  });

  it("describes a titled gauge by its value when no description is given", () => {
    render(Gauge, { props: { value: 250, max: 200, unit: "%", title: "CPU load" } });
    expect(screen.getByRole("img", { name: "CPU load" })).toHaveAccessibleDescription("200%");
  });

  it("prefers a visually hidden title and wires the description", () => {
    render(Gauge, { props: { value: 40, label: "CPU", title: "CPU load", description: "Below the warning level" } });
    expect(screen.getByRole("img", { name: "CPU load" })).toHaveAccessibleDescription("Below the warning level");
    expect(document.querySelector("figcaption")).toHaveClass("cy-chart-frame__sr-only");
  });

  it("renders a screen-reader table with the clamped value and range, no toggle", () => {
    render(Gauge, { props: { value: 250, max: 200, unit: "%", label: "Load" } });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    const rows = [...document.querySelectorAll("table tr")].map((r) => [...r.children].map((c) => c.textContent));
    expect(rows).toEqual([
      ["Measure", "Value", "Minimum", "Maximum"],
      ["Load", "200%", "0", "200"],
    ]);
  });

  it("can opt into the visible data toggle", () => {
    render(Gauge, { props: { value: 40, showDataToggle: true } });
    expect(screen.getByRole("button", { name: "Show data" })).toBeInTheDocument();
  });
});
