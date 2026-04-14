<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import CRTBackground from "./CRTBackground.svelte";
  const { Story } = defineMeta({ title: "Retro/CRTBackground", component: CRTBackground, tags: ["autodocs"] });
</script>

<Story name="Default" args={{ color: "#3b3be0", fullScreen: false }} />
<Story name="WithScanlines" args={{ color: "#3b3be0", fullScreen: false, showScanlines: true }} />
<Story name="NoGrid" args={{ showGrid: false, fullScreen: false, color: "#000" }} />
