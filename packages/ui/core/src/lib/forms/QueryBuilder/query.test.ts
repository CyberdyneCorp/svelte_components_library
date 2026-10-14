import { describe, it, expect } from "vitest";
import {
  createCondition,
  defaultOperator,
  describeCondition,
  evaluateQuery,
  isConditionComplete,
  operatorsFor,
  valueShape,
  type Query,
  type QueryCondition,
  type QueryField,
} from "./query.js";

const fields: QueryField[] = [
  { key: "name", label: "Name", type: "text" },
  { key: "price", label: "Price", type: "number" },
  { key: "created", label: "Created", type: "date" },
  { key: "active", label: "Active", type: "boolean" },
  {
    key: "status",
    label: "Status",
    type: "enum",
    options: [
      { value: "active", label: "Active" },
      { value: "paused", label: "Paused" },
    ],
  },
];

const cond = (field: string, operator: QueryCondition["operator"], value?: QueryCondition["value"]): QueryCondition => ({
  id: `${field}-${operator}`,
  field,
  operator,
  value,
});

const matches = (c: QueryCondition, row: Record<string, unknown>) =>
  evaluateQuery({ combinator: "and", conditions: [c] }, row, fields);

describe("operators", () => {
  it("lists operators per type in display order", () => {
    expect(operatorsFor("text")).toEqual([
      "contains", "not_contains", "eq", "neq", "starts_with", "ends_with", "is_empty", "is_not_empty",
    ]);
    expect(operatorsFor("number")).toEqual([
      "eq", "neq", "gt", "gte", "lt", "lte", "between", "is_empty", "is_not_empty",
    ]);
    expect(operatorsFor("date")).toEqual(["on", "before", "after", "between", "is_empty", "is_not_empty"]);
    expect(operatorsFor("boolean")).toEqual(["is_true", "is_false"]);
    expect(operatorsFor("enum")).toEqual(["in", "not_in", "is_empty", "is_not_empty"]);
  });

  it("defaults to the first operator", () => {
    expect(defaultOperator("text")).toBe("contains");
    expect(defaultOperator("number")).toBe("eq");
    expect(defaultOperator("enum")).toBe("in");
  });

  it("maps operators to value shapes", () => {
    expect(valueShape("is_empty")).toBe("none");
    expect(valueShape("is_true")).toBe("none");
    expect(valueShape("between")).toBe("range");
    expect(valueShape("in")).toBe("list");
    expect(valueShape("contains")).toBe("single");
  });

  it("creates conditions with unique ids and the default operator", () => {
    const a = createCondition(fields[1]);
    const b = createCondition(fields[1]);
    expect(a.id).not.toBe(b.id);
    expect(a).toMatchObject({ field: "price", operator: "eq" });
    expect(a.value).toBeUndefined();
  });
});

describe("isConditionComplete", () => {
  it("requires a known field and a valid operator", () => {
    expect(isConditionComplete(cond("missing", "eq", "x"), fields)).toBe(false);
    expect(isConditionComplete(cond("price", "contains", "x"), fields)).toBe(false);
  });

  it("checks single values by field type", () => {
    expect(isConditionComplete(cond("name", "contains", "ada"), fields)).toBe(true);
    expect(isConditionComplete(cond("name", "contains", "  "), fields)).toBe(false);
    expect(isConditionComplete(cond("price", "gt", 3), fields)).toBe(true);
    expect(isConditionComplete(cond("price", "gt", Number.NaN), fields)).toBe(false);
    expect(isConditionComplete(cond("price", "gt"), fields)).toBe(false);
    expect(isConditionComplete(cond("created", "on", "2026-10-01"), fields)).toBe(true);
    expect(isConditionComplete(cond("created", "on", "nope"), fields)).toBe(false);
  });

  it("checks ranges are complete and ordered", () => {
    expect(isConditionComplete(cond("price", "between", [10, 20]), fields)).toBe(true);
    expect(isConditionComplete(cond("price", "between", [20, 10]), fields)).toBe(false);
    expect(isConditionComplete(cond("price", "between", [10, undefined]), fields)).toBe(false);
    expect(isConditionComplete(cond("created", "between", ["2026-01-01", "2026-02-01"]), fields)).toBe(true);
    expect(isConditionComplete(cond("created", "between", ["2026-03-01", "2026-02-01"]), fields)).toBe(false);
  });

  it("needs a non-empty list and no value for none-shaped operators", () => {
    expect(isConditionComplete(cond("status", "in", ["active"]), fields)).toBe(true);
    expect(isConditionComplete(cond("status", "in", []), fields)).toBe(false);
    expect(isConditionComplete(cond("status", "is_empty"), fields)).toBe(true);
    expect(isConditionComplete(cond("active", "is_true"), fields)).toBe(true);
  });
});

describe("describeCondition", () => {
  it("uses enum option labels", () => {
    expect(describeCondition(cond("status", "in", ["active", "paused"]), fields[4])).toBe(
      "Status is any of Active, Paused",
    );
  });

  it("describes ranges, singles and none-shaped operators", () => {
    expect(describeCondition(cond("price", "between", [10, 20]), fields[1])).toBe("Price between 10 and 20");
    expect(describeCondition(cond("name", "contains", "ada"), fields[0])).toBe("Name contains ada");
    expect(describeCondition(cond("name", "is_empty"), fields[0])).toBe("Name is empty");
  });

  it("accepts localized labels and returns empty text without a field", () => {
    const labels = { operators: { between: "entre" }, rangeJoin: "e" };
    expect(describeCondition(cond("price", "between", [1, 2]), fields[1], labels)).toBe("Price entre 1 e 2");
    expect(describeCondition(cond("price", "eq", 1), undefined)).toBe("");
  });
});

