<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Modal from "./Modal.svelte";

  const { Story } = defineMeta({
    title: "Overlay/Modal",
    component: Modal,
    tags: ["autodocs"],
  });
</script>

<script>
  let openDefault = $state(false);
  let openLarge = $state(false);
  let openFooter = $state(false);
</script>

<Story name="Default">
  <button class="trigger-btn" onclick={() => openDefault = true}>Open Modal</button>
  <Modal bind:open={openDefault} title="Model Configuration">
    <p>Configure the hyperparameters for your next training run. Adjust learning rate, batch size, and epoch count.</p>
  </Modal>
</Story>

<Story name="Large">
  <button class="trigger-btn" onclick={() => openLarge = true}>Open Large Modal</button>
  <Modal bind:open={openLarge} title="Dataset Preview" size="lg">
    <p>Preview the first 100 rows of your dataset before starting the training pipeline.</p>
    <div style="margin-top: 1rem; padding: 1rem; background: var(--color-bg-tertiary); border-radius: var(--radius-md); font-family: var(--font-mono); font-size: 0.8rem; color: var(--color-text-code);">
      {"{"} "id": 1, "features": [0.42, 0.87, 0.13], "label": "positive" {"}"}
    </div>
  </Modal>
</Story>

<Story name="WithFooter">
  <button class="trigger-btn" onclick={() => openFooter = true}>Open Modal with Footer</button>
  <Modal bind:open={openFooter} title="Export Results">
    <p>Select the format and destination for your experiment results export.</p>
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
  </Modal>
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
