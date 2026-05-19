<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import NodeInspector from "./NodeInspector.svelte";

  const { Story } = defineMeta({
    title: "Flow/NodeInspector",
    component: NodeInspector,
    tags: ["autodocs"],
  });
</script>

<script lang="ts">
  let activeTab = $state("inspect");

  const tabs = [
    { id: "inspect", label: "Inspect" },
    { id: "simulate", label: "Simulate" },
    { id: "graph", label: "Graph" },
  ];
</script>

{#snippet inspectPanel()}
  <div class="cy-node-inspector-section">
    <div class="cy-node-inspector-section__title">
      <span style="width:8px; height:8px; border-radius:50%; background:#3FE07F; box-shadow:0 0 6px #3FE07F"></span>
      Rolling aggregate
    </div>
    <div style="font-family: var(--font-mono); font-size: 11px; color: var(--color-text-tertiary);">n_2x</div>
  </div>
  <div class="cy-node-inspector-section">
    <div class="cy-node-inspector-section__title">Parameters</div>
    <div class="cy-node-inspector-row">
      <div class="cy-node-inspector-row__key">Window Days</div>
      <div class="cy-node-inspector-row__value">
        <input type="number" value="14" style="width:100%; padding:4px 6px; background:var(--color-bg-primary); border:1px solid var(--color-border-default); border-radius:var(--radius-xs); color:var(--color-text-primary);" />
      </div>
    </div>
    <div class="cy-node-inspector-row">
      <div class="cy-node-inspector-row__key">Op</div>
      <div class="cy-node-inspector-row__value">
        <select style="width:100%; padding:4px 6px; background:var(--color-bg-primary); border:1px solid var(--color-border-default); border-radius:var(--radius-xs); color:var(--color-text-primary);">
          <option>mean</option><option>min</option><option>max</option>
        </select>
      </div>
    </div>
  </div>
{/snippet}

{#snippet graphPanel()}
  <div class="cy-node-inspector-section">
    <div class="cy-node-inspector-section__title">Topology</div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
      {#each [['Sources', 1], ['Indices', 1], ['Conditions', 3], ['Payouts', 1]] as [k, v]}
        <div style="padding:8px; border:1px solid var(--color-border-default); border-radius:5px; background: var(--color-surface-raised);">
          <div style="font-family: var(--font-mono); font-size:10.5px; color: var(--color-text-tertiary); text-transform: uppercase; letter-spacing: 0.1em">{k}</div>
          <div style="font-family: var(--font-mono); font-size: 18px; color: var(--color-text-primary)">{v}</div>
        </div>
      {/each}
    </div>
  </div>
  <div class="cy-node-inspector-section">
    <div class="cy-node-inspector-section__title">Validation</div>
    <div style="color: var(--color-state-success); font-size: 12px">✓ Trigger graph is valid.</div>
  </div>
{/snippet}

{#snippet simulatePanel()}
  <div class="cy-node-inspector-section">
    <div class="cy-node-inspector-section__title">Scenario</div>
    <div style="font-size: 12.5px; color: var(--color-text-primary);">Mozambique flood</div>
    <div style="font-size: 11.5px; color: var(--color-text-tertiary); margin-top: 4px;">SAR backscatter drop across cluster of fields</div>
  </div>
{/snippet}

<Story name="Default">
  <div style="height: 600px; display: flex;">
    <div style="flex: 1; background: var(--color-bg-primary);"></div>
    <NodeInspector
      {tabs}
      bind:activeTab
      panels={{ inspect: inspectPanel, simulate: simulatePanel, graph: graphPanel }}
    />
  </div>
</Story>
