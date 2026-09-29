## Why

CyberWealth (calm themes, pt-BR/en) still keeps app-local copies of four core components because of accessibility gaps listed in part 5 of issue #61:

- `StatusBadge` has four statuses and tells them apart only by the colour of a dot. It needs six kinds, each with its own icon and label, so a badge is identifiable in grayscale (WCAG 1.4.1), plus `icon` and `tone` props.
- `Alert` always renders `role="alert"`, which interrupts screen readers. A calm informational note needs `role="note"` and a non-urgent update needs a polite `role="status"`.
- `Tabs` only switches content in place. Section navigation across routes needs link tabs (`href`, `aria-current="page"`).
- `Table` has no caption, no row headers, no per-row attributes (`data-*`, `aria-current`) and no cell snippet that knows the row index.

## What Changes

- `StatusBadge`:
  - Two new statuses, `warning` and `info`, next to `active`, `inactive`, `pending` and `error`. `inactive` already covers a neutral state, so the two additions are the missing alert levels.
  - `indicator?: "dot" | "icon"` (default `"dot"`). `"icon"` shows the status' own icon shape (check, minus, clock, x, triangle, info) and falls back to the status' default label (`"Active"`, ..., `"Info"`) when `label` is empty.
  - `tone?: "success" | "neutral" | "warning" | "error" | "info"` overrides the colour derived from the status.
  - `icon?: Snippet` replaces the marker (rendered `aria-hidden`).
  - `STATUS_BADGE_DEFAULTS` (tone, icon, label per status) and the `StatusBadgeStatus`, `StatusBadgeTone`, `StatusBadgeIndicator` and `StatusBadgeDefaults` types are exported.
- `Icon`: new `clock` and `alert-triangle` built-ins, used by `StatusBadge`.
- `Alert`: `role?: "alert" | "status" | "note"` (default `"alert"`). `"status"` also sets `aria-live="polite"`.
- `Tabs`: when any item has `href`, render link tabs: a `<nav>` landmark (named by the new `ariaLabel`) with a list of `<a>` elements and `aria-current="page"` on the `activeId` item. `ariaLabel` also names the tablist of button tabs. `TabItem` is exported.
- `Table`: `caption` and `captionHidden`, `rowHeader` (column key rendered as `<th scope="row">`), `rowAttributes(row, rowIndex)` and a table-level `cell` snippet receiving `{ row, column, rowIndex }`. `TableColumn`, `TableRow`, `TableCellContext` and `TableRowAttributes` are exported.
- Stories for the four components run axe in failing mode (`parameters.a11y.test = "error"`) and include calm and calm-dark stories.
- Non-breaking: without the new props every component renders as before.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `core-components`: adds the StatusBadge, Alert role and Table contracts, and extends the Tabs part of the accessible navigation requirement with link tabs.

## Impact

- `packages/ui/core/src/lib/data/StatusBadge/*`, `data/Table/*`, `feedback/Alert/*`, `navigation/Tabs/*`, `primitives/Icon/*`, `_testdata/TableCellSnippetDemo.svelte`, public exports in `src/lib/index.ts`.
- README and TRD component entries.
- Minor version bump of `@cyberdynecorp/svelte-ui-core`.
