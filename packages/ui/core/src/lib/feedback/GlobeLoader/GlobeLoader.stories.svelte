<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import GlobeLoader from "./GlobeLoader.svelte";

  const { Story } = defineMeta({
    title: "Feedback/GlobeLoader",
    component: GlobeLoader,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Self-contained animated rotating globe with orbiting satellites — a striking loading / hero visual. Draws on a 2D canvas (no Cesium / WebGL), fetching a Natural Earth TopoJSON from a CDN on first mount and falling back to a graticule-only globe offline. Drag to spin.",
        },
      },
    },
  });
</script>

<Story name="Default">
  {#snippet template()}
    <div style="display: grid; place-items: center; padding: 2rem;">
      <GlobeLoader size={360} />
    </div>
  {/snippet}
</Story>

<Story name="NeonGreen">
  {#snippet template()}
    <div style="display: grid; place-items: center; padding: 2rem; background: #0a0a0f;">
      <GlobeLoader size={320} ink="#00ff41" background="#0a0a0f" />
    </div>
  {/snippet}
</Story>

<Story name="CyanNoGlow">
  {#snippet template()}
    <div style="display: grid; place-items: center; padding: 2rem; background: #0a0a0f;">
      <GlobeLoader size={280} ink="#00d4ff" background="#0a0a0f" glow={false} />
    </div>
  {/snippet}
</Story>
