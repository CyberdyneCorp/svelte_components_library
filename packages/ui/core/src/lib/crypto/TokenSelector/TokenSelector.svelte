<svelte:options runes={true} />

<script lang="ts">
  interface TokenItem {
    symbol: string;
    name: string;
    balance?: string;
    icon?: string;
    address?: string;
  }

  let {
    tokens = [],
    open = $bindable(false),
    onselect,
    search = $bindable(""),
  }: {
    tokens?: TokenItem[];
    open?: boolean;
    onselect?: (token: TokenItem) => void;
    search?: string;
  } = $props();

  let activeIndex = $state(0);
  let searchInput: HTMLInputElement | undefined = $state();

  let filtered = $derived(
    search.trim() === ""
      ? tokens
      : tokens.filter(
          (t) =>
            t.symbol.toLowerCase().includes(search.toLowerCase()) ||
            t.name.toLowerCase().includes(search.toLowerCase())
        )
  );

  let popular = $derived(tokens.slice(0, 4));

  $effect(() => {
    if (open && searchInput) {
      searchInput.focus();
    }
  });

  $effect(() => {
    // Reset active index when filtered list changes
    filtered;
    activeIndex = 0;
  });

  function handleSelect(token: TokenItem) {
    onselect?.(token);
    open = false;
    search = "";
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      open = false;
      search = "";
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, filtered.length - 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
    } else if (e.key === "Enter" && filtered.length > 0) {
      e.preventDefault();
      handleSelect(filtered[activeIndex]);
    }
  }

  function handleOverlayClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains("cy-token-selector__overlay")) {
      open = false;
      search = "";
    }
  }
