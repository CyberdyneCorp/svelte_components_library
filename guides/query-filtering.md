# Query filtering

`@cyberdynecorp/svelte-ui-core` provides a flat filter-query model and three components on top of it for list screens where users build their own filters: `QueryBuilder` edits the conditions, `FilterChipRow` summarizes them as removable chips, and `SavedViews` keeps named views. See **Patterns / Query filtering** in Storybook for a runnable example over synthetic orders, filtered client-side with `evaluateQuery` and shown in a `DataTable`.

The components fetch and store nothing. They report every change through a bindable value or a callback, and the application decides when to query, what to persist and where.

## The model

```ts
type Query = { combinator: "and" | "or"; conditions: QueryCondition[] };
type QueryCondition = { id: string; field: string; operator: QueryOperator; value?: QueryValue };
type QueryField = { key: string; label: string; type: "text" | "number" | "date" | "boolean" | "enum"; options?: { value: string; label: string }[] };
```

A query is one flat list of conditions joined by a single AND or OR. Each field type offers its own operators (`operatorsFor(type)`), and each operator decides the value's shape (`valueShape(operator)`):

| Type | Operators | Value |
|---|---|---|
| text | contains, not_contains, eq, neq, starts_with, ends_with, is_empty, is_not_empty | string |
| number | eq, neq, gt, gte, lt, lte, between, is_empty, is_not_empty | number, or `[min, max]` for between |
| date | on, before, after, between, is_empty, is_not_empty | `YYYY-MM-DD` string, or a pair |
| boolean | is_true, is_false | none |
| enum | in, not_in, is_empty, is_not_empty | `string[]` of option values |

`QueryBuilder` emits every edit, including half-typed rows. Use `isConditionComplete(condition, fields)` to decide which conditions to send to your API. `FilterChipRow` and `evaluateQuery` already skip incomplete ones.

## Adoption

1. **Fields.** Describe the filterable columns as `QueryField`s. Enum fields need `options`, whose labels appear in the builder and in chip text.
2. **Builder.** `<QueryBuilder {fields} bind:query />`, or pass `query` and handle `onchange`. Each row is a fieldset named "Condition n", with a field select, an operator select, a value control and a "Remove condition n" button. Changing the field resets the operator and value; changing the operator keeps the value only when its shape is unchanged. `maxConditions` caps the rows.
3. **Chips.** `<FilterChipRow {fields} {query} onremove={…} onclear={…} />` lists the complete conditions with `describeCondition` text ("Status is any of Open, Shipped"). Remove the condition in `onremove`; focus moves to the next chip, or to the row itself when none is left.
4. **Views.** `SavedViews` is generic over your state (here a `Query`). Pass `views`, `bind:activeId`, and a `dirty` flag you compute by comparing the current state with the active view's. Restore state in `onselect`, and persist in `onsave`, `onupdate`, `onrename` and `ondelete`. Built-in views (`builtin: true`) can only be saved as a copy. Names are trimmed, and a name that matches another view's (case-insensitively) is rejected in the dialog.
5. **Filtering.** On the server, translate `Query` into your API's filter format. For small in-memory lists, demos and tests, `rows.filter((row) => evaluateQuery(query, row, fields))` works directly. It runs on the main thread, so filter on the server beyond a few thousand rows.

```svelte
<script lang="ts">
  import {
    DataTable,
    FilterChipRow,
    QueryBuilder,
    evaluateQuery,
    type Query,
    type QueryField,
  } from "@cyberdynecorp/svelte-ui-core";

  let { orders } = $props();
  const fields: QueryField[] = [
    { key: "customer", label: "Customer", type: "text" },
    { key: "total", label: "Total", type: "number" },
    { key: "status", label: "Status", type: "enum", options: [
      { value: "open", label: "Open" },
      { value: "shipped", label: "Shipped" },
    ] },
  ];
  let query = $state<Query>({ combinator: "and", conditions: [] });
  let rows = $derived(orders.filter((row) => evaluateQuery(query, row, fields)));
</script>

<QueryBuilder {fields} bind:query />
<FilterChipRow
  {fields}
  {query}
  onremove={(id) => (query = { ...query, conditions: query.conditions.filter((c) => c.id !== id) })}
  onclear={() => (query = { ...query, conditions: [] })}
/>
<DataTable columns={[{ key: "customer", label: "Customer" }, { key: "total", label: "Total" }]} {rows} />
```

## Matching rules of `evaluateQuery`

- Text compares case-insensitively. `null`, `undefined` and `""` count as empty, and empty values never equal or contain anything.
- Numbers accept numeric strings in rows. Ranges are inclusive.
- `on` and `between` compare local calendar days. `before` means earlier than the start of that day, and `after` means on or after the start of the next day. A bare `YYYY-MM-DD` in a row is read as local midnight.
- `in` and `not_in` also accept array values in rows (tags): `in` matches when any item is in the list.
- A query with no complete condition matches every row.

## Localization

`QueryBuilder` and `FilterChipRow` share one `labels` object (`QueryLabelsInput`): operator names, range and list joiners, "Add condition", "Match all/any", "Clear all" and the accessible names. Pass the same object to both, and to `describeCondition` when you render condition text yourself. `SavedViews` takes its own `labels` (`SavedViewsLabels`) because it is not tied to queries.
