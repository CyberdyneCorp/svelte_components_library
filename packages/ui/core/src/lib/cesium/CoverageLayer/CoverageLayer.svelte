<svelte:options runes={true} />

<script lang="ts">
  import { onDestroy } from "svelte";
  import { useCesiumViewer } from "../viewerContext.js";
  import { diffById } from "../reconcile.js";
  import type { CoverageCone, LngLat } from "../types.js";

  type CustomDataSource = import("cesium").CustomDataSource;
  type Cesium3 = import("cesium").Cartesian3;

  type Props = {
    coverages: CoverageCone[];
    visible?: boolean;
    /** Hex fill colour fallback when entry.color is unset. */
    defaultColor?: string;
    /** Fill alpha 0..1. */
    fillOpacity?: number;
  };

  let {
    coverages,
    visible = true,
    defaultColor = "#00d4ff",
    fillOpacity = 0.2,
  }: Props = $props();

  const getViewer = useCesiumViewer();
  let dataSource: CustomDataSource | null = null;
  let CesiumMod: typeof import("cesium") | null = null;
  let mounted: CoverageCone[] = [];

  $effect(() => {
    let cancelled = false;
    void (async () => {
      const viewer = getViewer();
      if (!viewer) return;
      const Cesium = (CesiumMod ??= await import("cesium"));
      if (cancelled || dataSource) return;
      dataSource = new Cesium.CustomDataSource("cy-cesium-coverage");
      await viewer.dataSources.add(dataSource);
      dataSource.show = visible;
      sync(Cesium);
    })();
    return () => {
      cancelled = true;
    };
  });

  $effect(() => {
    void coverages;
    void defaultColor;
    void fillOpacity;
    if (!CesiumMod || !dataSource) return;
    sync(CesiumMod);
  });

  $effect(() => {
    if (dataSource) dataSource.show = visible;
  });

  function ringPoints(c: CoverageCone): LngLat[] {
    const R = 6_371_000;
    const lat0 = (c.lat * Math.PI) / 180;
    const lng0 = (c.lng * Math.PI) / 180;
    const ang = c.rangeM / R;
    const halfBeam = (c.halfBeamWidthDeg ?? 180) * (Math.PI / 180);
    const bearing0 = ((c.bearingDeg ?? 0) * Math.PI) / 180;
    const startBearing = bearing0 - halfBeam;
    const endBearing = bearing0 + halfBeam;
    const arcSegments = 32;
    const points: LngLat[] = [];

    // Apex of the cone — only included for sub-omni cones so the polygon
    // forms a wedge. Full 360° coverage is rendered as a closed ring.
    if (halfBeam < Math.PI) {
      points.push({ lng: c.lng, lat: c.lat });
    }

    for (let i = 0; i <= arcSegments; i++) {
      const t = i / arcSegments;
      const brg = startBearing + (endBearing - startBearing) * t;
      const sinLat0 = Math.sin(lat0);
      const cosLat0 = Math.cos(lat0);
      const sinAng = Math.sin(ang);
      const cosAng = Math.cos(ang);
      const sinLat = sinLat0 * cosAng + cosLat0 * sinAng * Math.cos(brg);
      const lat = Math.asin(sinLat);
      const lng =
        lng0 +
        Math.atan2(
          Math.sin(brg) * sinAng * cosLat0,
          cosAng - sinLat0 * sinLat,
        );
      points.push({ lng: (lng * 180) / Math.PI, lat: (lat * 180) / Math.PI });
    }
    return points;
  }

  function positions(
    Cesium: typeof import("cesium"),
    c: CoverageCone,
  ): Cesium3[] {
    return ringPoints(c).map((p) =>
      typeof c.altitudeM === "number"
        ? Cesium.Cartesian3.fromDegrees(p.lng, p.lat, c.altitudeM)
        : Cesium.Cartesian3.fromDegrees(p.lng, p.lat),
    );
  }

  function sync(Cesium: typeof import("cesium")): void {
    if (!dataSource) return;
    const { added, updated, removedIds } = diffById(mounted, coverages);
    for (const id of removedIds) {
      const e = dataSource.entities.getById(`coverage:${id}`);
      if (e) dataSource.entities.remove(e);
    }
    for (const c of added) addEntity(Cesium, c);
    for (const c of updated) updateEntity(Cesium, c);
    mounted = coverages;
  }

  function addEntity(Cesium: typeof import("cesium"), c: CoverageCone): void {
    if (!dataSource) return;
    const color = Cesium.Color.fromCssColorString(c.color ?? defaultColor);
    dataSource.entities.add({
      id: `coverage:${c.id}`,
      polygon: {
        hierarchy: new Cesium.PolygonHierarchy(positions(Cesium, c)) as never,
        material: color.withAlpha(fillOpacity) as never,
        outline: true as never,
        outlineColor: color.withAlpha(0.6) as never,
      },
    });
  }

  function updateEntity(Cesium: typeof import("cesium"), c: CoverageCone): void {
    if (!dataSource) return;
    const entity = dataSource.entities.getById(`coverage:${c.id}`);
    if (!entity?.polygon) {
      addEntity(Cesium, c);
      return;
    }
    const color = Cesium.Color.fromCssColorString(c.color ?? defaultColor);
    entity.polygon.hierarchy = new Cesium.PolygonHierarchy(
      positions(Cesium, c),
    ) as never;
    entity.polygon.material = color.withAlpha(fillOpacity) as never;
  }

  onDestroy(() => {
    const viewer = getViewer();
    if (viewer && dataSource) viewer.dataSources.remove(dataSource, true);
    dataSource = null;
    mounted = [];
  });
</script>
