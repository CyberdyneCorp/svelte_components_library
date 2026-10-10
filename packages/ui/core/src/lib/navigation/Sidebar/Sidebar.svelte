<svelte:options runes={true} />

<script module lang="ts">
  export type SidebarItem = {
    id: string;
    label: string;
    icon?: string;
    href?: string;
    children?: SidebarItem[];
    /** Short text rendered with `Badge` next to the label (e.g. "Beta", "3"). */
    badge?: string;
    /** Opens in a new tab (`target="_blank"`, `rel="noopener noreferrer"`) with an external-link icon. */
    external?: boolean;
    /** Renders the item as not interactive (`aria-disabled`, skipped by Tab). */
    disabled?: boolean;
  };

  export type SidebarGroup = {
    id: string;
    /** Section heading shown above the group's items. */
    label: string;
    items: SidebarItem[];
    /** Renders the heading as a toggle button that shows or hides the group's items. */
    collapsible?: boolean;
    /** Initial open state of a collapsible group. Defaults to `true`. */
    defaultOpen?: boolean;
  };
</script>

<script lang="ts">
  import Badge from "../../primitives/Badge/Badge.svelte";
  import Icon from "../../primitives/Icon/Icon.svelte";

  let {
    items = [],
    groups = undefined,
    activeId = "",
    collapsed = false,
    ariaLabel,
    externalLabel = "opens in a new tab",
    onnavigate = undefined,
  }: {
    /** Flat list of navigation items; ignored when `groups` is provided. */
    items?: SidebarItem[];
    /** Labelled sections of items, used instead of `items` when present. */
    groups?: SidebarGroup[];
    /** Id of the current item; parents of the active child are also highlighted. */
    activeId?: string;
    /** Icon-only rail; items with children show their children in a flyout on hover or focus. */
    collapsed?: boolean;
    /** Accessible name for the `<nav>` landmark; required when a page has more than one nav. */
    ariaLabel?: string;
    /** Visually hidden text appended to the name of `external` links. */
    externalLabel?: string;
    /** Called with the link's href and item when a link item is activated; the default navigation is not prevented. */
    onnavigate?: (href: string, item: SidebarItem) => void;
  } = $props();

  let expandedIds = $state<Set<string>>(new Set());
  let groupToggles = $state<Record<string, boolean>>({});
  let openFlyoutId = $state("");

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

  function hasChildren(item: SidebarItem): boolean {
    return Boolean(item.children && item.children.length > 0);
  }

  function hrefOf(item: SidebarItem): string {
    return item.href || `#${item.id}`;
  }

  function isGroupOpen(group: SidebarGroup): boolean {
    if (collapsed || !group.collapsible) return true;
    return groupToggles[group.id] ?? group.defaultOpen ?? true;
  }

  function toggleGroup(group: SidebarGroup) {
    groupToggles = { ...groupToggles, [group.id]: !isGroupOpen(group) };
  }

  function onParentClick(item: SidebarItem) {
    if (collapsed) {
      openFlyoutId = openFlyoutId === item.id ? "" : item.id;
    } else {
      toggleExpand(item.id);
    }
  }

  function onLinkClick(event: MouseEvent, item: SidebarItem) {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    onnavigate?.(hrefOf(item), item);
  }

  function openFlyout(item: SidebarItem) {
    if (collapsed && hasChildren(item)) openFlyoutId = item.id;
  }

  function closeFlyout(id: string) {
    if (openFlyoutId === id) openFlyoutId = "";
  }

  function onItemFocusOut(event: FocusEvent, id: string) {
    const li = event.currentTarget as HTMLElement;
    if (!li.contains(event.relatedTarget as Node | null)) closeFlyout(id);
  }

  function onItemKeyDown(event: KeyboardEvent, id: string) {
    if (event.key !== "Escape" || openFlyoutId !== id) return;
    const li = event.currentTarget as HTMLElement;
    li.querySelector<HTMLElement>(".cy-sidebar__link")?.focus();
    closeFlyout(id);
  }
</script>

