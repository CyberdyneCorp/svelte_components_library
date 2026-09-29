<svelte:options runes={true} />

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { TableCellContext, TableColumn, TableRow, TableRowAttributes } from "./types.js";

  let {
    columns = [],
    rows = [],
    striped = false,
    /** Table caption (`<caption>`), which also names the table. */
    caption,
    /** Keep the caption for assistive technology but hide it visually. */
    captionHidden = false,
    /** Column key whose cells render as row headers (`<th scope="row">`). */
    rowHeader,
    /** Extra `<tr>` attributes per row (`data-*`, `aria-current`, `class`, ...). */
    rowAttributes,
    /**
     * Cell render override for every column without its own `cell`. Receives
     * `{ row, column, rowIndex }` (display order, after sorting).
     */
    cell,
  }: {
    columns?: TableColumn[];
    rows?: TableRow[];
    striped?: boolean;
    caption?: string;
    captionHidden?: boolean;
    rowHeader?: string;
    rowAttributes?: (row: TableRow, rowIndex: number) => TableRowAttributes;
    cell?: Snippet<[TableCellContext]>;
  } = $props();

  // String join, not a class array: arrays need Svelte 5.16 and the peer range is ^5.0.0.
  function rowClass(attrs: TableRowAttributes): string {
    return attrs.class ? `cy-table__row ${attrs.class}` : "cy-table__row";
  }

  let sortKey = $state<string | null>(null);
  let sortDir = $state<"asc" | "desc">("asc");

  function toggleSort(key: string) {
    if (sortKey === key) {
      sortDir = sortDir === "asc" ? "desc" : "asc";
    } else {
      sortKey = key;
      sortDir = "asc";
    }
  }

  let sortedRows = $derived.by(() => {
    if (!sortKey) return rows;
    return [...rows].sort((a, b) => {
      const av = a[sortKey!];
      const bv = b[sortKey!];
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  });
</script>

{#snippet cellContent(row: TableRow, col: TableColumn, rowIndex: number)}
  {#if col.cell}
    {@render col.cell(row)}
  {:else if cell}
    {@render cell({ row, column: col, rowIndex })}
  {:else}
    {row[col.key] ?? ""}
  {/if}
{/snippet}

<div class="cy-table-wrapper">
  <table class="cy-table" class:cy-table--striped={striped}>
    {#if caption}
      <caption class="cy-table__caption" class:cy-table__caption--hidden={captionHidden}>
        {caption}
      </caption>
    {/if}
    <thead>
      <tr>
        {#each columns as col}
          <th class="cy-table__th" style={col.width ? `width: ${col.width}` : undefined}>
            {#if col.sortable}
              <button class="cy-table__sort-btn" onclick={() => toggleSort(col.key)}>
                {col.label}
                <span class="cy-table__sort-icon" class:cy-table__sort-icon--active={sortKey === col.key}>
                  {#if sortKey === col.key && sortDir === "desc"}
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                      <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  {:else}
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                      <path d="M4 10L8 6L12 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  {/if}
                </span>
              </button>
            {:else}
              {col.label}
            {/if}
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each sortedRows as row, i (i)}
        {@const attrs = rowAttributes?.(row, i) ?? {}}
        <tr {...attrs} class={rowClass(attrs)}>
          {#each columns as col (col.key)}
            {#if col.key === rowHeader}
              <th class="cy-table__td cy-table__row-header" scope="row">
                {@render cellContent(row, col, i)}
              </th>
            {:else}
              <td class="cy-table__td">
                {@render cellContent(row, col, i)}
              </td>
            {/if}
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .cy-table-wrapper {
    overflow-x: auto;
    border: var(--border-width) var(--border-style) var(--table-border);
    border-radius: var(--radius-md);
  }

  .cy-table {
    width: 100%;
    border-collapse: collapse;
    font-family: var(--font-body);
    font-size: 0.875rem;
  }

  .cy-table__caption {
    padding: var(--space-3) var(--space-4);
    text-align: left;
    color: var(--color-text-primary);
    font-weight: var(--font-weight-semibold);
  }

  /* Visually hidden, still read as the table's name. */
  .cy-table__caption--hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .cy-table__th {
    text-align: left;
    padding: var(--space-3) var(--space-4);
    background: var(--gradient-surface), var(--table-header-bg);
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-semibold);
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: var(--border-width) var(--border-style) var(--table-border);
    white-space: nowrap;
  }

  .cy-table__td {
    padding: var(--space-3) var(--space-4);
    color: var(--color-text-primary);
    border-bottom: var(--border-width) var(--border-style) var(--table-border);
  }

  .cy-table__row-header {
    text-align: left;
    font-weight: var(--font-weight-semibold);
  }

  .cy-table__row {
    background: var(--table-row-bg);
    transition: background var(--transition-fast);
  }

  .cy-table__row:hover {
    background: var(--table-row-hover);
  }

  .cy-table--striped .cy-table__row:nth-child(even) {
    background: var(--color-bg-tertiary);
  }

  .cy-table--striped .cy-table__row:nth-child(even):hover {
    background: var(--table-row-hover);
  }

  .cy-table__sort-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    background: none;
    border: none;
    color: inherit;
    font: inherit;
    font-weight: var(--font-weight-semibold);
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    cursor: pointer;
    padding: 0;
  }

  .cy-table__sort-btn:hover {
    color: var(--color-text-primary);
  }

  .cy-table__sort-icon {
    display: flex;
    color: var(--color-text-tertiary);
  }

  .cy-table__sort-icon--active {
    color: var(--color-action-brand-default);
  }
</style>
