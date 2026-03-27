<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import SplitView from "./SplitView.svelte";

  const { Story } = defineMeta({
    title: "Layout/SplitView",
    component: SplitView,
    tags: ["autodocs"],
  });
</script>

<Story name="Horizontal">
  <div style="height: 400px; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-md); overflow: hidden;">
    <SplitView direction="horizontal">
      {#snippet left()}
        <div style="padding: var(--space-4); font-family: var(--font-body); color: var(--color-text-primary);">
          <h3 style="font-family: var(--font-display); margin: 0 0 var(--space-3);">Left Panel</h3>
          <p style="color: var(--color-text-secondary); font-size: 0.875rem;">This is the left panel content. Drag the divider to resize.</p>
        </div>
      {/snippet}
      {#snippet right()}
        <div style="padding: var(--space-4); font-family: var(--font-body); color: var(--color-text-primary);">
          <h3 style="font-family: var(--font-display); margin: 0 0 var(--space-3);">Right Panel</h3>
          <p style="color: var(--color-text-secondary); font-size: 0.875rem;">This is the right panel content.</p>
        </div>
      {/snippet}
    </SplitView>
  </div>
</Story>

<Story name="Vertical">
  <div style="height: 400px; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-md); overflow: hidden;">
    <SplitView direction="vertical">
      {#snippet top()}
        <div style="padding: var(--space-4); font-family: var(--font-body); color: var(--color-text-primary);">
          <h3 style="font-family: var(--font-display); margin: 0 0 var(--space-3);">Top Panel</h3>
          <p style="color: var(--color-text-secondary); font-size: 0.875rem;">This is the top panel content.</p>
        </div>
      {/snippet}
      {#snippet bottom()}
        <div style="padding: var(--space-4); font-family: var(--font-body); color: var(--color-text-primary);">
          <h3 style="font-family: var(--font-display); margin: 0 0 var(--space-3);">Bottom Panel</h3>
          <p style="color: var(--color-text-secondary); font-size: 0.875rem;">This is the bottom panel content.</p>
        </div>
      {/snippet}
    </SplitView>
  </div>
</Story>

<Story name="CustomSplit">
  <div style="height: 400px; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-md); overflow: hidden;">
    <SplitView direction="horizontal" initialSplit={30} collapsible={true} minSize={80}>
      {#snippet left()}
        <div style="padding: var(--space-4); font-family: var(--font-body); color: var(--color-text-primary);">
          <h3 style="font-family: var(--font-display); margin: 0 0 var(--space-3);">Sidebar</h3>
          <p style="color: var(--color-text-secondary); font-size: 0.875rem;">30/70 split with collapsible panels.</p>
        </div>
      {/snippet}
      {#snippet right()}
        <div style="padding: var(--space-4); font-family: var(--font-body); color: var(--color-text-primary);">
          <h3 style="font-family: var(--font-display); margin: 0 0 var(--space-3);">Main Content</h3>
          <p style="color: var(--color-text-secondary); font-size: 0.875rem;">Use the collapse buttons on the divider to minimize panels.</p>
        </div>
      {/snippet}
    </SplitView>
  </div>
</Story>
