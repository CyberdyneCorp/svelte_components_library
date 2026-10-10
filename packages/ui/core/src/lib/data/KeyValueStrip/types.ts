/** One fact in a KeyValueStrip. */
export type KeyValueStripItem = {
  /** Stable key for the list. */
  id: string;
  /** Fact name, e.g. "IPv4". */
  label: string;
  /** Fact value as shown and copied, e.g. "203.0.113.10". */
  value: string;
  /** Renders a CopyButton for `value`. */
  copy?: boolean;
  /** Renders the value as a link to this URL. */
  href?: string;
  /** Link text when `href` is set; falls back to `value`. */
  linkLabel?: string;
};
