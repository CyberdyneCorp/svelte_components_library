<svelte:options runes={true} />

<script lang="ts">
  let {
    label = "",
    value = "",
    variant = "default",
  }: {
    label?: string;
    value?: string;
    variant?: "default" | "brand" | "info";
  } = $props();
</script>

<span class="cy-info-pill cy-info-pill--{variant}">
  <span class="cy-info-pill__label">{label}</span>
  <span class="cy-info-pill__value">{value}</span>
</span>

<style>
  .cy-info-pill {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: 0.25rem 0.625rem;
    border-radius: 9999px;
    font-family: var(--font-mono, monospace);
    font-size: 0.75rem;
    line-height: 1;
    background: var(--color-surface-2, #12121a);
    border: 1px solid var(--color-border-default, rgba(255, 255, 255, 0.08));
  }

  .cy-info-pill__label {
    color: var(--color-text-muted, rgba(255, 255, 255, 0.3));
  }

  .cy-info-pill--default .cy-info-pill__value {
    color: var(--color-text-primary, #fff);
  }

  .cy-info-pill--brand .cy-info-pill__value {
    color: var(--color-action-brand-default, #00ff41);
  }

  .cy-info-pill--info .cy-info-pill__value {
    color: var(--color-info, #00d4ff);
  }
</style>
