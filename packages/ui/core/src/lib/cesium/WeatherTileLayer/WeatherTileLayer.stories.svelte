<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import WeatherTileLayer from "./WeatherTileLayer.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/WeatherTileLayer",
    component: WeatherTileLayer,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Time-animated raster overlay. Cycles through `frames` by passing each value into `urlTemplate`, crossfading between adjacent frames for a smooth playback. Use for radar / satellite loops, GIBS time series, or any timestamped tile pyramid.",
        },
      },
    },
  });

  // Synthetic four-frame demo built from a free debug tile server. Real
  // consumers pass weather provider URLs (RainViewer, Tomorrow.io, NASA GIBS
  // sub-daily timestamps, etc.) — this just proves the playback machinery.
  const colors = ["00ff41", "00d4ff", "a855f7", "ffb800"];
  const frames = colors.map((c) => `https://placehold.co/256x256/${c}/000.png`);

  function urlTemplate(frame) {
    // The placeholder service ignores {z}/{y}/{x}; we still include them
    // because Cesium's UrlTemplateImageryProvider expects to substitute them.
    return `${frame}?z={z}&y={y}&x={x}`;
  }
</script>

<Story name="ColourLoop">
  {#snippet template()}
    <CesiumGlobe height="600px">
      <WeatherTileLayer
        frames={frames}
        urlTemplate={urlTemplate}
        playing={true}
        intervalMs={1500}
        crossfadeMs={400}
        alpha={0.6}
      />
    </CesiumGlobe>
  {/snippet}
</Story>

<Story name="StaticFirstFrame">
  {#snippet template()}
    <CesiumGlobe height="600px">
      <WeatherTileLayer
        frames={frames}
        urlTemplate={urlTemplate}
        playing={false}
        currentFrame={0}
        alpha={0.5}
      />
    </CesiumGlobe>
  {/snippet}
</Story>
