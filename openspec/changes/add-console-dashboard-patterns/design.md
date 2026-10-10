## Context

Control-panel screens are mostly lists of small, repeated units: a row with an icon, a title, a description and an action; a label/value pair with an edit affordance; an inline strip of facts with copy buttons. The library's existing primitives (Card, Button, IconButton, CopyButton, Badge, Dropdown, CurrencyDisplay, Icon) are the right building blocks, so each new component is a thin, accessible layout over them rather than a new visual language.

## Decisions

- **Snippets for anything rich, strings for the common case.** `SettingsRow`, `PromoBanner` and `DescriptionList` take `title`/`label` strings and expose `icon`, `actions`, `value` and `action` snippets, so the application decides which Button, Switch or link appears without the library importing product logic. `DescriptionList` renders a real `<dl>`; `KeyValueStrip` renders a `<ul>` with `aria-label`.
- **SplitButton composes Button and owns its menu.** It renders the existing `Button` for the primary action and a joined caret `<button aria-haspopup="menu" aria-expanded aria-controls>`. The menu reuses the `Dropdown` item type but is rendered by SplitButton itself as a `role="menu"` list with the menu-button keyboard pattern, because `Dropdown` wraps its trigger in a fixed `role="button"` element that cannot carry the caret's expanded state. Visual joining (shared border radius, one divider) is the only new styling.
- **PriceTag uses CurrencyDisplay for both prices.** The struck original price is wrapped in `<s>` with a visually hidden prefix (`originalLabel`, default "Original price") so screen readers do not read two prices as one. Savings text is a `Badge`.
- **PromoBanner is a region, not an alert.** It uses `role="region"` labelled by its title and a dismiss `IconButton`; Alert stays the component for status messages.
- **Sidebar grouping is a second input shape, not a breaking change.** `groups` is optional; when present it renders section headings (`<h3>`-free: a `<li>` heading with `role="presentation"` text and a collapsible toggle when `collapsible`) above each group's `items`. The flyout for collapsed items is a `<ul>` shown on hover and on focus-within, positioned next to the rail, and only for items with children. `badge` renders through `Badge`, `external` adds `target="_blank"`, `rel="noopener noreferrer"` and an external-link icon with hidden text (`externalLabel`).
- **KpiCard `visual` sits beside the value, `sparkline` stays below it.** Both are optional snippets; the card's grid gains a second column only when `visual` is set, so existing cards do not shift.
- **PasswordInput never generates passwords.** `ongenerate` is a callback the application implements; when provided, a `generateLabel` button appears next to the eye toggle and the component sets `value` to the callback's return value. `showLabel`/`hideLabel` make the eye toggle translatable.
- **IconButton badge is text, not state.** `badge` (string or number) renders a small count bubble; `badgeLabel` supplies the hidden sentence ("3 unread notifications"). Values longer than three characters are shown as-is; the application decides on "99+".
- **Dismissal is the application's state.** `PromoBanner` calls `ondismiss` and hides itself only when `dismissible`; persisting the dismissal is up to the application.

## Risks

- Hover-only flyouts fail on touch; the flyout also opens on focus-within and the collapsed rail keeps `title` tooltips, and `collapsed` can simply be turned off on touch layouts.
- `<dl>` styling across themes: values and actions must wrap on narrow widths; the stories include a 390px viewport check in the demo.
