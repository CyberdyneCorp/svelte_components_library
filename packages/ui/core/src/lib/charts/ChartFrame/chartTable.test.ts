import { describe, it, expect } from "vitest";
import { categoryTable, columnHeaders, matrixTable, seriesTable } from "./chartTable.js";

describe("matrixTable", () => {
  it("uses the y label as row header and x labels as columns", () => {
    expect(matrixTable([[1, 2], [3, 4]], ["A", "B"], ["R1", "R2"], "Row")).toEqual({
      columns: ["Row", "A", "B"],
      rows: [
        ["R1", 1, 2],
        ["R2", 3, 4],
      ],
    });
  });

  it("falls back to numbered headers when labels are missing", () => {
    expect(matrixTable([[1, 2]])).toEqual({ columns: ["Row", "Column 1", "Column 2"], rows: [["Row 1", 1, 2]] });
  });

  it("has no data columns for an empty matrix", () => {
    expect(matrixTable([])).toEqual({ columns: ["Row"], rows: [] });
  });
});

describe("seriesTable", () => {
  it("merges series on x, sorts ascending and leaves gaps empty", () => {
    const table = seriesTable(
      [
        { name: "A", data: [{ x: 2, y: 20 }, { x: 1, y: 10 }] },
        { name: "B", data: [{ x: 3, y: 5 }, { x: 1, y: 7 }] },
      ],
      "Month",
    );
    expect(table.columns).toEqual(["Month", "A", "B"]);
    expect(table.rows).toEqual([
      [1, 10, 7],
      [2, 20, ""],
      [3, "", 5],
    ]);
  });

  it("defaults the x header and handles no series", () => {
    expect(seriesTable([])).toEqual({ columns: ["x"], rows: [] });
  });
});

describe("categoryTable", () => {
  it("lists one row per category", () => {
    expect(categoryTable([{ label: "Rent", value: 1200 }])).toEqual({
      columns: ["Label", "Value"],
      rows: [["Rent", 1200]],
    });
  });

  it("accepts custom headers", () => {
    expect(categoryTable([], "Account", "Balance").columns).toEqual(["Account", "Balance"]);
  });
});

describe("columnHeaders", () => {
  it("keeps the defaults' order and English values without overrides", () => {
    expect(columnHeaders({ label: "Label", value: "Value", share: "Share" })).toEqual(["Label", "Value", "Share"]);
  });

  it("replaces only the overridden keys", () => {
    expect(columnHeaders({ label: "Label", value: "Value" }, { value: "Valor" })).toEqual(["Label", "Valor"]);
  });
});