</script>

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="cy-token-selector__overlay" onclick={handleOverlayClick}>
    <div class="cy-token-selector" role="dialog" aria-label="Select token">
      <div class="cy-token-selector__header">
        <h3 class="cy-token-selector__title">Select a token</h3>
        <button class="cy-token-selector__close" onclick={() => { open = false; search = ""; }} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <div class="cy-token-selector__search">
        <input
          bind:this={searchInput}
          bind:value={search}
          type="text"
          placeholder="Search by name or symbol"
          class="cy-token-selector__search-input"
          onkeydown={handleKeydown}
        />
      </div>

      {#if search.trim() === "" && popular.length > 0}
        <div class="cy-token-selector__popular">
          <span class="cy-token-selector__popular-label">Popular</span>
          <div class="cy-token-selector__popular-list">
            {#each popular as token}
              <button
                class="cy-token-selector__popular-chip"
                onclick={() => handleSelect(token)}
              >
                {#if token.icon}
                  <span class="cy-token-selector__icon-small">{token.icon}</span>
                {/if}
                {token.symbol}
              </button>
            {/each}
          </div>
        </div>
      {/if}

      <div class="cy-token-selector__list" role="listbox">
        {#if filtered.length === 0}
          <div class="cy-token-selector__empty">
            <span class="cy-token-selector__empty-icon">?</span>
            <span>No tokens found</span>
          </div>
        {:else}
          {#each filtered as token, i}
            <button
              class="cy-token-selector__item"
              class:cy-token-selector__item--active={i === activeIndex}
              role="option"
              aria-selected={i === activeIndex}
              onclick={() => handleSelect(token)}
              onmouseenter={() => { activeIndex = i; }}
            >
              <div class="cy-token-selector__item-icon">
                {#if token.icon}
                  {token.icon}
                {:else}
                  {token.symbol.charAt(0)}
                {/if}
              </div>
              <div class="cy-token-selector__item-info">
                <span class="cy-token-selector__item-symbol">{token.symbol}</span>
                <span class="cy-token-selector__item-name">{token.name}</span>
              </div>
              {#if token.balance}
                <span class="cy-token-selector__item-balance">{token.balance}</span>
              {/if}
            </button>
          {/each}
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .cy-token-selector__overlay {
    position: fixed;
    inset: 0;
    background: var(--color-overlay, rgba(0, 0, 0, 0.6));
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .cy-token-selector {
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg, 12px);
    width: 100%;
    max-width: 420px;
    max-height: 520px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .cy-token-selector__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-4, 1rem) var(--space-5, 1.25rem);
    border-bottom: 1px solid var(--color-border-default);
  }

  .cy-token-selector__title {
    font-size: 1rem;
    font-weight: var(--font-weight-bold, 700);
    color: var(--color-text-primary);
    margin: 0;
  }

  .cy-token-selector__close {
    background: transparent;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    padding: var(--space-1, 0.25rem);
    display: flex;
    align-items: center;
    border-radius: var(--radius-sm, 4px);
    transition: color var(--transition-default, 0.2s ease);
  }

  .cy-token-selector__close:hover {
    color: var(--color-text-primary);
  }

  .cy-token-selector__search {
    padding: var(--space-3, 0.75rem) var(--space-5, 1.25rem);
  }

  .cy-token-selector__search-input {
    width: 100%;
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md, 8px);
    padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
    font-size: 0.875rem;
    color: var(--color-text-primary);
    outline: none;
    transition: border-color var(--transition-default, 0.2s ease);
    box-sizing: border-box;
  }

  .cy-token-selector__search-input::placeholder {
    color: var(--color-text-secondary);
    opacity: 0.6;
  }

  .cy-token-selector__search-input:focus {
    border-color: var(--color-action-brand-default);
  }

  .cy-token-selector__popular {
    padding: 0 var(--space-5, 1.25rem) var(--space-3, 0.75rem);
  }

  .cy-token-selector__popular-label {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-medium, 500);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    display: block;
    margin-bottom: var(--space-2, 0.5rem);
  }

  .cy-token-selector__popular-list {
    display: flex;
    gap: var(--space-2, 0.5rem);
    flex-wrap: wrap;
  }

  .cy-token-selector__popular-chip {
    display: flex;
    align-items: center;
    gap: var(--space-1, 0.25rem);
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-pill, 999px);
    padding: var(--space-1, 0.25rem) var(--space-3, 0.75rem);
    font-size: 0.8125rem;
    font-weight: var(--font-weight-medium, 500);
    color: var(--color-text-primary);
    cursor: pointer;
    transition: border-color var(--transition-default, 0.2s ease);
  }

  .cy-token-selector__popular-chip:hover {
    border-color: var(--color-action-brand-default);
  }

  .cy-token-selector__icon-small {
    font-size: 0.875rem;
  }

  .cy-token-selector__list {
    flex: 1;
    overflow-y: auto;
    border-top: 1px solid var(--color-border-default);
  }

  .cy-token-selector__item {
    display: flex;
    align-items: center;
    gap: var(--space-3, 0.75rem);
    width: 100%;
    padding: var(--space-3, 0.75rem) var(--space-5, 1.25rem);
    background: transparent;
    border: none;
    cursor: pointer;
    text-align: left;
    transition: background var(--transition-default, 0.2s ease);
    color: var(--color-text-primary);
  }

  .cy-token-selector__item:hover,
  .cy-token-selector__item--active {
    background: var(--color-surface-raised);
  }

  .cy-token-selector__item-icon {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-full, 50%);
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border-default);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: var(--font-weight-bold, 700);
    font-size: 0.875rem;
    color: var(--color-action-brand-default);
    flex-shrink: 0;
  }

  .cy-token-selector__item-info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    flex: 1;
    min-width: 0;
  }

  .cy-token-selector__item-symbol {
    font-weight: var(--font-weight-bold, 700);
    font-size: 0.875rem;
    color: var(--color-text-primary);
  }

  .cy-token-selector__item-name {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
  }

  .cy-token-selector__item-balance {
    font-family: var(--font-mono, monospace);
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
    flex-shrink: 0;
  }

  .cy-token-selector__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3, 0.75rem);
    padding: var(--space-8, 2rem) var(--space-5, 1.25rem);
    color: var(--color-text-secondary);
    font-size: 0.875rem;
  }

  .cy-token-selector__empty-icon {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-full, 50%);
    background: var(--color-surface-raised);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
  }
</style>
