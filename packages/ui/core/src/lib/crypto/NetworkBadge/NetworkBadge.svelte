<svelte:options runes={true} />

<script lang="ts">
  import { type Snippet } from "svelte";

  let {
    network,
    chainId,
    connected = true,
    icon,
  }: {
    network: string;
    chainId: number;
    connected?: boolean;
    icon?: Snippet;
  } = $props();
</script>

<div class="cy-network-badge" class:cy-network-badge--disconnected={!connected}>
  <span class="cy-network-badge__dot" class:cy-network-badge__dot--connected={connected}></span>
  {#if icon}
    <span class="cy-network-badge__icon">
      {@render icon()}
    </span>
  {/if}
  <span class="cy-network-badge__name">{network}</span>
  <span class="cy-network-badge__chain-id">#{chainId}</span>
</div>

<style>
  .cy-network-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2, 0.5rem);
    padding: var(--space-1, 0.25rem) var(--space-3, 0.75rem);
    background: var(--color-surface-base, #12121a);
    border: 1px solid var(--color-border-default, rgba(0, 255, 65, 0.1));
    border-radius: var(--radius-pill, 999px);
    font-family: var(--font-mono, monospace);
    transition: all var(--transition-default, 0.2s ease);
  }

  .cy-network-badge:hover {
    border-color: rgba(0, 255, 65, 0.2);
  }

  .cy-network-badge--disconnected {
    opacity: 0.7;
  }

  .cy-network-badge__dot {
    width: 8px;
    height: 8px;
    border-radius: var(--radius-full, 50%);
    background: var(--color-text-tertiary, #555);
    flex-shrink: 0;
  }

  .cy-network-badge__dot--connected {
    background: var(--color-state-success, #00ff41);
    box-shadow: 0 0 6px rgba(0, 255, 65, 0.5);
  }

  .cy-network-badge__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
  }

  .cy-network-badge__name {
    font-size: 0.75rem;
    font-weight: var(--font-weight-medium, 500);
    color: var(--color-text-primary, #e0e0e0);
  }

  .cy-network-badge__chain-id {
    font-size: 0.625rem;
    color: var(--color-text-tertiary, #666);
  }
</style>
