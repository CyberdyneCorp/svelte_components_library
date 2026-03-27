<svelte:options runes={true} />

<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    label = "",
    icon = "",
    active = false,
    href = "",
    onclick,
    children,
  }: {
    label?: string;
    icon?: string;
    active?: boolean;
    href?: string;
    onclick?: () => void;
    children?: Snippet;
  } = $props();
</script>

{#if href}
  <a class="cy-menu-item" class:cy-menu-item--active={active} {href}>
    {#if icon}
      <span class="cy-menu-item__icon">{icon}</span>
    {/if}
    <span class="cy-menu-item__label">{label}</span>
  </a>
{:else}
  <button class="cy-menu-item" class:cy-menu-item--active={active} type="button" {onclick}>
    {#if icon}
      <span class="cy-menu-item__icon">{icon}</span>
    {/if}
    <span class="cy-menu-item__label">{label}</span>
  </button>
{/if}

{#if children}
  <div class="cy-menu-item__children">
    {@render children()}
  </div>
{/if}

<style>
  .cy-menu-item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    width: 100%;
    padding: var(--space-2) var(--space-3);
    background: transparent;
    border: none;
    border-left: 2px solid transparent;
    border-radius: 0;
    color: var(--color-text-secondary, rgba(255, 255, 255, 0.5));
    font-family: var(--font-body);
    font-size: 0.875rem;
    text-decoration: none;
    cursor: pointer;
    transition: all var(--transition-default);
    text-align: left;
  }

  .cy-menu-item:hover {
    color: var(--color-text-primary, #fff);
    background: var(--color-surface-3, rgba(255, 255, 255, 0.03));
  }

  .cy-menu-item--active {
    color: var(--color-action-brand-default, #00ff41);
    border-left-color: var(--color-action-brand-default, #00ff41);
    background: rgba(0, 255, 65, 0.05);
  }

  .cy-menu-item:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: -2px;
  }

  .cy-menu-item__icon {
    font-size: 1.125rem;
    flex-shrink: 0;
    width: 20px;
    text-align: center;
  }

  .cy-menu-item__label {
    flex: 1;
  }

  .cy-menu-item__children {
    padding-left: var(--space-6);
  }
</style>
