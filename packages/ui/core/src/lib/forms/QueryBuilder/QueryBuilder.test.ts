import { fireEvent, render, screen, within } from "@testing-library/svelte";
import { tick } from "svelte";
import { describe, it, expect, vi } from "vitest";
import QueryBuilder from "./QueryBuilder.svelte";
import type { Query, QueryField } from "./query.js";

const fields: QueryField[] = [
  { key: "name", label: "Name", type: "text" },
  {
    key: "status",
    label: "Status",
    type: "enum",
    options: [
      { value: "active", label: "Active" },
      { value: "paused", label: "Paused" },
    ],
  },
  { key: "price", label: "Price", type: "number" },
  { key: "created", label: "Created", type: "date" },
  { key: "archived", label: "Archived", type: "boolean" },
];

const rows = () => screen.queryAllByRole("group").filter((g) => g.tagName === "FIELDSET" && /^Condition/.test(g.querySelector("legend")?.textContent ?? ""));
const lastQuery = (spy: ReturnType<typeof vi.fn>) => spy.mock.calls.at(-1)?.[0] as Query;

describe("QueryBuilder", () => {
  it("renders a labelled group with only the add button when empty", () => {
    render(QueryBuilder, { props: { fields } });
    expect(screen.getByRole("group", { name: "Filter conditions" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add condition" })).toBeEnabled();
    expect(rows()).toHaveLength(0);
  });

  it("builds an enum condition", async () => {
    const onchange = vi.fn();
    render(QueryBuilder, { props: { fields, onchange } });
    await fireEvent.click(screen.getByRole("button", { name: "Add condition" }));
    const row = screen.getByRole("group", { name: "Condition 1" });
    await fireEvent.change(within(row).getByRole("combobox", { name: "Field" }), { target: { value: "status" } });
    expect(within(row).getByRole("combobox", { name: "Operator" })).toHaveValue("in");
    await fireEvent.click(within(row).getByRole("checkbox", { name: "Active" }));
    const query = lastQuery(onchange);
    expect(query.conditions).toHaveLength(1);
    expect(query.conditions[0]).toMatchObject({ field: "status", operator: "in", value: ["active"] });
  });

  it("focuses the new row's field select after adding", async () => {
    render(QueryBuilder, { props: { fields } });
    await fireEvent.click(screen.getByRole("button", { name: "Add condition" }));
    await tick();
    const row = screen.getByRole("group", { name: "Condition 1" });
    expect(within(row).getByRole("combobox", { name: "Field" })).toHaveFocus();
  });

  it("resets operator and value when the field changes", async () => {
    const onchange = vi.fn();
    const query: Query = { combinator: "and", conditions: [{ id: "c1", field: "name", operator: "contains", value: "ada" }] };
    render(QueryBuilder, { props: { fields, query, onchange } });
    expect(screen.getByRole("textbox", { name: "Value" })).toHaveValue("ada");
    await fireEvent.change(screen.getByRole("combobox", { name: "Field" }), { target: { value: "price" } });
    const condition = lastQuery(onchange).conditions[0];
    expect(condition).toEqual({ id: "c1", field: "price", operator: "eq" });
    expect(screen.getByRole("spinbutton", { name: "Value" })).toHaveValue(null);
  });

  it("shows From/To for ranges and no value for empty operators", async () => {
    const onchange = vi.fn();
    const query: Query = { combinator: "and", conditions: [{ id: "c1", field: "price", operator: "eq", value: 3 }] };
    render(QueryBuilder, { props: { fields, query, onchange } });
    const operator = screen.getByRole("combobox", { name: "Operator" });
    await fireEvent.change(operator, { target: { value: "between" } });
    expect(lastQuery(onchange).conditions[0].value).toBeUndefined();
    await fireEvent.input(screen.getByRole("spinbutton", { name: "From" }), { target: { value: "10" } });
    await fireEvent.input(screen.getByRole("spinbutton", { name: "To" }), { target: { value: "20" } });
    expect(lastQuery(onchange).conditions[0].value).toEqual([10, 20]);
    await fireEvent.change(operator, { target: { value: "is_empty" } });
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
    expect(lastQuery(onchange).conditions[0]).not.toHaveProperty("value");
  });

  it("keeps the value when the operator keeps its shape", async () => {
    const onchange = vi.fn();
    const query: Query = { combinator: "and", conditions: [{ id: "c1", field: "price", operator: "eq", value: 3 }] };
    render(QueryBuilder, { props: { fields, query, onchange } });
    await fireEvent.change(screen.getByRole("combobox", { name: "Operator" }), { target: { value: "gt" } });
    expect(lastQuery(onchange).conditions[0]).toMatchObject({ operator: "gt", value: 3 });
  });

  it("offers a native date input and parses typed values", async () => {
    const onchange = vi.fn();
    const query: Query = { combinator: "and", conditions: [{ id: "c1", field: "created", operator: "on" }] };
    const { container } = render(QueryBuilder, { props: { fields, query, onchange } });
    const input = container.querySelector('input[type="date"]') as HTMLInputElement;
    expect(input).toHaveAttribute("aria-label", "Value");
    await fireEvent.input(input, { target: { value: "2026-10-01" } });
    expect(lastQuery(onchange).conditions[0].value).toBe("2026-10-01");
  });

  it("switches the combinator once there are two conditions", async () => {
    const onchange = vi.fn();
    const query: Query = {
      combinator: "and",
      conditions: [
        { id: "c1", field: "name", operator: "contains", value: "a" },
        { id: "c2", field: "archived", operator: "is_true" },
      ],
    };
    render(QueryBuilder, { props: { fields, query, onchange } });
    const combinator = screen.getByRole("combobox", { name: "Combine conditions" });
    expect(within(combinator).getByRole("option", { name: "Match all" })).toBeInTheDocument();
    await fireEvent.change(combinator, { target: { value: "or" } });
    expect(lastQuery(onchange).combinator).toBe("or");
  });

  it("removes a condition and moves focus to the next row", async () => {
    const onchange = vi.fn();
    const query: Query = {
      combinator: "and",
      conditions: [
        { id: "c1", field: "name", operator: "contains", value: "a" },
        { id: "c2", field: "price", operator: "gt", value: 1 },
      ],
    };
    render(QueryBuilder, { props: { fields, query, onchange } });
    await fireEvent.click(screen.getByRole("button", { name: "Remove condition 1" }));
    await tick();
    expect(lastQuery(onchange).conditions.map((c) => c.id)).toEqual(["c2"]);
    const row = screen.getByRole("group", { name: "Condition 1" });
    const select = within(row).getByRole("combobox", { name: "Field" });
    expect(select).toHaveValue("price");
    expect(select).toHaveFocus();
    expect(screen.queryByRole("combobox", { name: "Combine conditions" })).not.toBeInTheDocument();
  });

  it("focuses Add condition after removing the last row", async () => {
    const query: Query = { combinator: "and", conditions: [{ id: "c1", field: "name", operator: "contains" }] };
    render(QueryBuilder, { props: { fields, query } });
    await fireEvent.click(screen.getByRole("button", { name: "Remove condition 1" }));
    await tick();
    expect(screen.getByRole("button", { name: "Add condition" })).toHaveFocus();
  });

  it("disables Add condition at maxConditions", () => {
    const query: Query = { combinator: "and", conditions: [{ id: "c1", field: "name", operator: "contains" }] };
    render(QueryBuilder, { props: { fields, query, maxConditions: 1 } });
    expect(screen.getByRole("button", { name: "Add condition" })).toBeDisabled();
  });

  it("uses localized labels", async () => {
    render(QueryBuilder, {
      props: { fields, labels: { addCondition: "Adicionar condição", operators: { contains: "contém" } } },
    });
    await fireEvent.click(screen.getByRole("button", { name: "Adicionar condição" }));
    expect(screen.getByRole("option", { name: "contém" })).toBeInTheDocument();
  });
});
