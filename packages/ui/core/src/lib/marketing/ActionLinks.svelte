<svelte:options runes={true} />

<script lang="ts">
  import type { MarketingAction } from "./types.js";

  let { actions = [] }: { actions?: MarketingAction[] } = $props();
</script>

{#if actions.length}
  <div class="cy-marketing-actions">
    {#each actions as action, index (`${action.href}-${index}`)}
      <a
        class="cy-marketing-action cy-marketing-action--{action.variant ?? (index === 0 ? 'primary' : 'secondary')}"
        href={action.href}
      >
        {action.label}
      </a>
    {/each}
  </div>
{/if}

<style>
  .cy-marketing-actions { display: flex; flex-wrap: wrap; gap: .75rem; align-items: center; }
  .cy-marketing-action {
    display: inline-flex;
    min-height: 2.75rem;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
    border-radius: var(--radius-md, .5rem);
    padding: .7rem 1.1rem;
    font: 650 .95rem/1.2 var(--font-body, system-ui, sans-serif);
    text-decoration: none;
    transition: background-color .16s ease, border-color .16s ease, color .16s ease;
  }
  .cy-marketing-action:focus-visible { outline: 3px solid var(--color-action-secondary-default, #00d4ff); outline-offset: 3px; }
  .cy-marketing-action--primary {
    background: var(--color-action-brand-default, #00ff41);
    color: var(--color-bg-primary, #080a0d);
  }
  .cy-marketing-action--primary:hover { filter: brightness(1.08); }
  .cy-marketing-action--secondary {
    border-color: var(--color-border-default, #555b67);
    color: var(--color-text-primary, #f3f4f6);
    background: transparent;
  }
  .cy-marketing-action--secondary:hover { background: var(--color-surface-hover, #262a34); }
  .cy-marketing-action--text { padding-inline: .25rem; color: var(--color-action-brand-default, #00ff41); }
  @media (prefers-reduced-motion: reduce) { .cy-marketing-action { transition: none; } }
</style>
