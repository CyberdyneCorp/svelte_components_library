<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import FlowNode from "./FlowNode.svelte";

  const { Story } = defineMeta({
    title: "Flow/FlowNode",
    component: FlowNode,
    tags: ["autodocs"],
  });

  const sentinel = {
    id: "n_s1",
    type: "s1",
    x: 24,
    y: 24,
    title: "Sentinel-1 SAR",
    sub: "S1",
    color: "#5FA8FF",
    inputs: [],
    outputs: [{ id: "out", label: "SAR", type: "data" }],
    rows: [
      { kind: "row", l: "Mode", v: "IW GRD" },
      { kind: "row", l: "Polarisation", v: "VV+VH" },
      { kind: "row", l: "Revisit", v: "6 d" },
    ],
  };

  const aggregate = {
    id: "n_2x",
    type: "rolling",
    x: 24,
    y: 24,
    title: "Rolling aggregate",
    sub: "T",
    color: "#3FE07F",
    inputs: [{ id: "scalar", label: "scalar", type: "scalar" }],
    outputs: [{ id: "out", label: "scalar", type: "scalar" }],
    rows: [
      { kind: "row", l: "Window", v: "14 days" },
      { kind: "row", l: "Operator", v: "mean" },
    ],
  };

  const threshold = {
    id: "n_2v",
    type: "gt",
    x: 24,
    y: 24,
    title: "Threshold >",
    sub: ">",
    color: "#FACC15",
    inputs: [{ id: "value", label: "value", type: "scalar" }],
    outputs: [{ id: "out", label: "true / false", type: "bool" }],
    rows: [{ kind: "field", l: "Fire when value >", v: 30, unit: "%" }],
  };
</script>

<Story name="SentinelSource">
  <div style="position: relative; height: 220px; padding: 1rem; background: var(--color-bg-primary);">
    <FlowNode node={sentinel} />
  </div>
</Story>

<Story name="Selected">
  <div style="position: relative; height: 220px; padding: 1rem; background: var(--color-bg-primary);">
    <FlowNode node={aggregate} selected />
  </div>
</Story>

<Story name="Firing">
  <div style="position: relative; height: 220px; padding: 1rem; background: var(--color-bg-primary);">
    <FlowNode node={aggregate} firing />
  </div>
</Story>

<Story name="WithFieldRow">
  <div style="position: relative; height: 240px; padding: 1rem; background: var(--color-bg-primary);">
    <FlowNode node={threshold} selected />
  </div>
</Story>
