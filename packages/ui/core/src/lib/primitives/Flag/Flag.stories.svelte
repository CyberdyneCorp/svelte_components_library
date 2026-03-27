<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Flag from "./Flag.svelte";

  const { Story } = defineMeta({
    title: "Primitives/Flag",
    component: Flag,
    tags: ["autodocs"],
  });
</script>

<Story name="New" args={{ variant: "new" }} />

<Story name="Beta" args={{ variant: "beta" }} />

<Story name="Deprecated" args={{ variant: "deprecated" }} />

<Story name="Experimental" args={{ variant: "experimental" }} />

<Story name="AllVariants">
  <div style="display: flex; gap: 0.75rem; align-items: center;">
    <Flag variant="new" />
    <Flag variant="beta" />
    <Flag variant="deprecated" />
    <Flag variant="experimental" />
  </div>
</Story>

<Story name="SmallSize">
  <div style="display: flex; gap: 0.75rem; align-items: center;">
    <Flag variant="new" size="sm" />
    <Flag variant="beta" size="sm" />
    <Flag variant="deprecated" size="sm" />
    <Flag variant="experimental" size="sm" />
  </div>
</Story>
