<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import InfiniteScroll from "./InfiniteScroll.svelte";

  const { Story } = defineMeta({
    title: "Data Display/InfiniteScroll",
    component: InfiniteScroll,
    tags: ["autodocs"],
  });
</script>

<Story name="Default">
  <div style="height: 400px; overflow-y: auto; background: var(--color-bg-primary); border: 1px solid var(--color-border-subtle); border-radius: 8px; padding: 8px;">
    <InfiniteScroll loading={false} hasMore={true} onloadmore={() => {}}>
      {#snippet children()}
        {#each Array.from({ length: 40 }, (_, i) => `Item ${i + 1}`) as item}
          <div style="padding: 12px 16px; border-bottom: 1px solid var(--color-border-subtle); color: var(--color-text-primary); font-family: monospace; font-size: 0.875rem;">
            {item}
          </div>
        {/each}
      {/snippet}
    </InfiniteScroll>
  </div>
</Story>

<Story name="NoMore">
  <div style="height: 300px; overflow-y: auto; background: var(--color-bg-primary); border: 1px solid var(--color-border-subtle); border-radius: 8px; padding: 8px;">
    <InfiniteScroll loading={false} hasMore={false}>
      {#snippet children()}
        {#each Array.from({ length: 10 }, (_, i) => `Final item ${i + 1}`) as item}
          <div style="padding: 12px 16px; border-bottom: 1px solid var(--color-border-subtle); color: var(--color-text-primary); font-family: monospace; font-size: 0.875rem;">
            {item}
          </div>
        {/each}
      {/snippet}
    </InfiniteScroll>
  </div>
</Story>
