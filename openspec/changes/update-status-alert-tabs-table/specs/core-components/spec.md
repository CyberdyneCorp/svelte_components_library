## MODIFIED Requirements

### Requirement: Accessible overlays and tab navigation

The system SHALL implement `Modal` as a dialog with `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing at its title, focus trap on Tab/Shift+Tab, Escape-to-close, backdrop-click-to-close, and auto-focus of the close button on open.

#### Scenario: Complete Accessible overlays and tab navigation contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

The system SHALL implement `Modal` as a dialog with `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing at its title, focus trap on Tab/Shift+Tab, Escape-to-close, backdrop-click-to-close, and auto-focus of the close button on open. `Tabs` whose items have no `href` SHALL implement `role="tablist"`/`role="tab"` with `aria-selected`, roving tabindex, and ArrowLeft/ArrowRight navigation with wraparound; the optional `ariaLabel` prop names the tablist.

When any `Tabs` item has an `href`, the system SHALL instead render link tabs for navigation between pages, following the WAI-ARIA navigation (not tab widget) pattern:

- a `<nav>` landmark named by `ariaLabel`, containing a list with one `<a href>` per item;
- `aria-current="page"` on the link whose item id equals `activeId`, and on no other link;
- no `tablist`/`tab` roles, `aria-selected` or roving tabindex, so every link is a tab stop and arrow keys are not handled;
- clicks are not intercepted and `onchange` is not called; `activeId` is driven by the consumer's route.

(src: packages/ui/core/src/lib/overlay/Modal/Modal.svelte:27-57,62-66; packages/ui/core/src/lib/navigation/Tabs/Tabs.svelte)

#### Scenario: Modal focus trap and escape

- **GIVEN** an open `Modal`
- **WHEN** the user presses Escape or Tab past the last focusable element
- **THEN** the system SHALL close on Escape and cycle focus within the dialog on Tab

#### Scenario: Link tabs mark the current page

- **GIVEN** `Tabs` with items `overview`, `activity` and `settings`, each with an `href`, `activeId="activity"` and `ariaLabel="Wallet sections"`
- **WHEN** it renders
- **THEN** the system SHALL expose a navigation landmark named "Wallet sections" containing three links
- **AND** only the "Activity" link SHALL have `aria-current="page"`
- **AND** there SHALL be no `tablist` or `tab` roles

#### Scenario: Button tabs are unchanged

- **GIVEN** `Tabs` whose items have no `href`
- **WHEN** it renders
- **THEN** the system SHALL render a `tablist` of `tab` buttons with `aria-selected` and roving tabindex, and no navigation landmark

## ADDED Requirements

### Requirement: StatusBadge contract

The system SHALL provide `StatusBadge` with:

- `status`: `"active"` (default), `"inactive"`, `"pending"`, `"error"`, `"warning"` or `"info"`;
- `label` (default `""`);
- `tone`: `"success"`, `"neutral"`, `"warning"`, `"error"` or `"info"`, overriding the colour.

#### Scenario: Complete StatusBadge contract contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

The system SHALL provide `StatusBadge` with:

- `status`: `"active"` (default), `"inactive"`, `"pending"`, `"error"`, `"warning"` or `"info"`;
- `label` (default `""`);
- `tone`: `"success"`, `"neutral"`, `"warning"`, `"error"` or `"info"`, overriding the colour. Without it the tone comes from the status: active→success, inactive→neutral, pending→warning, error→error, warning→warning, info→info;
- `indicator`: `"dot"` (default) or `"icon"`;
- `icon`: an optional snippet that replaces the dot or icon.

With `indicator="dot"` and no `icon`, the badge SHALL render a colour dot and the label exactly as given, with the same colours as before for the original four statuses. With `indicator="icon"`, each status SHALL show its own `Icon` built-in (active `check`, inactive `minus`, pending `clock`, error `x`, warning `alert-triangle`, info `info`), and an empty `label` SHALL fall back to the status' default label (`"Active"`, `"Inactive"`, `"Pending"`, `"Error"`, `"Warning"`, `"Info"`). A custom `icon` snippet SHALL also enable the default label fallback. Icons SHALL be `aria-hidden`; the label carries the meaning. These defaults SHALL be exported as `STATUS_BADGE_DEFAULTS`. (src: packages/ui/core/src/lib/data/StatusBadge/StatusBadge.svelte; packages/ui/core/src/lib/data/StatusBadge/statusBadge.ts)

