<svelte:options runes={true} />

<script lang="ts">
  import { onDestroy } from "svelte";
  import { useCesiumViewer } from "../viewerContext.js";
  import { userPin } from "../glyphs.js";
  import type { LngLat, UserLocation } from "../types.js";

  type CustomDataSource = import("cesium").CustomDataSource;
  type Cesium3 = import("cesium").Cartesian3;

  type Props = {
    /**
     * The current user location, or `null` while not available. Pass the
     * lng/lat from your geolocation watcher; component handles the rest.
     */
    location: UserLocation | null;
    visible?: boolean;
    /** Uniform layer opacity 0–1, applied to the pin + accuracy ring alpha. */
    opacity?: number;
    color?: string;
    /** Show the horizontal accuracy ring around the location. */
    showAccuracy?: boolean;
  };

  let {
    location,
    visible = true,
    opacity = 1,
    color = "#00d4ff",
    showAccuracy = true,
  }: Props = $props();

  const alpha = $derived(Math.max(0, Math.min(1, opacity)));

  const getViewer = useCesiumViewer();
  let dataSource: CustomDataSource | null = null;
  let CesiumMod: typeof import("cesium") | null = null;

  $effect(() => {
    let cancelled = false;
    void (async () => {
      const viewer = getViewer();
      if (!viewer) return;
      const Cesium = (CesiumMod ??= await import("cesium"));
      if (cancelled || dataSource) return;
      dataSource = new Cesium.CustomDataSource("cy-cesium-user-location");
      await viewer.dataSources.add(dataSource);
      dataSource.show = visible;
      sync(Cesium);
    })();
    return () => {
      cancelled = true;
    };
  });

  $effect(() => {
    void location;
    void color;
    void showAccuracy;
    void alpha;
    if (!CesiumMod || !dataSource) return;
    sync(CesiumMod);
  });

  $effect(() => {
    if (dataSource) dataSource.show = visible;
  });

  function ringPoints(
    centre: LngLat,
    radiusM: number,
    segments = 64,
  ): LngLat[] {
    const R = 6_371_000;
    const lat0 = (centre.lat * Math.PI) / 180;
    const lng0 = (centre.lng * Math.PI) / 180;
    const ang = radiusM / R;
    const out: LngLat[] = [];
    for (let i = 0; i <= segments; i++) {
      const brg = (i / segments) * 2 * Math.PI;
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
      out.push({ lng: (lng * 180) / Math.PI, lat: (lat * 180) / Math.PI });
    }
    return out;
  }

  function sync(Cesium: typeof import("cesium")): void {
    if (!dataSource) return;
    dataSource.entities.removeAll();
    if (!location) return;

    const positions = (radiusM: number): Cesium3[] =>
      ringPoints(location!, radiusM).map((p) =>
        Cesium.Cartesian3.fromDegrees(p.lng, p.lat),
      );

    if (showAccuracy && location.accuracyM && location.accuracyM > 0) {
      dataSource.entities.add({
        id: "user-location-accuracy",
        polygon: {
          hierarchy: new Cesium.PolygonHierarchy(
            positions(location.accuracyM),
          ) as never,
          material: Cesium.Color.fromCssColorString(color).withAlpha(
            0.18 * alpha,
          ) as never,
          outline: true as never,
          outlineColor: Cesium.Color.fromCssColorString(color).withAlpha(
            0.45 * alpha,
          ) as never,
        },
      });
    }

    dataSource.entities.add({
      id: "user-location",
      position: Cesium.Cartesian3.fromDegrees(location.lng, location.lat),
      billboard: {
        image: userPin(color),
        width: 36,
        height: 36,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        color: Cesium.Color.WHITE.withAlpha(alpha),
      },
    });
  }

  onDestroy(() => {
    const viewer = getViewer();
    if (viewer && dataSource) viewer.dataSources.remove(dataSource, true);
    dataSource = null;
  });
</script>
