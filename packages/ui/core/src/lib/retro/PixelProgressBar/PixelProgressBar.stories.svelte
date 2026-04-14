<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import PixelProgressBar from "./PixelProgressBar.svelte";
  const { Story } = defineMeta({ title: "Retro/PixelProgressBar", component: PixelProgressBar, tags: ["autodocs"] });
</script>

<Story name="Default" args={{ value: 60, max: 100, segments: 10, showLabel: true }} />
<Story name="Warning" args={{ value: 80, variant: "warning", showLabel: true }} />
<Story name="Fine" args={{ value: 35, segments: 20, showLabel: true }} />