#### Scenario: Six kinds are distinct without colour

- **GIVEN** one `StatusBadge` per status, each with `indicator="icon"` and no label
- **WHEN** they render
- **THEN** each SHALL show a different icon shape and a different label

#### Scenario: Default rendering is unchanged

- **GIVEN** `<StatusBadge status="error" label="Down" />`
- **WHEN** it renders
- **THEN** the system SHALL render the colour dot and the text "Down", and no icon

#### Scenario: Tone overrides the colour

- **GIVEN** `<StatusBadge status="pending" tone="info" label="Queued" />`
- **WHEN** it renders
- **THEN** it SHALL use the info colours and keep the `pending` status class

#### Scenario: StatusBadge stories fail on axe violations

- **WHEN** the Storybook test project runs the `Data Display/StatusBadge` stories, including the calm and calm-dark ones
- **THEN** they SHALL run with `parameters.a11y.test = "error"`

### Requirement: Alert role

The system SHALL give `Alert` a `role` prop: `"alert"` (default), `"status"` or `"note"`, rendered as the element's `role`. With `"status"` the element SHALL also carry `aria-live="polite"`. With `"alert"` or `"note"` it SHALL carry no `aria-live` attribute. Variant, severity, appearance and dismissal SHALL behave the same for every role. (src: packages/ui/core/src/lib/feedback/Alert/Alert.svelte)

#### Scenario: Calm informational note

- **GIVEN** `<Alert role="note" title="Watch-only wallet">`
- **WHEN** it renders
- **THEN** it SHALL expose `role="note"` and SHALL NOT be an `alert` or a live region

#### Scenario: Polite status

- **GIVEN** `<Alert role="status" title="Saved">`
- **WHEN** it renders
- **THEN** it SHALL expose `role="status"` with `aria-live="polite"`

#### Scenario: Default stays assertive

- **GIVEN** an `Alert` without `role`
- **WHEN** it renders
- **THEN** it SHALL expose `role="alert"`

### Requirement: Table accessibility options

The system SHALL give `Table` these optional props, and without them SHALL render as before:

- `caption`: rendered as the table's `<caption>`, which names the table.

#### Scenario: Complete Table accessibility options contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

The system SHALL give `Table` these optional props, and without them SHALL render as before:

- `caption`: rendered as the table's `<caption>`, which names the table. With `captionHidden` the caption SHALL be visually hidden and still name the table.
- `rowHeader`: a column key whose body cells render as `<th scope="row">` instead of `<td>`.
- `rowAttributes(row, rowIndex)`: attributes spread on each body `<tr>` (for example `data-*`, `aria-current`). A returned `class` SHALL be added next to the built-in row class; `undefined` values SHALL render no attribute.
- `cell`: a snippet receiving `{ row, column, rowIndex }` that renders every column without its own `cell` snippet. A column's `cell` SHALL take precedence.

`rowIndex` SHALL be the row's display position (0-based) after sorting. Sorting SHALL behave as before. (src: packages/ui/core/src/lib/data/Table/Table.svelte; packages/ui/core/src/lib/data/Table/types.ts)

#### Scenario: Caption and row headers

- **GIVEN** a `Table` with `caption="Team members"` and `rowHeader="name"`
- **WHEN** it renders
- **THEN** the table SHALL be named "Team members"
- **AND** each `name` cell SHALL be a `<th scope="row">`

#### Scenario: Per-row attributes

- **GIVEN** `rowAttributes` returning `{ "data-id": row.id, "aria-current": rowIndex === 1 ? "true" : undefined }`
- **WHEN** the table renders two rows
- **THEN** both rows SHALL carry `data-id`, and only the second SHALL carry `aria-current="true"`

#### Scenario: Cell snippet after sorting

- **GIVEN** a table with a `cell` snippet and rows Alice, Bob
- **WHEN** the user sorts by name descending
- **THEN** the first rendered cell SHALL receive the row Bob with `rowIndex` 0

#### Scenario: Default rendering is unchanged

- **GIVEN** a `Table` with only `columns` and `rows`
- **WHEN** it renders
- **THEN** there SHALL be no caption, no row headers and no extra row attributes
