<svelte:options runes={true} />

<script lang="ts">
  type TerminalLine = {
    text: string;
    type?: "stdout" | "stderr" | "info" | "command";
  };

  let {
    lines = [],
    title = "Terminal",
    showHeader = true,
    maxHeight = "400px",
  }: {
    lines?: TerminalLine[];
    title?: string;
    showHeader?: boolean;
    maxHeight?: string;
  } = $props();
</script>

<div class="cy-term">
  {#if showHeader}
    <div class="cy-term__header">
      <div class="cy-term__dots">
        <span class="cy-term__dot cy-term__dot--red"></span>
        <span class="cy-term__dot cy-term__dot--amber"></span>
        <span class="cy-term__dot cy-term__dot--green"></span>
      </div>
      <span class="cy-term__title">{title}</span>
      <div class="cy-term__spacer"></div>
    </div>
  {/if}
  <div class="cy-term__body" style:max-height={maxHeight}>
    {#each lines as line}
      <div class="cy-term__line cy-term__line--{line.type ?? 'stdout'}">
        {#if line.type === "command"}<span class="cy-term__prompt">$ </span>{/if}{line.text}
      </div>
    {/each}
  </div>
</div>

<style>
  .cy-term {
    background: var(--color-bg-primary, #0a0a0f);
    border: 1px solid var(--color-border-default, rgba(255, 255, 255, 0.08));
    border-radius: var(--radius-lg, 12px);
    overflow: hidden;
    font-family: var(--font-mono, "JetBrains Mono", monospace);
    font-size: 0.8125rem;
  }

  .cy-term__header {
    display: flex;
    align-items: center;
    padding: var(--space-2, 8px) var(--space-4, 16px);
    background: rgba(255, 255, 255, 0.03);
    border-bottom: 1px solid var(--color-border-default, rgba(255, 255, 255, 0.08));
  }

  .cy-term__dots {
    display: flex;
    gap: 6px;
  }

  .cy-term__dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

  .cy-term__dot--red {
    background: #ff5f56;
  }

  .cy-term__dot--amber {
    background: #ffbd2e;
  }

  .cy-term__dot--green {
    background: #27c93f;
  }

  .cy-term__title {
    flex: 1;
    text-align: center;
    color: var(--color-text-muted, rgba(255, 255, 255, 0.5));
    font-size: 0.75rem;
  }

  .cy-term__spacer {
    width: 54px;
  }

  .cy-term__body {
    padding: var(--space-4, 16px);
    overflow-y: auto;
  }

  .cy-term__line {
    line-height: 1.7;
    white-space: pre-wrap;
    word-break: break-all;
  }

  .cy-term__line--stdout {
    color: var(--color-text-default, rgba(255, 255, 255, 0.87));
  }

  .cy-term__line--stderr {
    color: #ff4444;
  }

  .cy-term__line--info {
    color: var(--color-secondary, #00d4ff);
  }

  .cy-term__line--command {
    color: var(--color-brand, #00ff41);
  }

  .cy-term__prompt {
    color: var(--color-brand, #00ff41);
    user-select: none;
  }
</style>
