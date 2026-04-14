<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import WindowStatusBar from "./WindowStatusBar.svelte";
  const { Story } = defineMeta({ title: "Retro/WindowStatusBar", component: WindowStatusBar, tags: ["autodocs"] });
</script>

<Story name="Default" args={{ segments: ["Ready", "Ln 12, Col 4", "UTF-8", "CRLF"] }} />
<Story name="SingleSegment" args={{ segments: ["Terminal"] }} />
