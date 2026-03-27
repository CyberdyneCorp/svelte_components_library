<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ColorPicker from "./ColorPicker.svelte";

  const { Story } = defineMeta({
    title: "Forms/ColorPicker",
    component: ColorPicker,
    tags: ["autodocs"],
  });

  const customPresets = [
    "#ff0000", "#ff8800", "#ffff00", "#00ff00",
    "#0088ff", "#0000ff", "#8800ff", "#ff00ff",
  ];
</script>

<Story name="Default" args={{
  label: "Accent Color",
  value: "#00ff41",
}} />

<Story name="CustomPresets" args={{
  label: "Theme Color",
  value: "#ff8800",
  presets: customPresets,
}} />

<Story name="Disabled" args={{
  label: "Locked Color",
  value: "#00d4ff",
  disabled: true,
}} />
