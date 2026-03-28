<svelte:options runes={true} />

<script lang="ts">
  let {
    status = "active",
    label = "",
  }: {
    status?: "active" | "inactive" | "pending" | "error";
    label?: string;
  } = $props();
</script>

<span class="cy-status-badge cy-status-badge--{status}">
  <span class="cy-status-badge__dot"></span>
  <span class="cy-status-badge__label">{label}</span>
</span>

<style>
  .cy-status-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-body);
    font-size: 0.8125rem;
    font-weight: var(--font-weight-medium);
  }

  .cy-status-badge__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .cy-status-badge--active .cy-status-badge__dot {
    background: var(--color-state-success);
    box-shadow: 0 0 6px var(--color-state-success-bg);
    animation: cy-pulse 2s ease-in-out infinite;
  }

  .cy-status-badge--active .cy-status-badge__label {
    color: var(--color-state-success);
  }

  .cy-status-badge--inactive .cy-status-badge__dot {
    background: var(--primitive-grey-50);
  }

  .cy-status-badge--inactive .cy-status-badge__label {
    color: var(--color-text-tertiary);
  }

  .cy-status-badge--pending .cy-status-badge__dot {
    background: var(--color-state-warning);
    box-shadow: 0 0 6px var(--color-state-warning-bg);
  }

  .cy-status-badge--pending .cy-status-badge__label {
    color: var(--color-state-warning);
  }

  .cy-status-badge--error .cy-status-badge__dot {
    background: var(--color-state-error);
    box-shadow: 0 0 6px var(--color-state-error-bg);
  }

  .cy-status-badge--error .cy-status-badge__label {
    color: var(--color-state-error);
  }

  @keyframes cy-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
</style>
