<svelte:options runes={true} />

<script lang="ts">
  import { type Snippet } from "svelte";

  let {
    trigger,
    content,
    position = "bottom",
    open = $bindable(false),
    closeOnClickOutside = true,
  }: {
    trigger: Snippet;
    content: Snippet;
    position?: "top" | "bottom" | "left" | "right";
    open: boolean;
    closeOnClickOutside?: boolean;
  } = $props();

  let containerEl: HTMLDivElement | undefined = $state();

  function toggle() {
    open = !open;
  }

  function handleClickOutside(e: MouseEvent) {
    if (closeOnClickOutside && containerEl && !containerEl.contains(e.target as Node)) {
      open = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape" && open) {
      open = false;
    }
  }

  $effect(() => {
    if (open) {
      document.addEventListener("click", handleClickOutside, true);
      document.addEventListener("keydown", handleKeydown, true);
      return () => {
        document.removeEventListener("click", handleClickOutside, true);
        document.removeEventListener("keydown", handleKeydown, true);
      };
    }
  });
</script>

<div class="cy-popover" bind:this={containerEl}>
  <div class="cy-popover__trigger" onclick={toggle} role="button" tabindex="0" aria-expanded={open}>
    {@render trigger()}
  </div>

  {#if open}
    <div class="cy-popover__content cy-popover__content--{position}">
      <div class="cy-popover__arrow cy-popover__arrow--{position}"></div>
      <div class="cy-popover__body">
        {@render content()}
      </div>
    </div>
  {/if}
</div>

<style>
  .cy-popover {
    position: relative;
    display: inline-block;
  }

  .cy-popover__trigger {
    cursor: pointer;
  }

  .cy-popover__trigger:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
    border-radius: var(--radius-sm);
  }

  .cy-popover__content {
    position: absolute;
    z-index: 100;
    animation: cy-popover-in 150ms ease;
  }

  .cy-popover__content--bottom {
    top: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%);
  }

  .cy-popover__content--top {
    bottom: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%);
  }

  .cy-popover__content--left {
    right: calc(100% + 10px);
    top: 50%;
    transform: translateY(-50%);
  }

  .cy-popover__content--right {
    left: calc(100% + 10px);
    top: 50%;
    transform: translateY(-50%);
  }

  .cy-popover__body {
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg), var(--shadow-glow-cyan);
    padding: var(--space-4);
    min-width: 200px;
    font-family: var(--font-body);
    font-size: 0.875rem;
    color: var(--color-text-primary);
  }

  .cy-popover__arrow {
    position: absolute;
    width: 10px;
    height: 10px;
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border-default);
    transform: rotate(45deg);
  }

  .cy-popover__arrow--bottom {
    top: -5px;
    left: 50%;
    margin-left: -5px;
    border-right: none;
    border-bottom: none;
  }

  .cy-popover__arrow--top {
    bottom: -5px;
    left: 50%;
    margin-left: -5px;
    border-left: none;
    border-top: none;
  }

  .cy-popover__arrow--left {
    right: -5px;
    top: 50%;
    margin-top: -5px;
    border-left: none;
    border-bottom: none;
  }

  .cy-popover__arrow--right {
    left: -5px;
    top: 50%;
    margin-top: -5px;
    border-right: none;
    border-top: none;
  }

  @keyframes cy-popover-in {
    from {
      opacity: 0;
      transform: translateX(-50%) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) scale(1);
    }
  }

  .cy-popover__content--left {
    animation-name: cy-popover-in-side;
  }

  .cy-popover__content--right {
    animation-name: cy-popover-in-side;
  }

  @keyframes cy-popover-in-side {
    from {
      opacity: 0;
      transform: translateY(-50%) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(-50%) scale(1);
    }
  }
</style>
