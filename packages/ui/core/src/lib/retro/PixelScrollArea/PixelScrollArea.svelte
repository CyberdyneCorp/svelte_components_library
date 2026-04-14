<svelte:options runes={true} />

<script lang="ts">
  import { type Snippet } from "svelte";

  let {
    maxHeight = "100%",
    axis = "vertical",
    children,
    ariaLabel,
  }: {
    maxHeight?: string;
    axis?: "vertical" | "horizontal" | "both";
    children?: Snippet;
    ariaLabel?: string;
  } = $props();
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
  class="cy-pscroll cy-pscroll--{axis}"
  style:max-height={maxHeight}
  role="region"
  aria-label={ariaLabel}
  tabindex="0"
>
  {#if children}{@render children()}{/if}
</div>

<style>
  .cy-pscroll {
    font-family: var(--font-body, monospace);
    border: 2px solid var(--color-text-primary, #12121a);
    background: var(--color-surface-default, #fff);
  }
  .cy-pscroll--vertical { overflow-y: auto; overflow-x: hidden; }
  .cy-pscroll--horizontal { overflow-x: auto; overflow-y: hidden; }
  .cy-pscroll--both { overflow: auto; }
  .cy-pscroll::-webkit-scrollbar { width: 14px; height: 14px; background: var(--color-surface-raised, #f5f5fa); border-left: 2px solid var(--color-text-primary, #12121a); }
  .cy-pscroll::-webkit-scrollbar-thumb { background: var(--color-text-primary, #12121a); border: 2px solid var(--color-surface-raised, #f5f5fa); }
  .cy-pscroll::-webkit-scrollbar-thumb:hover { background: var(--color-action-tertiary-default, #7e22ce); }
  .cy-pscroll::-webkit-scrollbar-corner { background: var(--color-surface-raised, #f5f5fa); }
  .cy-pscroll { scrollbar-width: thin; scrollbar-color: var(--color-text-primary, #12121a) var(--color-surface-raised, #f5f5fa); }
</style>
