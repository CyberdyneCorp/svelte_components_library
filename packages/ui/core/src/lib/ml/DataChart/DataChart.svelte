<svelte:options runes={true} />

<script lang="ts">
  import { type Snippet } from "svelte";

  let {
    title,
    description,
    height = "300px",
    children,
    loading = false,
    empty = false,
    emptyMessage = "No data available",
  }: {
    title?: string;
    description?: string;
    height?: string;
    children?: Snippet;
    loading?: boolean;
    empty?: boolean;
    emptyMessage?: string;
  } = $props();
</script>

<div class="cy-chart">
  {#if title || description}
    <div class="cy-chart__header">
      {#if title}
        <h3 class="cy-chart__title">{title}</h3>
      {/if}
      {#if description}
        <p class="cy-chart__desc">{description}</p>
      {/if}
    </div>
  {/if}
  <div class="cy-chart__body" style:height>
    {#if loading}
      <div class="cy-chart__loading">
        <div class="cy-chart__skeleton">
          <div class="cy-chart__skeleton-bar" style="height: 60%"></div>
          <div class="cy-chart__skeleton-bar" style="height: 80%"></div>
          <div class="cy-chart__skeleton-bar" style="height: 45%"></div>
          <div class="cy-chart__skeleton-bar" style="height: 90%"></div>
          <div class="cy-chart__skeleton-bar" style="height: 55%"></div>
          <div class="cy-chart__skeleton-bar" style="height: 70%"></div>
        </div>
        <span class="cy-chart__loading-text">Loading...</span>
      </div>
    {:else if empty}
      <div class="cy-chart__empty">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <rect x="4" y="32" width="8" height="12" rx="2" fill="currentColor" opacity="0.08" />
          <rect x="16" y="24" width="8" height="20" rx="2" fill="currentColor" opacity="0.06" />
          <rect x="28" y="28" width="8" height="16" rx="2" fill="currentColor" opacity="0.08" />
          <rect x="40" y="20" width="4" height="24" rx="2" fill="currentColor" opacity="0.06" />
        </svg>
        <span class="cy-chart__empty-text">{emptyMessage}</span>
      </div>
    {:else if children}
      {@render children()}
    {/if}
  </div>
</div>

<style>
  .cy-chart {
    background: var(--color-surface-elevated);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

  .cy-chart__header {
    padding: var(--space-4) var(--space-5) 0;
  }

  .cy-chart__title {
    margin: 0;
    font-family: var(--font-body);
    font-size: 1rem;
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
  }

  .cy-chart__desc {
    margin: var(--space-1) 0 0;
    font-size: 0.8125rem;
    color: var(--color-text-tertiary);
  }

  .cy-chart__body {
    padding: var(--space-4);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cy-chart__loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-3);
    width: 100%;
    height: 100%;
  }

  .cy-chart__skeleton {
    display: flex;
    align-items: flex-end;
    gap: 12px;
    height: 60%;
    width: 60%;
  }

  .cy-chart__skeleton-bar {
    flex: 1;
    border-radius: var(--radius-sm) var(--radius-sm) 0 0;
    background: linear-gradient(
      180deg,
      var(--color-border-subtle) 0%,
      transparent 100%
    );
    animation: cy-chart-pulse 1.5s ease-in-out infinite;
  }

  .cy-chart__skeleton-bar:nth-child(2n) {
    animation-delay: 0.3s;
  }

  .cy-chart__skeleton-bar:nth-child(3n) {
    animation-delay: 0.6s;
  }

  .cy-chart__loading-text {
    font-size: 0.75rem;
    color: var(--color-text-tertiary);
    font-family: var(--font-mono);
  }

  .cy-chart__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-3);
    height: 100%;
  }

  .cy-chart__empty-text {
    font-size: 0.875rem;
    color: var(--color-text-tertiary);
  }

  @keyframes cy-chart-pulse {
    0%, 100% {
      opacity: 0.4;
    }
    50% {
      opacity: 1;
    }
  }
</style>
