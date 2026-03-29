import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import EmptyState from "./EmptyState.svelte";

describe("EmptyState", () => {
  it("renders the title", () => {
    render(EmptyState, { props: { title: "No results" } });
    expect(screen.getByText("No results")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(EmptyState, { props: { title: "Empty", description: "Nothing here" } });
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  it("renders without description", () => {
    const { container } = render(EmptyState, { props: { title: "Empty" } });
    expect(container.querySelector(".cy-empty-state__desc")).not.toBeInTheDocument();
  });

  it("renders an icon", () => {
    const { container } = render(EmptyState, { props: { title: "Empty" } });
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders title as h3", () => {
    render(EmptyState, { props: { title: "Empty" } });
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Empty");
  });
});
