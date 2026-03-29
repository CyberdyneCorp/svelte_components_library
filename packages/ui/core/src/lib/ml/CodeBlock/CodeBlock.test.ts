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
});
