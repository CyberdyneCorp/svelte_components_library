<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import PixelRadio from "./PixelRadio.svelte";
  const { Story } = defineMeta({ title: "Retro/PixelRadio", component: PixelRadio, tags: ["autodocs"] });
</script>

<Story name="Default" args={{
  name: "plan",
  legend: "Choose a plan",
  value: "pro",
  options: [
    { value: "basic", label: "Basic" },
    { value: "pro", label: "Pro" },
    { value: "enterprise", label: "Enterprise", disabled: true },
  ],
}} />
