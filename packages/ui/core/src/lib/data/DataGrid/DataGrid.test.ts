import { fireEvent, render, screen, within } from "@testing-library/svelte";
import { tick } from "svelte";
import { describe, it, expect, vi } from "vitest";
import DataGrid from "./DataGrid.svelte";
import type { DataGridColumn } from "./types.js";

const columns: DataGridColumn[] = [
  { key: "sku", label: "SKU", editable: false },
  { key: "name", label: "Name" },
  {
    key: "price",
    label: "Price",
    type: "number",
    validate: (v) => (typeof v === "number" && v > 0 ? undefined : "Must be positive"),
  },
  { key: "enabled", label: "Enabled", type: "boolean" },
  {
    key: "tier",
    label: "Tier",
    type: "select",
    options: [
      { value: "basic", label: "Basic" },
      { value: "pro", label: "Pro" },
    ],
  },
];

const makeRows = () => [
  { id: "a", sku: "A-1", name: "Ada", price: 10, enabled: false, tier: "basic" },
  { id: "b", sku: "B-2", name: "Bob", price: 20, enabled: true, tier: "pro" },
];

function setup(props: Record<string, unknown> = {}) {
  const oncellchange = vi.fn();
  const result = render(DataGrid, {
    props: { columns, rows: makeRows(), ariaLabel: "Products", oncellchange, ...props },
  });
  const cell = (row: number, col: number) =>
    result.container.querySelector<HTMLElement>(`[data-row="${row}"][data-col="${col}"]`)!;
  return { ...result, oncellchange, cell };
}

async function press(el: Element, key: string) {
  await fireEvent.keyDown(el, { key });
  await tick();
}

describe("DataGrid structure", () => {
  it("renders a grid with column headers, cells and read-only marks", () => {
    const { cell } = setup();
    const grid = screen.getByRole("grid", { name: "Products" });
    expect(grid).toHaveAttribute("aria-rowcount", "3");
    expect(grid).toHaveAttribute("aria-colcount", "5");
    expect(within(grid).getAllByRole("columnheader")).toHaveLength(5);
    expect(within(grid).getAllByRole("gridcell")).toHaveLength(10);
    expect(cell(0, 0)).toHaveAttribute("aria-readonly", "true");
    expect(cell(1, 0)).toHaveAttribute("aria-readonly", "true");
    expect(cell(0, 1)).not.toHaveAttribute("aria-readonly");
  });

  it("shows option labels, formatted values and checkbox state", () => {
    const { cell } = setup({
      columns: columns.map((c) => (c.key === "price" ? { ...c, format: (v: number) => `$${v}` } : c)),
    });
    expect(cell(1, 4)).toHaveTextContent("Pro");
    expect(cell(0, 2)).toHaveTextContent("$10");
    const checks = screen.getAllByRole("checkbox");
    expect(checks[0]).toHaveAttribute("aria-checked", "false");
    expect(checks[1]).toHaveAttribute("aria-checked", "true");
    expect(checks[0]).toHaveAccessibleName("Enabled, row 1");
  });

  it("marks every cell read-only with readonly", () => {
    setup({ readonly: true });
    for (const c of screen.getAllByRole("gridcell")) expect(c).toHaveAttribute("aria-readonly", "true");
  });
});

