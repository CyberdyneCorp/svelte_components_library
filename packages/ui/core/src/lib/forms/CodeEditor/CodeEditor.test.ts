import { render, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import CodeEditor from "./CodeEditor.svelte";

describe("CodeEditor", () => {
  it("renders with default props", () => {
    const { container } = render(CodeEditor);
    const textarea = container.querySelector("textarea");
    expect(textarea).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    const { container } = render(CodeEditor, { props: { label: "Source" } });
    expect(container.textContent).toContain("Source");
  });

  it("has correct aria-label", () => {
    const { container } = render(CodeEditor, { props: { label: "Code" } });
    const textarea = container.querySelector("textarea");
    expect(textarea?.getAttribute("aria-label")).toBe("Code");
  });

  it("shows error message", () => {
    const { container } = render(CodeEditor, { props: { error: "Syntax error" } });
    const error = container.querySelector("[role='alert']");
    expect(error?.textContent).toBe("Syntax error");
  });

  it("is disabled when disabled prop is true", () => {
    const { container } = render(CodeEditor, { props: { disabled: true } });
    const textarea = container.querySelector("textarea");
    expect(textarea).toBeDisabled();
  });

  it("shows line numbers by default", () => {
    const { container } = render(CodeEditor, { props: { value: "line1\nline2\nline3" } });
    const lineNums = container.querySelectorAll(".cy-ce__line-num");
    expect(lineNums.length).toBe(3);
    expect(lineNums[0].textContent).toBe("1");
    expect(lineNums[2].textContent).toBe("3");
  });

  it("hides line numbers when showLineNumbers is false", () => {
    const { container } = render(CodeEditor, { props: { showLineNumbers: false } });
    expect(container.querySelector(".cy-ce__gutter")).not.toBeInTheDocument();
  });

  it("inserts two spaces on Tab key", async () => {
    const { container } = render(CodeEditor, { props: { value: "hello" } });
    const textarea = container.querySelector("textarea")!;
    // Set selection position
    Object.defineProperty(textarea, "selectionStart", { value: 5, writable: true });
    Object.defineProperty(textarea, "selectionEnd", { value: 5, writable: true });

    await fireEvent.keyDown(textarea, { key: "Tab" });
    // The value should now contain two spaces inserted at position 5
    expect(textarea.value).toContain("  ");
  });

  it("preserves indentation on Enter key", async () => {
    const { container } = render(CodeEditor, { props: { value: "  indented" } });
    const textarea = container.querySelector("textarea")!;
    Object.defineProperty(textarea, "selectionStart", { value: 10, writable: true });
    Object.defineProperty(textarea, "selectionEnd", { value: 10, writable: true });

    await fireEvent.keyDown(textarea, { key: "Enter" });
    // The value should contain a newline followed by the same indentation
    expect(textarea.value).toContain("\n  ");
  });

  it("applies readonly attribute", () => {
    const { container } = render(CodeEditor, { props: { readonly: true } });
    const textarea = container.querySelector("textarea");
    expect(textarea?.hasAttribute("readonly")).toBe(true);
  });

  it("applies placeholder attribute", () => {
    const { container } = render(CodeEditor, { props: { placeholder: "Type code..." } });
    const textarea = container.querySelector("textarea");
    expect(textarea?.getAttribute("placeholder")).toBe("Type code...");
  });

  it("highlights typescript keywords", () => {
    const { container } = render(CodeEditor, { props: { value: "const x = 1", language: "typescript" } });
    const highlight = container.querySelector(".cy-ce__highlight");
    expect(highlight?.innerHTML).toContain("cy-ce__hl-keyword");
  });

  it("highlights strings in code", () => {
    const { container } = render(CodeEditor, { props: { value: '"hello world"', language: "typescript" } });
    const highlight = container.querySelector(".cy-ce__highlight");
    expect(highlight?.innerHTML).toContain("cy-ce__hl-string");
  });

  it("highlights numbers in code", () => {
    const { container } = render(CodeEditor, { props: { value: "x = 42", language: "typescript" } });
    const highlight = container.querySelector(".cy-ce__highlight");
    expect(highlight?.innerHTML).toContain("cy-ce__hl-number");
  });

  it("highlights comments in code", () => {
    const { container } = render(CodeEditor, { props: { value: "// this is a comment", language: "typescript" } });
    const highlight = container.querySelector(".cy-ce__highlight");
    expect(highlight?.innerHTML).toContain("cy-ce__hl-comment");
  });

  it("highlights solidity keywords", () => {
    const { container } = render(CodeEditor, { props: { value: "pragma solidity ^0.8.0;", language: "solidity" } });
    const highlight = container.querySelector(".cy-ce__highlight");
    expect(highlight?.innerHTML).toContain("cy-ce__hl-keyword");
  });

  it("highlights javascript keywords", () => {
    const { container } = render(CodeEditor, { props: { value: "function test() {}", language: "javascript" } });
    const highlight = container.querySelector(".cy-ce__highlight");
    expect(highlight?.innerHTML).toContain("cy-ce__hl-keyword");
  });

  it("handles json language with no keywords", () => {
    const { container } = render(CodeEditor, { props: { value: '{"key": "value"}', language: "json" } });
    const highlight = container.querySelector(".cy-ce__highlight");
    // JSON should still highlight strings but no keywords
    expect(highlight?.innerHTML).toContain("cy-ce__hl-string");
  });

  it("highlights block comments", () => {
    const { container } = render(CodeEditor, { props: { value: "/* block comment */", language: "typescript" } });
    const highlight = container.querySelector(".cy-ce__highlight");
    expect(highlight?.innerHTML).toContain("cy-ce__hl-comment");
  });

  it("applies error class when error is provided", () => {
    const { container } = render(CodeEditor, { props: { error: "Something wrong" } });
    expect(container.querySelector(".cy-ce--error")).toBeInTheDocument();
  });

  it("applies disabled class when disabled", () => {
    const { container } = render(CodeEditor, { props: { disabled: true } });
    expect(container.querySelector(".cy-ce--disabled")).toBeInTheDocument();
  });

  it("shows language badge when label is provided", () => {
    const { container } = render(CodeEditor, { props: { label: "Code", language: "solidity" } });
    expect(container.querySelector(".cy-ce__lang")?.textContent).toBe("solidity");
  });

  it("uses fallback aria-label when no label is provided", () => {
    const { container } = render(CodeEditor);
    const textarea = container.querySelector("textarea");
    expect(textarea?.getAttribute("aria-label")).toBe("Code editor");
  });

  it("syncs scroll on textarea scroll event", async () => {
    const { container } = render(CodeEditor, { props: { value: "line\n".repeat(50) } });
    const textarea = container.querySelector("textarea")!;
    Object.defineProperty(textarea, "scrollTop", { value: 100, writable: true });
    Object.defineProperty(textarea, "scrollLeft", { value: 50, writable: true });
    await fireEvent.scroll(textarea);
    // The gutter and highlight should reflect the scroll offset via style transform
    const gutter = container.querySelector(".cy-ce__gutter") as HTMLElement;
    if (gutter) {
      expect(gutter.style.transform).toContain("100");
    }
  });

  it("handles unknown language gracefully using typescript defaults", () => {
    const { container } = render(CodeEditor, { props: { value: "const x = 1", language: "python" } });
    const highlight = container.querySelector(".cy-ce__highlight");
    // Should fall back to typescript keywords
    expect(highlight?.innerHTML).toContain("cy-ce__hl-keyword");
  });
});
