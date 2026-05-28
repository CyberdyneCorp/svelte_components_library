<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import NodeEditor from "./NodeEditor.svelte";
  import type { FlowEdgeSpec, FlowNodeSpec } from "../types.js";

  const { Story } = defineMeta({
    title: "Flow/NodeEditor",
    component: NodeEditor,
    tags: ["autodocs"],
  });
</script>

<script lang="ts">
  let nodes = $state<FlowNodeSpec[]>([
    {
      id: "n_s1",
      type: "s1",
      x: 80,
      y: 60,
      title: "Sentinel-1 SAR",
      sub: "S1",
      color: "#5FA8FF",
      inputs: [],
      outputs: [{ id: "out", label: "SAR", type: "data" }],
      rows: [
        { kind: "row", l: "Mode", v: "IW GRD" },
        { kind: "row", l: "Revisit", v: "6 d" },
      ],
    },
    {
      id: "n_flood",
      type: "flood",
      x: 440,
      y: 140,
      title: "Flood Extent (SAR)",
      sub: "S1",
      color: "#3FE07F",
      inputs: [
        { id: "sar", label: "SAR", type: "data" },
        { id: "region", label: "region", type: "region" },
      ],
      outputs: [{ id: "pct", label: "% flooded", type: "scalar" }],
      rows: [
        { kind: "row", l: "Method", v: "Otsu" },
        { kind: "row", l: "Smoothing", v: "morpho 3" },
      ],
    },
    {
      id: "n_aoi",
      type: "aoi",
      x: 80,
      y: 360,
      title: "Area of Interest",
      sub: "AOI",
      color: "#22D3EE",
      inputs: [],
      outputs: [{ id: "region", label: "region", type: "region" }],
      rows: [
        { kind: "row", l: "Country", v: "MZ" },
        { kind: "row", l: "Area", v: "184 km²" },
      ],
    },
  ]);

  let edges = $state<FlowEdgeSpec[]>([
    { id: "e1", source: { nodeId: "n_s1", portId: "out" }, target: { nodeId: "n_flood", portId: "sar" } },
    { id: "e2", source: { nodeId: "n_aoi", portId: "region" }, target: { nodeId: "n_flood", portId: "region" } },
  ]);

  let selectedId = $state<string | null>(null);
  let viewport = $state({ x: 0, y: 0, z: 1 });

  let nextEdgeId = 100;

  function onnodemove(id: string, x: number, y: number) {
    const n = nodes.find((n) => n.id === id);
    if (!n) return;
    n.x = x;
    n.y = y;
  }

  function onedgeadd(e: Omit<FlowEdgeSpec, "id">) {
    edges = [...edges, { id: `e_${++nextEdgeId}`, ...e }];
  }

  function onedgedelete(id: string) {
    edges = edges.filter((e) => e.id !== id);
  }
</script>

<Story name="ThreeNodeDAG">
  <div style="height: 600px; border: 1px solid var(--color-border-default); border-radius: 6px; overflow: hidden;">
    <NodeEditor
      {nodes}
      {edges}
      bind:viewport
      bind:selectedId
      {onnodemove}
      {onedgeadd}
      {onedgedelete}
    />
  </div>
</Story>

<Story name="Empty">
  <div style="height: 400px; border: 1px solid var(--color-border-default); border-radius: 6px; overflow: hidden;">
    <NodeEditor
      nodes={[]}
      edges={[]}
    />
  </div>
</Story>
