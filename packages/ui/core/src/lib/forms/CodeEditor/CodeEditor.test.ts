import { render } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
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
});
