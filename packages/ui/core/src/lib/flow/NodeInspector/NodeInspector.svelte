<svelte:options runes={true} />

<script lang="ts">
  import { type Snippet } from "svelte";
  import Tabs from "../../navigation/Tabs/Tabs.svelte";

  export type NodeInspectorTab = {
    id: string;
    label: string;
  };

  let {
    tabs = [],
    activeTab = $bindable(""),
    width = "332px",
    panels = {},
    onchange,
  }: {
    tabs?: NodeInspectorTab[];
    activeTab?: string;
    width?: string;
    panels?: Record<string, Snippet>;
    onchange?: (id: string) => void;
  } = $props();

  $effect(() => {
    if (!activeTab && tabs.length > 0) {
      activeTab = tabs[0].id;
    }
  });

  const activePanel = $derived(activeTab ? panels[activeTab] : undefined);
</script>

<aside class="cy-node-inspector" style:width>
  <div class="cy-node-inspector__tabs">
    <Tabs items={tabs} bind:activeId={activeTab} {onchange} />
  </div>
  <div class="cy-node-inspector__body">
    {#if activePanel}
      {@render activePanel()}
    {/if}
  </div>
</aside>

<style>
  .cy-node-inspector {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--color-bg-secondary);
    border-left: 1px solid var(--color-border-default);
    font-family: var(--font-body);
    color: var(--color-text-primary);
  }

  .cy-node-inspector__tabs {
    border-bottom: 1px solid var(--color-border-subtle);
    padding: 0 var(--space-2);
  }

  .cy-node-inspector__body {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-3);
  }

  .cy-node-inspector :global(.cy-node-inspector-section) {
    margin-bottom: var(--space-5);
  }

  .cy-node-inspector :global(.cy-node-inspector-section__title) {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-mono);
    font-size: 10.5px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--color-text-tertiary);
    margin-bottom: var(--space-2);
  }

  .cy-node-inspector :global(.cy-node-inspector-row) {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-2);
  }

  .cy-node-inspector :global(.cy-node-inspector-row__key) {
    flex: 0 0 110px;
    font-size: 12px;
    color: var(--color-text-secondary);
  }

  .cy-node-inspector :global(.cy-node-inspector-row__value) {
    flex: 1;
    min-width: 0;
  }
</style>
