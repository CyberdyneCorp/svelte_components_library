<svelte:options runes={true} />

<script lang="ts">
  import { type Snippet } from "svelte";

  let {
    items = [],
    trigger,
    onselect,
    align = "left",
  }: {
    items: Array<{ label: string; value: string; icon?: string; variant?: "default" | "danger" }>;
    trigger?: Snippet;
    onselect?: (value: string) => void;
    align?: "left" | "right";
  } = $props();

  let open = $state(false);
  let focusedIndex = $state(-1);
  let containerEl: HTMLDivElement | undefined = $state();
  let menuEl: HTMLDivElement | undefined = $state();

  function toggle() {
    open = !open;
    if (open) {
      focusedIndex = 0;
    }
  }

  function close() {
    open = false;
    focusedIndex = -1;
  }

  function select(value: string) {
    onselect?.(value);
    close();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        open = true;
        focusedIndex = 0;
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        focusedIndex = (focusedIndex + 1) % items.length;
        break;
      case "ArrowUp":
        e.preventDefault();
        focusedIndex = (focusedIndex - 1 + items.length) % items.length;
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < items.length) {
          select(items[focusedIndex].value);
        }
        break;
      case "Escape":
        e.preventDefault();
        close();
        break;
    }
  }

  function handleClickOutside(e: MouseEvent) {
    if (containerEl && !containerEl.contains(e.target as Node)) {
      close();
    }
  }

  $effect(() => {
    if (open) {
      document.addEventListener("click", handleClickOutside, true);
      return () => document.removeEventListener("click", handleClickOutside, true);
    }
  });
</script>

<div class="cy-dropdown" bind:this={containerEl} onkeydown={handleKeydown} role="presentation">
  <div class="cy-dropdown__trigger" onclick={toggle} role="button" tabindex="0" aria-haspopup="listbox" aria-expanded={open}>
    {@render trigger?.()}
  </div>

  {#if open}
    <div
      class="cy-dropdown__menu cy-dropdown__menu--{align}"
      bind:this={menuEl}
      role="listbox"
    >
      {#each items as item, i (item.value)}
        <button
          class="cy-dropdown__item"
          class:cy-dropdown__item--danger={item.variant === "danger"}
          class:cy-dropdown__item--focused={i === focusedIndex}
          role="option"
          aria-selected={i === focusedIndex}
          onclick={() => select(item.value)}
          onmouseenter={() => (focusedIndex = i)}
        >
          {#if item.icon}
            <span class="cy-dropdown__icon">{item.icon}</span>
          {/if}
          <span class="cy-dropdown__label">{item.label}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .cy-dropdown {
    position: relative;
    display: inline-block;
  }

  .cy-dropdown__trigger {
    cursor: pointer;
  }

  .cy-dropdown__trigger:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
    border-radius: var(--radius-sm);
  }

  .cy-dropdown__menu {
    position: absolute;
    top: calc(100% + 4px);
    min-width: 180px;
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    padding: var(--space-1);
    z-index: 100;
    animation: cy-dropdown-in 150ms ease;
  }

  .cy-dropdown__menu--left {
    left: 0;
  }

  .cy-dropdown__menu--right {
    right: 0;
  }

  .cy-dropdown__item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    width: 100%;
    padding: var(--space-2) var(--space-3);
    background: none;
    border: none;
    border-radius: var(--radius-sm);
    color: var(--color-text-primary);
    font-family: var(--font-body);
    font-size: 0.875rem;
    cursor: pointer;
    transition: background var(--transition-fast);
    text-align: left;
  }

  .cy-dropdown__item--focused,
  .cy-dropdown__item:hover {
    background: var(--color-surface-hover);
  }

  .cy-dropdown__item--danger {
    color: var(--color-state-error);
  }

  .cy-dropdown__item--danger.cy-dropdown__item--focused,
  .cy-dropdown__item--danger:hover {
    background: var(--color-state-error-bg);
  }

  .cy-dropdown__icon {
    font-size: 1rem;
    width: 20px;
    text-align: center;
    flex-shrink: 0;
  }

  .cy-dropdown__label {
    flex: 1;
  }

  @keyframes cy-dropdown-in {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
