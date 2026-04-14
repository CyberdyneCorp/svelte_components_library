<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import PixelTooltip from "./PixelTooltip.svelte";
  const { Story } = defineMeta({ title: "Retro/PixelTooltip", component: PixelTooltip, tags: ["autodocs"] });
</script>

<Story name="Top">
  {#snippet children()}
    <div style="padding: 60px;">
      <PixelTooltip text="Tooltip on top" position="top">
        <button>Hover me</button>
      </PixelTooltip>
    </div>
  {/snippet}
</Story>

<Story name="AlwaysOpen">
  {#snippet children()}
    <div style="padding: 60px;">
      <PixelTooltip text="Always shown" position="bottom" open>
        <span>Target</span>
      </PixelTooltip>
    </div>
  {/snippet}
</Story>
