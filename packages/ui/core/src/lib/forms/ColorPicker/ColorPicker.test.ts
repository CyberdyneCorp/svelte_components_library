import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import ColorPicker from "./ColorPicker.svelte";

describe("ColorPicker", () => {
  it("renders with default props", () => {
    const { container } = render(ColorPicker);
    const picker = container.querySelector(".cy-color-picker");
    expect(picker).toBeInTheDocument();
  });

  it("renders the pick color button", () => {
    render(ColorPicker);
    const btn = screen.getByRole("button", { name: "Pick color" });
    expect(btn).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    render(ColorPicker, { props: { label: "Brand color" } });
    const label = screen.getByText("Brand color");
    expect(label).toBeInTheDocument();
  });

  it("applies default color value", () => {
    const { container } = render(ColorPicker, { props: { value: "#ff0000" } });
    const picker = container.querySelector(".cy-color-picker");
    expect(picker).toBeInTheDocument();
  });
});
