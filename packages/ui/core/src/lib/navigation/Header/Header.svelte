<svelte:options runes={true} />

<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    title = "",
    children,
    logo,
  }: {
    title?: string;
    children?: Snippet;
    logo?: Snippet;
  } = $props();
</script>

<header class="cy-header">
  <div class="cy-header__left">
    {#if logo}
      <div class="cy-header__logo">
        {@render logo()}
      </div>
    {/if}
    {#if title}
      <h1 class="cy-header__title">{title}</h1>
    {/if}
  </div>

  {#if children}
    <div class="cy-header__actions">
      {@render children()}
    </div>
  {/if}
</header>

<style>
  .cy-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--nav-height, 56px);
    padding: 0 var(--space-4);
    background: var(--color-bg-primary);
    border-bottom: 1px solid var(--color-border-subtle);
    flex-shrink: 0;
  }

  .cy-header__left {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .cy-header__logo {
    display: flex;
    align-items: center;
  }

  .cy-header__title {
    margin: 0;
    font-family: var(--font-heading, var(--font-body));
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text-primary);
    letter-spacing: -0.01em;
  }

  .cy-header__actions {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }
</style>
