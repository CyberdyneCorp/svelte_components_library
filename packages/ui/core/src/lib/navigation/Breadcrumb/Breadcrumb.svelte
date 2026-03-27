<svelte:options runes={true} />

<script lang="ts">
  let {
    items = [],
  }: {
    items?: Array<{ label: string; href?: string }>;
  } = $props();
</script>

<nav class="cy-breadcrumb" aria-label="Breadcrumb">
  <ol class="cy-breadcrumb__list">
    {#each items as item, i}
      <li class="cy-breadcrumb__item">
        {#if i < items.length - 1 && item.href}
          <a class="cy-breadcrumb__link" href={item.href}>{item.label}</a>
        {:else}
          <span class="cy-breadcrumb__current" aria-current={i === items.length - 1 ? "page" : undefined}>
            {item.label}
          </span>
        {/if}
        {#if i < items.length - 1}
          <span class="cy-breadcrumb__separator" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M6 4L10 8L6 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
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
</style>
