/**
 * Flat filter-query model shared by `QueryBuilder`, `FilterChipRow` and
 * `SavedViews`, plus pure helpers to build, describe and evaluate it.
 * No Svelte code lives here, so every rule is unit-testable.
 */

export type QueryFieldType = "text" | "number" | "date" | "boolean" | "enum";

export type QueryOperator =
  | "contains"
  | "not_contains"
  | "eq"
  | "neq"
  | "starts_with"
  | "ends_with"
  | "is_empty"
  | "is_not_empty"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "between"
  | "on"
  | "before"
  | "after"
  | "is_true"
  | "is_false"
  | "in"
  | "not_in";

/** A scalar value: text, a number, or an ISO `YYYY-MM-DD` date string. */
export type QueryScalar = string | number;

/** `single` → scalar, `range` → `[min, max]`, `list` → `string[]`, `none` → absent. */
export type QueryValue = QueryScalar | [QueryScalar | undefined, QueryScalar | undefined] | string[];

export type QueryValueShape = "none" | "single" | "range" | "list";

export type QueryFieldOption = { value: string; label: string };

export type QueryField = {
  /** Key read from each row by `evaluateQuery`. */
  key: string;
  label: string;
  type: QueryFieldType;
  /** Choices of an `enum` field. */
  options?: QueryFieldOption[];
};

export type QueryCondition = {
  id: string;
  /** `QueryField.key` this condition tests. */
  field: string;
  operator: QueryOperator;
  value?: QueryValue;
};

export type Query = {
  combinator: "and" | "or";
  conditions: QueryCondition[];
};

/** User-visible strings of `QueryBuilder` and `FilterChipRow`, English by default. */
export type QueryLabels = {
  operators: Record<QueryOperator, string>;
  /** Joins the two ends of a range: "Price between 10 and 20". */
  rangeJoin: string;
  /** Joins list values: "Status is any of Active, Paused". */
  listJoin: string;
  addCondition: string;
  removeCondition: (n: number) => string;
  condition: (n: number) => string;
  field: string;
  operator: string;
  value: string;
  values: string;
  from: string;
  to: string;
  combinator: string;
  matchAll: string;
  matchAny: string;
  clearAll: string;
  removeFilter: (description: string) => string;
};

/** Overrides for `QueryLabels`; `operators` may name only some operators. */
export type QueryLabelsInput = Partial<Omit<QueryLabels, "operators">> & {
  operators?: Partial<Record<QueryOperator, string>>;
};

export const DEFAULT_QUERY_LABELS: QueryLabels = {
  operators: {
    contains: "contains",
    not_contains: "does not contain",
    eq: "is",
    neq: "is not",
    starts_with: "starts with",
    ends_with: "ends with",
    is_empty: "is empty",
    is_not_empty: "is not empty",
    gt: "is greater than",
    gte: "is at least",
    lt: "is less than",
    lte: "is at most",
    between: "between",
    on: "is on",
    before: "is before",
    after: "is after",
    is_true: "is true",
    is_false: "is false",
    in: "is any of",
    not_in: "is none of",
  },
  rangeJoin: "and",
  listJoin: ", ",
  addCondition: "Add condition",
  removeCondition: (n) => `Remove condition ${n}`,
  condition: (n) => `Condition ${n}`,
  field: "Field",
  operator: "Operator",
  value: "Value",
  values: "Values",
  from: "From",
  to: "To",
  combinator: "Combine conditions",
  matchAll: "Match all",
  matchAny: "Match any",
  clearAll: "Clear all",
  removeFilter: (description) => `Remove filter: ${description}`,
};

/** Defaults overlaid with `labels`; `operators` merges key by key. */
export function mergeQueryLabels(labels: QueryLabelsInput = {}): QueryLabels {
  return {
    ...DEFAULT_QUERY_LABELS,
    ...labels,
    operators: { ...DEFAULT_QUERY_LABELS.operators, ...labels.operators },
  };
}

const OPERATORS: Record<QueryFieldType, QueryOperator[]> = {
  text: ["contains", "not_contains", "eq", "neq", "starts_with", "ends_with", "is_empty", "is_not_empty"],
  number: ["eq", "neq", "gt", "gte", "lt", "lte", "between", "is_empty", "is_not_empty"],
  date: ["on", "before", "after", "between", "is_empty", "is_not_empty"],
  boolean: ["is_true", "is_false"],
  enum: ["in", "not_in", "is_empty", "is_not_empty"],
};

