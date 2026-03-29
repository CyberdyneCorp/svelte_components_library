import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import DataChart from "./DataChart.svelte";

describe("DataChart", () => {
  it("renders with default props", () => {
    render(DataChart);
    const el = document.querySelector(".cy-chart");
    expect(el).toBeInTheDocument();
  });

  it("displays title when provided", () => {
    render(DataChart, { props: { title: "Loss Over Time" } });
    expect(screen.getByText("Loss Over Time")).toBeInTheDocument();
  });

  it("displays description when provided", () => {
    render(DataChart, { props: { description: "Training metrics" } });
    expect(screen.getByText("Training metrics")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(DataChart, { props: { loading: true } });
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows empty message when empty", () => {
    render(DataChart, { props: { empty: true, emptyMessage: "No data yet" } });
    expect(screen.getByText("No data yet")).toBeInTheDocument();
  });
});
