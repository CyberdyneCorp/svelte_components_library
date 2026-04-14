import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import PixelCheckbox from "./PixelCheckbox.svelte";

describe("PixelCheckbox", () => {
  it("renders unchecked by default", () => {
    render(PixelCheckbox);
    expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(false);
  });
  it("renders label when provided", () => {
    render(PixelCheckbox, { props: { label: "Accept" } });
    expect(screen.getByText("Accept")).toBeInTheDocument();
  });
  it("toggles on change", async () => {
    const onChange = vi.fn();
    render(PixelCheckbox, { props: { label: "x", onChange } });
    await fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledWith(true);
  });
  it("reflects checked prop", () => {
    render(PixelCheckbox, { props: { checked: true } });
    expect(screen.getByText("✓")).toBeInTheDocument();
  });
  it("respects disabled", async () => {
    const onChange = vi.fn();
    render(PixelCheckbox, { props: { label: "x", disabled: true, onChange } });
    const input = screen.getByRole("checkbox") as HTMLInputElement;
    expect(input).toBeDisabled();
  });
  it("applies disabled class", () => {
    const { container } = render(PixelCheckbox, { props: { disabled: true } });
    expect(container.querySelector(".cy-pchk--disabled")).toBeInTheDocument();
  });
  it("forwards name and value", () => {
    render(PixelCheckbox, { props: { name: "agree", value: "yes" } });
    const input = screen.getByRole("checkbox");
    expect(input).toHaveAttribute("name", "agree");
    expect(input).toHaveAttribute("value", "yes");
  });
});
