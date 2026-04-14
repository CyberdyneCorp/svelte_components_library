<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import PixelCheckbox from "./PixelCheckbox.svelte";
  const { Story } = defineMeta({ title: "Retro/PixelCheckbox", component: PixelCheckbox, tags: ["autodocs"] });
</script>

<Story name="Default" args={{ label: "Accept Terms" }} />
<Story name="Checked" args={{ label: "Subscribed", checked: true }} />
<Story name="Disabled" args={{ label: "Read-only", disabled: true, checked: true }} />
