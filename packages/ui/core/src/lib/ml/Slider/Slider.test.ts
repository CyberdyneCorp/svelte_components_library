import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import Slider from "./Slider.svelte";

describe("Slider", () => {
  it("renders with default props", () => {
    render(Slider);
    const el = document.querySelector(".cy-slider");
    expect(el).toBeInTheDocument();
  });

  it("renders a range input", () => {
    render(Slider);
    const input = document.querySelector('input[type="range"]');
    expect(input).toBeInTheDocument();
  });

  it("displays the label when provided", () => {
    render(Slider, { props: { label: "Learning Rate" } });
    expect(screen.getByText("Learning Rate")).toBeInTheDocument();
  });

  it("shows value with unit", () => {
    render(Slider, { props: { value: 75, unit: "%" } });
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("applies disabled class when disabled", () => {
    render(Slider, { props: { disabled: true } });
    const el = document.querySelector(".cy-slider--disabled");
    expect(el).toBeInTheDocument();
  });
});
