## Context

The WAI-ARIA grid pattern gives a data grid one tab stop and moves focus between cells with the arrow keys. Editing turns a cell into a form control until it is committed or cancelled. The grid is the only interactive widget on the page that needs this, so it is built directly, not on `DataTable`, whose sorting, selection and pagination markup would conflict with the roving focus.

## Decisions

- **Rows are bindable and updated immutably.** A commit replaces the edited row with `{ ...row, [key]: value }` in a new array and calls `oncellchange({ rowKey, key, value, previousValue, row })`. Applications can either `bind:rows` or keep `rows` controlled and apply the change in the callback.
- **Two modes: navigation and editing.** In navigation mode the focused element is the `gridcell` (roving `tabindex`, with 0 on the active cell and -1 elsewhere). Enter, F2, double-click or a printable key starts editing. A printable key replaces the value with that character, like a spreadsheet. In editing mode the cell holds a native input or select, and its keys belong to that control except Enter, Tab and Escape.
- **The keyboard map is a pure module.** `gridKeys.ts` maps `(key, modifiers, mode)` to an action (`move`, `edit`, `commit`, `cancel`, `toggle` or `none`). Both the component and its unit tests use it, which keeps the component's keydown handler within the cognitive-complexity target.
- **Boolean cells never enter editing mode.** Space or Enter toggles them and commits immediately, and they render a checkbox glyph with `aria-checked` on the cell.
- **Validation blocks the commit.** `column.validate(value, row)` returning a message keeps the editor open, sets `aria-invalid` and shows the message in an element referenced by `aria-describedby`. Escape cancels and restores the previous value. Number cells parse with `Number()`, and an empty input becomes `null` unless `validate` rejects it.
- **Read-only cells** (`editable: false` or grid `readonly`) get `aria-readonly="true"` and ignore edit keys, while still taking part in navigation.
- **Focus after a commit:** Enter commits and moves down a row (staying in place on the last row). Tab commits and moves right, wrapping to the next row's first cell. At the very last cell it commits and lets focus leave the grid. Shift reverses both. A commit by clicking elsewhere (blur) keeps the active cell where it was.

## Risks

- Screen reader support for editable grids varies. The story documents the keys, and every cell's value is plain text in navigation mode, so reading does not depend on edit support.
- Large grids re-render every row on an edit. That is acceptable for the targeted sizes (hundreds of rows), and the docs point to server-side editing beyond that.
