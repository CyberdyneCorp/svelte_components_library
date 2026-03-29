<svelte:options runes={true} />

<script lang="ts">
  type Column = {
    key: string;
    label: string;
    sortable?: boolean;
    width?: string;
    resizable?: boolean;
  };

  let {
    columns = [],
    rows = [],
    selectable = false,
    selectedRows = $bindable([]),
    expandable = false,
    expandedRows = $bindable([]),
    rowKey = "id",
    pageSize = 0,
    currentPage = $bindable(1),
    striped = false,
    stickyHeader = true,
    maxHeight = "",
    onrowclick,
    onsort,
    renderExpanded,
  }: {
    columns?: Column[];
    rows?: Array<Record<string, any>>;
    selectable?: boolean;
    selectedRows?: string[];
    expandable?: boolean;
    expandedRows?: string[];
    rowKey?: string;
    pageSize?: number;
    currentPage?: number;
    striped?: boolean;
    stickyHeader?: boolean;
    maxHeight?: string;
    onrowclick?: (row: Record<string, any>) => void;
    onsort?: (key: string, direction: "asc" | "desc") => void;
    renderExpanded?: (row: Record<string, any>) => string;
  } = $props();

  let sortKey = $state<string | null>(null);
  let sortDir = $state<"asc" | "desc">("asc");
  let columnWidths = $state<Record<string, number>>({});
  let resizing = $state<string | null>(null);
  let resizeStartX = $state(0);
  let resizeStartWidth = $state(0);

  function toggleSort(key: string) {
    if (sortKey === key) {
      sortDir = sortDir === "asc" ? "desc" : "asc";
    } else {
      sortKey = key;
      sortDir = "asc";
    }
    onsort?.(key, sortDir);
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

  let totalPages = $derived(pageSize > 0 ? Math.ceil(sortedRows.length / pageSize) : 1);

  let paginatedRows = $derived.by(() => {
    if (pageSize <= 0) return sortedRows;
    const start = (currentPage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  });

  let showingStart = $derived(pageSize > 0 ? (currentPage - 1) * pageSize + 1 : 1);
  let showingEnd = $derived(pageSize > 0 ? Math.min(currentPage * pageSize, sortedRows.length) : sortedRows.length);

  let allSelected = $derived(
    paginatedRows.length > 0 && paginatedRows.every((r) => selectedRows.includes(String(r[rowKey])))
  );

  function toggleSelectAll() {
    const pageIds = paginatedRows.map((r) => String(r[rowKey]));
    if (allSelected) {
      selectedRows = selectedRows.filter((id) => !pageIds.includes(id));
    } else {
      const newIds = pageIds.filter((id) => !selectedRows.includes(id));
      selectedRows = [...selectedRows, ...newIds];
    }
  }

  function toggleSelectRow(id: string) {
    if (selectedRows.includes(id)) {
      selectedRows = selectedRows.filter((r) => r !== id);
    } else {
      selectedRows = [...selectedRows, id];
    }
  }

  function toggleExpandRow(id: string) {
    if (expandedRows.includes(id)) {
      expandedRows = expandedRows.filter((r) => r !== id);
    } else {
      expandedRows = [...expandedRows, id];
    }
  }

  function startResize(e: MouseEvent, colKey: string) {
    e.preventDefault();
    e.stopPropagation();
    resizing = colKey;
    resizeStartX = e.clientX;
    const th = (e.target as HTMLElement).closest("th");
    resizeStartWidth = th ? th.offsetWidth : 150;

    function onMouseMove(ev: MouseEvent) {
      if (!resizing) return;
      const diff = ev.clientX - resizeStartX;
      const newWidth = Math.max(60, resizeStartWidth + diff);
      columnWidths = { ...columnWidths, [resizing]: newWidth };
    }

    function onMouseUp() {
      resizing = null;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  let totalCols = $derived(
    columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0)
  );
</script>

<div class="cy-datatable" style:--max-height={maxHeight || "none"}>
  {#if selectable && selectedRows.length > 0}
    <div class="cy-datatable__selection-bar">
      {selectedRows.length} selected
    </div>
  {/if}

  <div class="cy-datatable__wrapper" class:cy-datatable__wrapper--scroll={!!maxHeight}>
    <table class="cy-datatable__table" class:cy-datatable__table--striped={striped}>
      <thead class:cy-datatable__thead--sticky={stickyHeader}>
        <tr>
          {#if selectable}
            <th class="cy-datatable__th cy-datatable__th--checkbox">
              <input
                type="checkbox"
                checked={allSelected}
                onchange={toggleSelectAll}
                class="cy-datatable__checkbox"
              />
            </th>
          {/if}
          {#if expandable}
            <th class="cy-datatable__th cy-datatable__th--expand"></th>
          {/if}
          {#each columns as col}
            <th
              class="cy-datatable__th"
              style:width={columnWidths[col.key] ? `${columnWidths[col.key]}px` : col.width || "auto"}
            >
              <div class="cy-datatable__th-content">
                {#if col.sortable}
                  <button class="cy-datatable__sort-btn" aria-label="Sort by {col.label}" onclick={() => toggleSort(col.key)}>
                    {col.label}
                    <span class="cy-datatable__sort-icon" class:cy-datatable__sort-icon--active={sortKey === col.key}>
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
                {#if col.resizable}
                  <div
                    class="cy-datatable__resize-handle"
                    role="separator"
                    onmousedown={(e) => startResize(e, col.key)}
                  ></div>
                {/if}
              </div>
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#if paginatedRows.length === 0}
          <tr>
            <td class="cy-datatable__empty" colspan={totalCols}>
              <div class="cy-datatable__empty-content">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <rect x="4" y="8" width="32" height="24" rx="2" stroke="currentColor" stroke-width="2"/>
                  <line x1="4" y1="16" x2="36" y2="16" stroke="currentColor" stroke-width="2"/>
                  <line x1="16" y1="16" x2="16" y2="32" stroke="currentColor" stroke-width="1.5"/>
                </svg>
                <span>No data available</span>
              </div>
            </td>
          </tr>
        {:else}
          {#each paginatedRows as row}
            {@const rid = String(row[rowKey])}
            <tr
              class="cy-datatable__row"
              class:cy-datatable__row--selected={selectedRows.includes(rid)}
              onclick={() => onrowclick?.(row)}
            >
              {#if selectable}
                <td class="cy-datatable__td cy-datatable__td--checkbox" onclick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(rid)}
                    onchange={() => toggleSelectRow(rid)}
                    class="cy-datatable__checkbox"
                  />
                </td>
              {/if}
              {#if expandable}
                <td class="cy-datatable__td cy-datatable__td--expand" onclick={(e) => { e.stopPropagation(); toggleExpandRow(rid); }}>
                  <button class="cy-datatable__expand-btn" aria-label="Expand row" class:cy-datatable__expand-btn--open={expandedRows.includes(rid)}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M6 4L10 8L6 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </td>
              {/if}
              {#each columns as col}
                <td class="cy-datatable__td">{row[col.key] ?? ""}</td>
              {/each}
            </tr>
            {#if expandable && expandedRows.includes(rid)}
              <tr class="cy-datatable__expanded-row">
                <td colspan={totalCols} class="cy-datatable__expanded-cell">
                  {renderExpanded ? renderExpanded(row) : "No expanded content"}
                </td>
              </tr>
            {/if}
          {/each}
        {/if}
      </tbody>
    </table>
  </div>

  {#if pageSize > 0 && sortedRows.length > 0}
    <div class="cy-datatable__footer">
      <span class="cy-datatable__info">
        Showing {showingStart}-{showingEnd} of {sortedRows.length}
      </span>
      <div class="cy-datatable__pagination">
        <button
          class="cy-datatable__page-btn"
          aria-label="Previous page"
          disabled={currentPage <= 1}
          onclick={() => { currentPage = currentPage - 1; }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 4L6 8L10 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        {#each Array.from({ length: totalPages }, (_, i) => i + 1) as page}
          <button
            class="cy-datatable__page-btn"
            class:cy-datatable__page-btn--active={page === currentPage}
            onclick={() => { currentPage = page; }}
          >
            {page}
          </button>
        {/each}
        <button
          class="cy-datatable__page-btn"
          aria-label="Next page"
          disabled={currentPage >= totalPages}
          onclick={() => { currentPage = currentPage + 1; }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M6 4L10 8L6 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .cy-datatable {
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-default);
    border-radius: 12px;
    overflow: hidden;
    font-family: var(--font-body, "Inter", system-ui, sans-serif);
    font-size: 0.875rem;
  }

  .cy-datatable__selection-bar {
    padding: 8px 16px;
    background: var(--color-state-success-bg);
    color: var(--color-action-brand-default);
    font-size: 0.8rem;
    font-weight: 600;
    border-bottom: 1px solid var(--color-border-default);
  }

  .cy-datatable__wrapper {
    overflow-x: auto;
  }

  .cy-datatable__wrapper--scroll {
    max-height: var(--max-height);
    overflow-y: auto;
  }

  .cy-datatable__table {
    width: 100%;
    border-collapse: collapse;
  }

  .cy-datatable__thead--sticky {
    position: sticky;
    top: 0;
    z-index: 2;
  }

  .cy-datatable__th {
    text-align: left;
    padding: 12px 16px;
    background: var(--color-bg-primary);
    color: var(--color-text-secondary);
    font-weight: 600;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid var(--color-border-default);
    white-space: nowrap;
    position: relative;
  }

  .cy-datatable__th--checkbox,
  .cy-datatable__td--checkbox {
    width: 44px;
    text-align: center;
    padding: 12px 8px;
  }

  .cy-datatable__th--expand,
  .cy-datatable__td--expand {
    width: 40px;
    text-align: center;
    padding: 12px 8px;
  }

  .cy-datatable__th-content {
    display: flex;
    align-items: center;
    position: relative;
  }

  .cy-datatable__resize-handle {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    cursor: col-resize;
    background: transparent;
    transition: background 0.15s;
  }

  .cy-datatable__resize-handle:hover {
    background: var(--color-action-secondary-default);
  }

  .cy-datatable__td {
    padding: 10px 16px;
    color: var(--color-text-primary);
    border-bottom: 1px solid var(--color-border-default);
  }

  .cy-datatable__row {
    background: var(--color-surface-default);
    transition: background 0.12s ease;
    cursor: default;
  }

  .cy-datatable__row:hover {
    background: var(--color-surface-hover);
  }

  .cy-datatable__row--selected {
    background: var(--color-state-success-bg) !important;
  }

  .cy-datatable__table--striped .cy-datatable__row:nth-child(even) {
    background: var(--color-surface-raised);
  }

  .cy-datatable__table--striped .cy-datatable__row:nth-child(even):hover {
    background: var(--color-surface-hover);
  }

  .cy-datatable__checkbox {
    appearance: none;
    width: 16px;
    height: 16px;
    border: 2px solid var(--color-border-default);
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
    position: relative;
    transition: all 0.15s ease;
  }

  .cy-datatable__checkbox:checked {
    background: var(--color-action-brand-default);
    border-color: var(--color-action-brand-default);
  }

  .cy-datatable__checkbox:checked::after {
    content: "";
    position: absolute;
    left: 4px;
    top: 1px;
    width: 4px;
    height: 8px;
    border: solid var(--color-bg-primary);
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  .cy-datatable__expand-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.15s ease;
  }

  .cy-datatable__expand-btn:hover {
    color: var(--color-action-secondary-default);
    background: var(--color-state-info-bg);
  }

  .cy-datatable__expand-btn--open {
    transform: rotate(90deg);
    color: var(--color-action-brand-default);
  }

  .cy-datatable__expanded-row {
    background: var(--color-state-success-bg);
  }

  .cy-datatable__expanded-cell {
    padding: 16px 16px 16px 60px;
    color: var(--color-text-secondary);
    font-size: 0.8rem;
    border-bottom: 1px solid var(--color-border-default);
    line-height: 1.5;
  }

  .cy-datatable__sort-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: none;
    border: none;
    color: inherit;
    font: inherit;
    font-weight: 600;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    cursor: pointer;
    padding: 0;
  }

  .cy-datatable__sort-btn:hover {
    color: var(--color-text-primary);
  }

  .cy-datatable__sort-icon {
    display: flex;
    color: var(--color-text-disabled);
  }

  .cy-datatable__sort-icon--active {
    color: var(--color-action-brand-default);
  }

  .cy-datatable__empty {
    padding: 0;
  }

  .cy-datatable__empty-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 48px 16px;
    color: var(--color-text-disabled);
    font-size: 0.85rem;
  }

  .cy-datatable__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-top: 1px solid var(--color-border-default);
    background: var(--color-bg-primary);
  }

  .cy-datatable__info {
    font-size: 0.8rem;
    color: var(--color-text-secondary);
  }

  .cy-datatable__pagination {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .cy-datatable__page-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 32px;
    padding: 0 8px;
    background: transparent;
    border: 1px solid var(--color-border-default);
    border-radius: 6px;
    color: var(--color-text-secondary);
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .cy-datatable__page-btn:hover:not(:disabled) {
    border-color: var(--color-action-secondary-default);
    color: var(--color-action-secondary-default);
  }

  .cy-datatable__page-btn--active {
    background: var(--color-action-brand-default) !important;
    border-color: var(--color-action-brand-default) !important;
    color: var(--color-bg-primary) !important;
    font-weight: 700;
  }

  .cy-datatable__page-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
</style>
