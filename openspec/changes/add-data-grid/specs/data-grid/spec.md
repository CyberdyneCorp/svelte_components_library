## ADDED Requirements

### Requirement: DataGrid structure and props

The system SHALL provide a `DataGrid` data component that renders rows and typed columns as an ARIA grid with editable cells.

#### Scenario: Complete DataGrid structure and props contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

`DataGrid` SHALL take `columns: DataGridColumn[]`, `rows` (bindable array of records), `rowKey` (default `"id"`), a required `ariaLabel` (or `ariaLabelledby`), `readonly` (default `false`), `oncellchange(change)` and optional `labels`. A `DataGridColumn` SHALL be `{ key: string; label: string; type?: "text" | "number" | "select" | "boolean"; editable?: boolean; options?: { value: string; label: string }[]; validate?: (value, row) => string | undefined; format?: (value, row) => string; width?: string; align?: "start" | "end" }`. The default type SHALL be `"text"`, and `editable` SHALL default to `true`. The grid SHALL render `role="grid"` with `aria-rowcount` and `aria-colcount`. It SHALL render a header row of `columnheader` cells, and one `row` per record containing a `gridcell` per column. Non-editable cells (column `editable: false` or grid `readonly`) SHALL have `aria-readonly="true"`. In navigation mode each cell SHALL show `format(value, row)`, or the option label for select cells, or the value as text. Boolean cells SHALL show a checkbox glyph and expose `aria-checked`. Styling SHALL use foundation tokens only.

(src: packages/ui/core/src/lib/data/DataGrid/DataGrid.svelte)

#### Scenario: Grid semantics

- **GIVEN** 3 columns and 2 rows, the first column with `editable: false`
- **WHEN** it renders
- **THEN** there SHALL be one `grid` with 3 column headers and 6 grid cells
- **AND** the first cell of each row SHALL have `aria-readonly="true"`

### Requirement: DataGrid keyboard navigation

`DataGrid` SHALL implement the ARIA grid navigation pattern with a single tab stop.

#### Scenario: Complete DataGrid keyboard navigation contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

Exactly one cell SHALL have `tabindex="0"` (the active cell, initially the first body cell), and all other cells SHALL have `tabindex="-1"`. In navigation mode, Arrow keys SHALL move the active cell by one, stopping at the edges. Home and End SHALL move to the first and last cell of the row. Ctrl+Home and Ctrl+End SHALL move to the first and last cell of the grid. PageUp and PageDown SHALL move 10 rows, clamped. Moving SHALL focus the new cell. Clicking a cell SHALL make it active. The mapping SHALL live in an exported pure function, so it is testable without a DOM.

(src: packages/ui/core/src/lib/data/DataGrid/gridKeys.ts)

#### Scenario: Arrow navigation

- **GIVEN** focus on row 1, column 1
- **WHEN** the user presses ArrowRight and then ArrowDown
- **THEN** focus SHALL be on row 2, column 2, and it SHALL be the only cell with `tabindex="0"`

#### Scenario: Edges clamp

- **GIVEN** focus on the first cell
- **WHEN** the user presses ArrowUp or ArrowLeft
- **THEN** focus SHALL stay on the first cell

### Requirement: DataGrid cell editing

`DataGrid` SHALL let users edit editable cells in place and report each committed change.

#### Scenario: Complete DataGrid cell editing contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

On an editable non-boolean cell, Enter, F2 or a double-click SHALL start editing with the current value. A printable character SHALL start editing with the value replaced by that character. Editing SHALL render a labelled native control in the cell: a text input for `text`, a number input for `number`, and a select of `options` for `select`. The control SHALL be focused. Enter SHALL commit and move down one row (staying on the last row). Tab SHALL commit and move to the next cell, wrapping to the next row, and Shift+Tab SHALL move back. At the last cell Tab SHALL commit and let focus leave the grid. Escape SHALL cancel, restore the value and refocus the cell. Losing focus SHALL commit without moving. A number commit SHALL convert the text with `Number()`, and empty text SHALL become `null`. Before committing, `validate(value, row)` SHALL run when given. If it returns a message, the editor SHALL stay open with `aria-invalid="true"` and the message in an element referenced by `aria-describedby`, and no change SHALL be reported. A commit whose value equals the previous value SHALL report nothing. On a valid change the grid SHALL replace the row in a new `rows` array as `{ ...row, [key]: value }` and call `oncellchange({ rowKey, key, value, previousValue, row })`, where `row` is the updated row. Boolean cells SHALL toggle on Space or Enter (and on click) and commit immediately, without an editing mode. Read-only cells SHALL ignore all edit triggers.

(src: packages/ui/core/src/lib/data/DataGrid/DataGrid.svelte)

#### Scenario: Edit and commit a number

- **GIVEN** a Price column (number) with value 10 on row "a"
- **WHEN** the user focuses the cell, presses Enter, replaces the text with "12" and presses Enter
- **THEN** `oncellchange` SHALL be called with `{ rowKey: "a", key: "price", value: 12, previousValue: 10 }`
- **AND** the cell SHALL show "12" and focus SHALL be on the same column in the next row

#### Scenario: Validation blocks commit

- **GIVEN** a Price column whose `validate` returns "Must be positive" for values ≤ 0
- **WHEN** the user types "-1" into the editor and presses Enter
- **THEN** the editor SHALL stay open with `aria-invalid="true"` and the description "Must be positive"
- **AND** `oncellchange` SHALL NOT be called

#### Scenario: Type to replace and cancel

- **GIVEN** a Name cell with value "Ada"
- **WHEN** the user presses "B" on the focused cell and then Escape
- **THEN** the editor SHALL first show "B"
- **AND** after Escape the cell SHALL show "Ada", have focus, and no change SHALL be reported

#### Scenario: Boolean toggle

- **GIVEN** an Enabled column (boolean) with value `false`
- **WHEN** the user presses Space on the cell
- **THEN** the cell SHALL have `aria-checked="true"` and `oncellchange` SHALL be called with `value: true`

#### Scenario: Read-only cell

- **GIVEN** a cell with `editable: false`
- **WHEN** the user presses Enter or types a character
- **THEN** no editor SHALL open
