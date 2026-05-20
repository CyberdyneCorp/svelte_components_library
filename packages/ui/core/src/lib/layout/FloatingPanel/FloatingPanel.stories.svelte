<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import FloatingPanel from "./FloatingPanel.svelte";

  const { Story } = defineMeta({
    title: "Layout/FloatingPanel",
    component: FloatingPanel,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Draggable + resizable floating panel with a titlebar, optional header controls, and a footer. Drag the header to move; drag the bottom-right handle to resize. `open` is bindable.",
        },
      },
    },
  });
</script>

<Story name="Default">
  {#snippet template()}
    <div style="position: relative; height: 480px;">
      <FloatingPanel title="Telemetry" open initialX={40} initialY={40}>
        <p style="margin: 0; color: var(--color-text-secondary);">
          Drag the header to move this panel. Drag the bottom-right corner to
          resize it. Content scrolls when it overflows.
        </p>
      </FloatingPanel>
    </div>
  {/snippet}
</Story>

<Story name="WithHeaderAndFooter">
  {#snippet template()}
    <div style="position: relative; height: 480px;">
      <FloatingPanel
        title="Layers"
        open
        initialX={40}
        initialY={40}
        initialWidth={420}
        initialHeight={300}
      >
        {#snippet header()}
          <span style="font-size: 0.75rem; color: var(--color-action-secondary-default);">3 active</span>
        {/snippet}
        <ul style="margin: 0; padding-left: 1.1rem; color: var(--color-text-secondary);">
          <li>World Terrain</li>
          <li>OSM Buildings</li>
          <li>Aircraft</li>
        </ul>
        {#snippet footer()}
          <div style="display: flex; justify-content: flex-end; font-size: 0.75rem; color: var(--color-text-tertiary);">
            Updated just now
          </div>
        {/snippet}
      </FloatingPanel>
    </div>
  {/snippet}
</Story>
