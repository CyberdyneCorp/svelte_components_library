<svelte:options runes={true} />

<script lang="ts">
  import { type Snippet } from "svelte";

  type MenuItem = {
    label: string;
    icon?: string;
    onclick: () => void;
    variant?: "default" | "danger";
  };

  let {
    items = [],
    children,
  }: {
    items?: MenuItem[];
    children?: Snippet;
  } = $props();

  let visible = $state(false);
  let x = $state(0);
  let y = $state(0);

  const icons: Record<string, string> = {
    copy: "M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2v-2M16 4h2a2 2 0 012 2v6M11 4a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V4z",
    edit: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
    delete: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
    download: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
    share: "M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z",
  };

  function handleContextMenu(e: MouseEvent) {
    e.preventDefault();
    x = e.clientX;
    y = e.clientY;
    visible = true;
  }

  function handleItemClick(item: MenuItem) {
    visible = false;
    item.onclick();
  }

  function handleClickOutside() {
    visible = false;
  }

  $effect(() => {
    if (visible) {
      const handler = () => { visible = false; };
      // Delay to avoid immediate close
      const timer = setTimeout(() => {
        document.addEventListener("click", handler);
      }, 0);
      return () => {
        clearTimeout(timer);
        document.removeEventListener("click", handler);
      };
    }
  });
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="cy-context-trigger" oncontextmenu={handleContextMenu}>
  {#if children}
    {@render children()}
  {/if}
</div>

{#if visible}
  <div class="cy-context-menu" style="left: {x}px; top: {y}px;" role="menu">
    {#each items as item}
      <button
        class="cy-context-menu__item"
        class:cy-context-menu__item--danger={item.variant === "danger"}
        role="menuitem"
        onclick={() => handleItemClick(item)}
      >
        {#if item.icon && icons[item.icon]}
          <svg class="cy-context-menu__icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d={icons[item.icon]} />
          </svg>
        {/if}
        <span>{item.label}</span>
      </button>
    {/each}
  </div>
{/if}

<style>
  .cy-context-trigger {
    display: contents;
  }

  .cy-context-menu {
    position: fixed;
    z-index: 1100;
    min-width: 180px;
    background: var(--color-surface-overlay);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    padding: var(--space-1);
    animation: cy-scale-in 100ms ease;
  }

  .cy-context-menu__item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    width: 100%;
    padding: var(--space-2) var(--space-3);
    border: none;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--color-text-secondary);
    font-family: var(--font-body);
    font-size: 0.8125rem;
    cursor: pointer;
    transition: all var(--transition-fast);
    text-align: left;
  }

  .cy-context-menu__item:hover {
    background: var(--color-surface-hover);
    color: var(--color-text-primary);
  }

  .cy-context-menu__item--danger {
    color: var(--color-state-error);
  }

  .cy-context-menu__item--danger:hover {
    background: var(--color-state-error-bg);
    color: var(--color-state-error);
  }

  .cy-context-menu__icon {
    flex-shrink: 0;
  }

  @keyframes cy-scale-in {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
</style>
