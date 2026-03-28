<svelte:options runes={true} />

<script lang="ts">
  type TimelineItem = {
    title: string;
    description?: string;
    timestamp: string;
    icon?: string;
    variant?: "default" | "success" | "warning" | "error";
  };

  let {
    items = [],
  }: {
    items?: TimelineItem[];
  } = $props();
</script>

<div class="cy-timeline">
  {#each items as item, i}
    <div class="cy-timeline__item" class:cy-timeline__item--alt={i % 2 === 1}>
      <div class="cy-timeline__rail">
        <div class="cy-timeline__marker cy-timeline__marker--{item.variant ?? 'default'}">
          {#if item.icon}
            <span class="cy-timeline__icon">{item.icon}</span>
          {/if}
        </div>
        {#if i < items.length - 1}
          <div class="cy-timeline__line"></div>
        {/if}
      </div>
      <div class="cy-timeline__content">
        <div class="cy-timeline__header">
          <span class="cy-timeline__title">{item.title}</span>
          <span class="cy-timeline__ts">{item.timestamp}</span>
        </div>
        {#if item.description}
          <p class="cy-timeline__desc">{item.description}</p>
        {/if}
      </div>
    </div>
  {/each}
</div>

<style>
  .cy-timeline {
    display: flex;
    flex-direction: column;
    font-family: var(--font-body, inherit);
  }

  .cy-timeline__item {
    display: flex;
    position: relative;
  }

  .cy-timeline__item--alt .cy-timeline__content {
    background: var(--color-surface-default);
  }

  .cy-timeline__rail {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
    width: 40px;
  }

  .cy-timeline__marker {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 4px;
    position: relative;
    z-index: 1;
  }

  .cy-timeline__marker--default {
    background: var(--color-action-secondary-default);
    box-shadow: var(--shadow-glow-cyan);
  }

  .cy-timeline__marker--success {
    background: var(--color-action-brand-default);
    box-shadow: var(--shadow-glow-green);
  }

  .cy-timeline__marker--warning {
    background: var(--color-state-warning);
    box-shadow: var(--shadow-glow-green);
  }

  .cy-timeline__marker--error {
    background: var(--color-state-error);
    box-shadow: var(--shadow-glow-green);
  }

  .cy-timeline__icon {
    font-size: 0.5rem;
    line-height: 1;
  }

  .cy-timeline__line {
    width: 2px;
    flex: 1;
    background: var(--color-border-subtle);
    min-height: 24px;
  }

  .cy-timeline__content {
    flex: 1;
    padding: 0 var(--space-4, 16px) var(--space-6, 24px) var(--space-3, 12px);
    border-radius: var(--radius-md, 8px);
  }

  .cy-timeline__header {
    display: flex;
    align-items: baseline;
    gap: var(--space-3, 12px);
    margin-bottom: var(--space-1, 4px);
  }

  .cy-timeline__title {
    font-size: 0.875rem;
    font-weight: var(--font-weight-medium, 500);
    color: var(--color-text-primary);
  }

  .cy-timeline__ts {
    font-size: 0.75rem;
    color: var(--color-text-tertiary);
    font-family: var(--font-mono, "JetBrains Mono", monospace);
    white-space: nowrap;
  }

  .cy-timeline__desc {
    margin: 0;
    font-size: 0.8125rem;
    color: var(--color-text-tertiary);
    line-height: 1.5;
  }
</style>
