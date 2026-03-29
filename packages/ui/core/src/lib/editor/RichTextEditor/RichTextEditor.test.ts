import { render } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import RichTextEditor from "./RichTextEditor.svelte";

describe("RichTextEditor", () => {
  it("renders the component", () => {
    render(RichTextEditor);
    const el = document.querySelector(".cy-rte");
    expect(el).toBeInTheDocument();
  });

  it("renders an editable content area", () => {
    render(RichTextEditor);
    const editor = document.querySelector('[contenteditable="true"]');
    expect(editor).toBeInTheDocument();
  });

  it("shows toolbar when showToolbar is true", () => {
    render(RichTextEditor, { props: { showToolbar: true } });
    const toolbar = document.querySelector(".cy-rte__toolbar");
    expect(toolbar).toBeInTheDocument();
  });

  it("renders toolbar action buttons", () => {
    render(RichTextEditor, { props: { showToolbar: true } });
    const buttons = document.querySelectorAll(".cy-rte__toolbar button, .cy-rte__btn");
    expect(buttons.length).toBeGreaterThan(0);
  });
});
