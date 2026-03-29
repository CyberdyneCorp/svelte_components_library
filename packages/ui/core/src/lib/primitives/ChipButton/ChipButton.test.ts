import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import ChipButton from "./ChipButton.svelte";

describe("ChipButton", () => {
  it("renders with default props", () => {
    render(ChipButton);
    const btn = screen.getByRole("button");
    expect(btn).toBeInTheDocument();
  });

  it("has aria-pressed reflecting selected state", () => {
    render(ChipButton, { props: { selected: true } });
    const btn = screen.getByRole("button");
    expect(btn.getAttribute("aria-pressed")).toBe("true");
  });

  it("fires onclick when clicked", async () => {
    const onclick = vi.fn();
    render(ChipButton, { props: { onclick } });
    const btn = screen.getByRole("button");
    await fireEvent.click(btn);
    expect(onclick).toHaveBeenCalledOnce();
  });

  it("is disabled when disabled prop is true", () => {
    render(ChipButton, { props: { disabled: true } });
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
  });
});
