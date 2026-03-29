import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import Table from "./Table.svelte";

const columns = [
  { key: "name", label: "Name", sortable: true },
  { key: "email", label: "Email" },
];
const rows = [
  { name: "Alice", email: "alice@test.com" },
  { name: "Bob", email: "bob@test.com" },
];

describe("Table", () => {
  it("renders column headers", () => {
    render(Table, { props: { columns, rows } });
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("renders row data", () => {
    render(Table, { props: { columns, rows } });
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("bob@test.com")).toBeInTheDocument();
  });

  it("renders sort button for sortable columns", () => {
    render(Table, { props: { columns, rows } });
    const sortBtn = screen.getByText("Name").closest("button");
    expect(sortBtn).toBeInTheDocument();
  });

  it("sorts rows when sort button is clicked", async () => {
    render(Table, { props: { columns, rows } });
    const sortBtn = screen.getByText("Name").closest("button")!;
    await fireEvent.click(sortBtn);
    const cells = screen.getAllByRole("cell");
    expect(cells[0]).toHaveTextContent("Alice");
  });

  it("applies striped class when striped prop is true", () => {
    const { container } = render(Table, { props: { columns, rows, striped: true } });
    expect(container.querySelector(".cy-table--striped")).toBeInTheDocument();
  });
});