{#snippet linkBody(item: SidebarItem, compact: boolean)}
  {#if item.icon}
    <span class="cy-sidebar__icon" aria-hidden="true">{item.icon}</span>
  {/if}
  {#if compact}
    <span class="cy-sidebar__sr">{item.label}</span>
  {:else}
    <span class="cy-sidebar__label">{item.label}</span>
    {#if item.badge}
      <span class="cy-sidebar__badge"><Badge size="sm" variant="info">{item.badge}</Badge></span>
    {/if}
    {#if item.external}
      <span class="cy-sidebar__external"><Icon name="external-link" size={14} /></span>
    {/if}
  {/if}
  {#if item.external}
    <span class="cy-sidebar__sr">{externalLabel}</span>
  {/if}
{/snippet}

{#snippet navLink(item: SidebarItem, cls: string)}
  {@const compact = collapsed && cls === "cy-sidebar__link"}
  <a
    class={cls}
    class:cy-sidebar__link--active={cls === "cy-sidebar__link" && isActive(item.id)}
    class:cy-sidebar__sublink--active={cls === "cy-sidebar__sublink" && isActive(item.id)}
    class:cy-sidebar__link--disabled={item.disabled}
    href={hrefOf(item)}
    target={item.external ? "_blank" : undefined}
    rel={item.external ? "noopener noreferrer" : undefined}
    aria-current={isActive(item.id) ? "page" : undefined}
    aria-disabled={item.disabled ? "true" : undefined}
    tabindex={item.disabled ? -1 : undefined}
    title={compact ? item.label : undefined}
    onclick={(event) => onLinkClick(event, item)}
  >
    {@render linkBody(item, compact)}
  </a>
{/snippet}

{#snippet childList(item: SidebarItem, cls: string)}
  <ul class={cls} aria-label={cls === "cy-sidebar__flyout" ? item.label : undefined}>
    {#each item.children ?? [] as child (child.id)}
      <li class="cy-sidebar__subitem">
        {@render navLink(child, "cy-sidebar__sublink")}
      </li>
    {/each}
  </ul>
{/snippet}

{#snippet navItem(item: SidebarItem)}
  {#if hasChildren(item)}
    <!-- The listeners only track hover and focus of the rail flyout; keyboard interaction lives on the button. -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <li
      class="cy-sidebar__item cy-sidebar__item--parent"
      onmouseenter={() => openFlyout(item)}
      onmouseleave={() => closeFlyout(item.id)}
      onfocusin={() => openFlyout(item)}
      onfocusout={(event) => onItemFocusOut(event, item.id)}
      onkeydown={(event) => onItemKeyDown(event, item.id)}
    >
      <button
        type="button"
        class="cy-sidebar__link"
        class:cy-sidebar__link--active={isActive(item.id) || hasActiveChild(item)}
        disabled={item.disabled}
        aria-expanded={collapsed ? openFlyoutId === item.id : expandedIds.has(item.id)}
        onclick={() => onParentClick(item)}
        title={collapsed ? item.label : undefined}
      >
        {@render linkBody(item, collapsed)}
        {#if !collapsed}
          <span
            class="cy-sidebar__chevron"
            class:cy-sidebar__chevron--open={expandedIds.has(item.id)}
          >
            <Icon name="chevron-down" size={14} />
          </span>
        {/if}
      </button>
      {#if collapsed && openFlyoutId === item.id}
        {@render childList(item, "cy-sidebar__flyout")}
      {:else if !collapsed && expandedIds.has(item.id)}
        {@render childList(item, "cy-sidebar__sublist")}
      {/if}
    </li>
  {:else}
    <li class="cy-sidebar__item">
      {@render navLink(item, "cy-sidebar__link")}
    </li>
  {/if}
{/snippet}

<nav class="cy-sidebar" class:cy-sidebar--collapsed={collapsed} aria-label={ariaLabel}>
  <ul class="cy-sidebar__list">
    {#if groups}
      {#each groups as group (group.id)}
        <li class="cy-sidebar__group">
          {#if !collapsed}
            {#if group.collapsible}
              <button
                type="button"
                class="cy-sidebar__group-toggle"
                aria-expanded={isGroupOpen(group)}
                onclick={() => toggleGroup(group)}
              >
                <span class="cy-sidebar__group-label">{group.label}</span>
                <span
                  class="cy-sidebar__chevron"
                  class:cy-sidebar__chevron--open={isGroupOpen(group)}
                >
                  <Icon name="chevron-down" size={12} />
                </span>
              </button>
            {:else}
              <span class="cy-sidebar__group-heading">
                <span class="cy-sidebar__group-label">{group.label}</span>
              </span>
            {/if}
          {/if}
          {#if isGroupOpen(group)}
            <ul class="cy-sidebar__group-list" aria-label={group.label}>
              {#each group.items as item (item.id)}
                {@render navItem(item)}
              {/each}
            </ul>
          {/if}
        </li>
      {/each}
    {:else}
      {#each items as item (item.id)}
        {@render navItem(item)}
      {/each}
    {/if}
  </ul>
</nav>

<style>
  .cy-sidebar {
    width: 260px;
    background: var(--texture-surface), var(--gradient-surface), var(--nav-bg);
    border-right: var(--border-width) var(--border-style) var(--color-border-subtle);
    padding: var(--space-2) 0;
    font-family: var(--font-body);
    transition: width var(--transition-default);
    overflow: hidden;
  }

  .cy-sidebar--collapsed {
    width: 56px;
    overflow: visible;
  }

  .cy-sidebar__list,
  .cy-sidebar__sublist,
  .cy-sidebar__group-list,
  .cy-sidebar__flyout {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .cy-sidebar__item--parent {
    position: relative;
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

  .cy-sidebar__link--disabled,
  .cy-sidebar__link:disabled {
    color: var(--color-text-disabled);
    cursor: not-allowed;
    pointer-events: none;
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

  .cy-sidebar__badge,
  .cy-sidebar__external {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
  }

  .cy-sidebar__external {
    color: var(--color-text-tertiary);
  }

  .cy-sidebar__chevron {
    display: inline-flex;
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
    display: flex;
    align-items: center;
    gap: var(--space-2);
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

  .cy-sidebar__flyout {
    position: absolute;
    top: 0;
    left: 100%;
    z-index: var(--z-overlay);
    min-width: 180px;
    padding: var(--space-1) 0;
    background: var(--color-surface-raised);
    border: var(--border-width) var(--border-style) var(--color-border-subtle);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
  }

  .cy-sidebar__flyout .cy-sidebar__sublink {
    border-left: none;
    padding: var(--space-2) var(--space-4);
  }

  .cy-sidebar__group + .cy-sidebar__group {
    margin-top: var(--space-2);
    padding-top: var(--space-2);
    border-top: var(--border-width) var(--border-style) var(--color-border-subtle);
  }

  .cy-sidebar__group-heading,
  .cy-sidebar__group-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    width: 100%;
    padding: var(--space-2) var(--space-4);
    color: var(--color-text-tertiary);
    font-family: var(--font-body);
    font-size: 0.6875rem;
    font-weight: var(--font-weight-semibold);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .cy-sidebar__group-toggle {
    border: none;
    background: transparent;
    cursor: pointer;
    text-align: left;
  }

  .cy-sidebar__group-toggle:hover {
    color: var(--color-text-primary);
  }

  .cy-sidebar__group-label {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .cy-sidebar__sr {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
