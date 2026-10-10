import type { IconName } from "../../primitives/Icon/icon-names.js";

/** One crumb in a `Breadcrumb` trail. */
export interface BreadcrumbItem {
  /** Visible text; also the accessible name when `iconOnly` hides it. */
  label: string;
  /** Link target. Omit for the current page (last item) or a non-linked crumb. */
  href?: string;
  /** Optional `Icon` name rendered `aria-hidden` before the label. */
  icon?: IconName | (string & {});
  /** Hide the label visually (kept for assistive technology). Only meaningful with `icon`. */
  iconOnly?: boolean;
}
