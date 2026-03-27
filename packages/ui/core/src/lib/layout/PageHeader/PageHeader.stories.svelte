<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import PageHeader from "./PageHeader.svelte";

  const { Story } = defineMeta({
    title: "Layout/PageHeader",
    component: PageHeader,
    tags: ["autodocs"],
  });
</script>

<Story name="Default">
  <PageHeader
    title="ML Models"
    description="Manage your trained models and deployments."
  />
</Story>

<Story name="WithActions">
  <PageHeader
    title="Experiments"
    description="Track and compare your training runs."
  >
    <button style="
      padding: 0.5rem 1rem;
      background: var(--color-surface-raised);
      color: var(--color-text-primary);
      border: 1px solid var(--color-border-default);
      border-radius: var(--radius-md);
      cursor: pointer;
      font-family: var(--font-body);
      font-size: 0.875rem;
    ">Export</button>
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
    ">New Experiment</button>
  </PageHeader>
</Story>
