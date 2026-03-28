<svelte:options runes={true} />

<script lang="ts">
  let {
    content = "",
    typing = false,
    variant = "default",
  }: {
    content?: string;
    typing?: boolean;
    variant?: "default" | "surface";
  } = $props();

  let formattedContent = $derived(
    content.replace(/`([^`]+)`/g, '<code class="cy-bot-answer__code">$1</code>')
  );
</script>

<div class="cy-bot-answer cy-bot-answer--{variant}">
  {#if typing}
    <div class="cy-bot-answer__typing">
      <span class="cy-bot-answer__dot"></span>
      <span class="cy-bot-answer__dot"></span>
      <span class="cy-bot-answer__dot"></span>
    </div>
  {:else}
    <div class="cy-bot-answer__content">
      {@html formattedContent}
    </div>
  {/if}
</div>

<style>
  .cy-bot-answer {
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-lg);
    line-height: 1.6;
  }

  .cy-bot-answer--default {
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-default);
  }

  .cy-bot-answer--surface {
    background: var(--color-surface-raised);
    border: 1px solid transparent;
  }

  .cy-bot-answer__content {
    font-family: var(--font-body);
    font-size: 0.875rem;
    color: var(--color-text-primary);
    white-space: pre-wrap;
    word-break: break-word;
  }

  .cy-bot-answer__content :global(.cy-bot-answer__code) {
    font-family: var(--font-mono, monospace);
    font-size: 0.8125rem;
    background: var(--color-state-success-bg);
    color: var(--color-action-brand-default);
    padding: 0.125em 0.375em;
    border-radius: var(--radius-xs);
  }

  .cy-bot-answer__typing {
    display: flex;
    gap: 4px;
    padding: var(--space-1) 0;
  }

  .cy-bot-answer__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-text-tertiary);
    animation: cy-typing 1.4s infinite;
  }

  .cy-bot-answer__dot:nth-child(2) {
    animation-delay: 0.2s;
  }

  .cy-bot-answer__dot:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes cy-typing {
    0%, 60%, 100% {
      opacity: 0.3;
      transform: scale(1);
    }
    30% {
      opacity: 1;
      transform: scale(1.2);
    }
  }
</style>
