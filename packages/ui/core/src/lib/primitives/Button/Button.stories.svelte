<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Button from "./Button.svelte";

  const { Story } = defineMeta({
    title: "Primitives/Button",
    component: Button,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Native `<button>`. Any `aria-*` (`aria-expanded`, `aria-controls`, `aria-pressed`…) and `data-*` attribute is forwarded; `aria-busy` / `aria-disabled` stay managed by `loading` / `disabled`. `bind:ref` gives the native element, e.g. to return focus after closing a disclosure.",
        },
      },
    },
  });
</script>

<script>
  let disclosureOpen = $state(false);
  /** @type {HTMLButtonElement | null} */
  let disclosureRef = $state(null);
</script>

<Story name="Brand">
  <Button variant="brand">Brand Action</Button>
</Story>

<Story name="Secondary">
  <Button variant="secondary">Secondary</Button>
</Story>

<Story name="Outline">
  <Button variant="outline">Outline</Button>
</Story>

<Story name="Ghost">
  <Button variant="ghost">Ghost</Button>
</Story>

<Story name="Danger">
  <Button variant="danger">Delete</Button>
</Story>

<Story name="Sizes">
  <div style="display: flex; align-items: center; gap: 1rem;">
    <Button variant="brand" size="sm">Small</Button>
    <Button variant="brand" size="md">Medium</Button>
    <Button variant="brand" size="lg">Large</Button>
  </div>
</Story>

<Story name="Loading">
  <div style="display: flex; align-items: center; gap: 1rem;">
    <Button variant="brand" loading>Loading...</Button>
    <Button variant="secondary" loading>Processing</Button>
    <Button variant="danger" loading>Deleting</Button>
  </div>
</Story>

<Story name="Disabled">
  <div style="display: flex; align-items: center; gap: 1rem;">
    <Button variant="brand" disabled>Disabled</Button>
    <Button variant="secondary" disabled>Disabled</Button>
    <Button variant="outline" disabled>Disabled</Button>
    <Button variant="ghost" disabled>Disabled</Button>
    <Button variant="danger" disabled>Disabled</Button>
  </div>
</Story>

<Story name="Disclosure">
  {#snippet template()}
    {@const panelId = "disclosure-panel"}
    <div style="display: flex; flex-direction: column; gap: 0.75rem; align-items: flex-start;">
      <Button
        variant="secondary"
        bind:ref={disclosureRef}
        aria-expanded={disclosureOpen}
        aria-controls={panelId}
        onclick={() => (disclosureOpen = !disclosureOpen)}
      >
        {disclosureOpen ? "Hide details" : "Show details"}
      </Button>
      <div id={panelId} hidden={!disclosureOpen}>
        <p style="margin: 0 0 0.5rem;">Fees are charged per transaction.</p>
        <Button
          variant="ghost"
          size="sm"
          onclick={() => {
            disclosureOpen = false;
            disclosureRef?.focus();
          }}
        >
          Close
        </Button>
      </div>
    </div>
  {/snippet}
</Story>
