<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import PixelToggle from "./PixelToggle.svelte";
  const { Story } = defineMeta({ title: "Retro/PixelToggle", component: PixelToggle, tags: ["autodocs"] });
</script>

<Story name="Off" args={{ label: "CRT scanlines" }} />
<Story name="On" args={{ label: "Sound", checked: true }} />
<Story name="Disabled" args={{ label: "Legacy mode", disabled: true }} />
