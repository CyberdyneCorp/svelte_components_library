<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import TVLSparkline from "./TVLSparkline.svelte";
  const { Story } = defineMeta({ title: "Retro/TVLSparkline", component: TVLSparkline, tags: ["autodocs"] });

  const up = Array.from({ length: 30 }, (_, i) => 100 + i * 3 + Math.sin(i) * 5);
  const down = Array.from({ length: 30 }, (_, i) => 100 - i * 1.5 + Math.cos(i) * 3);
</script>

<Story name="Up" args={{ values: up, showDelta: true }} />
<Story name="Down" args={{ values: down, showDelta: true }} />
<Story name="NoFill" args={{ values: up, fill: false }} />
