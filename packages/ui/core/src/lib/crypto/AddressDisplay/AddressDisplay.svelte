<svelte:options runes={true} />

<script lang="ts">
  import { onDestroy } from "svelte";

  let {
    address = "",
    truncate = true,
    label = "",
    size = "md",
  }: {
    address?: string;
    truncate?: boolean;
    label?: string;
    size?: "sm" | "md";
  } = $props();

  let copied = $state(false);
  let copyTimer: ReturnType<typeof setTimeout> | undefined;

  let displayAddress = $derived(
    truncate && address && address.length > 12
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : address || ""
  );

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(address);
    } catch {
      // fallback
      const el = document.createElement("textarea");
      el.value = address;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    copied = true;
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => (copied = false), 2000);
  }

  onDestroy(() => {
    clearTimeout(copyTimer);
  });
</script>

<div class="cy-address cy-address--{size}">
  {#if label}
    <span class="cy-address__label">{label}</span>
  {/if}
  <div class="cy-address__row">
    <span class="cy-address__value">{displayAddress}</span>
    <button
      class="cy-address__copy"
      onclick={copyAddress}
      aria-label="Copy address"
      type="button"
    >
      {#if copied}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      {:else}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      {/if}
    </button>
  </div>
</div>

<style>
  .cy-address {
    display: inline-flex;
    flex-direction: column;
    gap: var(--space-1, 0.25rem);
  }

  .cy-address__label {
    font-size: 0.6875rem;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: var(--font-weight-medium, 500);
  }

  .cy-address__row {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2, 0.5rem);
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md, 8px);
    transition: all var(--transition-default, 0.2s ease);
  }

  .cy-address--sm .cy-address__row {
    padding: var(--space-1, 0.25rem) var(--space-2, 0.5rem);
  }

  .cy-address--md .cy-address__row {
    padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
  }

  .cy-address__row:hover {
    border-color: var(--color-border-default);
  }

  .cy-address__value {
    font-family: var(--font-mono, monospace);
    color: var(--color-text-primary);
    letter-spacing: 0.02em;
  }

  .cy-address--sm .cy-address__value {
    font-size: 0.75rem;
  }

  .cy-address--md .cy-address__value {
    font-size: 0.875rem;
  }

  .cy-address__copy {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    padding: var(--space-1, 0.25rem);
    border-radius: var(--radius-sm, 4px);
    transition: all var(--transition-default, 0.2s ease);
  }

  .cy-address__copy:hover {
    color: var(--color-action-brand-default);
    background: var(--color-state-success-bg);
  }
</style>
