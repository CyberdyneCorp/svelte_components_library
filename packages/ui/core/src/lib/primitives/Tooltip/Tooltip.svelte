<svelte:options runes={true} />

<script lang="ts">
  import { type Snippet } from "svelte";

  let {
    text = "",
    position = "top",
    children,
  }: {
    text: string;
    position?: "top" | "bottom" | "left" | "right";
    children?: Snippet;
  } = $props();

  let visible = $state(false);

  function show() {
    visible = true;
  }

  function hide() {
    visible = false;
  }
</script>

<div
  class="cy-tooltip-wrapper"
  onmouseenter={show}
  onmouseleave={hide}
  onfocusin={show}
  onfocusout={hide}
>
  {#if children}
    {@render children()}
  {/if}
  {#if visible}
    <div class="cy-tooltip cy-tooltip--{position}" role="tooltip">
      {text}
      <span class="cy-tooltip__arrow"></span>
    </div>
  {/if}
</div>

<style>
  .cy-tooltip-wrapper {
    position: relative;
    display: inline-flex;
  }

  .cy-tooltip {
    position: absolute;
    z-index: 1000;
    padding: var(--space-1) var(--space-3);
    background: var(--color-bg-elevated);
    color: var(--color-text-primary);
    font-family: var(--font-mono);
    font-size: 0.75rem;
    line-height: 1.4;
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-border-default);
    box-shadow: var(--shadow-md), 0 0 8px rgba(0, 212, 255, 0.1);
    white-space: nowrap;
    pointer-events: none;
    animation: tooltip-fade-in 150ms ease;
  }

  .cy-tooltip__arrow {
    position: absolute;
    width: 6px;
    height: 6px;
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border-default);
    transform: rotate(45deg);
  }

  /* Top */
  .cy-tooltip--top {
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
  }

  .cy-tooltip--top .cy-tooltip__arrow {
    bottom: -4px;
    left: 50%;
    margin-left: -3px;
    border-top: none;
    border-left: none;
  }

  /* Bottom */
  .cy-tooltip--bottom {
    top: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
  }

  .cy-tooltip--bottom .cy-tooltip__arrow {
    top: -4px;
    left: 50%;
    margin-left: -3px;
    border-bottom: none;
    border-right: none;
  }

  /* Left */
  .cy-tooltip--left {
    right: calc(100% + 8px);
    top: 50%;
    transform: translateY(-50%);
  }

  .cy-tooltip--left .cy-tooltip__arrow {
    right: -4px;
    top: 50%;
    margin-top: -3px;
    border-bottom: none;
    border-left: none;
  }

  /* Right */
  .cy-tooltip--right {
    left: calc(100% + 8px);
    top: 50%;
    transform: translateY(-50%);
  }

  .cy-tooltip--right .cy-tooltip__arrow {
    left: -4px;
    top: 50%;
    margin-top: -3px;
    border-top: none;
    border-right: none;
  }

  @keyframes tooltip-fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
