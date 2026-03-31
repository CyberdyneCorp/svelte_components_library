import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import FilterBar from "./FilterBar.svelte";

const selectFilter = {
  id: "status",
  label: "Status",
  type: "select" as const,
  options: [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ],
};

const multiselectFilter = {
  id: "tags",
  label: "Tags",
  type: "multiselect" as const,
  options: [
    { value: "bug", label: "Bug" },
    { value: "feature", label: "Feature" },
    { value: "docs", label: "Docs" },
  ],
};

const textFilter = {
  id: "search",
  label: "Search",
  type: "text" as const,
};

const booleanFilter = {
  id: "starred",
  label: "Starred",
  type: "boolean" as const,
};

const dateFilter = {
  id: "created",
  label: "Created",
  type: "date" as const,
};

describe("FilterBar", () => {
  it("renders all filter chips", () => {
    render(FilterBar, {
      props: { filters: [selectFilter, textFilter] },
    });
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
  });

  it("has toolbar role", () => {
    render(FilterBar, { props: { filters: [selectFilter] } });
    expect(screen.getByRole("toolbar")).toBeInTheDocument();
  });

  // Select filter
  it("opens dropdown on chip click", async () => {
    render(FilterBar, { props: { filters: [selectFilter] } });
    await fireEvent.click(screen.getByText("Status"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });

  it("selects an option and calls onchange", async () => {
    const onchange = vi.fn();
    render(FilterBar, { props: { filters: [selectFilter], onchange } });
    await fireEvent.click(screen.getByText("Status"));
    await fireEvent.click(screen.getByText("Active"));
    expect(onchange).toHaveBeenCalledWith({ status: "active" });
  });

  it("shows active filter value on chip", async () => {
    render(FilterBar, {
      props: { filters: [selectFilter], activeFilters: { status: "active" } },
    });
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Status:")).toBeInTheDocument();
  });

  it("removes filter via remove button", async () => {
    const onchange = vi.fn();
    render(FilterBar, {
      props: { filters: [selectFilter], activeFilters: { status: "active" }, onchange },
    });
    const removeBtn = screen.getByLabelText("Remove Status filter");
    await fireEvent.click(removeBtn);
    expect(onchange).toHaveBeenCalledWith({});
  });

  // Multiselect filter
  it("toggles multiselect option", async () => {
    const onchange = vi.fn();
    render(FilterBar, { props: { filters: [multiselectFilter], onchange } });
    await fireEvent.click(screen.getByText("Tags"));
    await fireEvent.click(screen.getByText("Bug"));
    expect(onchange).toHaveBeenCalledWith({ tags: ["bug"] });
  });

  it("removes multiselect filter when last option unchecked", async () => {
    const onchange = vi.fn();
    render(FilterBar, {
      props: { filters: [multiselectFilter], activeFilters: { tags: ["bug"] }, onchange },
    });
    await fireEvent.click(screen.getByText("Tags:"));
    const bugCheckbox = screen.getByRole("checkbox", { name: "Bug" });
    await fireEvent.click(bugCheckbox);
    expect(onchange).toHaveBeenCalledWith({});
  });

  it("shows count for multiselect with multiple values", async () => {
    render(FilterBar, {
      props: { filters: [multiselectFilter], activeFilters: { tags: ["bug", "feature"] } },
    });
    expect(screen.getByText("2 selected")).toBeInTheDocument();
  });

  it("shows label for single multiselect value", async () => {
    render(FilterBar, {
      props: { filters: [multiselectFilter], activeFilters: { tags: ["bug"] } },
    });
    expect(screen.getByText("Bug")).toBeInTheDocument();
  });

  // Boolean filter
  it("toggles boolean filter on", async () => {
    const onchange = vi.fn();
    render(FilterBar, { props: { filters: [booleanFilter], onchange } });
    await fireEvent.click(screen.getByText("Starred"));
    await fireEvent.click(screen.getByText("Enable"));
    expect(onchange).toHaveBeenCalledWith({ starred: true });
  });

  it("toggles boolean filter off", async () => {
    const onchange = vi.fn();
    render(FilterBar, {
      props: { filters: [booleanFilter], activeFilters: { starred: true }, onchange },
    });
    await fireEvent.click(screen.getByText("Starred:"));
    await fireEvent.click(screen.getByText("Enabled (click to disable)"));
    expect(onchange).toHaveBeenCalledWith({});
  });

  it("shows Yes for active boolean filter", () => {
    render(FilterBar, {
      props: { filters: [booleanFilter], activeFilters: { starred: true } },
    });
    expect(screen.getByText("Yes")).toBeInTheDocument();
  });

  // Text filter
  it("applies text filter", async () => {
    const onchange = vi.fn();
    render(FilterBar, { props: { filters: [textFilter], onchange } });
    await fireEvent.click(screen.getByText("Search"));
    const input = screen.getByPlaceholderText("Type to filter...");
    await fireEvent.input(input, { target: { value: "hello" } });
    await fireEvent.click(screen.getByText("Apply"));
    expect(onchange).toHaveBeenCalledWith({ search: "hello" });
  });

  it("removes text filter when empty value applied", async () => {
    const onchange = vi.fn();
    render(FilterBar, {
      props: { filters: [textFilter], activeFilters: { search: "hello" }, onchange },
    });
    await fireEvent.click(screen.getByText("Search:"));
    await fireEvent.click(screen.getByText("Apply"));
    expect(onchange).toHaveBeenCalledWith({});
  });

  it("applies text filter on Enter key", async () => {
    const onchange = vi.fn();
    render(FilterBar, { props: { filters: [textFilter], onchange } });
    await fireEvent.click(screen.getByText("Search"));
    const input = screen.getByPlaceholderText("Type to filter...");
    await fireEvent.input(input, { target: { value: "test" } });
    await fireEvent.keyDown(input, { key: "Enter" });
    expect(onchange).toHaveBeenCalledWith({ search: "test" });
  });

  // Date filter
  it("opens date filter dropdown", async () => {
    render(FilterBar, { props: { filters: [dateFilter] } });
    await fireEvent.click(screen.getByText("Created"));
    expect(screen.getByText("From")).toBeInTheDocument();
    expect(screen.getByText("To")).toBeInTheDocument();
  });

  it("applies date filter", async () => {
    const onchange = vi.fn();
    render(FilterBar, { props: { filters: [dateFilter], onchange } });
    await fireEvent.click(screen.getByText("Created"));
    const inputs = screen.getAllByDisplayValue("");
    await fireEvent.input(inputs[0], { target: { value: "2024-01-01" } });
    await fireEvent.click(screen.getByText("Apply"));
    expect(onchange).toHaveBeenCalled();
  });

  it("removes date filter when both dates empty", async () => {
    const onchange = vi.fn();
    render(FilterBar, { props: { filters: [dateFilter], onchange } });
    await fireEvent.click(screen.getByText("Created"));
    await fireEvent.click(screen.getByText("Apply"));
    expect(onchange).toHaveBeenCalledWith({});
  });

  // Clear all
  it("shows clear all button when filters are active", () => {
    render(FilterBar, {
      props: { filters: [selectFilter], activeFilters: { status: "active" } },
    });
    expect(screen.getByText("Clear all")).toBeInTheDocument();
  });

  it("clears all filters", async () => {
    const onclear = vi.fn();
    const onchange = vi.fn();
    render(FilterBar, {
      props: {
        filters: [selectFilter],
        activeFilters: { status: "active" },
        onclear,
        onchange,
      },
    });
    await fireEvent.click(screen.getByText("Clear all"));
    expect(onclear).toHaveBeenCalled();
    expect(onchange).toHaveBeenCalledWith({});
  });

  it("hides clear all when showClearAll is false", () => {
    render(FilterBar, {
      props: {
        filters: [selectFilter],
        activeFilters: { status: "active" },
        showClearAll: false,
      },
    });
    expect(screen.queryByText("Clear all")).not.toBeInTheDocument();
  });

  it("hides clear all when no active filters", () => {
    render(FilterBar, { props: { filters: [selectFilter] } });
    expect(screen.queryByText("Clear all")).not.toBeInTheDocument();
  });

  // Keyboard navigation
  it("toggles dropdown on Enter key", async () => {
    render(FilterBar, { props: { filters: [selectFilter] } });
    const chip = screen.getByText("Status");
    await fireEvent.keyDown(chip, { key: "Enter" });
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("toggles dropdown on Space key", async () => {
    render(FilterBar, { props: { filters: [selectFilter] } });
    const chip = screen.getByText("Status");
    await fireEvent.keyDown(chip, { key: " " });
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("closes dropdown on Escape key", async () => {
    render(FilterBar, { props: { filters: [selectFilter] } });
    const chip = screen.getByText("Status");
    await fireEvent.click(chip);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await fireEvent.keyDown(chip, { key: "Escape" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  // Compact mode
  it("applies compact class", () => {
    const { container } = render(FilterBar, {
      props: { filters: [selectFilter], compact: true },
    });
    expect(container.querySelector(".cy-filter-bar--compact")).toBeInTheDocument();
  });

  // Close dropdown on chip toggle
  it("closes dropdown when same chip clicked again", async () => {
    render(FilterBar, { props: { filters: [selectFilter] } });
    const chip = screen.getByText("Status");
    await fireEvent.click(chip);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await fireEvent.click(chip);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  // Active count badge
  it("shows active count badge", () => {
    render(FilterBar, {
      props: { filters: [selectFilter, textFilter], activeFilters: { status: "active", search: "test" } },
    });
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