describe("evaluateQuery", () => {
  it("evaluates an AND query", () => {
    const query: Query = {
      combinator: "and",
      conditions: [cond("status", "in", ["active"]), cond("price", "between", [10, 20])],
    };
    expect(evaluateQuery(query, { status: "active", price: 15 }, fields)).toBe(true);
    expect(evaluateQuery(query, { status: "active", price: 25 }, fields)).toBe(false);
  });

  it("ignores incomplete conditions in an OR query", () => {
    const priceGt = cond("price", "gt");
    const query: Query = { combinator: "or", conditions: [cond("name", "contains", "ada"), priceGt] };
    expect(evaluateQuery(query, { name: "Ada Lovelace", price: 1 }, fields)).toBe(true);
    expect(isConditionComplete(priceGt, fields)).toBe(false);
  });

  it("matches everything without complete conditions", () => {
    expect(evaluateQuery({ combinator: "and", conditions: [] }, {}, fields)).toBe(true);
    expect(evaluateQuery({ combinator: "or", conditions: [cond("price", "gt")] }, {}, fields)).toBe(true);
  });

  it("compares text case-insensitively", () => {
    const row = { name: "Ada Lovelace" };
    expect(matches(cond("name", "contains", "LOVE"), row)).toBe(true);
    expect(matches(cond("name", "not_contains", "love"), row)).toBe(false);
    expect(matches(cond("name", "eq", "ada lovelace"), row)).toBe(true);
    expect(matches(cond("name", "neq", "ada lovelace"), row)).toBe(false);
    expect(matches(cond("name", "starts_with", "ada"), row)).toBe(true);
    expect(matches(cond("name", "ends_with", "LACE"), row)).toBe(true);
  });

  it("treats null, undefined and empty strings as empty", () => {
    for (const name of [null, undefined, ""]) {
      expect(matches(cond("name", "is_empty"), { name })).toBe(true);
      expect(matches(cond("name", "is_not_empty"), { name })).toBe(false);
      expect(matches(cond("name", "eq", "x"), { name })).toBe(false);
    }
    expect(matches(cond("name", "is_not_empty"), { name: "x" })).toBe(true);
  });

  it("compares numbers", () => {
    const row = { price: 10 };
    expect(matches(cond("price", "eq", 10), row)).toBe(true);
    expect(matches(cond("price", "neq", 10), row)).toBe(false);
    expect(matches(cond("price", "gt", 9), row)).toBe(true);
    expect(matches(cond("price", "gte", 10), row)).toBe(true);
    expect(matches(cond("price", "lt", 10), row)).toBe(false);
    expect(matches(cond("price", "lte", 10), row)).toBe(true);
    expect(matches(cond("price", "between", [10, 10]), row)).toBe(true);
    expect(matches(cond("price", "gt", 1), { price: null })).toBe(false);
    expect(matches(cond("price", "gt", 1), { price: "12" })).toBe(true);
  });

  it("compares dates by local calendar day for on and between", () => {
    const lateEvening = new Date(2026, 9, 1, 23, 30);
    expect(matches(cond("created", "on", "2026-10-01"), { created: lateEvening })).toBe(true);
    expect(matches(cond("created", "on", "2026-10-02"), { created: lateEvening })).toBe(false);
    expect(matches(cond("created", "on", "2026-10-01"), { created: "2026-10-01" })).toBe(true);
    expect(
      matches(cond("created", "between", ["2026-09-30", "2026-10-01"]), { created: lateEvening.getTime() }),
    ).toBe(true);
    expect(matches(cond("created", "between", ["2026-10-02", "2026-10-03"]), { created: lateEvening })).toBe(false);
    expect(matches(cond("created", "on", "2026-10-01"), { created: "garbage" })).toBe(false);
  });

  it("compares before and after by instant against the day", () => {
    const morning = new Date(2026, 9, 1, 8, 0);
    expect(matches(cond("created", "before", "2026-10-01"), { created: morning })).toBe(false);
    expect(matches(cond("created", "before", "2026-10-02"), { created: morning })).toBe(true);
    expect(matches(cond("created", "after", "2026-10-01"), { created: morning })).toBe(false);
    expect(matches(cond("created", "after", "2026-09-30"), { created: morning })).toBe(true);
  });

  it("tests booleans and enum lists, including array values", () => {
    expect(matches(cond("active", "is_true"), { active: true })).toBe(true);
    expect(matches(cond("active", "is_false"), { active: true })).toBe(false);
    expect(matches(cond("active", "is_false"), { active: false })).toBe(true);
    expect(matches(cond("status", "in", ["active", "paused"]), { status: "paused" })).toBe(true);
    expect(matches(cond("status", "not_in", ["active"]), { status: "paused" })).toBe(true);
    expect(matches(cond("status", "in", ["active"]), { status: ["paused", "active"] })).toBe(true);
    expect(matches(cond("status", "is_empty"), { status: [] })).toBe(true);
  });
});
