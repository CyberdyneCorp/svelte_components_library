import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import PixelToggle from "./PixelToggle.svelte";

describe("PixelToggle", () => {
  it("renders switch role", () => {
    render(PixelToggle, { props: { label: "Power" } });
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });
  it("uses label as accessible name by default", () => {
    render(PixelToggle, { props: { label: "Power" } });
    expect(screen.getByRole("switch", { name: "Power" })).toBeInTheDocument();
  });
  it("prefers ariaLabel over label for accessible name", () => {
    render(PixelToggle, { props: { label: "X", ariaLabel: "Y" } });
    expect(screen.getByRole("switch", { name: "Y" })).toBeInTheDocument();
  });
  it("shows OFF state by default", () => {
    render(PixelToggle, { props: { label: "x" } });
    expect(screen.getByText("OFF")).toBeInTheDocument();
  });
  it("shows ON state when checked", () => {
    render(PixelToggle, { props: { label: "x", checked: true } });
    expect(screen.getByText("ON")).toBeInTheDocument();
  });
  it("uses custom on/off labels", () => {
    render(PixelToggle, { props: { label: "x", onLabel: "YES", offLabel: "NO" } });
    expect(screen.getByText("NO")).toBeInTheDocument();
  });
  it("toggles checked and fires onChange", async () => {
    const onChange = vi.fn();
    render(PixelToggle, { props: { label: "x", onChange } });
    await fireEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(true);
  });
  it("does nothing when disabled", async () => {
    const onChange = vi.fn();
    render(PixelToggle, { props: { label: "x", disabled: true, onChange } });
    const sw = screen.getByRole("switch");
    expect(sw).toBeDisabled();
  });
  it("aria-checked reflects state", () => {
    render(PixelToggle, { props: { label: "x", checked: true } });
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });
});
