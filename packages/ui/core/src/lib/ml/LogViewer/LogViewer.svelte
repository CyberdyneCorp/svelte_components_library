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
          <span class="cy-log__count">{logs.filter((l) => opt === "all" || l.level === opt).length}</span>
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
    background: var(--color-surface-elevated, #12121a);
    border: 1px solid var(--color-border-default, rgba(255, 255, 255, 0.08));
    border-radius: var(--radius-lg, 12px);
    overflow: hidden;
    font-family: var(--font-mono, "JetBrains Mono", monospace);
    font-size: 0.8125rem;
  }

  .cy-log__filters {
    display: flex;
    gap: var(--space-1, 4px);
    padding: var(--space-2, 8px) var(--space-4, 16px);
    border-bottom: 1px solid var(--color-border-default, rgba(255, 255, 255, 0.08));
    background: rgba(255, 255, 255, 0.02);
  }

  .cy-log__filter {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1, 4px);
    padding: var(--space-1, 4px) var(--space-2, 8px);
    border: 1px solid transparent;
    border-radius: var(--radius-sm, 6px);
    background: transparent;
    color: var(--color-text-muted, rgba(255, 255, 255, 0.5));
    font-family: var(--font-body, inherit);
    font-size: 0.75rem;
    cursor: pointer;
    text-transform: capitalize;
    transition: all var(--transition-default, 150ms ease);
  }

  .cy-log__filter:hover {
    background: rgba(255, 255, 255, 0.05);
    color: var(--color-text-default, rgba(255, 255, 255, 0.87));
  }

  .cy-log__filter--active {
    background: rgba(0, 255, 65, 0.1);
    color: var(--color-brand, #00ff41);
    border-color: rgba(0, 255, 65, 0.2);
  }

  .cy-log__count {
    background: rgba(255, 255, 255, 0.08);
    padding: 0 6px;
    border-radius: 9999px;
    font-size: 0.6875rem;
  }

  .cy-log__body {
    overflow-y: auto;
    padding: var(--space-2, 8px) 0;
  }

  .cy-log__line {
    display: flex;
    align-items: baseline;
    gap: var(--space-2, 8px);
    padding: var(--space-1, 4px) var(--space-4, 16px);
    line-height: 1.6;
  }

  .cy-log__line:hover {
    background: rgba(255, 255, 255, 0.02);
  }

  .cy-log__ts {
    color: rgba(255, 255, 255, 0.3);
    white-space: nowrap;
    flex-shrink: 0;
    font-size: 0.75rem;
  }

  .cy-log__badge {
    display: inline-block;
    padding: 0 6px;
    border-radius: var(--radius-sm, 6px);
    font-size: 0.625rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .cy-log__badge--debug {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.5);
  }

  .cy-log__badge--info {
    background: rgba(0, 212, 255, 0.12);
    color: #00d4ff;
  }

  .cy-log__badge--warn {
    background: rgba(255, 189, 46, 0.12);
    color: #ffbd2e;
  }

  .cy-log__badge--error {
    background: rgba(255, 68, 68, 0.12);
    color: #ff4444;
  }

  .cy-log__msg {
    color: var(--color-text-default, rgba(255, 255, 255, 0.87));
    flex: 1;
    word-break: break-word;
  }

  .cy-log__src {
    color: rgba(255, 255, 255, 0.25);
    font-size: 0.75rem;
    white-space: nowrap;
    flex-shrink: 0;
  }
</style>
