import { render } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import MarkdownToolbar from "./MarkdownToolbar.svelte";

describe("MarkdownToolbar", () => {
  it("renders the component", () => {
    render(MarkdownToolbar);
    const el = document.querySelector(".cy-md-toolbar");
    expect(el).toBeInTheDocument();
  });

  it("renders toolbar buttons", () => {
    render(MarkdownToolbar);
    const buttons = document.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("has bold formatting button", () => {
    render(MarkdownToolbar);
    const boldBtn = document.querySelector('[title="Bold (Ctrl+B)"]');
    expect(boldBtn).toBeInTheDocument();
  });

  it("disables buttons when disabled prop is true", () => {
    render(MarkdownToolbar, { props: { disabled: true } });
    const buttons = document.querySelectorAll("button");
    buttons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });
});
