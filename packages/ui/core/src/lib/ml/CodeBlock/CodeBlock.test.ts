import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import CodeBlock from "./CodeBlock.svelte";

describe("CodeBlock", () => {
  it("renders with default props", () => {
    render(CodeBlock);
    const el = document.querySelector(".cy-code");
    expect(el).toBeInTheDocument();
  });

  it("displays the language label", () => {
    render(CodeBlock, { props: { language: "python" } });
    expect(screen.getByText("python")).toBeInTheDocument();
  });

  it("renders code with line numbers", () => {
    render(CodeBlock, { props: { code: "const x = 1;\nconst y = 2;", showLineNumbers: true } });
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows copy button when copyable", () => {
    render(CodeBlock, { props: { copyable: true } });
    expect(screen.getByLabelText("Copy code")).toBeInTheDocument();
  });

  it("hides copy button when not copyable", () => {
    render(CodeBlock, { props: { copyable: false } });
    expect(screen.queryByLabelText("Copy code")).not.toBeInTheDocument();
  });

  it("copies code to clipboard on copy button click", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(CodeBlock, { props: { code: "console.log('hi');", copyable: true } });
    const copyBtn = screen.getByLabelText("Copy code");
    await fireEvent.click(copyBtn);
    expect(writeText).toHaveBeenCalledWith("console.log('hi');");
  });

  it("shows 'Copied!' text after clicking copy", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(CodeBlock, { props: { code: "test", copyable: true } });
    await fireEvent.click(screen.getByLabelText("Copy code"));
    expect(screen.getByText("Copied!")).toBeInTheDocument();
  });

  it("handles clipboard failure gracefully", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.assign(navigator, { clipboard: { writeText } });
    render(CodeBlock, { props: { code: "test", copyable: true } });
    await fireEvent.click(screen.getByLabelText("Copy code"));
    // Should not throw; button should still be present
    expect(screen.getByLabelText("Copy code")).toBeInTheDocument();
  });

  it("hides line numbers when showLineNumbers is false", () => {
    const { container } = render(CodeBlock, {
      props: { code: "const x = 1;", showLineNumbers: false },
    });
    const gutter = container.querySelector(".cy-code__gutter");
    expect(gutter).not.toBeInTheDocument();
  });

  it("highlights JavaScript keywords", () => {
    const { container } = render(CodeBlock, {
      props: { code: "const x = 1;", language: "typescript" },
    });
    const keyword = container.querySelector(".cy-code__keyword");
    expect(keyword).toBeInTheDocument();
    expect(keyword?.textContent).toBe("const");
  });

  it("highlights Python keywords", () => {
    const { container } = render(CodeBlock, {
      props: { code: "def hello():", language: "python" },
    });
    const keyword = container.querySelector(".cy-code__keyword");
    expect(keyword).toBeInTheDocument();
    expect(keyword?.textContent).toBe("def");
  });

  it("highlights JSON keywords", () => {
    const { container } = render(CodeBlock, {
      props: { code: "true", language: "json" },
    });
    const keyword = container.querySelector(".cy-code__keyword");
    expect(keyword).toBeInTheDocument();
  });

  it("highlights strings in output", () => {
    const { container } = render(CodeBlock, {
      props: { code: 'const x = "hello";', language: "typescript" },
    });
    const content = container.querySelector(".cy-code__content");
    expect(content?.innerHTML).toContain("cy-code__string");
  });

  it("highlights numbers in output", () => {
    const { container } = render(CodeBlock, {
      props: { code: "const x = 42;", language: "typescript" },
    });
    const content = container.querySelector(".cy-code__content");
    expect(content?.innerHTML).toContain("cy-code__number");
  });

  it("highlights comments in output", () => {
    const { container } = render(CodeBlock, {
      props: { code: "// this is a comment", language: "typescript" },
    });
    const content = container.querySelector(".cy-code__content");
    expect(content?.innerHTML).toContain("cy-code__comment");
  });

  it("highlights Python comments in output", () => {
    const { container } = render(CodeBlock, {
      props: { code: "# this is a comment", language: "python" },
    });
    const content = container.querySelector(".cy-code__content");
    expect(content?.innerHTML).toContain("cy-code__comment");
  });

  it("applies max-height when provided", () => {
    const { container } = render(CodeBlock, {
      props: { code: "test", maxHeight: "200px" },
    });
    const el = container.querySelector(".cy-code") as HTMLElement;
    expect(el.style.maxHeight).toBe("200px");
  });

  it("renders multiple lines correctly", () => {
    render(CodeBlock, {
      props: { code: "line1\nline2\nline3", showLineNumbers: true },
    });
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("escapes HTML entities in code", () => {
    const { container } = render(CodeBlock, {
      props: { code: "a < b && c > d", language: "typescript" },
    });
    const content = container.querySelector(".cy-code__content");
    expect(content?.innerHTML).toContain("&amp;");
    expect(content?.innerHTML).toContain("&lt;");
    expect(content?.innerHTML).toContain("&gt;");
  });
});
