<svelte:options runes={true} />

<script lang="ts">
  type SearchResult = {
    id: string;
    label: string;
    description?: string;
    icon?: string;
    group?: string;
  };

  let {
    value = $bindable(""),
    placeholder = "Search...",
    results = [],
    loading = false,
    showResults: showResultsProp,
    debounce = 300,
    onquery,
    onselect,
    oninput,
    disabled = false,
  }: {
    value?: string;
    placeholder?: string;
    results?: SearchResult[];
    loading?: boolean;
    showResults?: boolean;
    debounce?: number;
    onquery?: (query: string) => void;
    onselect?: (result: { id: string; label: string }) => void;
    oninput?: (e: Event) => void;
    disabled?: boolean;
  } = $props();

  let activeIndex = $state(-1);
  let dropdownOpen = $state(false);
  let containerEl: HTMLDivElement;
  let debounceTimer: ReturnType<typeof setTimeout>;

  let shouldShowResults = $derived(
    showResultsProp !== undefined
      ? showResultsProp
      : (results.length > 0 || loading || (value.length > 0 && results.length === 0)) && dropdownOpen
  );

  let groupedResults = $derived.by(() => {
    const groups = new Map<string, SearchResult[]>();
    for (const r of results) {
      const key = r.group || "";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(r);
    }
    return groups;
  });

  let flatResults = $derived(results);

  function handleInput(e: Event) {
    const input = e.target as HTMLInputElement;
    value = input.value;
    activeIndex = -1;
    dropdownOpen = true;

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      onquery?.(value);
    }, debounce);
  }

  function clearValue() {
    value = "";
    activeIndex = -1;
    dropdownOpen = false;
    onquery?.("");
  }

  function selectResult(result: SearchResult) {
    value = result.label;
    dropdownOpen = false;
    activeIndex = -1;
    onselect?.({ id: result.id, label: result.label });
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!shouldShowResults) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, flatResults.length - 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, -1);
    } else if (e.key === "Enter" && activeIndex >= 0 && activeIndex < flatResults.length) {
      e.preventDefault();
      selectResult(flatResults[activeIndex]);
    } else if (e.key === "Escape") {
      dropdownOpen = false;
      activeIndex = -1;
    }
  }

  function handleFocus() {
    if (value.length > 0) {
      dropdownOpen = true;
    }
  }

  function handleClickOutside(e: MouseEvent) {
    if (containerEl && !containerEl.contains(e.target as Node)) {
      dropdownOpen = false;
      activeIndex = -1;
    }
  }

  function escapeHtml(text: string): string {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function highlightMatch(text: string, query: string): string {
    if (!query || query.length === 0) return escapeHtml(text);
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");
    return escapeHtml(text).replace(regex, '<mark class="cy-search__highlight">$1</mark>');
  }

  $effect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  });
</script>

