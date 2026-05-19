<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import NodeEditor from "../NodeEditor/NodeEditor.svelte";
  import NodePalette from "../NodePalette/NodePalette.svelte";
  import NodeInspector from "../NodeInspector/NodeInspector.svelte";
  import FlowMinimap from "../FlowMinimap/FlowMinimap.svelte";
  import FlowCanvasControls from "../FlowCanvasControls/FlowCanvasControls.svelte";
  import {
    INITIAL_NODES,
    INITIAL_EDGES,
    PALETTE_GROUPS,
    TEMPLATES,
    makeNode,
  } from "./parametric-data.js";

  const { Story } = defineMeta({
    title: "Flow/Examples/ParametricEditor",
    tags: ["autodocs"],
  });
</script>

<script lang="ts">
  import type { FlowEdgeSpec, FlowNodeSpec, Viewport } from "../types.js";

  let nodes = $state<FlowNodeSpec[]>(structuredClone(INITIAL_NODES));
  let edges = $state<FlowEdgeSpec[]>(structuredClone(INITIAL_EDGES));
  let selectedId = $state<string | null>(null);
  let viewport = $state<Viewport>({ x: 0, y: 0, z: 1 });
  let filter = $state("");
  let activeTab = $state("inspect");

  let uid = 200;
  const nextId = (p = "n") => `${p}_${(++uid).toString(36)}`;

  const selectedNode = $derived(nodes.find((n) => n.id === selectedId) ?? null);

  const stats = $derived.by(() => {
    const sources = nodes.filter((n) => ["s1"].includes(n.type)).length;
    const indices = nodes.filter((n) => ["flood"].includes(n.type)).length;
    const conditions = nodes.filter((n) => ["gt", "and"].includes(n.type)).length;
    const payouts = nodes.filter((n) => ["payout"].includes(n.type)).length;
    const issues: { level: "warn" | "error"; msg: string }[] = [];
    if (nodes.length > 0 && payouts === 0) {
      issues.push({ level: "warn", msg: "No payout node — graph has no outcome." });
    }
    nodes.forEach((n) => {
      n.inputs.forEach((p) => {
        const connected = edges.some(
          (e) => e.target.nodeId === n.id && e.target.portId === p.id,
        );
        if (!connected) {
          issues.push({
            level: "warn",
            msg: `${n.title ?? n.type}: input “${p.label}” is unconnected.`,
          });
        }
      });
    });
    const cost = nodes.length === 0
      ? "—"
      : (nodes.length * 1.4 + edges.length * 0.3 + payouts * 8).toFixed(2);
    return { sources, indices, conditions, payouts, issues, cost };
  });

  function onnodemove(id: string, x: number, y: number) {
    const n = nodes.find((nn) => nn.id === id);
    if (!n) return;
    n.x = x;
    n.y = y;
  }

  function onnodeadd(typeKey: string, x: number, y: number) {
    const tpl = TEMPLATES[typeKey];
    if (!tpl) return;
    const node = makeNode(typeKey, nextId(), x, y);
    nodes = [...nodes, node];
    selectedId = node.id;
  }

  function onedgeadd(e: Omit<FlowEdgeSpec, "id">) {
    const exists = edges.some(
      (x) => x.target.nodeId === e.target.nodeId && x.target.portId === e.target.portId,
    );
    if (exists) return;
    edges = [...edges, { id: nextId("e"), ...e }];
  }

  function onedgedelete(id: string) {
    edges = edges.filter((e) => e.id !== id);
  }

  function deleteSelected() {
    if (!selectedId) return;
    nodes = nodes.filter((n) => n.id !== selectedId);
    edges = edges.filter(
      (e) => e.source.nodeId !== selectedId && e.target.nodeId !== selectedId,
    );
    selectedId = null;
  }

  function zoom(factor: number) {
    const z = Math.max(0.3, Math.min(1.6, viewport.z * factor));
    viewport = { ...viewport, z };
  }

  function fit() {
    if (nodes.length === 0) {
      viewport = { x: 40, y: 40, z: 1 };
      return;
    }
    const xs = nodes.map((n) => n.x);
    const ys = nodes.map((n) => n.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs) + 224;
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys) + 160;
    const cw = 600;
    const ch = 500;
    const pad = 60;
    const sx = (cw - pad * 2) / (maxX - minX);
    const sy = (ch - pad * 2) / (maxY - minY);
    const z = Math.min(1, sx, sy);
    const cx = (maxX + minX) / 2;
    const cy = (maxY + minY) / 2;
    viewport = { x: cw / 2 - cx * z, y: ch / 2 - cy * z, z };
  }

  function changeData(key: string, value: unknown) {
    if (!selectedNode) return;
    selectedNode.data = { ...selectedNode.data, [key]: value };
    selectedNode.rows = TEMPLATES[selectedNode.type].render(selectedNode.data ?? {});
  }
</script>

