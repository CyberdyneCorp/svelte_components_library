export type TabItem = {
  id: string;
  label: string;
  /**
   * Destination URL. When any item has an `href`, `Tabs` renders link
   * navigation (a `<nav>` of `<a>` elements) instead of an ARIA tab widget.
   */
  href?: string;
};
