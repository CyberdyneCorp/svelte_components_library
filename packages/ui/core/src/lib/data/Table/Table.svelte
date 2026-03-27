<svelte:options runes={true} />

<script lang="ts">
  type Column = {
    key: string;
    label: string;
    sortable?: boolean;
  };

  let {
    columns = [],
    rows = [],
    striped = false,
  }: {
    columns?: Column[];
    rows?: Array<Record<string, any>>;
    striped?: boolean;
  } = $props();

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

<div class="cy-table-wrapper">
  <table class="cy-table" class:cy-table--striped={striped}>
    <thead>
      <tr>
        {#each columns as col}
          <th class="cy-table__th">
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
      {#each sortedRows as row, i}
        <tr class="cy-table__row">
          {#each columns as col}
            <td class="cy-table__td">{row[col.key] ?? ""}</td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .cy-table-wrapper {
    overflow-x: auto;
    border: 1px solid var(--table-border);
    border-radius: var(--radius-md);
  }

  .cy-table {
    width: 100%;
    border-collapse: collapse;
    font-family: var(--font-body);
    font-size: 0.875rem;
  }

  .cy-table__th {
    text-align: left;
    padding: var(--space-3) var(--space-4);
    background: var(--table-header-bg);
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-semibold);
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid var(--table-border);
    white-space: nowrap;
  }

  .cy-table__td {
    padding: var(--space-3) var(--space-4);
    color: var(--color-text-primary);
    border-bottom: 1px solid var(--table-border);
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
