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
    background: rgba(0, 255, 65, 0.12);
    color: #00ff41;
    border: 1px solid rgba(0, 255, 65, 0.2);
  }

  .cy-flag--beta {
    background: rgba(0, 212, 255, 0.12);
    color: #00d4ff;
    border: 1px solid rgba(0, 212, 255, 0.2);
  }

  .cy-flag--deprecated {
    background: rgba(245, 158, 11, 0.12);
    color: #f59e0b;
    border: 1px solid rgba(245, 158, 11, 0.2);
  }

  .cy-flag--experimental {
    background: rgba(168, 85, 247, 0.12);
    color: #a855f7;
    border: 1px solid rgba(168, 85, 247, 0.2);
  }
</style>
