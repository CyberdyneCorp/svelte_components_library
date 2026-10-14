<svelte:options runes={true} />

<script lang="ts">
  import { type Snippet } from "svelte";

  let {
    trigger,
    children,
    open = $bindable(false),
    openDelay = 500,
    closeDelay = 200,
    position = "bottom",
  }: {
    /** The element that reveals the card; should be focusable (a link or button). */
    trigger: Snippet;
    /** Card content. Supplementary only: hover does not exist on touch devices. */
    children: Snippet;
    /** Whether the card is shown. */
    open?: boolean;
    /** Delay in ms before opening on hover or focus. */
    openDelay?: number;
    /** Delay in ms before closing once pointer and focus have left. */
    closeDelay?: number;
    /** Side of the trigger the card appears on. */
    position?: "top" | "bottom" | "left" | "right";
  } = $props();

  let rootEl: HTMLSpanElement | undefined = $state();
  let triggerEl: HTMLSpanElement | undefined = $state();
  let pointerInside = false;
  let focusInside = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  /** Opens or closes after the matching delay; re-entry cancels a pending change. */
  function sync() {
    clearTimeout(timer);
    const next = pointerInside || focusInside;
    if (next === open) return;
    timer = setTimeout(() => (open = next), next ? openDelay : closeDelay);
  }

  function setPointer(inside: boolean) {
    pointerInside = inside;
    sync();
  }

  function handleFocusIn() {
    focusInside = true;
    sync();
  }

  function handleFocusOut(e: FocusEvent) {
    // Moving focus between the trigger and the card keeps it inside.
    if (rootEl?.contains(e.relatedTarget as Node | null)) return;
    focusInside = false;
    sync();
  }

  function close() {
    clearTimeout(timer);
    const hadFocus = rootEl?.contains(document.activeElement) ?? false;
    open = false;
    if (hadFocus) {
      triggerEl?.querySelector<HTMLElement>("a[href], button, input, [tabindex]")?.focus();
    }
  }

  $effect(() => {
    if (!open) return;
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeydown);
    return () => document.removeEventListener("keydown", onKeydown);
  });

  $effect(() => () => clearTimeout(timer));
</script>

<span
  class="cy-hover-card"
  role="presentation"
  bind:this={rootEl}
  onpointerenter={() => setPointer(true)}
  onpointerleave={() => setPointer(false)}
  onfocusin={handleFocusIn}
  onfocusout={handleFocusOut}
>
  <span class="cy-hover-card__trigger" bind:this={triggerEl}>{@render trigger()}</span>
  {#if open}
    <!-- Directly after the trigger in DOM order so Tab reaches links inside the card. -->
    <span class="cy-hover-card__content cy-hover-card__content--{position}">
      {@render children()}
    </span>
  {/if}
</span>

<style>
  .cy-hover-card {
    position: relative;
    display: inline-block;
  }

  .cy-hover-card__content {
    position: absolute;
    z-index: 100;
    display: block;
    min-width: 240px;
    max-width: 320px;
    padding: var(--space-4);
    background: var(--texture-surface), var(--gradient-surface), var(--color-surface-raised);
    border: var(--border-width) var(--border-style) var(--color-border-default);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-offset), var(--shadow-lg);
    color: var(--color-text-primary);
    font-family: var(--font-body);
    font-size: 0.875rem;
    line-height: 1.5;
    white-space: normal;
    animation: cy-hover-card-in 150ms ease;
  }

  /* The pointer crosses the 8px gap within closeDelay, so the card stays open. */
  .cy-hover-card__content--bottom {
    top: calc(100% + var(--space-2));
    left: 50%;
    transform: translateX(-50%);
  }

  .cy-hover-card__content--top {
    bottom: calc(100% + var(--space-2));
    left: 50%;
    transform: translateX(-50%);
  }

  .cy-hover-card__content--left {
    right: calc(100% + var(--space-2));
    top: 50%;
    transform: translateY(-50%);
  }

  .cy-hover-card__content--right {
    left: calc(100% + var(--space-2));
    top: 50%;
    transform: translateY(-50%);
  }

  @keyframes cy-hover-card-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @media (prefers-reduced-motion: reduce) {
    .cy-hover-card__content {
      animation: none;
    }
  }
</style>
