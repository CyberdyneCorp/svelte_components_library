<svelte:options runes={true} />

<script lang="ts">
  let {
    name = "",
    image = "",
    collection = "",
    tokenId = "",
    rarity = "",
    price = "",
    currency = "ETH",
    onclick,
  }: {
    name: string;
    image?: string;
    collection?: string;
    tokenId?: string;
    rarity?: string;
    price?: string;
    currency?: string;
    onclick?: () => void;
  } = $props();
</script>

<button
  class="cy-nft-card"
  class:cy-nft-card--clickable={!!onclick}
  onclick={onclick}
  type="button"
>
  <div class="cy-nft-card__image">
    {#if image}
      <img src={image} alt={name} class="cy-nft-card__img" />
    {:else}
      <div class="cy-nft-card__placeholder"></div>
    {/if}
    {#if rarity}
      <span class="cy-nft-card__rarity">{rarity}</span>
    {/if}
  </div>
  <div class="cy-nft-card__body">
    {#if collection}
      <span class="cy-nft-card__collection">{collection}</span>
    {/if}
    <div class="cy-nft-card__name-row">
      <span class="cy-nft-card__name">{name}</span>
      {#if tokenId}
        <span class="cy-nft-card__token-id">#{tokenId}</span>
      {/if}
    </div>
    {#if price}
      <div class="cy-nft-card__price-row">
        <span class="cy-nft-card__price">{price} {currency}</span>
      </div>
    {/if}
  </div>
</button>

<style>
  .cy-nft-card {
    display: flex;
    flex-direction: column;
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg, 12px);
    overflow: hidden;
    transition: all var(--transition-default, 0.2s ease);
    cursor: default;
    width: 100%;
    text-align: left;
    padding: 0;
    font-family: inherit;
    color: inherit;
  }

  .cy-nft-card--clickable {
    cursor: pointer;
  }

  .cy-nft-card:hover {
    transform: translateY(-2px);
    border-color: var(--color-border-default);
    box-shadow: var(--shadow-glow-green);
  }

  .cy-nft-card__image {
    position: relative;
    aspect-ratio: 1;
    overflow: hidden;
  }

  .cy-nft-card__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .cy-nft-card__placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 30%, #0a1a2e 60%, #0a0a1a 100%);
    background-size: 200% 200%;
    animation: placeholderShift 6s ease infinite;
  }

  @keyframes placeholderShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  .cy-nft-card__rarity {
    position: absolute;
    top: var(--space-2, 0.5rem);
    right: var(--space-2, 0.5rem);
    font-family: var(--font-mono, monospace);
    font-size: 0.625rem;
    font-weight: var(--font-weight-bold, 700);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 0.125rem var(--space-2, 0.5rem);
    border-radius: var(--radius-pill, 999px);
    background: rgba(0, 0, 0, 0.7);
    color: var(--color-action-secondary-default);
    border: 1px solid var(--color-border-default);
    backdrop-filter: blur(4px);
  }

  .cy-nft-card__body {
    padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
    display: flex;
    flex-direction: column;
    gap: var(--space-1, 0.25rem);
  }

  .cy-nft-card__collection {
    font-size: 0.6875rem;
    color: var(--color-action-brand-default);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-weight: var(--font-weight-medium, 500);
  }

  .cy-nft-card__name-row {
    display: flex;
    align-items: baseline;
    gap: var(--space-2, 0.5rem);
  }

  .cy-nft-card__name {
    font-size: 0.9375rem;
    font-weight: var(--font-weight-bold, 700);
    color: var(--color-text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cy-nft-card__token-id {
    font-family: var(--font-mono, monospace);
    font-size: 0.6875rem;
    color: var(--color-text-secondary);
    flex-shrink: 0;
  }

  .cy-nft-card__price-row {
    display: flex;
    align-items: center;
    margin-top: var(--space-2, 0.5rem);
    padding-top: var(--space-2, 0.5rem);
    border-top: 1px solid var(--color-border-subtle);
  }

  .cy-nft-card__price {
    font-family: var(--font-mono, monospace);
    font-size: 0.8125rem;
    font-weight: var(--font-weight-bold, 700);
    color: var(--color-text-primary);
  }
</style>
