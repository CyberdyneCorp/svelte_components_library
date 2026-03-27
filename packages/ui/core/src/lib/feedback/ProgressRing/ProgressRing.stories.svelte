<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ProgressRing from "./ProgressRing.svelte";

  const { Story } = defineMeta({
    title: "Feedback/ProgressRing",
    component: ProgressRing,
    tags: ["autodocs"],
  });
</script>

<Story name="Default">
  <ProgressRing value={25} />
</Story>

<Story name="HalfProgress">
  <ProgressRing value={50} size={100} strokeWidth={8} />
</Story>

<Story name="Complete">
  <ProgressRing value={100} />
</Story>

<Story name="AllVariants">
  <div style="display: flex; gap: 24px; align-items: flex-start;">
    <ProgressRing value={75} variant="brand" />
    <ProgressRing value={60} variant="info" />
    <ProgressRing value={45} variant="warning" />
    <ProgressRing value={30} variant="error" />
  </div>
</Story>

<Story name="WithLabel">
  <div style="display: flex; gap: 32px; align-items: flex-start;">
    <ProgressRing value={82} label="CPU Usage" variant="brand" />
    <ProgressRing value={64} label="Memory" variant="info" size={100} strokeWidth={8} />
    <ProgressRing value={91} label="Disk I/O" variant="warning" />
  </div>
</Story>
