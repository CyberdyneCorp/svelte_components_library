/**
 * Pure BudgetBar maths. Amounts stay decimal strings / BigInt minor units;
 * `Number()` is used only to derive the spent/limit ratio for the bar width
 * and the meter value, never for any displayed amount.
 */
import { fromMinorUnits, toMinorUnits } from "../../forms/MoneyInput/money.js";

export type BudgetState = "ok" | "approaching" | "exceeded";

export type BudgetStateLabels = Record<BudgetState, string>;

export interface BudgetMessages {
  /** Main text, e.g. "€820.00 of €1,000.00". */
  amount: (spent: string, limit: string) => string;
  /** Committed (pending) amount, e.g. "€100.00 committed". */
  committed: (committed: string) => string;
  /** Overage when spent is above the limit, e.g. "€120.00 over". */
  overage: (overage: string) => string;
}

export const DEFAULT_STATE_LABELS: BudgetStateLabels = {
  ok: "within budget",
  approaching: "approaching limit",
  exceeded: "limit exceeded",
};

export const DEFAULT_BUDGET_MESSAGES: BudgetMessages = {
  amount: (spent, limit) => `${spent} of ${limit}`,
  committed: (committed) => `${committed} committed`,
  overage: (overage) => `${overage} over`,
};

export interface BudgetAmount {
  /** Canonical decimal string safe to format ("0" when the input is invalid). */
  value: string;
  minor: bigint;
}

export interface BudgetMetrics {
  spent: BudgetAmount;
  limit: BudgetAmount;
  committed: BudgetAmount | null;
  /** Overage in canonical decimal form, or null when spent <= limit. */
  overage: string | null;
  /** spent / limit (Infinity when limit <= 0 and spent > 0). */
  ratio: number;
  /** Bar widths in percent, already capped so both fit in 100%. */
  spentPercent: number;
  committedPercent: number;
  state: BudgetState;
}

const ZERO = BigInt(0);

/** Parses a decimal string, falling back to zero when it is not a valid amount. */
export function toBudgetAmount(value: string | null | undefined, minorUnits: number): BudgetAmount {
  const text = (value ?? "").trim();
  try {
    return { value: text, minor: toMinorUnits(text, minorUnits) };
  } catch {
    return { value: "0", minor: ZERO };
  }
}

/** Ratio of two minor-unit amounts; a non-positive limit never divides. */
export function budgetRatio(spent: bigint, limit: bigint): number {
  if (limit <= ZERO) return spent > ZERO ? Infinity : 0;
  const ratio = Number(spent) / Number(limit);
  return Math.max(0, ratio);
}

/**
 * `approaching` from `thresholds[0]` inclusive; `exceeded` strictly above
 * `thresholds[1]` (spending exactly the limit is not over budget).
 */
export function budgetState(ratio: number, thresholds: readonly [number, number]): BudgetState {
  const [approaching, exceeded] = thresholds;
  if (ratio > exceeded) return "exceeded";
  if (ratio >= approaching) return "approaching";
  return "ok";
}

function toPercent(ratio: number): number {
  return Math.min(100, Math.max(0, ratio * 100));
}

export function computeBudget(
  input: { spent: string; limit: string; committed?: string | null },
  minorUnits: number,
  thresholds: readonly [number, number],
): BudgetMetrics {
  const spent = toBudgetAmount(input.spent, minorUnits);
  const limit = toBudgetAmount(input.limit, minorUnits);
  const committed = input.committed == null ? null : toBudgetAmount(input.committed, minorUnits);
  const ratio = budgetRatio(spent.minor, limit.minor);
  const spentPercent = toPercent(ratio);
  const committedRatio = committed ? budgetRatio(committed.minor, limit.minor) : 0;
  const over = spent.minor - limit.minor;
  return {
    spent,
    limit,
    committed,
    overage: over > ZERO ? fromMinorUnits(over, minorUnits) : null,
    ratio,
    spentPercent,
    committedPercent: Math.min(toPercent(committedRatio), 100 - spentPercent),
    state: budgetState(ratio, thresholds),
  };
}
