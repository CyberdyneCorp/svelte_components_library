<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Dialog from "./Dialog.svelte";

  const { Story } = defineMeta({
    title: "Feedback/Dialog",
    component: Dialog,
    tags: ["autodocs"],
  });
</script>

<script>
  let openDefault = $state(false);
  let openDanger = $state(false);
</script>

<Story name="Default">
  <button class="trigger-btn" onclick={() => openDefault = true}>Open Dialog</button>
  <Dialog
    bind:open={openDefault}
    title="Confirm Transaction"
    onconfirm={() => console.log('confirmed')}
    oncancel={() => console.log('cancelled')}
  >
    Are you sure you want to execute this smart contract call? This action will require gas fees.
  </Dialog>
</Story>

<Story name="Danger">
  <button class="trigger-btn" onclick={() => openDanger = true}>Open Danger Dialog</button>
  <Dialog
    bind:open={openDanger}
    title="Delete Model"
    variant="danger"
    confirmLabel="Delete"
    onconfirm={() => console.log('deleted')}
    oncancel={() => console.log('cancelled')}
  >
    This will permanently delete the trained model and all associated checkpoints. This action cannot be undone.
  </Dialog>
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
