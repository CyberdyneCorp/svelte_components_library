<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Popover from "./Popover.svelte";

  const { Story } = defineMeta({
    title: "Overlay/Popover",
    component: Popover,
    tags: ["autodocs"],
  });
</script>

<Story name="Bottom">
  <div style="padding: 4rem 1rem;">
    <Popover position="bottom">
      {#snippet trigger()}
        <button class="trigger-btn">Show Info</button>
      {/snippet}
      {#snippet content()}
        <p style="margin: 0; color: var(--color-text-secondary); line-height: 1.5;">
          Neural network inference latency: <strong style="color: var(--color-action-brand-default);">12ms</strong>
        </p>
      {/snippet}
    </Popover>
  </div>
</Story>

<Story name="Top">
  <div style="padding: 8rem 1rem 1rem;">
    <Popover position="top">
      {#snippet trigger()}
        <button class="trigger-btn">Status</button>
      {/snippet}
      {#snippet content()}
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--color-action-brand-default); display: inline-block;"></span>
          <span style="color: var(--color-text-secondary);">All systems operational</span>
        </div>
      {/snippet}
    </Popover>
  </div>
</Story>

<Story name="RichContent">
  <div style="padding: 4rem 1rem;">
    <Popover position="bottom">
      {#snippet trigger()}
        <button class="trigger-btn">GPU Stats</button>
      {/snippet}
      {#snippet content()}
        <div style="min-width: 240px;">
          <h4 style="margin: 0 0 0.75rem; font-family: var(--font-display); font-size: 0.9375rem; color: var(--color-text-primary);">GPU Cluster Status</h4>
          <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.8125rem;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--color-text-tertiary);">Utilization</span>
              <span style="color: var(--color-action-brand-default); font-family: var(--font-mono);">97.2%</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--color-text-tertiary);">Temperature</span>
              <span style="color: var(--color-state-warning); font-family: var(--font-mono);">78°C</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--color-text-tertiary);">Memory</span>
              <span style="color: var(--color-action-secondary-default); font-family: var(--font-mono);">22.4 / 24 GB</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--color-text-tertiary);">Power Draw</span>
              <span style="color: var(--color-text-primary); font-family: var(--font-mono);">342W</span>
            </div>
          </div>
        </div>
      {/snippet}
    </Popover>
  </div>
</Story>

<style>
  .trigger-btn {
    padding: 0.5rem 1rem;
    background: var(--color-surface-raised);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    cursor: pointer;
    font-family: var(--font-body);
    font-size: 0.875rem;
  }
  .trigger-btn:hover {
    background: var(--color-surface-hover);
  }
</style>
