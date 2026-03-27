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
          background: linear-gradient(135deg, #12121a, #1a1a2e);
          border: 1px solid rgba(0, 255, 65, 0.12);
          border-radius: 8px;
          padding: 20px;
          color: #e0e0e0;
          font-family: monospace;
          font-size: 0.875rem;
        ">
          <div style="color: #888; font-size: 0.75rem; margin-bottom: 8px;">METRIC</div>
          <div style="color: #00ff41; font-size: 1.25rem; font-weight: 700;">{metric}</div>
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
          background: #12121a;
          border: 1px solid rgba(0, 212, 255, 0.12);
          border-radius: 8px;
          padding: 16px;
          color: #00d4ff;
          font-family: monospace;
          font-size: 0.875rem;
          text-align: center;
        ">
          {node}
          <div style="color: #555; font-size: 0.75rem; margin-top: 4px;">Online</div>
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
          background: linear-gradient(135deg, #12121a, #0a0a0f);
          border: 1px solid rgba(0, 255, 65, 0.08);
          border-radius: 8px;
          padding: 24px;
          color: #e0e0e0;
          font-family: monospace;
        ">
          <div style="font-weight: 700; margin-bottom: 8px;">{section}</div>
          <div style="color: #555; font-size: 0.8125rem;">Dashboard panel content</div>
        </div>
      {/each}
    {/snippet}
  </GridLayout>
</Story>
