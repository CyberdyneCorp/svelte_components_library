<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Slider from "./Slider.svelte";

  const { Story } = defineMeta({
    title: "ML/Slider",
    component: Slider,
    tags: ["autodocs"],
  });
</script>

<Story name="Default">
  <div style="width: 320px;">
    <Slider value={50} />
  </div>
</Story>

<Story name="WithLabel">
  <div style="width: 320px; display: flex; flex-direction: column; gap: 1.5rem;">
    <Slider label="Learning Rate" value={70} min={0} max={100} step={1} unit="%" />
    <Slider label="Batch Size" value={32} min={1} max={128} step={1} />
    <Slider label="Temperature" value={0.7} min={0} max={2} step={0.1} />
  </div>
</Story>

<Story name="Range">
  <div style="width: 320px;">
    <Slider label="Epochs" value={50} min={1} max={500} step={10} unit=" epochs" />
  </div>
</Story>

<Story name="Disabled">
  <div style="width: 320px;">
    <Slider label="Locked Parameter" value={42} disabled />
  </div>
</Story>
