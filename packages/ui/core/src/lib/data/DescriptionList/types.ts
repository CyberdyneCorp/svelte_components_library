/** One label/value row of a `DescriptionList`. */
export interface DescriptionListItem {
  /** Stable key for the row. */
  id: string;
  /** Term shown in the `<dt>`. */
  label: string;
  /** Plain-text value; replaced by the `value` snippet when one is provided. */
  value?: string;
  /** Secondary line shown under the value (e.g. "Auto-renew on"). */
  hint?: string;
}
