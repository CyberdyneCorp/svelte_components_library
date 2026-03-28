<svelte:options runes={true} />

<script lang="ts">
  let {
    variant = "new",
    size = "md",
  }: {
    variant?: "new" | "beta" | "deprecated" | "experimental";
    size?: "sm" | "md";
  } = $props();

  let label = $derived(variant.toUpperCase());
</script>

<span class="cy-flag cy-flag--{variant} cy-flag--{size}">{label}</span>

<style>
  .cy-flag {
    display: inline-flex;
    align-items: center;
    font-family: var(--font-mono, monospace);
    font-weight: 600;
    letter-spacing: 0.05em;
    border-radius: var(--radius-xs);
    white-space: nowrap;
    line-height: 1;
  }

  .cy-flag--sm {
    font-size: 0.625rem;
    padding: 0.125rem 0.375rem;
  }

  .cy-flag--md {
    font-size: 0.6875rem;
    padding: 0.1875rem 0.5rem;
  }

  .cy-flag--new {
    background: var(--color-surface-hover);
    color: var(--color-action-brand-default);
    border: 1px solid var(--color-action-brand-default);
  }

  .cy-flag--beta {
    background: var(--color-surface-hover);
    color: var(--color-action-secondary-default);
    border: 1px solid var(--color-action-secondary-default);
  }

  .cy-flag--deprecated {
    background: var(--color-surface-hover);
    color: var(--color-state-warning);
    border: 1px solid var(--color-state-warning);
  }

  .cy-flag--experimental {
    background: var(--color-surface-hover);
    color: var(--color-action-tertiary-default);
    border: 1px solid var(--color-action-tertiary-default);
  }
</style>