/** Operators offered for a field type, in display order. */
export function operatorsFor(type: QueryFieldType): QueryOperator[] {
  return OPERATORS[type];
}

export function defaultOperator(type: QueryFieldType): QueryOperator {
  return OPERATORS[type][0];
}

const SHAPES: Partial<Record<QueryOperator, QueryValueShape>> = {
  is_empty: "none",
  is_not_empty: "none",
  is_true: "none",
  is_false: "none",
  between: "range",
  in: "list",
  not_in: "list",
};

/** What kind of value an operator takes. */
export function valueShape(operator: QueryOperator): QueryValueShape {
  return SHAPES[operator] ?? "single";
}

let idCounter = 0;
const idPrefix = Math.random().toString(36).slice(2, 7);

/** A condition on `field` with its default operator and no value. */
export function createCondition(field: QueryField): QueryCondition {
  idCounter += 1;
  return { id: `q-${idPrefix}-${idCounter}`, field: field.key, operator: defaultOperator(field.type) };
}

export function emptyQuery(): Query {
  return { combinator: "and", conditions: [] };
}

// ─── Dates ────────────────────────────────────────────────────

const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parses a Date, epoch ms or ISO string; a bare `YYYY-MM-DD` is local midnight. */
function toDate(raw: unknown): Date | undefined {
  if (raw instanceof Date) return Number.isNaN(raw.getTime()) ? undefined : raw;
  if (typeof raw !== "string" && typeof raw !== "number") return undefined;
  const day = typeof raw === "string" ? ISO_DAY.exec(raw) : null;
  const date = day ? new Date(Number(day[1]), Number(day[2]) - 1, Number(day[3])) : new Date(raw);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function dayKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function startOfNextDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
}

// ─── Completeness ─────────────────────────────────────────────

function isValidScalar(value: unknown, type: QueryFieldType): value is QueryScalar {
  if (type === "number") return typeof value === "number" && Number.isFinite(value);
  if (type === "date") return typeof value === "string" && toDate(value) !== undefined;
  return typeof value === "string" && value.trim() !== "";
}

function scalarOrder(value: QueryScalar, type: QueryFieldType): number {
  return type === "date" ? (toDate(value)?.getTime() ?? NaN) : Number(value);
}

function isValidRange(value: unknown, type: QueryFieldType): boolean {
  if (!Array.isArray(value) || value.length !== 2) return false;
  const [min, max] = value;
  if (!isValidScalar(min, type) || !isValidScalar(max, type)) return false;
  return scalarOrder(min, type) <= scalarOrder(max, type);
}

const SHAPE_CHECKS: Record<QueryValueShape, (value: unknown, type: QueryFieldType) => boolean> = {
  none: () => true,
  single: isValidScalar,
  range: isValidRange,
  list: (value) => Array.isArray(value) && value.length > 0,
};

/** True when the field exists, the operator suits it and the value has the right shape. */
export function isConditionComplete(condition: QueryCondition, fields: QueryField[]): boolean {
  const field = fields.find((f) => f.key === condition.field);
  if (!field || !operatorsFor(field.type).includes(condition.operator)) return false;
  return SHAPE_CHECKS[valueShape(condition.operator)](condition.value, field.type);
}

// ─── Description ──────────────────────────────────────────────

function scalarText(value: unknown, field: QueryField): string {
  const option = field.options?.find((o) => o.value === value);
  return option ? option.label : String(value ?? "");
}

/** Readable text of a condition, e.g. "Status is any of Active, Paused". */
export function describeCondition(
  condition: QueryCondition,
  field: QueryField | undefined,
  labels: QueryLabelsInput = {},
): string {
  if (!field) return "";
  const l = mergeQueryLabels(labels);
  const head = `${field.label} ${l.operators[condition.operator]}`;
  const value = condition.value;
  switch (valueShape(condition.operator)) {
    case "none":
      return head;
    case "range": {
      const [min, max] = Array.isArray(value) ? value : [];
      return `${head} ${scalarText(min, field)} ${l.rangeJoin} ${scalarText(max, field)}`;
    }
    case "list": {
      const items = Array.isArray(value) ? value : [];
      return `${head} ${items.map((v) => scalarText(v, field)).join(l.listJoin)}`;
    }
    default:
      return `${head} ${scalarText(value, field)}`;
  }
}

