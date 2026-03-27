<svelte:options runes={true} />

<script lang="ts">
  let {
    items = [],
    multiple = false,
    defaultOpen = [],
  }: {
    items: Array<{ id: string; title: string; content: string }>;
    multiple?: boolean;
    defaultOpen?: string[];
  } = $props();

  let openItems: Set<string> = $state(new Set(defaultOpen));

  function toggle(id: string) {
    if (openItems.has(id)) {
      openItems.delete(id);
      openItems = new Set(openItems);
    } else {
      if (multiple) {
        openItems.add(id);
        openItems = new Set(openItems);
      } else {
        openItems = new Set([id]);
      }
    }
  }
</script>

<div class="cy-accordion" role="region">
  {#each items as item (item.id)}
    {@const isOpen = openItems.has(item.id)}
    <div class="cy-accordion__item" class:cy-accordion__item--open={isOpen}>
      <button
        class="cy-accordion__trigger"
        aria-expanded={isOpen}
        aria-controls="accordion-panel-{item.id}"
        id="accordion-header-{item.id}"
        onclick={() => toggle(item.id)}
      >
        <span class="cy-accordion__title">{item.title}</span>
        <svg
          class="cy-accordion__chevron"
          class:cy-accordion__chevron--open={isOpen}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div
        class="cy-accordion__panel"
        class:cy-accordion__panel--open={isOpen}
        id="accordion-panel-{item.id}"
        role="region"
        aria-labelledby="accordion-header-{item.id}"
      >
        <div class="cy-accordion__content">
          {item.content}
        </div>
      </div>
    </div>
  {/each}
</div>

<style>
  .cy-accordion {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

  .cy-accordion__item {
    border-bottom: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.06));
  }

  .cy-accordion__item:last-child {
    border-bottom: none;
  }

  .cy-accordion__item--open {
    border-left: 2px solid #00ff41;
  }

  .cy-accordion__trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: var(--space-4) var(--space-5);
    background: var(--color-surface-default, #12121a);
    border: none;
    color: var(--color-text-primary);
    font-family: var(--font-body);
    font-size: 0.9375rem;
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    transition: background var(--transition-fast);
    text-align: left;
  }

  .cy-accordion__trigger:hover {
    background: var(--color-surface-hover);
  }

  .cy-accordion__trigger:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: -2px;
  }

  .cy-accordion__title {
    flex: 1;
  }

  .cy-accordion__chevron {
    color: var(--color-text-tertiary);
    transition: transform var(--transition-default);
    flex-shrink: 0;
  }

  .cy-accordion__chevron--open {
    transform: rotate(180deg);
    color: #00ff41;
  }

  .cy-accordion__panel {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 300ms ease;
  }

  .cy-accordion__panel--open {
    grid-template-rows: 1fr;
  }

  .cy-accordion__content {
    overflow: hidden;
    padding: 0 var(--space-5);
    font-family: var(--font-body);
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    line-height: 1.6;
  }

  .cy-accordion__panel--open .cy-accordion__content {
    padding: 0 var(--space-5) var(--space-4);
  }
</style>
