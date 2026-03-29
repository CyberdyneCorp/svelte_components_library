import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import Gauge from "./Gauge.svelte";

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
    expect(screen.getByText("75")).toBeInTheDocument();
  });

  it("displays the label", () => {
    render(Gauge, { props: { value: 50, label: "CPU Usage" } });
    expect(screen.getByText("CPU Usage")).toBeInTheDocument();
  });

  it("renders track and fill arcs", () => {
    render(Gauge, { props: { value: 50 } });
    const track = document.querySelector(".cy-gauge__track");
    const fill = document.querySelector(".cy-gauge__fill");
    expect(track).toBeInTheDocument();
    expect(fill).toBeInTheDocument();
  });
});
