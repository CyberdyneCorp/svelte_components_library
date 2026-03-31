<svelte:options runes={true} />

<script lang="ts">
  import { tick } from "svelte";

  type LogEntry = {
    timestamp: string;
    level: "debug" | "info" | "warn" | "error";
    message: string;
    source?: string;
  };

  type FilterLevel = "all" | "debug" | "info" | "warn" | "error";

  let {
    logs = [],
    showTimestamp = true,
    showLevel = true,
    filter = $bindable<FilterLevel>("all"),
    autoScroll = true,
    maxHeight = "500px",
  }: {
    logs?: LogEntry[];
    showTimestamp?: boolean;
    showLevel?: boolean;
    filter?: FilterLevel;
    autoScroll?: boolean;
    maxHeight?: string;
  } = $props();

  let scrollContainer: HTMLDivElement | undefined = $state();

  const filteredLogs = $derived(
    filter === "all" ? logs : logs.filter((l) => l.level === filter)
  );

  const filterOptions: FilterLevel[] = ["all", "debug", "info", "warn", "error"];

  $effect(() => {
    // Track filteredLogs length to trigger auto-scroll
    filteredLogs.length;
    if (autoScroll && scrollContainer) {
      tick().then(() => {
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
      });
    }
  });
</script>

<div class="cy-log">
  <div class="cy-log__filters">
    {#each filterOptions as opt}
      <button
        class="cy-log__filter"
        class:cy-log__filter--active={filter === opt}
        onclick={() => (filter = opt)}
      >
        {opt}
        {#if opt !== "all"}
          <span class="cy-log__count">{logs.filter((l) => l.level === opt).length}</span>
        {/if}
      </button>
    {/each}
  </div>
  <div class="cy-log__body" style:max-height={maxHeight} bind:this={scrollContainer}>
    {#each filteredLogs as log}
      <div class="cy-log__line">
        {#if showTimestamp}
          <span class="cy-log__ts">{log.timestamp}</span>
        {/if}
        {#if showLevel}
          <span class="cy-log__badge cy-log__badge--{log.level}">{log.level.toUpperCase()}</span>
        {/if}
        <span class="cy-log__msg">{log.message}</span>
        {#if log.source}
          <span class="cy-log__src">{log.source}</span>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .cy-log {
    background: var(--color-surface-elevated);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg);
    overflow: hidden;
    font-family: var(--font-mono);
    font-size: 0.8125rem;
  }

  .cy-log__filters {
    display: flex;
    gap: var(--space-1);
    padding: var(--space-2) var(--space-4);
    border-bottom: 1px solid var(--color-border-default);
    background: var(--color-surface-hover);
  }

  .cy-log__filter {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-1) var(--space-2);
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--color-text-tertiary);
    font-family: var(--font-body);
    font-size: 0.75rem;
    cursor: pointer;
    text-transform: capitalize;
    transition: all var(--transition-default);
  }

  .cy-log__filter:hover {
    background: var(--color-surface-hover);
    color: var(--color-text-primary);
  }

  .cy-log__filter--active {
    background: var(--color-state-success-bg);
    color: var(--color-action-brand-default);
    border-color: var(--color-action-brand-border);
  }

  .cy-log__count {
    background: var(--color-surface-hover);
    padding: 0 6px;
    border-radius: 9999px;
    font-size: 0.6875rem;
  }

  .cy-log__body {
    overflow-y: auto;
    padding: var(--space-2) 0;
  }

  .cy-log__line {
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
    padding: var(--space-1) var(--space-4);
    line-height: 1.6;
  }

  .cy-log__line:hover {
    background: var(--color-surface-default);
  }

  .cy-log__ts {
    color: var(--color-text-tertiary);
    white-space: nowrap;
    flex-shrink: 0;
    font-size: 0.75rem;
  }

  .cy-log__badge {
    display: inline-block;
    padding: 0 6px;
    border-radius: var(--radius-sm);
    font-size: 0.625rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .cy-log__badge--debug {
    background: var(--color-surface-hover);
    color: var(--color-text-tertiary);
  }

  .cy-log__badge--info {
    background: var(--color-action-secondary-bg);
    color: var(--color-action-secondary-default);
  }

  .cy-log__badge--warn {
    background: var(--color-state-warning-bg);
    color: var(--color-state-warning);
  }

  .cy-log__badge--error {
    background: var(--color-state-error-bg);
    color: var(--color-state-error);
  }

  .cy-log__msg {
    color: var(--color-text-primary);
    flex: 1;
    word-break: break-word;
  }

  .cy-log__src {
    color: var(--color-text-tertiary);
    font-size: 0.75rem;
    white-space: nowrap;
    flex-shrink: 0;
  }
</style>
