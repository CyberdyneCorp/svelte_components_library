import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import CopyButton from "./CopyButton.svelte";

describe("CopyButton", () => {
  it("renders with default props", () => {
    render(CopyButton, { props: { text: "copy me" } });
    const btn = screen.getByRole("button");
    expect(btn).toBeInTheDocument();
  });

  it("has correct aria-label", () => {
    render(CopyButton, { props: { text: "data", label: "Copy code" } });
    const btn = screen.getByRole("button", { name: "Copy code" });
    expect(btn).toBeInTheDocument();
  });

  it("copies text to clipboard on click", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(CopyButton, { props: { text: "hello" } });
    const btn = screen.getByRole("button");
    await fireEvent.click(btn);
    expect(writeText).toHaveBeenCalledWith("hello");
  });

  it("applies variant class", () => {
    render(CopyButton, { props: { text: "x", variant: "outline" } });
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("outline");
  });
});