{#snippet inspectPanel()}
  {#if selectedNode}
    <div class="cy-node-inspector-section">
      <div class="cy-node-inspector-section__title" style:color={selectedNode.color}>
        <span style="width:8px;height:8px;border-radius:50%;background:currentColor;box-shadow:0 0 8px currentColor"></span>
        {selectedNode.title ?? selectedNode.type}
      </div>
      <div style="font-family:var(--font-mono); font-size:11px; color:var(--color-text-tertiary)">{selectedNode.id}</div>
    </div>
    <div class="cy-node-inspector-section">
      <div class="cy-node-inspector-section__title">Parameters</div>
      {#each Object.entries(selectedNode.data ?? {}) as [k, v] (k)}
        <div class="cy-node-inspector-row">
          <div class="cy-node-inspector-row__key">{k}</div>
          <div class="cy-node-inspector-row__value">
            {#if typeof v === "number"}
              <input
                type="number"
                value={v}
                style="width:100%; padding:4px 6px; background:var(--color-bg-primary); border:1px solid var(--color-border-default); border-radius:var(--radius-xs); color:var(--color-text-primary); font-family:var(--font-mono); font-size:12px;"
                oninput={(e) => changeData(k, Number((e.currentTarget as HTMLInputElement).value))}
              />
            {:else}
              <input
                type="text"
                value={String(v)}
                style="width:100%; padding:4px 6px; background:var(--color-bg-primary); border:1px solid var(--color-border-default); border-radius:var(--radius-xs); color:var(--color-text-primary); font-family:var(--font-mono); font-size:12px;"
                oninput={(e) => changeData(k, (e.currentTarget as HTMLInputElement).value)}
              />
            {/if}
          </div>
        </div>
      {/each}
    </div>
    <div class="cy-node-inspector-section">
      <button
        onclick={deleteSelected}
        style="width:100%; padding:8px; background:transparent; border:1px solid color-mix(in srgb, var(--color-state-error) 30%, transparent); border-radius:var(--radius-sm); color:var(--color-state-error); cursor:pointer; font-family:var(--font-mono); font-size:12px; letter-spacing:0.04em; text-transform:uppercase;"
      >Delete node</button>
    </div>
  {:else}
    <div style="padding:24px 14px; text-align:center; color:var(--color-text-tertiary);">
      <div style="font-size:24px; margin-bottom:8px;">⌖</div>
      <div style="font-size:12.5px;">Select a node to edit its parameters.</div>
    </div>
  {/if}
{/snippet}

{#snippet graphPanel()}
  <div class="cy-node-inspector-section">
    <div class="cy-node-inspector-section__title">Topology</div>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
      {#each [['Sources', stats.sources], ['Indices', stats.indices], ['Conditions', stats.conditions], ['Payouts', stats.payouts]] as [k, v] (k)}
        <div style="padding:8px; border:1px solid var(--color-border-default); border-radius:5px; background: var(--color-surface-raised);">
          <div style="font-family:var(--font-mono); font-size:10.5px; color:var(--color-text-tertiary); text-transform:uppercase; letter-spacing:0.1em">{k}</div>
          <div style="font-family:var(--font-mono); font-size:18px; color:var(--color-text-primary)">{v}</div>
        </div>
      {/each}
    </div>
  </div>
  <div class="cy-node-inspector-section">
    <div class="cy-node-inspector-section__title">Validation</div>
    {#if stats.issues.length === 0}
      <div style="color:var(--color-state-success); font-size:12px;">✓ Trigger graph is valid.</div>
    {:else}
      {#each stats.issues as iss, i (i)}
        <div style="font-size:12px; margin-bottom:6px; color:var(--color-state-warning)">! {iss.msg}</div>
      {/each}
    {/if}
  </div>
  <div class="cy-node-inspector-section">
    <div class="cy-node-inspector-section__title">Estimated cost</div>
    <div style="display:flex; align-items:baseline; gap:8px;">
      <div style="font-family:var(--font-mono); font-size:22px; color:var(--color-text-primary)">{stats.cost}</div>
      <div style="font-family:var(--font-mono); font-size:11px; color:var(--color-text-tertiary)">USD / month / region</div>
    </div>
  </div>
{/snippet}

{#snippet simulatePanel()}
  <div class="cy-node-inspector-section">
    <div class="cy-node-inspector-section__title">Scenario</div>
    <div style="font-size:12.5px; color:var(--color-text-primary)">Mozambique flood</div>
    <div style="font-size:11.5px; color:var(--color-text-tertiary); margin-top:4px;">SAR backscatter drop across cluster of fields after heavy rainfall.</div>
  </div>
{/snippet}

<Story name="FullEditor">
  <div style="display:grid; grid-template-columns:252px 1fr 332px; height:700px; border:1px solid var(--color-border-default); border-radius:6px; overflow:hidden; background:var(--color-bg-primary);">
    <NodePalette groups={PALETTE_GROUPS} bind:filter />

    <div style="position:relative; overflow:hidden;">
      <NodeEditor
        {nodes}
        {edges}
        bind:viewport
        bind:selectedId
        {onnodemove}
        {onnodeadd}
        {onedgeadd}
        {onedgedelete}
      />
      <div style="position:absolute; right:16px; bottom:16px;">
        <FlowCanvasControls
          onzoomin={() => zoom(1.15)}
          onzoomout={() => zoom(1 / 1.15)}
          onfit={fit}
          onreset={() => (viewport = { x: 40, y: 40, z: 1 })}
        />
      </div>
      <div style="position:absolute; left:16px; bottom:16px;">
        <FlowMinimap {nodes} {viewport} />
      </div>
    </div>

    <NodeInspector
      tabs={[
        { id: "inspect", label: "Inspect" },
        { id: "simulate", label: "Simulate" },
        { id: "graph", label: "Graph" },
      ]}
      bind:activeTab
      panels={{ inspect: inspectPanel, simulate: simulatePanel, graph: graphPanel }}
    />
  </div>
</Story>
