<svelte:options runes={true} />

<script lang="ts">
  type BottomNavItem = {
    id: string;
    label: string;
    icon: string;
    badge?: number;
  };

  let {
    items = [],
    activeId = $bindable(""),
    onchange,
  }: {
    items?: BottomNavItem[];
    activeId?: string;
    onchange?: (id: string) => void;
  } = $props();

  function selectItem(id: string) {
    activeId = id;
    onchange?.(id);
  }
</script>

<nav class="cy-bottomnav" aria-label="Bottom navigation">
  {#each items as item}
    <button
      class="cy-bottomnav__item"
      class:cy-bottomnav__item--active={activeId === item.id}
      onclick={() => selectItem(item.id)}
      aria-current={activeId === item.id ? "page" : undefined}
    >
      <span class="cy-bottomnav__icon-wrapper">
        <span class="cy-bottomnav__icon">{item.icon}</span>
        {#if item.badge != null && item.badge > 0}
          <span class="cy-bottomnav__badge" aria-label="{item.badge} notifications">
            {item.badge > 99 ? "99+" : item.badge}
          </span>
        {/if}
      </span>
      <span class="cy-bottomnav__label">{item.label}</span>
    </button>
  {/each}
</nav>

<style>
  .cy-bottomnav {
    display: flex;
    align-items: center;
    justify-content: space-around;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--color-surface-base);
    border-top: 1px solid var(--color-border-subtle);
    font-family: var(--font-body);
    padding-bottom: env(safe-area-inset-bottom, 0px);
    z-index: 1000;
    height: 64px;
  }

  .cy-bottomnav__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    flex: 1;
    padding: var(--space-1) 0;
    background: none;
    border: none;
    color: var(--color-text-tertiary);
    cursor: pointer;
    transition: all var(--transition-fast);
    -webkit-tap-highlight-color: transparent;
    position: relative;
  }

  .cy-bottomnav__item:hover {
    color: var(--color-text-secondary);
  }

  .cy-bottomnav__item--active {
    color: var(--color-action-brand-default);
    transform: scale(1.05);
  }

  .cy-bottomnav__icon-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .cy-bottomnav__icon {
    font-size: 1.25rem;
    line-height: 1;
  }

  .cy-bottomnav__badge {
    position: absolute;
    top: -6px;
    right: -10px;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    background: var(--color-status-error, var(--color-action-danger-default));
    color: var(--color-text-on-emphasis, var(--color-text-primary));
    font-size: 0.625rem;
    font-weight: var(--font-weight-bold, 700);
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }

  .cy-bottomnav__label {
    font-size: 0.625rem;
    font-weight: var(--font-weight-medium);
    line-height: 1;
    white-space: nowrap;
  }
</style>
