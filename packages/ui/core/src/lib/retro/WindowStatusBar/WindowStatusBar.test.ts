import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import { createRawSnippet } from "svelte";
import WindowStatusBar from "./WindowStatusBar.svelte";

describe("WindowStatusBar", () => {
  it("renders each segment", () => {
    render(WindowStatusBar, { props: { segments: ["Ready", "Line 1", "UTF-8"] } });
    expect(screen.getByText("Ready")).toBeInTheDocument();
    expect(screen.getByText("Line 1")).toBeInTheDocument();
    expect(screen.getByText("UTF-8")).toBeInTheDocument();
  });
  it("has status role and aria-label", () => {
    render(WindowStatusBar, { props: { segments: ["a"], ariaLabel: "Bar" } });
    expect(screen.getByRole("status", { name: "Bar" })).toBeInTheDocument();
  });
  it("defaults aria-label", () => {
    render(WindowStatusBar, { props: { segments: ["a"] } });
    expect(screen.getByRole("status", { name: "Window status" })).toBeInTheDocument();
  });
  it("renders empty when no segments", () => {
    const { container } = render(WindowStatusBar);
    expect(container.querySelectorAll(".cy-winstatus__seg")).toHaveLength(0);
  });
  it("prefers children slot over segments", () => {
    render(WindowStatusBar, {
      props: {
        segments: ["IGNORED"],
        children: createRawSnippet(() => ({ render: () => `<span>CUSTOM</span>` })),
      },
    });
    expect(screen.getByText("CUSTOM")).toBeInTheDocument();
    expect(screen.queryByText("IGNORED")).not.toBeInTheDocument();
  });
});
