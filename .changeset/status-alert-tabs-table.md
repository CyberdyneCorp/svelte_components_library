---
"@cyberdynecorp/svelte-ui-core": minor
---

`StatusBadge`: two new statuses, `warning` and `info`, next to `active`, `inactive`, `pending` and `error`. `indicator="icon"` shows a distinct icon per status (check, minus, clock, x, triangle, info) and a default label when `label` is empty, so badges read without colour (WCAG 1.4.1). New `tone` prop (`success` | `neutral` | `warning` | `error` | `info`) overrides the colour, and an `icon` snippet replaces the marker. `STATUS_BADGE_DEFAULTS` and the `StatusBadgeStatus` / `StatusBadgeTone` / `StatusBadgeIndicator` / `StatusBadgeDefaults` types are exported. The default dot rendering is unchanged.

`Alert`: new `role` prop, `"alert"` (default), `"status"` (polite live region) or `"note"` (not announced).

`Tabs`: items with `href` render link tabs, a `<nav>` landmark with a list of `<a>` elements and `aria-current="page"` on the active one, for section navigation across routes. New `ariaLabel` names the landmark (or the tablist). Button tabs are unchanged. `TabItem` is exported.

`Table`: new `caption` (with `captionHidden`), `rowHeader` (column rendered as `<th scope="row">`), `rowAttributes(row, rowIndex)` for per-row `data-*` / `aria-current` / `class`, and a `cell` snippet receiving `{ row, column, rowIndex }`. Sorting is unchanged. `TableColumn`, `TableRow`, `TableCellContext` and `TableRowAttributes` are exported.

`Icon`: new `clock` and `alert-triangle` built-ins.
