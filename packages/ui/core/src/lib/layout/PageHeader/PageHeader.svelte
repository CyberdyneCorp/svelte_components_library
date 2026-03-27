<svelte:options runes={true} />

<script lang="ts">
  import { type Snippet } from "svelte";

  let {
    title = "",
    description = "",
    children,
  }: {
    title?: string;
    description?: string;
    children?: Snippet;
  } = $props();
</script>

<div class="cy-page-header">
  <div class="cy-page-header__text">
    <h1 class="cy-page-header__title">{title}</h1>
    {#if description}
      <p class="cy-page-header__desc">{description}</p>
    {/if}
  </div>
  {#if children}
    <div class="cy-page-header__actions">
      {@render children()}
    </div>
  {/if}
</div>

<style>
  .cy-page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-4);
    padding-bottom: var(--space-5);
    border-bottom: 1px solid var(--color-border-subtle);
    margin-bottom: var(--space-5);
  }

  .cy-page-header__text {
    flex: 1;
    min-width: 0;
  }

  .cy-page-header__title {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin: 0;
    line-height: 1.25;
  }

  .cy-page-header__desc {
    font-family: var(--font-body);
    font-size: 0.875rem;
    color: var(--color-text-tertiary);
    margin: var(--space-1) 0 0;
    line-height: 1.5;
  }

  .cy-page-header__actions {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex-shrink: 0;
  }
</style>
