<svelte:options runes={true} />

<script lang="ts">
  import type { Snippet } from "svelte";

  type NavChild = {
    label: string;
    href?: string;
    description?: string;
    icon?: string;
  };

  type NavItem = {
    label: string;
    href?: string;
    children?: NavChild[];
    active?: boolean;
  };

  let {
    brand = { label: "Cyberdyne" },
    items = [],
    actions,
    sticky = true,
    onnavigate,
  }: {
    brand?: { label: string; href?: string; icon?: string };
    items?: NavItem[];
    actions?: Snippet;
    sticky?: boolean;
    onnavigate?: (href: string) => void;
  } = $props();

  let openIndex = $state<number | null>(null);
  let mobileOpen = $state(false);

  function toggleDropdown(index: number) {
    openIndex = openIndex === index ? null : index;
  }

  function closeAll() {
    openIndex = null;
  }

  function handleItemClick(item: NavItem | NavChild, href?: string) {
    const target = href || item.href || "#";
    onnavigate?.(target);
    closeAll();
    mobileOpen = false;
  }

  function handleKeydown(e: KeyboardEvent, index: number) {
    if (e.key === "Escape") {
      closeAll();
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const item = items[index];
      if (item.children && item.children.length > 0) {
        toggleDropdown(index);
      } else {
        handleItemClick(item);
      }
    }
  }

  function handleDropdownKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      closeAll();
    }
  }

  function handleOutsideClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest(".cy-navbar__nav")) {
      closeAll();
    }
  }
</script>

<svelte:window onclick={handleOutsideClick} />

<nav
  class="cy-navbar"
  class:cy-navbar--sticky={sticky}
  aria-label="Main navigation"
