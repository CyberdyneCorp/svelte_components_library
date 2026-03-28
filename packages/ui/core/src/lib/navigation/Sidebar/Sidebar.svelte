<svelte:options runes={true} />

<script lang="ts">
  type SidebarItem = {
    id: string;
    label: string;
    icon?: string;
    href?: string;
    children?: SidebarItem[];
  };

  let {
    items = [],
    activeId = "",
    collapsed = false,
  }: {
    items?: SidebarItem[];
    activeId?: string;
    collapsed?: boolean;
  } = $props();

  let expandedIds = $state<Set<string>>(new Set());

  function toggleExpand(id: string) {
    const next = new Set(expandedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    expandedIds = next;
  }

  function isActive(id: string): boolean {
    return activeId === id;
  }

  function hasActiveChild(item: SidebarItem): boolean {
    if (!item.children) return false;
    return item.children.some((c) => c.id === activeId || hasActiveChild(c));
  }
</script>

<nav class="cy-sidebar" class:cy-sidebar--collapsed={collapsed}>
  <ul class="cy-sidebar__list">
    {#each items as item}
      <li class="cy-sidebar__item">
        {#if item.children && item.children.length > 0}
          <button
            class="cy-sidebar__link"
            class:cy-sidebar__link--active={isActive(item.id) || hasActiveChild(item)}
            onclick={() => toggleExpand(item.id)}
            title={collapsed ? item.label : undefined}
          >
            {#if item.icon}
              <span class="cy-sidebar__icon">{item.icon}</span>
            {/if}
            {#if !collapsed}
              <span class="cy-sidebar__label">{item.label}</span>
              <svg
                class="cy-sidebar__chevron"
                class:cy-sidebar__chevron--open={expandedIds.has(item.id)}
                width="14" height="14" viewBox="0 0 16 16" fill="none"
              >
                <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            {/if}
          </button>
          {#if expandedIds.has(item.id) && !collapsed}
            <ul class="cy-sidebar__sublist">
              {#each item.children as child}
                <li class="cy-sidebar__subitem">
                  <a
                    class="cy-sidebar__sublink"
                    class:cy-sidebar__sublink--active={isActive(child.id)}
                    href={child.href || `#${child.id}`}
                  >
                    {child.label}
                  </a>
                </li>
              {/each}
            </ul>
          {/if}
        {:else}
          <a
            class="cy-sidebar__link"
            class:cy-sidebar__link--active={isActive(item.id)}
            href={item.href || `#${item.id}`}
            title={collapsed ? item.label : undefined}
          >
            {#if item.icon}
              <span class="cy-sidebar__icon">{item.icon}</span>
            {/if}
            {#if !collapsed}
              <span class="cy-sidebar__label">{item.label}</span>
            {/if}
          </a>
        {/if}
      </li>
    {/each}
  </ul>
</nav>

<style>
  .cy-sidebar {
    width: 260px;
    background: var(--nav-bg);
    border-right: 1px solid var(--color-border-subtle);
    padding: var(--space-2) 0;
    font-family: var(--font-body);
    transition: width var(--transition-default);
    overflow: hidden;
  }

  .cy-sidebar--collapsed {
    width: 56px;
  }

  .cy-sidebar__list,
  .cy-sidebar__sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .cy-sidebar__link {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-2) var(--space-4);
    color: var(--nav-item-text);
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: var(--font-weight-medium);
    transition: all var(--transition-fast);
    border: none;
    background: transparent;
    width: 100%;
    cursor: pointer;
    font-family: var(--font-body);
    text-align: left;
    border-left: 3px solid transparent;
  }

  .cy-sidebar__link:hover {
    background: var(--nav-item-hover);
    color: var(--color-text-primary);
  }

  .cy-sidebar__link--active {
    color: var(--nav-item-text-active);
    border-left-color: var(--nav-item-text-active);
    background: var(--color-surface-hover);
  }

  .cy-sidebar__icon {
    flex-shrink: 0;
    width: 20px;
    text-align: center;
    font-size: 1rem;
  }

  .cy-sidebar__label {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .cy-sidebar__chevron {
    flex-shrink: 0;
    transition: transform var(--transition-fast);
  }

  .cy-sidebar__chevron--open {
    transform: rotate(180deg);
  }

  .cy-sidebar__sublist {
    padding-left: var(--space-8);
  }

  .cy-sidebar__sublink {
    display: block;
    padding: var(--space-1) var(--space-4);
    color: var(--color-text-tertiary);
    text-decoration: none;
    font-size: 0.8125rem;
    transition: all var(--transition-fast);
    border-left: 2px solid var(--color-border-subtle);
  }

  .cy-sidebar__sublink:hover {
    color: var(--color-text-primary);
    text-decoration: none;
  }

  .cy-sidebar__sublink--active {
    color: var(--nav-item-text-active);
    border-left-color: var(--nav-item-text-active);
  }
</style>
