<svelte:options runes={true} />

<script lang="ts">
  type SearchResult = {
    id: string;
    title: string;
    snippet: string;
    score: number;
    tags?: string[];
    source?: string;
  };

  let {
    results = [],
    query = "",
    loading = false,
    emptyMessage = "No results found",
    onresultclick,
  }: {
    results?: SearchResult[];
    query?: string;
    loading?: boolean;
    emptyMessage?: string;
    onresultclick?: (id: string) => void;
  } = $props();

  function handleClick(id: string) {
    onresultclick?.(id);
  }

  function scorePercent(score: number): string {
    return `${Math.round(score * 100)}%`;
  }
</script>

<div class="cy-semantic-search">
  {#if query}
    <div class="cy-semantic-search__query">
      Results for: <span class="cy-semantic-search__query-text">{query}</span>
    </div>
  {/if}

  {#if loading}
    <div class="cy-semantic-search__loading">
      {#each Array(4) as _}
        <div class="cy-semantic-search__skeleton">
          <div class="cy-semantic-search__skeleton-title"></div>
          <div class="cy-semantic-search__skeleton-snippet"></div>
          <div class="cy-semantic-search__skeleton-snippet cy-semantic-search__skeleton-snippet--short"></div>
          <div class="cy-semantic-search__skeleton-meta"></div>
        </div>
      {/each}
    </div>
  {:else if results.length === 0}
    <div class="cy-semantic-search__empty">
      <svg class="cy-semantic-search__empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <span>{emptyMessage}</span>
    </div>
  {:else}
    <ul class="cy-semantic-search__results">
      {#each results as result (result.id)}
        <li class="cy-semantic-search__item">
          <button
            class="cy-semantic-search__item-btn"
            onclick={() => handleClick(result.id)}
            type="button"
          >
            <div class="cy-semantic-search__item-header">
              <h3 class="cy-semantic-search__title">{result.title}</h3>
              <span class="cy-semantic-search__score">{scorePercent(result.score)}</span>
            </div>
            <div class="cy-semantic-search__score-bar">
              <div
                class="cy-semantic-search__score-fill"
                style="width: {result.score * 100}%"
              ></div>
            </div>
            <p class="cy-semantic-search__snippet">{result.snippet}</p>
            <div class="cy-semantic-search__meta">
              {#if result.tags && result.tags.length > 0}
                <div class="cy-semantic-search__tags">
                  {#each result.tags as tag}
                    <span class="cy-semantic-search__tag">{tag}</span>
                  {/each}
                </div>
              {/if}
              {#if result.source}
                <span class="cy-semantic-search__source">{result.source}</span>
              {/if}
            </div>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .cy-semantic-search {
    font-family: var(--font-body);
    color: var(--color-text-primary);
  }

  .cy-semantic-search__query {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    margin-bottom: var(--space-4);
    font-family: var(--font-body);
  }

  .cy-semantic-search__query-text {
    color: var(--color-action-brand-default);
    font-family: var(--font-mono);
  }

  .cy-semantic-search__results {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .cy-semantic-search__item {
    list-style: none;
  }

  .cy-semantic-search__item-btn {
    display: block;
    width: 100%;
    text-align: left;
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    padding: var(--space-4);
    cursor: pointer;
    transition: border-color 200ms ease, box-shadow 200ms ease;
    color: inherit;
    font: inherit;
  }

  .cy-semantic-search__item-btn:hover {
    border-color: var(--color-action-brand-default);
    box-shadow: var(--shadow-glow-green);
  }

  .cy-semantic-search__item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-2);
  }

  .cy-semantic-search__title {
    font-family: var(--font-display);
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
  }

  .cy-semantic-search__score {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--color-action-brand-default);
    flex-shrink: 0;
    margin-left: var(--space-3);
  }

  .cy-semantic-search__score-bar {
    height: 3px;
    background: var(--color-bg-tertiary);
    border-radius: var(--radius-pill);
    overflow: hidden;
    margin-bottom: var(--space-3);
  }

  .cy-semantic-search__score-fill {
    height: 100%;
    background: var(--color-action-brand-default);
    border-radius: var(--radius-pill);
    box-shadow: var(--shadow-glow-green);
    transition: width 300ms ease;
  }

  .cy-semantic-search__snippet {
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
    line-height: 1.5;
    margin: 0 0 var(--space-3) 0;
    font-family: var(--font-body);
  }

  .cy-semantic-search__meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  .cy-semantic-search__tags {
    display: flex;
    gap: var(--space-1);
    flex-wrap: wrap;
  }

  .cy-semantic-search__tag {
    font-size: 0.6875rem;
    padding: 2px 8px;
    border-radius: var(--radius-pill);
    background: var(--color-bg-tertiary);
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border-subtle);
    font-family: var(--font-mono);
  }

  .cy-semantic-search__source {
    font-size: 0.6875rem;
    color: var(--color-text-tertiary);
    font-family: var(--font-caption, var(--font-body));
    font-style: italic;
  }

  /* Loading skeleton */
  .cy-semantic-search__loading {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .cy-semantic-search__skeleton {
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    padding: var(--space-4);
  }

  .cy-semantic-search__skeleton-title,
  .cy-semantic-search__skeleton-snippet,
  .cy-semantic-search__skeleton-meta {
    background: var(--color-bg-tertiary);
    border-radius: var(--radius-sm);
    animation: cy-pulse 1.5s ease-in-out infinite;
  }

  .cy-semantic-search__skeleton-title {
    height: 16px;
    width: 60%;
    margin-bottom: var(--space-3);
  }

  .cy-semantic-search__skeleton-snippet {
    height: 12px;
    width: 100%;
    margin-bottom: var(--space-2);
  }

  .cy-semantic-search__skeleton-snippet--short {
    width: 75%;
  }

  .cy-semantic-search__skeleton-meta {
    height: 10px;
    width: 40%;
    margin-top: var(--space-2);
  }

  @keyframes cy-pulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.8; }
  }

  /* Empty state */
  .cy-semantic-search__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-8) var(--space-4);
    color: var(--color-text-tertiary);
    font-size: 0.875rem;
  }

  .cy-semantic-search__empty-icon {
    width: 48px;
    height: 48px;
    opacity: 0.4;
  }
</style>
