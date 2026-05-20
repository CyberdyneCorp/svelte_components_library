<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ElevationProfile from "./ElevationProfile.svelte";

  const { Story } = defineMeta({
    title: "Charts/ElevationProfile",
    component: ElevationProfile,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Distance-vs-elevation cross-section with terrain fill, direct line-of-sight, and an optional first-Fresnel-zone overlay for point-to-point RF link planning. Pairs naturally with the Cesium `createTerrainSampler` utility (sample a path → feed the samples here).",
        },
      },
    },
  });

  // Synthetic ridge between two points, ~12 km apart.
  function buildProfile(n = 80) {
    const out = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const distanceM = t * 12_000;
      const ridge = Math.sin(t * Math.PI) * 380;
      const bumps = Math.sin(t * Math.PI * 7) * 40 + Math.sin(t * Math.PI * 13) * 18;
      const elevationM = 220 + ridge + bumps;
      out.push({ distanceM, elevationM });
    }
    return out;
  }
  const samples = buildProfile();
</script>

<Story name="TerrainProfile">
  {#snippet template()}
    <div style="max-width: 760px;">
      <ElevationProfile
        samples={samples}
        from={{ label: "Tower A", color: "#00ff41" }}
        to={{ label: "Tower B", color: "#00d4ff" }}
      />
    </div>
  {/snippet}
</Story>

<Story name="WithFresnelZone">
  {#snippet template()}
    <div style="max-width: 760px;">
      <ElevationProfile
        samples={samples}
        from={{ label: "TX", color: "#00ff41" }}
        to={{ label: "RX", color: "#00d4ff" }}
        fresnel={{ freqMhz: 5800, heightFromM: 30, heightToM: 25 }}
      />
    </div>
  {/snippet}
</Story>

<Story name="NoStatsCompact">
  {#snippet template()}
    <div style="max-width: 520px;">
      <ElevationProfile samples={samples} showStats={false} height={160} />
    </div>
  {/snippet}
</Story>
