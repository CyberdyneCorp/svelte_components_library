<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import OsmBuildingsLayer from "./OsmBuildingsLayer.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/OsmBuildingsLayer",
    component: OsmBuildingsLayer,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "OSM Buildings 3D tileset with optional per-OSM-id tinting. Pass a `featureColors` map keyed by OSM way id; buildings not in the map are muted using `defaultHex` / `defaultAlpha` so the highlighted ones stand out.",
        },
      },
    },
  });

  // A handful of NYC landmark OSM ids used to demonstrate the highlight API.
  // Real consumers will populate this from their domain data (e.g. risk
  // score → colour ramp).
  const nycHighlights = {
    "1": ["#ef4444", 0.85],
    "264768": ["#22c55e", 0.85],
    "264769": ["#f97316", 0.8],
  };
</script>

<Story name="Plain">
  {#snippet template()}
    <CesiumGlobe
      height="600px"
      initialCamera={{ lng: -74.0086, lat: 40.7128, heightM: 1500 }}
    >
      <OsmBuildingsLayer />
    </CesiumGlobe>
  {/snippet}
</Story>

<Story name="HighlightSelection">
  {#snippet template()}
    <CesiumGlobe
      height="600px"
      initialCamera={{ lng: -74.0086, lat: 40.7128, heightM: 1500 }}
    >
      <OsmBuildingsLayer
        featureColors={nycHighlights}
        defaultHex="#ffffff"
        defaultAlpha={0.25}
      />
    </CesiumGlobe>
  {/snippet}
</Story>
