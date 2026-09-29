import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import Button from "./Button.svelte";
import ButtonRefHarness from "../../_testdata/ButtonRefHarness.svelte";

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

  describe("aria-* / data-* passthrough and ref", () => {
    it("forwards aria-expanded and aria-controls for disclosure buttons", () => {
      render(Button, { props: { "aria-expanded": false, "aria-controls": "panel-1" } });
      const btn = screen.getByRole("button");
      expect(btn).toHaveAttribute("aria-expanded", "false");
      expect(btn).toHaveAttribute("aria-controls", "panel-1");
    });

    it("forwards other aria-* and data-* attributes", () => {
      render(Button, {
        props: { "aria-pressed": true, "data-testid": "toggle" },
      });
      const btn = screen.getByTestId("toggle");
      expect(btn.tagName).toBe("BUTTON");
      expect(btn).toHaveAttribute("aria-pressed", "true");
    });

    it("accepts aria-label as an attribute as well as ariaLabel", () => {
      render(Button, { props: { "aria-label": "Close" } });
      expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
    });

    it("keeps loading-state aria managed by the component", () => {
      render(Button, { props: { loading: true } });
      const btn = screen.getByRole("button");
      expect(btn).toHaveAttribute("aria-busy", "true");
      expect(btn).toHaveAttribute("aria-disabled", "true");
    });

    it("binds ref to the native button", async () => {
      render(ButtonRefHarness);
      const btn = screen.getByRole("button", { name: "Menu" });
      await fireEvent.click(screen.getByRole("button", { name: "Focus menu" }));
      expect(document.activeElement).toBe(btn);
      expect(btn).toHaveAttribute("aria-expanded", "false");
    });
  });
});
