<svelte:options runes={true} />

<script lang="ts">
  import Button from "../Button/Button.svelte";
  import Icon from "../Icon/Icon.svelte";
  import type { SplitButtonItem } from "./types.js";

  let {
    label,
    onclick,
    items = [],
    onselect,
    variant = "brand",
    size = "md",
    disabled = false,
    loading = false,
    menuLabel = "More actions",
    align = "left",
  }: {
    /** Text of the primary action. */
    label: string;
    /** Called when the primary action is clicked; never opens the menu. */
    onclick?: (e: MouseEvent) => void;
    /** Secondary actions listed in the menu (Dropdown item shape). */
    items?: SplitButtonItem[];
    /** Called with the chosen item's `value`; the menu closes afterwards. */
    onselect?: (value: string) => void;
    /** Button variant applied to both the primary action and the caret. */
    variant?: "brand" | "secondary" | "outline" | "ghost" | "danger";
    /** Button size applied to both the primary action and the caret. */
    size?: "sm" | "md" | "lg";
    /** Disables the primary action and the caret together. */
    disabled?: boolean;
    /** Shows the primary action's spinner and disables both buttons. */
    loading?: boolean;
    /** Accessible name of the caret and of the menu (i18n). */
    menuLabel?: string;
    /** Edge of the component the menu aligns to. */
    align?: "left" | "right";
  } = $props();

  const menuId = `cy-split-menu-${Math.random().toString(36).slice(2, 9)}`;
  const iconSizes: Record<string, number> = { sm: 14, md: 16, lg: 18 };

  let open = $state(false);
  let rootEl: HTMLDivElement | undefined = $state();
  let menuEl: HTMLDivElement | undefined = $state();
  let caretRef: HTMLButtonElement | null = $state(null);

  let isDisabled = $derived(disabled || loading);

  function menuItems(): HTMLButtonElement[] {
    return Array.from(menuEl?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? []);
  }

  function focusItem(index: number) {
    const els = menuItems();
    if (els.length === 0) return;
    els[(index + els.length) % els.length].focus();
  }

  function close(restoreFocus = false) {
    open = false;
    if (restoreFocus) caretRef?.focus();
  }

  function select(value: string) {
    onselect?.(value);
    close(true);
  }

  function handleMenuKeydown(e: KeyboardEvent) {
    const els = menuItems();
    const current = els.indexOf(document.activeElement as HTMLButtonElement);
    const actions: Record<string, () => void> = {
      ArrowDown: () => focusItem(current + 1),
      ArrowUp: () => focusItem(current - 1),
      Home: () => focusItem(0),
      End: () => focusItem(els.length - 1),
      Escape: () => close(true),
      Tab: () => close(),
    };
    const action = actions[e.key];
    if (!action) return;
    if (e.key !== "Tab") e.preventDefault();
    action();
  }

  function handleClickOutside(e: MouseEvent) {
    if (rootEl && !rootEl.contains(e.target as Node)) close();
  }

  // Menu-button pattern: ArrowDown/ArrowUp on the closed caret open the menu.
  function handleCaretKeydown(e: KeyboardEvent) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    open = true;
  }

  $effect(() => {
    const el = caretRef;
    if (!el) return;
    el.addEventListener("keydown", handleCaretKeydown);
    return () => el.removeEventListener("keydown", handleCaretKeydown);
  });

  $effect(() => {
    if (!open) return;
    document.addEventListener("click", handleClickOutside, true);
    return () => document.removeEventListener("click", handleClickOutside, true);
  });

  // Menu-button pattern: focus lands on the first item once the menu is open.
  $effect(() => {
    if (open && menuEl) focusItem(0);
  });
</script>

<div class="cy-split-btn" bind:this={rootEl}>
  <!-- Button hides its content while loading; keep the primary action named for assistive technology. -->
  <Button {variant} {size} {disabled} {loading} ariaLabel={loading ? label : ""} {onclick}>
    {label}
  </Button>
  <Button
    {variant}
    {size}
    disabled={isDisabled}
    ariaLabel={menuLabel}
    aria-haspopup="menu"
    aria-expanded={open}
    aria-controls={open ? menuId : undefined}
    onclick={() => (open = !open)}
    bind:ref={caretRef}
  >
    <Icon name="chevron-down" size={iconSizes[size]} />
  </Button>

  {#if open}
    <div
      class="cy-split-btn__menu cy-split-btn__menu--{align}"
      id={menuId}
      role="menu"
      aria-label={menuLabel}
      tabindex="-1"
      bind:this={menuEl}
      onkeydown={handleMenuKeydown}
    >
      {#each items as item (item.value)}
        <button
          type="button"
          class="cy-split-btn__item"
          class:cy-split-btn__item--danger={item.variant === "danger"}
          role="menuitem"
          tabindex="-1"
          onclick={() => select(item.value)}
        >
          {#if item.icon}
            <span class="cy-split-btn__icon" aria-hidden="true">{item.icon}</span>
          {/if}
          <span class="cy-split-btn__label">{item.label}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .cy-split-btn {
    position: relative;
    display: inline-flex;
    align-items: stretch;
  }

  /* Join the two Buttons: shared outer radius, one divider between them. */
  .cy-split-btn > :global(.cy-btn:first-child) {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  .cy-split-btn > :global(.cy-btn:nth-child(2)) {
    position: relative;
    z-index: 1;
    margin-left: calc(-1 * var(--border-width));
    padding-inline: var(--space-2);
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-left-color: color-mix(in srgb, currentColor 30%, transparent);
  }

  .cy-split-btn > :global(.cy-btn:focus-visible) {
    z-index: 2;
  }

  .cy-split-btn__menu {
    position: absolute;
    top: calc(100% + var(--space-1));
    z-index: 100;
    min-width: 180px;
    padding: var(--space-1);
    background: var(--color-surface-raised);
    border: var(--border-width) var(--border-style) var(--color-border-default);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    outline: none;
  }

  .cy-split-btn__menu--left {
    left: 0;
  }

  .cy-split-btn__menu--right {
    right: 0;
  }

  .cy-split-btn__item {
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
    text-align: left;
    cursor: pointer;
    transition: background var(--transition-fast);
  }

  .cy-split-btn__item:hover,
  .cy-split-btn__item:focus-visible {
    background: var(--color-surface-hover);
    outline: none;
  }

  .cy-split-btn__item--danger {
    color: var(--color-state-error);
  }

  .cy-split-btn__item--danger:hover,
  .cy-split-btn__item--danger:focus-visible {
    background: var(--color-state-error-bg);
  }

  .cy-split-btn__icon {
    width: 20px;
    flex-shrink: 0;
    font-size: 1rem;
    text-align: center;
  }

  .cy-split-btn__label {
    flex: 1;
  }
</style>
