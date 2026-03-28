<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ModalBackdrop from "./ModalBackdrop.svelte";

  const { Story } = defineMeta({
    title: "Overlay/ModalBackdrop",
    component: ModalBackdrop,
    tags: ["autodocs"],
  });
</script>

<Story name="Open">
  <div style="position: relative; height: 200px; overflow: hidden;">
    <p style="color: var(--color-text-secondary);">Content behind the backdrop</p>
    <ModalBackdrop open onclick={() => console.log("backdrop clicked")} />
  </div>
</Story>

<Story name="NoBlur">
  <div style="position: relative; height: 200px; overflow: hidden;">
    <p style="color: var(--color-text-secondary);">Content behind the backdrop (no blur)</p>
    <ModalBackdrop open blur={false} onclick={() => console.log("clicked")} />
  </div>
</Story>
