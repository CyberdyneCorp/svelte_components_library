<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ChipButton from "./ChipButton.svelte";

  const { Story } = defineMeta({
    title: "Primitives/ChipButton",
    component: ChipButton,
    tags: ["autodocs"],
  });
</script>

<Story name="Default">
  <div style="display: flex; gap: 0.5rem;">
    <ChipButton>Bitcoin</ChipButton>
    <ChipButton>Ethereum</ChipButton>
    <ChipButton>Solana</ChipButton>
  </div>
</Story>

<Story name="Selected">
  <div style="display: flex; gap: 0.5rem;">
    <ChipButton selected>Neural Net</ChipButton>
    <ChipButton>Transformer</ChipButton>
    <ChipButton selected>Diffusion</ChipButton>
    <ChipButton>GAN</ChipButton>
  </div>
</Story>

<Story name="Disabled">
  <div style="display: flex; gap: 0.5rem;">
    <ChipButton disabled>Locked</ChipButton>
    <ChipButton selected disabled>Active Lock</ChipButton>
  </div>
</Story>
