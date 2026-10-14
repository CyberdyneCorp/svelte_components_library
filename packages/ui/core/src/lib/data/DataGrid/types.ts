/** A record shown as one grid row. */
export type DataGridRow = Record<string, any>;

/** One column of a `DataGrid`. */
export interface DataGridColumn {
  /** Property of the row shown in this column. */
  key: string;
  /** Header text; also used in editor and checkbox accessible names. */
  label: string;
  /** Cell editor and display kind (default `"text"`). */
  type?: "text" | "number" | "select" | "boolean";
  /** Allow editing this column's cells (default `true`). */
  editable?: boolean;
  /** Choices of a `"select"` column; the label is shown in the cell. */
  options?: { value: string; label: string }[];
  /** Return a message to reject a value; the editor stays open and shows it. */
  validate?: (value: any, row: DataGridRow) => string | undefined;
  /** Display text in navigation mode. */
  format?: (value: any, row: DataGridRow) => string;
  /** CSS width of the column (e.g. `"8rem"`). */
  width?: string;
  /** Horizontal alignment of the cell content (default `"start"`). */
  align?: "start" | "end";
}

/** A committed cell edit, reported through `oncellchange`. */
export interface DataGridChange {
  /** `row[rowKey]` of the edited row. */
  rowKey: unknown;
  /** Column key of the edited cell. */
  key: string;
  /** New value. */
  value: unknown;
  /** Value before the edit. */
  previousValue: unknown;
  /** The updated row. */
  row: DataGridRow;
}

/** Overridable accessible strings. */
export interface DataGridLabels {
  /** Accessible name of a cell editor or checkbox, e.g. "Price, row 2". */
  cell?: (column: string, rowNumber: number) => string;
}
