<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Drawer from "./Drawer.svelte";

  const { Story } = defineMeta({
    title: "Layout/Drawer",
    component: Drawer,
    tags: ["autodocs"],
  });
</script>

<script>
  let openRight = $state(false);
  let openLeft = $state(false);
  let openFooter = $state(false);
</script>

<Story name="RightSide">
  <button class="trigger-btn" onclick={() => openRight = true}>Open Right Drawer</button>
  <Drawer bind:open={openRight} title="System Logs">
    <p>Recent activity from the neural processing pipeline:</p>
    <div style="margin-top: 1rem; font-family: var(--font-mono); font-size: 0.8rem; color: #00ff41; line-height: 1.8;">
      <div>[12:04:33] Model checkpoint saved</div>
      <div>[12:04:28] Epoch 42/100 — loss: 0.0234</div>
      <div>[12:04:15] Batch 512 processed</div>
      <div>[12:03:59] GPU utilization: 97.2%</div>
    </div>
  </Drawer>
</Story>

<Story name="LeftSide">
  <button class="trigger-btn" onclick={() => openLeft = true}>Open Left Drawer</button>
  <Drawer bind:open={openLeft} side="left" title="Navigation" width="320px">
    <nav style="display: flex; flex-direction: column; gap: 0.25rem;">
      <a href="#" style="padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); color: #00ff41; text-decoration: none; font-family: var(--font-body); font-size: 0.875rem;">Dashboard</a>
      <a href="#" style="padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); color: var(--color-text-secondary); text-decoration: none; font-family: var(--font-body); font-size: 0.875rem;">Models</a>
      <a href="#" style="padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); color: var(--color-text-secondary); text-decoration: none; font-family: var(--font-body); font-size: 0.875rem;">Datasets</a>
      <a href="#" style="padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); color: var(--color-text-secondary); text-decoration: none; font-family: var(--font-body); font-size: 0.875rem;">Settings</a>
    </nav>
  </Drawer>
</Story>

<Story name="WithFooter">
  <button class="trigger-btn" onclick={() => openFooter = true}>Open Drawer with Footer</button>
  <Drawer bind:open={openFooter} title="Export Configuration">
    <p>Select the parameters for your data export pipeline.</p>
    <div style="margin-top: 1rem; padding: 1rem; background: var(--color-bg-tertiary); border-radius: var(--radius-md); font-family: var(--font-mono); font-size: 0.8rem; color: var(--color-text-code);">
      format: "parquet"<br/>
      compression: "snappy"<br/>
      partition_by: ["date", "region"]
    </div>
    {#snippet footer()}
      <button style="
        padding: 0.5rem 1rem;
        background: var(--color-surface-raised);
        color: var(--color-text-secondary);
        border: 1px solid var(--color-border-default);
        border-radius: var(--radius-md);
        cursor: pointer;
        font-family: var(--font-body);
        font-size: 0.875rem;
      " onclick={() => openFooter = false}>Cancel</button>
      <button style="
        padding: 0.5rem 1rem;
        background: var(--btn-brand-bg);
        color: var(--btn-brand-text);
        border: none;
        border-radius: var(--radius-md);
        cursor: pointer;
        font-family: var(--font-body);
        font-size: 0.875rem;
        font-weight: 500;
      " onclick={() => openFooter = false}>Export</button>
    {/snippet}
  </Drawer>
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
</style>
