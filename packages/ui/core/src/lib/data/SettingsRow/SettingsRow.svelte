<svelte:options runes={true} />

<script lang="ts">
  import { type Snippet } from "svelte";
  import Badge from "../../primitives/Badge/Badge.svelte";

  /** `data-*` attributes forwarded to the root element (test hooks, analytics ids). */
  type DataAttributes = { [key: `data-${string}`]: string | number | boolean | null | undefined };

  let {
    title,
    description = undefined,
    badge = undefined,
    badgeVariant = "neutral",
    as = "div",
    icon,
    actions,
    children,
    ...rest
  }: {
    /** Setting name shown as the row title. */
    title: string;
    /** Short explanation shown under the title; use `children` instead for rich text. */
    description?: string;
    /** Badge text shown next to the title (e.g. "Custom", "Beta"). */
    badge?: string;
    /** Badge colour; mirrors the `Badge` variants. */
    badgeVariant?: "success" | "warning" | "error" | "danger" | "info" | "neutral";
    /** Root element: "li" inside a `<ul>`/`<ol>`, "div" anywhere else. */
    as?: "div" | "li";
    /** Leading icon, rendered inside a round `aria-hidden` container. */
    icon?: Snippet;
    /** Controls aligned to the end of the row (Buttons, a Switch, a Dropdown). */
    actions?: Snippet;
    /** Rich description; rendered in place of `description` when both are set. */
    children?: Snippet;
  } & DataAttributes = $props();
</script>

<svelte:element this={as} class="cy-settings-row" {...rest}>
  {#if icon}
    <span class="cy-settings-row__icon" aria-hidden="true">
      {@render icon()}
    </span>
  {/if}
  <span class="cy-settings-row__text">
    <span class="cy-settings-row__heading">
      <span class="cy-settings-row__title">{title}</span>
      {#if badge}
        <Badge variant={badgeVariant} size="sm">{badge}</Badge>
      {/if}
    </span>
    {#if children}
      <span class="cy-settings-row__description">{@render children()}</span>
    {:else if description}
      <span class="cy-settings-row__description">{description}</span>
    {/if}
  </span>
  {#if actions}
    <span class="cy-settings-row__actions">
      {@render actions()}
    </span>
  {/if}
</svelte:element>

<style>
  .cy-settings-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3);
    min-width: 0;
    padding: var(--space-3) var(--space-4);
    font-family: var(--font-body);
    color: var(--color-text-primary);
    list-style: none;
  }

  .cy-settings-row__icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: var(--radius-pill);
    background: var(--color-surface-raised);
    color: var(--color-text-secondary);
  }

  .cy-settings-row__text {
    display: flex;
    flex: 1 1 16rem;
    flex-direction: column;
    gap: var(--space-1);
    min-width: 0;
  }

  .cy-settings-row__heading {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
  }

  .cy-settings-row__title {
    font-size: 0.875rem;
    font-weight: var(--font-weight-medium);
    overflow-wrap: anywhere;
  }

  .cy-settings-row__description {
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
    overflow-wrap: anywhere;
  }

  .cy-settings-row__actions {
    display: flex;
    flex-shrink: 0;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: var(--space-2);
    margin-left: auto;
  }

  /* Narrow widths: actions drop below the text, aligned with it. */
  @media (max-width: 640px) {
    .cy-settings-row__actions {
      flex-basis: 100%;
      justify-content: flex-start;
      margin-left: 0;
    }
  }
</style>
