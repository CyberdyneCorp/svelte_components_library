import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import IconButton from "./IconButton.svelte";

describe("IconButton", () => {
  it("renders with default props", () => {
    render(IconButton, { props: { icon: "check", label: "Confirm" } });
    const btn = screen.getByRole("button");
    expect(btn).toBeInTheDocument();
  });

  it("has correct aria-label", () => {
    render(IconButton, { props: { icon: "x", label: "Close" } });
    const btn = screen.getByRole("button", { name: "Close" });
    expect(btn).toBeInTheDocument();
  });

  it("fires onclick when clicked", async () => {
    const onclick = vi.fn();
    render(IconButton, { props: { icon: "check", label: "Ok", onclick } });
    const btn = screen.getByRole("button");
    await fireEvent.click(btn);
    expect(onclick).toHaveBeenCalledOnce();
  });

  it("is disabled when disabled prop is true", () => {
    render(IconButton, { props: { icon: "x", label: "Close", disabled: true } });
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
  });

  it("applies variant class", () => {
    render(IconButton, { props: { icon: "x", label: "Close", variant: "outline" } });
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("outline");
  });
});
