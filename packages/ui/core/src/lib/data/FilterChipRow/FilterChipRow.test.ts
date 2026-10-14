import { fireEvent, render, screen, within } from "@testing-library/svelte";
import { tick } from "svelte";
import { describe, it, expect, vi } from "vitest";
import FilterChipRow from "./FilterChipRow.svelte";
import Harness from "./FilterChipRowHarness.test.svelte";
import type { Query, QueryField } from "../../forms/QueryBuilder/query.js";

const fields: QueryField[] = [
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
  { key: "name", label: "Name", type: "text" },
];

const query = (combinator: Query["combinator"] = "and"): Query => ({
  combinator,
  conditions: [
    { id: "s", field: "status", operator: "in", value: ["active"] },
    { id: "p", field: "price", operator: "gt" },
    { id: "n", field: "name", operator: "contains", value: "ada" },
  ],
});

describe("FilterChipRow", () => {
  it("lists only complete conditions in a labelled list", () => {
    render(FilterChipRow, { props: { fields, query: query(), onremove: vi.fn() } });
    const list = screen.getByRole("list", { name: "Active filters" });
    const items = within(list).getAllByRole("listitem").map((li) => li.textContent?.trim());
    expect(items).toEqual(["Status is any of Active", "Name contains ada"]);
    expect(screen.queryByText(/Match any/)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Clear all" })).not.toBeInTheDocument();
  });

  it("calls onremove with the condition id", async () => {
    const onremove = vi.fn();
    render(FilterChipRow, { props: { fields, query: query(), onremove } });
    await fireEvent.click(screen.getByRole("button", { name: "Remove filter: Status is any of Active" }));
    expect(onremove).toHaveBeenCalledWith("s");
  });

  it("labels OR queries and offers Clear all", async () => {
    const onclear = vi.fn();
    render(FilterChipRow, { props: { fields, query: query("or"), onremove: vi.fn(), onclear } });
    expect(screen.getByText("Match any:")).toBeInTheDocument();
    await fireEvent.click(screen.getByRole("button", { name: "Clear all" }));
    expect(onclear).toHaveBeenCalledOnce();
  });

  it("renders nothing without complete conditions", () => {
    const { container } = render(FilterChipRow, {
      props: { fields, query: { combinator: "and", conditions: [{ id: "p", field: "price", operator: "gt" }] }, onremove: vi.fn() },
    });
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(container.querySelector(".cy-filter-chips")?.textContent?.trim()).toBe("");
  });

  it("moves focus to the next chip, then to the root when none is left", async () => {
    const { container } = render(Harness, { props: { fields, query: query() } });
    await fireEvent.click(screen.getByRole("button", { name: "Remove filter: Status is any of Active" }));
    await tick();
    const remaining = screen.getByRole("button", { name: "Remove filter: Name contains ada" });
    expect(remaining).toHaveFocus();
    await fireEvent.click(remaining);
    await tick();
    expect(container.querySelector(".cy-filter-chips")).toHaveFocus();
  });

  it("falls back to the root when nothing else is left", async () => {
    const { container } = render(Harness, {
      props: { fields, query: { combinator: "and", conditions: [query().conditions[0]] }, withClear: false },
    });
    await fireEvent.click(screen.getByRole("button", { name: "Remove filter: Status is any of Active" }));
    await tick();
    expect(container.querySelector(".cy-filter-chips")).toHaveFocus();
  });

  it("focuses the previous chip after removing the last one", async () => {
    render(Harness, { props: { fields, query: query() } });
    await fireEvent.click(screen.getByRole("button", { name: "Remove filter: Name contains ada" }));
    await tick();
    expect(screen.getByRole("button", { name: "Remove filter: Status is any of Active" })).toHaveFocus();
  });
});
