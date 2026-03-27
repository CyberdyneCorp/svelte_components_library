<svelte:options runes={true} />

<script lang="ts">
  type WalletOption = {
    id: string;
    name: string;
    icon: "metamask" | "walletconnect" | "coinbase" | "phantom" | "custom";
    description?: string;
  };

  let {
    wallets = [],
    connecting = $bindable(null),
    disabled = false,
    onconnect,
  }: {
    wallets?: WalletOption[];
    connecting?: string | null;
    disabled?: boolean;
    onconnect?: (walletId: string) => void;
  } = $props();

  const defaultWallets: WalletOption[] = [
    { id: "metamask", name: "MetaMask", icon: "metamask", description: "Browser extension wallet" },
    { id: "walletconnect", name: "WalletConnect", icon: "walletconnect", description: "Scan with mobile wallet" },
    { id: "coinbase", name: "Coinbase Wallet", icon: "coinbase", description: "Coinbase Wallet app" },
    { id: "phantom", name: "Phantom", icon: "phantom", description: "Multi-chain wallet" },
  ];

  let resolvedWallets = $derived(wallets.length > 0 ? wallets : defaultWallets);

  function handleConnect(walletId: string) {
    if (disabled || connecting) return;
    connecting = walletId;
    onconnect?.(walletId);
  }

  const walletIcons: Record<string, string> = {
    metamask: "M21.3 2L12.7 8.5l1.6-3.8L21.3 2z M2.7 2l8.5 6.6-1.5-3.9L2.7 2z M18.3 16.3l-2.3 3.5 4.9 1.3 1.4-4.7-4-.1z M1.7 16.4l1.4 4.7 4.9-1.3-2.3-3.5-4 .1z M8.8 10.9l-1.4 2.1 4.9.2-.2-5.4-3.3 3.1z M15.2 10.9l-3.4-3.2-.1 5.5 4.9-.2-1.4-2.1z M7.7 19.8l3-1.4-2.6-2-.4 3.4z M13.3 18.4l3 1.4-.4-3.4-2.6 2z",
    walletconnect: "M6.1 8.3c3.3-3.2 8.5-3.2 11.8 0l.4.4c.2.2.2.4 0 .6l-1.3 1.3c-.1.1-.2.1-.3 0l-.5-.5c-2.3-2.2-5.9-2.2-8.2 0l-.6.5c-.1.1-.2.1-.3 0L5.8 9.3c-.2-.2-.2-.4 0-.6l.3-.4zm14.6 2.7l1.2 1.2c.2.2.2.4 0 .6l-5.2 5.1c-.2.2-.4.2-.6 0l-3.7-3.6c0-.1-.1-.1-.2 0l-3.7 3.6c-.2.2-.4.2-.6 0L2.7 12.8c-.2-.2-.2-.4 0-.6l1.2-1.2c.2-.2.4-.2.6 0l3.7 3.6c0 .1.1.1.2 0l3.7-3.6c.2-.2.4-.2.6 0l3.7 3.6c0 .1.1.1.2 0l3.7-3.6c.2-.2.4-.2.6 0z",
    coinbase: "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 15.5c-3 0-5.5-2.5-5.5-5.5S9 6.5 12 6.5s5.5 2.5 5.5 5.5-2.5 5.5-5.5 5.5zm-2-7.5h4v4h-4v-4z",
    phantom: "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-3 13.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm6 0c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5z",
    custom: "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm-1-13h2v6h-2V7zm0 8h2v2h-2v-2z",
  };
</script>

<div class="cy-wallet-connect">
  <div class="cy-wallet-connect__header">
    <svg class="cy-wallet-connect__lock" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
    <span class="cy-wallet-connect__title">Connect Wallet</span>
  </div>

  <div class="cy-wallet-connect__list">
    {#each resolvedWallets as wallet}
      <button
        class="cy-wallet-connect__option"
        class:cy-wallet-connect__option--connecting={connecting === wallet.id}
        disabled={disabled || (connecting !== null && connecting !== wallet.id)}
        onclick={() => handleConnect(wallet.id)}
      >
        <div class="cy-wallet-connect__icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d={walletIcons[wallet.icon] || walletIcons.custom} />
          </svg>
        </div>
        <div class="cy-wallet-connect__info">
          <span class="cy-wallet-connect__name">{wallet.name}</span>
          {#if wallet.description}
            <span class="cy-wallet-connect__desc">{wallet.description}</span>
          {/if}
        </div>
        <div class="cy-wallet-connect__action">
          {#if connecting === wallet.id}
            <div class="cy-wallet-connect__spinner"></div>
          {:else}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
              <path d="M6 4l4 4-4 4"/>
            </svg>
          {/if}
        </div>
      </button>
    {/each}
  </div>

  <p class="cy-wallet-connect__footer">
    By connecting, you agree to the Terms of Service and acknowledge the Privacy Policy.
  </p>
</div>

<style>
  .cy-wallet-connect {
    width: 100%;
    max-width: 420px;
  }

  .cy-wallet-connect__header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-4);
  }

  .cy-wallet-connect__lock {
    color: var(--color-action-brand-default);
  }

  .cy-wallet-connect__title {
    font-family: var(--font-display);
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .cy-wallet-connect__list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .cy-wallet-connect__option {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    width: 100%;
    padding: var(--space-3) var(--space-4);
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: all var(--transition-default);
    text-align: left;
  }

  .cy-wallet-connect__option:hover:not(:disabled) {
    background: var(--color-surface-hover);
    border-color: var(--color-border-default);
    box-shadow: var(--shadow-glow-green);
  }

  .cy-wallet-connect__option--connecting {
    border-color: var(--color-action-brand-default);
    box-shadow: var(--shadow-glow-green);
  }

  .cy-wallet-connect__option:disabled:not(.cy-wallet-connect__option--connecting) {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .cy-wallet-connect__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: var(--radius-md);
    background: var(--color-bg-tertiary);
    color: var(--color-text-primary);
    flex-shrink: 0;
  }

  .cy-wallet-connect__info {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }

  .cy-wallet-connect__name {
    font-family: var(--font-body);
    font-size: 0.9375rem;
    font-weight: 500;
    color: var(--color-text-primary);
  }

  .cy-wallet-connect__desc {
    font-family: var(--font-body);
    font-size: 0.75rem;
    color: var(--color-text-tertiary);
    margin-top: 1px;
  }

  .cy-wallet-connect__action {
    display: flex;
    align-items: center;
    color: var(--color-text-tertiary);
    flex-shrink: 0;
  }

  .cy-wallet-connect__spinner {
    width: 16px;
    height: 16px;
    border: 2px solid var(--color-border-default);
    border-top-color: var(--color-action-brand-default);
    border-radius: 50%;
    animation: cy-spinner 0.6s linear infinite;
  }

  .cy-wallet-connect__footer {
    margin-top: var(--space-4);
    font-family: var(--font-body);
    font-size: 0.6875rem;
    color: var(--color-text-tertiary);
    text-align: center;
    line-height: 1.5;
  }
</style>
