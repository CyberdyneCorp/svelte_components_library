import type { Snippet } from "svelte";

export type TableRow = Record<string, any>;

export type TableColumn = {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  /**
   * Per-cell render override. Receives the whole row so the cell can pull
   * multiple fields and run formatters / render components (checkboxes,
   * severity chips, mono-formatted numbers). When omitted the cell renders
   * the table-level `cell` snippet, or `row[col.key]` as text.
   */
  cell?: Snippet<[TableRow]>;
};

/** Argument of the table-level `cell` snippet. */
export type TableCellContext = {
  row: TableRow;
  column: TableColumn;
  /** Position of the row as displayed (after sorting), starting at 0. */
  rowIndex: number;
};

/**
 * Extra attributes for a `<tr>`, e.g. `data-*`, `aria-current` or `class`.
 * A `class` is added next to the built-in row class; `undefined` values are
 * omitted.
 */
export type TableRowAttributes = Record<string, string | number | boolean | undefined>;
