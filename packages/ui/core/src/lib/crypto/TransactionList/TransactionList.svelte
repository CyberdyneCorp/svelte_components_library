<svelte:options runes={true} />

<script lang="ts">
  type Transaction = {
    hash: string;
    type: "send" | "receive" | "swap" | "approve";
    amount: string;
    symbol: string;
    status: "confirmed" | "pending" | "failed";
    timestamp: string;
    to?: string;
    from?: string;
  };

  let {
    transactions = [],
  }: {
    transactions: Transaction[];
  } = $props();

  function truncateHash(hash: string): string {
    if (hash.length <= 12) return hash;
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  }

  function typeIcon(type: Transaction["type"]): string {
    switch (type) {
      case "send": return "\u2191";
      case "receive": return "\u2193";
      case "swap": return "\u21c4";
      case "approve": return "\u2713";
    }
  }

  function typeLabel(type: Transaction["type"]): string {
    switch (type) {
      case "send": return "Sent";
      case "receive": return "Received";
      case "swap": return "Swap";
      case "approve": return "Approve";
    }
  }
</script>

<div class="cy-tx-list">
  {#if transactions.length === 0}
    <div class="cy-tx-list__empty">
      <span class="cy-tx-list__empty-icon">&#x2205;</span>
      <span class="cy-tx-list__empty-text">No transactions yet</span>
    </div>
  {:else}
    {#each transactions as tx (tx.hash)}
      <div class="cy-tx-list__row">
        <div class="cy-tx-list__type cy-tx-list__type--{tx.type}">
          <span class="cy-tx-list__type-icon">{typeIcon(tx.type)}</span>
        </div>
        <div class="cy-tx-list__details">
          <div class="cy-tx-list__top-row">
            <span class="cy-tx-list__label">{typeLabel(tx.type)}</span>
            <span class="cy-tx-list__amount cy-tx-list__amount--{tx.type}">
              {tx.type === "send" ? "-" : tx.type === "receive" ? "+" : ""}{tx.amount} {tx.symbol}
            </span>
          </div>
          <div class="cy-tx-list__bottom-row">
            <span class="cy-tx-list__hash">{truncateHash(tx.hash)}</span>
            <span class="cy-tx-list__status cy-tx-list__status--{tx.status}">
              {tx.status}
            </span>
          </div>
          <div class="cy-tx-list__timestamp">{tx.timestamp}</div>
        </div>
      </div>
    {/each}
  {/if}
</div>

<style>
  .cy-tx-list {
    background: var(--color-surface-base, #12121a);
    border: 1px solid var(--color-border-default, rgba(0, 255, 65, 0.1));
    border-radius: var(--radius-lg, 12px);
    overflow: hidden;
  }

  .cy-tx-list__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2, 0.5rem);
    padding: var(--space-8, 2rem);
    color: var(--color-text-secondary, #8a8a8a);
  }

  .cy-tx-list__empty-icon {
    font-size: 1.5rem;
    opacity: 0.5;
  }

  .cy-tx-list__empty-text {
    font-size: 0.875rem;
    font-family: var(--font-mono, monospace);
  }

  .cy-tx-list__row {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3, 0.75rem);
    padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
    border-bottom: 1px solid var(--color-border-default, rgba(0, 255, 65, 0.06));
    transition: background var(--transition-default, 0.2s ease);
  }

  .cy-tx-list__row:last-child {
    border-bottom: none;
  }

  .cy-tx-list__row:hover {
    background: var(--color-surface-raised, rgba(255, 255, 255, 0.02));
  }

  .cy-tx-list__type {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: var(--radius-full, 50%);
    flex-shrink: 0;
    font-size: 0.875rem;
    margin-top: 2px;
  }

  .cy-tx-list__type--send {
    background: rgba(255, 68, 68, 0.12);
    color: var(--color-state-error, #ff4444);
  }

  .cy-tx-list__type--receive {
    background: rgba(0, 255, 65, 0.12);
    color: var(--color-state-success, #00ff41);
  }

  .cy-tx-list__type--swap {
    background: rgba(0, 212, 255, 0.12);
    color: var(--color-secondary, #00d4ff);
  }

  .cy-tx-list__type--approve {
    background: rgba(255, 184, 0, 0.12);
    color: var(--color-state-warning, #ffb800);
  }

  .cy-tx-list__details {
    flex: 1;
    min-width: 0;
  }

  .cy-tx-list__top-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .cy-tx-list__label {
    font-size: 0.8125rem;
    font-weight: var(--font-weight-medium, 500);
    color: var(--color-text-primary, #e0e0e0);
  }

  .cy-tx-list__amount {
    font-family: var(--font-mono, monospace);
    font-size: 0.8125rem;
    font-weight: var(--font-weight-medium, 500);
  }

  .cy-tx-list__amount--send {
    color: var(--color-state-error, #ff4444);
  }

  .cy-tx-list__amount--receive {
    color: var(--color-state-success, #00ff41);
  }

  .cy-tx-list__amount--swap {
    color: var(--color-secondary, #00d4ff);
  }

  .cy-tx-list__amount--approve {
    color: var(--color-text-primary, #e0e0e0);
  }

  .cy-tx-list__bottom-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: var(--space-1, 0.25rem);
  }

  .cy-tx-list__hash {
    font-family: var(--font-mono, monospace);
    font-size: 0.6875rem;
    color: var(--color-text-secondary, #8a8a8a);
  }

  .cy-tx-list__status {
    font-size: 0.6875rem;
    font-family: var(--font-mono, monospace);
    font-weight: var(--font-weight-medium, 500);
    padding: 0.0625rem var(--space-2, 0.5rem);
    border-radius: var(--radius-pill, 999px);
    text-transform: capitalize;
  }

  .cy-tx-list__status--confirmed {
    color: var(--color-state-success, #00ff41);
    background: rgba(0, 255, 65, 0.1);
  }

  .cy-tx-list__status--pending {
    color: var(--color-state-warning, #ffb800);
    background: rgba(255, 184, 0, 0.1);
  }

  .cy-tx-list__status--failed {
    color: var(--color-state-error, #ff4444);
    background: rgba(255, 68, 68, 0.1);
  }

  .cy-tx-list__timestamp {
    font-size: 0.6875rem;
    color: var(--color-text-tertiary, #666);
    margin-top: var(--space-1, 0.25rem);
  }
</style>
