<script lang="ts">
  import FilterChipRow from "./FilterChipRow.svelte";
  import type { Query, QueryField } from "../../forms/QueryBuilder/query.js";

  let { fields, query: initial, withClear = true }: { fields: QueryField[]; query: Query; withClear?: boolean } =
    $props();
  // svelte-ignore state_referenced_locally
  let query = $state(initial);
</script>

<FilterChipRow
  {fields}
  {query}
  onremove={(id) => (query = { ...query, conditions: query.conditions.filter((c) => c.id !== id) })}
  onclear={withClear ? () => (query = { ...query, conditions: [] }) : undefined}
/>