<div class="cy-search" class:cy-search--disabled={disabled} bind:this={containerEl}>
  <div class="cy-search__input-wrapper">
    <svg class="cy-search__icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5"/>
      <path d="M11 11l3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>

    <input
      class="cy-search__input"
      type="text"
      {placeholder}
      {value}
      {disabled}
      oninput={handleInput}
      onkeydown={handleKeydown}
      onfocus={handleFocus}
      role="combobox"
      aria-controls="listbox-id"
      aria-expanded={shouldShowResults}
      aria-autocomplete="list"
      autocomplete="off"
    />

    {#if value.length > 0}
      <button
        class="cy-search__clear"
        onclick={clearValue}
        type="button"
        aria-label="Clear search"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    {/if}
  </div>

  {#if shouldShowResults}
    <div class="cy-search__dropdown" role="listbox">
      {#if loading}
        <div class="cy-search__loading">
          <span class="cy-search__spinner"></span>
          <span>Searching...</span>
        </div>
      {:else if results.length === 0 && value.length > 0}
        <div class="cy-search__empty">No results for "{value}"</div>
      {:else}
        {#each [...groupedResults] as [group, items]}
          {#if group}
            <div class="cy-search__group-header">{group}</div>
          {/if}
          {#each items as result, i}
            {@const flatIndex = flatResults.indexOf(result)}
            <button
              class="cy-search__result"
              class:cy-search__result--active={flatIndex === activeIndex}
              onclick={() => selectResult(result)}
              onmouseenter={() => { activeIndex = flatIndex; }}
              type="button"
              role="option"
              aria-selected={flatIndex === activeIndex}
            >
              {#if result.icon}
                <span class="cy-search__result-icon">{result.icon}</span>
              {/if}
              <div class="cy-search__result-text">
                <span class="cy-search__result-label">{@html highlightMatch(result.label, value)}</span>
                {#if result.description}
                  <span class="cy-search__result-desc">{result.description}</span>
                {/if}
              </div>
            </button>
          {/each}
        {/each}
      {/if}
    </div>
  {/if}
</div>

<style>
  .cy-search {
    position: relative;
    width: 100%;
  }

  .cy-search--disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .cy-search__input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .cy-search__icon {
    position: absolute;
    left: 12px;
    color: var(--color-text-tertiary);
    pointer-events: none;
    z-index: 1;
  }

  .cy-search__input {
    width: 100%;
    font-family: var(--font-body);
    font-size: 0.875rem;
    color: var(--input-text);
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: var(--radius-md);
    padding: 10px 40px 10px 36px;
    outline: none;
    transition: all 0.15s ease;
  }

  .cy-search__input::placeholder {
    color: var(--input-placeholder);
  }

  .cy-search__input:hover:not(:disabled) {
    background: var(--input-bg-hover);
  }

  .cy-search__input:focus {
    border-color: var(--input-border-focus);
    box-shadow: var(--shadow-glow-cyan);
  }

  .cy-search__clear {
    position: absolute;
    right: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    color: var(--color-text-tertiary);
    cursor: pointer;
    border-radius: 4px;
    transition: color 0.15s ease, background 0.15s ease;
    padding: 0;
  }

  .cy-search__clear:hover {
    color: var(--color-text-primary);
    background: var(--color-surface-hover);
  }

  .cy-search__dropdown {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    z-index: 100;
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-default);
    border-radius: 8px;
    padding: 6px;
    max-height: 320px;
    overflow-y: auto;
    box-shadow: var(--shadow-lg);
  }

  .cy-search__loading {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 12px;
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    color: var(--color-action-secondary-default);
  }

  .cy-search__spinner {
    width: 16px;
    height: 16px;
    border: 2px solid var(--color-action-secondary-bg);
    border-top-color: var(--color-action-secondary-default);
    border-radius: 50%;
    animation: cy-search-spin 0.8s linear infinite;
  }

  @keyframes cy-search-spin {
    to { transform: rotate(360deg); }
  }

  .cy-search__empty {
    padding: 14px 12px;
    font-family: var(--font-body);
    font-size: 0.8125rem;
    color: var(--color-text-tertiary);
    text-align: center;
  }

  .cy-search__group-header {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    font-weight: 600;
    color: var(--color-action-brand-default);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 8px 10px 4px;
  }

  .cy-search__result {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    width: 100%;
    padding: 8px 10px;
    border: none;
    background: transparent;
    border-radius: 6px;
    cursor: pointer;
    text-align: left;
    transition: background 0.1s ease;
  }

  .cy-search__result:hover,
  .cy-search__result--active {
    background: var(--color-surface-hover);
  }

  .cy-search__result--active {
    outline: 1px solid var(--color-action-secondary-border);
  }

  .cy-search__result-icon {
    font-size: 1rem;
    line-height: 1;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .cy-search__result-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .cy-search__result-label {
    font-family: var(--font-body);
    font-size: 0.875rem;
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .cy-search__result-desc {
    font-family: var(--font-body);
    font-size: 0.75rem;
    color: var(--color-text-tertiary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .cy-search :global(.cy-search__highlight) {
    background: var(--color-state-success-bg);
    color: var(--color-action-brand-default);
    border-radius: 2px;
    padding: 0 1px;
  }

  .cy-search__dropdown::-webkit-scrollbar {
    width: 6px;
  }

  .cy-search__dropdown::-webkit-scrollbar-track {
    background: transparent;
  }

  .cy-search__dropdown::-webkit-scrollbar-thumb {
    background: var(--color-border-default);
    border-radius: 3px;
  }
</style>
