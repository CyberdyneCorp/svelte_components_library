<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import ConsoleDashboardDemo from "../lib/_testdata/ConsoleDashboardDemo.svelte";
  const { Story } = defineMeta({
    title: "Console/Dashboard",
    component: ConsoleDashboardDemo,
    parameters: { layout: "fullscreen", a11y: { test: "error" } },
  });
</script>

<Story
  name="Overview"
  play={async () => {
    // The page must not scroll sideways at the default viewport: wide tables
    // scroll inside their own labelled region, never the document.
    const root = document.documentElement;
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth);
  }}
/>
<Story name="Empty" args={{ screen: "empty" }} />
<Story name="Settings" args={{ screen: "settings" }} />
<Story name="Domains" args={{ screen: "domains" }} />
