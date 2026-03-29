import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import Terminal from "./Terminal.svelte";

describe("Terminal", () => {
  it("renders with default props", () => {
    render(Terminal);
    const el = document.querySelector(".cy-term");
    expect(el).toBeInTheDocument();
  });

  it("displays the title in header", () => {
    render(Terminal, { props: { title: "My Terminal" } });
    expect(screen.getByText("My Terminal")).toBeInTheDocument();
  });

  it("renders terminal lines", () => {
    const lines = [
      { text: "Hello world", type: "stdout" as const },
      { text: "Error occurred", type: "stderr" as const },
    ];
    render(Terminal, { props: { lines } });
    expect(screen.getByText("Hello world")).toBeInTheDocument();
    expect(screen.getByText("Error occurred")).toBeInTheDocument();
  });

  it("hides header when showHeader is false", () => {
    render(Terminal, { props: { showHeader: false } });
    expect(document.querySelector(".cy-term__header")).not.toBeInTheDocument();
  });

  it("renders command lines with prompt", () => {
    const lines = [{ text: "ls -la", type: "command" as const }];
    render(Terminal, { props: { lines } });
    expect(screen.getByText("$")).toBeInTheDocument();
    expect(screen.getByText("ls -la")).toBeInTheDocument();
  });
});
