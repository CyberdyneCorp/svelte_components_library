import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import ThemeToggle from "./ThemeToggle.svelte";

describe("ThemeToggle", () => {
  it("renders with default props", () => {
    render(ThemeToggle);
    const btn = screen.getByRole("button");
    expect(btn).toBeInTheDocument();
  });

  it("has aria-label for toggling theme", () => {
    render(ThemeToggle);
    const btn = screen.getByRole("button");
    expect(btn.getAttribute("aria-label")).toContain("Toggle");
  });

  it("can be clicked", async () => {
    render(ThemeToggle);
    const btn = screen.getByRole("button");
    await fireEvent.click(btn);
    expect(btn).toBeInTheDocument();
  });

  it("applies size class", () => {
    render(ThemeToggle, { props: { size: "sm" } });
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("sm");
  });
});
