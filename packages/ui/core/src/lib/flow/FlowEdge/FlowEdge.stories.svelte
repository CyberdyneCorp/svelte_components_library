<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import FlowEdge from "./FlowEdge.svelte";
  import { DEFAULT_PORT_COLORS } from "../types.js";

  const { Story } = defineMeta({
    title: "Flow/FlowEdge",
    component: FlowEdge,
    tags: ["autodocs"],
  });
</script>

<Story name="Variants">
  <svg width="600" height="320" style="background: var(--color-bg-primary); border-radius: 6px;">
    <g transform="translate(0,0)">
      <FlowEdge from={{ x: 40, y: 40 }} to={{ x: 540, y: 40 }} color={DEFAULT_PORT_COLORS.data} />
      <text x="40" y="30" fill="var(--color-text-tertiary)" font-size="11">idle</text>

      <FlowEdge from={{ x: 40, y: 120 }} to={{ x: 540, y: 120 }} color={DEFAULT_PORT_COLORS.scalar} selected />
      <text x="40" y="110" fill="var(--color-text-tertiary)" font-size="11">selected</text>

      <FlowEdge from={{ x: 40, y: 200 }} to={{ x: 540, y: 200 }} color={DEFAULT_PORT_COLORS.event} firing />
      <text x="40" y="190" fill="var(--color-text-tertiary)" font-size="11">firing</text>

      <FlowEdge from={{ x: 40, y: 280 }} to={{ x: 540, y: 280 }} color={DEFAULT_PORT_COLORS.bool} preview />
      <text x="40" y="270" fill="var(--color-text-tertiary)" font-size="11">preview (drag)</text>
    </g>
  </svg>
</Story>

<Story name="Curves">
  <svg width="600" height="320" style="background: var(--color-bg-primary); border-radius: 6px;">
    <FlowEdge from={{ x: 40, y: 40 }} to={{ x: 540, y: 280 }} color={DEFAULT_PORT_COLORS.region} />
    <FlowEdge from={{ x: 40, y: 280 }} to={{ x: 540, y: 40 }} color={DEFAULT_PORT_COLORS.event} />
    <FlowEdge from={{ x: 40, y: 160 }} to={{ x: 540, y: 160 }} color={DEFAULT_PORT_COLORS.scalar} firing />
  </svg>
</Story>
