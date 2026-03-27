<svelte:options runes={true} />

<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    children,
    loading = false,
    hasMore = true,
    threshold = 200,
    onloadmore,
    loadingText = "Loading...",
  }: {
    children: Snippet;
    loading?: boolean;
    hasMore?: boolean;
    threshold?: number;
    onloadmore?: () => void;
    loadingText?: string;
  } = $props();

  let sentinelEl: HTMLDivElement | undefined = $state();
  let observer: IntersectionObserver | undefined;

  $effect(() => {
    if (!sentinelEl) return;

    observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore && !loading && onloadmore) {
          onloadmore();
        }
      },
      {
        rootMargin: `0px 0px ${threshold}px 0px`,
      }
    );

    observer.observe(sentinelEl);

    return () => {
      observer?.disconnect();
    };
  });
</script>

<div class="cy-infinite-scroll">
  <div class="cy-infinite-scroll__content">
    {@render children()}
  </div>

  {#if hasMore}
    <div class="cy-infinite-scroll__sentinel" bind:this={sentinelEl}></div>
  {/if}

  {#if loading}
    <div class="cy-infinite-scroll__loading">
      <div class="cy-infinite-scroll__spinner"></div>
      <span class="cy-infinite-scroll__loading-text">{loadingText}</span>
    </div>
  {/if}

  {#if !hasMore && !loading}
    <div class="cy-infinite-scroll__end">
      <span class="cy-infinite-scroll__end-text">No more items</span>
    </div>
  {/if}
</div>

<style>
  .cy-infinite-scroll {
    width: 100%;
  }

  .cy-infinite-scroll__content {
    width: 100%;
  }

  .cy-infinite-scroll__sentinel {
    height: 1px;
    width: 100%;
  }

  .cy-infinite-scroll__loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-3, 12px);
    padding: var(--space-4, 16px);
  }

  .cy-infinite-scroll__spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(0, 255, 65, 0.2);
    border-top-color: var(--color-action-brand-default, #00ff41);
    border-radius: 50%;
    animation: cy-spin 0.8s linear infinite;
  }

  @keyframes cy-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .cy-infinite-scroll__loading-text {
    color: var(--color-text-secondary, #888);
    font-family: var(--font-mono, monospace);
    font-size: 0.875rem;
  }

  .cy-infinite-scroll__end {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-4, 16px);
  }

  .cy-infinite-scroll__end-text {
    color: var(--color-text-tertiary, #555);
    font-family: var(--font-mono, monospace);
    font-size: 0.8125rem;
    opacity: 0.7;
  }
</style>
