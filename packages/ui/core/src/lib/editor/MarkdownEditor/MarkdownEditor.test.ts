import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import MarkdownEditor from "./MarkdownEditor.svelte";

describe("MarkdownEditor", () => {
  it("renders the component", () => {
    render(MarkdownEditor);
    const el = document.querySelector(".cy-md-editor");
    expect(el).toBeInTheDocument();
  });

  it("renders a textarea", () => {
    render(MarkdownEditor);
    const textarea = document.querySelector("textarea");
    expect(textarea).toBeInTheDocument();
  });

  it("applies placeholder text", () => {
    render(MarkdownEditor, { props: { placeholder: "Type here..." } });
    const textarea = document.querySelector("textarea");
    expect(textarea).toHaveAttribute("placeholder", "Type here...");
  });

  it("shows toolbar when showToolbar is true", () => {
    render(MarkdownEditor, { props: { showToolbar: true } });
    const toolbar = document.querySelector(".cy-md-toolbar");
    expect(toolbar).toBeInTheDocument();
  });

  it("renders mode tabs", () => {
    render(MarkdownEditor);
    const buttons = document.querySelectorAll(".cy-md-editor__mode-btn, button");
    expect(buttons.length).toBeGreaterThan(0);
  });
});
