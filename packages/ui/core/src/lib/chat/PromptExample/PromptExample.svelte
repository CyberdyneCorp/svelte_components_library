<svelte:options runes={true} />

<script lang="ts">
  let {
    title = "",
    description = "",
    onclick,
  }: {
    title?: string;
    description?: string;
    onclick?: () => void;
  } = $props();
</script>

<button class="cy-prompt-example" type="button" {onclick}>
  <span class="cy-prompt-example__title">{title}</span>
  {#if description}
    <span class="cy-prompt-example__desc">{description}</span>
  {/if}
</button>

<style>
  .cy-prompt-example {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    padding: var(--space-3) var(--space-4);
    background: transparent;
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg);
    cursor: pointer;
    text-align: left;
    transition: all var(--transition-default);
  }

  .cy-prompt-example:hover {
    border-color: var(--color-action-brand-default);
    box-shadow: var(--shadow-glow-green);
    background: var(--color-state-success-bg);
  }

  .cy-prompt-example:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }

  .cy-prompt-example__title {
    font-family: var(--font-body);
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text-primary);
  }

  .cy-prompt-example__desc {
    font-family: var(--font-body);
    font-size: 0.8125rem;
    color: var(--color-text-tertiary);
    line-height: 1.4;
  }
</style>
