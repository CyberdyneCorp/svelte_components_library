<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import PageShell from "./PageShell.svelte";

  const { Story } = defineMeta({
    title: "Layout/PageShell",
    component: PageShell,
    tags: ["autodocs"],
  });
</script>

<Story name="Default">
  <div style="height: 400px; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-md); overflow: hidden;">
    <PageShell showSidebar={true} showHeader={true}>
      {#snippet header()}
        <div style="display: flex; align-items: center; gap: var(--space-3); width: 100%;">
          <span style="font-family: var(--font-mono); font-weight: 600; color: var(--color-action-brand-default);">CYBERDYNE</span>
          <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--color-text-tertiary);">/ Dashboard</span>
        </div>
      {/snippet}
      {#snippet sidebar()}
        <nav style="padding: var(--space-3); display: flex; flex-direction: column; gap: var(--space-1);">
          <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--color-text-tertiary); text-transform: uppercase; letter-spacing: 0.08em; padding: var(--space-2) var(--space-2);">Navigation</span>
          <a style="display: block; padding: var(--space-2); border-radius: var(--radius-sm); background: var(--color-bg-tertiary); color: var(--color-text-primary); font-size: 0.8125rem; text-decoration: none;">Dashboard</a>
          <a style="display: block; padding: var(--space-2); border-radius: var(--radius-sm); color: var(--color-text-secondary); font-size: 0.8125rem; text-decoration: none;">Models</a>
          <a style="display: block; padding: var(--space-2); border-radius: var(--radius-sm); color: var(--color-text-secondary); font-size: 0.8125rem; text-decoration: none;">Datasets</a>
          <a style="display: block; padding: var(--space-2); border-radius: var(--radius-sm); color: var(--color-text-secondary); font-size: 0.8125rem; text-decoration: none;">Settings</a>
        </nav>
      {/snippet}
      <div>
        <h2 style="color: var(--color-text-primary); margin: 0 0 var(--space-3) 0;">Welcome back</h2>
        <p style="color: var(--color-text-secondary); font-size: 0.875rem;">Your ML pipeline is running smoothly. 3 models deployed, 1 training.</p>
      </div>
    </PageShell>
  </div>
</Story>

<Story name="NoSidebar">
  <div style="height: 300px; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-md); overflow: hidden;">
    <PageShell showSidebar={false} showHeader={true}>
      {#snippet header()}
        <span style="font-family: var(--font-mono); font-weight: 600; color: var(--color-action-brand-default);">CYBERDYNE</span>
      {/snippet}
      <div>
        <h2 style="color: var(--color-text-primary); margin: 0 0 var(--space-3) 0;">Full-width content</h2>
        <p style="color: var(--color-text-secondary); font-size: 0.875rem;">This layout has no sidebar, ideal for focused content pages.</p>
      </div>
    </PageShell>
  </div>
</Story>

<Story name="CollapsedSidebar">
  <div style="height: 400px; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-md); overflow: hidden;">
    <PageShell showSidebar={true} showHeader={true} collapsedSidebar={true}>
      {#snippet header()}
        <span style="font-family: var(--font-mono); font-weight: 600; color: var(--color-action-brand-default);">CYBERDYNE</span>
      {/snippet}
      {#snippet sidebar()}
        <nav style="padding: var(--space-2); display: flex; flex-direction: column; align-items: center; gap: var(--space-2); padding-top: var(--space-3);">
          <div style="width: 32px; height: 32px; border-radius: var(--radius-sm); background: var(--color-bg-tertiary); display: flex; align-items: center; justify-content: center; color: var(--color-text-secondary); font-size: 0.75rem;">D</div>
          <div style="width: 32px; height: 32px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; color: var(--color-text-tertiary); font-size: 0.75rem;">M</div>
          <div style="width: 32px; height: 32px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; color: var(--color-text-tertiary); font-size: 0.75rem;">S</div>
        </nav>
      {/snippet}
      <div>
        <h2 style="color: var(--color-text-primary); margin: 0 0 var(--space-3) 0;">Collapsed sidebar</h2>
        <p style="color: var(--color-text-secondary); font-size: 0.875rem;">The sidebar is collapsed to icon-only mode, maximizing content space.</p>
      </div>
    </PageShell>
  </div>
</Story>
