<svelte:options runes={true} />

<script lang="ts">
  import { type Snippet } from "svelte";

  let {
    variant = "default",
    padding = "md",
    hoverable = false,
    onclick,
    children,
  }: {
    variant?: "default" | "elevated" | "outlined";
    padding?: "sm" | "md" | "lg";
    hoverable?: boolean;
    onclick?: (e: MouseEvent) => void;
    children?: Snippet;
  } = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions, a11y_no_noninteractive_tabindex -->
<div
  class="cy-card cy-card--{variant} cy-card--pad-{padding}"
  class:cy-card--hoverable={hoverable || !!onclick}
  {onclick}
  role={onclick ? "button" : undefined}
  tabindex={onclick ? 0 : undefined}
>
  {#if children}
    {@render children()}
  {/if}
</div>

<style>
  .cy-card {
    background: var(--texture-surface), var(--gradient-surface), var(--card-bg);
    border: var(--border-width) var(--border-style) var(--card-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-offset), var(--shadow-raised);
    transition: all var(--transition-default);
  }

  .cy-card--pad-sm {
    padding: var(--space-3);
  }

  .cy-card--pad-md {
    padding: var(--space-4);
  }

  .cy-card--pad-lg {
    padding: var(--space-6);
  }

  .cy-card--default {
    background: var(--texture-surface), var(--gradient-surface), var(--card-bg);
  }

  .cy-card--elevated {
    background: var(--texture-surface), var(--gradient-surface), var(--color-surface-raised);
    box-shadow: var(--shadow-offset), var(--shadow-md);
  }

  .cy-card--outlined {
    background: transparent;
    border-color: var(--color-border-default);
  }

  .cy-card--hoverable {
    cursor: pointer;
  }

  .cy-card--hoverable:hover {
    border-color: var(--card-hover-border);
    box-shadow: var(--shadow-offset), var(--shadow-raised), var(--shadow-glow-green);
    transform: translateY(-2px);
  }
</style>
