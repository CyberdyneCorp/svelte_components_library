<svelte:options runes={true} />

<script lang="ts">
  let {
    currentPage = $bindable(1),
    totalPages = 1,
    onchange,
  }: {
    currentPage: number;
    totalPages?: number;
    onchange?: (page: number) => void;
  } = $props();

  function goTo(page: number) {
    if (page < 1 || page > totalPages || page === currentPage) return;
    currentPage = page;
    onchange?.(page);
  }

  let visiblePages = $derived.by(() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  });
</script>

<nav class="cy-pagination" aria-label="Pagination">
  <button
    class="cy-pagination__btn cy-pagination__btn--nav"
    disabled={currentPage <= 1}
    onclick={() => goTo(currentPage - 1)}
    aria-label="Previous page"
  >
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M10 4L6 8L10 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>

  {#each visiblePages as page}
    {#if page === "..."}
      <span class="cy-pagination__ellipsis">...</span>
    {:else}
      <button
        class="cy-pagination__btn"
        class:cy-pagination__btn--active={page === currentPage}
        onclick={() => goTo(page)}
        aria-label="Page {page}"
        aria-current={page === currentPage ? "page" : undefined}
      >
        {page}
      </button>
    {/if}
  {/each}

  <button
    class="cy-pagination__btn cy-pagination__btn--nav"
    disabled={currentPage >= totalPages}
    onclick={() => goTo(currentPage + 1)}
    aria-label="Next page"
  >
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M6 4L10 8L6 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>
</nav>

<style>
  .cy-pagination {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    font-family: var(--font-body);
  }

  .cy-pagination__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 32px;
    padding: 0 var(--space-2);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--color-text-secondary);
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .cy-pagination__btn:hover:not(:disabled) {
    background: var(--color-surface-hover);
    color: var(--color-text-primary);
    border-color: var(--color-border-default);
  }

  .cy-pagination__btn--active {
    background: var(--color-action-brand-default);
    color: var(--color-action-brand-text);
    border-color: var(--color-action-brand-default);
  }

  .cy-pagination__btn--active:hover:not(:disabled) {
    background: var(--color-action-brand-hover);
    color: var(--color-action-brand-text);
    border-color: var(--color-action-brand-hover);
  }

  .cy-pagination__btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .cy-pagination__btn--nav {
    border-color: transparent;
  }

  .cy-pagination__ellipsis {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    color: var(--color-text-tertiary);
    font-family: var(--font-mono);
    font-size: 0.8125rem;
  }
</style>
