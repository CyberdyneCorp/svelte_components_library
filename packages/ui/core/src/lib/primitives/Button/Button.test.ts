import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import Button from "./Button.svelte";

describe("Button", () => {
  it("renders with default props", () => {
    render(Button, { props: { children: undefined } });
    const btn = screen.getByRole("button");
    expect(btn).toBeInTheDocument();
  });

  it("applies variant class", () => {
    render(Button, { props: { variant: "danger" } });
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("danger");
  });

  it("is disabled when disabled prop is true", () => {
    render(Button, { props: { disabled: true } });
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
  });

  it("fires onclick when clicked", async () => {
    const onclick = vi.fn();
    render(Button, { props: { onclick } });
    const btn = screen.getByRole("button");
    await fireEvent.click(btn);
    expect(onclick).toHaveBeenCalledOnce();
  });

  it("has disabled attribute when disabled", () => {
    render(Button, { props: { disabled: true } });
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("disabled");
  });

  it("shows loading state", () => {
    render(Button, { props: { loading: true } });
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn.className).toContain("loading");
  });

  it("applies size class", () => {
    render(Button, { props: { size: "sm" } });
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("sm");
  });
});
