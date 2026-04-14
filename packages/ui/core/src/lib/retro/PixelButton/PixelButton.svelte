<svelte:options runes={true} />

<script lang="ts">
  import { type Snippet } from "svelte";

  let {
    variant = "solid",
    size = "md",
    disabled = false,
    type = "button",
    fullWidth = false,
    onclick,
    children,
    ariaLabel,
  }: {
    variant?: "solid" | "outline" | "ghost" | "neon";
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
    fullWidth?: boolean;
    onclick?: (e: MouseEvent) => void;
    children?: Snippet;
    ariaLabel?: string;
  } = $props();

  function handle(e: MouseEvent) {
    if (disabled) return;
    onclick?.(e);
  }
</script>

<button
  class="cy-pxbtn cy-pxbtn--{variant} cy-pxbtn--{size}"
  class:cy-pxbtn--full={fullWidth}
  {disabled}
  {type}
  aria-label={ariaLabel}
  onclick={handle}
>
  {#if children}{@render children()}{/if}
</button>

<style>
  .cy-pxbtn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border: 2px solid var(--color-text-primary, #12121a);
    font-family: var(--font-body, monospace);
    font-weight: 700;
    cursor: pointer;
    box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.4);
    transition: transform 80ms ease, box-shadow 80ms ease;
  }
  .cy-pxbtn:active:not(:disabled) { transform: translate(2px, 2px); box-shadow: 1px 1px 0 rgba(0, 0, 0, 0.4); }
  .cy-pxbtn:disabled { opacity: 0.5; cursor: not-allowed; }
  .cy-pxbtn--sm { padding: 4px 10px; font-size: 0.75rem; }
  .cy-pxbtn--md { padding: 6px 14px; font-size: 0.85rem; }
  .cy-pxbtn--lg { padding: 10px 20px; font-size: 1rem; }
  .cy-pxbtn--full { width: 100%; }

  .cy-pxbtn--solid { background: var(--color-action-brand-default, #00b32d); color: var(--color-action-brand-text, #fff); }
  .cy-pxbtn--solid:hover:not(:disabled) { background: var(--color-action-brand-hover, #009926); }

  .cy-pxbtn--outline { background: var(--color-surface-default, #fff); color: var(--color-text-primary, #12121a); }
  .cy-pxbtn--outline:hover:not(:disabled) { background: var(--color-surface-hover, #ebebf0); }

  .cy-pxbtn--ghost { background: transparent; border-color: transparent; box-shadow: none; color: var(--color-text-primary, #12121a); }
  .cy-pxbtn--ghost:hover:not(:disabled) { background: rgba(0, 0, 0, 0.05); }

  .cy-pxbtn--neon {
    background: #000;
    color: #00ff41;
    border-color: #00ff41;
    box-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
  }
  .cy-pxbtn--neon:hover:not(:disabled) { background: rgba(0, 255, 65, 0.1); }
</style>
