<svelte:options runes={true} />

<script lang="ts">
  import MegaMenu from "./MegaMenu.svelte";

  let {
    sections = [],
    startOpen = false,
  }: {
    sections?: Array<{ title: string; items: Array<{ label: string; href?: string; description?: string; icon?: string }> }>;
    startOpen?: boolean;
  } = $props();

  let open = $state(startOpen);
</script>

<div style="position: relative; min-height: 400px;">
  <MegaMenu {sections} bind:open>
    {#snippet trigger()}
      <span style="padding: 8px 16px; background: var(--color-surface-hover); color: var(--color-text-primary); border: 1px solid var(--color-border-default); border-radius: 6px; cursor: pointer; font-size: 0.875rem; display: inline-block;">
        Explore ▾
      </span>
    {/snippet}
  </MegaMenu>
</div>
