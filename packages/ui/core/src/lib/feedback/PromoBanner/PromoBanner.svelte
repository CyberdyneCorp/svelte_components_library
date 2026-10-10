<svelte:options runes={true} />

<script lang="ts">
  import { type Snippet } from "svelte";
  import IconButton from "../../primitives/IconButton/IconButton.svelte";

  let {
    title,
    description = "",
    icon,
    price,
    actions,
    dismissible = false,
    dismissLabel = "Dismiss",
    ondismiss,
  }: {
    /** Headline of the offer or announcement; also names the region. */
    title: string;
    /** Supporting copy under the title. */
    description?: string;
    /** Decorative leading icon (rendered `aria-hidden`). */
    icon?: Snippet;
    /** Price area, e.g. a `PriceTag`. */
    price?: Snippet;
    /** Call-to-action buttons or links. */
    actions?: Snippet;
    /** Shows a close button that hides the banner. */
    dismissible?: boolean;
    /** Accessible name of the close button (i18n). */
    dismissLabel?: string;
    /** Called once when the banner is dismissed; persisting it is the application's job. */
    ondismiss?: () => void;
  } = $props();

  const titleId = `cy-promo-${Math.random().toString(36).slice(2, 9)}`;

  let visible = $state(true);

  function dismiss() {
    visible = false;
    ondismiss?.();
  }
</script>

{#if visible}
  <div class="cy-promo" role="region" aria-labelledby={titleId}>
    {#if icon}
      <span class="cy-promo__icon" aria-hidden="true">{@render icon()}</span>
    {/if}
    <div class="cy-promo__content">
      <div class="cy-promo__title" id={titleId}>{title}</div>
      {#if description}
        <p class="cy-promo__description">{description}</p>
      {/if}
    </div>
    {#if price}
      <div class="cy-promo__price">{@render price()}</div>
    {/if}
    {#if actions}
      <div class="cy-promo__actions">{@render actions()}</div>
    {/if}
    {#if dismissible}
      <div class="cy-promo__dismiss">
        <IconButton icon="x" label={dismissLabel} size="sm" onclick={dismiss} />
      </div>
    {/if}
  </div>
{/if}

<style>
  .cy-promo {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3) var(--space-4);
    padding: var(--space-4) var(--space-5);
    background: var(--promo-bg, var(--color-action-brand-bg));
    border: var(--border-width) var(--border-style) var(--promo-border, var(--color-border-brand));
    border-radius: var(--radius-lg);
    color: var(--color-text-primary);
    font-family: var(--font-body);
  }

  .cy-promo__icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: var(--radius-md);
    background: var(--color-surface-raised);
    color: var(--color-action-brand-default);
  }

  .cy-promo__content {
    flex: 1 1 16rem;
    min-width: 0;
  }

  .cy-promo__title {
    font-family: var(--font-display);
    font-size: 1rem;
    font-weight: var(--font-weight-semibold);
    line-height: 1.3;
  }

  .cy-promo__description {
    margin: var(--space-1) 0 0;
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--color-text-secondary);
  }

  .cy-promo__price,
  .cy-promo__actions {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: var(--space-2);
  }

  .cy-promo__dismiss {
    display: flex;
    flex-shrink: 0;
    align-self: flex-start;
    margin-left: auto;
  }

  @media (max-width: 480px) {
    .cy-promo__price,
    .cy-promo__actions {
      flex-basis: 100%;
    }
  }
</style>
