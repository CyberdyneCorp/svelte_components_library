## Context

The three components share one model, so it lives in a single module (`query.ts`) that holds no Svelte code and is fully unit-tested. The components are views over it. Each one reports changes through a bindable value plus a callback, and none of them fetches or stores data.

## Decisions

- **Flat query, one combinator.** `Query = { combinator: "and" | "or"; conditions: QueryCondition[] }`. Most list screens need one level, and a flat list keeps the UI, the chip text and the evaluator simple. Nested groups can be added later as a new condition kind without breaking this shape.
- **Operators are keyed by field type.** `text`: contains, not_contains, eq, neq, starts_with, ends_with, is_empty, is_not_empty. `number`: eq, neq, gt, gte, lt, lte, between, is_empty, is_not_empty. `date`: on, before, after, between, is_empty, is_not_empty. `boolean`: is_true, is_false. `enum`: in, not_in, is_empty, is_not_empty. The operator decides the value's shape: none, a scalar, a `[min, max]` pair, or a `string[]`. Changing the field resets operator and value. Changing the operator keeps the value only when its shape is unchanged.
- **Incomplete conditions stay in the query.** The builder emits every edit, so a half-typed row is not lost. `isConditionComplete` tells consumers and `FilterChipRow` which conditions to apply. `evaluateQuery` ignores incomplete ones, and a query with none matches everything.
- **Text matching is case-insensitive. Dates compare by calendar day** in the local time zone for `on`, and by instant for `before` and `after`. The date value is an ISO `YYYY-MM-DD` string from a native date input, which avoids a date-picker dependency in each row.
- **Strings come from one `labels` object** shared by the three components (operator names, "Add condition", "Match all", "Clear all", and so on), with English defaults, so an application localises once.
- **Each QueryBuilder row is a `<fieldset>` with a visually hidden legend "Condition n".** Controls are the existing Select, TextInput, NumberInput and MultiSelect. Remove buttons are named "Remove condition n". Adding a condition moves focus to the new row's field select. Removing one moves focus to the next row's field select, or to "Add condition" when no row is left.
- **FilterChipRow renders a labelled list**, so screen readers announce the count. Each chip's remove button is named "Remove filter: <description>". After a removal, focus moves to the next chip's button, else the previous one, else "Clear all", else the row's container.
- **SavedViews composes Select, Badge, SplitButton and Dialog.** A Select chooses the view. A "Modified" badge appears when the application passes `dirty`. A SplitButton offers the primary action ("Save changes" when the active view is editable and dirty, else "Save as new view") plus a menu (Save as new, Rename, Delete). Name entry uses a Dialog with a TextInput, and confirm is disabled while the trimmed name is empty or matches another view's name, case-insensitively. Delete asks for confirmation in a Dialog. Built-in views cannot be renamed, updated or deleted.

## Risks

- `evaluateQuery` on large lists runs on the main thread. The guide says to filter on the server beyond a few thousand rows.
- Native date inputs vary in look across browsers. That is accepted for this change.
