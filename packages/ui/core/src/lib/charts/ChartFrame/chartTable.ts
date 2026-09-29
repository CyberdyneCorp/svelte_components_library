/** Normalized data-table fallback rendered by `ChartFrame`. */
export type ChartTableCell = string | number;

export type ChartTableData = {
  /** Column headers; the first column holds the row headers. */
  columns: string[];
  rows: ChartTableCell[][];
};

/**
 * Overridable user-visible and assistive strings of a chart. Every key is
 * optional and falls back to the English default, so apps can localize a
 * chart (e.g. pt-BR) without forking it.
 */
export type ChartLabels<Column extends string = string> = {
  /** Accessible name when no `title` is set (e.g. "Line chart"). */
  chart?: string;
  /** Data-table column headers, keyed per chart. */
  columns?: Partial<Record<Column, string>>;
  /** Table caption; defaults to "<title or chart name> data". */
  tableCaption?: string;
  /** Text of the toggle that reveals the data table. */
  showData?: string;
  /** Text of the toggle that hides the data table. */
  hideData?: string;
  /** Accessible name of the legend list. */
  legend?: string;
};

/** Column headers in `defaults` order, each replaced by its override when given. */
export function columnHeaders<Column extends string>(
  defaults: Record<Column, string>,
  overrides: Partial<Record<Column, string>> = {},
): string[] {
  return (Object.keys(defaults) as Column[]).map((key) => overrides[key] ?? defaults[key]);
}

/** Attributes a chart spreads onto its `<svg role="img">`. */
export type ChartA11yAttributes = {
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
};

type XYSeries = { name: string; data: { x: number; y: number }[] };

/** One row per distinct x (ascending), one column per series; gaps stay empty. */
export function seriesTable(series: XYSeries[], xHeader = "x"): ChartTableData {
  const xs = [...new Set(series.flatMap((s) => s.data.map((p) => p.x)))].sort((a, b) => a - b);
  const lookups = series.map((s) => new Map(s.data.map((p) => [p.x, p.y])));
  return {
    columns: [xHeader, ...series.map((s) => s.name)],
    rows: xs.map((x) => [x, ...lookups.map((m) => m.get(x) ?? "")]),
  };
}

/**
 * One row per matrix row: its y label, then one cell per column. Missing
 * labels fall back to 1-based "Row n" / "Column n".
 */
export function matrixTable(
  data: (string | number)[][],
  xLabels: string[] = [],
  yLabels: string[] = [],
  cornerHeader = "Row",
): ChartTableData {
  const width = Math.max(0, ...data.map((row) => row.length));
  const columns = Array.from({ length: width }, (_, i) => xLabels[i] ?? `Column ${i + 1}`);
  return {
    columns: [cornerHeader, ...columns],
    rows: data.map((row, i) => [yLabels[i] ?? `Row ${i + 1}`, ...row]),
  };
}

type Category = { label: string; value: number };

/** One row per category: label and value. */
export function categoryTable(data: Category[], labelHeader = "Label", valueHeader = "Value"): ChartTableData {
  return {
    columns: [labelHeader, valueHeader],
    rows: data.map((d) => [d.label, d.value]),
  };
}
