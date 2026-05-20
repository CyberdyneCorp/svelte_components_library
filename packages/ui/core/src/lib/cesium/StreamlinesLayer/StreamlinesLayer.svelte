<svelte:options runes={true} />

<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { useCesiumViewer } from "../viewerContext.js";
  import type { ColorScale, Streamline } from "../types.js";

  type CustomDataSource = import("cesium").CustomDataSource;

  type Props = {
    streamlines: Streamline[];
    visible?: boolean;
    /** Layer-wide opacity multiplier. */
    opacity?: number;
    /** Polyline width in pixels. */
    width?: number;
    /** Five-stop default ramp (blue → cyan → green → yellow → red) if `colorScale` omitted. */
    colorScale?: ColorScale;
    /** Max value used to normalise per-vertex colours. */
    maxValue?: number;
    /** Vertical offset (m) added to every point — useful when streamlines come out of a CFD case in case-local coords. */
    groundOffsetM?: number;
  };

  let {
    streamlines,
    visible = true,
    opacity = 1,
    width = 2.5,
    colorScale,
    maxValue,
    groundOffsetM = 0,
  }: Props = $props();

  const getViewer = useCesiumViewer();
  let collection: CustomDataSource | null = null;
  let CesiumMod: typeof import("cesium") | null = null;

  const DEFAULT_SCALE: ColorScale = [
    { value: 0.0, color: "#296bfa" },
    { value: 0.25, color: "#00d8f2" },
    { value: 0.5, color: "#2ee863" },
    { value: 0.75, color: "#fdc62b" },
    { value: 1.0, color: "#ea3636" },
  ];

  // Most expressive single number that drives a redraw: the count + the
  // values' max. Capturing them lets `$effect` know when to rebuild.
  const computedMax = $derived.by(() => {
    if (typeof maxValue === "number") return maxValue;
    let m = 0;
    for (const s of streamlines) for (const v of s.values) if (v > m) m = v;
    return m || 1;
  });

  onMount(async () => {
    const viewer = getViewer();
    if (!viewer) return;
    const Cesium = (CesiumMod ??= await import("cesium"));
    collection = new Cesium.CustomDataSource("cy-cesium-streamlines");
    await viewer.dataSources.add(collection);
    collection.show = visible;
    rebuild();
  });

  $effect(() => {
    void streamlines;
    void colorScale;
    void width;
    void groundOffsetM;
    void computedMax;
    void opacity;
    if (!CesiumMod || !collection) return;
    rebuild();
  });

  $effect(() => {
    if (collection) collection.show = visible;
  });

  function rebuild(): void {
    if (!CesiumMod || !collection) return;
    const Cesium = CesiumMod;
    collection.entities.removeAll();
    if (streamlines.length === 0) return;

    const scale = colorScale ?? DEFAULT_SCALE;
    const maxV = computedMax;
    for (const s of streamlines) {
      for (let j = 0; j + 1 < s.points.length; j++) {
        const a = s.points[j];
        const b = s.points[j + 1];
        const va = s.values[j] ?? 0;
        const vb = s.values[j + 1] ?? va;
        const mid = (va + vb) / 2;
        const [r, g, bl, alpha] = sampleScale(scale, mid, maxV);
        collection.entities.add({
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights([
              a[0],
              a[1],
              (a[2] ?? 0) + groundOffsetM,
              b[0],
              b[1],
              (b[2] ?? 0) + groundOffsetM,
            ]) as never,
            width: width as never,
            material: new Cesium.Color(r, g, bl, alpha * opacity) as never,
            arcType: Cesium.ArcType.GEODESIC as never,
          },
        });
      }
    }
  }

  function sampleScale(
    scale: ColorScale,
    value: number,
    maxV: number,
  ): [number, number, number, number] {
    const t = maxV > 0 ? Math.max(0, Math.min(1, value / maxV)) : 0;
    const sorted = [...scale].sort((a, b) => a.value - b.value);
    if (t <= sorted[0].value) return [...hexFloat(sorted[0].color), 0.95];
    const last = sorted[sorted.length - 1];
    if (t >= last.value) return [...hexFloat(last.color), 0.95];
    for (let i = 0; i < sorted.length - 1; i++) {
      const s0 = sorted[i];
      const s1 = sorted[i + 1];
      if (t <= s1.value) {
        const k = (t - s0.value) / (s1.value - s0.value);
        const c0 = hexFloat(s0.color);
        const c1 = hexFloat(s1.color);
        return [
          c0[0] + (c1[0] - c0[0]) * k,
          c0[1] + (c1[1] - c0[1]) * k,
          c0[2] + (c1[2] - c0[2]) * k,
          0.95,
        ];
      }
    }
    return [...hexFloat(last.color), 0.95];
  }

  function hexFloat(hex: string): [number, number, number] {
    const s = hex.replace("#", "");
    const f = s.length === 3 ? s.split("").map((c) => c + c).join("") : s;
    return [
      parseInt(f.slice(0, 2), 16) / 255,
      parseInt(f.slice(2, 4), 16) / 255,
      parseInt(f.slice(4, 6), 16) / 255,
    ];
  }

  onDestroy(() => {
    const viewer = getViewer();
    if (viewer && collection) viewer.dataSources.remove(collection, true);
    collection = null;
  });
</script>
