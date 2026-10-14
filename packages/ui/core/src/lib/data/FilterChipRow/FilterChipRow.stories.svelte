<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import FilterChipRow from "./FilterChipRow.svelte";
  import type { Query, QueryField } from "../../forms/QueryBuilder/query.js";

  const fields: QueryField[] = [
    {
      key: "status",
      label: "Status",
      type: "enum",
      options: [
        { value: "active", label: "Active" },
        { value: "paused", label: "Paused" },
      ],
    },
    { key: "price", label: "Price", type: "number" },
    { key: "name", label: "Name", type: "text" },
  ];

  const initial: Query = {
    combinator: "and",
    conditions: [
      { id: "c1", field: "status", operator: "in", value: ["active", "paused"] },
      { id: "c2", field: "price", operator: "between", value: [10, 50] },
      { id: "c3", field: "name", operator: "contains", value: "pro" },
      { id: "c4", field: "price", operator: "gt" },
    ],
  };

  const { Story } = defineMeta({
    title: "Data/FilterChipRow",
    component: FilterChipRow,
    tags: ["autodocs"],
    parameters: { a11y: { test: "error" } },
  });
</script>

<script lang="ts">
  let query = $state(initial);
  let anyQuery = $state<Query>({ ...initial, combinator: "or" });
</script>

<!-- Incomplete conditions (here "Price is greater than" with no value) are not shown. -->
<Story name="Removable chips" asChild>
  <FilterChipRow
    {fields}
    {query}
    onremove={(id) => (query = { ...query, conditions: query.conditions.filter((c) => c.id !== id) })}
    onclear={() => (query = { ...query, conditions: [] })}
  />
</Story>

<Story name="Match any" asChild>
  <FilterChipRow
    {fields}
    query={anyQuery}
    onremove={(id) => (anyQuery = { ...anyQuery, conditions: anyQuery.conditions.filter((c) => c.id !== id) })}
  />
</Story>
