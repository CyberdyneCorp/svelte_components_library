import { render, screen, fireEvent } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, it, expect, vi } from "vitest";
import Table from "./Table.svelte";
import type { TableCellContext } from "./types.js";
import TableCellSnippetDemo from "../../_testdata/TableCellSnippetDemo.svelte";

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

  describe("defaults (unchanged output)", () => {
    it("renders no caption, no row headers and plain row classes", () => {
      const { container } = render(Table, { props: { columns, rows } });
      expect(container.querySelector("caption")).toBeNull();
      expect(screen.queryAllByRole("rowheader")).toHaveLength(0);
      const bodyRows = container.querySelectorAll("tbody tr");
      expect(bodyRows).toHaveLength(2);
      for (const tr of bodyRows) {
        expect(tr.getAttribute("class")).toMatch(/^cy-table__row( svelte-[\w-]+)?$/);
        expect(tr.getAttributeNames().filter((n) => n !== "class")).toEqual([]);
      }
    });
  });

  describe("caption", () => {
    it("names the table with a visible caption", () => {
      const { container } = render(Table, { props: { columns, rows, caption: "Team members" } });
      expect(screen.getByRole("table", { name: "Team members" })).toBeInTheDocument();
      expect(container.querySelector("caption")).not.toHaveClass("cy-table__caption--hidden");
    });

    it("can hide the caption visually and keep the name", () => {
      const { container } = render(Table, {
        props: { columns, rows, caption: "Team members", captionHidden: true },
      });
      expect(screen.getByRole("table", { name: "Team members" })).toBeInTheDocument();
      expect(container.querySelector("caption")).toHaveClass("cy-table__caption--hidden");
    });
  });

  describe("row headers", () => {
    it("renders the chosen column as th scope=row", () => {
      render(Table, { props: { columns, rows, rowHeader: "name" } });
      const headers = screen.getAllByRole("rowheader");
      expect(headers.map((h) => h.textContent?.trim())).toEqual(["Alice", "Bob"]);
      for (const h of headers) expect(h).toHaveAttribute("scope", "row");
      expect(screen.getAllByRole("cell").map((c) => c.textContent?.trim())).toEqual([
        "alice@test.com",
        "bob@test.com",
      ]);
    });

    it("keeps sorting with row headers", async () => {
      render(Table, { props: { columns, rows, rowHeader: "name" } });
      const sortBtn = screen.getByText("Name").closest("button")!;
      await fireEvent.click(sortBtn);
      await fireEvent.click(sortBtn);
      expect(screen.getAllByRole("rowheader").map((h) => h.textContent?.trim())).toEqual(["Bob", "Alice"]);
    });
  });

  describe("row attributes", () => {
    it("spreads data-*, aria-current and an extra class on each row", () => {
      const rowAttributes = vi.fn((row: Record<string, unknown>, index: number) => ({
        "data-id": String(row.name).toLowerCase(),
        "aria-current": index === 1 ? "true" : undefined,
        class: index === 1 ? "is-current" : undefined,
      }));
      const { container } = render(Table, { props: { columns, rows, rowAttributes } });
      const [first, second] = container.querySelectorAll("tbody tr");
      expect(first).toHaveAttribute("data-id", "alice");
      expect(first).not.toHaveAttribute("aria-current");
      expect(first).toHaveClass("cy-table__row");
      expect(first).not.toHaveClass("is-current");
      expect(second).toHaveAttribute("data-id", "bob");
      expect(second).toHaveAttribute("aria-current", "true");
      expect(second).toHaveClass("cy-table__row", "is-current");
      expect(rowAttributes).toHaveBeenCalledWith(rows[0], 0);
    });
  });

  describe("cell snippet", () => {
    const cell = createRawSnippet((ctx: () => TableCellContext) => ({
      render: () =>
        `<span data-testid="cell">${ctx().rowIndex}:${ctx().column.key}:${ctx().row[ctx().column.key]}</span>`,
    }));

    it("receives row, column and display rowIndex", () => {
      render(Table, { props: { columns, rows, cell } });
      expect(screen.getAllByTestId("cell").map((c) => c.textContent)).toEqual([
        "0:name:Alice",
        "0:email:alice@test.com",
        "1:name:Bob",
        "1:email:bob@test.com",
      ]);
    });

    it("uses the display index after sorting", async () => {
      render(TableCellSnippetDemo, { props: { columns, rows } });
      const sortBtn = screen.getByText("Name").closest("button")!;
      await fireEvent.click(sortBtn);
      await fireEvent.click(sortBtn);
      expect(screen.getAllByTestId("cell")[0].textContent).toBe("0:name:Bob");
    });

    it("yields to a column-level cell override", () => {
      const nameCell = createRawSnippet((row: () => Record<string, unknown>) => ({
        render: () => `<b data-testid="own">${row().name}</b>`,
      }));
      render(Table, {
        props: { columns: [{ ...columns[0], cell: nameCell }, columns[1]], rows, cell },
      });
      expect(screen.getAllByTestId("own").map((c) => c.textContent)).toEqual(["Alice", "Bob"]);
      expect(screen.getAllByTestId("cell").map((c) => c.textContent)).toEqual([
        "0:email:alice@test.com",
        "1:email:bob@test.com",
      ]);
    });

    it("renders inside row header cells too", () => {
      render(Table, { props: { columns, rows, cell, rowHeader: "name" } });
      expect(screen.getAllByRole("rowheader")[0]).toHaveTextContent("0:name:Alice");
    });
  });
});
