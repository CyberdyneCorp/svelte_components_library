<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Tooltip from "./Tooltip.svelte";

  const { Story } = defineMeta({
    title: "Primitives/Tooltip",
    component: Tooltip,
    tags: ["autodocs"],
  });
</script>

<Story name="Top">
  <div style="padding: 4rem; display: flex; justify-content: center;">
    <Tooltip text="Deploy to mainnet" position="top">
      <button style="padding: 0.5rem 1rem; background: var(--color-surface-raised); color: var(--color-text-primary); border: 1px solid var(--color-border-default); border-radius: var(--radius-md); cursor: pointer; font-family: var(--font-body);">
        Hover me (top)
      </button>
    </Tooltip>
  </div>
</Story>

<Story name="Bottom">
  <div style="padding: 4rem; display: flex; justify-content: center;">
    <Tooltip text="Sync blockchain data" position="bottom">
      <button style="padding: 0.5rem 1rem; background: var(--color-surface-raised); color: var(--color-text-primary); border: 1px solid var(--color-border-default); border-radius: var(--radius-md); cursor: pointer; font-family: var(--font-body);">
        Hover me (bottom)
      </button>
    </Tooltip>
  </div>
</Story>

<Story name="Left">
  <div style="padding: 4rem; display: flex; justify-content: center;">
    <Tooltip text="Run ML pipeline" position="left">
      <button style="padding: 0.5rem 1rem; background: var(--color-surface-raised); color: var(--color-text-primary); border: 1px solid var(--color-border-default); border-radius: var(--radius-md); cursor: pointer; font-family: var(--font-body);">
        Hover me (left)
      </button>
    </Tooltip>
  </div>
</Story>

<Story name="Right">
  <div style="padding: 4rem; display: flex; justify-content: center;">
    <Tooltip text="View research logs" position="right">
      <button style="padding: 0.5rem 1rem; background: var(--color-surface-raised); color: var(--color-text-primary); border: 1px solid var(--color-border-default); border-radius: var(--radius-md); cursor: pointer; font-family: var(--font-body);">
        Hover me (right)
      </button>
    </Tooltip>
  </div>
</Story>
