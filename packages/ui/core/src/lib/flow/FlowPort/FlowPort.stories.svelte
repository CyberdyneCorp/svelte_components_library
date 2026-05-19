<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import FlowPort from "./FlowPort.svelte";
  import { DEFAULT_PORT_COLORS } from "../types.js";

  const { Story } = defineMeta({
    title: "Flow/FlowPort",
    component: FlowPort,
    tags: ["autodocs"],
  });
</script>

<Story name="AllTypes">
  <div style="display: flex; align-items: center; gap: 2rem; padding: 2rem; background: var(--color-bg-primary);">
    {#each Object.entries(DEFAULT_PORT_COLORS) as [type, color] (type)}
      <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
        <FlowPort side="in" {color} {type} label={type} />
        <span style="font-family: var(--font-mono); font-size: 11px; color: var(--color-text-tertiary);">{type}</span>
      </div>
    {/each}
  </div>
</Story>

<Story name="States">
  <div style="display: flex; align-items: center; gap: 2rem; padding: 2rem; background: var(--color-bg-primary);">
    <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
      <FlowPort side="in" color={DEFAULT_PORT_COLORS.scalar} />
      <span style="font-size: 11px;">idle</span>
    </div>
    <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
      <FlowPort side="in" color={DEFAULT_PORT_COLORS.scalar} hover />
      <span style="font-size: 11px;">hover</span>
    </div>
    <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
      <FlowPort side="in" color={DEFAULT_PORT_COLORS.scalar} compatible />
      <span style="font-size: 11px;">compatible</span>
    </div>
  </div>
</Story>

<Story name="InAndOut">
  <div style="display: flex; align-items: center; gap: 8rem; padding: 2rem; background: var(--color-bg-primary);">
    <FlowPort side="in" color={DEFAULT_PORT_COLORS.data} label="SAR" type="data" />
    <FlowPort side="out" color={DEFAULT_PORT_COLORS.scalar} label="value" type="scalar" />
  </div>
</Story>