>
  <div class="cy-navbar__inner">
    <a class="cy-navbar__brand" href={brand.href || "/"}>
      {#if brand.icon}
        <span class="cy-navbar__brand-icon">{brand.icon}</span>
      {/if}
      <span class="cy-navbar__brand-label">{brand.label}</span>
    </a>

    <button
      class="cy-navbar__hamburger"
      aria-label="Toggle menu"
      aria-expanded={mobileOpen}
      onclick={() => (mobileOpen = !mobileOpen)}
    >
      <span class="cy-navbar__hamburger-line"></span>
      <span class="cy-navbar__hamburger-line"></span>
      <span class="cy-navbar__hamburger-line"></span>
    </button>

    <div class="cy-navbar__nav" class:cy-navbar__nav--open={mobileOpen}>
      <ul class="cy-navbar__items" role="menubar">
        {#each items as item, i}
          <li class="cy-navbar__item" role="none">
            {#if item.children && item.children.length > 0}
              <button
                class="cy-navbar__link"
                class:cy-navbar__link--active={item.active}
                role="menuitem"
                aria-haspopup="true"
                aria-expanded={openIndex === i}
                onclick={() => toggleDropdown(i)}
                onkeydown={(e) => handleKeydown(e, i)}
              >
                {item.label}
                <svg class="cy-navbar__chevron" width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              {#if openIndex === i}
                <div
                  class="cy-navbar__dropdown"
                  role="menu"
                  tabindex="-1"
                  onkeydown={handleDropdownKeydown}
                >
                  {#each item.children as child}
                    <a
                      class="cy-navbar__dropdown-item"
                      href={child.href || "#"}
                      role="menuitem"
                      onclick={() => handleItemClick(child)}
                    >
                      {#if child.icon}
                        <span class="cy-navbar__dropdown-icon">{child.icon}</span>
                      {/if}
                      <div class="cy-navbar__dropdown-content">
                        <span class="cy-navbar__dropdown-label">{child.label}</span>
                        {#if child.description}
                          <span class="cy-navbar__dropdown-desc">{child.description}</span>
                        {/if}
                      </div>
                    </a>
                  {/each}
                </div>
              {/if}
            {:else}
              <a
                class="cy-navbar__link"
                class:cy-navbar__link--active={item.active}
                href={item.href || "#"}
                role="menuitem"
                onclick={() => handleItemClick(item)}
                onkeydown={(e) => handleKeydown(e, i)}
              >
                {item.label}
              </a>
            {/if}
          </li>
        {/each}
      </ul>

      {#if actions}
        <div class="cy-navbar__actions">
          {@render actions()}
        </div>
      {/if}
    </div>
  </div>
</nav>

<style>
  .cy-navbar {
    background: var(--nav-bg, var(--color-surface-base));
    border-bottom: 1px solid var(--color-border-subtle);
    font-family: var(--font-body);
    z-index: 1000;
    width: 100%;
  }

  .cy-navbar--sticky {
    position: sticky;
    top: 0;
  }

  .cy-navbar__inner {
    display: flex;
    align-items: center;
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 var(--space-4);
    height: 56px;
  }

  .cy-navbar__brand {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    text-decoration: none;
    color: var(--color-text-primary);
    font-weight: var(--font-weight-bold, 700);
    font-size: 1.125rem;
    flex-shrink: 0;
  }

  .cy-navbar__brand-icon {
    font-size: 1.25rem;
  }

  .cy-navbar__hamburger {
    display: none;
    flex-direction: column;
    gap: 4px;
    background: none;
    border: none;
    cursor: pointer;
    padding: var(--space-2);
    margin-left: auto;
  }

  .cy-navbar__hamburger-line {
    display: block;
    width: 20px;
    height: 2px;
    background: var(--color-text-primary);
    border-radius: 1px;
  }

  .cy-navbar__nav {
    display: flex;
    align-items: center;
    flex: 1;
    margin-left: var(--space-8);
  }

  .cy-navbar__items {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    list-style: none;
    margin: 0;
    padding: 0;
    flex: 1;
  }

  .cy-navbar__item {
    position: relative;
  }

  .cy-navbar__link {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-2) var(--space-3);
    color: var(--color-text-secondary);
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: var(--font-weight-medium);
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    font-family: var(--font-body);
    transition: all var(--transition-fast);
    white-space: nowrap;
  }

  .cy-navbar__link:hover {
    color: var(--color-text-primary);
    background: var(--color-surface-hover);
    border-radius: var(--radius-md);
  }

  .cy-navbar__link--active {
    color: var(--color-action-brand-default);
    border-bottom-color: var(--color-action-brand-default);
  }

  .cy-navbar__link--active:hover {
    color: var(--color-action-brand-default);
  }

  .cy-navbar__chevron {
    flex-shrink: 0;
  }

  .cy-navbar__dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    min-width: 240px;
    background: var(--color-surface-raised, var(--color-surface-base));
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-lg);
    padding: var(--space-2);
    margin-top: var(--space-1);
    box-shadow: var(--shadow-lg, 0 8px 24px rgba(0, 0, 0, 0.3));
    z-index: 1001;
  }

  .cy-navbar__dropdown-item {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    padding: var(--space-2) var(--space-3);
    color: var(--color-text-secondary);
    text-decoration: none;
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
  }

  .cy-navbar__dropdown-item:hover {
    background: var(--color-surface-hover);
    color: var(--color-text-primary);
  }

  .cy-navbar__dropdown-icon {
    flex-shrink: 0;
    width: 20px;
    text-align: center;
    margin-top: 2px;
  }

  .cy-navbar__dropdown-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .cy-navbar__dropdown-label {
    font-size: 0.875rem;
    font-weight: var(--font-weight-medium);
  }

  .cy-navbar__dropdown-desc {
    font-size: 0.75rem;
    color: var(--color-text-tertiary);
  }

  .cy-navbar__actions {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-left: auto;
  }

  @media (max-width: 768px) {
    .cy-navbar__hamburger {
      display: flex;
    }

    .cy-navbar__nav {
      display: none;
      position: absolute;
      top: 56px;
      left: 0;
      right: 0;
      background: var(--nav-bg, var(--color-surface-base));
      border-bottom: 1px solid var(--color-border-subtle);
      flex-direction: column;
      align-items: stretch;
      margin-left: 0;
      padding: var(--space-4);
    }

    .cy-navbar__nav--open {
      display: flex;
    }

    .cy-navbar__items {
      flex-direction: column;
      align-items: stretch;
    }

    .cy-navbar__dropdown {
      position: static;
      box-shadow: none;
      border: none;
      margin-top: 0;
      padding-left: var(--space-4);
    }

    .cy-navbar__actions {
      margin-left: 0;
      margin-top: var(--space-3);
    }
  }
</style>
