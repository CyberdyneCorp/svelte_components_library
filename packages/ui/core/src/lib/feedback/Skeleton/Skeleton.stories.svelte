<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Skeleton from "./Skeleton.svelte";

  const { Story } = defineMeta({
    title: "Feedback/Skeleton",
    component: Skeleton,
    tags: ["autodocs"],
  });
</script>

<Story name="Text">
  <div style="max-width: 400px; padding: 1rem;">
    <Skeleton variant="text" />
  </div>
</Story>

<Story name="Circle">
  <div style="padding: 1rem; display: flex; gap: 1rem; align-items: center;">
    <Skeleton variant="circle" width="32px" />
    <Skeleton variant="circle" width="48px" />
    <Skeleton variant="circle" width="64px" />
  </div>
</Story>

<Story name="Card">
  <div style="padding: 1rem; max-width: 320px;">
    <Skeleton variant="card" />
  </div>
</Story>

<Story name="MultipleLines">
  <div style="max-width: 400px; padding: 1rem;">
    <Skeleton variant="text" lines={5} />
  </div>
</Story>
