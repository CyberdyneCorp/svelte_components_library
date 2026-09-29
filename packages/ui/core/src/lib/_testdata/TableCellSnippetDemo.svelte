<svelte:options runes={true} />

<script lang="ts">
  // Table with a real (reactive) cell snippet, for tests that re-render rows.
  import Table from "../data/Table/Table.svelte";
  import type { TableColumn, TableRow } from "../data/Table/types.js";

  let { columns, rows }: { columns: TableColumn[]; rows: TableRow[] } = $props();
</script>

<Table {columns} {rows}>
  {#snippet cell({ row, column, rowIndex })}
    <span data-testid="cell">{rowIndex}:{column.key}:{row[column.key]}</span>
  {/snippet}
</Table>
