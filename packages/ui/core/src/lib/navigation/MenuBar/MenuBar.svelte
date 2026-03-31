<svelte:options runes={true} />

<script module lang="ts">
  export type MenuBarAction = {
    label: string;
    shortcut?: string;
    action?: string;
    disabled?: boolean;
    separator?: boolean;
    children?: MenuBarAction[];
  };

  export type MenuBarItem = {
    label: string;
    items: MenuBarAction[];
  };
</script>

<script lang="ts">
  let {
    menus = [],
    onaction,
  }: {
    menus?: MenuBarItem[];
    onaction?: (action: string) => void;
  } = $props();

  let openMenuIndex = $state<number | null>(null);
  let menuBarMode = $state(false);
  let openSubmenuLabel = $state<string | null>(null);

  function openMenu(index: number) {
    openMenuIndex = index;
    menuBarMode = true;
    openSubmenuLabel = null;
  }

  function closeAll() {
    openMenuIndex = null;
    menuBarMode = false;
    openSubmenuLabel = null;
  }

  function handleTopLevelClick(index: number) {
    if (openMenuIndex === index) {
      closeAll();
    } else {
      openMenu(index);
    }
  }

  function handleTopLevelMouseEnter(index: number) {
    if (menuBarMode) {
      openMenu(index);
    }
  }

  function handleActionClick(item: MenuBarAction) {
    if (item.disabled || item.separator) return;
    if (item.action) {
      onaction?.(item.action);
    }
    closeAll();
  }

  function handleSubmenuEnter(label: string) {
    openSubmenuLabel = label;
  }

  function handleSubmenuLeave() {
    openSubmenuLabel = null;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (openMenuIndex === null) return;

    if (e.key === "Escape") {
      closeAll();
      e.preventDefault();
    } else if (e.key === "ArrowRight") {
      openMenu((openMenuIndex + 1) % menus.length);
      e.preventDefault();
    } else if (e.key === "ArrowLeft") {
      openMenu((openMenuIndex - 1 + menus.length) % menus.length);
      e.preventDefault();
    }
  }

  function handleOutsideClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest(".cy-menubar")) {
      closeAll();
    }
  }
</script>

<svelte:window onclick={handleOutsideClick} onkeydown={handleKeydown} />

<div class="cy-menubar" role="menubar">
  {#each menus as menu, i}
    <div class="cy-menubar__menu">
      <button
        class="cy-menubar__trigger"
        class:cy-menubar__trigger--open={openMenuIndex === i}
        role="menuitem"
        aria-haspopup="true"
        aria-expanded={openMenuIndex === i}
        onclick={() => handleTopLevelClick(i)}
        onmouseenter={() => handleTopLevelMouseEnter(i)}
      >
        {menu.label}
      </button>

      {#if openMenuIndex === i}
        <div class="cy-menubar__dropdown" role="menu">
          {#each menu.items as item}
            {#if item.separator}
              <div class="cy-menubar__separator" role="separator"></div>
            {:else}
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <div
                class="cy-menubar__item-wrapper"
                onmouseenter={() => item.children ? handleSubmenuEnter(item.label) : handleSubmenuLeave()}
                onmouseleave={handleSubmenuLeave}
              >
                <button
                  class="cy-menubar__item"
                  class:cy-menubar__item--disabled={item.disabled}
                  role="menuitem"
                  aria-disabled={item.disabled}
                  onclick={() => handleActionClick(item)}
                  disabled={item.disabled}
                >
                  <span class="cy-menubar__item-label">{item.label}</span>
                  {#if item.shortcut}
                    <span class="cy-menubar__item-shortcut">{item.shortcut}</span>
                  {/if}
                  {#if item.children && item.children.length > 0}
                    <span class="cy-menubar__item-arrow">&#9658;</span>
                  {/if}
                </button>

                {#if item.children && item.children.length > 0 && openSubmenuLabel === item.label}
                  <div class="cy-menubar__submenu" role="menu">
                    {#each item.children as child}
                      {#if child.separator}
                        <div class="cy-menubar__separator" role="separator"></div>
                      {:else}
                        <button
                          class="cy-menubar__item"
                          class:cy-menubar__item--disabled={child.disabled}
                          role="menuitem"
                          aria-disabled={child.disabled}
                          onclick={() => handleActionClick(child)}
                          disabled={child.disabled}
                        >
                          <span class="cy-menubar__item-label">{child.label}</span>
                          {#if child.shortcut}
                            <span class="cy-menubar__item-shortcut">{child.shortcut}</span>
                          {/if}
                        </button>
                      {/if}
                    {/each}
                  </div>
                {/if}
              </div>
            {/if}
          {/each}
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .cy-menubar {
    display: flex;
    align-items: center;
    background: var(--color-surface-base);
    border-bottom: 1px solid var(--color-border-subtle);
    font-family: var(--font-body);
    padding: 0 var(--space-2);
    height: 32px;
  }

  .cy-menubar__menu {
    position: relative;
  }

  .cy-menubar__trigger {
    padding: var(--space-1) var(--space-3);
    background: none;
    border: none;
    color: var(--color-text-secondary);
    font-size: 0.8125rem;
    font-family: var(--font-body);
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
  }

  .cy-menubar__trigger:hover,
  .cy-menubar__trigger--open {
    background: var(--color-surface-hover);
    color: var(--color-text-primary);
  }

  .cy-menubar__dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    min-width: 220px;
    background: var(--color-surface-raised, var(--color-surface-base));
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    padding: var(--space-1);
    margin-top: 2px;
    box-shadow: var(--shadow-lg, 0 8px 24px rgba(0, 0, 0, 0.3));
    z-index: 1001;
  }

  .cy-menubar__item-wrapper {
    position: relative;
  }

  .cy-menubar__item {
    display: flex;
    align-items: center;
    width: 100%;
    padding: var(--space-1) var(--space-3);
    background: none;
    border: none;
    color: var(--color-text-secondary);
    font-size: 0.8125rem;
    font-family: var(--font-body);
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
    text-align: left;
    gap: var(--space-4);
  }

  .cy-menubar__item:hover:not(:disabled) {
    background: var(--color-surface-hover);
    color: var(--color-text-primary);
  }

  .cy-menubar__item--disabled {
    color: var(--color-text-disabled, var(--color-text-tertiary));
    opacity: 0.5;
    cursor: not-allowed;
  }

  .cy-menubar__item-label {
    flex: 1;
  }

  .cy-menubar__item-shortcut {
    font-family: var(--font-mono, monospace);
    font-size: 0.6875rem;
    color: var(--color-text-tertiary);
    margin-left: auto;
    padding-left: var(--space-4);
  }

  .cy-menubar__item-arrow {
    font-size: 0.625rem;
    color: var(--color-text-tertiary);
    margin-left: auto;
  }

  .cy-menubar__separator {
    height: 1px;
    background: var(--color-border-subtle);
    margin: var(--space-1) var(--space-2);
  }

  .cy-menubar__submenu {
    position: absolute;
    left: 100%;
    top: 0;
    min-width: 200px;
    background: var(--color-surface-raised, var(--color-surface-base));
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    padding: var(--space-1);
    margin-left: 2px;
    box-shadow: var(--shadow-lg, 0 8px 24px rgba(0, 0, 0, 0.3));
    z-index: 1002;
  }
</style>
