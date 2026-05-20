<svelte:options runes={true} />

<script lang="ts">
  import { onDestroy } from "svelte";
  import { useCesiumViewer } from "../viewerContext.js";
  import { diffById } from "../reconcile.js";
  import type { ColorScale, Polygon, PolygonHeatmapEntry } from "../types.js";

  type CustomDataSource = import("cesium").CustomDataSource;
  type Cesium3 = import("cesium").Cartesian3;

  type Props = {
    polygons: Polygon[];
    /** Scalar value per polygon id, looked up against `colorScale`. */
    values: PolygonHeatmapEntry[];
    /** Ordered colour stops. Values between stops are linearly interpolated. */
    colorScale: ColorScale;
    visible?: boolean;
    /** Alpha applied to the looked-up colour. */
    opacity?: number;
    /** Colour to use for polygons with no entry in `values`. */
    fallbackColor?: string;
    fallbackOpacity?: number;
  };

  let {
    polygons,
    values,
    colorScale,
    visible = true,
    opacity = 0.6,
    fallbackColor = "#22222e",
    fallbackOpacity = 0.15,
  }: Props = $props();

  const getViewer = useCesiumViewer();
  let dataSource: CustomDataSource | null = null;
  let CesiumMod: typeof import("cesium") | null = null;
  let mounted: Polygon[] = [];
  let lookup: Map<string, number> = new Map();

  $effect(() => {
    let cancelled = false;
    void (async () => {
      const viewer = getViewer();
      if (!viewer) return;
      const Cesium = (CesiumMod ??= await import("cesium"));
      if (cancelled || dataSource) return;
      dataSource = new Cesium.CustomDataSource("cy-cesium-polygon-heatmap");
      await viewer.dataSources.add(dataSource);
      dataSource.show = visible;
      syncGeometry(Cesium);
      retint(Cesium);
    })();
    return () => {
      cancelled = true;
    };
  });

  $effect(() => {
    void polygons;
    if (!CesiumMod || !dataSource) return;
    syncGeometry(CesiumMod);
    retint(CesiumMod);
  });

  $effect(() => {
    void values;
    void colorScale;
    void opacity;
    void fallbackColor;
    void fallbackOpacity;
    if (!CesiumMod || !dataSource) return;
    retint(CesiumMod);
  });

  $effect(() => {
    if (dataSource) dataSource.show = visible;
  });

  function syncGeometry(Cesium: typeof import("cesium")): void {
    if (!dataSource) return;
    const { added, updated, removedIds } = diffById(mounted, polygons);
    for (const id of removedIds) {
      const e = dataSource.entities.getById(`heatmap:${id}`);
      if (e) dataSource.entities.remove(e);
    }
    for (const p of added) addEntity(Cesium, p);
    for (const p of updated) updateEntity(Cesium, p);
    mounted = polygons;
  }

  function positions(
    Cesium: typeof import("cesium"),
    p: Polygon,
  ): Cesium3[] {
    return p.vertices.map((v) => Cesium.Cartesian3.fromDegrees(v.lng, v.lat));
  }

  function addEntity(Cesium: typeof import("cesium"), p: Polygon): void {
    if (!dataSource) return;
    dataSource.entities.add({
      id: `heatmap:${p.id}`,
      polygon: {
        hierarchy: new Cesium.PolygonHierarchy(positions(Cesium, p)) as never,
        material: Cesium.Color.fromCssColorString(
          fallbackColor,
        ).withAlpha(fallbackOpacity) as never,
        outline: true as never,
        outlineColor: Cesium.Color.fromCssColorString(
          p.outlineColor ?? "#3a3a4a",
        ) as never,
      },
    });
  }

  function updateEntity(Cesium: typeof import("cesium"), p: Polygon): void {
    if (!dataSource) return;
    const entity = dataSource.entities.getById(`heatmap:${p.id}`);
    if (!entity) {
      addEntity(Cesium, p);
      return;
    }
    if (entity.polygon) {
      entity.polygon.hierarchy = new Cesium.PolygonHierarchy(
        positions(Cesium, p),
      ) as never;
    }
  }

  function retint(Cesium: typeof import("cesium")): void {
    if (!dataSource) return;
    lookup = new Map(values.map((v) => [v.id, v.value]));
    const fallback = Cesium.Color.fromCssColorString(fallbackColor).withAlpha(
      fallbackOpacity,
    );
    for (const p of polygons) {
      const entity = dataSource.entities.getById(`heatmap:${p.id}`);
      if (!entity?.polygon) continue;
      const value = lookup.get(p.id);
      if (typeof value !== "number") {
        entity.polygon.material = fallback as never;
        continue;
      }
      const [r, g, b] = sampleScale(colorScale, value);
      entity.polygon.material = Cesium.Color.fromBytes(
        r,
        g,
        b,
        Math.round(opacity * 255),
      ) as never;
    }
  }

  function sampleScale(
    scale: ColorScale,
    value: number,
  ): [number, number, number] {
    if (scale.length === 0) return [255, 255, 255];
    if (scale.length === 1) return hexToRgb(scale[0].color);
    const sorted = [...scale].sort((a, b) => a.value - b.value);
    if (value <= sorted[0].value) return hexToRgb(sorted[0].color);
    const last = sorted[sorted.length - 1];
    if (value >= last.value) return hexToRgb(last.color);
    for (let i = 1; i < sorted.length; i++) {
      const a = sorted[i - 1];
      const b = sorted[i];
      if (value <= b.value) {
        const t = (value - a.value) / (b.value - a.value);
        return lerpRgb(hexToRgb(a.color), hexToRgb(b.color), t);
      }
    }
    return hexToRgb(last.color);
  }

  function hexToRgb(hex: string): [number, number, number] {
    const s = hex.replace("#", "");
    const f =
      s.length === 3
        ? s
            .split("")
            .map((c) => c + c)
            .join("")
        : s;
    const r = parseInt(f.slice(0, 2), 16);
    const g = parseInt(f.slice(2, 4), 16);
    const b = parseInt(f.slice(4, 6), 16);
    return [r, g, b];
  }

  function lerpRgb(
    a: [number, number, number],
    b: [number, number, number],
    t: number,
  ): [number, number, number] {
    return [
      Math.round(a[0] + (b[0] - a[0]) * t),
      Math.round(a[1] + (b[1] - a[1]) * t),
      Math.round(a[2] + (b[2] - a[2]) * t),
    ];
  }

  onDestroy(() => {
    const viewer = getViewer();
    if (viewer && dataSource) viewer.dataSources.remove(dataSource, true);
    dataSource = null;
    mounted = [];
    lookup = new Map();
  });
</script>
