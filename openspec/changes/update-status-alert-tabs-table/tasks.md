## 1. StatusBadge

- [x] 1.1 Add `clock` and `alert-triangle` to the `Icon` built-ins
- [x] 1.2 Add `warning` and `info` statuses, `STATUS_BADGE_DEFAULTS` and the exported types
- [x] 1.3 Move colours to tone classes; add `tone`, `indicator` and the `icon` snippet
- [x] 1.4 Tests: six distinct icons and labels, tone override, custom icon, unchanged dot output

## 2. Alert

- [x] 2.1 Add `role` (`alert` | `status` | `note`), polite live region for `status`
- [x] 2.2 Tests for each role and for the default

## 3. Tabs

- [x] 3.1 Link mode when items carry `href`: `<nav>` with a list of links and `aria-current="page"`
- [x] 3.2 Add `ariaLabel` for the landmark and the tablist; export `TabItem`
- [x] 3.3 Tests for link mode and for unchanged button tabs

## 4. Table

- [x] 4.1 Add `caption` / `captionHidden` and `rowHeader`
- [x] 4.2 Add `rowAttributes` and the table-level `cell` snippet; export the table types
- [x] 4.3 Tests for each option, sorting with row headers and snippets, and unchanged defaults

## 5. Stories, docs, release

- [x] 5.1 Stories with `parameters.a11y.test = "error"`, including calm and calm-dark stories
- [x] 5.2 README and TRD entries
- [x] 5.3 Changeset (minor bump of `@cyberdynecorp/svelte-ui-core`)
- [ ] 5.4 Archive this change once released
