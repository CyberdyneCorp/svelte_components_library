<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import AppLayout from "./AppLayout.svelte";

  const { Story } = defineMeta({
    title: "Layout/AppLayout",
    component: AppLayout,
    tags: ["autodocs"],
  });
</script>

<Story name="WithSidebar">
  <div style="height: 400px; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-md); overflow: hidden;">
    <AppLayout>
      {#snippet sidebar()}
        <div style="padding: 1rem;">
          <div style="color: var(--color-action-brand-default); font-family: var(--font-display); font-weight: 700; margin-bottom: 1.5rem;">CYBERDYNE</div>
          <nav style="display: flex; flex-direction: column; gap: 0.25rem;">
            <a href="#" style="color: var(--nav-item-text-active); padding: 0.5rem; font-size: 0.875rem; font-family: var(--font-body);">Dashboard</a>
            <a href="#" style="color: var(--nav-item-text); padding: 0.5rem; font-size: 0.875rem; font-family: var(--font-body);">Models</a>
            <a href="#" style="color: var(--nav-item-text); padding: 0.5rem; font-size: 0.875rem; font-family: var(--font-body);">Settings</a>
          </nav>
        </div>
      {/snippet}
      {#snippet header()}
        <span style="color: var(--color-text-primary); font-family: var(--font-display); font-weight: 600;">Dashboard</span>
      {/snippet}
      <p style="color: var(--color-text-secondary); font-family: var(--font-body);">Main content area</p>
    </AppLayout>
  </div>
</Story>

<Story name="WithoutSidebar">
  <div style="height: 300px; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-md); overflow: hidden;">
    <AppLayout hasSidebar={false}>
      {#snippet header()}
        <span style="color: var(--color-text-primary); font-family: var(--font-display); font-weight: 600;">Full Width View</span>
      {/snippet}
      <p style="color: var(--color-text-secondary); font-family: var(--font-body);">Content spans full width without sidebar.</p>
    </AppLayout>
  </div>
</Story>
