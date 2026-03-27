<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Skeleton from "./Skeleton.svelte";

  const { Story } = defineMeta({
    title: "Feedback/Skeleton",
    component: Skeleton,
    tags: ["autodocs"],
  });
</script>

<Story name="Text" args={{ variant: "text" }} />

<Story name="Circle">
  <div style="padding: 1rem; display: flex; gap: 1rem; align-items: center;">
    <Skeleton variant="circle" width="32px" />
    <Skeleton variant="circle" width="48px" />
    <Skeleton variant="circle" width="64px" />
  </div>
</Story>

<Story name="Card" args={{ variant: "card" }} />

<Story name="MultipleLines" args={{ variant: "text", lines: 5 }} />
