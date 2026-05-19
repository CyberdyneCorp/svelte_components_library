<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import FlowCanvasControls from "./FlowCanvasControls.svelte";

  const { Story } = defineMeta({
    title: "Flow/FlowCanvasControls",
    component: FlowCanvasControls,
    tags: ["autodocs"],
  });
</script>

<Story name="Vertical">
  <div style="padding: 2rem; background: var(--color-bg-primary); display: inline-block;">
    <FlowCanvasControls
      onzoomin={() => console.log('zoom in')}
      onzoomout={() => console.log('zoom out')}
      onfit={() => console.log('fit')}
      onreset={() => console.log('reset')}
    />
  </div>
</Story>

<Story name="Horizontal">
  <div style="padding: 2rem; background: var(--color-bg-primary); display: inline-block;">
    <FlowCanvasControls orientation="horizontal" />
  </div>
</Story>
