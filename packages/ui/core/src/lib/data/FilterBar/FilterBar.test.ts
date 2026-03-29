import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import FilterBar from "./FilterBar.svelte";

const filters = [
  {
    id: "status",
    label: "Status",
    type: "select" as const,
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
    ],
  },
];

describe("FilterBar", () => {
  it("renders with toolbar role", () => {
    render(FilterBar, { props: { filters } });
    expect(screen.getByRole("toolbar")).toBeInTheDocument();
  });

  it("renders filter chips", () => {
    render(FilterBar, { props: { filters } });
    expect(screen.getByText("Status")).toBeInTheDocument();
  });

  it("opens dropdown on chip click", async () => {
    render(FilterBar, { props: { filters } });
    await fireEvent.click(screen.getByText("Status"));
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });

  it("shows clear all when filters are active", () => {
    render(FilterBar, {
      props: { filters, activeFilters: { status: "active" } },
    });
    expect(screen.getByText("Clear all")).toBeInTheDocument();
  });

  it("calls onchange when a filter option is selected", async () => {
    const onchange = vi.fn();
    render(FilterBar, { props: { filters, onchange } });
    await fireEvent.click(screen.getByText("Status"));
    await fireEvent.click(screen.getByText("Active"));
    expect(onchange).toHaveBeenCalled();
  });
});
