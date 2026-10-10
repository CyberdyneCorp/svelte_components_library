<svelte:options runes={true} />

<script lang="ts">
  import Icon from "../../primitives/Icon/Icon.svelte";
  import type { BreadcrumbItem } from "./types.js";

  let {
    items = [],
  }: {
    /** Ordered crumbs; the last one is the current page. */
    items?: BreadcrumbItem[];
  } = $props();
</script>

{#snippet crumb(item: BreadcrumbItem)}
  {#if item.icon}
    <Icon name={item.icon} size={14} />
  {/if}
  {#if item.icon && item.iconOnly}
    <span class="cy-breadcrumb__sr-only">{item.label}</span>
  {:else}
    {item.label}
  {/if}
{/snippet}

<nav class="cy-breadcrumb" aria-label="Breadcrumb">
  <ol class="cy-breadcrumb__list">
    {#each items as item, i}
      <li class="cy-breadcrumb__item">
        {#if i < items.length - 1 && item.href}
          <a class="cy-breadcrumb__link" href={item.href}>{@render crumb(item)}</a>
        {:else}
          <span
            class="cy-breadcrumb__current"
            aria-current={i === items.length - 1 ? "page" : undefined}
          >
            {@render crumb(item)}
          </span>
        {/if}
        {#if i < items.length - 1}
          <span class="cy-breadcrumb__separator" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path
                d="M6 4L10 8L6 12"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
        {/if}
      </li>
    {/each}
  </ol>
</nav>

<style>
  .cy-breadcrumb__list {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    list-style: none;
    margin: 0;
    padding: 0;
    font-family: var(--font-body);
    font-size: 0.875rem;
  }

  .cy-breadcrumb__item {
    display: flex;
    align-items: center;
    gap: var(--space-1);
  }

  .cy-breadcrumb__link,
  .cy-breadcrumb__current {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
  }

  .cy-breadcrumb__link {
    color: var(--color-text-tertiary);
    text-decoration: none;
    transition: color var(--transition-fast);
  }

  .cy-breadcrumb__link:hover {
    color: var(--color-action-brand-default);
    text-decoration: none;
  }

  .cy-breadcrumb__current {
    color: var(--color-text-primary);
    font-weight: var(--font-weight-medium);
  }

  .cy-breadcrumb__separator {
    display: flex;
    align-items: center;
    color: var(--color-text-tertiary);
  }

  .cy-breadcrumb__sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }
</style>