// ─── Evaluation ───────────────────────────────────────────────

type Predicate = (raw: unknown, value: QueryValue | undefined, field: QueryField) => boolean;

function isEmpty(raw: unknown): boolean {
  return raw === null || raw === undefined || raw === "";
}

function text(raw: unknown): string {
  return isEmpty(raw) ? "" : String(raw).toLowerCase();
}

function num(raw: unknown): number {
  return typeof raw === "number" ? raw : isEmpty(raw) ? NaN : Number(raw);
}

function equals(raw: unknown, value: QueryValue | undefined, field: QueryField): boolean {
  if (field.type === "number") return num(raw) === value;
  return !isEmpty(raw) && text(raw) === text(value);
}

function compareNumbers(test: (a: number, b: number) => boolean): Predicate {
  return (raw, value) => {
    const a = num(raw);
    return Number.isFinite(a) && test(a, value as number);
  };
}

function textTest(test: (a: string, b: string) => boolean): Predicate {
  return (raw, value) => test(text(raw), text(value));
}

function between(raw: unknown, value: QueryValue | undefined, field: QueryField): boolean {
  const [min, max] = value as [QueryScalar, QueryScalar];
  if (field.type !== "date") {
    const n = num(raw);
    return Number.isFinite(n) && n >= Number(min) && n <= Number(max);
  }
  const date = toDate(raw);
  if (!date) return false;
  const day = dayKey(date);
  return day >= dayKey(toDate(min)!) && day <= dayKey(toDate(max)!);
}

function dateTest(test: (date: Date, day: Date) => boolean): Predicate {
  return (raw, value) => {
    const date = toDate(raw);
    const day = toDate(value);
    return !!date && !!day && test(date, day);
  };
}

function inList(raw: unknown, value: QueryValue | undefined): boolean {
  const list = value as string[];
  const rawItems = Array.isArray(raw) ? raw : [raw];
  return rawItems.some((item) => !isEmpty(item) && list.includes(String(item)));
}

const PREDICATES: Record<QueryOperator, Predicate> = {
  contains: textTest((a, b) => a.includes(b)),
  not_contains: textTest((a, b) => !a.includes(b)),
  starts_with: textTest((a, b) => a.startsWith(b)),
  ends_with: textTest((a, b) => a.endsWith(b)),
  eq: equals,
  neq: (raw, value, field) => !equals(raw, value, field),
  is_empty: (raw) => isEmpty(raw) || (Array.isArray(raw) && raw.length === 0),
  is_not_empty: (raw) => !isEmpty(raw) && !(Array.isArray(raw) && raw.length === 0),
  gt: compareNumbers((a, b) => a > b),
  gte: compareNumbers((a, b) => a >= b),
  lt: compareNumbers((a, b) => a < b),
  lte: compareNumbers((a, b) => a <= b),
  between,
  on: dateTest((date, day) => dayKey(date) === dayKey(day)),
  before: dateTest((date, day) => date.getTime() < day.getTime()),
  after: dateTest((date, day) => date.getTime() >= startOfNextDay(day).getTime()),
  is_true: (raw) => raw === true,
  is_false: (raw) => raw === false,
  in: inList,
  not_in: (raw, value) => !inList(raw, value),
};

/**
 * Whether `row` satisfies the query's complete conditions. Incomplete ones
 * are ignored, and a query with no complete condition matches every row.
 * Text compares case-insensitively; `on` and `between` compare local
 * calendar days, `before` is earlier than the day's start and `after` is
 * on or after the next day's start.
 */
export function evaluateQuery(query: Query, row: Record<string, unknown>, fields: QueryField[]): boolean {
  const results = query.conditions
    .filter((c) => isConditionComplete(c, fields))
    .map((c) => {
      const field = fields.find((f) => f.key === c.field)!;
      return PREDICATES[c.operator](row[field.key], c.value, field);
    });
  if (results.length === 0) return true;
  return query.combinator === "and" ? results.every(Boolean) : results.some(Boolean);
}
