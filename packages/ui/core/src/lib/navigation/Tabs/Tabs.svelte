<svelte:options runes={true} />

<script lang="ts">
  import type { TabItem } from "./types.js";

  let {
    items = [],
    activeId = $bindable(""),
    /** Accessible name of the tablist, or of the `<nav>` landmark in link mode. */
    ariaLabel,
    onchange,
  }: {
    items?: TabItem[];
    activeId: string;
    ariaLabel?: string;
    /** Button tabs only. In link mode navigation is left to the links. */
    onchange?: (id: string) => void;
  } = $props();

  // Links navigate between pages, so they are a navigation landmark rather
  // than an ARIA tab widget (which switches panels in place).
  const linkMode = $derived(items.some((item) => item.href !== undefined));

  function selectTab(id: string) {
    activeId = id;
    onchange?.(id);
  }

  function handleKeydown(e: KeyboardEvent, index: number) {
    let nextIndex = index;
    if (e.key === "ArrowRight") {
      nextIndex = (index + 1) % items.length;
    } else if (e.key === "ArrowLeft") {
      nextIndex = (index - 1 + items.length) % items.length;
    } else {
      return;
    }
    e.preventDefault();
    selectTab(items[nextIndex].id);
    const btn = (e.currentTarget as HTMLElement)
      .parentElement?.children[nextIndex] as HTMLElement;
    btn?.focus();
  }
</script>

{#if linkMode}
  <nav class="cy-tabs-nav" aria-label={ariaLabel}>
    <ul class="cy-tabs cy-tabs--links">
      {#each items as item (item.id)}
        <li class="cy-tabs__item">
          <a
            class="cy-tabs__tab"
            class:cy-tabs__tab--active={activeId === item.id}
            href={item.href}
            aria-current={activeId === item.id ? "page" : undefined}
          >
            {item.label}
          </a>
        </li>
      {/each}
    </ul>
  </nav>
{:else}
  <div class="cy-tabs" role="tablist" aria-label={ariaLabel}>
    {#each items as item, i}
      <button
        class="cy-tabs__tab"
        class:cy-tabs__tab--active={activeId === item.id}
        role="tab"
        aria-selected={activeId === item.id}
        tabindex={activeId === item.id ? 0 : -1}
        onclick={() => selectTab(item.id)}
        onkeydown={(e) => handleKeydown(e, i)}
      >
        {item.label}
      </button>
    {/each}
  </div>
{/if}

<style>
  .cy-tabs {
    display: flex;
    gap: 0;
    border-bottom: var(--border-width) var(--border-style) var(--color-border-subtle);
    font-family: var(--font-body);
  }

  .cy-tabs--links {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .cy-tabs__item {
    display: flex;
  }

  .cy-tabs__tab {
    position: relative;
    padding: var(--space-3) var(--space-4);
    background: transparent;
    border: none;
    border-bottom: var(--border-width-strong) var(--border-style) transparent;
    color: var(--color-text-tertiary);
    font-family: var(--font-body);
    font-size: 0.875rem;
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    transition: all var(--transition-default);
    white-space: nowrap;
    text-decoration: none;
  }

  .cy-tabs__tab:hover {
    color: var(--color-text-secondary);
    background: var(--color-surface-hover);
  }

  .cy-tabs__tab--active {
    color: var(--color-action-brand-default);
    border-bottom-color: var(--color-action-brand-default);
  }

  /* Decorative --gradient-accent strip sitting on the brand underline. It never
     paints under the label (the gradient is not contrast-checked against text),
     and the brand underline beneath carries the active-state contrast. */
  .cy-tabs__tab--active::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: var(--border-width-strong);
    background: var(--gradient-accent);
    pointer-events: none;
  }

  .cy-tabs__tab--active:hover {
    color: var(--color-action-brand-default);
  }

  .cy-tabs__tab:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: -2px;
  }
</style>
