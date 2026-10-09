## Context

The four components are small and independent. Each change must keep today's output for existing props, because CyberWealth and other consumers already render them. `StatusBadge` colours its dot and label per status class; `Alert` hard-codes `role="alert"`; `Tabs` is a WAI-ARIA tab widget with roving tabindex; `Table` renders `<td>` cells keyed by row index and supports a per-column `cell` snippet that only receives the row.

## Goals / Non-Goals

**Goals**

- A badge, alert, tab bar and table that pass axe in the default, calm and calm-dark themes.
- Status readable without colour.
- Additive props only; no change in rendering without them.

**Non-Goals**

- No i18n table for the StatusBadge default labels. Consumers pass `label` (the defaults are English fallbacks).
- No router integration in `Tabs`. Link tabs do not intercept clicks.
- No selection, pagination or sticky headers in `Table`.

## Decisions

### StatusBadge kinds, tone and indicator

The six kinds are the original four plus `warning` and `info`. `inactive` already covers the neutral case, and `pending` (in progress) and `warning` (needs attention) are different meanings that CyberWealth shows side by side, so `warning` gets its own kind rather than reusing `pending`.

Colour moves from status classes to tone classes (`cy-status-badge--tone-*`) that set `--cy-status-dot`, `--cy-status-text` and `--cy-status-glow`. The status class stays on the element and still drives the `active` pulse. The default tone per status reproduces the old colours exactly (`active`→success, `inactive`→neutral, `pending`→warning, `error`→error).

The icon mode is opt-in (`indicator="icon"`) rather than the new default: turning every existing dot into an icon, or filling an empty label, would change current output. In icon mode the badge always has an icon shape and text, which is what WCAG 1.4.1 needs. Icons come from `Icon` built-ins; `clock` and `alert-triangle` are added there so other components can use them too. Each status maps to a different shape: check, minus, clock, x, triangle, info.

### Alert role

`role` is passed straight to the element. For `"status"` the component also sets `aria-live="polite"`, which is the implicit value but is not honoured by every screen reader for dynamically inserted regions. `"note"` gets no live region. The dismiss button and tones are independent of the role.

### Link tabs

Link navigation between pages is not a tab widget: WAI-ARIA tabs switch panels in the same page and use arrow keys with a single tab stop. The APG guidance for navigation across pages is a `<nav>` landmark with links and `aria-current="page"` on the current one. So in link mode:

- the root is `<nav aria-label={ariaLabel}>` with a `<ul>` of `<li><a href>`;
- there is no `role="tablist"`, `role="tab"`, `aria-selected` or roving tabindex;
- every link is a tab stop and Enter follows it; arrow keys are left to the browser;
- the `activeId` item gets `aria-current="page"` and the same active styling as a button tab;
- clicks are not intercepted and `onchange` is not called; the consumer derives `activeId` from the route.

Link mode is chosen when any item has `href`. Mixed lists are not a supported case; consumers give every item an `href`.

### Table

- `caption` renders a `<caption>` as the first child of `<table>`, which names the table. `captionHidden` applies a visually-hidden class so the name stays available to assistive technology.
- `rowHeader` names a column key; that column's body cells render as `<th scope="row">` with the same padding as other cells. Header cells are unchanged.
- `rowAttributes(row, rowIndex)` returns attributes spread on the `<tr>`. A returned `class` is appended to `cy-table__row` with a string join, because class arrays need Svelte 5.16 and the peer range is `^5.0.0`. `undefined` values render no attribute.
- The table-level `cell` snippet receives `{ row, column, rowIndex }`. Precedence: the column's own `cell`, then the table `cell`, then the text value. `rowIndex` is the display position after sorting, matching what `rowAttributes` receives, since rows are keyed by that index.

## Risks / Trade-offs

- StatusBadge elements now carry an extra tone class. Visual output is the same, but snapshot tests that compare class strings would change.
- Default StatusBadge labels are English. Consumers in other locales should always pass `label`.
- Link tabs rely on the consumer to keep `activeId` in sync with the route.
