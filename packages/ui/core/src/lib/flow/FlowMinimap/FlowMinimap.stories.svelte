<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import FlowMinimap from "./FlowMinimap.svelte";

  const { Story } = defineMeta({
    title: "Flow/FlowMinimap",
    component: FlowMinimap,
    tags: ["autodocs"],
  });

  const nodes = [
    { id: "a", type: "s1", x: 0, y: 0, color: "#5FA8FF", inputs: [], outputs: [] },
    { id: "b", type: "flood", x: 360, y: 120, color: "#3FE07F", inputs: [], outputs: [] },
    { id: "c", type: "aoi", x: 0, y: 360, color: "#22D3EE", inputs: [], outputs: [] },
    { id: "d", type: "payout", x: 720, y: 240, color: "#FB7185", inputs: [], outputs: [] },
  ];
</script>

<Story name="Default">
  <div style="padding: 2rem; background: var(--color-bg-primary); display: inline-block;">
    <FlowMinimap {nodes} />
  </div>
</Story>
