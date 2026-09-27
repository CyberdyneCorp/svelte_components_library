/** Normalized data-table fallback rendered by `ChartFrame`. */
export type ChartTableCell = string | number;

export type ChartTableData = {
  /** Column headers; the first column holds the row headers. */
  columns: string[];
  rows: ChartTableCell[][];
};

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

type Category = { label: string; value: number };

/** One row per category: label and value. */
export function categoryTable(data: Category[], labelHeader = "Label", valueHeader = "Value"): ChartTableData {
  return {
    columns: [labelHeader, valueHeader],
    rows: data.map((d) => [d.label, d.value]),
  };
}
