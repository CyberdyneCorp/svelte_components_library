import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import DiffViewer from "./DiffViewer.svelte";

describe("DiffViewer", () => {
  it("renders the diff container", () => {
    const { container } = render(DiffViewer, {
      props: { oldText: "hello", newText: "world" },
    });
    expect(container.querySelector(".cy-diff")).toBeInTheDocument();
  });

  it("shows labels for old and new text", () => {
    render(DiffViewer, {
      props: { oldText: "a", newText: "b", oldLabel: "Before", newLabel: "After" },
    });
    expect(screen.getByText("Before")).toBeInTheDocument();
    expect(screen.getByText("After")).toBeInTheDocument();
  });

  it("renders in split mode by default", () => {
    const { container } = render(DiffViewer, {
      props: { oldText: "a", newText: "b" },
    });
    expect(container.querySelector(".cy-diff__split")).toBeInTheDocument();
  });

  it("renders in unified mode", () => {
    const { container } = render(DiffViewer, {
      props: { oldText: "a", newText: "b", mode: "unified" },
    });
    expect(container.querySelector(".cy-diff--unified")).toBeInTheDocument();
  });

  it("shows language tag when provided", () => {
    render(DiffViewer, {
      props: { oldText: "a", newText: "b", language: "typescript" },
    });
    const langTags = screen.getAllByText("typescript");
    expect(langTags.length).toBeGreaterThan(0);
  });
});
