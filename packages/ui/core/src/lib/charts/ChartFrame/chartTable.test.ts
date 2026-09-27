import { describe, it, expect } from "vitest";
import { categoryTable, seriesTable } from "./chartTable.js";

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
