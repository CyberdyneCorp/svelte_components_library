import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import { createRawSnippet } from "svelte";
import PixelButton from "./PixelButton.svelte";

const label = (t: string) => createRawSnippet(() => ({ render: () => `<span>${t}</span>` }));

describe("PixelButton", () => {
  it("renders children", () => {
    render(PixelButton, { props: { children: label("Click") } });
    expect(screen.getByRole("button", { name: "Click" })).toBeInTheDocument();
  });
  it("fires onclick", async () => {
    const onclick = vi.fn();
    render(PixelButton, { props: { children: label("Go"), onclick } });
    await fireEvent.click(screen.getByRole("button"));
    expect(onclick).toHaveBeenCalled();
  });
  it("does not fire onclick when disabled", async () => {
    const onclick = vi.fn();
    render(PixelButton, { props: { children: label("Go"), onclick, disabled: true } });
    await fireEvent.click(screen.getByRole("button"));
    expect(onclick).not.toHaveBeenCalled();
  });
  it.each(["solid", "outline", "ghost", "neon"] as const)("applies %s variant", (variant) => {
    const { container } = render(PixelButton, { props: { children: label("x"), variant } });
    expect(container.querySelector(`.cy-pxbtn--${variant}`)).toBeInTheDocument();
  });
  it.each(["sm", "md", "lg"] as const)("applies %s size", (size) => {
    const { container } = render(PixelButton, { props: { children: label("x"), size } });
    expect(container.querySelector(`.cy-pxbtn--${size}`)).toBeInTheDocument();
  });
  it("applies full width modifier", () => {
    const { container } = render(PixelButton, { props: { children: label("x"), fullWidth: true } });
    expect(container.querySelector(".cy-pxbtn--full")).toBeInTheDocument();
  });
  it("applies type attribute", () => {
    render(PixelButton, { props: { children: label("x"), type: "submit" } });
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });
  it("applies aria-label when provided", () => {
    render(PixelButton, { props: { children: label("x"), ariaLabel: "Save" } });
    expect(screen.getByLabelText("Save")).toBeInTheDocument();
  });
  it("disabled attribute reflects prop", () => {
    render(PixelButton, { props: { children: label("x"), disabled: true } });
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
