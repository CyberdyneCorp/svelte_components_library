/** Secondary action shown in the SplitButton menu; same shape as Dropdown items. */
export type SplitButtonItem = {
  /** Visible text of the menu item. */
  label: string;
  /** Value passed to `onselect` when the item is chosen. */
  value: string;
  /** Optional leading glyph (emoji or short text), hidden from assistive technology. */
  icon?: string;
  /** `"danger"` colours the item as a destructive action. */
  variant?: "default" | "danger";
};
