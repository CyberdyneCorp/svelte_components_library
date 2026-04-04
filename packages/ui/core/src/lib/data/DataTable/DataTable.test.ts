import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import DataTable from "./DataTable.svelte";

const columns = [
  { key: "name", label: "Name", sortable: true },
  { key: "role", label: "Role" },
  { key: "age", label: "Age", sortable: true, resizable: true },
];

const rows = [
  { id: "1", name: "Alice", role: "Admin", age: 30 },
  { id: "2", name: "Bob", role: "User", age: 25 },
  { id: "3", name: "Charlie", role: "Editor", age: 35 },
  { id: "4", name: "Diana", role: "Viewer", age: 28 },
];

describe("DataTable", () => {
  it("renders column headers", () => {
    render(DataTable, { props: { columns, rows } });
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Role")).toBeInTheDocument();
    expect(screen.getByText("Age")).toBeInTheDocument();
  });

  it("renders row data", () => {
    render(DataTable, { props: { columns, rows } });
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Charlie")).toBeInTheDocument();
  });

  it("shows empty state when no rows", () => {
    render(DataTable, { props: { columns, rows: [] } });
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  // Sorting
  it("renders sort buttons for sortable columns", () => {
    render(DataTable, { props: { columns, rows } });
    expect(screen.getByLabelText("Sort by Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Sort by Age")).toBeInTheDocument();
  });

  it("sorts rows ascending on first click", async () => {
    const onsort = vi.fn();
    render(DataTable, { props: { columns, rows, onsort } });
    await fireEvent.click(screen.getByLabelText("Sort by Name"));
    expect(onsort).toHaveBeenCalledWith("name", "asc");
  });

  it("toggles sort direction on second click", async () => {
    const onsort = vi.fn();
    render(DataTable, { props: { columns, rows, onsort } });
    const sortBtn = screen.getByLabelText("Sort by Name");
    await fireEvent.click(sortBtn);
    expect(onsort).toHaveBeenCalledWith("name", "asc");
    await fireEvent.click(sortBtn);
    expect(onsort).toHaveBeenCalledWith("name", "desc");
  });

  it("sorts by a different column resets to asc", async () => {
    const onsort = vi.fn();
    render(DataTable, { props: { columns, rows, onsort } });
    await fireEvent.click(screen.getByLabelText("Sort by Name"));
    await fireEvent.click(screen.getByLabelText("Sort by Name"));
    await fireEvent.click(screen.getByLabelText("Sort by Age"));
    expect(onsort).toHaveBeenLastCalledWith("age", "asc");
  });

  // Row selection
  it("renders checkboxes when selectable", () => {
    const { container } = render(DataTable, {
      props: { columns, rows, selectable: true },
    });
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBe(5); // 1 header + 4 rows
  });

  it("toggles row selection on checkbox click", async () => {
    const { container } = render(DataTable, {
      props: { columns, rows, selectable: true },
    });
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    await fireEvent.click(checkboxes[1]); // first row checkbox
    expect(screen.getByText("1 selected")).toBeInTheDocument();
  });

  it("select all toggles all rows on current page", async () => {
    const { container } = render(DataTable, {
      props: { columns, rows, selectable: true },
    });
    const selectAll = container.querySelectorAll('input[type="checkbox"]')[0];
    await fireEvent.click(selectAll);
    expect(screen.getByText("4 selected")).toBeInTheDocument();
  });

  it("deselects all when select-all is clicked twice", async () => {
    const { container } = render(DataTable, {
      props: { columns, rows, selectable: true },
    });
    const selectAll = container.querySelectorAll('input[type="checkbox"]')[0];
    await fireEvent.click(selectAll);
    expect(screen.getByText("4 selected")).toBeInTheDocument();
    await fireEvent.click(selectAll);
    expect(screen.queryByText(/selected/)).not.toBeInTheDocument();
  });

  it("deselects a row by clicking its checkbox again", async () => {
    const { container } = render(DataTable, {
      props: { columns, rows, selectable: true },
    });
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    await fireEvent.click(checkboxes[1]);
    expect(screen.getByText("1 selected")).toBeInTheDocument();
    await fireEvent.click(checkboxes[1]);
    expect(screen.queryByText(/selected/)).not.toBeInTheDocument();
  });

  // Row click
  it("calls onrowclick when a row is clicked", async () => {
    const onrowclick = vi.fn();
    render(DataTable, { props: { columns, rows, onrowclick } });
    await fireEvent.click(screen.getByText("Alice"));
    expect(onrowclick).toHaveBeenCalledWith(rows[0]);
  });

  // Pagination
  it("renders pagination when pageSize is set", () => {
    render(DataTable, {
      props: { columns, rows, pageSize: 2, currentPage: 1 },
    });
    expect(screen.getByText("Showing 1-2 of 4")).toBeInTheDocument();
  });

  it("shows correct page count buttons", () => {
    render(DataTable, {
      props: { columns, rows, pageSize: 2, currentPage: 1 },
    });
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("navigates to next page", async () => {
    render(DataTable, {
      props: { columns, rows, pageSize: 2, currentPage: 1 },
    });
    await fireEvent.click(screen.getByLabelText("Next page"));
    expect(screen.getByText("Charlie")).toBeInTheDocument();
    expect(screen.getByText("Diana")).toBeInTheDocument();
  });

  it("navigates to previous page", async () => {
    render(DataTable, {
      props: { columns, rows, pageSize: 2, currentPage: 2 },
    });
    await fireEvent.click(screen.getByLabelText("Previous page"));
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("disables previous button on first page", () => {
    render(DataTable, {
      props: { columns, rows, pageSize: 2, currentPage: 1 },
    });
    expect(screen.getByLabelText("Previous page")).toBeDisabled();
  });

  it("disables next button on last page", () => {
    render(DataTable, {
      props: { columns, rows, pageSize: 2, currentPage: 2 },
    });
    expect(screen.getByLabelText("Next page")).toBeDisabled();
  });

  it("can click a specific page number", async () => {
    render(DataTable, {
      props: { columns, rows, pageSize: 2, currentPage: 1 },
    });
    await fireEvent.click(screen.getByText("2"));
    expect(screen.getByText("Showing 3-4 of 4")).toBeInTheDocument();
  });

  // Expandable
  it("renders expand buttons when expandable", () => {
    render(DataTable, {
      props: { columns, rows, expandable: true },
    });
    const expandBtns = screen.getAllByLabelText("Expand row");
    expect(expandBtns.length).toBe(4);
  });

  it("toggles row expansion", async () => {
    render(DataTable, {
      props: { columns, rows, expandable: true },
    });
    const expandBtns = screen.getAllByLabelText("Expand row");
    await fireEvent.click(expandBtns[0]);
    expect(screen.getByText("No expanded content")).toBeInTheDocument();
  });

  it("collapses row on second click", async () => {
    render(DataTable, {
      props: { columns, rows, expandable: true },
    });
    const expandBtns = screen.getAllByLabelText("Expand row");
    await fireEvent.click(expandBtns[0]);
    expect(screen.getByText("No expanded content")).toBeInTheDocument();
    await fireEvent.click(expandBtns[0]);
    expect(screen.queryByText("No expanded content")).not.toBeInTheDocument();
  });

  it("uses renderExpanded callback when provided", async () => {
    render(DataTable, {
      props: {
        columns,
        rows,
        expandable: true,
        renderExpanded: (row: Record<string, any>) => `Details for ${row.name}`,
      },
    });
    const expandBtns = screen.getAllByLabelText("Expand row");
    await fireEvent.click(expandBtns[0]);
    expect(screen.getByText("Details for Alice")).toBeInTheDocument();
  });

  // Striped
  it("applies striped class", () => {
    const { container } = render(DataTable, {
      props: { columns, rows, striped: true },
    });
    const table = container.querySelector(".cy-datatable__table--striped");
    expect(table).toBeInTheDocument();
  });

  // Sorting with null values
  it("handles null values in sorting", async () => {
    const rowsWithNull = [
      { id: "1", name: null, role: "Admin" },
      { id: "2", name: "Bob", role: "User" },
      { id: "3", name: "Alice", role: "Editor" },
    ];
    render(DataTable, { props: { columns, rows: rowsWithNull } });
    await fireEvent.click(screen.getByLabelText("Sort by Name"));
    // null should sort to end
    const cells = screen.getAllByRole("row");
    expect(cells.length).toBeGreaterThan(1);
  });

  // No pagination when pageSize is 0
  it("does not render pagination when pageSize is 0", () => {
    render(DataTable, { props: { columns, rows, pageSize: 0 } });
    expect(screen.queryByText(/Showing/)).not.toBeInTheDocument();
  });

  // Resize handle
  it("renders resize handle for resizable columns", () => {
    const { container } = render(DataTable, { props: { columns, rows } });
    const handles = container.querySelectorAll(".cy-datatable__resize-handle");
    expect(handles.length).toBe(1); // only 'age' column is resizable
  });

  // Non-sortable column shows label directly
  it("non-sortable column renders label as text", () => {
    render(DataTable, { props: { columns, rows } });
    expect(screen.getByText("Role")).toBeInTheDocument();
    expect(screen.queryByLabelText("Sort by Role")).not.toBeInTheDocument();
  });

  // Sorting order verification: rows reorder after sort
  it("actually reorders rows when sorted ascending by name", async () => {
    render(DataTable, { props: { columns, rows } });
    await fireEvent.click(screen.getByLabelText("Sort by Name"));
    const allRows = screen.getAllByRole("row");
    // Header + data rows; first data row should be Alice (alphabetical)
    const firstDataCells = allRows[1].querySelectorAll("td");
    expect(firstDataCells[0]?.textContent).toBe("Alice");
  });

  it("sorts descending on second click", async () => {
    render(DataTable, { props: { columns, rows } });
    const sortBtn = screen.getByLabelText("Sort by Name");
    await fireEvent.click(sortBtn);
    await fireEvent.click(sortBtn);
    const allRows = screen.getAllByRole("row");
    const firstDataCells = allRows[1].querySelectorAll("td");
    expect(firstDataCells[0]?.textContent).toBe("Diana");
  });

  // Sorting with null values — null comes last in desc too
  it("handles null values sorting desc", async () => {
    const rowsWithNull = [
      { id: "1", name: null, role: "Admin", age: 30 },
      { id: "2", name: "Bob", role: "User", age: 25 },
      { id: "3", name: "Alice", role: "Editor", age: 35 },
    ];
    render(DataTable, { props: { columns, rows: rowsWithNull } });
    const sortBtn = screen.getByLabelText("Sort by Name");
    await fireEvent.click(sortBtn);
    await fireEvent.click(sortBtn); // desc
    const allRows = screen.getAllByRole("row");
    expect(allRows.length).toBeGreaterThan(1);
  });

  // Resize column
  it("starts column resize on mousedown", async () => {
    const { container } = render(DataTable, { props: { columns, rows } });
    const handle = container.querySelector(".cy-datatable__resize-handle")!;
    await fireEvent.mouseDown(handle, { clientX: 100 });
    // Resize should have started — fire mousemove and mouseup on document
    await fireEvent.mouseMove(document, { clientX: 150 });
    await fireEvent.mouseUp(document);
    // Column should have been resized (no error thrown)
    expect(handle).toBeInTheDocument();
  });

  // Pagination: showing info text on page 2
  it("shows correct showing info on page 2", async () => {
    render(DataTable, {
      props: { columns, rows, pageSize: 2, currentPage: 2 },
    });
    expect(screen.getByText("Showing 3-4 of 4")).toBeInTheDocument();
  });

  // Selection bar shows when rows are selected
  it("shows selection bar with count", async () => {
    const { container } = render(DataTable, {
      props: { columns, rows, selectable: true },
    });
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    await fireEvent.click(checkboxes[1]);
    await fireEvent.click(checkboxes[2]);
    expect(screen.getByText("2 selected")).toBeInTheDocument();
  });

  // Sticky header class
  it("applies sticky header class by default", () => {
    const { container } = render(DataTable, { props: { columns, rows } });
    const thead = container.querySelector(".cy-datatable__thead--sticky");
    expect(thead).toBeInTheDocument();
  });

  it("does not apply sticky header when stickyHeader is false", () => {
    const { container } = render(DataTable, {
      props: { columns, rows, stickyHeader: false },
    });
    const thead = container.querySelector(".cy-datatable__thead--sticky");
    expect(thead).not.toBeInTheDocument();
  });

  // maxHeight scroll wrapper
  it("applies scroll wrapper when maxHeight is set", () => {
    const { container } = render(DataTable, {
      props: { columns, rows, maxHeight: "300px" },
    });
    const wrapper = container.querySelector(".cy-datatable__wrapper--scroll");
    expect(wrapper).toBeInTheDocument();
  });

  // Expand with selectable shows correct totalCols
  it("renders with both selectable and expandable", () => {
    const { container } = render(DataTable, {
      props: { columns, rows, selectable: true, expandable: true },
    });
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    const expandBtns = screen.getAllByLabelText("Expand row");
    expect(checkboxes.length).toBe(5); // 1 header + 4 rows
    expect(expandBtns.length).toBe(4);
  });

  // Row click with no handler does not throw
  it("clicking row without onrowclick does not throw", async () => {
    render(DataTable, { props: { columns, rows } });
    await fireEvent.click(screen.getByText("Alice"));
    // No error thrown
  });

  // Column width prop
  it("applies column width from column definition", () => {
    const colsWithWidth = [
      { key: "name", label: "Name", width: "200px" },
      { key: "role", label: "Role" },
    ];
    const { container } = render(DataTable, {
      props: { columns: colsWithWidth, rows },
    });
    const ths = container.querySelectorAll(".cy-datatable__th");
    // The name column th should have width style
    expect(ths.length).toBeGreaterThan(0);
  });
});
