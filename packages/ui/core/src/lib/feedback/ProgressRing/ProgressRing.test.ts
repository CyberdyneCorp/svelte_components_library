import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import ProgressRing from "./ProgressRing.svelte";

describe("ProgressRing", () => {
  it("renders with default value", () => {
    const { container } = render(ProgressRing);
    expect(container.querySelector(".cy-progress-ring")).toBeInTheDocument();
  });

  it("displays percentage value", () => {
    render(ProgressRing, { props: { value: 75 } });
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("clamps value to 0-100 range", () => {
    render(ProgressRing, { props: { value: 150 } });
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("hides value when showValue is false", () => {
    render(ProgressRing, { props: { value: 50, showValue: false } });
    expect(screen.queryByText("50%")).not.toBeInTheDocument();
  });

  it("displays label when provided", () => {
    render(ProgressRing, { props: { value: 50, label: "Progress" } });
    expect(screen.getByText("Progress")).toBeInTheDocument();
  });
});
