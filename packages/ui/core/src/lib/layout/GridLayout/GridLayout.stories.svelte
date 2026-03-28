<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import GridLayout from "./GridLayout.svelte";

  const { Story } = defineMeta({
    title: "Layout/GridLayout",
    component: GridLayout,
    tags: ["autodocs"],
  });
</script>

<Story name="ThreeColumns">
  <GridLayout columns={3} gap="16px">
    {#snippet children()}
      {#each ["CPU Usage: 82%", "Memory: 64%", "Network: 12ms", "Disk I/O: 45%", "GPU Temp: 71°C", "Uptime: 99.9%"] as metric}
        <div style="
          background: linear-gradient(135deg, var(--color-surface-default), #1a1a2e);
          border: 1px solid var(--color-border-subtle);
          border-radius: 8px;
          padding: 20px;
          color: var(--color-text-primary);
          font-family: monospace;
          font-size: 0.875rem;
        ">
          <div style="color: var(--color-text-tertiary); font-size: 0.75rem; margin-bottom: 8px;">METRIC</div>
          <div style="color: var(--color-action-brand-default); font-size: 1.25rem; font-weight: 700;">{metric}</div>
        </div>
      {/each}
    {/snippet}
  </GridLayout>
</Story>

<Story name="AutoFill">
  <GridLayout columns={0} minChildWidth="200px" gap="12px">
    {#snippet children()}
      {#each Array.from({ length: 8 }, (_, i) => `Node ${i + 1}`) as node}
        <div style="
          background: var(--color-surface-default);
          border: 1px solid var(--color-border-subtle);
          border-radius: 8px;
          padding: 16px;
          color: var(--color-action-secondary-default);
          font-family: monospace;
          font-size: 0.875rem;
          text-align: center;
        ">
          {node}
          <div style="color: var(--color-text-tertiary); font-size: 0.75rem; margin-top: 4px;">Online</div>
        </div>
      {/each}
    {/snippet}
  </GridLayout>
</Story>

<Story name="TwoColumns">
  <GridLayout columns={2} gap="20px">
    {#snippet children()}
      {#each ["Transactions", "Smart Contracts", "Wallets", "Tokens"] as section}
        <div style="
          background: linear-gradient(135deg, var(--color-surface-default), var(--color-bg-primary));
          border: 1px solid var(--color-border-subtle);
          border-radius: 8px;
          padding: 24px;
          color: var(--color-text-primary);
          font-family: monospace;
        ">
          <div style="font-weight: 700; margin-bottom: 8px;">{section}</div>
          <div style="color: var(--color-text-tertiary); font-size: 0.8125rem;">Dashboard panel content</div>
        </div>
      {/each}
    {/snippet}
  </GridLayout>
</Story>
