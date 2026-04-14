<svelte:options runes={true} />

<script lang="ts">
  import { type Snippet } from "svelte";

  let {
    text,
    position = "top",
    open = $bindable<boolean | undefined>(undefined),
    children,
  }: {
    text: string;
    position?: "top" | "bottom" | "left" | "right";
    open?: boolean;
    children?: Snippet;
  } = $props();

  let hovered = $state(false);
  let shown = $derived(open ?? hovered);
</script>

<span
  class="cy-ptip"
  onmouseenter={() => (hovered = true)}
  onmouseleave={() => (hovered = false)}
  onfocusin={() => (hovered = true)}
  onfocusout={() => (hovered = false)}
  role="group"
>
  {#if children}{@render children()}{/if}
  {#if shown}
    <span role="tooltip" class="cy-ptip__box cy-ptip__box--{position}" data-testid="cy-ptip">
      {text}
    </span>
  {/if}
</span>

<style>
  .cy-ptip { position: relative; display: inline-block; }
  .cy-ptip__box {
    position: absolute;
    padding: 4px 8px;
    background: var(--color-text-primary, #12121a);
    color: var(--color-text-inverse, #fff);
    border: 2px solid var(--color-text-primary, #12121a);
    font-family: var(--font-body, monospace);
    font-size: 0.72rem;
    white-space: nowrap;
    z-index: 100;
    pointer-events: none;
  }
  .cy-ptip__box--top { bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%); }
  .cy-ptip__box--bottom { top: calc(100% + 6px); left: 50%; transform: translateX(-50%); }
  .cy-ptip__box--left { right: calc(100% + 6px); top: 50%; transform: translateY(-50%); }
  .cy-ptip__box--right { left: calc(100% + 6px); top: 50%; transform: translateY(-50%); }
</style>
