<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import DesktopGrid from "./DesktopGrid.svelte";
  import DesktopIcon from "../DesktopIcon/DesktopIcon.svelte";

  const { Story } = defineMeta({
    title: "Retro/DesktopGrid",
    component: DesktopGrid,
    tags: ["autodocs"],
  });
</script>

<Story name="Default">
  {#snippet children()}
    <DesktopGrid columns={2}>
      <DesktopIcon label="Investments" icon="🪙" />
      <DesktopIcon label="Services" icon="🤖" />
      <DesktopIcon label="Contact Us" icon="💌" />
      <DesktopIcon label="Learn" icon="📚" />
      <DesktopIcon label="DAO" icon="📦" />
      <DesktopIcon label="Products" icon="🛍️" />
    </DesktopGrid>
  {/snippet}
</Story>

<Story name="Right">
  {#snippet children()}
    <DesktopGrid columns={1} side="right">
      <DesktopIcon label="Your Bag" icon="🛍️" badge={3} />
    </DesktopGrid>
  {/snippet}
</Story>
