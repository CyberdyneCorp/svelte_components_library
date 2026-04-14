<svelte:options runes={true} />

<script lang="ts">
  import { type Snippet } from "svelte";

  let {
    columns = 2,
    gap = 12,
    align = "start",
    side = "left",
    children,
    ariaLabel = "Desktop icons",
  }: {
    columns?: number;
    gap?: number;
    align?: "start" | "center" | "end";
    side?: "left" | "right";
    children?: Snippet;
    ariaLabel?: string;
  } = $props();
</script>

<div
  class="cy-dgrid cy-dgrid--{side} cy-dgrid--{align}"
  role="group"
  aria-label={ariaLabel}
  style:--cy-dgrid-cols={columns}
  style:--cy-dgrid-gap="{gap}px"
>
  {#if children}{@render children()}{/if}
</div>

<style>
  .cy-dgrid {
    display: grid;
    grid-template-columns: repeat(var(--cy-dgrid-cols, 2), auto);
    gap: var(--cy-dgrid-gap, 12px);
    padding: 12px;
  }
  .cy-dgrid--left { justify-items: start; }
  .cy-dgrid--right { justify-items: end; }
  .cy-dgrid--start { align-content: start; }
  .cy-dgrid--center { align-content: center; }
  .cy-dgrid--end { align-content: end; }
</style>
