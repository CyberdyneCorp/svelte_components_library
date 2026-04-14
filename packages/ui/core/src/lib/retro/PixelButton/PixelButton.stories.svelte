<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import PixelButton from "./PixelButton.svelte";
  const { Story } = defineMeta({ title: "Retro/PixelButton", component: PixelButton, tags: ["autodocs"] });
</script>

<Story name="Solid">
  {#snippet children()}<PixelButton>Start</PixelButton>{/snippet}
</Story>
<Story name="Neon">
  {#snippet children()}<PixelButton variant="neon">&gt; CONNECT WALLET</PixelButton>{/snippet}
</Story>
<Story name="Outline">
  {#snippet children()}<PixelButton variant="outline">Cancel</PixelButton>{/snippet}
</Story>
<Story name="Ghost">
  {#snippet children()}<PixelButton variant="ghost">Close</PixelButton>{/snippet}
</Story>
<Story name="Disabled">
  {#snippet children()}<PixelButton disabled>Pending</PixelButton>{/snippet}
</Story>
