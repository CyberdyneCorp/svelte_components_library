## ADDED Requirements

### Requirement: Query model and helpers

The system SHALL export a typed query model and pure helpers for building, describing and evaluating flat filter queries.

#### Scenario: Complete Query model and helpers contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

The system SHALL export these types:

- `QueryFieldType = "text" | "number" | "date" | "boolean" | "enum"`
- `QueryField = { key: string; label: string; type: QueryFieldType; options?: { value: string; label: string }[] }`
- `QueryCondition = { id: string; field: string; operator: QueryOperator; value?: QueryValue }`
- `Query = { combinator: "and" | "or"; conditions: QueryCondition[] }`

It SHALL export these helpers:

- `operatorsFor(type)` SHALL return the operators for the field type, in this order. `text`: `contains`, `not_contains`, `eq`, `neq`, `starts_with`, `ends_with`, `is_empty`, `is_not_empty`. `number`: `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `between`, `is_empty`, `is_not_empty`. `date`: `on`, `before`, `after`, `between`, `is_empty`, `is_not_empty`. `boolean`: `is_true`, `is_false`. `enum`: `in`, `not_in`, `is_empty`, `is_not_empty`.
- `defaultOperator(type)` SHALL return the first of those operators.
- `valueShape(operator)` SHALL return `"none"`, `"single"`, `"range"` or `"list"`.
- `isConditionComplete(condition, fields)` SHALL be true only when the field exists, the operator is valid for its type, and the value matches the shape: no value for `none`; a non-empty string, a finite number or a date string for `single`; two such values with min ≤ max for `range`; a non-empty array for `list`.
- `describeCondition(condition, field, labels?)` SHALL return readable text such as "Status is any of Active, Paused" or "Price between 10 and 20", using option labels for enum values.
- `evaluateQuery(query, row, fields)` SHALL return whether `row[field.key]` satisfies the query. It SHALL ignore incomplete conditions. It SHALL compare text case-insensitively, treat `null`, `undefined`, `""` and `[]` as empty, compare `on` by local calendar day, treat `before` as before the start of that day and `after` as on or after the start of the next day, let `in`/`not_in` match array-valued row fields by any element, and return `true` when no condition is complete. Helpers `emptyQuery`, `createCondition`, `mergeQueryLabels` and `DEFAULT_QUERY_LABELS` SHALL also be exported.

(src: packages/ui/core/src/lib/forms/QueryBuilder/query.ts)

#### Scenario: Evaluate an AND query

- **GIVEN** fields `status` (enum) and `price` (number), and the query `and` [status `in` ["active"], price `between` [10, 20]]
- **WHEN** `evaluateQuery` runs on `{ status: "active", price: 15 }` and on `{ status: "active", price: 25 }`
- **THEN** it SHALL return `true` and then `false`

#### Scenario: OR query with an incomplete condition

- **GIVEN** the query `or` [name `contains` "ada", price `gt` with no value]
- **WHEN** `evaluateQuery` runs on `{ name: "Ada Lovelace", price: 1 }`
- **THEN** it SHALL return `true`
- **AND** `isConditionComplete` SHALL be `false` for the price condition

#### Scenario: Describe an enum condition

- **GIVEN** a status field with options active → "Active" and paused → "Paused", and the condition status `in` ["active", "paused"]
- **WHEN** `describeCondition` runs with default labels
- **THEN** it SHALL return "Status is any of Active, Paused"

### Requirement: QueryBuilder contract

The system SHALL provide a `QueryBuilder` form component that edits a `Query` over a list of typed fields.

#### Scenario: Complete QueryBuilder contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

`QueryBuilder` SHALL take `fields: QueryField[]`, `query` (bindable, default `{ combinator: "and", conditions: [] }`), optional `onchange(query)`, optional `maxConditions`, optional `labels` (partial, English defaults) and `ariaLabel` (default `"Filter conditions"`). It SHALL render each condition as a `<fieldset>` with a visually hidden legend "Condition n", containing:

- a field Select;
- an operator Select limited to `operatorsFor(type)`;
- a value control chosen by `valueShape` and field type: a TextInput of type text, number or date named "Value"; a fieldset (legend "Values") of Checkboxes for enum lists; two inputs named "From" and "To" for ranges; and none for the `none` shape;
- an IconButton named "Remove condition n".

An "Add condition" button SHALL append a condition with the first field, its default operator and no value. It SHALL be disabled when `maxConditions` is reached. When there are at least two conditions, a Select named "Combine conditions" SHALL switch the combinator between "Match all" (`and`) and "Match any" (`or`). Changing a condition's field SHALL reset its operator to the default and clear its value. Changing the operator SHALL clear the value unless the old and new value shapes are the same. Every edit SHALL update `query` immutably and call `onchange` with the new query. After an add, focus SHALL move to the new row's field select. After a remove, focus SHALL move to the next row's field select, else the previous row's, or to "Add condition" when no row is left. Condition ids SHALL be unique within the query.

(src: packages/ui/core/src/lib/forms/QueryBuilder/QueryBuilder.svelte)

#### Scenario: Build a condition

- **GIVEN** fields Name (text) and Status (enum), and an empty query
- **WHEN** the user activates "Add condition", chooses "Status", keeps "is any of" and selects "Active"
- **THEN** `query.conditions` SHALL hold one condition with field "status", operator `in` and value `["active"]`
- **AND** `onchange` SHALL have been called with that query

#### Scenario: Field change resets the condition

- **GIVEN** a condition Name `contains` "ada"
- **WHEN** the user changes the field to "Price" (number)
- **THEN** the operator SHALL be `eq` and the value SHALL be cleared

#### Scenario: Range and empty operators

- **GIVEN** a Price condition
- **WHEN** the user selects `between`
- **THEN** inputs named "From" and "To" SHALL be shown
- **AND** after selecting `is_empty` no value input SHALL be shown

#### Scenario: Remove moves focus

- **GIVEN** two conditions
- **WHEN** the user activates "Remove condition 1"
- **THEN** one condition SHALL remain and focus SHALL be on its field select

### Requirement: FilterChipRow contract

The system SHALL provide a `FilterChipRow` data component that lists the complete conditions of a query as removable chips.

#### Scenario: Complete FilterChipRow contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

`FilterChipRow` SHALL take `fields`, `query`, `onremove(conditionId)`, optional `onclear()`, optional `labels` and `ariaLabel` (default `"Active filters"`). It SHALL render a `<ul>` with `aria-label` holding one `<li>` per complete condition, in query order. Each chip SHALL show `describeCondition(...)` and SHALL contain a button named `Remove filter: <description>` that calls `onremove` with the condition id. When `query.combinator` is `"or"` and there are at least two chips, a "Match any" label SHALL precede the list. When `onclear` is given and there is at least one chip, a "Clear all" button SHALL call it. When no condition is complete, the component SHALL render only its empty root. After a chip's removal, focus SHALL move to the next chip's remove button, else the previous one, else the component root (`tabindex="-1"`).

(src: packages/ui/core/src/lib/data/FilterChipRow/FilterChipRow.svelte)

#### Scenario: Chips for complete conditions only

- **GIVEN** a query with Status `in` ["active"] and Price `gt` with no value
- **WHEN** it renders
- **THEN** the list "Active filters" SHALL contain exactly one item, "Status is any of Active"

#### Scenario: Remove a chip

- **WHEN** the user activates "Remove filter: Status is any of Active"
- **THEN** `onremove` SHALL be called with that condition's id

### Requirement: SavedViews contract

The system SHALL provide a `SavedViews` data component for choosing and managing named views whose state and storage belong to the application.

#### Scenario: Complete SavedViews contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

`SavedViews` SHALL be generic over the state type `T`. It SHALL take `views: Array<{ id: string; name: string; state: T; builtin?: boolean }>`, `activeId` (bindable), `dirty` (default `false`), `onselect(view)`, `onsave(name)`, optional `onupdate(view)`, optional `onrename(view, name)`, optional `ondelete(view)`, optional `labels` (its own `SavedViewsLabels`, defaults exported as `DEFAULT_SAVED_VIEWS_LABELS`) and `label` (default `"View"`). It SHALL render:

- a labelled Select of view names, where choosing one sets `activeId` and calls `onselect`;
- a "Modified" Badge while `dirty`;
- a SplitButton whose primary action is "Save changes" (calling `onupdate`) when the active view is not built-in, `dirty` is true and `onupdate` is given, and "Save as new view" otherwise.

The SplitButton menu SHALL include "Save as new view". It SHALL include "Rename" and "Delete" only when the active view is not built-in and the matching callback is given. "Save as new view" and "Rename" SHALL open a Dialog with a TextInput labelled "View name". Its confirm SHALL stay disabled while the trimmed name is empty or matches another view's name, case-insensitively. Confirming SHALL call `onsave(name)` or `onrename(view, name)` with the trimmed name. "Delete" SHALL open a danger Dialog naming the view, and confirming SHALL call `ondelete(view)`. The component SHALL NOT read or write browser storage.

(src: packages/ui/core/src/lib/data/SavedViews/SavedViews.svelte)

#### Scenario: Save the current state as a new view

- **GIVEN** views "All" (built-in) and "Mine", with "All" active and `dirty`
- **WHEN** the user activates "Save as new view", types "mine " and confirms
- **THEN** the confirm button SHALL be disabled while the name is "mine", because it duplicates "Mine"
- **AND** after changing the name to "Mine open" and confirming, `onsave` SHALL be called with "Mine open"

#### Scenario: Built-in view cannot be changed

- **GIVEN** the active view is built-in
- **WHEN** the menu opens
- **THEN** it SHALL NOT contain "Rename" or "Delete"
- **AND** the primary action SHALL be "Save as new view" even when `dirty`

#### Scenario: Select a view

- **WHEN** the user chooses "Mine" in the view select
- **THEN** `activeId` SHALL be "Mine"'s id and `onselect` SHALL be called with that view
