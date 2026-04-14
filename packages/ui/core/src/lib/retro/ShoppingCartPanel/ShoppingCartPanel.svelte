<svelte:options runes={true} />

<script lang="ts">
  import type { CartItem, CartSuggestion } from "./types.js";

  let {
    items = [],
    suggestions = [],
    title = "YOUR BAG",
    subtitle = "Review your items • Complete your purchase",
    emptyTitle = "Your bag is empty",
    emptyText = "Add some items from our marketplace to get started!",
    currency = "$",
    onCheckout,
    onRemove,
    onSuggestionClick,
  }: {
    items?: CartItem[];
    suggestions?: CartSuggestion[];
    title?: string;
    subtitle?: string;
    emptyTitle?: string;
    emptyText?: string;
    currency?: string;
    onCheckout?: () => void;
    onRemove?: (id: string) => void;
    onSuggestionClick?: (id: string) => void;
  } = $props();

  let count = $derived(items.reduce((n, i) => n + (i.qty ?? 1), 0));
  let total = $derived(items.reduce((s, i) => s + i.price * (i.qty ?? 1), 0));
</script>

<aside class="cy-cart" aria-label={title}>
  <header class="cy-cart__header">
    <h3 class="cy-cart__title">{title} ({count})</h3>
    <p class="cy-cart__subtitle">{subtitle}</p>
  </header>

  {#if items.length === 0}
    <div class="cy-cart__empty">
      <div class="cy-cart__empty-icon" aria-hidden="true">🛒</div>
      <p class="cy-cart__empty-title">{emptyTitle}</p>
      <p class="cy-cart__empty-text">{emptyText}</p>
    </div>
  {:else}
    <ul class="cy-cart__list">
      {#each items as item (item.id)}
        <li class="cy-cart__item">
          {#if item.icon}<span class="cy-cart__icon" aria-hidden="true">{item.icon}</span>{/if}
          <span class="cy-cart__name">{item.title}</span>
          <span class="cy-cart__price">{currency}{(item.price * (item.qty ?? 1)).toFixed(2)}</span>
          {#if onRemove}
            <button
              type="button"
              class="cy-cart__remove"
              aria-label="Remove {item.title}"
              onclick={() => onRemove?.(item.id)}
            >×</button>
          {/if}
        </li>
      {/each}
    </ul>
    <div class="cy-cart__total">
      <span>Total</span>
      <span data-testid="cy-cart-total">{currency}{total.toFixed(2)}</span>
    </div>
    <button type="button" class="cy-cart__checkout" onclick={() => onCheckout?.()}>Checkout</button>
  {/if}

  {#if suggestions.length > 0}
    <section class="cy-cart__suggestions" aria-label="Suggestions">
      {#each suggestions as s (s.id)}
        <button
          type="button"
          class="cy-cart__suggestion"
          onclick={() => onSuggestionClick?.(s.id)}
        >
          {#if s.icon}<span aria-hidden="true">{s.icon}</span>{/if}
          <span class="cy-cart__sug-title">{s.title}</span>
          {#if s.subtitle}<span class="cy-cart__sug-sub">{s.subtitle}</span>{/if}
        </button>
      {/each}
    </section>
  {/if}
</aside>

<style>
  .cy-cart {
    background: var(--color-surface-default, #fff);
    border: 2px solid var(--color-text-primary, #12121a);
    padding: 10px;
    font-family: var(--font-body, monospace);
    color: var(--color-text-primary, #12121a);
    min-width: 240px;
  }
  .cy-cart__header { border-bottom: 2px solid var(--color-border-default, #d0d0da); padding-bottom: 6px; margin-bottom: 8px; }
  .cy-cart__title { margin: 0; font-size: 0.85rem; }
  .cy-cart__subtitle { margin: 2px 0 0; font-size: 0.7rem; color: var(--color-text-secondary, #4a4a5c); }
  .cy-cart__empty { text-align: center; padding: 14px 8px; color: var(--color-text-secondary, #4a4a5c); }
  .cy-cart__empty-icon { font-size: 1.5rem; margin-bottom: 4px; }
  .cy-cart__empty-title { margin: 0 0 4px; font-weight: 700; color: var(--color-text-primary, #12121a); font-size: 0.8rem; }
  .cy-cart__empty-text { margin: 0; font-size: 0.75rem; }
  .cy-cart__list { list-style: none; margin: 0 0 6px; padding: 0; display: flex; flex-direction: column; gap: 4px; }
  .cy-cart__item { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; }
  .cy-cart__name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .cy-cart__remove { background: transparent; border: 0; color: var(--color-state-error, #ff4444); cursor: pointer; font-weight: 700; }
  .cy-cart__total { display: flex; justify-content: space-between; font-weight: 700; border-top: 1px dashed var(--color-border-default, #d0d0da); padding-top: 6px; font-size: 0.8rem; }
  .cy-cart__checkout { margin-top: 6px; width: 100%; padding: 6px; background: var(--color-action-brand-default, #00b32d); color: var(--color-action-brand-text, #fff); border: 2px solid var(--color-text-primary, #12121a); cursor: pointer; font-weight: 700; }
  .cy-cart__suggestions { display: flex; flex-direction: column; gap: 6px; margin-top: 10px; }
  .cy-cart__suggestion { display: flex; flex-direction: column; gap: 2px; padding: 6px 8px; background: var(--color-surface-raised, #f5f5fa); border: 1px solid var(--color-border-default, #d0d0da); cursor: pointer; text-align: left; font: inherit; }
  .cy-cart__sug-title { font-weight: 700; font-size: 0.75rem; }
  .cy-cart__sug-sub { font-size: 0.7rem; color: var(--color-action-secondary-default, #00aacc); }
</style>
