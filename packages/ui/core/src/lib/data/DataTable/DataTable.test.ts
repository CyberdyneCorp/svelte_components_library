import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import DataTable from "./DataTable.svelte";

const columns = [
  { key: "name", label: "Name", sortable: true },
  { key: "role", label: "Role" },
];
const rows = [
  { id: "1", name: "Alice", role: "Admin" },
  { id: "2", name: "Bob", role: "User" },
];

describe("DataTable", () => {
  it("renders column headers", () => {
    render(DataTable, { props: { columns, rows } });
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Role")).toBeInTheDocument();
  });

  it("renders row data", () => {
    render(DataTable, { props: { columns, rows } });
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("shows empty state when no rows", () => {
    render(DataTable, { props: { columns, rows: [] } });
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("renders checkboxes when selectable", () => {
    const { container } = render(DataTable, {
      props: { columns, rows, selectable: true },
    });
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    // 1 header checkbox + 2 row checkboxes
    expect(checkboxes.length).toBe(3);
  });

  it("renders pagination when pageSize is set", () => {
    render(DataTable, {
      props: { columns, rows, pageSize: 1, currentPage: 1 },
    });
    expect(screen.getByText(/Showing/)).toBeInTheDocument();
  });
});