describe("DataGrid navigation", () => {
  it("has a single tab stop that follows the arrow keys", async () => {
    const { cell, container } = setup();
    expect(container.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
    expect(cell(0, 0)).toHaveAttribute("tabindex", "0");
    cell(0, 0).focus();
    await press(cell(0, 0), "ArrowRight");
    await press(cell(0, 1), "ArrowDown");
    expect(cell(1, 1)).toHaveFocus();
    expect(cell(1, 1)).toHaveAttribute("tabindex", "0");
    expect(container.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
  });

  it("clamps at the edges", async () => {
    const { cell } = setup();
    cell(0, 0).focus();
    await press(cell(0, 0), "ArrowUp");
    await press(cell(0, 0), "ArrowLeft");
    expect(cell(0, 0)).toHaveFocus();
  });

  it("makes a clicked cell active", async () => {
    const { cell } = setup();
    await fireEvent.click(cell(1, 2));
    expect(cell(1, 2)).toHaveAttribute("tabindex", "0");
  });
});

describe("DataGrid editing", () => {
  it("edits and commits a number with Enter, then moves down", async () => {
    const { cell, oncellchange } = setup();
    cell(0, 2).focus();
    await press(cell(0, 2), "Enter");
    const editor = screen.getByRole("spinbutton", { name: "Price, row 1" });
    expect(editor).toHaveFocus();
    expect(editor).toHaveValue(10);
    await fireEvent.input(editor, { target: { value: "12" } });
    await press(editor, "Enter");
    expect(oncellchange).toHaveBeenCalledWith(
      expect.objectContaining({ rowKey: "a", key: "price", value: 12, previousValue: 10 }),
    );
    expect(oncellchange.mock.calls[0][0].row).toMatchObject({ id: "a", price: 12 });
    expect(cell(0, 2)).toHaveTextContent("12");
    expect(cell(1, 2)).toHaveFocus();
  });

  it("keeps the editor open with an error when validation fails", async () => {
    const { cell, oncellchange } = setup();
    cell(0, 2).focus();
    await press(cell(0, 2), "F2");
    const editor = screen.getByRole("spinbutton", { name: "Price, row 1" });
    await fireEvent.input(editor, { target: { value: "-1" } });
    await press(editor, "Enter");
    expect(editor).toBeInTheDocument();
    expect(editor).toHaveAttribute("aria-invalid", "true");
    expect(editor).toHaveAccessibleDescription("Must be positive");
    expect(oncellchange).not.toHaveBeenCalled();
  });

  it("replaces the value with a typed character and restores it on Escape", async () => {
    const { cell, oncellchange } = setup();
    cell(0, 1).focus();
    await press(cell(0, 1), "B");
    const editor = screen.getByRole("textbox", { name: "Name, row 1" });
    expect(editor).toHaveValue("B");
    await press(editor, "Escape");
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(cell(0, 1)).toHaveTextContent("Ada");
    expect(cell(0, 1)).toHaveFocus();
    expect(oncellchange).not.toHaveBeenCalled();
  });

  it("starts editing on double-click and commits on blur without moving", async () => {
    const { cell, oncellchange } = setup();
    await fireEvent.dblClick(cell(1, 1));
    await tick();
    const editor = screen.getByRole("textbox", { name: "Name, row 2" });
    await fireEvent.input(editor, { target: { value: "Bea" } });
    await fireEvent.blur(editor);
    await tick();
    expect(oncellchange).toHaveBeenCalledWith(expect.objectContaining({ rowKey: "b", key: "name", value: "Bea" }));
    expect(cell(1, 1)).toHaveTextContent("Bea");
    expect(cell(1, 1)).toHaveAttribute("tabindex", "0");
  });

  it("commits with Tab and moves to the next cell, wrapping rows", async () => {
    const { cell, oncellchange } = setup();
    cell(0, 4).focus();
    await press(cell(0, 4), "Enter");
    const select = screen.getByRole("combobox", { name: "Tier, row 1" });
    await fireEvent.change(select, { target: { value: "pro" } });
    await press(select, "Tab");
    expect(oncellchange).toHaveBeenCalledWith(expect.objectContaining({ key: "tier", value: "pro" }));
    expect(cell(1, 0)).toHaveFocus();
  });

  it("lets Tab leave the grid after committing the last cell", async () => {
    const { cell, oncellchange } = setup();
    cell(1, 4).focus();
    await press(cell(1, 4), "Enter");
    const select = screen.getByRole("combobox", { name: "Tier, row 2" });
    await fireEvent.change(select, { target: { value: "basic" } });
    const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    select.dispatchEvent(event);
    await tick();
    expect(event.defaultPrevented).toBe(false);
    expect(oncellchange).toHaveBeenCalledWith(expect.objectContaining({ rowKey: "b", value: "basic" }));
  });

  it("reports nothing when the committed value is unchanged", async () => {
    const { cell, oncellchange } = setup();
    cell(0, 1).focus();
    await press(cell(0, 1), "Enter");
    await press(screen.getByRole("textbox"), "Enter");
    expect(oncellchange).not.toHaveBeenCalled();
  });

  it("toggles boolean cells with Space and click", async () => {
    const { cell, oncellchange } = setup();
    cell(0, 3).focus();
    await press(cell(0, 3), " ");
    expect(screen.getAllByRole("checkbox")[0]).toHaveAttribute("aria-checked", "true");
    expect(oncellchange).toHaveBeenCalledWith(expect.objectContaining({ key: "enabled", value: true }));
    await fireEvent.click(cell(1, 3));
    expect(screen.getAllByRole("checkbox")[1]).toHaveAttribute("aria-checked", "false");
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("ignores edit triggers on read-only cells", async () => {
    const { cell, oncellchange } = setup();
    cell(0, 0).focus();
    await press(cell(0, 0), "Enter");
    await press(cell(0, 0), "x");
    await fireEvent.dblClick(cell(0, 0));
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    setup({ readonly: true });
    expect(oncellchange).not.toHaveBeenCalled();
  });

  it("does not toggle boolean cells when read-only", async () => {
    const { cell, oncellchange } = setup({ readonly: true });
    cell(0, 3).focus();
    await press(cell(0, 3), " ");
    expect(oncellchange).not.toHaveBeenCalled();
  });

  it("parses an empty number as null and uses custom cell labels", async () => {
    const { cell, oncellchange } = setup({
      columns: [{ key: "price", label: "Preço", type: "number" }],
      labels: { cell: (c: string, n: number) => `${c}, linha ${n}` },
    });
    cell(0, 0).focus();
    await press(cell(0, 0), "Enter");
    const editor = screen.getByRole("spinbutton", { name: "Preço, linha 1" });
    await fireEvent.input(editor, { target: { value: "" } });
    await press(editor, "Enter");
    expect(oncellchange).toHaveBeenCalledWith(expect.objectContaining({ value: null, previousValue: 10 }));
  });

  it("renders an empty grid without a tab stop", async () => {
    const { container } = setup({ rows: [] });
    expect(container.querySelector('[tabindex="0"]')).toBeNull();
    await press(screen.getByRole("grid"), "ArrowDown");
  });
});
