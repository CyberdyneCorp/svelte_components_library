import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import ColorPicker from "./ColorPicker.svelte";

describe("ColorPicker", () => {
  it("renders with default props", () => {
    const { container } = render(ColorPicker);
    expect(container.querySelector(".cy-color-picker")).toBeInTheDocument();
  });

  it("renders the pick color button", () => {
    render(ColorPicker);
    expect(screen.getByRole("button", { name: "Pick color" })).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    render(ColorPicker, { props: { label: "Brand color" } });
    expect(screen.getByText("Brand color")).toBeInTheDocument();
  });

  it("does not render label when empty", () => {
    const { container } = render(ColorPicker);
    expect(container.querySelector(".cy-color-picker__label")).not.toBeInTheDocument();
  });

  it("applies disabled class", () => {
    const { container } = render(ColorPicker, { props: { disabled: true } });
    expect(container.querySelector(".cy-color-picker--disabled")).toBeInTheDocument();
  });

  it("disables swatch button when disabled", () => {
    render(ColorPicker, { props: { disabled: true } });
    expect(screen.getByRole("button", { name: "Pick color" })).toBeDisabled();
  });

  it("shows hex input when showInput is true", () => {
    const { container } = render(ColorPicker, { props: { showInput: true } });
    expect(container.querySelector(".cy-color-picker__hex-display")).toBeInTheDocument();
  });

  it("hides hex input when showInput is false", () => {
    const { container } = render(ColorPicker, { props: { showInput: false } });
    expect(container.querySelector(".cy-color-picker__hex-display")).not.toBeInTheDocument();
  });

  it("displays current color value in hex input", () => {
    const { container } = render(ColorPicker, { props: { value: "#ff0000" } });
    const input = container.querySelector(".cy-color-picker__hex-display") as HTMLInputElement;
    expect(input.value).toBe("#ff0000");
  });

  it("opens dropdown on swatch click", async () => {
    const { container } = render(ColorPicker);
    const swatch = screen.getByRole("button", { name: "Pick color" });
    await fireEvent.click(swatch);
    expect(container.querySelector(".cy-color-picker__dropdown")).toBeInTheDocument();
  });

  it("closes dropdown on second swatch click", async () => {
    const { container } = render(ColorPicker);
    const swatch = screen.getByRole("button", { name: "Pick color" });
    await fireEvent.click(swatch);
    expect(container.querySelector(".cy-color-picker__dropdown")).toBeInTheDocument();
    await fireEvent.click(swatch);
    expect(container.querySelector(".cy-color-picker__dropdown")).not.toBeInTheDocument();
  });

  it("does not open dropdown when disabled", async () => {
    const { container } = render(ColorPicker, { props: { disabled: true } });
    const swatch = screen.getByRole("button", { name: "Pick color" });
    await fireEvent.click(swatch);
    expect(container.querySelector(".cy-color-picker__dropdown")).not.toBeInTheDocument();
  });

  it("renders preset color buttons in dropdown", async () => {
    const { container } = render(ColorPicker);
    const swatch = screen.getByRole("button", { name: "Pick color" });
    await fireEvent.click(swatch);
    const presets = container.querySelectorAll(".cy-color-picker__preset");
    expect(presets.length).toBe(8); // Default 8 presets
  });

  it("renders custom presets", async () => {
    const { container } = render(ColorPicker, {
      props: { presets: ["#ff0000", "#00ff00", "#0000ff"] },
    });
    const swatch = screen.getByRole("button", { name: "Pick color" });
    await fireEvent.click(swatch);
    const presets = container.querySelectorAll(".cy-color-picker__preset");
    expect(presets.length).toBe(3);
  });

  it("selects preset color on click", async () => {
    const onchange = vi.fn();
    const { container } = render(ColorPicker, {
      props: { onchange, presets: ["#ff0000", "#00ff00"] },
    });
    const swatch = screen.getByRole("button", { name: "Pick color" });
    await fireEvent.click(swatch);
    const presets = container.querySelectorAll(".cy-color-picker__preset");
    await fireEvent.click(presets[0]);
    expect(onchange).toHaveBeenCalledWith("#ff0000");
  });

  it("closes dropdown after selecting preset", async () => {
    const { container } = render(ColorPicker);
    const swatch = screen.getByRole("button", { name: "Pick color" });
    await fireEvent.click(swatch);
    const presets = container.querySelectorAll(".cy-color-picker__preset");
    await fireEvent.click(presets[0]);
    expect(container.querySelector(".cy-color-picker__dropdown")).not.toBeInTheDocument();
  });

  it("marks active preset with active class", async () => {
    const { container } = render(ColorPicker, {
      props: { value: "#00ff41" },
    });
    const swatch = screen.getByRole("button", { name: "Pick color" });
    await fireEvent.click(swatch);
    const active = container.querySelector(".cy-color-picker__preset--active");
    expect(active).toBeInTheDocument();
  });

  it("handles hex input with valid 6-digit color", async () => {
    const onchange = vi.fn();
    const { container } = render(ColorPicker, { props: { onchange } });
    const hexInput = container.querySelector(".cy-color-picker__hex-display")!;
    await fireEvent.input(hexInput, { target: { value: "#abcdef" } });
    expect(onchange).toHaveBeenCalledWith("#abcdef");
  });

  it("auto-prepends # to hex input", async () => {
    const onchange = vi.fn();
    const { container } = render(ColorPicker, { props: { onchange } });
    const hexInput = container.querySelector(".cy-color-picker__hex-display")!;
    await fireEvent.input(hexInput, { target: { value: "abcdef" } });
    expect(onchange).toHaveBeenCalledWith("#abcdef");
  });

  it("does not fire onchange for invalid hex", async () => {
    const onchange = vi.fn();
    const { container } = render(ColorPicker, { props: { onchange } });
    const hexInput = container.querySelector(".cy-color-picker__hex-display")!;
    await fireEvent.input(hexInput, { target: { value: "#xyz" } });
    expect(onchange).not.toHaveBeenCalled();
  });

  it("does not fire onchange for partial hex", async () => {
    const onchange = vi.fn();
    const { container } = render(ColorPicker, { props: { onchange } });
    const hexInput = container.querySelector(".cy-color-picker__hex-display")!;
    await fireEvent.input(hexInput, { target: { value: "#abc" } });
    expect(onchange).not.toHaveBeenCalled();
  });

  it("renders hex input inside dropdown when showInput is true", async () => {
    const { container } = render(ColorPicker, { props: { showInput: true } });
    const swatch = screen.getByRole("button", { name: "Pick color" });
    await fireEvent.click(swatch);
    expect(container.querySelector(".cy-color-picker__hex-input")).toBeInTheDocument();
  });

  it("does not render hex input inside dropdown when showInput is false", async () => {
    const { container } = render(ColorPicker, { props: { showInput: false } });
    const swatch = screen.getByRole("button", { name: "Pick color" });
    await fireEvent.click(swatch);
    expect(container.querySelector(".cy-color-picker__custom-row")).not.toBeInTheDocument();
  });

  it("renders custom button in dropdown", async () => {
    const { container } = render(ColorPicker);
    const swatch = screen.getByRole("button", { name: "Pick color" });
    await fireEvent.click(swatch);
    expect(container.querySelector(".cy-color-picker__custom-btn")).toBeInTheDocument();
  });

  it("opens native picker on Custom button click", async () => {
    const { container } = render(ColorPicker);
    const swatch = screen.getByRole("button", { name: "Pick color" });
    await fireEvent.click(swatch);
    const nativeInput = container.querySelector(
      ".cy-color-picker__native"
    ) as HTMLInputElement;
    const clickSpy = vi.spyOn(nativeInput, "click");
    const customBtn = container.querySelector(".cy-color-picker__custom-btn")!;
    await fireEvent.click(customBtn);
    expect(clickSpy).toHaveBeenCalled();
  });

  it("handles native color picker change", async () => {
    const onchange = vi.fn();
    const { container } = render(ColorPicker, { props: { onchange } });
    const swatch = screen.getByRole("button", { name: "Pick color" });
    await fireEvent.click(swatch);
    const nativeInput = container.querySelector(".cy-color-picker__native")!;
    await fireEvent.input(nativeInput, { target: { value: "#123456" } });
    expect(onchange).toHaveBeenCalledWith("#123456");
  });

  it("handles hex input inside dropdown", async () => {
    const onchange = vi.fn();
    const { container } = render(ColorPicker, { props: { onchange } });
    const swatch = screen.getByRole("button", { name: "Pick color" });
    await fireEvent.click(swatch);
    const hexInput = container.querySelector(".cy-color-picker__hex-input")!;
    await fireEvent.input(hexInput, { target: { value: "#aabbcc" } });
    expect(onchange).toHaveBeenCalledWith("#aabbcc");
  });

  it("sets swatch color via CSS variable", () => {
    const { container } = render(ColorPicker, { props: { value: "#ff0000" } });
    const swatch = container.querySelector(".cy-color-picker__swatch") as HTMLElement;
    expect(swatch.style.getPropertyValue("--swatch-color")).toBe("#ff0000");
  });

  it("renders hidden native color input", async () => {
    const { container } = render(ColorPicker);
    const swatch = screen.getByRole("button", { name: "Pick color" });
    await fireEvent.click(swatch);
    const native = container.querySelector(".cy-color-picker__native");
    expect(native).toBeInTheDocument();
    expect(native?.getAttribute("type")).toBe("color");
  });

  it("swatch circle renders inside swatch button", () => {
    const { container } = render(ColorPicker);
    expect(container.querySelector(".cy-color-picker__swatch-circle")).toBeInTheDocument();
  });

  it("hex display has maxlength of 7", () => {
    const { container } = render(ColorPicker);
    const input = container.querySelector(".cy-color-picker__hex-display");
    expect(input?.getAttribute("maxlength")).toBe("7");
  });

  it("preset aria-label includes color value", async () => {
    const { container } = render(ColorPicker, {
      props: { presets: ["#ff0000"] },
    });
    const swatch = screen.getByRole("button", { name: "Pick color" });
    await fireEvent.click(swatch);
    const preset = container.querySelector(".cy-color-picker__preset");
    expect(preset?.getAttribute("aria-label")).toBe("Select #ff0000");
  });
});
