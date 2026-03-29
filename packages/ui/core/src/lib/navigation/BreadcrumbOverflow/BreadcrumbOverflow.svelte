<svelte:options runes={true} />

<script lang="ts">
  type BreadcrumbItem = {
    label: string;
    href?: string;
    icon?: string;
  };

  let {
    items = [],
    maxVisible = 4,
    separator = "/",
    onnavigate,
  }: {
    items?: BreadcrumbItem[];
    maxVisible?: number;
    separator?: string;
    onnavigate?: (href: string) => void;
  } = $props();

  let dropdownOpen = $state(false);
  let triggerRef = $state<HTMLButtonElement | null>(null);
  let dropdownRef = $state<HTMLDivElement | null>(null);
  let focusedDropdownIndex = $state(-1);

  let needsOverflow = $derived(items.length > maxVisible);

  let visibleItems = $derived.by(() => {
    if (!needsOverflow) return items;
    const tailCount = maxVisible - 2;
    return [
      items[0],
      ...items.slice(items.length - tailCount),
    ];
  });

  let hiddenItems = $derived.by(() => {
    if (!needsOverflow) return [];
    const tailCount = maxVisible - 2;
    return items.slice(1, items.length - tailCount);
  });

  function handleNavigate(href: string | undefined) {
    if (href) {
      onnavigate?.(href);
    }
    dropdownOpen = false;
  }

  function toggleDropdown() {
    dropdownOpen = !dropdownOpen;
    focusedDropdownIndex = -1;
  }

  function closeDropdown() {
    dropdownOpen = false;
    focusedDropdownIndex = -1;
  }

  function handleDropdownKeydown(e: KeyboardEvent) {
    if (!dropdownOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusedDropdownIndex = Math.min(focusedDropdownIndex + 1, hiddenItems.length - 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusedDropdownIndex = Math.max(focusedDropdownIndex - 1, 0);
    } else if (e.key === "Enter" && focusedDropdownIndex >= 0) {
      e.preventDefault();
      handleNavigate(hiddenItems[focusedDropdownIndex].href);
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeDropdown();
      triggerRef?.focus();
    }
  }

  function handleClickOutside(e: MouseEvent) {
    if (!dropdownOpen) return;
    const target = e.target as Node;
    if (
      triggerRef && !triggerRef.contains(target) &&
      dropdownRef && !dropdownRef.contains(target)
    ) {
      closeDropdown();
    }
  }

  $effect(() => {
    if (dropdownOpen) {
      document.addEventListener("click", handleClickOutside, true);
      return () => document.removeEventListener("click", handleClickOutside, true);
    }
  });

  $effect(() => {
    if (dropdownOpen && dropdownRef && focusedDropdownIndex >= 0) {
      const items = dropdownRef.querySelectorAll<HTMLButtonElement>(".cy-breadcrumb-of__dropdown-item");
      items[focusedDropdownIndex]?.focus();
    }
  });

  function isLast(index: number, total: number): boolean {
    return index === total - 1;
  }
</script>

<nav class="cy-breadcrumb-of" aria-label="Breadcrumb">
  <ol class="cy-breadcrumb-of__list">
    {#if needsOverflow}
      <!-- First item -->
      <li class="cy-breadcrumb-of__item">
        {#if items[0].href}
          <button
            class="cy-breadcrumb-of__link"
            type="button"
            onclick={() => handleNavigate(items[0].href)}
          >
            {items[0].label}
          </button>
        {:else}
          <span class="cy-breadcrumb-of__text">{items[0].label}</span>
        {/if}
        <span class="cy-breadcrumb-of__separator" aria-hidden="true">{separator}</span>
      </li>

      <!-- Overflow trigger -->
      <li class="cy-breadcrumb-of__item cy-breadcrumb-of__overflow-wrapper">
        <button
          bind:this={triggerRef}
          class="cy-breadcrumb-of__ellipsis"
          type="button"
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
          onclick={toggleDropdown}
          onkeydown={handleDropdownKeydown}
        >
          &hellip;
        </button>
        <span class="cy-breadcrumb-of__separator" aria-hidden="true">{separator}</span>

        {#if dropdownOpen}
          <div
            bind:this={dropdownRef}
            class="cy-breadcrumb-of__dropdown"
            role="menu"
            tabindex="-1"
            onkeydown={handleDropdownKeydown}
          >
            {#each hiddenItems as hidden, hi}
              <button
                class="cy-breadcrumb-of__dropdown-item"
                class:cy-breadcrumb-of__dropdown-item--focused={focusedDropdownIndex === hi}
                type="button"
                role="menuitem"
                tabindex={focusedDropdownIndex === hi ? 0 : -1}
                onclick={() => handleNavigate(hidden.href)}
              >
                {hidden.label}
              </button>
            {/each}
          </div>
        {/if}
      </li>

      <!-- Tail visible items -->
      {#each visibleItems.slice(1) as item, i}
        {@const last = isLast(i, visibleItems.length - 1)}
        <li class="cy-breadcrumb-of__item">
          {#if !last && item.href}
            <button
              class="cy-breadcrumb-of__link"
              type="button"
              onclick={() => handleNavigate(item.href)}
            >
              {item.label}
            </button>
          {:else}
            <span
              class="cy-breadcrumb-of__text"
              class:cy-breadcrumb-of__text--current={last}
              aria-current={last ? "page" : undefined}
            >
              {item.label}
            </span>
          {/if}
          {#if !last}
            <span class="cy-breadcrumb-of__separator" aria-hidden="true">{separator}</span>
          {/if}
        </li>
      {/each}
    {:else}
      <!-- No overflow: render all items normally -->
      {#each items as item, i}
        {@const last = isLast(i, items.length)}
        <li class="cy-breadcrumb-of__item">
          {#if !last && item.href}
            <button
              class="cy-breadcrumb-of__link"
              type="button"
              onclick={() => handleNavigate(item.href)}
            >
              {item.label}
            </button>
          {:else}
            <span
              class="cy-breadcrumb-of__text"
              class:cy-breadcrumb-of__text--current={last}
              aria-current={last ? "page" : undefined}
            >
              {item.label}
            </span>
          {/if}
          {#if !last}
            <span class="cy-breadcrumb-of__separator" aria-hidden="true">{separator}</span>
          {/if}
        </li>
      {/each}
    {/if}
  </ol>
</nav>

<style>
  .cy-breadcrumb-of {
    --cy-bg: var(--breadcrumb-overflow-bg, transparent);
    --cy-text: var(--breadcrumb-overflow-text, var(--color-text-tertiary));
    --cy-text-active: var(--breadcrumb-overflow-text-active, var(--color-text-primary));
    --cy-accent: var(--breadcrumb-overflow-accent, var(--color-action-brand-default));
    --cy-dropdown-bg: var(--breadcrumb-overflow-dropdown-bg, var(--color-surface-default));
    --cy-dropdown-border: var(--breadcrumb-overflow-dropdown-border, var(--color-border-subtle));
    --cy-dropdown-hover: var(--breadcrumb-overflow-dropdown-hover, var(--color-bg-primary));
    --cy-separator: var(--breadcrumb-overflow-separator, var(--color-text-tertiary));

    font-family: var(--font-body, "Inter", system-ui, sans-serif);
    font-size: 0.875rem;
  }

  .cy-breadcrumb-of__list {
    display: flex;
    align-items: center;
    gap: var(--space-1, 6px);
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .cy-breadcrumb-of__item {
    display: flex;
    align-items: center;
    gap: var(--space-1, 6px);
    min-width: 0;
  }

  .cy-breadcrumb-of__overflow-wrapper {
    position: relative;
  }

  .cy-breadcrumb-of__link {
    background: none;
    border: none;
    padding: 2px 4px;
    margin: 0;
    font: inherit;
    color: var(--cy-text);
    cursor: pointer;
    text-decoration: none;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 160px;
    border-radius: 4px;
    transition: color var(--transition-fast, 0.15s ease);
  }

  .cy-breadcrumb-of__link:hover {
    color: var(--cy-accent);
  }

  .cy-breadcrumb-of__link:focus-visible {
    outline: 2px solid var(--cy-accent);
    outline-offset: 2px;
  }

  .cy-breadcrumb-of__text {
    color: var(--cy-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 160px;
    padding: 2px 4px;
  }

  .cy-breadcrumb-of__text--current {
    color: var(--cy-text-active);
    font-weight: var(--font-weight-medium, 500);
  }

  .cy-breadcrumb-of__separator {
    color: var(--cy-separator);
    flex-shrink: 0;
    user-select: none;
  }

  .cy-breadcrumb-of__ellipsis {
    background: none;
    border: 1px solid var(--cy-dropdown-border);
    border-radius: 4px;
    padding: 2px 8px;
    margin: 0;
    font: inherit;
    font-weight: 700;
    color: var(--cy-text);
    cursor: pointer;
    letter-spacing: 0.1em;
    transition: color var(--transition-fast, 0.15s ease),
      border-color var(--transition-fast, 0.15s ease);
  }

  .cy-breadcrumb-of__ellipsis:hover {
    color: var(--cy-accent);
    border-color: var(--cy-accent);
  }

  .cy-breadcrumb-of__ellipsis:focus-visible {
    outline: 2px solid var(--cy-accent);
    outline-offset: 2px;
  }

  .cy-breadcrumb-of__dropdown {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    min-width: 180px;
    background: var(--cy-dropdown-bg);
    border: 1px solid var(--cy-dropdown-border);
    border-radius: 8px;
    padding: 4px;
    z-index: 100;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
  }

  .cy-breadcrumb-of__dropdown-item {
    background: none;
    border: none;
    padding: 8px 12px;
    margin: 0;
    font: inherit;
    font-size: 0.85rem;
    color: var(--cy-text);
    cursor: pointer;
    text-align: left;
    border-radius: 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: background var(--transition-fast, 0.15s ease),
      color var(--transition-fast, 0.15s ease);
  }

  .cy-breadcrumb-of__dropdown-item:hover,
  .cy-breadcrumb-of__dropdown-item--focused {
    background: var(--cy-dropdown-hover);
    color: var(--cy-accent);
  }

  .cy-breadcrumb-of__dropdown-item:focus-visible {
    outline: 2px solid var(--cy-accent);
    outline-offset: -2px;
  }
</style>
