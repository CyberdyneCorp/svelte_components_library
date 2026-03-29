import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import Timeline from "./Timeline.svelte";

describe("Timeline", () => {
  const items = [
    { title: "Model Created", timestamp: "2024-01-01", description: "Initial version" },
    { title: "Training Started", timestamp: "2024-01-02", variant: "success" as const },
  ];

  it("renders with default props", () => {
    render(Timeline);
    const el = document.querySelector(".cy-timeline");
    expect(el).toBeInTheDocument();
  });

  it("renders timeline items", () => {
    render(Timeline, { props: { items } });
    expect(screen.getByText("Model Created")).toBeInTheDocument();
    expect(screen.getByText("Training Started")).toBeInTheDocument();
  });

  it("displays timestamps", () => {
    render(Timeline, { props: { items } });
    expect(screen.getByText("2024-01-01")).toBeInTheDocument();
    expect(screen.getByText("2024-01-02")).toBeInTheDocument();
  });

  it("shows description when provided", () => {
    render(Timeline, { props: { items } });
    expect(screen.getByText("Initial version")).toBeInTheDocument();
  });
});
