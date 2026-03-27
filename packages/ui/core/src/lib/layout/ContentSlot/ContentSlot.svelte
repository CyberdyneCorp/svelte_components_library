<svelte:options runes={true} />

<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    name = "",
    padding = "md",
    children,
  }: {
    name?: string;
    padding?: "none" | "sm" | "md" | "lg";
    children?: Snippet;
  } = $props();
</script>

<div class="cy-content-slot cy-content-slot--pad-{padding}" data-slot={name || undefined}>
  {#if children}
    {@render children()}
  {/if}
</div>

<style>
  .cy-content-slot {
    width: 100%;
  }

  .cy-content-slot--pad-none {
    padding: 0;
  }

  .cy-content-slot--pad-sm {
    padding: var(--space-2);
  }

  .cy-content-slot--pad-md {
    padding: var(--space-4);
  }

  .cy-content-slot--pad-lg {
    padding: var(--space-6);
  }
</style>
