<svelte:options runes={true} />

<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { useCesiumViewer } from "../viewerContext.js";
  import { createTerrainSampler } from "../sampler.js";
  import type { WindSimDomain } from "../types.js";

  type CustomDataSource = import("cesium").CustomDataSource;

  type Props = {
    /** Domain to preview. Pass `null` to hide. */
    domain: WindSimDomain | null;
    /** Sample terrain at the centre so the box sits on the ground (default true). */
    clampToTerrain?: boolean;
  };

  let { domain, clampToTerrain = true }: Props = $props();

  const getViewer = useCesiumViewer();
  let collection: CustomDataSource | null = null;
  let CesiumMod: typeof import("cesium") | null = null;

  onMount(async () => {
    const viewer = getViewer();
    if (!viewer) return;
    const Cesium = (CesiumMod ??= await import("cesium"));
    collection = new Cesium.CustomDataSource("cy-cesium-windsim-domain");
    await viewer.dataSources.add(collection);
    rebuild();
  });

  $effect(() => {
    void domain;
    void clampToTerrain;
    if (!CesiumMod || !collection) return;
    void rebuild();
  });

  async function rebuild(): Promise<void> {
    if (!CesiumMod || !collection) return;
    const Cesium = CesiumMod;
    collection.entities.removeAll();
    if (!domain) return;

    const viewer = getViewer();
    if (!viewer) return;

    const isRunning = domain.state === "running";
    const accent = isRunning ? "#f59e0b" : "#22c55e";
    const fillAlpha = isRunning ? 0.22 : 0.18;
    const outlineAlpha = isRunning ? 1 : 0.9;
    const verticalFillAlpha = isRunning ? 0.09 : 0.06;
    const verticalOutlineAlpha = isRunning ? 0.7 : 0.5;
    const labelBg = isRunning ? "#451a03" : "#022c22";
    const labelFg = isRunning ? "#fde68a" : "#a7f3d0";
    const labelText =
      domain.label ??
      `${domain.sizeM.toFixed(0)} m${isRunning ? " · solving…" : ""}`;

    const groundZ = clampToTerrain
      ? ((await createTerrainSampler(viewer).sampleElevation(domain.centre)) ?? 0)
      : 0;

    const half = domain.sizeM / 2;
    const dLat = half / 111_320;
    const dLng = half / (111_320 * Math.cos((domain.centre.lat * Math.PI) / 180));
    const west = domain.centre.lng - dLng;
    const east = domain.centre.lng + dLng;
    const south = domain.centre.lat - dLat;
    const north = domain.centre.lat + dLat;
    const heightM = domain.heightM ?? 80;

    // Ground footprint — clamps to terrain via classificationType, so we
    // don't pass an absolute height for this one.
    collection.entities.add({
      rectangle: {
        coordinates: Cesium.Rectangle.fromDegrees(west, south, east, north),
        material: Cesium.Color.fromCssColorString(accent).withAlpha(
          fillAlpha,
        ) as never,
        outline: true as never,
        outlineColor: Cesium.Color.fromCssColorString(accent).withAlpha(
          outlineAlpha,
        ) as never,
        outlineWidth: 2 as never,
        classificationType: Cesium.ClassificationType.TERRAIN as never,
      },
    });

    // Translucent extruded box — base at groundZ, top at groundZ + heightM.
    collection.entities.add({
      rectangle: {
        coordinates: Cesium.Rectangle.fromDegrees(west, south, east, north),
        material: Cesium.Color.fromCssColorString(accent).withAlpha(
          verticalFillAlpha,
        ) as never,
        height: groundZ as never,
        extrudedHeight: (groundZ + heightM) as never,
        outline: true as never,
        outlineColor: Cesium.Color.fromCssColorString(accent).withAlpha(
          verticalOutlineAlpha,
        ) as never,
        outlineWidth: 1 as never,
      },
    });

    // Wind direction arrow at mid-height.
    const theta = (domain.windDirectionDeg * Math.PI) / 180;
    const flowX = -Math.sin(theta);
    const flowY = -Math.cos(theta);
    const tailLng = domain.centre.lng - flowX * dLng * 1.1;
    const tailLat = domain.centre.lat - flowY * dLat * 1.1;
    const headLng = domain.centre.lng + flowX * dLng * 0.7;
    const headLat = domain.centre.lat + flowY * dLat * 0.7;
    collection.entities.add({
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights([
          tailLng,
          tailLat,
          groundZ + heightM * 0.4,
          headLng,
          headLat,
          groundZ + heightM * 0.4,
        ]) as never,
        width: 14 as never,
        material: new Cesium.PolylineArrowMaterialProperty(
          Cesium.Color.fromCssColorString("#fbbf24"),
        ) as never,
        arcType: Cesium.ArcType.GEODESIC as never,
      },
    });

    collection.entities.add({
      position: Cesium.Cartesian3.fromDegrees(
        domain.centre.lng,
        north,
        groundZ + 5,
      ),
      label: {
        text: labelText,
        font: "11px JetBrains Mono, monospace",
        fillColor: Cesium.Color.fromCssColorString(labelFg),
        showBackground: true,
        backgroundColor: Cesium.Color.fromCssColorString(labelBg).withAlpha(
          0.85,
        ),
        backgroundPadding: new Cesium.Cartesian2(6, 3),
        pixelOffset: new Cesium.Cartesian2(0, -12),
        scaleByDistance: new Cesium.NearFarScalar(1e2, 1, 5e4, 0),
        translucencyByDistance: new Cesium.NearFarScalar(1e2, 1, 5e4, 0),
      },
    });
  }

  onDestroy(() => {
    const viewer = getViewer();
    if (viewer && collection) viewer.dataSources.remove(collection, true);
    collection = null;
  });
</script>
