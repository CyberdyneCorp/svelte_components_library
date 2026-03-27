<svelte:options runes={true} />

<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    title = "Something went wrong",
    description = "",
    error = "",
    showStack = false,
    stack = "",
    onretry,
    children,
  }: {
    title?: string;
    description?: string;
    error?: string;
    showStack?: boolean;
    stack?: string;
    onretry?: () => void;
    children?: Snippet;
  } = $props();

  let stackExpanded = $state(false);
</script>

{#if error}
  <div class="cy-error-boundary">
    <div class="cy-error-boundary__icon">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M16 4L2 28h28L16 4z" stroke="#ff4444" stroke-width="2" fill="rgba(255,68,68,0.1)"/>
        <path d="M16 13v7" stroke="#ff4444" stroke-width="2" stroke-linecap="round"/>
        <circle cx="16" cy="24" r="1.5" fill="#ff4444"/>
      </svg>
    </div>

    <h3 class="cy-error-boundary__title">{title}</h3>

    {#if description}
      <p class="cy-error-boundary__description">{description}</p>
    {/if}

    <div class="cy-error-boundary__error-msg">
      <code>{error}</code>
    </div>

    {#if showStack && stack}
      <div class="cy-error-boundary__stack-section">
        <button
          class="cy-error-boundary__stack-toggle"
          onclick={() => stackExpanded = !stackExpanded}
        >
          <svg
            width="12" height="12" viewBox="0 0 12 12"
            style="transform: rotate({stackExpanded ? '90deg' : '0deg'}); transition: transform 200ms ease;"
          >
            <path d="M4 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
          </svg>
          Stack Trace
        </button>

        {#if stackExpanded}
          <pre class="cy-error-boundary__stack"><code>{stack}</code></pre>
        {/if}
      </div>
    {/if}

    {#if onretry}
      <button class="cy-error-boundary__retry" onclick={onretry}>
        Try Again
      </button>
    {/if}
  </div>
{:else if children}
  {@render children()}
{/if}

<style>
  .cy-error-boundary {
    background: linear-gradient(135deg, rgba(255, 68, 68, 0.06), rgba(255, 68, 68, 0.02));
    border: 1px solid rgba(255, 68, 68, 0.25);
    border-radius: var(--radius-md, 8px);
    padding: var(--space-6, 24px);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3, 12px);
    text-align: center;
  }

  .cy-error-boundary__icon {
    margin-bottom: var(--space-1, 4px);
  }

  .cy-error-boundary__title {
    font-family: var(--font-display, sans-serif);
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-text-primary, #e0e0e0);
    margin: 0;
  }

  .cy-error-boundary__description {
    font-family: var(--font-body, sans-serif);
    font-size: 0.875rem;
    color: var(--color-text-secondary, #888);
    margin: 0;
    max-width: 480px;
    line-height: 1.5;
  }

  .cy-error-boundary__error-msg {
    background: rgba(255, 68, 68, 0.08);
    border: 1px solid rgba(255, 68, 68, 0.15);
    border-radius: var(--radius-sm, 4px);
    padding: var(--space-2, 8px) var(--space-3, 12px);
    width: 100%;
    max-width: 560px;
  }

  .cy-error-boundary__error-msg code {
    font-family: var(--font-mono, monospace);
    font-size: 0.8125rem;
    color: #ff6b6b;
    word-break: break-all;
  }

  .cy-error-boundary__stack-section {
    width: 100%;
    max-width: 560px;
  }

  .cy-error-boundary__stack-toggle {
    display: flex;
    align-items: center;
    gap: var(--space-2, 8px);
    background: none;
    border: none;
    color: var(--color-text-secondary, #888);
    font-family: var(--font-mono, monospace);
    font-size: 0.75rem;
    cursor: pointer;
    padding: var(--space-1, 4px) 0;
    transition: color 200ms ease;
  }

  .cy-error-boundary__stack-toggle:hover {
    color: var(--color-text-primary, #e0e0e0);
  }

  .cy-error-boundary__stack {
    background: var(--color-bg-primary, #0a0a0f);
    border: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.08));
    border-radius: var(--radius-sm, 4px);
    padding: var(--space-3, 12px);
    margin: var(--space-2, 8px) 0 0 0;
    overflow-x: auto;
    max-height: 200px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 68, 68, 0.3) transparent;
  }

  .cy-error-boundary__stack code {
    font-family: var(--font-mono, monospace);
    font-size: 0.6875rem;
    color: var(--color-text-secondary, #888);
    white-space: pre;
    line-height: 1.6;
  }

  .cy-error-boundary__retry {
    margin-top: var(--space-2, 8px);
    background: rgba(255, 68, 68, 0.12);
    border: 1px solid rgba(255, 68, 68, 0.3);
    border-radius: var(--radius-sm, 4px);
    color: #ff6b6b;
    font-family: var(--font-mono, monospace);
    font-size: 0.8125rem;
    font-weight: 600;
    padding: var(--space-2, 8px) var(--space-4, 16px);
    cursor: pointer;
    transition: all 200ms ease;
  }

  .cy-error-boundary__retry:hover {
    background: rgba(255, 68, 68, 0.2);
    box-shadow: 0 0 12px rgba(255, 68, 68, 0.2);
  }
</style>
