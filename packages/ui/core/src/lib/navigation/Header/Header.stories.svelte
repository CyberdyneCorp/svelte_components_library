<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Header from "./Header.svelte";

  const { Story } = defineMeta({
    title: "Navigation/Header",
    component: Header,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{ title: "Cyberdyne" }} />

<Story name="WithActions">
  <Header title="Dashboard">
    <button style="padding: 0.375rem 0.75rem; background: var(--color-action-brand-default); color: var(--color-bg-primary); border: none; border-radius: 6px; font-size: 0.8125rem; cursor: pointer;">Connect</button>
  </Header>
</Story>

<Story name="WithLogo">
  <Header title="Cyberdyne">
    {#snippet logo()}
      <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--color-action-brand-default)">
        <circle cx="12" cy="12" r="10" />
      </svg>
    {/snippet}
  </Header>
</Story>
