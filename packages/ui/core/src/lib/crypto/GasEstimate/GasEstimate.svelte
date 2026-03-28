<svelte:options runes={true} />

<script lang="ts">
  type GasOption = {
    gwei: string;
    time: string;
    usd: string;
  };

  const defaultGas: GasOption = { gwei: "—", time: "—", usd: "—" };

  let {
    slow = defaultGas,
    standard = defaultGas,
    fast = defaultGas,
    selected = $bindable("standard"),
  }: {
    slow?: GasOption;
    standard?: GasOption;
    fast?: GasOption;
    selected?: "slow" | "standard" | "fast";
  } = $props();

  const options = $derived([
    { key: "slow" as const, label: "Slow", icon: "🐢", data: slow },
    { key: "standard" as const, label: "Standard", icon: "⚡", data: standard },
    { key: "fast" as const, label: "Fast", icon: "🚀", data: fast },
  ]);
</script>

<div class="cy-gas">
  <div class="cy-gas__header">
    <span class="cy-gas__title">Gas Estimate</span>
  </div>
  <div class="cy-gas__options">
    {#each options as option (option.key)}
      <button
        class="cy-gas__option"
        class:cy-gas__option--selected={selected === option.key}
        onclick={() => (selected = option.key)}
        type="button"
      >
        <div class="cy-gas__option-header">
          <span class="cy-gas__option-icon">{option.icon}</span>
          <span class="cy-gas__option-label">{option.label}</span>
        </div>
        <div class="cy-gas__option-gwei">{option.data.gwei} gwei</div>
        <div class="cy-gas__option-time">{option.data.time}</div>
        <div class="cy-gas__option-usd">{option.data.usd}</div>
      </button>
    {/each}
  </div>
</div>

<style>
  .cy-gas {
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg, 12px);
    padding: var(--space-4, 1rem);
  }

  .cy-gas__header {
    margin-bottom: var(--space-3, 0.75rem);
  }

  .cy-gas__title {
    font-size: 0.75rem;
    font-weight: var(--font-weight-medium, 500);
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .cy-gas__options {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-2, 0.5rem);
  }

  .cy-gas__option {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1, 0.25rem);
    padding: var(--space-3, 0.75rem) var(--space-2, 0.5rem);
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md, 8px);
    cursor: pointer;
    transition: all var(--transition-default, 0.2s ease);
    font-family: inherit;
    color: inherit;
    text-align: center;
  }

  .cy-gas__option:hover {
    border-color: var(--color-border-default);
    background: var(--color-state-success-bg);
  }

  .cy-gas__option--selected {
    border-color: var(--color-action-brand-default);
    background: var(--color-state-success-bg);
    box-shadow: var(--shadow-glow-green);
  }

  .cy-gas__option-header {
    display: flex;
    align-items: center;
    gap: var(--space-1, 0.25rem);
  }

  .cy-gas__option-icon {
    font-size: 0.875rem;
  }

  .cy-gas__option-label {
    font-size: 0.6875rem;
    font-weight: var(--font-weight-bold, 700);
    color: var(--color-text-primary);
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .cy-gas__option-gwei {
    font-family: var(--font-mono, monospace);
    font-size: 0.9375rem;
    font-weight: var(--font-weight-bold, 700);
    color: var(--color-text-primary);
  }

  .cy-gas__option--selected .cy-gas__option-gwei {
    color: var(--color-action-brand-default);
  }

  .cy-gas__option-time {
    font-size: 0.6875rem;
    color: var(--color-text-secondary);
  }

  .cy-gas__option-usd {
    font-family: var(--font-mono, monospace);
    font-size: 0.6875rem;
    color: var(--color-text-tertiary);
    margin-top: var(--space-1, 0.25rem);
  }
</style>
