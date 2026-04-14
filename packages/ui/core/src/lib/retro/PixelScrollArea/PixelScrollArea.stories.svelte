<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import PixelScrollArea from "./PixelScrollArea.svelte";
  const { Story } = defineMeta({ title: "Retro/PixelScrollArea", component: PixelScrollArea, tags: ["autodocs"] });
</script>

<Story name="Default">
  {#snippet children()}
    <PixelScrollArea maxHeight="180px" ariaLabel="Sample">
      {#each Array(30) as _, i (i)}
        <p style="margin: 6px 12px;">Line {i + 1}</p>
      {/each}
    </PixelScrollArea>
  {/snippet}
</Story>
