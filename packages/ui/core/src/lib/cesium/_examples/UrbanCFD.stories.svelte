<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Cesium/Examples/UrbanCFD",
    tags: ["autodocs"],
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Reproduces the geo_dashboard CFD-over-buildings scene: OSM Buildings tinted by stress level + a swarm of coloured streamlines through the domain + per-building pressure dots + numeric labels. Everything is fed from this story's `$state` — the library is headless.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";
  import OsmBuildingsLayer from "../OsmBuildingsLayer/OsmBuildingsLayer.svelte";
  import StreamlinesLayer from "../StreamlinesLayer/StreamlinesLayer.svelte";
  import MarkersLayer from "../MarkersLayer/MarkersLayer.svelte";
  import LabelsLayer from "../LabelsLayer/LabelsLayer.svelte";
  import WindSimDomainPreview from "../WindSimDomainPreview/WindSimDomainPreview.svelte";
  import type { WindSimDomain } from "../types.js";

  // Domain centre — pick a dense Manhattan block so OSM Buildings has volume.
  const CENTER = { lng: -73.987, lat: 40.748 };

  // Synthetic stress data: a few "buildings" with id + pressure (Pa).
  type Stress = { id: string; lng: number; lat: number; pa: number; sf: string };
  const stress: Stress[] = [
    { id: "b1", lng: -73.9880, lat: 40.7485, pa: 75, sf: "138175.30" },
    { id: "b2", lng: -73.9870, lat: 40.7488, pa: 75, sf: "163703.30" },
    { id: "b3", lng: -73.9863, lat: 40.7482, pa: 68, sf: "676980.65" },
    { id: "b4", lng: -73.9876, lat: 40.7478, pa: 58, sf: "126188.29" },
    { id: "b5", lng: -73.9869, lat: 40.7472, pa: 55, sf: "76066.92" },
    { id: "b6", lng: -73.9854, lat: 40.7470, pa: 58, sf: "289796.29" },
  ];

  function pressureColor(pa: number): string {
    if (pa >= 70) return "#ef4444"; // red
    if (pa >= 60) return "#f97316"; // orange
    if (pa >= 50) return "#facc15"; // yellow
    return "#22c55e"; // green
  }

  // featureColors: in a real app, key by real OSM way ids (see
  // OsmBuildingsLayer docs). The synthetic ids below won't match real
  // tileset features — the consequence is that *every* building falls back
  // to defaultHex/defaultAlpha (the green wash in the screenshot). That is
  // the intended demo look here.
  const featureColors: Record<string, [string, number]> = Object.fromEntries(
    stress.map((s) => [s.id, [pressureColor(s.pa), 0.85] as [string, number]]),
  );

  // Pressure dots — colour matches the band.
  const dots = stress.map((s) => ({
    id: `dot-${s.id}`,
    lng: s.lng,
    lat: s.lat,
    color: pressureColor(s.pa),
    size: 22,
    altitudeM: 120,
  }));

  // Labels — "LOW · SF 138175.30" + "75 Pa".
  const labels = stress.flatMap((s) => [
    {
      id: `pa-${s.id}`,
      lng: s.lng,
      lat: s.lat,
      altitudeM: 180,
      text: `${s.pa} Pa`,
      color: "#fde68a",
      backgroundColor: "#451a03",
      fontPx: 12,
    },
    {
      id: `sf-${s.id}`,
      lng: s.lng,
      lat: s.lat,
      altitudeM: 80,
      text: `${s.pa < 60 ? "LOW" : "HIGH"} · SF ${s.sf}`,
      color: "#cbd5f5",
      backgroundColor: "#0f172a",
      fontPx: 11,
    },
  ]);

  // Synthetic streamlines — 12 lines deflecting around the domain.
  function buildStreamlines() {
    const lines = [];
    const groundZ = 80;
    for (let i = 0; i < 14; i++) {
      const t = i / 14;
      const points: [number, number, number][] = [];
      const values: number[] = [];
      // Start upwind, curl through the domain, exit downwind.
      for (let s = 0; s <= 40; s++) {
        const u = s / 40;
        const lng = CENTER.lng - 0.003 + u * 0.006;
        const wobble = Math.sin(u * Math.PI * 1.4 + i * 0.4) * 0.0008;
        const lat = CENTER.lat - 0.001 + (t - 0.5) * 0.003 + wobble;
        const alt = groundZ + 5 + Math.sin(u * Math.PI) * 30;
        points.push([lng, lat, alt]);
        // Speed peaks mid-domain — drives the warm colours in the ramp.
        values.push(2 + Math.sin(u * Math.PI) * 22);
      }
      lines.push({ id: `s${i}`, points, values });
    }
    return lines;
  }

  const streamlines = buildStreamlines();

  const domain: WindSimDomain = {
    centre: CENTER,
    sizeM: 220,
    windDirectionDeg: 240,
    heightM: 120,
    state: "editing",
  };
</script>

<Story name="StressOverBuildings">
  {#snippet template()}
    <div class="urban-cfd">
      <CesiumGlobe
        height="100vh"
        defaultBaseLayer="esri-world"
        initialCamera={{ lng: CENTER.lng - 0.001, lat: CENTER.lat - 0.001, heightM: 600 }}
      >
        <OsmBuildingsLayer
          featureColors={featureColors}
          defaultHex="#16a34a"
          defaultAlpha={0.45}
        />
        <WindSimDomainPreview domain={domain} />
        <StreamlinesLayer streamlines={streamlines} width={3} />
        <MarkersLayer markers={dots} />
        <LabelsLayer labels={labels} />
      </CesiumGlobe>
    </div>
  {/snippet}
</Story>
