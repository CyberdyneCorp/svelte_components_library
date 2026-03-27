<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import VirtualizedList from "./VirtualizedList.svelte";

  const { Story } = defineMeta({
    title: "Data/VirtualizedList",
    component: VirtualizedList,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" let:args>
  {@const items = Array.from({ length: 1000 }, (_, i) => `Item ${i + 1} — Row entry`)}
  <VirtualizedList {items} itemHeight={48} height="400px">
    {#snippet renderItem({ item, index })}
      <span style="color: var(--color-text-secondary, #888);">#{index}</span>
      <span style="margin-left: 12px;">{item}</span>
    {/snippet}
  </VirtualizedList>
</Story>

<Story name="WithCustomRender" let:args>
  {@const items = Array.from({ length: 1000 }, (_, i) => ({
    id: `TX-${String(i).padStart(6, '0')}`,
    amount: (Math.random() * 10).toFixed(4),
    status: ['confirmed', 'pending', 'failed'][i % 3],
  }))}
  <VirtualizedList {items} itemHeight={56} height="400px">
    {#snippet renderItem({ item, index })}
      <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
        <span style="color: #00d4ff; font-family: monospace;">{item.id}</span>
        <span style="color: #e0e0e0;">{item.amount} ETH</span>
        <span style="
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          background: {item.status === 'confirmed' ? 'rgba(0,255,65,0.15)' : item.status === 'pending' ? 'rgba(255,184,0,0.15)' : 'rgba(255,68,68,0.15)'};
          color: {item.status === 'confirmed' ? '#00ff41' : item.status === 'pending' ? '#ffb800' : '#ff4444'};
        ">{item.status}</span>
      </div>
    {/snippet}
  </VirtualizedList>
</Story>

<Story name="LargeDataset" let:args>
  {@const items = Array.from({ length: 10000 }, (_, i) => `Record ${i + 1} — Large dataset entry`)}
  <VirtualizedList {items} itemHeight={40} height="500px" overscan={10}>
    {#snippet renderItem({ item, index })}
      <span style="color: rgba(0, 212, 255, 0.6);">[{String(index).padStart(5, '0')}]</span>
      <span style="margin-left: 12px;">{item}</span>
    {/snippet}
  </VirtualizedList>
</Story>
